'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import ChatInterface from '../ChatInterface';
import { TripRightPanel } from '../itinerary/TripRightPanel';
import ExplorePage from '../../ExplorePage';
import { Itinerary } from '@/app/types/itinerary';
import { processMessage, hasItineraryData } from '@/app/utils/messageProcessor';

interface ChatWithMapProps {
  initialMessage?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWithMap({ initialMessage }: ChatWithMapProps) {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [triggerMessage, setTriggerMessage] = useState<string | null>(null);
  const lastProcessedContent = useRef('');

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage &&
      lastMessage.role === 'assistant' &&
      lastMessage.content !== lastProcessedContent.current &&
      hasItineraryData(lastMessage.content)
    ) {
      lastProcessedContent.current = lastMessage.content;
      const processed = processMessage(lastMessage.content);
      
      if (processed.hasItinerary && processed.itinerary) {
        // Geocode locations asynchronously
        geocodeItineraryLocations(processed.itinerary).then(geocodedItinerary => {
          setItinerary(geocodedItinerary);
          setShowMap(true);
        });
      }
    }
  }, [messages]);

  const geocodeItineraryLocations = async (itinerary: Itinerary): Promise<Itinerary> => {
    const { geocodeLocation } = await import('./geocoding');
    
    // Geocode main locations - only geocode if coordinates are invalid (0, 0)
    const updatedLocations = await Promise.all(
      itinerary.locations.map(async (loc) => {
        // If coordinates are already set and valid, use them
        if (loc.coordinates && loc.coordinates.lat !== 0 && loc.coordinates.lng !== 0) {
          return loc;
        }
        
        // Otherwise, geocode the location
        const result = await geocodeLocation(loc.name);
        if (result) {
          return {
            ...loc,
            coordinates: { lat: result.lat, lng: result.lng },
          };
        }
        
        // If geocoding fails, return location with default coordinates (will show error)
        console.warn(`Failed to geocode location: ${loc.name}`);
        return loc;
      })
    );
    
    return {
      ...itinerary,
      locations: updatedLocations,
    };
  };

  const handleMessagesUpdate = useCallback((msgs: Message[]) => {
    setMessages(msgs);
  }, []);

  const handleDestinationClick = useCallback((countryName: string) => {
    // Trigger a message with the country name
    const message = `Plan me a trip to ${countryName}`;
    setTriggerMessage(message);
  }, []);

  return (
    <div className="relative flex w-full h-full overflow-hidden">
      {/* Chat Section */}
      <div
        className={`flex flex-col transition-all duration-500 ease-in-out ${
          showMap ? 'md:w-[60%] w-full' : 'md:w-[65%] w-full'
        }`}
        style={{ paddingTop: '1px' }}
      >
        <ChatInterface
          initialMessages={
            initialMessage ? [{ role: 'user', content: initialMessage }] : []
          }
          onMessagesChange={handleMessagesUpdate}
          triggerMessage={triggerMessage}
          onMessageTriggered={() => setTriggerMessage(null)}
        />
      </div>

      {/* Right Panel - Explore or Itinerary */}
      <div
        className={`absolute right-0 top-0 h-full transition-all duration-500 ease-in-out
          ${showMap ? 'md:w-[40%]' : 'md:w-[35%]'} w-0 md:block hidden`}
      >
        {showMap && itinerary ? (
          // Show itinerary when available
          <div className="h-full bg-white border-l border-[#d9e3f0] shadow-lg">
            <TripRightPanel itinerary={itinerary} places={[]} />
          </div>
        ) : (
          // Show explore page by default
          <div className="h-full" style={{ paddingTop: '1px' }}>
            <ExplorePage 
              compact={true}
              onDestinationClick={handleDestinationClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}

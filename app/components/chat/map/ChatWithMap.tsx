'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import ChatInterface from '../ChatInterface';
import { TripRightPanel } from '../itinerary/TripRightPanel';
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
    const { geocodeLocation } = await import('@/app/utils/geocoding');
    
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

  return (
    <div className="relative flex w-full h-full overflow-hidden bg-white">
      {/* Chat Section */}
      <div
        className={`flex flex-col transition-all duration-500 ease-in-out ${
          showMap ? 'md:w-[60%] w-full' : 'w-full'
        }`}
        style={{ paddingTop: '1px' }} // Subtle padding below navbar border for visual consistency
      >
        <ChatInterface
          initialMessages={
            initialMessage ? [{ role: 'user', content: initialMessage }] : []
          }
          onMessagesChange={handleMessagesUpdate}
        />
      </div>

      {/* Map & Itinerary Panel */}
      <div
        className={`absolute right-0 top-0 h-full bg-white border-l border-[#d9e3f0] shadow-lg transition-transform duration-500 ease-in-out
          ${showMap ? 'translate-x-0 md:w-[40%]' : 'translate-x-full md:translate-x-0 md:w-0'}`}
        style={{ paddingTop: '1px' }} // Subtle padding below navbar border for visual consistency
      >
        {showMap && itinerary && (
          <TripRightPanel itinerary={itinerary} places={[]} />
        )}
      </div>
    </div>
  );
}

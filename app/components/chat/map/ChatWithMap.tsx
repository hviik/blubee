'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import ChatInterface from '../ChatInterface';
import { TripRightPanel } from '../itinerary/TripRightPanel';
import ExplorePage from '../../ExplorePage';
import { Itinerary } from '@/app/types/itinerary';
import { processMessage, hasItineraryData } from '@/app/utils/messageProcessor';
import { useGoogleMaps } from './useGoogleMaps';

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
  const hasTriedGeocoding = useRef(false);
  const { isLoaded } = useGoogleMaps();

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
        hasTriedGeocoding.current = false;
        
        if (isLoaded) {
          hasTriedGeocoding.current = true;
          geocodeItineraryLocations(processed.itinerary).then(geocodedItinerary => {
            setItinerary(geocodedItinerary);
            setShowMap(true);
          });
        } else {
          setItinerary(processed.itinerary);
          setShowMap(true);
        }
      }
    }
  }, [messages, isLoaded]);

  const geocodeItineraryLocations = async (itinerary: Itinerary): Promise<Itinerary> => {
    const { geocodeLocation } = await import('./geocoding');
    
    const updatedLocations = await Promise.all(
      itinerary.locations.map(async (loc) => {
        if (loc.coordinates && loc.coordinates.lat !== 0 && loc.coordinates.lng !== 0) {
          return loc;
        }
        
        console.log('Geocoding location:', loc.name);
        const result = await geocodeLocation(loc.name);
        if (result) {
          console.log('Geocoded successfully:', loc.name, result);
          return {
            ...loc,
            coordinates: { lat: result.lat, lng: result.lng },
          };
        }
        
        console.warn(`Failed to geocode location: ${loc.name}`);
        return loc;
      })
    );
    
    return {
      ...itinerary,
      locations: updatedLocations,
    };
  };

  useEffect(() => {
    if (isLoaded && itinerary && !hasTriedGeocoding.current) {
      const hasInvalidCoordinates = itinerary.locations.some(
        loc => !loc.coordinates || loc.coordinates.lat === 0 || loc.coordinates.lng === 0
      );
      
      if (hasInvalidCoordinates) {
        console.log('Google Maps loaded, retrying geocoding...');
        hasTriedGeocoding.current = true;
        geocodeItineraryLocations(itinerary).then(geocodedItinerary => {
          setItinerary(geocodedItinerary);
        });
      }
    }
  }, [isLoaded]);

  const handleMessagesUpdate = useCallback((msgs: Message[]) => {
    setMessages(msgs);
  }, []);

  const handleDestinationClick = useCallback((countryName: string, route: string[]) => {
    let placesText = '';
    if (route.length > 0) {
      if (route.length === 1) {
        placesText = ` visiting ${route[0]}`;
      } else if (route.length === 2) {
        placesText = ` visiting ${route[0]} and ${route[1]}`;
      } else {
        const lastPlace = route[route.length - 1];
        const otherPlaces = route.slice(0, -1).join(', ');
        placesText = ` visiting ${otherPlaces}, and ${lastPlace}`;
      }
    }
    
    const message = `Plan me a trip to ${countryName}${placesText}`;
    setTriggerMessage(message);
  }, []);

  return (
    <div className="relative flex w-full h-full overflow-hidden">
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

      <div
        className={`absolute right-0 top-0 h-full transition-all duration-500 ease-in-out
          ${showMap ? 'md:w-[40%]' : 'md:w-[35%]'} w-0 md:block hidden`}
      >
        {showMap && itinerary ? (
          <div className="h-full bg-white border-l border-[#d9e3f0] shadow-lg">
            <TripRightPanel itinerary={itinerary} places={[]} />
          </div>
        ) : (
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

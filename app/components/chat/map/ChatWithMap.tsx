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
  const [mobileItineraryOpen, setMobileItineraryOpen] = useState(false);
  const [mobileMapOpen, setMobileMapOpen] = useState(false);
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
    
    const countryHint = extractCountryFromTitle(itinerary.title);
    console.log('Country hint for geocoding:', countryHint);
    
    const updatedLocations = await Promise.all(
      itinerary.locations.map(async (loc) => {
        if (loc.coordinates && loc.coordinates.lat !== 0 && loc.coordinates.lng !== 0) {
          return loc;
        }
        
        console.log(`Geocoding location: ${loc.name} (country: ${countryHint})`);
        const result = await geocodeLocation(loc.name, countryHint);
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

  const extractCountryFromTitle = (title: string): string | undefined => {
    const commonCountries = [
      'Thailand', 'Malaysia', 'Vietnam', 'Philippines', 'Indonesia',
      'Singapore', 'Cambodia', 'Laos', 'Myanmar', 'Brunei',
      'India', 'China', 'Japan', 'South Korea', 'Taiwan',
      'Peru', 'Brazil', 'Argentina', 'Chile', 'Colombia',
      'Maldives', 'Sri Lanka', 'Nepal', 'Bhutan'
    ];
    
    for (const country of commonCountries) {
      if (title.toLowerCase().includes(country.toLowerCase())) {
        return country;
      }
    }
    
    return undefined;
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
        
        {showMap && itinerary && (
          <div className="md:hidden fixed left-4 right-4 z-30 flex justify-between gap-3"
            style={{ 
              bottom: 'calc(90px + env(safe-area-inset-bottom, 0px))',
              pointerEvents: 'none'
            }}
          >
            <button
              onClick={() => setMobileMapOpen(true)}
              className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-white hover:bg-gray-50 transition-all shadow-md border border-[#d5d5d5]"
              style={{ 
                pointerEvents: 'auto'
              }}
            >
              <svg className="w-5 h-5 text-[#132341]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="text-[16px] font-normal text-[#132341]" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>Map</span>
            </button>
            
            <button
              onClick={() => setMobileItineraryOpen(true)}
              className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#475f73] hover:bg-[#3d5363] transition-all shadow-md border border-[#d5d5d5] relative"
              style={{ 
                pointerEvents: 'auto'
              }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-[16px] font-normal text-white" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>Itinerary</span>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
            </button>
          </div>
        )}
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

      {mobileItineraryOpen && itinerary && (
        <div className="md:hidden fixed inset-0 z-50 bg-white" style={{ top: '56px' }}>
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#d7e7f5] bg-white shadow-sm">
              <h2 className="text-lg font-semibold text-[#132341]" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>Itinerary</h2>
              <button
                onClick={() => setMobileItineraryOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close itinerary"
              >
                <svg className="w-6 h-6 text-[#475f73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <TripRightPanel itinerary={itinerary} places={[]} mobileView="itinerary" />
            </div>
          </div>
        </div>
      )}

      {mobileMapOpen && itinerary && (
        <div className="md:hidden fixed inset-0 z-50 bg-white" style={{ top: '56px' }}>
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#d7e7f5] bg-white shadow-sm">
              <h2 className="text-lg font-semibold text-[#132341]" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>Map</h2>
              <button
                onClick={() => setMobileMapOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close map"
              >
                <svg className="w-6 h-6 text-[#475f73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1">
              <TripRightPanel itinerary={itinerary} places={[]} mobileView="map" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

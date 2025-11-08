'use client';

import { useState, useCallback } from 'react';
import ChatInterface from './ChatInterface';
import { TripRightPanel } from './map/TripRightPanel';
import { Itinerary } from '@/app/types/itinerary';
import { mockItinerary } from '@/app/utils/mockItinerary';

interface ChatWithMapProps {
  initialMessage?: string;
}

export default function ChatWithMap({ initialMessage }: ChatWithMapProps) {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [showMap, setShowMap] = useState(false);

  // Handle messages to detect when to show itinerary
  const handleSendMessage = useCallback((message: string) => {
    // Simple trigger: if message mentions trip/itinerary/plan, show the mock itinerary
    const triggerWords = ['trip', 'itinerary', 'plan', 'vietnam', 'travel', 'destination'];
    const shouldShowItinerary = triggerWords.some((word) =>
      message.toLowerCase().includes(word)
    );

    if (shouldShowItinerary && !showMap) {
      // Simulate async itinerary generation with a delay
      setTimeout(() => {
        setItinerary(mockItinerary);
        setShowMap(true);
      }, 2000);
    }
  }, [showMap]);

  return (
    <div className="flex w-full h-full">
      {/* Chat Section */}
      <div
        className={`transition-all duration-300 ease-in-out bg-white ${
          showMap ? 'w-[696px]' : 'w-full'
        } h-full flex-shrink-0`}
      >
        <ChatInterface
          initialMessages={
            initialMessage ? [{ role: 'user', content: initialMessage }] : []
          }
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Map & Itinerary Panel */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          showMap ? 'w-[504px]' : 'w-0'
        } h-full flex-shrink-0 overflow-hidden`}
      >
        {showMap && (
          <TripRightPanel
            itinerary={itinerary}
            places={[]}
          />
        )}
      </div>
    </div>
  );
}


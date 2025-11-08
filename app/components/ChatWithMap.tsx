'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import ChatInterface from './ChatInterface';
import { TripRightPanel } from './map/TripRightPanel';
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

  // Process assistant messages for itinerary
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
        setItinerary(processed.itinerary);
        setShowMap(true);
      }
    }
  }, [messages]);

  const handleMessagesUpdate = useCallback((msgs: Message[]) => {
    setMessages(msgs);
  }, []);

  return (
    <div className="flex w-full h-full">
      {/* Chat Section */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          showMap ? 'w-[696px]' : 'w-full'
        } h-full flex-shrink-0`}
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
        className={`transition-all duration-300 ease-in-out ${
          showMap ? 'w-[504px]' : 'w-0'
        } h-full flex-shrink-0 overflow-hidden`}
      >
        {showMap && itinerary && (
          <TripRightPanel
            itinerary={itinerary}
            places={[]}
          />
        )}
      </div>
    </div>
  );
}


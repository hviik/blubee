'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { COLORS } from '../../constants/colors';
import MarkdownMessage from './MarkdownMessage';
import { detectUserCurrency, CurrencyInfo } from '@/app/utils/currencyDetection';
import { HotelCarousel, HotelData } from './booking';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  isUsingTool?: boolean;
  toolName?: string;
  hotelData?: {
    hotels: HotelData[];
    destination?: string;
    checkInDate?: string;
    checkOutDate?: string;
  };
}

interface ChatInterfaceProps {
  initialMessages?: Message[];
  onSendMessage?: (message: string) => void;
  onMessagesChange?: (messages: Message[]) => void;
  onItineraryReceived?: (itinerary: any) => void;
  triggerMessage?: string | null;
  onMessageTriggered?: () => void;
}

export default function ChatInterface({ 
  initialMessages = [], 
  onSendMessage, 
  onMessagesChange,
  onItineraryReceived,
  triggerMessage,
  onMessageTriggered 
}: ChatInterfaceProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedStreaming, setHasStartedStreaming] = useState(false);
  const [userCurrency, setUserCurrency] = useState<CurrencyInfo | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasInitialized = useRef(false);
  const prevMessageCount = useRef(0);
  const hasStartedStreamingRef = useRef(false);
  const pendingHotelDataRef = useRef<Message['hotelData'] | null>(null);
  const wasLoadingRef = useRef(false);

  useEffect(() => {
    detectUserCurrency().then((currency) => {
      setUserCurrency(currency);
    });
  }, []);

  useEffect(() => {
    if (onMessagesChange) onMessagesChange(messages);
  }, [messages, onMessagesChange]);

  const isNearBottom = () => {
    const el = containerRef.current;
    if (!el) return true;
    const threshold = 100;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    return dist < threshold;
  };

  const scrollToBottom = useCallback((smooth: boolean) => {
    if (!isNearBottom()) return;
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      const t = setTimeout(() => scrollToBottom(true), 30);
      prevMessageCount.current = messages.length;
      return () => clearTimeout(t);
    }
    prevMessageCount.current = messages.length;
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (wasLoadingRef.current && !isLoading) {
      inputRef.current?.focus();
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading]);

  const sendMessageToAPI = useCallback(
    async (messageText: string, currentMessages: Message[]) => {
      if (!messageText.trim() || isLoading) return;
      setIsLoading(true);
      setHasStartedStreaming(false);
      hasStartedStreamingRef.current = false;
      pendingHotelDataRef.current = null;
      onSendMessage?.(messageText);

      const userMessage: Message = { role: 'user', content: messageText };
      const updated = [...currentMessages, userMessage];
      setMessages(updated);
      prevMessageCount.current = updated.length;

      setMessages((prev) => [...prev, { role: 'assistant', content: '', isStreaming: true }]);
      scrollToBottom(true);

      try {
        const userName = user?.firstName || user?.fullName?.split(' ')[0] || null;
        
        const response = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: updated,
            userName: userName,
            currency: userCurrency
          }),
        });

        if (!response.ok || !response.body) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || 'Network error');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let accumulated = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim() || !line.startsWith('data: ')) continue;
            
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                if (newMessages[lastIndex]?.role === 'assistant') {
                  newMessages[lastIndex] = {
                    role: 'assistant',
                    content: accumulated,
                    isStreaming: false,
                    hotelData: pendingHotelDataRef.current || undefined,
                  };
                }
                return newMessages;
              });
              scrollToBottom(true);
              continue;
            }

            try {
              const chunk = JSON.parse(data);
              
              if (chunk.error) {
                throw new Error(chunk.error);
              }

              // Handle tool calls - show that agent is working
              if (chunk.toolCall) {
                try {
                  const toolInfo = JSON.parse(chunk.toolCall);
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastIndex = newMessages.length - 1;
                    if (newMessages[lastIndex]?.role === 'assistant') {
                      newMessages[lastIndex] = {
                        ...newMessages[lastIndex],
                        isUsingTool: true,
                        toolName: toolInfo.name,
                      };
                    }
                    return newMessages;
                  });
                } catch {}
                continue;
              }

              if (chunk.toolResult) {
                try {
                  const toolData = JSON.parse(chunk.toolResult);
                  
                  if (toolData?.messages) {
                    for (const msg of toolData.messages) {
                      if (msg?.content) {
                        try {
                          const content = JSON.parse(msg.content);
                          
                          if (content?.itinerary && onItineraryReceived) {
                            onItineraryReceived(content.itinerary);
                          }
                          
                          if (content?.displayType === 'hotelCarousel' && content?.hotels) {
                            pendingHotelDataRef.current = {
                              hotels: content.hotels,
                              destination: content.destination,
                              checkInDate: content.checkInDate,
                              checkOutDate: content.checkOutDate,
                            };
                          }
                        } catch {}
                      }
                    }
                  }
                } catch {}
                
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastIndex = newMessages.length - 1;
                  if (newMessages[lastIndex]?.role === 'assistant') {
                    newMessages[lastIndex] = {
                      ...newMessages[lastIndex],
                      isUsingTool: false,
                      toolName: undefined,
                    };
                  }
                  return newMessages;
                });
                continue;
              }
              
              if (chunk.content) {
                if (!hasStartedStreamingRef.current) {
                  hasStartedStreamingRef.current = true;
                  setHasStartedStreaming(true);
                }

                accumulated += chunk.content;

                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastIndex = newMessages.length - 1;
                  if (newMessages[lastIndex]?.role === 'assistant') {
                    newMessages[lastIndex] = {
                      role: 'assistant',
                      content: accumulated,
                      isStreaming: true,
                      isUsingTool: false,
                    };
                  }
                  return newMessages;
                });

                requestAnimationFrame(() => {
                  scrollToBottom(false);
                });
              }
            } catch (e) {
              if (e instanceof Error && e.message) {
                throw e;
              }
              continue;
            }
          }
        }

        if (buffer.trim()) {
          const line = buffer.trim();
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data !== '[DONE]') {
              try {
                const chunk = JSON.parse(data);
                if (chunk.content) {
                  accumulated += chunk.content;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastIndex = newMessages.length - 1;
                    if (newMessages[lastIndex]?.role === 'assistant') {
                      newMessages[lastIndex] = {
                        role: 'assistant',
                        content: accumulated,
                        isStreaming: false,
                        hotelData: pendingHotelDataRef.current || undefined,
                      };
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
              }
            }
          }
        }
      } catch (err: any) {
        console.error('Stream error:', err);
        const errorMessage = err?.message || 'Sorry, something went wrong while generating a response. Please try again.';
        setMessages((prev) => {
          const filtered = prev.filter((m, idx) => idx < prev.length - 1 || m.content !== '');
          return [
            ...filtered,
            {
              role: 'assistant',
              content: errorMessage,
            },
          ];
        });
      } finally {
        setIsLoading(false);
        setHasStartedStreaming(false);
        hasStartedStreamingRef.current = false;
        pendingHotelDataRef.current = null;
      }
    },
    [isLoading, onSendMessage, scrollToBottom, user, userCurrency]
  );

  useEffect(() => {
    if (!hasInitialized.current && initialMessages.length > 0) {
      hasInitialized.current = true;
      const first = initialMessages[0];
      if (first.role === 'user') sendMessageToAPI(first.content, []);
    }
  }, [initialMessages, sendMessageToAPI]);

  useEffect(() => {
    if (triggerMessage && !isLoading) {
      sendMessageToAPI(triggerMessage, messages);
      onMessageTriggered?.();
    }
  }, [triggerMessage]);

  useEffect(() => {
    const handleSlashKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleSlashKey);
    return () => window.removeEventListener('keydown', handleSlashKey);
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const scrollHeight = inputRef.current.scrollHeight;
      const maxHeight = 120;
      inputRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [inputValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const text = inputValue;
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    await sendMessageToAPI(text, messages);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getToolActivityMessage = (toolName?: string): string => {
    switch (toolName) {
      case 'save_trip':
        return 'Saving your trip...';
      case 'get_user_trips':
        return 'Fetching your trips...';
      case 'add_to_wishlist':
        return 'Adding to wishlist...';
      case 'get_wishlist':
        return 'Getting your wishlist...';
      case 'search_destinations':
        return 'Searching destinations...';
      case 'get_destination_info':
        return 'Getting destination info...';
      case 'convert_currency':
        return 'Converting currency...';
      case 'search_hotels':
        return 'Searching hotels...';
      case 'get_hotel_details':
        return 'Getting hotel details...';
      case 'create_itinerary_with_map':
        return 'Creating your itinerary...';
      case 'geocode_locations':
        return 'Finding locations on map...';
      case 'search_nearby_places':
        return 'Finding nearby places...';
      default:
        return 'Working on it...';
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col border-r border-[#cee2f2]"
      style={{
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
        background: 'transparent',
      }}
    >
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-y-auto pb-[90px] md:pb-4"
        style={{ 
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-[850px] lg:max-w-[1000px] px-3 md:px-4 py-3 md:py-4 md:pb-0">
          {messages.map((message: Message, index: number) => (
            <div key={index}>
              <div 
                className="flex gap-3 md:gap-4 items-start py-3 md:py-4 px-3 md:px-4 rounded-xl md:rounded-2xl mb-2"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div
                  className="shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: message.role === 'user' ? COLORS.borderMedium : 'transparent' }}
                >
                  {message.role === 'user' ? (
                    user?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.imageUrl}
                        alt={user.firstName || 'User'}
                        className="object-cover w-full h-full rounded-full"
                      />
                    ) : (
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full" style={{ backgroundColor: COLORS.textSecondary }} />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image src="/assets/logo.svg" alt="Blubeez" width={28} height={20} className="object-contain md:w-[32px] md:h-[23px]" />
                    </div>
                  )}
                </div>
                 <div className="flex-1 min-w-0 pt-0.5 md:pt-1">
                   {message.role === 'assistant' ? (
                     <div className="text-[14px] md:text-[0.938rem] lg:text-[1rem]">
                       {message.content ? (
                         <div className="relative">
                           <MarkdownMessage content={message.content} />
                           {message.isStreaming && (
                             <span className="inline-block animate-pulse ml-0.5">▊</span>
                           )}
                         </div>
                       ) : message.isUsingTool ? (
                         <div className="flex items-center gap-2 text-sm text-gray-500">
                           <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                           </svg>
                           <span>{getToolActivityMessage(message.toolName)}</span>
                         </div>
                       ) : (
                         <div className="flex gap-1">
                           <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                           <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                           <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                         </div>
                       )}
                     </div>
                   ) : (
                     <p
                       className="text-[14px] md:text-[0.938rem] lg:text-[1rem] leading-relaxed whitespace-pre-wrap"
                       style={{ fontFamily: 'var(--font-poppins)', color: COLORS.textSecondary }}
                     >
                       {message.content}
                     </p>
                   )}
                 </div>
              </div>
              
              {message.hotelData && message.hotelData.hotels && message.hotelData.hotels.length > 0 && (
                <div className="mb-4 -mx-3 md:-mx-4">
                  <HotelCarousel
                    hotels={message.hotelData.hotels}
                    title={`Hotel recommendations in ${message.hotelData.destination || 'your destination'}`}
                    destination={message.hotelData.destination}
                    checkInDate={message.hotelData.checkInDate}
                    checkOutDate={message.hotelData.checkOutDate}
                  />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div
        className="border-t fixed bottom-0 left-0 right-0 md:relative"
        style={{
          borderColor: COLORS.borderLight,
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          zIndex: 40,
        }}
      >
        <div className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-[850px] lg:max-w-[1000px] px-3 md:px-4 py-3 md:py-4">
          <form onSubmit={handleSubmit}>
             <div
               className="w-full px-3 md:px-[16px] py-2.5 md:py-[12px] rounded-xl md:rounded-[16px] border border-[#2c3d5d] flex items-end justify-between gap-2"
               style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
             >
               <textarea
                 ref={inputRef}
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
                 onKeyDown={handleKeyDown}
                 placeholder="Ask blu"
                 disabled={isLoading}
                 autoComplete="on"
                 autoCorrect="on"
                 autoCapitalize="on"
                 spellCheck={true}
                 rows={1}
                 className="flex-1 bg-transparent text-[16px] md:text-[0.938rem] lg:text-[1rem] font-normal outline-none placeholder-neutral-400 resize-none overflow-y-auto leading-normal"
                 style={{ 
                   fontFamily: 'var(--font-poppins)', 
                   color: COLORS.textSecondary,
                   minHeight: '24px',
                   maxHeight: '120px'
                 }}
               />
               <button
                 type="submit"
                 disabled={isLoading || !inputValue.trim()}
                 className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                 aria-label="Send"
               >
                 <Image src="/assets/send.svg" alt="Send" width={17} height={14} className="object-contain md:w-[19px] md:h-[16px]" />
               </button>
             </div>
          </form>
        </div>
      </div>
    </div>
  );
}

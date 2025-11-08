'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { COLORS } from '../constants/colors';
import MarkdownMessage from './MarkdownMessage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  initialMessages?: Message[];
  onSendMessage?: (message: string) => void;
  onMessagesChange?: (messages: Message[]) => void;
}

export default function ChatInterface({ initialMessages = [], onSendMessage, onMessagesChange }: ChatInterfaceProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  useEffect(() => {
    if (onMessagesChange) {
      onMessagesChange(messages);
    }
  }, [messages, onMessagesChange]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const prevMessageCount = useRef(0);

  const isNearBottom = () => {
    const el = containerRef.current;
    if (!el) return true;
    const threshold = 100;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    return dist < threshold;
  };

  const scrollToBottom = (smooth: boolean) => {
    if (!isNearBottom()) return;
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      const t = setTimeout(() => scrollToBottom(true), 30);
      prevMessageCount.current = messages.length;
      return () => clearTimeout(t);
    }
    prevMessageCount.current = messages.length;
  }, [messages]);

  const sendMessageToAPI = useCallback(
    async (messageText: string, currentMessages: Message[]) => {
      if (!messageText.trim() || isLoading) return;

      setIsLoading(true);
      onSendMessage?.(messageText);

      const userMessage: Message = { role: 'user', content: messageText };
      const updated = [...currentMessages, userMessage];
      setMessages(updated);
      prevMessageCount.current = updated.length;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: updated }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || 'Failed to send message');
        }

        setMessages((prev) => {
          const assistantMessage: Message = { role: 'assistant', content: '' };
          const next = [...prev, assistantMessage];
          queueMicrotask(() => {
            prevMessageCount.current = next.length;
          });
          return next;
        });
        
        scrollToBottom(true);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let acc = '';
          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              acc += chunk;

              setMessages((prev) => {
                const copy = [...prev];
                const lastMsg = copy[copy.length - 1];
                if (lastMsg && lastMsg.role === 'assistant') {
                  copy[copy.length - 1] = { ...lastMsg, content: acc };
                }
                return copy;
              });
            }
          } catch (streamErr) {
            console.error('Stream read error:', streamErr);
          }
        }
      } catch (err) {
        console.error('Error sending message:', err);
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.role !== 'assistant' || m.content);
          return [...filtered, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }];
        });
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, onSendMessage]
  );

  useEffect(() => {
    if (!hasInitialized.current && initialMessages.length > 0) {
      hasInitialized.current = true;
      const first = initialMessages[0];
      if (first.role === 'user') sendMessageToAPI(first.content, []);
    }
  }, [initialMessages, sendMessageToAPI]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const text = inputValue;
    setInputValue('');
    await sendMessageToAPI(text, messages);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div 
      className="w-full h-full flex flex-col backdrop-blur-[5px] bg-gradient-to-b from-[rgba(255,255,255,0.4)] to-[rgba(255,255,255,0.8)] border-r border-[#cee2f2]"
      style={{
        // Chrome: ensure proper rendering with transform
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
      }}
    >
      {/* Messages container must have min-h-0 to allow overflow-y in flex layouts */}
      <div 
        ref={containerRef} 
        className="flex-1 min-h-0 overflow-y-auto"
        style={{
          // Chrome: improve scrolling performance
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-[850px] lg:max-w-[1000px] px-4 py-4">
          {messages.map((message, index) => (
            <div key={index}>
              <div className="flex gap-4 items-start py-4">
                <div
                  className="shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: message.role === 'user' ? COLORS.borderMedium : 'transparent' }}
                >
                  {message.role === 'user' ? (
                    user?.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.firstName || 'User'}
                        className="object-cover w-full h-full rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: COLORS.textSecondary }} />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image src="/assets/logo.svg" alt="Blubeez" width={32} height={23} className="object-contain" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  {message.role === 'assistant' ? (
                    <div className="text-[0.875rem] sm:text-[0.938rem] md:text-[1rem]">
                      <MarkdownMessage content={message.content} />
                    </div>
                  ) : (
                    <p
                      className="text-[0.875rem] sm:text-[0.938rem] md:text-[1rem] leading-relaxed whitespace-pre-wrap"
                      style={{ fontFamily: 'var(--font-poppins)', color: COLORS.textSecondary }}
                    >
                      {message.content}
                    </p>
                  )}
                </div>
              </div>

              {index < messages.length - 1 && (
                <div className="w-full h-px" style={{ backgroundColor: COLORS.borderLight }} />
              )}
            </div>
          ))}

          {isLoading && (
            <div>
              <div className="flex gap-4 items-start py-4">
                <div className="shrink-0 w-8 h-8 flex items-center justify-center">
                  <Image src="/assets/logo.svg" alt="Blubeez" width={32} height={23} className="object-contain" />
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div 
        className="border-t" 
        style={{ 
          borderColor: COLORS.borderLight,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        <div className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-[850px] lg:max-w-[1000px] px-4 py-4">
          <form onSubmit={handleSubmit}>
            <div
              className="w-full px-[16px] py-[12px] rounded-[16px] border border-[#2c3d5d] flex items-center justify-between gap-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask blu"
                disabled={isLoading}
                className="flex-1 bg-transparent text-[0.875rem] sm:text-[0.938rem] md:text-[1rem] font-normal outline-none placeholder-neutral-400"
                style={{ fontFamily: 'var(--font-poppins)', color: COLORS.textSecondary }}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send"
              >
                <Image src="/assets/send.svg" alt="Send" width={19} height={16} className="object-contain" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

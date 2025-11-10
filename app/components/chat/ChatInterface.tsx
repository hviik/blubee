'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { COLORS } from '../../constants/colors';
import MarkdownMessage from './MarkdownMessage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean; // Flag to indicate if message is still streaming
}

interface ChatInterfaceProps {
  initialMessages?: Message[];
  onSendMessage?: (message: string) => void;
  onMessagesChange?: (messages: Message[]) => void;
  triggerMessage?: string | null;
  onMessageTriggered?: () => void;
}

export default function ChatInterface({ 
  initialMessages = [], 
  onSendMessage, 
  onMessagesChange,
  triggerMessage,
  onMessageTriggered 
}: ChatInterfaceProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedStreaming, setHasStartedStreaming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitialized = useRef(false);
  const prevMessageCount = useRef(0);
  const hasStartedStreamingRef = useRef(false);

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

  const sendMessageToAPI = useCallback(
    async (messageText: string, currentMessages: Message[]) => {
      if (!messageText.trim() || isLoading) return;
      setIsLoading(true);
      setHasStartedStreaming(false);
      hasStartedStreamingRef.current = false;
      onSendMessage?.(messageText);

      const userMessage: Message = { role: 'user', content: messageText };
      const updated = [...currentMessages, userMessage];
      setMessages(updated);
      prevMessageCount.current = updated.length;

      // Add empty assistant message that will be filled as streaming happens
      setMessages((prev) => [...prev, { role: 'assistant', content: '', isStreaming: true }]);
      scrollToBottom(true);

      try {
        // Get user's name from Clerk
        const userName = user?.firstName || user?.fullName?.split(' ')[0] || null;
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: updated,
            userName: userName // Pass user's name to the API
          }),
        });

        if (!response.ok || !response.body) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || 'Network error');
        }

        // Backend sends Server-Sent Events (SSE) format (matching FastAPI pattern)
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let accumulated = '';

        // Process SSE stream chunks (matching FastAPI client pattern)
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          // Decode chunk and add to buffer
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete SSE messages (format: "data: {...}\n\n")
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.trim() || !line.startsWith('data: ')) continue;
            
            const data = line.slice(6); // Remove "data: " prefix
            
            // Check for [DONE] marker (matching FastAPI pattern)
            if (data === '[DONE]') {
              // Streaming complete - final update with markdown
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                if (newMessages[lastIndex]?.role === 'assistant') {
                  newMessages[lastIndex] = {
                    role: 'assistant',
                    content: accumulated,
                    isStreaming: false,
                  };
                }
                return newMessages;
              });
              scrollToBottom(true);
              continue;
            }

            try {
              const chunk = JSON.parse(data);
              
              // Extract content (matching FastAPI pattern: {"content": "chunk"})
              if (chunk.content) {
                // Mark streaming as started
                if (!hasStartedStreamingRef.current) {
                  hasStartedStreamingRef.current = true;
                  setHasStartedStreaming(true);
                }

                // Add chunk to accumulated text
                accumulated += chunk.content;

                // Update UI immediately - use plain text during streaming for performance
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastIndex = newMessages.length - 1;
                  if (newMessages[lastIndex]?.role === 'assistant') {
                    newMessages[lastIndex] = {
                      role: 'assistant',
                      content: accumulated,
                      isStreaming: true, // Flag to indicate streaming
                    };
                  }
                  return newMessages;
                });

                // Auto-scroll smoothly
                requestAnimationFrame(() => {
                  scrollToBottom(false);
                });
              }
            } catch (e) {
              // Skip invalid JSON lines
              continue;
            }
          }
        }

        // Process any remaining buffer
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
                      };
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      } catch (err: any) {
        console.error('Stream error:', err);
        setMessages((prev) => {
          const filtered = prev.filter((m, idx) => idx < prev.length - 1 || m.content !== '');
          return [
            ...filtered,
            {
              role: 'assistant',
              content: 'Sorry, something went wrong while generating a response. Please try again.',
            },
          ];
        });
      } finally {
        setIsLoading(false);
        setHasStartedStreaming(false);
        hasStartedStreamingRef.current = false;
      }
    },
    [isLoading, onSendMessage, scrollToBottom, user]
  );

  // Handle initial messages
  useEffect(() => {
    if (!hasInitialized.current && initialMessages.length > 0) {
      hasInitialized.current = true;
      const first = initialMessages[0];
      if (first.role === 'user') sendMessageToAPI(first.content, []);
    }
  }, [initialMessages, sendMessageToAPI]);

  // Handle triggered messages from external components (like explore page)
  useEffect(() => {
    if (triggerMessage && !isLoading) {
      sendMessageToAPI(triggerMessage, messages);
      onMessageTriggered?.();
    }
  }, [triggerMessage]);

  // Handle "/" key to focus input
  useEffect(() => {
    const handleSlashKey = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Check if "/" key is pressed
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleSlashKey);
    return () => window.removeEventListener('keydown', handleSlashKey);
  }, []);

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
      className="w-full h-full flex flex-col border-r border-[#cee2f2]"
      style={{
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
        background: 'transparent',
      }}
    >
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-y-auto"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-[850px] lg:max-w-[1000px] px-3 md:px-4 py-3 md:py-4">
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
                      {/* Show plain text during streaming for performance, markdown when done */}
                      {message.isStreaming && message.content ? (
                        <p
                          className="leading-relaxed whitespace-pre-wrap"
                          style={{ fontFamily: 'var(--font-poppins)', color: COLORS.textSecondary }}
                        >
                          {message.content}
                          <span className="animate-pulse">▊</span>
                        </p>
                      ) : message.content ? (
                        <MarkdownMessage content={message.content} />
                      ) : (
                        // Show loading dots when message is empty (before first chunk arrives)
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
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div
        className="border-t"
        style={{
          borderColor: COLORS.borderLight,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-[850px] lg:max-w-[1000px] px-3 md:px-4 py-3 md:py-4">
          <form onSubmit={handleSubmit}>
            <div
              className="w-full px-3 md:px-[16px] py-2.5 md:py-[12px] rounded-xl md:rounded-[16px] border border-[#2c3d5d] flex items-center justify-between gap-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask blu"
                disabled={isLoading}
                className="flex-1 bg-transparent text-[14px] md:text-[0.938rem] lg:text-[1rem] font-normal outline-none placeholder-neutral-400"
                style={{ fontFamily: 'var(--font-poppins)', color: COLORS.textSecondary }}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

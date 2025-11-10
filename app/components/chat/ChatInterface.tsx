'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { COLORS } from '../../constants/colors';
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
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedStreaming, setHasStartedStreaming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const prevMessageCount = useRef(0);

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

  const extractTextFromData = (data: string) => {
    const trimmed = data.trim();
    if (!trimmed) return '';
    if (trimmed === '[DONE]') return '[DONE]';
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.choices) {
          const c = parsed.choices[0];
          if (c?.delta?.content) return c.delta.content;
          if (c?.text) return c.text;
          if (c?.message?.content?.parts && Array.isArray(c.message.content.parts)) {
            return c.message.content.parts.join('');
          }
        }
        if (parsed.text) return parsed.text;
      } catch (e) {
        return trimmed;
      }
    }
    return trimmed;
  };

  const sendMessageToAPI = useCallback(
    async (messageText: string, currentMessages: Message[]) => {
      if (!messageText.trim() || isLoading) return;
      setIsLoading(true);
      setHasStartedStreaming(false);
      onSendMessage?.(messageText);

      const userMessage: Message = { role: 'user', content: messageText };
      const updated = [...currentMessages, userMessage];
      setMessages(updated);
      prevMessageCount.current = updated.length;

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
      scrollToBottom(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: updated }),
        });

        if (!response.ok || !response.body) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || 'Network error');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || '';

          for (const rawLine of lines) {
            if (!rawLine) continue;
            const line = rawLine.trim();
            if (!line.startsWith('data:')) continue;
            const data = line.replace(/^data:\s*/, '');
            if (data === '[DONE]') continue;
            const token = extractTextFromData(data);
            if (!token) continue;

            if (!hasStartedStreaming) setHasStartedStreaming(true);

            setMessages((prev) => {
              const newMessages = [...prev];
              const lastIndex = newMessages.length - 1;
              if (newMessages[lastIndex]?.role === 'assistant') {
                newMessages[lastIndex] = {
                  role: 'assistant',
                  content: newMessages[lastIndex].content + token,
                };
              }
              return newMessages;
            });
            scrollToBottom(false);
          }
        }

        if (buffer) {
          const leftover = buffer.trim();
          if (leftover.startsWith('data:')) {
            const data = leftover.replace(/^data:\s*/, '');
            if (data !== '[DONE]') {
              const token = extractTextFromData(data);
              if (token) {
                if (!hasStartedStreaming) setHasStartedStreaming(true);
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastIndex = newMessages.length - 1;
                  if (newMessages[lastIndex]?.role === 'assistant') {
                    newMessages[lastIndex] = {
                      role: 'assistant',
                      content: newMessages[lastIndex].content + token,
                    };
                  }
                  return newMessages;
                });
              }
            }
          } else {
            const token = extractTextFromData(buffer);
            if (token && token !== '[DONE]') {
              if (!hasStartedStreaming) setHasStartedStreaming(true);
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                if (newMessages[lastIndex]?.role === 'assistant') {
                  newMessages[lastIndex] = {
                    role: 'assistant',
                    content: newMessages[lastIndex].content + token,
                  };
                }
                return newMessages;
              });
            }
          }
        }
      } catch (err: any) {
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
      }
    },
    [isLoading, onSendMessage, scrollToBottom, hasStartedStreaming]
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
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
      }}
    >
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-y-auto"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-[850px] lg:max-w-[1000px] px-4 py-4">
          {messages.map((message: Message, index: number) => (
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
          {isLoading && !hasStartedStreaming && messages[messages.length - 1]?.content === '' && (
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
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
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

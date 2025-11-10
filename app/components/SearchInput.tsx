'use client';

import { useState } from 'react';
import Image from 'next/image';
import { COLORS } from '../constants/colors';

interface SearchInputProps {
  onHelpClick: () => void;
  isMobileSidebarOpen?: boolean;
  onSendMessage?: (message: string) => void;
  onExploreClick?: () => void;
}

export default function SearchInput({ onHelpClick, isMobileSidebarOpen = false, onSendMessage, onExploreClick }: SearchInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      {/* Search Input - 16px text, 12px py on mobile */}
      <form onSubmit={handleSubmit} className="w-full">
        <div 
          className="w-full px-4 py-3 md:py-3 rounded-[16px] border border-[#9cabb6] flex items-center justify-between gap-2"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask blubee"
            className="flex-1 bg-transparent text-neutral-400 text-[16px] md:text-[1rem] lg:text-[1.125rem] font-normal outline-none placeholder-neutral-400 leading-normal"
            style={{ fontFamily: 'var(--font-poppins)' }}
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send"
          >
            <Image 
              src="/assets/send.svg" 
              alt="Send" 
              width={19} 
              height={16} 
              className="object-contain"
            />
          </button>
        </div>
      </form>

      {/* Mobile Footer Links - 14px text, 18px icons on mobile */}
      <div
        className={`md:hidden w-full flex justify-between items-center gap-3 transition-all duration-500 ease-in-out ${
          isMobileSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <button 
          onClick={onExploreClick}
          className="flex gap-1 items-center cursor-pointer px-0.5 py-1"
        >
          <div className="w-[18px] h-[18px] relative flex items-center justify-center">
            <Image src="/assets/travel-explore.svg" alt="Explore" width={18} height={18} />
          </div>
          <p
            className="text-[14px] md:text-[0.938rem] font-normal underline decoration-solid"
            style={{
              fontFamily: 'var(--font-bricolage-grotesque)',
              color: COLORS.textQuaternary,
              textUnderlinePosition: 'from-font',
            }}
          >
            Explore
          </p>
        </button>
        <div className="h-[18px] w-px bg-[#d0d5dd]" />
        <button 
          onClick={onHelpClick}
          className="flex gap-1 items-center cursor-pointer px-0.5 py-1"
        >
          <div className="w-[18px] h-[18px] relative flex items-center justify-center">
            <Image src="/assets/help.svg" alt="Help" width={18} height={18} />
          </div>
          <p
            className="text-[14px] md:text-[0.938rem] font-normal underline decoration-solid"
            style={{
              fontFamily: 'var(--font-bricolage-grotesque)',
              color: COLORS.textQuaternary,
              textUnderlinePosition: 'from-font',
            }}
          >
            Blubeez Tips
          </p>
        </button>
      </div>
    </>
  );
}

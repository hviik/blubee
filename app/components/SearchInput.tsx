'use client';

import Image from 'next/image';
import { COLORS } from '../constants/colors';

interface SearchInputProps {
  onHelpClick: () => void;
  isMobileSidebarOpen?: boolean;
}

export default function SearchInput({ onHelpClick, isMobileSidebarOpen = false }: SearchInputProps) {
  return (
    <>
      {/* Search Input */}
      <div 
        className="w-full px-4 py-2 md:py-3 rounded-xl md:rounded-2xl outline outline-1 outline-offset-[-1px] flex items-center justify-between gap-2"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          outlineColor: COLORS.borderInput
        }}
      >
        <input
          type="text"
          placeholder="Ask blu"
          className="flex-1 bg-transparent text-neutral-400 text-xs md:text-base font-normal outline-none placeholder-neutral-400 leading-[1.6]"
          style={{ fontFamily: 'var(--font-poppins)' }}
        />
        <button
          className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full hover:bg-white/10 transition-colors"
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

      {/* Mobile Footer Links */}
      <div
        className={`md:hidden w-full flex justify-between items-center mt-2 transition-all duration-500 ease-in-out ${
          isMobileSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="flex gap-2 items-center cursor-pointer">
          <div className="w-[18px] h-[18px] relative flex items-center justify-center">
            <Image src="/assets/travel-explore.svg" alt="Explore" width={18} height={18} />
          </div>
          <p
            className="text-sm font-normal underline decoration-solid"
            style={{
              fontFamily: 'var(--font-bricolage-grotesque)',
              color: COLORS.textQuaternary,
              textUnderlinePosition: 'from-font',
            }}
          >
            Explore Iteneraries
          </p>
        </div>
        <button 
          onClick={onHelpClick}
          className="flex gap-2.5 items-center cursor-pointer"
        >
          <p
            className="text-sm font-normal underline decoration-solid"
            style={{
              fontFamily: 'var(--font-bricolage-grotesque)',
              color: COLORS.textQuaternary,
              textUnderlinePosition: 'from-font',
            }}
          >
            Blubeez Tips
          </p>
          <div className="w-[18px] h-[18px] relative flex items-center justify-center">
            <Image src="/assets/help.svg" alt="Help" width={18} height={18} />
          </div>
        </button>
      </div>
    </>
  );
}

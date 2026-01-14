'use client';

import Image from 'next/image';
import { COLORS } from '../constants/colors';

interface FooterProps {
  onHelpClick: () => void;
  onExploreClick?: () => void;
}

export default function Footer({ onHelpClick, onExploreClick }: FooterProps) {
  return (
    <footer 
      className="hidden md:flex w-full max-w-[1329px] mx-auto px-4 absolute bottom-[clamp(1rem,2.5vh,1.75rem)] left-1/2 -translate-x-1/2 z-10 justify-between items-center"
      role="contentinfo"
      aria-label="Site footer"
    >
      <nav className="flex-1 flex justify-start" aria-label="Explore navigation">
        <button
          onClick={onExploreClick}
          className="px-4 py-1.5 rounded-[32px] outline outline-1 outline-offset-[-1px] flex items-center gap-2.5 cursor-pointer hover:outline-[#2d4e92] transition-colors"
          style={{ outlineColor: COLORS.borderLight }}
          aria-label="Explore destinations"
        >
          <span 
            className="text-[1rem] lg:text-[1.125rem] font-normal"
            style={{
              fontFamily: 'var(--font-bricolage-grotesque)',
              color: COLORS.textTertiary
            }}
          >
            Explore
          </span>
          <Image src="/assets/travel-explore.svg" alt="" width={20} height={20} aria-hidden="true" />
        </button>
      </nav>

      <div className="flex justify-center items-center">
        <p 
          className="text-[0.75rem] font-normal text-center max-w-[500px]"
          style={{ 
            fontFamily: 'var(--font-poppins)',
            color: COLORS.textSecondary
          }}
        >
          By messaging blubeez, you agree to our{' '}
          <a href="/terms" className="underline hover:text-[#2d4e92] transition-colors">Terms</a>
          {' '}and have read our{' '}
          <a href="/privacy" className="underline hover:text-[#2d4e92] transition-colors">Privacy Policy</a>.
          {' '}See{' '}
          <a href="/cookies" className="underline hover:text-[#2d4e92] transition-colors">Cookie Preferences</a>.
        </p>
      </div>

      <nav className="flex-1 flex justify-end" aria-label="Help navigation">
        <button 
          onClick={onHelpClick}
          className="px-4 py-1.5 rounded-[32px] outline outline-1 outline-offset-[-1px] flex items-center gap-2.5 cursor-pointer hover:outline-[#2d4e92] transition-colors"
          style={{ 
            outlineColor: COLORS.borderLight 
          }}
          aria-label="How to use blubeez - help guide"
        >
          <span 
            className="text-[1rem] lg:text-[1.125rem] font-normal"
            style={{ 
              fontFamily: 'var(--font-bricolage-grotesque)',
              color: COLORS.textTertiary
            }}
          >
            How to use blubeez?
          </span>
          <Image src="/assets/help.svg" alt="" width={20} height={20} aria-hidden="true" />
        </button>
      </nav>
    </footer>
  );
}

'use client';

import Image from 'next/image';
import { COLORS } from '../constants/colors';

interface FooterProps {
  onHelpClick: () => void;
}

export default function Footer({ onHelpClick }: FooterProps) {
  return (
    <div className="hidden md:flex w-full max-w-[1329px] mx-auto px-4 absolute bottom-8 left-1/2 -translate-x-1/2 z-10 justify-between items-center">
      {/* Left - Explore Button */}
      <div className="flex-1 flex justify-start">
        <div 
          className="px-4 py-1.5 rounded-[32px] outline outline-1 outline-offset-[-1px] flex items-center gap-2.5 cursor-pointer hover:outline-[#2d4e92] transition-colors"
          style={{ outlineColor: COLORS.borderLight }}
        >
          <div 
            className="text-base font-normal"
            style={{
              fontFamily: 'var(--font-bricolage-grotesque)',
              color: COLORS.textTertiary
            }}
          >
            Explore
          </div>
          <Image src="/assets/travel-explore.svg" alt="Explore" width={20} height={20} />
        </div>
      </div>

      {/* Center - Terms Text */}
      <div className="flex justify-center items-center">
        <div 
          className="text-xs font-normal text-center max-w-[500px]"
          style={{ 
            fontFamily: 'var(--font-poppins)',
            color: COLORS.textSecondary
          }}
        >
          By messaging Blubeez, you agree to our Terms and have read our Privacy Policy. See Cookie Preferences.
        </div>
      </div>

      {/* Right - Help Button */}
      <div className="flex-1 flex justify-end">
        <button 
          onClick={onHelpClick}
          className="px-4 py-1.5 rounded-[32px] outline outline-1 outline-offset-[-1px] flex items-center gap-2.5 cursor-pointer hover:outline-[#2d4e92] transition-colors"
          style={{ 
            backgroundColor: COLORS.white,
            outlineColor: COLORS.borderLight 
          }}
        >
          <div 
            className="text-base font-normal"
            style={{ 
              fontFamily: 'var(--font-bricolage-grotesque)',
              color: COLORS.textTertiary
            }}
          >
            How to use Blubeez?
          </div>
          <Image src="/assets/help.svg" alt="Help" width={20} height={20} />
        </button>
      </div>
    </div>
  );
}

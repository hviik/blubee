import Image from 'next/image';
import { COLORS } from '../constants/colors';

export default function HeroSection() {
  return (
    <div className="flex flex-col gap-2.5 items-center w-full">
      {/* Logo - 73.324px × 56px on mobile (375px), larger on desktop */}
      <div className="w-[73.324px] h-[56px] md:w-[clamp(5.5rem,7vw,6.5rem)] md:h-[clamp(4rem,5vw,4.75rem)] relative">
        <Image
          src="/assets/logo.svg"
          alt="Blubeez Logo"
          width={112}
          height={80}
          className="w-full h-full"
          priority
        />
      </div>

      {/* Intro Text - 24px on mobile (375px), scales up on larger screens */}
      <div className="w-full flex flex-col items-center">
        <div className="flex items-center whitespace-nowrap gap-[0.25rem]">
          <div 
            className="text-[24px] md:text-[2rem] lg:text-[2.25rem] font-normal"
            style={{ 
              fontFamily: 'var(--font-bricolage-grotesque)',
              color: COLORS.textBlack
            }}
          >
            Meet
          </div>
          <div 
            className="text-[24px] md:text-[2rem] lg:text-[2.25rem] font-semibold"
            style={{ 
              fontFamily: 'var(--font-bricolage-grotesque)',
              color: COLORS.blubeezBlue
            }}
          >
            blubeez
          </div>
        </div>
        <div 
          className="w-full text-center text-[24px] md:text-[2rem] lg:text-[2.25rem] font-normal whitespace-nowrap"
          style={{ 
            fontFamily: 'var(--font-bricolage-grotesque)',
            color: COLORS.textBlack
          }}
        >
          Your travel assistant
        </div>
      </div>
    </div>
  );
}

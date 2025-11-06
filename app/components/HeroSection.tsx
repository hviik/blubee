import Image from 'next/image';
import { COLORS } from '../constants/colors';

export default function HeroSection() {
  return (
    <div className="flex flex-col gap-2.5 items-center w-full">
      {/* Logo */}
      <div className="w-[73px] h-14 md:w-[clamp(5.5rem,7vw,6.5rem)] md:h-[clamp(4rem,5vw,4.75rem)] relative">
        <Image
          src="/assets/logo.svg"
          alt="Blubeez Logo"
          width={112}
          height={80}
          className="w-full h-full"
          priority
        />
      </div>

      {/* Intro Text */}
      <div className="w-full flex flex-col items-center">
        <div className="flex items-center gap-1 md:gap-2 whitespace-nowrap">
          <div 
            className="text-[1.5rem] sm:text-[1.75rem] md:text-[2rem] lg:text-[2.25rem] font-normal"
            style={{ 
              fontFamily: 'var(--font-bricolage-grotesque)',
              color: COLORS.textBlack
            }}
          >
            Meet
          </div>
          <div 
            className="text-[1.5rem] sm:text-[1.75rem] md:text-[2rem] lg:text-[2.25rem] font-semibold"
            style={{ 
              fontFamily: 'var(--font-bricolage-grotesque)',
              color: COLORS.blubeezBlue
            }}
          >
            {" "}blubeez
          </div>
        </div>
        <div 
          className="w-full text-center text-[1.5rem] sm:text-[1.75rem] md:text-[2rem] lg:text-[2.25rem] font-normal whitespace-nowrap"
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

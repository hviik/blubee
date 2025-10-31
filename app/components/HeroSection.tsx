import Image from 'next/image';
import { COLORS } from '../constants/colors';

export default function HeroSection() {
  return (
    <div className="flex flex-col gap-2.5 items-center w-full">
      {/* Logo */}
      <div className="w-[73px] h-14 md:w-28 md:h-20 relative">
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
        <div className="flex items-center gap-0 md:gap-2 whitespace-nowrap">
          <div 
            className="text-2xl md:text-4xl font-normal"
            style={{ 
              fontFamily: 'var(--font-bricolage-grotesque)',
              color: COLORS.textBlack
            }}
          >
            Meet
          </div>
          <div 
            className="text-2xl md:text-4xl font-semibold"
            style={{ 
              fontFamily: 'var(--font-bricolage-grotesque)',
              color: COLORS.blubeezBlue
            }}
          >
            {" "}blubeez
          </div>
        </div>
        <div 
          className="w-full text-center text-2xl md:text-4xl font-normal whitespace-nowrap"
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

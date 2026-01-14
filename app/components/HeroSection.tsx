import Image from 'next/image';
import { COLORS } from '../constants/colors';

export default function HeroSection() {
  return (
    <header className="flex flex-col gap-2.5 items-center w-full" role="banner">
      {/* Logo with proper accessibility */}
      <div className="w-[73.324px] h-[56px] md:w-[clamp(5.5rem,7vw,6.5rem)] md:h-[clamp(4rem,5vw,4.75rem)] relative">
        <Image
          src="/assets/logo.svg"
          alt="Blubeez - AI Travel Assistant Logo"
          width={112}
          height={80}
          className="w-full h-full"
          priority
        />
      </div>

      {/* Main Heading - SEO optimized with h1 */}
      <div className="w-full flex flex-col items-center">
        <h1 className="flex flex-col items-center">
          <span className="flex items-center whitespace-nowrap gap-[0.25rem]">
            <span 
              className="text-[24px] md:text-[2rem] lg:text-[2.25rem] font-normal"
              style={{ 
                fontFamily: 'var(--font-bricolage-grotesque)',
                color: COLORS.textBlack
              }}
            >
              Meet
            </span>
            <span 
              className="text-[24px] md:text-[2rem] lg:text-[2.25rem] font-semibold"
              style={{ 
                fontFamily: 'var(--font-bricolage-grotesque)',
                color: COLORS.blubeezBlue
              }}
            >
              blubeez
            </span>
          </span>
          <span 
            className="w-full text-center text-[24px] md:text-[2rem] lg:text-[2.25rem] font-normal whitespace-nowrap"
            style={{ 
              fontFamily: 'var(--font-bricolage-grotesque)',
              color: COLORS.textBlack
            }}
          >
            Your AI Travel Assistant
          </span>
        </h1>
        
        {/* SEO-friendly subheading - visually hidden but readable by search engines */}
        <p className="sr-only">
          Plan your perfect trip with Blubeez, the AI-powered travel planner. Create personalized itineraries, 
          discover destinations worldwide, search and book hotels, and get expert travel recommendations through 
          natural conversation. Start planning your dream vacation to Bali, Vietnam, Thailand, Peru, Maldives, 
          and 190+ countries today.
        </p>
      </div>
    </header>
  );
}

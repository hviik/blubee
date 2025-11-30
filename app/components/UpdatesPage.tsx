'use client';

import { COLORS } from '../constants/colors';

export default function UpdatesPage() {
  return (
    <div className="w-full h-full flex flex-col bg-transparent overflow-hidden">
      {/* Header */}
      <div className="px-4 md:px-6 pt-4 pb-2 shrink-0">
        <div className="flex items-center gap-3">
          {/* Bell icon */}
          <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-[#e6f0f7]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="md:w-7 md:h-7">
              <path
                d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                fill={COLORS.blubeezBlue}
              />
            </svg>
          </div>
          <div className="flex items-center gap-3">
            <h1
              className="text-[24px] md:text-[32px] font-semibold"
              style={{
                fontFamily: 'var(--font-bricolage-grotesque)',
                color: '#475f73',
              }}
            >
              Your updates
            </h1>
            {/* Count badge */}
            <div 
              className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full border"
              style={{ borderColor: '#b4c2cf' }}
            >
              <span 
                className="text-sm md:text-base font-medium"
                style={{ fontFamily: 'var(--font-poppins)', color: '#475f73' }}
              >
                0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
        {/* Illustration */}
        <div className="relative w-24 h-24 md:w-28 md:h-28 mb-6">
          {/* Envelope base */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background circle */}
            <circle cx="50" cy="50" r="44" fill="#e8f1f8" />
            
            {/* Envelope body */}
            <rect x="22" y="35" width="56" height="38" rx="4" fill="white" stroke="#94b8d4" strokeWidth="2"/>
            
            {/* Envelope flap */}
            <path d="M22 39 L50 56 L78 39" stroke="#94b8d4" strokeWidth="2" fill="none"/>
            
            {/* Decorative elements */}
            <circle cx="72" cy="30" r="8" fill="#ff6b6b" opacity="0.8"/>
            <text x="72" y="34" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">!</text>
            
            {/* Small stars/sparkles */}
            <circle cx="18" cy="28" r="2" fill="#94b8d4" opacity="0.6"/>
            <circle cx="85" cy="55" r="1.5" fill="#94b8d4" opacity="0.5"/>
            <circle cx="30" cy="75" r="1.5" fill="#94b8d4" opacity="0.4"/>
            
            {/* Envelope lines (content hint) */}
            <line x1="30" y1="50" x2="50" y2="50" stroke="#d4e3f0" strokeWidth="2" strokeLinecap="round"/>
            <line x1="30" y1="56" x2="45" y2="56" stroke="#d4e3f0" strokeWidth="2" strokeLinecap="round"/>
            <line x1="30" y1="62" x2="55" y2="62" stroke="#d4e3f0" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Text */}
        <h2
          className="text-xl md:text-2xl font-semibold mb-3 text-center"
          style={{
            fontFamily: 'var(--font-bricolage-grotesque)',
            color: '#475f73',
          }}
        >
          No updates yet
        </h2>
        
        <p
          className="text-sm md:text-base text-center max-w-sm md:max-w-md px-4 leading-relaxed"
          style={{
            fontFamily: 'var(--font-poppins)',
            color: '#7a8fa3',
          }}
        >
          You&apos;ll start seeing updates once you create an itinerary or invite friends to join your trip including notifications when someone joins using your link.
        </p>
      </div>
    </div>
  );
}


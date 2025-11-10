'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { COLORS } from '../constants/colors';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    icon: '/assets/stat-0.svg',
    title: 'Start a Conversation',
    description: 'Tell Blu what kind of trip you want — your destination, budget, duration, and interests like beaches, food, or adventure.'
  },
  {
    icon: '/assets/stat-0.svg',
    title: 'Get a Custom Itinerary',
    description: 'Blu instantly crafts a personalized day-by-day travel plan with activities, routes, and recommendations tailored to your inputs.'
  },
  {
    icon: '/assets/stat-1.svg',
    title: 'Explore and Refine',
    description: 'Ask Blu to add, remove, or modify places. You can explore suggestions like “hidden beaches” or “best cafes nearby.”'
  },
  {
    icon: '/assets/stat-1.svg',
    title: 'Save or Share Your Trip',
    description: 'Finalize your itinerary, save it for later, or share it with your travel buddies — all in one place.'
  }
];

export default function HowToUseModal({ isOpen, onClose }: HowToUseModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 backdrop-blur-[2px] transition-all duration-500 ease-in-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundColor: COLORS.modalOverlay }}
        onClick={onClose}
      />

      <div 
        className={`fixed z-50 rounded-2xl flex flex-col shadow-2xl max-h-[calc(100vh-2rem)]
          w-[343px] px-4 pt-5 pb-8 gap-4
          md:w-[523px] md:px-8 md:pt-4 md:gap-4 overflow-y-auto`}
        style={{ 
          backgroundColor: COLORS.white,
          left: isDesktop ? 'auto' : '50%',
          right: isDesktop ? '1rem' : 'auto',
          transform: isDesktop ? 'none' : 'translateX(-50%)',
          bottom: isAnimating ? '1rem' : '-500px',
          transition: 'all 0.5s ease-out',
        }}
      >
        <div className="flex items-center justify-end w-full">
          <button 
            onClick={onClose}
            className="w-5 h-5 relative cursor-pointer hover:opacity-70 transition-opacity"
          >
            <Image src="/assets/close.svg" alt="Close" width={20} height={20} />
          </button>
        </div>

        <div className="flex flex-col gap-6 md:gap-14 w-full">
          <div className="flex flex-col gap-2 items-center text-center w-full">
            <p
              className="text-[1.875rem] sm:text-[2rem] md:text-[2.25rem] lg:text-[2.5rem] font-normal"
              style={{
                fontFamily: 'var(--font-bricolage-grotesque)',
              }}
            >
              <span className="md:hidden" style={{ color: COLORS.textModalTitle }}>
                How to use blubeez?
              </span>
              <span className="hidden md:inline" style={{ color: COLORS.textModalTitleDesktop }}>
                How to use blubeez?
              </span>
            </p>
            <p
              className="text-[0.875rem] sm:text-[0.938rem] md:text-[1rem] lg:text-[1.063rem] font-medium"
              style={{
                fontFamily: 'var(--font-poppins)',
              }}
            >
              <span className="md:hidden" style={{ color: COLORS.textModalSubtitle }}>
                Plan smarter, travel better — your trip starts with a chat.
              </span>
              <span className="hidden md:inline" style={{ color: COLORS.textModalSubtitleDesktop }}>
                Chat with Blu to create your perfect itinerary in minutes.
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-6 md:gap-8 w-full">
            <div className="grid grid-cols-2 gap-4 md:gap-8 w-full">
              {STEPS.slice(0, 2).map((step, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <div className="w-5 h-5 relative mb-1">
                    <Image src={step.icon} alt="" width={20} height={20} />
                  </div>
                  <p
                    className="text-[1.125rem] sm:text-[1.25rem] md:text-[1.5rem] lg:text-[1.625rem] font-normal"
                    style={{
                      fontFamily: 'var(--font-bricolage-grotesque)',
                      color: COLORS.textQuaternary
                    }}
                  >
                    {step.title}
                  </p>
                  <p
                    className="text-[0.75rem] sm:text-[0.813rem] md:text-[0.875rem] lg:text-[0.938rem] font-normal"
                    style={{
                      fontFamily: 'var(--font-poppins)',
                    }}
                  >
                    <span className="md:hidden" style={{ color: COLORS.textModalSubtitle }}>
                      {step.description}
                    </span>
                    <span className="hidden md:inline" style={{ color: COLORS.textModalSubtitleDesktop }}>
                      {step.description}
                    </span>
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-8 w-full">
              {STEPS.slice(2, 4).map((step, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <div className="w-5 h-5 relative mb-1">
                    <Image src={step.icon} alt="" width={20} height={20} />
                  </div>
                  <p
                    className="text-[1.125rem] sm:text-[1.25rem] md:text-[1.5rem] lg:text-[1.625rem] font-normal"
                    style={{
                      fontFamily: 'var(--font-bricolage-grotesque)',
                      color: COLORS.textQuaternary
                    }}
                  >
                    {step.title}
                  </p>
                  <p
                    className="text-[0.75rem] sm:text-[0.813rem] md:text-[0.875rem] lg:text-[0.938rem] font-normal"
                    style={{
                      fontFamily: 'var(--font-poppins)',
                    }}
                  >
                    <span className="md:hidden" style={{ color: COLORS.textModalSubtitle }}>
                      {step.description}
                    </span>
                    <span className="hidden md:inline" style={{ color: COLORS.textModalSubtitleDesktop }}>
                      {step.description}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

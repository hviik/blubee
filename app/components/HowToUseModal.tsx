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
    title: 'Discover places to visit',
    description: 'describe what kind of vacation do you want to take with the details you are looking for'
  },
  {
    icon: '/assets/stat-0.svg',
    title: 'Discover places to visit',
    description: 'describe what kind of vacation do you want to take with the details you are looking for'
  },
  {
    icon: '/assets/stat-1.svg',
    title: 'Discover places to visit',
    description: 'describe what kind of vacation do you want to take with the details you are looking for'
  },
  {
    icon: '/assets/stat-1.svg',
    title: 'Discover places to visit',
    description: 'describe what kind of vacation do you want to take with the details you are looking for'
  }
];

export default function HowToUseModal({ isOpen, onClose }: HowToUseModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to ensure CSS transition is applied
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      // Wait for animation to finish before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 400);
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
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 backdrop-blur-[2px] transition-all duration-400 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundColor: COLORS.modalOverlay }}
        onClick={onClose}
      />

      {/* Modal - Bottom right on desktop, centered on mobile */}
      <div 
        className={`fixed z-50 rounded-2xl flex flex-col
          left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[343px] px-4 pt-5 pb-8 gap-4
          md:left-auto md:right-4 md:bottom-24 md:top-auto md:translate-x-0 md:translate-y-0 md:w-[523px] md:px-8 md:pt-4 md:gap-4
          transition-all duration-400 ease-out ${
            isAnimating 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
        style={{ backgroundColor: COLORS.white }}
      >
        {/* Close Button */}
        <div className="flex items-center justify-end w-full">
          <button 
            onClick={onClose}
            className="w-5 h-5 relative cursor-pointer hover:opacity-70 transition-opacity"
          >
            <Image src="/assets/close.svg" alt="Close" width={20} height={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 md:gap-14 w-full">
          {/* Header */}
          <div className="flex flex-col gap-2 items-center text-center w-full">
            {/* Title - Different colors for mobile/desktop */}
            <p
              className="text-[30px] md:text-4xl font-normal"
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
            {/* Subtitle - Different text and colors for mobile/desktop */}
            <p
              className="text-sm md:text-base font-medium"
              style={{
                fontFamily: 'var(--font-poppins)',
              }}
            >
              <span className="md:hidden" style={{ color: COLORS.textModalSubtitle }}>
                Sign up to explore, connect, and be part of our growing community.
              </span>
              <span className="hidden md:inline" style={{ color: COLORS.textModalSubtitleDesktop }}>
                & create your perfect itinerary by just chatting with us
              </span>
            </p>
          </div>

          {/* Steps Grid */}
          <div className="flex flex-col gap-6 md:gap-8 w-full">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-4 md:gap-8 w-full">
              {STEPS.slice(0, 2).map((step, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <div className="w-4 h-4 relative">
                    <Image src={step.icon} alt="" width={16} height={16} />
                  </div>
                  <p
                    className="text-lg md:text-2xl font-normal"
                    style={{
                      fontFamily: 'var(--font-bricolage-grotesque)',
                      color: COLORS.textQuaternary
                    }}
                  >
                    {step.title}
                  </p>
                  <p
                    className="text-xs md:text-sm font-normal"
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

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-4 md:gap-8 w-full">
              {STEPS.slice(2, 4).map((step, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <div className="w-4 h-4 relative">
                    <Image src={step.icon} alt="" width={16} height={16} />
                  </div>
                  <p
                    className="text-lg md:text-2xl font-normal"
                    style={{
                      fontFamily: 'var(--font-bricolage-grotesque)',
                      color: COLORS.textQuaternary
                    }}
                  >
                    {step.title}
                  </p>
                  <p
                    className="text-xs md:text-sm font-normal"
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

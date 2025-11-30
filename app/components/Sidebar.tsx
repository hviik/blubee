'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { SignedIn, UserButton } from '@clerk/nextjs';
import { COLORS } from '../constants/colors';
import HowToUseModal from './HowToUseModal';

interface SidebarProps {
  onExpandChange?: (expanded: boolean) => void;
  onMobileOpenChange?: (open: boolean) => void;
  isChatMode?: boolean;
  onExploreClick?: () => void;
  onWishlistClick?: () => void;
  onMyTripsClick?: () => void;
}

export default function Sidebar({ 
  onExpandChange, 
  onMobileOpenChange, 
  isChatMode = false, 
  onExploreClick,
  onWishlistClick,
  onMyTripsClick
}: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => {
      const newState = !prev;
      onExpandChange?.(newState);
      return newState;
    });
  }, [onExpandChange]);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen(prev => {
      const newState = !prev;
      onMobileOpenChange?.(newState);
      return newState;
    });
  }, [onMobileOpenChange]);
  
  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
    onMobileOpenChange?.(false);
  }, [onMobileOpenChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobile();
    };
    if (isMobileOpen) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isMobileOpen, closeMobile]);

  return (
    <SignedIn>
      {!isMobileOpen && (
        <button
          onClick={toggleMobile}
          className="fixed left-2 z-50 md:hidden p-0 rounded-lg hover:bg-black/5 transition-all duration-200"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
          aria-label="Open menu"
        >
          <Image src="/assets/dehaze.svg" alt="Menu" width={24} height={24} />
        </button>
      )}

      <div
        className={`hidden md:flex h-screen fixed left-0 top-0 z-30 flex-col justify-between transition-all ${
          isExpanded ? 'w-[240px]' : 'w-[67px]'
        }`}
        style={{
          backgroundColor: isExpanded ? '#f3f8ff' : (isChatMode ? 'white' : 'transparent'),
          borderRight: isExpanded ? '1px solid #b4c2cf' : (isChatMode ? '1px solid #cee2f2' : 'none'),
          padding: '16px',
          transitionDuration: '400ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="self-stretch flex flex-col justify-start items-start gap-12 w-full">
          <div className="flex justify-between items-center w-full" style={{ marginTop: '4px' }}>
            <button
              onClick={toggleExpanded}
              className="w-6 h-6 hover:opacity-70 transition-opacity"
              aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <Image src={isExpanded ? '/assets/close.svg' : '/assets/dehaze.svg'} alt="Menu" width={24} height={24} />
            </button>
          </div>
          <NavItems 
            isExpanded={isExpanded} 
            onExploreClick={onExploreClick}
            onWishlistClick={onWishlistClick}
            onMyTripsClick={onMyTripsClick}
          />
        </div>

        <BottomItems isExpanded={isExpanded} onHelpClick={() => setIsHelpModalOpen(true)} />
      </div>

      <HowToUseModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />

      <div
        className={`md:hidden fixed inset-0 z-40 transition-all ${isMobileOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!isMobileOpen}
      >
        <div
          className={`absolute inset-0 backdrop-blur-md transition-all ${
            isMobileOpen ? 'bg-black/50 opacity-100' : 'bg-black/0 opacity-0'
          }`}
          style={{
            transitionDuration: '600ms',
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onClick={closeMobile}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-[280px] bg-[#f3f8ff] border-r border-[#b4c2cf] shadow-xl transition-transform ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{
            transitionDuration: '700ms',
            transitionTimingFunction: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
          }}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={closeMobile}
            className="absolute right-2 z-50 p-2 rounded-lg hover:bg-black/5 transition-all duration-200"
            style={{ top: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}
            aria-label="Close menu"
          >
            <Image src="/assets/close.svg" alt="Close" width={20} height={20} />
          </button>

          <div className="h-full flex flex-col justify-between p-4 pt-12">
            <div className="flex flex-col gap-12">
              <NavItems 
                isExpanded 
                onExploreClick={() => {
                  closeMobile();
                  onExploreClick?.();
                }} 
                onWishlistClick={() => {
                  closeMobile();
                  onWishlistClick?.();
                }}
                onMyTripsClick={() => {
                  closeMobile();
                  onMyTripsClick?.();
                }}
                isMobile
                onItemClick={closeMobile}
              />
            </div>
            <BottomItems 
              isExpanded 
              onHelpClick={() => {
                closeMobile();
                setIsHelpModalOpen(true);
              }}
              isMobile
              onItemClick={closeMobile}
            />
          </div>
        </aside>
      </div>

      <HowToUseModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    </SignedIn>
  );
}

interface NavItemsProps {
  isExpanded?: boolean;
  onExploreClick?: () => void;
  onWishlistClick?: () => void;
  onMyTripsClick?: () => void;
  isMobile?: boolean;
  onItemClick?: () => void;
}

function NavItems({ 
  isExpanded, 
  onExploreClick, 
  onWishlistClick,
  onMyTripsClick,
  isMobile, 
  onItemClick 
}: NavItemsProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <button 
        onClick={onExploreClick}
        className="flex items-center gap-3 hover:opacity-70 transition-opacity"
      >
        <Image src="/assets/travel-explore.svg" alt="Explore" width={24} height={24} />
        {isExpanded && (
          <span
            className="text-[0.875rem] sm:text-[0.938rem] md:text-[1rem] font-normal whitespace-nowrap"
            style={{ fontFamily: 'var(--font-bricolage-grotesque)', color: COLORS.textQuaternary }}
          >
            Explore
          </span>
        )}
      </button>

      <button 
        onClick={onWishlistClick}
        className="flex items-center gap-3 hover:opacity-70 transition-opacity"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            stroke={COLORS.textQuaternary}
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
        {isExpanded && (
          <span
            className="text-[0.875rem] sm:text-[0.938rem] md:text-[1rem] font-normal whitespace-nowrap"
            style={{ fontFamily: 'var(--font-bricolage-grotesque)', color: COLORS.textQuaternary }}
          >
            Wishlist
          </span>
        )}
      </button>

      <button 
        onClick={onMyTripsClick}
        className="flex items-center gap-3 hover:opacity-70 transition-opacity"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
            stroke={COLORS.textQuaternary}
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
        {isExpanded && (
          <span
            className="text-[0.875rem] sm:text-[0.938rem] md:text-[1rem] font-normal whitespace-nowrap"
            style={{ fontFamily: 'var(--font-bricolage-grotesque)', color: COLORS.textQuaternary }}
          >
            My trips
          </span>
        )}
      </button>
    </div>
  );
}

function BottomItems({ isExpanded, onHelpClick, isMobile, onItemClick }: { isExpanded?: boolean; onHelpClick?: () => void; isMobile?: boolean; onItemClick?: () => void }) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-6">
          <button 
          onClick={onHelpClick}
          className="flex items-center gap-3 hover:opacity-70 transition-opacity"
        >
          <Image src="/assets/help.svg" alt="Help" width={24} height={24} />
          {isExpanded && (
            <span
              className="text-[0.875rem] sm:text-[0.938rem] md:text-[1rem] font-normal whitespace-nowrap"
              style={{ fontFamily: 'var(--font-bricolage-grotesque)', color: COLORS.textQuaternary }}
            >
              How to use blubeez?
            </span>
          )}
        </button>

        <div className="flex items-center gap-3 hover:opacity-70 transition-opacity cursor-pointer">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                rootBox: 'w-[26.5px] h-[26.5px]',
                avatarBox: 'w-[26.5px] h-[26.5px]',
                userButtonTrigger: 'w-[26.5px] h-[26.5px]'
              }
            }}
          />
          {isExpanded && (
            <span
              className="text-[0.875rem] sm:text-[0.938rem] md:text-[1rem] font-normal whitespace-nowrap"
              style={{ fontFamily: 'var(--font-bricolage-grotesque)', color: COLORS.textQuaternary }}
            >
              Your Profile
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

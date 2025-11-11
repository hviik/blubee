'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { SignedIn, UserButton } from '@clerk/nextjs';
import { COLORS } from '../constants/colors';
import HowToUseModal from './HowToUseModal';

interface SidebarProps {
  onExpandChange?: (expanded: boolean) => void;
  onMobileOpenChange?: (open: boolean) => void;
  isChatMode?: boolean;
  onExploreClick?: () => void;
}

export default function Sidebar({ onExpandChange, onMobileOpenChange, isChatMode = false, onExploreClick }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onExpandChange?.(newState);
  };

  const toggleMobile = () => {
    const newState = !isMobileOpen;
    setIsMobileOpen(newState);
    onMobileOpenChange?.(newState);
  };
  
  const closeMobile = () => {
    setIsMobileOpen(false);
    onMobileOpenChange?.(false);
  };

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
  }, [isMobileOpen]);

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
          <NavItems isExpanded={isExpanded} onExploreClick={onExploreClick} />
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

function NavItems({ isExpanded, onExploreClick, isMobile, onItemClick }: { isExpanded?: boolean; onExploreClick?: () => void; isMobile?: boolean; onItemClick?: () => void }) {
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
{/* 
      <button 
        onClick={isMobile ? onItemClick : undefined}
        className="flex items-center gap-3 hover:opacity-70 transition-opacity"
      >
        <Image src="/assets/bookmark-bag.svg" alt="Wishlist" width={24} height={24} />
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
        onClick={isMobile ? onItemClick : undefined}
        className="flex items-center gap-3 hover:opacity-70 transition-opacity"
      >
        <Image src="/assets/notifications.svg" alt="Updates" width={24} height={24} />
        {isExpanded && (
          <span
            className="text-[0.875rem] sm:text-[0.938rem] md:text-[1rem] font-normal whitespace-nowrap"
            style={{ fontFamily: 'var(--font-bricolage-grotesque)', color: COLORS.textQuaternary }}
          >
            Updates
          </span>
        )}
      </button>

      <button 
        onClick={isMobile ? onItemClick : undefined}
        className="flex items-center gap-3 hover:opacity-70 transition-opacity"
      >
        <Image src="/assets/997.svg" alt="My trips" width={24} height={24} />
        {isExpanded && (
          <span
            className="text-[0.875rem] sm:text-[0.938rem] md:text-[1rem] font-normal whitespace-nowrap"
            style={{ fontFamily: 'var(--font-bricolage-grotesque)', color: COLORS.textQuaternary }}
          >
            My trips
          </span>
        )}
      </button> */}
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
        <button 
          onClick={isMobile ? onItemClick : undefined}
          className="flex items-center gap-3 hover:opacity-70 transition-opacity"
        >
          <Image src="/assets/settings.svg" alt="Settings" width={24} height={24} />
          {isExpanded && (
            <span
              className="text-[0.875rem] sm:text-[0.938rem] md:text-[1rem] font-normal whitespace-nowrap"
              style={{ fontFamily: 'var(--font-bricolage-grotesque)', color: COLORS.textQuaternary }}
            >
              Settings
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

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { SignedIn, UserButton } from '@clerk/nextjs';
import { COLORS } from '../constants/colors';

interface SidebarProps {
  onExpandChange?: (expanded: boolean) => void;
  onMobileOpenChange?: (open: boolean) => void;
  isChatMode?: boolean;
}

export default function Sidebar({ onExpandChange, onMobileOpenChange, isChatMode = false }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
        className={`hidden md:flex h-screen fixed left-0 top-0 z-30 flex-col justify-between transition-all duration-300 ${
          isExpanded ? 'w-[240px]' : 'w-[67px]'
        }`}
        style={{
          backgroundColor: isExpanded ? '#f3f8ff' : (isChatMode ? 'white' : 'transparent'),
          borderRight: isExpanded ? '1px solid #b4c2cf' : (isChatMode ? '1px solid #cee2f2' : 'none'),
          padding: '16px'
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
          <NavItems isExpanded={isExpanded} />
        </div>

        <BottomItems isExpanded={isExpanded} />
      </div>

      <div
        className={`md:hidden fixed inset-0 z-40 ${isMobileOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!isMobileOpen}
      >
        <div
          className={`absolute inset-0 backdrop-blur-md transition-opacity duration-300 ease-out ${
            isMobileOpen ? 'bg-black/50 opacity-100' : 'bg-black/0 opacity-0'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onClick={closeMobile}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-[280px] bg-[#f3f8ff] border-r border-[#b4c2cf] shadow-xl ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{
            transition: 'transform 350ms cubic-bezier(0.25, 0.1, 0.25, 1)',
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
              <NavItems isExpanded />
            </div>
            <BottomItems isExpanded />
          </div>
        </aside>
      </div>
    </SignedIn>
  );
}

function NavItems({ isExpanded }: { isExpanded?: boolean }) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <button className="flex items-center gap-3 hover:opacity-70 transition-opacity">
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

      <button className="flex items-center gap-3 hover:opacity-70 transition-opacity">
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

      <button className="flex items-center gap-3 hover:opacity-70 transition-opacity">
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

      <button className="flex items-center gap-3 hover:opacity-70 transition-opacity">
        <Image src="/assets/997.svg" alt="My trips" width={24} height={24} />
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

function BottomItems({ isExpanded }: { isExpanded?: boolean }) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-6">
        <button className="flex items-center gap-3 hover:opacity-70 transition-opacity">
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

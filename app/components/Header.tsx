'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SignInButton, SignUpButton, SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import { COLORS } from '../constants/colors';

interface HeaderProps {
  sidebarExpanded?: boolean;
  sidebarCollapsedWidth?: number;
  sidebarExpandedWidth?: number;
  isChatMode?: boolean;
}

export default function Header({
  sidebarExpanded = false,
  sidebarCollapsedWidth = 67,
  sidebarExpandedWidth = 240,
  isChatMode = false,
}: HeaderProps) {
  const router = useRouter();
  const { user } = useUser();
  const sidebarGutter = 2;
  const currentSidebarWidth = sidebarExpanded ? sidebarExpandedWidth : sidebarCollapsedWidth;
  const desktopBrandLeft = currentSidebarWidth + sidebarGutter;
  
  // Get user's first name, or fallback to full name or "there"
  const userName = user?.firstName || user?.fullName || 'there';

  const handleLogoClick = () => {
    router.push('/');
    // Force reload to reset all states
    setTimeout(() => window.location.href = '/', 100);
  };

  return (
    <div className="w-full absolute left-0 top-0 z-20">
      <SignedOut>
        <div
          className={`w-full px-2 md:pl-4 md:pr-14 py-4 flex justify-between items-center ${isChatMode ? 'border-b' : ''}`}
          style={{ 
            backgroundColor: 'transparent',
            borderColor: isChatMode ? '#cee2f2' : 'transparent'
          }}
        >
          <div className="flex items-center gap-1.5 md:gap-3">
            <button 
              onClick={handleLogoClick}
              className="flex items-center gap-1 md:gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-5 h-[15px] md:w-9 md:h-7 relative">
                <Image
                  src="/assets/logo-icon.svg"
                  alt="Blubeez Icon"
                  width={36}
                  height={28}
                  className="w-full h-full"
                />
              </div>
              <div
                className="text-[0.933rem] sm:text-[1.125rem] md:text-[1.5rem] lg:text-[1.5rem] font-semibold leading-normal"
                style={{
                  fontFamily: 'var(--font-bricolage-grotesque)',
                  color: COLORS.blubeezBlue,
                }}
              >
                blubeez
              </div>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="px-6 py-1.5 rounded-3xl hover:bg-black/5 transition-colors cursor-pointer">
              <div
                className="text-[1rem] lg:text-[1.125rem] font-normal"
                style={{
                  fontFamily: 'var(--font-bricolage-grotesque)',
                  color: COLORS.textTertiary,
                }}
              >
                About
              </div>
            </div>

            <SignInButton mode="modal">
              <div
                className="px-6 py-1.5 rounded-[32px] hover:bg-[#234080] transition-colors cursor-pointer"
                style={{ backgroundColor: COLORS.blubeezNavy }}
              >
                <div
                  className="text-[1rem] lg:text-[1.125rem] font-normal"
                  style={{
                    fontFamily: 'var(--font-bricolage-grotesque)',
                    color: COLORS.white,
                  }}
                >
                  Log in
                </div>
              </div>
            </SignInButton>

            <SignUpButton mode="modal">
              <div className="px-6 py-1.5 rounded-3xl hover:bg-black/5 transition-colors cursor-pointer">
                <div
                  className="text-[1rem] lg:text-[1.125rem] font-normal"
                  style={{
                    fontFamily: 'var(--font-bricolage-grotesque)',
                    color: COLORS.textTertiary,
                  }}
                >
                  Sign up
                </div>
              </div>
            </SignUpButton>
          </div>

          <SignInButton mode="modal">
            <div
              className="md:hidden px-6 py-1.5 rounded-[32px] flex items-center hover:bg-[#234080] transition-colors cursor-pointer"
              style={{ backgroundColor: COLORS.blubeezNavy }}
            >
              <div
                className="text-[0.75rem] sm:text-[0.875rem] font-normal leading-normal"
                style={{
                  fontFamily: 'var(--font-bricolage-grotesque)',
                  color: COLORS.white,
                }}
              >
                Log in
              </div>
            </div>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <div
          className={`w-full px-2 md:pl-4 md:pr-14 py-4 flex justify-between items-center ${isChatMode ? 'border-b' : ''}`}
          style={{ 
            backgroundColor: 'transparent',
            borderColor: isChatMode ? '#cee2f2' : 'transparent'
          }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogoClick}
              className="hidden md:flex items-center gap-2 transition-all duration-300 hover:opacity-80 cursor-pointer"
              style={{ marginLeft: `${desktopBrandLeft}px` }}
            >
              <div className="w-9 h-7 relative">
                <Image
                  src="/assets/logo-icon.svg"
                  alt="Blubeez Icon"
                  width={36}
                  height={28}
                  className="w-full h-full"
                />
              </div>
              <div
                className="text-[1.5rem] lg:text-[1.5rem] font-semibold"
                style={{
                  fontFamily: 'var(--font-bricolage-grotesque)',
                  color: COLORS.blubeezBlue,
                }}
              >
                blubeez
              </div>
            </button>

            <button 
              onClick={handleLogoClick}
              className="md:hidden flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer" 
              style={{ marginLeft: '32px' }}
            >
              <div className="w-5 h-[15px] relative">
                <Image
                  src="/assets/logo-icon.svg"
                  alt="Blubeez Icon"
                  width={36}
                  height={28}
                  className="w-full h-full"
                />
              </div>
              <div
                className="text-[0.933rem] sm:text-[1.125rem] font-semibold leading-normal"
                style={{
                  fontFamily: 'var(--font-bricolage-grotesque)',
                  color: COLORS.blubeezBlue,
                }}
              >
                blubeez
              </div>
            </button>
          </div>

          {/* User Greeting */}
          <div className="flex items-center">
            <div
              className="text-[0.875rem] sm:text-[0.938rem] md:text-[1rem] lg:text-[1.125rem] font-normal"
              style={{
                fontFamily: 'var(--font-bricolage-grotesque)',
                color: COLORS.textQuaternary,
              }}
            >
              Hi! <span className="font-medium">{userName}</span>
            </div>
          </div>
        </div>
      </SignedIn>
    </div>
  );
}

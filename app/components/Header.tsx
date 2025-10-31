import Image from 'next/image';
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { COLORS } from '../constants/colors';

interface HeaderProps {
  sidebarExpanded?: boolean;
  sidebarCollapsedWidth?: number;
  sidebarExpandedWidth?: number;
}

export default function Header({
  sidebarExpanded = false,
  sidebarCollapsedWidth = 67,
  sidebarExpandedWidth = 240,
}: HeaderProps) {
  const sidebarGutter = 2;
  const currentSidebarWidth = sidebarExpanded ? sidebarExpandedWidth : sidebarCollapsedWidth;
  const desktopBrandLeft = currentSidebarWidth + sidebarGutter;

  return (
    <div className="w-full absolute left-0 top-0 z-20">
      <SignedOut>
        <div
          className="w-full px-2 md:pl-4 md:pr-14 py-4 backdrop-blur-sm flex justify-between items-center"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
        >
          <div className="flex items-center gap-1.5 md:gap-3">
            <div className="flex items-center gap-1 md:gap-2">
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
                className="text-[14.933px] md:text-2xl font-semibold leading-normal"
                style={{ fontFamily: 'var(--font-bricolage-grotesque)', color: COLORS.blubeezBlue }}
              >
                blubeez
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="px-6 py-1.5 rounded-3xl hover:bg-black/5 transition-colors cursor-pointer">
              <div
                className="text-base font-normal"
                style={{ fontFamily: 'var(--font-bricolage-grotesque)', color: COLORS.textTertiary }}
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
                  className="text-base font-normal"
                  style={{ fontFamily: 'var(--font-bricolage-grotesque)', color: COLORS.white }}
                >
                  Log in
                </div>
              </div>
            </SignInButton>

            <SignUpButton mode="modal">
              <div className="px-6 py-1.5 rounded-3xl hover:bg-black/5 transition-colors cursor-pointer">
                <div
                  className="text-base font-normal"
                  style={{ fontFamily: 'var(--font-bricolage-grotesque)', color: COLORS.textTertiary }}
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
                className="text-xs font-normal leading-normal"
                style={{ fontFamily: 'var(--font-bricolage-grotesque)', color: COLORS.white }}
              >
                Log in
              </div>
            </div>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <div
          className="w-full px-2 md:pl-4 md:pr-14 py-4 flex justify-between items-center"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(10px)' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="hidden md:flex items-center gap-2 transition-all duration-300"
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
                className="text-2xl font-semibold"
                style={{ fontFamily: 'var(--font-bricolage-grotesque)', color: COLORS.blubeezBlue }}
              >
                blubeez
              </div>
            </div>
            <div className="md:hidden flex items-center gap-1">
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
                className="text-[14.933px] font-semibold leading-normal"
                style={{ fontFamily: 'var(--font-bricolage-grotesque)', color: COLORS.blubeezBlue }}
              >
                blubeez
              </div>
            </div>
          </div>

          {/* Intentionally no desktop user actions here; sidebar handles auth UI */}
          <div />
        </div>
      </SignedIn>
    </div>
  );
}

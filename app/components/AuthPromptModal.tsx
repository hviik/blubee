'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { COLORS } from '../constants/colors';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthPromptModal({ isOpen, onClose }: AuthPromptModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

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
        className={`fixed z-50 rounded-2xl flex flex-col
          left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[343px] px-6 py-8 gap-6
          md:w-[450px] md:px-8 md:py-10 md:gap-8
          transition-all duration-500 ease-in-out ${
            isAnimating 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
        style={{ backgroundColor: COLORS.white }}
      >
        <div className="flex items-center justify-end w-full">
          <button 
            onClick={onClose}
            className="w-5 h-5 relative cursor-pointer hover:opacity-70 transition-opacity"
          >
            <Image src="/assets/close.svg" alt="Close" width={20} height={20} />
          </button>
        </div>

        <div className="flex flex-col gap-6 w-full items-center">
          <div className="flex flex-col gap-3 items-center text-center w-full">
            <p
              className="text-[1.75rem] md:text-[2rem] font-normal"
              style={{
                fontFamily: 'var(--font-bricolage-grotesque)',
                color: COLORS.blubeezBlue,
              }}
            >
              Sign in to continue
            </p>
            <p
              className="text-[0.875rem] md:text-[1rem] font-normal"
              style={{
                fontFamily: 'var(--font-poppins)',
                color: COLORS.textSecondary,
              }}
            >
              Please sign in or create an account to start chatting with blu
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <SignInButton mode="modal">
              <button
                className="w-full px-6 py-3 rounded-[32px] hover:bg-[#234080] transition-colors"
                style={{ backgroundColor: COLORS.blubeezNavy }}
              >
                <div
                  className="text-[1rem] md:text-[1.125rem] font-normal"
                  style={{
                    fontFamily: 'var(--font-bricolage-grotesque)',
                    color: COLORS.white,
                  }}
                >
                  Log in
                </div>
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button
                className="w-full px-6 py-3 rounded-[32px] hover:bg-black/5 transition-colors outline outline-1 outline-offset-[-1px]"
                style={{ 
                  backgroundColor: COLORS.white,
                  outlineColor: COLORS.borderMedium
                }}
              >
                <div
                  className="text-[1rem] md:text-[1.125rem] font-normal"
                  style={{
                    fontFamily: 'var(--font-bricolage-grotesque)',
                    color: COLORS.textTertiary,
                  }}
                >
                  Sign up
                </div>
              </button>
            </SignUpButton>
          </div>
        </div>
      </div>
    </>
  );
}


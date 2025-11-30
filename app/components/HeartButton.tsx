'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface HeartButtonProps {
  isLiked: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export default function HeartButton({ 
  isLiked, 
  onToggle, 
  size = 'md',
  className = '',
  disabled = false
}: HeartButtonProps) {
  const [showBurst, setShowBurst] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const lastTapRef = useRef<number>(0);
  const doubleTapTimeout = useRef<NodeJS.Timeout | null>(null);

  const sizeMap = {
    sm: { button: 'w-6 h-6', heart: 20, burst: 32 },
    md: { button: 'w-8 h-8', heart: 24, burst: 40 },
    lg: { button: 'w-10 h-10', heart: 32, burst: 52 },
  };

  const { button: buttonSize, heart: heartSize, burst: burstSize } = sizeMap[size];

  const triggerLikeAnimation = useCallback(() => {
    if (!isLiked) {
      setShowBurst(true);
      setIsAnimating(true);
      setTimeout(() => setShowBurst(false), 700);
      setTimeout(() => setIsAnimating(false), 400);
    }
  }, [isLiked]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (disabled) return;

    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    // Clear any pending single tap timeout
    if (doubleTapTimeout.current) {
      clearTimeout(doubleTapTimeout.current);
      doubleTapTimeout.current = null;
    }

    if (timeSinceLastTap < 300) {
      // Double tap detected
      lastTapRef.current = 0;
      triggerLikeAnimation();
      onToggle();
    } else {
      // Potential single tap - wait to confirm it's not a double tap
      lastTapRef.current = now;
      doubleTapTimeout.current = setTimeout(() => {
        triggerLikeAnimation();
        onToggle();
        doubleTapTimeout.current = null;
      }, 300);
    }
  }, [disabled, onToggle, triggerLikeAnimation]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (doubleTapTimeout.current) {
        clearTimeout(doubleTapTimeout.current);
      }
    };
  }, []);

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative flex items-center justify-center
        ${buttonSize}
        rounded-full
        bg-black/30 backdrop-blur-sm
        hover:bg-black/40
        transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{ WebkitTapHighlightColor: 'transparent' }}
      aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {/* Burst particles animation */}
      {showBurst && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ 
            width: burstSize, 
            height: burstSize,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-red-500"
              style={{
                left: '50%',
                top: '50%',
                animation: `burst-${i} 0.6s ease-out forwards`,
              }}
            />
          ))}
        </div>
      )}

      {/* Heart icon */}
      <svg
        width={heartSize}
        height={heartSize}
        viewBox="0 0 24 24"
        className={`
          transition-all duration-200
          ${isAnimating ? 'scale-125' : 'scale-100'}
        `}
        style={{
          filter: isLiked ? 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.5))' : 'none',
        }}
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill={isLiked ? '#ef4444' : 'transparent'}
          stroke={isLiked ? '#ef4444' : 'white'}
          strokeWidth="2"
          className={`
            transition-all duration-300
            ${isAnimating ? 'animate-heart-beat' : ''}
          `}
        />
      </svg>

      {/* Global styles for animations */}
      <style jsx>{`
        @keyframes burst-0 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(calc(-50% + 16px), calc(-50% - 16px)) scale(1); opacity: 0; }
        }
        @keyframes burst-1 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(calc(-50% + 20px), -50%) scale(1); opacity: 0; }
        }
        @keyframes burst-2 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(calc(-50% + 16px), calc(-50% + 16px)) scale(1); opacity: 0; }
        }
        @keyframes burst-3 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, calc(-50% + 20px)) scale(1); opacity: 0; }
        }
        @keyframes burst-4 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(calc(-50% - 16px), calc(-50% + 16px)) scale(1); opacity: 0; }
        }
        @keyframes burst-5 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(calc(-50% - 20px), -50%) scale(1); opacity: 0; }
        }
        @keyframes burst-6 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(calc(-50% - 16px), calc(-50% - 16px)) scale(1); opacity: 0; }
        }
        @keyframes burst-7 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, calc(-50% - 20px)) scale(1); opacity: 0; }
        }
        @keyframes heart-beat {
          0% { transform: scale(1); }
          25% { transform: scale(1.2); }
          50% { transform: scale(0.95); }
          75% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-heart-beat {
          animation: heart-beat 0.4s ease-in-out;
        }
      `}</style>
    </button>
  );
}

// DoubleTabHeartOverlay - Shows a big heart animation when double-tapping on the image
interface DoubleTabHeartOverlayProps {
  show: boolean;
}

export function DoubleTapHeartOverlay({ show }: DoubleTabHeartOverlayProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      <svg
        width="80"
        height="80"
        viewBox="0 0 24 24"
        className="animate-heart-pop"
        style={{
          filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))',
        }}
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="#ef4444"
          stroke="#ef4444"
          strokeWidth="1"
        />
      </svg>
      <style jsx>{`
        @keyframes heart-pop {
          0% { transform: scale(0); opacity: 0; }
          15% { transform: scale(1.3); opacity: 1; }
          30% { transform: scale(0.95); opacity: 1; }
          45% { transform: scale(1.1); opacity: 1; }
          70% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
        .animate-heart-pop {
          animation: heart-pop 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}


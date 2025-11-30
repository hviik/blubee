'use client';

import { useState, useCallback } from 'react';

interface HeartButtonProps {
  isLiked: boolean;
  onToggle: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export default function HeartButton({ 
  isLiked, 
  onToggle, 
  size = 'sm',
  className = '',
  disabled = false
}: HeartButtonProps) {
  const [showBurst, setShowBurst] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizeMap = {
    xs: { button: 'w-5 h-5', heart: 14, burst: 24 },
    sm: { button: 'w-6 h-6', heart: 16, burst: 28 },
    md: { button: 'w-7 h-7', heart: 18, burst: 32 },
    lg: { button: 'w-8 h-8', heart: 22, burst: 40 },
  };

  const { button: buttonSize, heart: heartSize, burst: burstSize } = sizeMap[size];

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (disabled) return;

    // Trigger animation when liking (not when unliking)
    if (!isLiked) {
      setShowBurst(true);
      setIsAnimating(true);
      setTimeout(() => setShowBurst(false), 600);
      setTimeout(() => setIsAnimating(false), 350);
    }

    // Immediately toggle - no delay!
    onToggle();
  }, [disabled, isLiked, onToggle]);

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative flex items-center justify-center
        ${buttonSize}
        rounded-full
        bg-black/40 backdrop-blur-sm
        hover:bg-black/50 active:scale-95
        transition-all duration-150
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{ WebkitTapHighlightColor: 'transparent' }}
      aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {/* Burst particles animation */}
      {showBurst && (
        <div 
          className="absolute pointer-events-none"
          style={{ 
            width: burstSize, 
            height: burstSize,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="absolute w-1 h-1 rounded-full bg-red-400"
              style={{
                left: '50%',
                top: '50%',
                animation: `burst-particle-${i} 0.5s ease-out forwards`,
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
        className={`transition-transform duration-150 ${isAnimating ? 'scale-110' : 'scale-100'}`}
        style={{
          filter: isLiked ? 'drop-shadow(0 0 3px rgba(239, 68, 68, 0.6))' : 'none',
        }}
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill={isLiked ? '#ef4444' : 'transparent'}
          stroke={isLiked ? '#ef4444' : 'white'}
          strokeWidth="2"
        />
      </svg>

      {/* Particle animation keyframes */}
      <style jsx>{`
        @keyframes burst-particle-0 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(calc(-50% + 12px), calc(-50% - 12px)) scale(1); opacity: 0; }
        }
        @keyframes burst-particle-1 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(calc(-50% + 14px), -50%) scale(1); opacity: 0; }
        }
        @keyframes burst-particle-2 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(calc(-50% + 12px), calc(-50% + 12px)) scale(1); opacity: 0; }
        }
        @keyframes burst-particle-3 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(calc(-50% - 12px), calc(-50% + 12px)) scale(1); opacity: 0; }
        }
        @keyframes burst-particle-4 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(calc(-50% - 14px), -50%) scale(1); opacity: 0; }
        }
        @keyframes burst-particle-5 {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(calc(-50% - 12px), calc(-50% - 12px)) scale(1); opacity: 0; }
        }
      `}</style>
    </button>
  );
}

// DoubleTapHeartOverlay - Shows a big heart animation when double-tapping on the image
interface DoubleTapHeartOverlayProps {
  show: boolean;
}

export function DoubleTapHeartOverlay({ show }: DoubleTapHeartOverlayProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        className="animate-heart-pop"
        style={{
          filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.7))',
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
          15% { transform: scale(1.2); opacity: 1; }
          30% { transform: scale(0.9); opacity: 1; }
          50% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
        .animate-heart-pop {
          animation: heart-pop 0.7s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

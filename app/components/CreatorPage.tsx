'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { SignUpButton } from '@clerk/nextjs';
import { COLORS } from '../constants/colors';

// Animated counter component
function AnimatedCounter({ 
  end, 
  duration = 2000, 
  suffix = '' 
}: { 
  end: number; 
  duration?: number; 
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const increment = end / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// Floating heart component
function FloatingHeart({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <div 
      className={`absolute animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path 
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
          fill="#FF6B6B"
        />
      </svg>
    </div>
  );
}

// Reward card component
function RewardCard({ 
  icon, 
  title, 
  description, 
  bgColor 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  bgColor: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-4 md:p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div 
        className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: bgColor }}
      >
        {icon}
      </div>
      <h3 
        className="text-lg md:text-xl font-semibold mb-2"
        style={{ 
          fontFamily: 'var(--font-bricolage-grotesque)',
          color: COLORS.blubeezDark 
        }}
      >
        {title}
      </h3>
      <p 
        className="text-sm md:text-base text-gray-600"
        style={{ fontFamily: 'var(--font-poppins)' }}
      >
        {description}
      </p>
    </div>
  );
}

// Dashboard card mockup
function DashboardCard({ 
  title, 
  value, 
  change, 
  isPositive = true 
}: { 
  title: string; 
  value: string; 
  change: string;
  isPositive?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-md min-w-[140px] md:min-w-[160px]">
      <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'var(--font-poppins)' }}>
        {title}
      </p>
      <p 
        className="text-xl md:text-2xl font-bold"
        style={{ 
          fontFamily: 'var(--font-bricolage-grotesque)',
          color: COLORS.blubeezDark 
        }}
      >
        {value}
      </p>
      <p 
        className={`text-xs mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}
        style={{ fontFamily: 'var(--font-poppins)' }}
      >
        {isPositive ? '↑' : '↓'} {change}
      </p>
    </div>
  );
}

export default function CreatorPage({ sidebarOffset = 0 }: { sidebarOffset?: number }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#f0f7ff] via-white to-[#f0f7ff] overflow-x-hidden"
      style={{ paddingLeft: sidebarOffset || 0 }}
    >
      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(60px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
      `}</style>

      {/* Header */}
      <header
        className="w-full px-4 md:px-8 lg:px-16 py-4 md:py-6 flex justify-between items-center fixed top-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
        style={{
          left: sidebarOffset || 0,
          width: sidebarOffset ? `calc(100% - ${sidebarOffset}px)` : '100%',
        }}
      >
        <div className="flex items-center gap-2">
          <Image
            src="/assets/logo-icon.svg"
            alt="Blubeez"
            width={32}
            height={25}
            className="w-6 h-5 md:w-8 md:h-6"
          />
          <span 
            className="text-lg md:text-xl font-semibold"
            style={{ 
              fontFamily: 'var(--font-bricolage-grotesque)',
              color: COLORS.blubeezBlue 
            }}
          >
            blubeez
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a 
            href="#" 
            className="text-sm hover:text-[#2d4e92] transition-colors"
            style={{ 
              fontFamily: 'var(--font-poppins)',
              color: COLORS.textSecondary 
            }}
          >
            Home
          </a>
          <a 
            href="#features" 
            className="text-sm hover:text-[#2d4e92] transition-colors"
            style={{ 
              fontFamily: 'var(--font-poppins)',
              color: COLORS.textSecondary 
            }}
          >
            Features
          </a>
          <a 
            href="#rewards" 
            className="text-sm hover:text-[#2d4e92] transition-colors"
            style={{ 
              fontFamily: 'var(--font-poppins)',
              color: COLORS.textSecondary 
            }}
          >
            Rewards
          </a>
        </nav>
        <SignUpButton mode="modal">
          <button 
            className="px-4 md:px-6 py-2 rounded-full text-sm font-medium text-white hover:opacity-90 transition-opacity"
            style={{ 
              backgroundColor: COLORS.blubeezNavy,
              fontFamily: 'var(--font-bricolage-grotesque)'
            }}
          >
            Join Now
          </button>
        </SignUpButton>
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 px-4 md:px-8 lg:px-16 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 md:w-64 md:h-64 rounded-full bg-blue-100/50 blur-3xl animate-pulse-slow" />
          <div className="absolute top-40 right-10 w-40 h-40 md:w-80 md:h-80 rounded-full bg-purple-100/40 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-1/3 w-24 h-24 md:w-48 md:h-48 rounded-full bg-pink-100/30 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        {/* Floating hearts */}
        <FloatingHeart className="top-32 left-[10%] hidden md:block" delay={0} />
        <FloatingHeart className="top-48 right-[15%] hidden md:block" delay={1.5} />
        <FloatingHeart className="top-64 left-[20%] hidden md:block" delay={3} />
        <FloatingHeart className="bottom-32 right-[25%] hidden md:block" delay={2} />

        <div className={`relative max-w-6xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          {/* Floating stat cards */}
          <div className="hidden lg:block absolute -left-8 top-20">
            <div className="bg-white rounded-2xl shadow-xl p-4 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Total Earnings</span>
              </div>
              <p className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>
                $<AnimatedCounter end={12450} />
              </p>
            </div>
          </div>

          <div className="hidden lg:block absolute -right-8 top-32">
            <div className="bg-white rounded-2xl shadow-xl p-4 transform rotate-6 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Followers</span>
              </div>
              <p className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>
                <AnimatedCounter end={8924} />
              </p>
            </div>
          </div>

          {/* Main headline */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span 
              className="text-xs md:text-sm"
              style={{ 
                fontFamily: 'var(--font-poppins)',
                color: COLORS.blubeezBlue 
              }}
            >
              Creator Program Now Open
            </span>
          </div>

          <h1 
            className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight"
            style={{ 
              fontFamily: 'var(--font-bricolage-grotesque)',
              color: COLORS.blubeezDark 
            }}
          >
            Explore. Inspire.{' '}
            <span className="relative inline-block">
              <span className="relative z-10">& Earn</span>
              <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12">
                <path d="M0 8 Q 100 0 200 8" stroke="#FFD700" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p 
            className="text-base md:text-lg lg:text-xl max-w-2xl mx-auto mb-8 leading-relaxed"
            style={{ 
              fontFamily: 'var(--font-poppins)',
              color: COLORS.textSecondary 
            }}
          >
            Turn your travel adventures into income. Share your stories, inspire travelers worldwide, and earn while doing what you love.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-base font-medium text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              style={{ 
                backgroundColor: COLORS.blubeezNavy,
                fontFamily: 'var(--font-bricolage-grotesque)'
              }}
            >
              Start Creating Today
            </button>
            <button 
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-base font-medium border-2 hover:bg-gray-50 transition-colors"
              style={{ 
                borderColor: COLORS.blubeezNavy,
                color: COLORS.blubeezNavy,
                fontFamily: 'var(--font-bricolage-grotesque)'
              }}
            >
              Watch Demo
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-8 mt-12 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: `hsl(${i * 60}, 70%, 70%)` }}
                  />
                ))}
              </div>
              <span 
                className="text-sm"
                style={{ 
                  fontFamily: 'var(--font-poppins)',
                  color: COLORS.textSecondary 
                }}
              >
                <strong className="text-gray-800">2,500+</strong> creators joined
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#FFD700">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
              <span 
                className="text-sm ml-1"
                style={{ 
                  fontFamily: 'var(--font-poppins)',
                  color: COLORS.textSecondary 
                }}
              >
                4.9/5 rating
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <span 
              className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-sm mb-4"
              style={{ 
                fontFamily: 'var(--font-poppins)',
                color: COLORS.blubeezBlue 
              }}
            >
              How It Works
            </span>
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              style={{ 
                fontFamily: 'var(--font-bricolage-grotesque)',
                color: COLORS.blubeezDark 
              }}
            >
              Become a Travel Storyteller<br className="hidden md:block" />
              <span style={{ color: COLORS.blubeezBlue }}> & Get Paid!</span>
            </h2>
            <p 
              className="text-base md:text-lg max-w-2xl mx-auto"
              style={{ 
                fontFamily: 'var(--font-poppins)',
                color: COLORS.textSecondary 
              }}
            >
              Join thousands of creators who are turning their travel experiences into a sustainable income stream.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                1
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 pt-10 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full border border-blue-100">
                <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2d4e92" strokeWidth="2">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <h3 
                  className="text-xl font-semibold mb-2"
                  style={{ 
                    fontFamily: 'var(--font-bricolage-grotesque)',
                    color: COLORS.blubeezDark 
                  }}
                >
                  Create Content
                </h3>
                <p 
                  className="text-sm"
                  style={{ 
                    fontFamily: 'var(--font-poppins)',
                    color: COLORS.textSecondary 
                  }}
                >
                  Share your travel stories, tips, itineraries, and hidden gems. Create authentic content that inspires others.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                2
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 pt-10 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full border border-purple-100">
                <div className="w-16 h-16 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 
                  className="text-xl font-semibold mb-2"
                  style={{ 
                    fontFamily: 'var(--font-bricolage-grotesque)',
                    color: COLORS.blubeezDark 
                  }}
                >
                  Build Community
                </h3>
                <p 
                  className="text-sm"
                  style={{ 
                    fontFamily: 'var(--font-poppins)',
                    color: COLORS.textSecondary 
                  }}
                >
                  Connect with fellow travelers and grow your audience. Engage with a community that shares your passion.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                3
              </div>
              <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 pt-10 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full border border-green-100">
                <div className="w-16 h-16 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <h3 
                  className="text-xl font-semibold mb-2"
                  style={{ 
                    fontFamily: 'var(--font-bricolage-grotesque)',
                    color: COLORS.blubeezDark 
                  }}
                >
                  Earn Rewards
                </h3>
                <p 
                  className="text-sm"
                  style={{ 
                    fontFamily: 'var(--font-poppins)',
                    color: COLORS.textSecondary 
                  }}
                >
                  Get paid for your influence. Earn through bookings, referrals, tips, and exclusive brand partnerships.
                </p>
              </div>
            </div>
          </div>

          {/* Phone mockups section */}
          <div className="mt-16 md:mt-24 relative">
            <div className="flex justify-center items-end gap-4 md:gap-8">
              {/* Left phone */}
              <div className="hidden md:block relative w-48 lg:w-56 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gray-900 rounded-[2rem] p-2 shadow-2xl">
                  <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-[1.5rem] aspect-[9/19] flex items-center justify-center">
                    <div className="text-center text-white p-4">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium">Share Locations</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center phone (main) */}
              <div className="relative w-56 md:w-64 lg:w-72 transform hover:scale-105 transition-transform duration-500 z-10">
                <div className="bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
                  <div className="bg-gradient-to-br from-[#2d4e92] to-[#132341] rounded-[2rem] aspect-[9/19] overflow-hidden">
                    <div className="h-full flex flex-col">
                      <div className="bg-black/20 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white/20" />
                          <div>
                            <p className="text-white text-xs font-medium">Your Dashboard</p>
                            <p className="text-white/60 text-[10px]">Creator Hub</p>
                          </div>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-white/20" />
                      </div>
                      <div className="flex-1 p-4 space-y-3">
                        <div className="bg-white/10 rounded-xl p-3">
                          <p className="text-white/60 text-[10px]">Total Earnings</p>
                          <p className="text-white text-lg font-bold">$2,847.50</p>
                          <p className="text-green-400 text-[10px]">↑ 23% this month</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white/10 rounded-xl p-2">
                            <p className="text-white/60 text-[10px]">Views</p>
                            <p className="text-white text-sm font-bold">45.2K</p>
                          </div>
                          <div className="bg-white/10 rounded-xl p-2">
                            <p className="text-white/60 text-[10px]">Followers</p>
                            <p className="text-white text-sm font-bold">1,234</p>
                          </div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3">
                          <p className="text-white/60 text-[10px] mb-2">Recent Activity</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-green-400/20" />
                              <p className="text-white text-[10px]">New booking: +$45</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-400/20" />
                              <p className="text-white text-[10px]">Tip received: +$10</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right phone */}
              <div className="hidden md:block relative w-48 lg:w-56 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gray-900 rounded-[2rem] p-2 shadow-2xl">
                  <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-[1.5rem] aspect-[9/19] flex items-center justify-center">
                    <div className="text-center text-white p-4">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium">Get Tips</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              style={{ 
                fontFamily: 'var(--font-bricolage-grotesque)',
                color: COLORS.blubeezDark 
              }}
            >
              Your Creator Dashboard
            </h2>
            <p 
              className="text-base md:text-lg max-w-2xl mx-auto"
              style={{ 
                fontFamily: 'var(--font-poppins)',
                color: COLORS.textSecondary 
              }}
            >
              Track your earnings, monitor growth, and manage your content all in one place.
            </p>
          </div>

          {/* Dashboard mockup */}
          <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Browser bar */}
            <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white rounded-full px-4 py-1 text-xs text-gray-500 border border-gray-200">
                  blubeez.com/creator/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-4 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                <DashboardCard title="Total Earnings" value="$12,450" change="23% vs last month" isPositive />
                <DashboardCard title="This Month" value="$2,847" change="15% vs last month" isPositive />
                <DashboardCard title="Total Views" value="125.4K" change="8% vs last month" isPositive />
                <DashboardCard title="Followers" value="8,924" change="12% vs last month" isPositive />
              </div>

              {/* Chart placeholder */}
              <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 
                    className="text-sm md:text-base font-semibold"
                    style={{ 
                      fontFamily: 'var(--font-bricolage-grotesque)',
                      color: COLORS.blubeezDark 
                    }}
                  >
                    Earnings Overview
                  </h4>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs">Monthly</span>
                    <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-500 text-xs">Weekly</span>
                  </div>
                </div>
                {/* Chart bars */}
                <div className="flex items-end justify-between gap-2 h-32 md:h-40">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full rounded-t-sm transition-all duration-500 hover:opacity-80"
                        style={{ 
                          height: `${height}%`,
                          backgroundColor: i === 11 ? COLORS.blubeezBlue : '#E2E8F0'
                        }}
                      />
                      <span className="text-[8px] md:text-[10px] text-gray-400">
                        {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section id="rewards" className="py-16 md:py-24 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <span 
              className="inline-block px-4 py-1.5 rounded-full bg-green-50 text-sm mb-4"
              style={{ 
                fontFamily: 'var(--font-poppins)',
                color: '#22C55E' 
              }}
            >
              Earn More
            </span>
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              style={{ 
                fontFamily: 'var(--font-bricolage-grotesque)',
                color: COLORS.blubeezDark 
              }}
            >
              Monetise Your Expertise<br className="hidden md:block" />
              <span style={{ color: COLORS.blubeezBlue }}> & Influence</span>
            </h2>
            <p 
              className="text-base md:text-lg max-w-2xl mx-auto"
              style={{ 
                fontFamily: 'var(--font-poppins)',
                color: COLORS.textSecondary 
              }}
            >
              Multiple ways to earn from your travel content and recommendations.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <RewardCard
              icon={
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
                </svg>
              }
              title="Booking Commission"
              description="Earn up to 15% on every booking made through your recommendations."
              bgColor="#DBEAFE"
            />
            <RewardCard
              icon={
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
              title="Tips & Donations"
              description="Receive tips directly from travelers who love your content."
              bgColor="#DCFCE7"
            />
            <RewardCard
              icon={
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
              title="Referral Bonus"
              description="Get rewarded when new creators join through your invite."
              bgColor="#FEF3C7"
            />
            <RewardCard
              icon={
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              }
              title="Brand Partnerships"
              description="Collaborate with travel brands for sponsored opportunities."
              bgColor="#EDE9FE"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div 
            className="relative rounded-3xl overflow-hidden p-8 md:p-12 lg:p-16 text-center"
            style={{ backgroundColor: COLORS.blubeezBlue }}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            <div className="relative z-10">
              <h2 
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
              >
                Join the Journey.<br />Get Rewarded.
              </h2>
              <p 
                className="text-white/80 mb-8 max-w-lg mx-auto"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                Be among the first creators to join our exclusive program. Limited spots available.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-base font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  style={{ 
                    color: COLORS.blubeezBlue,
                    fontFamily: 'var(--font-bricolage-grotesque)'
                  }}
                >
                  Join the Waitlist
                </button>
                <button 
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full text-base font-medium border-2 border-white/30 text-white hover:bg-white/10 transition-colors"
                  style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 px-4 md:px-8 lg:px-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Image
                src="/assets/logo-icon.svg"
                alt="Blubeez"
                width={32}
                height={25}
              />
              <span 
                className="text-xl font-semibold"
                style={{ 
                  fontFamily: 'var(--font-bricolage-grotesque)',
                  color: COLORS.blubeezBlue 
                }}
              >
                blubeez
              </span>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-4">
              {['twitter', 'instagram', 'youtube', 'tiktok'].map((social) => (
                <a 
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 hover:border-gray-300 transition-colors"
                >
                  <span className="text-gray-500 text-sm capitalize">{social[0].toUpperCase()}</span>
                </a>
              ))}
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              <a 
                href="#" 
                className="text-sm hover:text-[#2d4e92] transition-colors"
                style={{ 
                  fontFamily: 'var(--font-poppins)',
                  color: COLORS.textSecondary 
                }}
              >
                Privacy
              </a>
              <a 
                href="#" 
                className="text-sm hover:text-[#2d4e92] transition-colors"
                style={{ 
                  fontFamily: 'var(--font-poppins)',
                  color: COLORS.textSecondary 
                }}
              >
                Terms
              </a>
              <a 
                href="#" 
                className="text-sm hover:text-[#2d4e92] transition-colors"
                style={{ 
                  fontFamily: 'var(--font-poppins)',
                  color: COLORS.textSecondary 
                }}
              >
                Contact
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p 
              className="text-sm"
              style={{ 
                fontFamily: 'var(--font-poppins)',
                color: COLORS.textSecondary 
              }}
            >
              © 2026 Blubeez. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}


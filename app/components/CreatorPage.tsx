'use client';

import Image from 'next/image';
import { SignUpButton } from '@clerk/nextjs';
import { COLORS } from '../constants/colors';

interface CreatorPageProps {
  sidebarOffset?: number;
}

export default function CreatorPage({ sidebarOffset = 0 }: CreatorPageProps) {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header 
        className="w-full px-4 md:px-14 py-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm"
        style={{ paddingLeft: sidebarOffset > 0 ? `${sidebarOffset + 16}px` : undefined }}
      >
        <div className="flex items-center gap-2">
          <Image
            src="/assets/logo-icon.svg"
            alt="Blubeez"
            width={35}
            height={30}
            className="w-[20px] h-[17px] md:w-[35px] md:h-[30px]"
          />
          <span 
            className="text-[15px] md:text-xl font-semibold"
            style={{ 
              fontFamily: 'var(--font-bricolage-grotesque)',
              color: COLORS.blubeezBlue 
            }}
          >
            blubeez
          </span>
        </div>
        <SignUpButton mode="modal">
          <button 
            className="px-5 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium text-white hover:opacity-90 transition-opacity"
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
      <section className="relative pt-16 md:pt-[63px]">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-[#f0f7ff] pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row min-h-[calc(100vh-63px)] md:min-h-[867px]">
          {/* Left Content */}
          <div 
            className="flex-1 flex flex-col justify-center px-4 md:px-14 py-8 md:py-0 z-10"
            style={{ paddingLeft: sidebarOffset > 0 ? `${sidebarOffset + 16}px` : undefined }}
          >
            <div className="max-w-[405px]">
              <h1 
                className="text-[40px] md:text-[72px] font-bold leading-[1.1] mb-4 md:mb-6"
                style={{ 
                  fontFamily: 'var(--font-bricolage-grotesque)',
                  color: COLORS.blubeezBlue 
                }}
              >
                Explore.<br />
                Inspire.<br />
                <span style={{ color: COLORS.blubeezNavy }}>& Earn</span>
              </h1>
              <p 
                className="text-sm md:text-base leading-relaxed mb-6 md:mb-8 text-[#475f73]"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                Love travelling and sharing your experiences with others?<br className="hidden md:block" />
                Turn your favourite journeys into Income. Join blubeez and start earning from your travel adventures!
              </p>
              <SignUpButton mode="modal">
                <button 
                  className="px-6 md:px-8 py-3 md:py-3.5 rounded-full text-sm md:text-base font-medium text-white hover:opacity-90 transition-opacity"
                  style={{ 
                    backgroundColor: COLORS.blubeezNavy,
                    fontFamily: 'var(--font-bricolage-grotesque)'
                  }}
                >
                  Join Now
                </button>
              </SignUpButton>
            </div>
          </div>

          {/* Right Hero Image */}
          <div className="relative flex-1 min-h-[300px] md:min-h-full">
            {/* Hero Image Container */}
            <div className="absolute inset-0 md:right-0 md:top-0 md:bottom-0 md:w-[60%] overflow-hidden">
              <div 
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ 
                  backgroundImage: 'url(/assets/destinations/bali.jpg)',
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 15% 100%)'
                }}
              />
            </div>

            {/* Floating Social Stats */}
            <div className="absolute top-[20%] right-[15%] hidden md:flex flex-col gap-3">
              {/* Comments Counter */}
              <div className="bg-white rounded-2xl shadow-lg px-4 py-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#2d4e92]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/>
                </svg>
                <span className="font-bold text-lg text-[#132341]" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>248</span>
              </div>
              
              {/* Followers Counter */}
              <div className="bg-white rounded-2xl shadow-lg px-4 py-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#2d4e92]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                <span className="font-bold text-lg text-[#132341]" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>1.2K</span>
              </div>
              
              {/* Likes Counter */}
              <div className="bg-white rounded-2xl shadow-lg px-4 py-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#FF6B6B]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span className="font-bold text-lg text-[#132341]" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>3.4K</span>
              </div>
            </div>

            {/* Floating Hearts */}
            <div className="absolute bottom-[30%] right-[8%] hidden md:flex flex-col items-end gap-2">
              {[24, 18, 14, 8, 6].map((size, i) => (
                <svg 
                  key={i} 
                  className="text-[#FF6B6B] animate-pulse" 
                  style={{ 
                    width: size, 
                    height: size,
                    animationDelay: `${i * 0.3}s`,
                    marginRight: `${i * 8}px`
                  }} 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              ))}
            </div>

            {/* Comment Bubble */}
            <div className="absolute top-[45%] right-[25%] hidden md:block">
              <div className="bg-white rounded-full px-4 py-2 shadow-lg text-sm text-[#475f73]" style={{ fontFamily: 'var(--font-poppins)' }}>
                I want to go there! 🌴
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Become a Travel Storyteller */}
      <section className="py-12 md:py-20 px-4 md:px-14 bg-white" style={{ paddingLeft: sidebarOffset > 0 ? `${sidebarOffset + 16}px` : undefined }}>
        <div className="max-w-[1328px] mx-auto">
          {/* Section Header */}
          <div className="mb-8 md:mb-12">
            <h2 
              className="text-[28px] md:text-[48px] font-bold leading-tight mb-4"
              style={{ 
                fontFamily: 'var(--font-bricolage-grotesque)',
                color: COLORS.blubeezBlue 
              }}
            >
              Become a Travel<br />
              Storyteller & Get Paid!
            </h2>
            <p 
              className="text-sm md:text-base text-[#475f73] max-w-[793px]"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              <span className="font-semibold">Transform Inspiration into Interactive Planning & Go beyond simple recommendations.</span>
              <br />
              Get blubeez guides are powerful storefronts to personalized travel creation.
            </p>
          </div>

          {/* Description and Features */}
          <div className="mb-8 md:mb-12">
            <p 
              className="text-sm md:text-base text-[#475f73] mb-8 max-w-[724px]"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              When you share your guides or favorite destinations, you give your audience the ultimate travel toolkit, allowing them to:
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {[
                { icon: '💬', title: 'Get Instant answers', desc: 'Any AI-driven assistant that can answer travel questions - any time, anywhere!' },
                { icon: '✈️', title: 'Customize the Journey', desc: 'Travelers can adapt your tips for their preferences, creating customized trips' },
                { icon: '🤝', title: 'Collaborate Seamlessly', desc: 'Use your guides for immersive trip co-planning with friends and friends easily' },
                { icon: '📍', title: 'Source their spots', desc: 'Save places, accommodations, sites without creating a map for countless guiders' },
                { icon: '📅', title: 'Curate their journey', desc: 'Study, plan and organize the specific places you recommend with ease' },
                { icon: '🌐', title: 'Stay Connected', desc: 'Guide your travelers via their own view of a personalized travel all-in-one' },
              ].map((feature, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <span className="text-2xl md:text-3xl">{feature.icon}</span>
                  <h3 
                    className="text-sm md:text-base font-semibold text-[#132341]"
                    style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
                  >
                    {feature.title}
                  </h3>
                  <p 
                    className="text-xs md:text-sm text-[#6c7f8f]"
                    style={{ fontFamily: 'var(--font-poppins)' }}
                  >
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Monetise Your Expertise */}
      <section className="py-12 md:py-20 px-4 md:px-14 bg-[#f8fafc]" style={{ paddingLeft: sidebarOffset > 0 ? `${sidebarOffset + 16}px` : undefined }}>
        <div className="max-w-[1328px] mx-auto">
          <div className="flex flex-col md:flex-row gap-8 md:gap-16">
            {/* Left: Dashboard Mockup */}
            <div className="flex-1 relative min-h-[300px] md:min-h-[413px]">
              {/* Dashboard Card */}
              <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 max-w-[400px]">
                {/* Dashboard Header */}
                <div className="flex items-center gap-2 mb-4">
                  <Image src="/assets/logo-icon.svg" alt="Blubeez" width={18} height={15} />
                  <span className="text-xs font-medium text-[#475f73]">Dashboard</span>
                </div>
                
                {/* User Info & Earnings */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                    <div>
                      <p className="text-sm font-semibold text-[#132341]">Sarah Johnson</p>
                      <div className="w-20 h-1.5 bg-[#e8f0f8] rounded-full mt-1" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#6c7f8f]">Total Earnings</p>
                    <p className="text-lg font-bold text-[#132341]">$2,847</p>
                    <div className="w-24 h-1.5 bg-green-200 rounded-full mt-1" />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 text-xs text-[#6c7f8f] mb-4">
                  <div>
                    <p className="font-semibold text-[#132341]">125K</p>
                    <div className="w-10 h-1 bg-[#e8f0f8] rounded-full mt-1" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#132341]">$450/mo</p>
                    <div className="w-10 h-1 bg-[#e8f0f8] rounded-full mt-1" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#132341]">89%</p>
                    <div className="w-10 h-1 bg-[#e8f0f8] rounded-full mt-1" />
                  </div>
                </div>

                {/* Graph placeholder */}
                <div className="h-16 flex items-end gap-2">
                  {[40, 65, 45, 80].map((h, i) => (
                    <div key={i} className="flex-1 bg-[#e8f0f8] rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>

              {/* Floating Trip Cards */}
              <div className="absolute -top-4 -right-4 md:top-4 md:right-0 w-20 md:w-24 bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="h-16 bg-gradient-to-br from-orange-400 to-pink-500" />
                <div className="p-2">
                  <p className="text-[8px] font-bold text-[#132341]">$299</p>
                  <p className="text-[6px] text-[#6c7f8f]">Bali Trip</p>
                </div>
              </div>
              
              <div className="absolute bottom-0 -right-2 md:bottom-8 md:right-8 w-16 md:w-20 bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="h-12 bg-gradient-to-br from-blue-400 to-teal-500" />
                <div className="p-1.5">
                  <p className="text-[7px] font-bold text-[#132341]">$199</p>
                  <p className="text-[5px] text-[#6c7f8f]">Japan</p>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div className="flex-1">
              <h2 
                className="text-[28px] md:text-[48px] font-bold leading-tight mb-4 text-right md:text-left"
                style={{ 
                  fontFamily: 'var(--font-bricolage-grotesque)',
                  color: COLORS.blubeezBlue 
                }}
              >
                Monetise Your<br />
                Expertise &<br />
                Influence
              </h2>
              <p 
                className="text-sm md:text-base text-[#475f73] mb-6"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                Your travel knowledge is valuable. With blubeez, you turn your shared expertise into direct income streams and deep audience connection.
              </p>
              <p 
                className="text-xs md:text-sm text-[#6c7f8f] mb-6"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                Here&apos;s how you get rewarded for your content & community building:
              </p>

              {/* Rewards Grid */}
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {[
                  { title: 'Generate Sign-up Revenue', desc: 'Receive a commission every time your audience signs up through your guide' },
                  { title: 'Receive Direct Support', desc: 'Your loyal followers can show appreciation through direct tips for your guidance' },
                  { title: 'Secure Booking Commissions', desc: 'Earn a percentage when your followers book accommodations based on your recommendations' },
                  { title: 'Boost Affiliate Sales', desc: 'Generate buildup profile to enhance customized travel merchandise or other sales' },
                ].map((reward, i) => (
                  <div key={i}>
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-[#2d4e92]/10 flex items-center justify-center mb-2 md:mb-3">
                      {i === 0 && <span className="text-sm md:text-lg">💰</span>}
                      {i === 1 && <span className="text-sm md:text-lg">❤️</span>}
                      {i === 2 && <span className="text-sm md:text-lg">🏨</span>}
                      {i === 3 && <span className="text-sm md:text-lg">🌐</span>}
                    </div>
                    <h3 
                      className="text-xs md:text-sm font-semibold text-[#132341] mb-1"
                      style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
                    >
                      {reward.title}
                    </h3>
                    <p 
                      className="text-[10px] md:text-xs text-[#6c7f8f]"
                      style={{ fontFamily: 'var(--font-poppins)' }}
                    >
                      {reward.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-12 md:py-16 px-4 md:px-14 text-center"
        style={{ backgroundColor: COLORS.blubeezNavy }}
      >
        <h2 
          className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4"
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Join the Journey. Get Rewarded.
        </h2>
        <p 
          className="text-sm md:text-base text-white/80 mb-6 md:mb-8"
          style={{ fontFamily: 'var(--font-poppins)' }}
        >
          Your experiences deserve more than memories.
        </p>
        <SignUpButton mode="modal">
          <button 
            className="px-8 py-3 rounded-full bg-white text-sm md:text-base font-medium hover:bg-gray-100 transition-colors"
            style={{ 
              color: COLORS.blubeezNavy,
              fontFamily: 'var(--font-bricolage-grotesque)'
            }}
          >
            Join Now
          </button>
        </SignUpButton>
      </section>

      {/* Footer */}
      <footer className="py-10 md:py-16 px-4 md:px-14 bg-white" style={{ paddingLeft: sidebarOffset > 0 ? `${sidebarOffset + 16}px` : undefined }}>
        <div className="max-w-[1328px] mx-auto">
          {/* Top Row */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Image
                src="/assets/logo-icon.svg"
                alt="Blubeez"
                width={77}
                height={66}
                className="w-10 h-9 md:w-[77px] md:h-[66px]"
              />
              <span 
                className="text-2xl md:text-4xl font-semibold"
                style={{ 
                  fontFamily: 'var(--font-bricolage-grotesque)',
                  color: COLORS.blubeezBlue 
                }}
              >
                blubeez
              </span>
            </div>

            {/* Social Links */}
            <div className="flex flex-col items-center md:items-end gap-2">
              <span className="text-xs text-[#6c7f8f]" style={{ fontFamily: 'var(--font-poppins)' }}>FOLLOW US</span>
              <div className="flex gap-4">
                {['instagram', 'facebook', 'linkedin', 'x'].map((social) => (
                  <a 
                    key={social}
                    href="#"
                    className="w-7 h-7 rounded-full bg-[#f0f7ff] flex items-center justify-center hover:bg-[#e0efff] transition-colors"
                  >
                    <span className="text-[#2d4e92] text-xs font-medium">
                      {social === 'instagram' && '📷'}
                      {social === 'facebook' && '📘'}
                      {social === 'linkedin' && '💼'}
                      {social === 'x' && '𝕏'}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#e8f0f8] mb-6" />

          {/* Bottom Row */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-xs text-[#6c7f8f]" style={{ fontFamily: 'var(--font-poppins)' }}>
            <span>© 2026 Blubeez</span>
            <span className="hidden md:inline">|</span>
            <a href="#" className="hover:text-[#2d4e92]">Privacy Policy</a>
            <span className="hidden md:inline">|</span>
            <a href="#" className="hover:text-[#2d4e92]">Terms and Conditions</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

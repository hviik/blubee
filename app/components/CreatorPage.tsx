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
        className="w-full px-4 md:px-14 py-3 md:py-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm"
        style={{ paddingLeft: sidebarOffset > 0 ? `${sidebarOffset + 16}px` : undefined }}
      >
        <div className="flex items-center gap-2">
          <Image
            src="/assets/logo-icon.svg"
            alt="Blubeez"
            width={35}
            height={30}
            className="w-5 h-[17px] md:w-[35px] md:h-[30px]"
          />
          <span 
            className="text-base md:text-xl font-semibold"
            style={{ 
              fontFamily: 'var(--font-bricolage-grotesque)',
              color: COLORS.blubeezBlue 
            }}
          >
            blubeez
          </span>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <span className="hidden md:inline text-sm font-medium text-[#475f73]" style={{ fontFamily: 'var(--font-poppins)' }}>Creators</span>
          <span className="hidden md:inline text-sm font-medium text-[#475f73]" style={{ fontFamily: 'var(--font-poppins)' }}>Explore</span>
          <SignUpButton mode="modal">
            <button 
              className="px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium text-white hover:opacity-90 transition-opacity"
              style={{ 
                backgroundColor: COLORS.blubeezNavy,
                fontFamily: 'var(--font-bricolage-grotesque)'
              }}
            >
              Log In
            </button>
          </SignUpButton>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-14 md:pt-16">
        {/* Background image layer */}
        <div className="absolute inset-0">
          <Image
            src="/assets/creator/hero-bg.png"
            alt="Creators hero background"
            fill
            className="object-cover object-center"
            priority
          />
          <Image
            src="/assets/creator/hero-bg-overlay.png"
            alt=""
            fill
            className="object-cover object-center opacity-30"
            priority
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white" />
        </div>

        <div className="relative min-h-[calc(100vh-56px)] md:min-h-[600px] lg:min-h-[700px] flex flex-col md:flex-row">
          {/* Left Content */}
          <div 
            className="relative z-10 flex-1 flex flex-col justify-center px-4 md:px-14 py-8 md:py-12"
            style={{ paddingLeft: sidebarOffset > 0 ? `${sidebarOffset + 16}px` : undefined }}
          >
            <div className="max-w-[320px] md:max-w-[400px]">
              <h1 
                className="text-[36px] md:text-[56px] lg:text-[72px] font-bold leading-[1.05] mb-4 md:mb-6"
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
                className="text-xs md:text-sm leading-relaxed mb-5 md:mb-6 text-[#475f73]"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                Love travelling and sharing your experiences with others?<br className="hidden md:block" />
                Turn your favourite journeys into Income. Join blubeez and start earning from your travel adventures!
              </p>
              <SignUpButton mode="modal">
                <button 
                  className="px-5 md:px-7 py-2.5 md:py-3 rounded-full text-sm font-medium text-white hover:opacity-90 transition-opacity"
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

          {/* Right Hero Overlay */}
          <div className="relative flex-1 min-h-[280px] md:min-h-full">
            {/* Floating Social Stats - Desktop only */}
            <div className="absolute top-[18%] right-[14%] hidden md:flex flex-col gap-3">
              <div className="relative w-[74px] h-[60px]">
                <Image src="/assets/creator/comments-bubble.svg" alt="Comments" fill />
                <Image src="/assets/creator/comments-icon.svg" alt="" width={16} height={16} className="absolute left-[10px] top-[12px]" />
                <span className="absolute right-[10px] top-[12px] text-[14px] text-white" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>
                  99K
                </span>
              </div>
              <div className="relative w-[64px] h-[44px]">
                <Image src="/assets/creator/followers-bubble.svg" alt="Followers" fill />
                <Image src="/assets/creator/followers-icon.svg" alt="" width={8} height={8} className="absolute left-[16px] top-[12px]" />
                <Image src="/assets/creator/followers-line.svg" alt="" width={14} height={5} className="absolute left-[13px] top-[20px]" />
                <span className="absolute right-[10px] top-[10px] text-[14px] text-white" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>
                  2k
                </span>
              </div>
              <div className="relative w-[74px] h-[60px]">
                <Image src="/assets/creator/likes-bubble.svg" alt="Likes" fill />
                <Image src="/assets/creator/likes-icon.svg" alt="" width={16} height={16} className="absolute left-[12px] top-[12px]" />
                <span className="absolute right-[12px] top-[12px] text-[14px] text-white" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>
                  55
                </span>
              </div>
            </div>

            {/* Comment Bubble - Desktop only */}
            <div className="absolute top-[42%] right-[22%] hidden md:block">
              <div className="bg-white rounded-full px-3 py-1.5 shadow-lg text-xs text-[#475f73]" style={{ fontFamily: 'var(--font-poppins)' }}>
                Perfect itinerary!
              </div>
            </div>

            {/* Floating Hearts - Desktop only */}
            <div className="absolute bottom-[24%] right-[6%] hidden md:flex flex-col items-end gap-1.5">
              {[
                { src: '/assets/creator/heart-1.svg', size: 22, offset: 0 },
                { src: '/assets/creator/heart-2.svg', size: 16, offset: 6 },
                { src: '/assets/creator/heart-3.svg', size: 12, offset: 12 },
                { src: '/assets/creator/heart-4.svg', size: 8, offset: 16 },
                { src: '/assets/creator/heart-5.svg', size: 6, offset: 20 },
              ].map((heart, i) => (
                <Image
                  key={heart.src}
                  src={heart.src}
                  alt=""
                  width={heart.size}
                  height={heart.size}
                  className="animate-pulse"
                  style={{ marginRight: `${heart.offset}px`, animationDelay: `${i * 0.25}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Become a Travel Storyteller */}
      <section 
        className="py-10 md:py-16 lg:py-20 px-4 md:px-14 bg-white"
        style={{ paddingLeft: sidebarOffset > 0 ? `${sidebarOffset + 16}px` : undefined }}
      >
        <div className="max-w-[1328px] mx-auto">
          {/* Two Column Layout */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16 mb-8 md:mb-12">
            {/* Left: Text Content */}
            <div className="flex-1">
              <h2 
                className="text-[24px] md:text-[32px] lg:text-[40px] font-bold leading-tight mb-3 md:mb-4"
                style={{ 
                  fontFamily: 'var(--font-bricolage-grotesque)',
                  color: COLORS.blubeezBlue 
                }}
              >
                Become a Travel<br />
                Storyteller & Get Paid!
              </h2>
              <h3 
                className="text-[14px] md:text-[16px] lg:text-[18px] font-semibold text-[#132341] mb-2"
                style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
              >
                Turn inspiration into interactive planning,<br className="hidden md:block" />
                go beyond recommendations
              </h3>
              <p 
                className="text-xs md:text-sm text-[#6c7f8f] mb-4"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                Get blubeez guides are powerful storefronts for personalized travel creation.
              </p>
              <p 
                className="text-xs md:text-sm text-[#475f73] max-w-[450px]"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                When you share your guides or favorite destinations, you give your audience the ultimate travel toolkit, allowing them to:
              </p>
            </div>

            {/* Right: Phone Mockups - Desktop only */}
            <div className="hidden md:flex flex-1 justify-center items-center relative min-h-[300px]">
              <div className="relative w-full max-w-[520px] h-[360px]">
                <div className="absolute left-0 top-10 w-[190px] h-[310px] rotate-[-6deg] shadow-[0_0_30px_rgba(0,0,0,0.25)] rounded-[16px] overflow-hidden">
                  <Image src="/assets/creator/phone-left.png" alt="Creator preview left" fill className="object-cover" />
                </div>
                <div className="absolute right-0 top-10 w-[190px] h-[310px] rotate-[6deg] shadow-[0_0_30px_rgba(0,0,0,0.25)] rounded-[16px] overflow-hidden">
                  <Image src="/assets/creator/phone-right.png" alt="Creator preview right" fill className="object-cover" />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[210px] h-[330px] shadow-[0_0_50px_rgba(0,0,0,0.4)] rounded-[18px] overflow-hidden z-10">
                  <Image src="/assets/creator/phone-center.png" alt="Creator preview center" fill className="object-cover" />
                </div>
                <div className="absolute left-[10px] top-[80px] w-[50px] h-[40px] rotate-[-12deg]">
                  <Image src="/assets/creator/like-left.svg" alt="" fill />
                </div>
                <div className="absolute right-[20px] top-[10px] w-[48px] h-[38px] rotate-[10deg]">
                  <Image src="/assets/creator/like-right.svg" alt="" fill />
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {[
              { icon: '💬', title: 'Get instant answers', desc: 'Ask our AI Chat Assistant link anything about your recommendations for quick, contextual insights.' },
              { icon: '✈️', title: 'Customize the itinerary', desc: 'Effortlessly adapt your trip plans and routes to perfectly match their personal needs and style.' },
              { icon: '🤝', title: 'Collaborate seamlessly', desc: 'Use your guides as a foundation for co-planning adventures with friends and family.' },
              { icon: '📍', title: 'Secure their spots', desc: 'Book places, accommodations, and unique experiences directly from your curated guides.' },
              { icon: '📅', title: 'Curate their journey', desc: 'Easily save and organize the specific places you recommend.' },
              { icon: '🌐', title: 'Stay connected', desc: 'Follow you instantly so they never miss out on your newest travel discoveries.' },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col gap-2 md:gap-3">
                <span className="text-xl md:text-2xl">{feature.icon}</span>
                <h3 
                  className="text-xs md:text-sm font-semibold text-[#132341]"
                  style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
                >
                  {feature.title}
                </h3>
                <p 
                  className="text-[10px] md:text-xs text-[#6c7f8f] leading-relaxed"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Monetise Your Expertise */}
      <section 
        className="py-10 md:py-16 lg:py-20 px-4 md:px-14 bg-[#f8fafc]"
        style={{ paddingLeft: sidebarOffset > 0 ? `${sidebarOffset + 16}px` : undefined }}
      >
        <div className="max-w-[1328px] mx-auto">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16">
            {/* Left: Dashboard Mockup */}
            <div className="flex-1 relative min-h-[250px] md:min-h-[350px]">
              <div className="relative max-w-[380px] mx-auto md:mx-0">
                {/* Dashboard Card */}
                <div className="bg-white rounded-xl shadow-xl p-3 md:p-4">
                  {/* Dashboard Header */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <Image src="/assets/logo-icon.svg" alt="Blubeez" width={14} height={12} />
                    <span className="text-[10px] font-medium text-[#475f73]">Dashboard</span>
                  </div>
                  
                  {/* User Info & Earnings */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                      <div>
                        <p className="text-xs font-semibold text-[#132341]">Luke R.</p>
                        <div className="w-14 h-1 bg-[#e8f0f8] rounded-full mt-0.5" />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-[#6c7f8f]">Total Earnings</p>
                      <p className="text-sm font-bold text-[#132341]">$99999</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-3 text-[10px] text-[#6c7f8f] mb-3">
                    <div>
                      <p className="font-semibold text-[#132341] text-xs">1.2K</p>
                      <div className="w-8 h-0.5 bg-[#e8f0f8] rounded-full mt-0.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#132341] text-xs">$4000</p>
                      <div className="w-8 h-0.5 bg-[#e8f0f8] rounded-full mt-0.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#132341] text-xs">200</p>
                      <div className="w-8 h-0.5 bg-[#e8f0f8] rounded-full mt-0.5" />
                    </div>
                  </div>

                  {/* Graph placeholder */}
                  <div className="h-12 flex items-end gap-1.5">
                    {[35, 55, 40, 70, 45, 60, 50].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-[#2d4e92]/20 to-[#2d4e92]/40 rounded-t" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>

                {/* Floating Trip Cards */}
                <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 w-14 md:w-16 bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="h-10 bg-gradient-to-br from-orange-400 to-pink-500 relative">
                    <Image src="/assets/destinations/bali.jpg" alt="Bali" fill className="object-cover" />
                  </div>
                  <div className="p-1">
                    <p className="text-[6px] font-bold text-[#132341]">$299</p>
                    <p className="text-[5px] text-[#6c7f8f]">Bali</p>
                  </div>
                </div>
                
                <div className="absolute bottom-0 -right-1 md:-right-2 w-12 md:w-14 bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="h-8 bg-gradient-to-br from-blue-400 to-teal-500 relative">
                    <Image src="/assets/destinations/japan.jpg" alt="Japan" fill className="object-cover" />
                  </div>
                  <div className="p-1">
                    <p className="text-[5px] font-bold text-[#132341]">$199</p>
                    <p className="text-[4px] text-[#6c7f8f]">Japan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div className="flex-1">
              <h2 
                className="text-[24px] md:text-[32px] lg:text-[40px] font-bold leading-tight mb-3 md:mb-4"
                style={{ 
                  fontFamily: 'var(--font-bricolage-grotesque)',
                  color: COLORS.blubeezBlue 
                }}
              >
                Monetise Your<br />
                Expertise & Influence
              </h2>
              <p 
                className="text-xs md:text-sm text-[#475f73] mb-4"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                Your travel knowledge is valuable. With blubeez, you turn your shared expertise into direct revenue streams and deep audience connection.
              </p>
              <p 
                className="text-[10px] md:text-xs text-[#6c7f8f] mb-4 md:mb-6"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                Here&apos;s how you get rewarded for your content & community building:
              </p>

              {/* Rewards Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-5">
                {[
                  { icon: '💰', title: 'Generate Sign-up Revenue', desc: 'Receive a payment every time a new user joins blubeez directly through your unique referral link.' },
                  { icon: '❤️', title: 'Receive Direct Support', desc: 'Allow grateful travelers to show their appreciation by leaving instant gratuities through your personalized Tip Jar.' },
                  { icon: '🏨', title: 'Secure Booking Commissions', desc: 'Earn a percentage commission when your audience books accommodations and experiences featured directly within your guides.' },
                  { icon: '🌐', title: 'Boost Affiliate Sales', desc: 'Utilize your blubeez profile to promote and sell premium services, customized travel itineraries, or other unique offerings.' },
                ].map((reward, i) => (
                  <div key={i}>
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-md bg-[#2d4e92]/10 flex items-center justify-center mb-1.5 md:mb-2">
                      <span className="text-xs md:text-sm">{reward.icon}</span>
                    </div>
                    <h3 
                      className="text-[10px] md:text-xs font-semibold text-[#132341] mb-0.5 md:mb-1"
                      style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
                    >
                      {reward.title}
                    </h3>
                    <p 
                      className="text-[9px] md:text-[10px] text-[#6c7f8f] leading-relaxed"
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
        className="py-10 md:py-14 px-4 md:px-14 text-center"
        style={{ backgroundColor: COLORS.blubeezNavy }}
      >
        <h2 
          className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2"
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          Join the Journey. Get Rewarded.
        </h2>
        <p 
          className="text-xs md:text-sm text-white/80 mb-5 md:mb-6"
          style={{ fontFamily: 'var(--font-poppins)' }}
        >
          Your experiences deserve more than memories.
        </p>
        <SignUpButton mode="modal">
          <button 
            className="px-6 py-2.5 rounded-full bg-white text-sm font-medium hover:bg-gray-100 transition-colors"
            style={{ 
              color: COLORS.blubeezNavy,
              fontFamily: 'var(--font-bricolage-grotesque)'
            }}
          >
            Join Now!
          </button>
        </SignUpButton>
      </section>

      {/* Footer */}
      <footer 
        className="py-8 md:py-12 px-4 md:px-14 bg-white"
        style={{ paddingLeft: sidebarOffset > 0 ? `${sidebarOffset + 16}px` : undefined }}
      >
        <div className="max-w-[1328px] mx-auto">
          {/* Top Row */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Image
                src="/assets/logo-icon.svg"
                alt="Blubeez"
                width={50}
                height={42}
                className="w-8 h-7 md:w-[50px] md:h-[42px]"
              />
              <span 
                className="text-xl md:text-2xl font-semibold"
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
              <span className="text-[10px] text-[#6c7f8f] uppercase tracking-wide" style={{ fontFamily: 'var(--font-poppins)' }}>Follow Us</span>
              <div className="flex gap-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-7 h-7 flex items-center justify-center hover:opacity-70 transition-opacity">
                  <svg className="w-5 h-5 text-[#2d4e92]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-7 h-7 flex items-center justify-center hover:opacity-70 transition-opacity">
                  <svg className="w-5 h-5 text-[#2d4e92]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-7 h-7 flex items-center justify-center hover:opacity-70 transition-opacity">
                  <svg className="w-5 h-5 text-[#2d4e92]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="w-7 h-7 flex items-center justify-center hover:opacity-70 transition-opacity">
                  <svg className="w-5 h-5 text-[#2d4e92]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#e8f0f8] mb-4" />

          {/* Bottom Row */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4 text-[10px] md:text-xs text-[#6c7f8f]" style={{ fontFamily: 'var(--font-poppins)' }}>
            <span>© 2025 Blubeez</span>
            <span className="hidden md:inline">|</span>
            <a href="#" className="hover:text-[#2d4e92]">Privacy policy</a>
            <span className="hidden md:inline">|</span>
            <a href="#" className="hover:text-[#2d4e92]">Terms and conditions</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { useRef, useState } from 'react';
import { HotelCard, HotelData } from './HotelCard';
import { HotelBookingPanel } from './HotelBookingPanel';

interface HotelCarouselProps {
  hotels: HotelData[];
  title?: string;
  destination?: string;
  checkInDate?: string;
  checkOutDate?: string;
}

export function HotelCarousel({ 
  hotels, 
  title,
  destination,
  checkInDate,
  checkOutDate 
}: HotelCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    
    // Calculate current index based on scroll position
    const cardWidth = 196; // 180px card + 16px gap on mobile (compact cards)
    const newIndex = Math.round(scrollLeft / cardWidth);
    setCurrentIndex(Math.min(newIndex, hotels.length - 1));
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = 196;
    const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = 196;
    scrollRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
  };

  // Format dates for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!hotels || hotels.length === 0) {
    return null;
  }

  // Calculate number of dots for pagination (groups of 3)
  const dotsCount = Math.ceil(hotels.length / 3);
  const activeDot = Math.floor(currentIndex / 3);

  return (
    <>
      <div className="w-full my-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 px-4 md:pl-12 md:pr-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2c3d5d]/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#2c3d5d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h3 className="font-semibold text-[14px] text-[#132341]">
                {title || `Hotels in ${destination}`}
              </h3>
              {checkInDate && checkOutDate && (
                <span className="text-[11px] text-[#8595a4]">
                  {formatDate(checkInDate)} - {formatDate(checkOutDate)}
                </span>
              )}
            </div>
          </div>
          
          {/* View All Button */}
          <button
            onClick={() => setIsPanelOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#2c3d5d] bg-[#2c3d5d]/10 hover:bg-[#2c3d5d]/20 rounded-lg transition-colors"
          >
            <span>View All</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Left Arrow - Desktop only */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/95 hover:bg-white rounded-full shadow-lg items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5 text-[#475f73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:pl-12 md:pr-4 py-2 scroll-smooth snap-x snap-mandatory md:snap-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {hotels.map((hotel) => (
              <div key={hotel.id} className="snap-start">
                <HotelCard hotel={hotel} compact />
              </div>
            ))}
          </div>

          {/* Right Arrow - Desktop only */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/95 hover:bg-white rounded-full shadow-lg items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5 text-[#475f73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Pagination Dots */}
        {dotsCount > 1 && (
          <div className="flex items-center justify-center gap-2 mt-3">
            {Array.from({ length: dotsCount }).map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index * 3)}
                className={`rounded-full transition-all duration-200 ${
                  index === activeDot
                    ? 'w-6 h-2 bg-[#2c3d5d]'
                    : 'w-2 h-2 bg-[#d9e3f0] hover:bg-[#a7b8c7]'
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Mobile hint text */}
        <p className="md:hidden text-center text-[11px] text-[#8595a4] mt-2">
          Swipe to see more · Tap &quot;View All&quot; for filters
        </p>

        {/* Hide scrollbar CSS */}
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>

      {/* Booking Panel */}
      <HotelBookingPanel
        hotels={hotels}
        destination={destination}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </>
  );
}

export default HotelCarousel;

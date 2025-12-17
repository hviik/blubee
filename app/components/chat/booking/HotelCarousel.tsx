'use client';

import { useRef, useState } from 'react';
import { HotelCard, HotelData } from './HotelCard';

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

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    
    // Calculate current index based on scroll position
    const cardWidth = 266; // 250px card + 16px gap
    const newIndex = Math.round(scrollLeft / cardWidth);
    setCurrentIndex(Math.min(newIndex, hotels.length - 1));
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = 266;
    const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = 266;
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
    <div className="w-full my-4">
      {/* Header */}
      {(title || destination) && (
        <div className="flex items-center justify-between mb-3 pl-12">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#2f4f93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="font-semibold text-[14px] text-[#132341]">
              {title || `Hotel recommendations in ${destination}`}
            </h3>
          </div>
          {checkInDate && checkOutDate && (
            <span className="text-[11px] text-[#8595a4]">
              {formatDate(checkInDate)} - {formatDate(checkOutDate)}
            </span>
          )}
        </div>
      )}

      {/* Carousel Container */}
      <div className="relative group">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
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
          className="flex gap-4 overflow-x-auto scrollbar-hide pl-12 pr-4 py-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {hotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
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
                  ? 'w-[10px] h-[10px] bg-[#2f4f93]'
                  : 'w-[8px] h-[8px] bg-[#d9e3f0] hover:bg-[#a7b8c7]'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Hide scrollbar CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default HotelCarousel;


'use client';

import { useState } from 'react';

export interface HotelData {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  photoUrl: string;
  rating: number;
  reviewScore: number;
  reviewScoreWord: string;
  reviewCount: number;
  price: number;
  currency: string;
  pricePerNight: number;
  bookingUrl: string;
  amenities: string[];
  distanceFromCenter: string;
  lat?: number;
  lng?: number;
}

interface HotelCardProps {
  hotel: HotelData;
  onBook?: (hotel: HotelData) => void;
  compact?: boolean;
}

// Format number with commas
function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

// Get currency symbol
function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    SGD: 'S$',
    THB: '฿',
    MYR: 'RM',
    LKR: 'Rs',
  };
  return symbols[currency] || currency + ' ';
}

// Truncate text to fit
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}

export function HotelCard({ hotel, onBook, compact = false }: HotelCardProps) {
  const [imgError, setImgError] = useState(false);

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hotel.bookingUrl) {
      window.open(hotel.bookingUrl, '_blank', 'noopener,noreferrer');
    }
    if (onBook) {
      onBook(hotel);
    }
  };

  const handleCardClick = () => {
    if (hotel.bookingUrl) {
      window.open(hotel.bookingUrl, '_blank', 'noopener,noreferrer');
    }
    if (onBook) {
      onBook(hotel);
    }
  };

  // Fallback image
  const placeholderImage = (
    <div className="w-full h-full bg-gradient-to-br from-[#e8f0f7] to-[#c7d7e7] flex items-center justify-center">
      <svg className="w-8 h-8 text-[#7286b0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    </div>
  );

  if (compact) {
    // Compact card for carousel - more concise
    return (
      <div 
        onClick={handleCardClick}
        className="group flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden w-[180px] md:w-[200px] flex-shrink-0 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100/80"
      >
        {/* Hotel Image with rounded corners */}
        <div className="relative h-[90px] md:h-[100px] w-full overflow-hidden">
          {hotel.photoUrl && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hotel.photoUrl}
              alt={hotel.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              style={{ borderRadius: '16px 16px 0 0' }}
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            placeholderImage
          )}
          
          {/* Rating Badge */}
          {hotel.reviewScore > 0 && (
            <div className="absolute top-2 left-2 bg-[#2f4f93] rounded-lg px-1.5 py-0.5 shadow-sm">
              <span className="font-bold text-[10px] text-white">
                {hotel.reviewScore.toFixed(1)}
              </span>
            </div>
          )}

          {/* External Link Icon */}
          <div className="absolute top-2 right-2 bg-white/95 hover:bg-white rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
            <svg className="w-3.5 h-3.5 text-[#475f73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </div>

        {/* Hotel Info - More concise */}
        <div className="flex flex-col gap-1 p-2.5">
          {/* Name */}
          <h3 
            className="font-semibold text-[11px] md:text-[12px] text-[#132341] leading-tight line-clamp-1" 
            title={hotel.name}
          >
            {truncateText(hotel.name, 28)}
          </h3>
          
          {/* Location & Rating in one row */}
          <div className="flex items-center justify-between text-[9px] md:text-[10px] text-[#7286b0]">
            <span className="truncate flex-1" title={hotel.city}>
              {truncateText(hotel.distanceFromCenter || hotel.city, 18)}
            </span>
            {hotel.reviewScoreWord && (
              <span className="text-[#2f4f93] font-medium ml-1">
                {truncateText(hotel.reviewScoreWord, 10)}
              </span>
            )}
          </div>

          {/* Price - prominent */}
          <div className="flex items-baseline justify-between mt-0.5 pt-1.5 border-t border-gray-100">
            <span className="text-[9px] text-[#a7b8c7]">per night</span>
            <span className="font-bold text-[13px] md:text-[14px] text-[#132341]">
              {getCurrencySymbol(hotel.currency)}{hotel.pricePerNight.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Full card (default) - also more compact
  return (
    <div 
      className="group flex flex-col bg-white rounded-2xl shadow-md overflow-hidden w-[220px] flex-shrink-0 hover:shadow-lg transition-shadow duration-200"
    >
      {/* Hotel Image with rounded corners */}
      <div className="relative h-[110px] w-full overflow-hidden">
        {hotel.photoUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hotel.photoUrl}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            style={{ borderRadius: '16px 16px 0 0' }}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          placeholderImage
        )}
        
        {/* Rating Badge */}
        {hotel.reviewScore > 0 && (
          <div className="absolute top-2 left-2 bg-[#2f4f93] rounded-lg px-2 py-0.5 shadow-sm">
            <span className="font-bold text-[11px] text-white">
              {hotel.reviewScore.toFixed(1)}
            </span>
          </div>
        )}

        {/* External Link Button */}
        <button
          onClick={handleBookClick}
          className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-lg p-1.5 transition-colors shadow-sm"
          title="Book on Booking.com"
        >
          <svg className="w-4 h-4 text-[#475f73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>

      {/* Hotel Info - concise */}
      <div className="flex flex-col gap-1.5 p-3">
        {/* Name */}
        <h3 
          className="font-semibold text-[12px] text-[#132341] leading-tight line-clamp-1" 
          title={hotel.name}
        >
          {hotel.name}
        </h3>
        
        {/* Location */}
        <p className="text-[10px] text-[#7286b0] truncate flex items-center gap-1" title={hotel.address || hotel.city}>
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {truncateText(hotel.distanceFromCenter || hotel.city, 25)}
        </p>

        {/* Rating inline */}
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="font-semibold text-[#2f4f93]">
            {hotel.reviewScoreWord || 'Good'}
          </span>
          <span className="text-[#a7b8c7]">·</span>
          <span className="text-[#7286b0]">{formatNumber(hotel.reviewCount)} reviews</span>
        </div>

        {/* Price - prominent */}
        <div className="flex items-baseline justify-between mt-1 pt-2 border-t border-gray-100">
          <span className="text-[9px] text-[#a7b8c7]">from</span>
          <span className="font-bold text-[15px] text-[#132341]">
            {getCurrencySymbol(hotel.currency)}{hotel.pricePerNight.toLocaleString()}
            <span className="text-[10px] font-normal text-[#7286b0] ml-0.5">/night</span>
          </span>
        </div>
      </div>
    </div>
  );
}


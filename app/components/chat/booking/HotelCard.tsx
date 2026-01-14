'use client';

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

export function HotelCard({ hotel, onBook, compact = false }: HotelCardProps) {
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

  if (compact) {
    // Compact card for carousel
    return (
      <div 
        onClick={handleCardClick}
        className="group flex flex-col bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] overflow-hidden w-[220px] md:w-[250px] flex-shrink-0 hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-100 hover:border-[#2c3d5d]/20"
      >
        {/* Hotel Image */}
        <div className="relative h-[110px] md:h-[120px] w-full overflow-hidden">
          {hotel.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hotel.photoUrl}
              alt={hotel.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#d9e3f0] to-[#a7b8c7] flex items-center justify-center">
              <svg className="w-10 h-10 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
          
          {/* Rating Badge */}
          {hotel.reviewScore > 0 && (
            <div className="absolute top-2 left-2 bg-[#2c3d5d] rounded-md px-1.5 py-0.5">
              <span className="font-semibold text-[11px] text-white">
                {hotel.reviewScore.toFixed(1)}
              </span>
            </div>
          )}

          {/* External Link Icon */}
          <div className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4 text-[#475f73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </div>

        {/* Hotel Info */}
        <div className="flex flex-col gap-1.5 p-3">
          {/* Name */}
          <h3 className="font-semibold text-[13px] text-[#132341] truncate leading-tight" title={hotel.name}>
            {hotel.name}
          </h3>
          
          {/* Location */}
          <p className="text-[11px] text-[#6c7f8f] truncate flex items-center gap-1" title={hotel.distanceFromCenter || hotel.city}>
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {hotel.distanceFromCenter || hotel.city}
          </p>

          {/* Review info */}
          <div className="flex items-center gap-1.5 text-[10px] text-[#8595a4]">
            <span className="font-medium text-[#475f73]">{hotel.reviewScoreWord || 'No rating'}</span>
            <span>·</span>
            <span>{formatNumber(hotel.reviewCount)} reviews</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline justify-between mt-1 pt-2 border-t border-gray-100">
            <span className="text-[10px] text-[#8595a4]">per night</span>
            <span className="font-bold text-[15px] text-[#132341]">
              {getCurrencySymbol(hotel.currency)}{hotel.pricePerNight}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Full card (default)
  return (
    <div 
      className="group flex flex-col bg-white rounded-lg shadow-[0_0_16px_rgba(0,0,0,0.1),0_4px_4px_rgba(0,0,0,0.1)] overflow-hidden w-[250px] flex-shrink-0 hover:shadow-lg transition-shadow duration-200"
    >
      {/* Hotel Image */}
      <div className="relative h-[120px] w-full overflow-hidden">
        {hotel.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hotel.photoUrl}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#d9e3f0] to-[#a7b8c7] flex items-center justify-center">
            <svg className="w-10 h-10 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}
        
        {/* External Link Button */}
        <button
          onClick={handleBookClick}
          className="absolute top-3 right-3 bg-white/70 hover:bg-white rounded-lg p-1 transition-colors"
          title="Book on Booking.com"
        >
          <svg className="w-6 h-6 text-[#475f73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>

      {/* Hotel Info */}
      <div className="flex flex-col gap-2 p-2">
        {/* Name and Address */}
        <div className="flex flex-col">
          <h3 className="font-semibold text-[12px] text-[#475f73] truncate" title={hotel.name}>
            {hotel.name}
          </h3>
          <p className="text-[10px] text-[#8595a4] truncate" title={hotel.address || hotel.city}>
            {hotel.address || hotel.city}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="bg-[#2c3d5d] rounded-lg px-1 py-1.5 flex items-center justify-center min-w-[27px]">
            <span className="font-medium text-[12px] text-white">
              {hotel.reviewScore > 0 ? hotel.reviewScore.toFixed(1) : '-'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-[12px] text-[#475f73]">
              {hotel.reviewScoreWord || 'No rating'}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-[#8595a4]">
              <span>{formatNumber(hotel.reviewCount)}</span>
              <span>reviews</span>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 justify-end mt-1">
          <span className="text-[10px] text-[#6c7f8f]">Starting from</span>
          <span className="font-medium text-[14px] text-[#475f73]">
            {getCurrencySymbol(hotel.currency)}{hotel.pricePerNight}
          </span>
        </div>
      </div>
    </div>
  );
}


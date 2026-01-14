'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { HotelData } from './HotelCard';
import { useUser } from '@clerk/nextjs';

interface HotelBookingPanelProps {
  hotels: HotelData[];
  destination?: string;
  checkInDate?: string;
  checkOutDate?: string;
  isOpen: boolean;
  onClose: () => void;
  onBookingSelected?: (hotel: HotelData) => void;
}

type SortOption = 'recommended' | 'price_low' | 'price_high' | 'rating';
type PriceFilter = 'all' | 'budget' | 'mid' | 'luxury';

// Get currency symbol
function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥',
    AUD: 'A$', CAD: 'C$', SGD: 'S$', THB: '฿', MYR: 'RM', LKR: 'Rs',
  };
  return symbols[currency] || currency + ' ';
}

// Format review count
function formatReviewCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toLocaleString();
}

// Format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// Calculate nights between dates
function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

// Hotel card for the panel - mobile optimized
function HotelPanelCard({ 
  hotel, 
  onBook, 
  nights 
}: { 
  hotel: HotelData; 
  onBook: () => void;
  nights: number;
}) {
  const totalPrice = hotel.pricePerNight * nights;

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100">
      {/* Image Section */}
      <div className="relative h-[180px] w-full">
        {hotel.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hotel.photoUrl}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#d9e8f5] to-[#a7c4d7] flex items-center justify-center">
            <svg className="w-16 h-16 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}
        
        {/* Rating Badge */}
        {hotel.reviewScore > 0 && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
            <div className="bg-[#2c3d5d] rounded px-1.5 py-0.5">
              <span className="text-white font-semibold text-xs">{hotel.reviewScore.toFixed(1)}</span>
            </div>
            <span className="text-[#475f73] text-xs font-medium">{hotel.reviewScoreWord}</span>
          </div>
        )}

        {/* Star Rating */}
        {hotel.rating > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-0.5 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
            {Array.from({ length: Math.floor(hotel.rating) }).map((_, i) => (
              <svg key={i} className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Name and Location */}
        <h3 className="font-semibold text-[15px] text-[#132341] leading-tight line-clamp-2 mb-1">
          {hotel.name}
        </h3>
        <div className="flex items-center gap-1 text-[13px] text-[#6c7f8f] mb-3">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{hotel.distanceFromCenter || hotel.city}</span>
        </div>

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {hotel.amenities.slice(0, 3).map((amenity, idx) => (
              <span 
                key={idx} 
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#e8f0f8] text-[#475f73]"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}

        {/* Reviews */}
        <div className="flex items-center gap-1 text-[12px] text-[#8595a4] mb-4">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
          <span>{formatReviewCount(hotel.reviewCount)} reviews</span>
        </div>

        {/* Price and Book Button */}
        <div className="flex items-end justify-between pt-3 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#8595a4]">{nights} night{nights > 1 ? 's' : ''} total</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-[#132341]">
                {getCurrencySymbol(hotel.currency)}{totalPrice.toLocaleString()}
              </span>
            </div>
            <span className="text-[11px] text-[#6c7f8f]">
              {getCurrencySymbol(hotel.currency)}{hotel.pricePerNight}/night
            </span>
          </div>
          
          <button
            onClick={onBook}
            className="px-5 py-2.5 bg-[#2c3d5d] hover:bg-[#1e2d47] text-white text-sm font-medium rounded-xl transition-colors duration-200 flex items-center gap-2"
          >
            <span>Book Now</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function HotelBookingPanel({
  hotels,
  destination,
  checkInDate,
  checkOutDate,
  isOpen,
  onClose,
  onBookingSelected,
}: HotelBookingPanelProps) {
  const { user } = useUser();
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [displayCount, setDisplayCount] = useState(5);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  // Reset display count when panel opens or filters change
  useEffect(() => {
    setDisplayCount(5);
  }, [isOpen, sortBy, priceFilter, minRating]);

  // Calculate nights
  const nights = useMemo(() => {
    if (checkInDate && checkOutDate) {
      return calculateNights(checkInDate, checkOutDate);
    }
    return 1;
  }, [checkInDate, checkOutDate]);

  // Filter and sort hotels
  const filteredHotels = useMemo(() => {
    let result = [...hotels];

    // Price filter
    if (priceFilter !== 'all') {
      result = result.filter(hotel => {
        const price = hotel.pricePerNight;
        switch (priceFilter) {
          case 'budget': return price <= 100;
          case 'mid': return price > 100 && price <= 250;
          case 'luxury': return price > 250;
          default: return true;
        }
      });
    }

    // Rating filter
    if (minRating > 0) {
      result = result.filter(hotel => hotel.reviewScore >= minRating);
    }

    // Sort
    switch (sortBy) {
      case 'price_low':
        result.sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;
      case 'price_high':
        result.sort((a, b) => b.pricePerNight - a.pricePerNight);
        break;
      case 'rating':
        result.sort((a, b) => b.reviewScore - a.reviewScore);
        break;
      default:
        // recommended - keep original order (by popularity)
        break;
    }

    return result;
  }, [hotels, sortBy, priceFilter, minRating]);

  // Hotels to display
  const displayedHotels = filteredHotels.slice(0, displayCount);
  const hasMore = displayCount < filteredHotels.length;

  // Handle booking
  const handleBook = async (hotel: HotelData) => {
    // Save booking reference to database
    if (user?.id) {
      setIsSaving(hotel.id);
      try {
        await fetch('/api/booking/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hotelId: hotel.id,
            hotelName: hotel.name,
            hotelAddress: hotel.address,
            city: hotel.city,
            country: hotel.country,
            photoUrl: hotel.photoUrl,
            rating: hotel.rating,
            reviewScore: hotel.reviewScore,
            pricePerNight: hotel.pricePerNight,
            currency: hotel.currency,
            checkInDate,
            checkOutDate,
            totalPrice: hotel.pricePerNight * nights,
            bookingUrl: hotel.bookingUrl,
            destination,
          }),
        });
      } catch (error) {
        console.error('Failed to save booking:', error);
      } finally {
        setIsSaving(null);
      }
    }

    // Open booking URL
    if (hotel.bookingUrl) {
      window.open(hotel.bookingUrl, '_blank', 'noopener,noreferrer');
    }

    // Callback
    onBookingSelected?.(hotel);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div 
        className="relative w-full md:w-[90%] md:max-w-[600px] max-h-[92vh] md:max-h-[85vh] bg-[#f8fafc] rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp"
      >
        {/* Handle bar for mobile */}
        <div className="md:hidden flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-[#132341]">
                Hotels in {destination || 'your destination'}
              </h2>
              {checkInDate && checkOutDate && (
                <p className="text-sm text-[#6c7f8f] mt-0.5">
                  {formatDate(checkInDate)} → {formatDate(checkOutDate)} · {nights} night{nights > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-[#475f73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-[#475f73] focus:outline-none focus:ring-2 focus:ring-[#2c3d5d]/20"
            >
              <option value="recommended">Recommended</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>

            {/* Price filter */}
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
              className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-[#475f73] focus:outline-none focus:ring-2 focus:ring-[#2c3d5d]/20"
            >
              <option value="all">All Prices</option>
              <option value="budget">Budget (&lt;$100)</option>
              <option value="mid">Mid-range ($100-250)</option>
              <option value="luxury">Luxury (&gt;$250)</option>
            </select>

            {/* Rating filter */}
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-[#475f73] focus:outline-none focus:ring-2 focus:ring-[#2c3d5d]/20"
            >
              <option value={0}>Any Rating</option>
              <option value={7}>7+ Good</option>
              <option value={8}>8+ Very Good</option>
              <option value={9}>9+ Excellent</option>
            </select>
          </div>

          {/* Results count */}
          <p className="text-xs text-[#8595a4] mt-3">
            Showing {displayedHotels.length} of {filteredHotels.length} hotels
          </p>
        </div>

        {/* Hotel List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {displayedHotels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-[#6c7f8f] font-medium">No hotels match your filters</p>
              <p className="text-sm text-[#8595a4] mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            displayedHotels.map((hotel) => (
              <div key={hotel.id} className="relative">
                <HotelPanelCard
                  hotel={hotel}
                  nights={nights}
                  onBook={() => handleBook(hotel)}
                />
                {isSaving === hotel.id && (
                  <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                    <div className="flex items-center gap-2 text-[#2c3d5d]">
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      <span className="text-sm font-medium">Saving...</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Load More Button */}
          {hasMore && (
            <button
              onClick={() => setDisplayCount(prev => prev + 5)}
              className="w-full py-3 bg-white hover:bg-gray-50 text-[#2c3d5d] font-medium rounded-xl border border-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <span>Show More Hotels</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 bg-white">
          <p className="text-xs text-[#8595a4] text-center">
            Prices shown are estimates. Final price may vary on Booking.com
          </p>
        </div>
      </div>

      {/* Slide up animation */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default HotelBookingPanel;

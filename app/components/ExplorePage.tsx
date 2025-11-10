'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { COLORS } from '../constants/colors';

interface TravelListing {
  id: string;
  destination: string;
  country: string;
  imageUrl?: string;
  price: number;
  currency: string;
  description: string;
  duration: string;
  rating?: number;
}

interface ExplorePageProps {
  onClose?: () => void;
}

export default function ExplorePage({ onClose }: ExplorePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<TravelListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userCurrency, setUserCurrency] = useState<string>('USD');
  const [userCountry, setUserCountry] = useState<string>('US');

  // Get user's location and currency based on IP
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const response = await fetch('/api/geolocation');
        if (response.ok) {
          const data = await response.json();
          setUserCurrency(data.currency || 'USD');
          setUserCountry(data.country || 'US');
        }
      } catch (error) {
        console.error('Failed to fetch user location:', error);
      }
    };

    fetchUserLocation();
  }, []);

  // Fetch travel listings
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/explore?query=${encodeURIComponent(searchQuery)}&currency=${userCurrency}`);
        if (response.ok) {
          const data = await response.json();
          setListings(data.listings || []);
        }
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(() => {
      fetchListings();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, userCurrency]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by useEffect with debounce
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: COLORS.borderLight }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <Image src="/assets/close.svg" alt="Close" width={20} height={20} />
                </button>
              )}
              <h1
                className="text-2xl font-semibold"
                style={{ fontFamily: 'var(--font-bricolage-grotesque)', color: COLORS.textPrimary }}
              >
                Explore Destinations
              </h1>
            </div>
            <div className="text-sm" style={{ color: COLORS.textSecondary }}>
              Prices in {userCurrency}
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destinations, cities, countries..."
                className="w-full px-4 py-3 pl-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  borderColor: COLORS.borderLight,
                  fontFamily: 'var(--font-poppins)',
                }}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Image src="/assets/explore.svg" alt="Search" width={20} height={20} />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.textPrimary }}></div>
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                style={{ borderColor: COLORS.borderLight }}
              >
                {listing.imageUrl && (
                  <div className="relative w-full h-48 bg-gray-200">
                    <Image
                      src={listing.imageUrl}
                      alt={listing.destination}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3
                        className="text-lg font-semibold"
                        style={{ fontFamily: 'var(--font-bricolage-grotesque)', color: COLORS.textPrimary }}
                      >
                        {listing.destination}
                      </h3>
                      <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                        {listing.country}
                      </p>
                    </div>
                    {listing.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm">⭐</span>
                        <span className="text-sm" style={{ color: COLORS.textSecondary }}>
                          {listing.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm mb-3 line-clamp-2" style={{ color: COLORS.textSecondary }}>
                    {listing.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: COLORS.textTertiary }}>
                      {listing.duration}
                    </span>
                    <div className="text-right">
                      <div
                        className="text-xl font-bold"
                        style={{ fontFamily: 'var(--font-bricolage-grotesque)', color: COLORS.textPrimary }}
                      >
                        {listing.currency} {listing.price.toLocaleString()}
                      </div>
                      <div className="text-xs" style={{ color: COLORS.textSecondary }}>
                        per person
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg" style={{ color: COLORS.textSecondary }}>
              {searchQuery ? 'No results found. Try a different search.' : 'Start searching to explore destinations!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


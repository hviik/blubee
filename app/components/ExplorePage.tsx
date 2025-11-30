'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { COLORS } from '../constants/colors';
import { detectUserCurrency, getExchangeRate, CurrencyInfo } from '../utils/currencyDetection';
import { getDestinationImage, getFlagImage, getISO2Code } from '../utils/countryData';
import HeartButton, { DoubleTapHeartOverlay } from './HeartButton';

interface ExplorePageProps {
  compact?: boolean;
  onDestinationClick?: (countryName: string, route: string[]) => void;
}

export interface Destination {
  id: string;
  name: string;
  iso2: string;
  duration: string;
  priceINR: number;
  priceDetail: string;
  route: string[];
}

const destinations: Destination[] = [
  {
    id: 'vn',
    name: 'VIETNAM',
    iso2: 'vn',
    duration: '5 Days, 4 Nights',
    priceINR: 74500,
    priceDetail: 'Per person',
    route: ['Hanoi', 'Ha Long Bay', 'Ho Chi Minh City'],
  },
  {
    id: 'my',
    name: 'MALAYSIA',
    iso2: 'my',
    duration: '5 Days, 4 Nights',
    priceINR: 68900,
    priceDetail: 'Per person',
    route: ['Kuala Lumpur', 'Penang', 'Langkawi'],
  },
  {
    id: 'pe',
    name: 'PERU',
    iso2: 'pe',
    duration: '5 Days, 4 Nights',
    priceINR: 215000,
    priceDetail: 'Per person',
    route: ['Lima', 'Cusco', 'Machu Picchu'],
  },
  {
    id: 'ph',
    name: 'PHILIPPINES',
    iso2: 'ph',
    duration: '5 Days, 4 Nights',
    priceINR: 82400,
    priceDetail: 'Per person',
    route: ['Manila', 'Cebu', 'Palawan'],
  },
  {
    id: 'br',
    name: 'BRAZIL',
    iso2: 'br',
    duration: '5 Days, 4 Nights',
    priceINR: 245000,
    priceDetail: 'Per person',
    route: ['Rio de Janeiro', 'São Paulo', 'Iguazu Falls'],
  },
  {
    id: 'in',
    name: 'INDIA',
    iso2: 'in',
    duration: '5 Days, 4 Nights',
    priceINR: 38500,
    priceDetail: 'Per person',
    route: ['Delhi', 'Agra', 'Jaipur'],
  },
  {
    id: 'mv',
    name: 'MALDIVES',
    iso2: 'mv',
    duration: '5 Days, 4 Nights',
    priceINR: 112000,
    priceDetail: 'Per person',
    route: ['Male', 'Ari Atoll', 'Vaavu'],
  },
  {
    id: 'la',
    name: 'LAOS',
    iso2: 'la',
    duration: '5 Days, 4 Nights',
    priceINR: 71200,
    priceDetail: 'Per person',
    route: ['Luang Prabang', 'Vang Vieng', 'Vientiane'],
  },
];

export default function ExplorePage({ compact = false, onDestinationClick }: ExplorePageProps) {
  const { isSignedIn } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [likedDestinations, setLikedDestinations] = useState<Set<string>>(new Set());
  const [loadingLikes, setLoadingLikes] = useState<Set<string>>(new Set());
  const [showHeartOverlay, setShowHeartOverlay] = useState<string | null>(null);
  
  // For double-tap detection on the card itself
  const lastTapTimeRef = useRef<{ [key: string]: number }>({});

  useEffect(() => {
    const initCurrency = async () => {
      const currency = await detectUserCurrency();
      setCurrencyInfo(currency);
      
      if (currency.code !== 'INR') {
        const rate = await getExchangeRate('INR', currency.code);
        setExchangeRate(rate);
      }
    };

    initCurrency();
  }, []);

  // Fetch user's wishlist on mount
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isSignedIn) {
        setLikedDestinations(new Set());
        return;
      }

      try {
        const response = await fetch('/api/wishlist');
        if (response.ok) {
          const data = await response.json();
          const ids = data.wishlistIds || [];
          console.log('Fetched wishlist IDs:', ids);
          setLikedDestinations(new Set(ids));
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to fetch wishlist:', errorData);
        }
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      }
    };

    fetchWishlist();
  }, [isSignedIn]);

  const convertAndFormatPrice = (priceINR: number): string => {
    if (!currencyInfo) {
      return `₹ ${priceINR.toLocaleString()}`;
    }
    
    if (currencyInfo.code === 'INR') {
      return `${currencyInfo.symbol} ${priceINR.toLocaleString()}`;
    }
    
    const convertedAmount = Math.round(priceINR * exchangeRate);
    
    return `${currencyInfo.symbol} ${convertedAmount.toLocaleString()}`;
  };

  const toggleLike = useCallback(async (destination: Destination) => {
    if (!isSignedIn) {
      console.warn('User not signed in, cannot toggle like');
      return;
    }

    const isCurrentlyLiked = likedDestinations.has(destination.id);
    console.log(`Toggling like for ${destination.name} (${destination.id}): ${isCurrentlyLiked ? 'unliking' : 'liking'}`);
    
    // Optimistic update
    setLikedDestinations(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyLiked) {
        newSet.delete(destination.id);
      } else {
        newSet.add(destination.id);
      }
      return newSet;
    });

    setLoadingLikes(prev => new Set(prev).add(destination.id));

    try {
      if (isCurrentlyLiked) {
        const response = await fetch(`/api/wishlist?destinationId=${encodeURIComponent(destination.id)}`, {
          method: 'DELETE',
        });
        
        const responseData = await response.json().catch(() => ({}));
        
        if (!response.ok) {
          console.error('DELETE wishlist error:', responseData);
          throw new Error(responseData.error || 'Failed to remove from wishlist');
        }
        
        console.log('Successfully removed from wishlist:', responseData);
      } else {
        // Get image and flag paths
        const destinationImage = getDestinationImage(destination.name);
        const flagImage = getFlagImage(destination.name);
        
        const payload = {
          destinationId: destination.id,
          destinationName: destination.name,
          route: destination.route,
          priceINR: destination.priceINR,
          duration: destination.duration,
          iso2: destination.iso2,
          image: destinationImage,
          flag: flagImage,
        };
        
        console.log('POST wishlist payload:', payload);
        
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        const responseData = await response.json().catch(() => ({}));
        
        if (!response.ok) {
          console.error('POST wishlist error:', responseData);
          throw new Error(responseData.error || 'Failed to add to wishlist');
        }
        
        console.log('Successfully added to wishlist:', responseData);
      }
      
      // Refresh wishlist to ensure consistency
      try {
        const refreshResponse = await fetch('/api/wishlist');
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const ids = refreshData.wishlistIds || [];
          console.log('Refreshed wishlist IDs:', ids);
          setLikedDestinations(new Set(ids));
        }
      } catch (refreshError) {
        console.error('Failed to refresh wishlist:', refreshError);
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      // Revert optimistic update on error
      setLikedDestinations(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.add(destination.id);
        } else {
          newSet.delete(destination.id);
        }
        return newSet;
      });
    } finally {
      setLoadingLikes(prev => {
        const newSet = new Set(prev);
        newSet.delete(destination.id);
        return newSet;
      });
    }
  }, [isSignedIn, likedDestinations]);

  // Handle double-tap on card to like
  const handleCardDoubleTap = useCallback((destination: Destination) => {
    const now = Date.now();
    const lastTap = lastTapTimeRef.current[destination.id] || 0;
    
    if (now - lastTap < 300) {
      // Double tap - toggle like and show animation
      setShowHeartOverlay(destination.id);
      setTimeout(() => setShowHeartOverlay(null), 700);
      toggleLike(destination);
      lastTapTimeRef.current[destination.id] = 0;
      return true; // Was double tap
    } else {
      lastTapTimeRef.current[destination.id] = now;
      return false; // Was single tap (first tap)
    }
  }, [toggleLike]);

  // Single tap navigates, double tap likes
  const pendingClickRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  
  const handleCardClick = useCallback((destination: Destination, e: React.MouseEvent) => {
    // Clear any pending navigation
    if (pendingClickRef.current[destination.id]) {
      clearTimeout(pendingClickRef.current[destination.id]);
      delete pendingClickRef.current[destination.id];
    }

    const wasDoubleTap = handleCardDoubleTap(destination);
    
    if (!wasDoubleTap) {
      // Wait to see if this becomes a double tap
      pendingClickRef.current[destination.id] = setTimeout(() => {
        delete pendingClickRef.current[destination.id];
        onDestinationClick?.(destination.name, destination.route);
      }, 300);
    }
  }, [handleCardDoubleTap, onDestinationClick]);

  // Filter destinations based on search query
  const filteredDestinations = searchQuery
    ? destinations.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.route.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : destinations;

  return (
    <div className="w-full h-full flex flex-col bg-transparent overflow-hidden">
      <div className={`${compact ? 'px-3 pt-3 pb-3' : 'px-4 md:px-6 pt-4 pb-2'} shrink-0`}>
        {!compact && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#e6f0f7]">
              <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                <path d="M24 14L28 22H20L24 14Z" fill={COLORS.blubeezBlue} />
                <path d="M24 34L20 26H28L24 34Z" fill={COLORS.blubeezBlue} />
              </svg>
            </div>
            <h1
              className="text-[28px] md:text-[32px] font-semibold"
              style={{
                fontFamily: 'var(--font-bricolage-grotesque)',
                color: '#475f73',
              }}
            >
              Explore
            </h1>
          </div>
        )}

        {!compact && (
          <div
            className="flex items-center justify-between px-4 py-[10px] rounded-xl border max-w-md"
            style={{
              backgroundColor: 'rgba(255,255,255,0.45)',
              borderColor: '#a8c2e1',
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations..."
              className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
              style={{ fontFamily: 'var(--font-poppins)', color: '#333' }}
            />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                fill="#6b85b7"
              />
            </svg>
          </div>
        )}
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 md:px-6 pb-6 bg-transparent"
        style={{
          minWidth: '0',
          flexShrink: 1,
        }}
      >
        <div
          className="grid gap-4 md:gap-6 lg:gap-8 mt-4 justify-center"
          style={{
            gridTemplateColumns: compact 
              ? 'repeat(2, 1fr)' 
              : 'repeat(auto-fill, minmax(160px, 220px))',
          }}
        >
          {filteredDestinations.map((d) => (
            <div
              key={d.id}
              className="relative w-full aspect-[3/4] md:aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300"
              onClick={(e) => handleCardClick(d, e)}
            >
              {/* Double-tap heart overlay animation */}
              <DoubleTapHeartOverlay show={showHeartOverlay === d.id} />

              <div className="absolute inset-0">
                <Image
                  src={getDestinationImage(d.name)}
                  alt={d.name}
                  fill
                  className="object-cover object-center brightness-[0.95] contrast-[1.08]"
                  style={{
                    transform: 'translateZ(0)',
                    willChange: 'filter',
                  }}
                  unoptimized
                  sizes="(max-width: 768px) 45vw, 220px"
                />
              </div>

              <div
                className="absolute top-0 left-0 right-0 h-20 md:h-24 p-3 md:p-[18px] flex items-start justify-between"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
                }}
              >
                <div className="flex flex-col text-white">
                  <p
                    className="text-[10px] md:text-[12px] font-medium leading-tight"
                    style={{ fontFamily: 'var(--font-poppins)' }}
                  >
                    {convertAndFormatPrice(d.priceINR)}
                  </p>
                  <p
                    className="text-[8px] md:text-[9px] font-medium opacity-90"
                    style={{ fontFamily: 'var(--font-poppins)' }}
                  >
                    {d.priceDetail}
                  </p>
                </div>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="hover:scale-110 transition-transform md:w-[14px] md:h-[14px]"
                >
                  <path
                    d="M1 13L13 1M13 1H1M13 1V13"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Heart button positioned at actual bottom right */}
              <div className="absolute bottom-3 md:bottom-4 right-3 md:right-4 z-10">
                <HeartButton
                  isLiked={likedDestinations.has(d.id)}
                  onToggle={() => toggleLike(d)}
                  size={compact ? 'xs' : 'sm'}
                  disabled={loadingLikes.has(d.id) || !isSignedIn}
                />
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 h-40 md:h-48 p-3 md:p-[18px] flex flex-col items-center justify-end"
                style={{
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                }}
              >
                <div className="flex flex-col items-center gap-1.5 md:gap-2 w-full mb-1.5 md:mb-2">
                  <div className="w-7 h-3.5 md:w-8 md:h-4 relative overflow-hidden rounded-sm">
                    <Image
                      src={getFlagImage(d.name)}
                      alt={`${d.name} flag`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <p
                    className="text-[10px] md:text-[12px] font-medium text-center text-white"
                    style={{ fontFamily: 'var(--font-poppins)' }}
                  >
                    {d.duration}
                  </p>
                </div>

                <h3
                  className="text-[18px] md:text-[24px] font-black italic text-center text-white uppercase w-full mb-0.5 md:mb-1"
                  style={{
                    fontFamily: 'var(--font-poppins)',
                    fontWeight: 900,
                  }}
                >
                  {d.name}
                </h3>

                <div className="flex items-center gap-0.5 md:gap-1 justify-center w-full flex-wrap">
                  {d.route.map((loc, i) => (
                    <div key={i} className="flex items-center gap-0.5 md:gap-1">
                      <span
                        className="text-[8px] md:text-[9px] text-white"
                        style={{ fontFamily: 'var(--font-poppins)' }}
                      >
                        {loc}
                      </span>
                      {i < d.route.length - 1 && (
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 11 11"
                          fill="none"
                          className="rotate-90 md:w-[10.5px] md:h-[10.5px]"
                        >
                          <path
                            d="M1 1L10 10"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

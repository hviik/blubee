'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { COLORS } from '../constants/colors';
import { getDestinationImage, getFlagImage, getCountryDisplayName } from '../utils/countryData';
import HeartButton from './HeartButton';

type TripStatus = 'all' | 'planned' | 'completed' | 'wishlist';

interface Trip {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  trip_type: string | null;
  number_of_people: number;
  status: 'planned' | 'completed' | 'wishlist';
  preferences: {
    destination_id?: string;
    route?: string[];
    price_inr?: number;
    duration?: string;
    iso2?: string;
    description?: string;
  };
  created_at: string;
}

interface MyTripsPageProps {
  onTripClick?: (trip: Trip) => void;
  defaultTab?: TripStatus;
}

export default function MyTripsPage({ onTripClick, defaultTab = 'all' }: MyTripsPageProps) {
  const { isSignedIn, user } = useUser();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TripStatus>(defaultTab);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!isSignedIn) {
        setTrips([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/trips');
        if (response.ok) {
          const data = await response.json();
          setTrips(data.trips || []);
        }
      } catch (error) {
        console.error('Failed to fetch trips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [isSignedIn]);

  const handleDeleteTrip = useCallback(async (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this trip?')) return;

    setTrips(prev => prev.filter(t => t.id !== tripId));

    try {
      const response = await fetch(`/api/trips?id=${tripId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete trip');
      }
    } catch (error) {
      console.error('Failed to delete trip:', error);
      const response = await fetch('/api/trips');
      if (response.ok) {
        const data = await response.json();
        setTrips(data.trips || []);
      }
    }
  }, []);

  const filteredTrips = trips.filter(trip => {
    const matchesTab = activeTab === 'all' || trip.status === activeTab;
    const matchesSearch = !searchQuery || 
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.preferences.route?.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const wishlistTrips = filteredTrips.filter(t => t.status === 'wishlist');
  const plannedTrips = filteredTrips.filter(t => t.status === 'planned' || t.status === 'completed');

  if (!isSignedIn) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-transparent p-8">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#e6f0f7] mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
              fill={COLORS.blubeezBlue}
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[#475f73] mb-2" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>
          Sign in to see your trips
        </h2>
        <p className="text-sm text-[#7286b0]" style={{ fontFamily: 'var(--font-poppins)' }}>
          Plan trips with our AI and save them here
        </p>
      </div>
    );
  }

  const tabs: { id: TripStatus; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'planned', label: 'Planned' },
    { id: 'completed', label: 'Completed' },
    { id: 'wishlist', label: 'Wishlist' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-transparent overflow-hidden">
      {/* Header */}
      <div className="px-4 md:px-6 pt-4 pb-2 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-[#e6f0f7] flex items-center justify-center">
            {user?.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt="Profile"
                width={48}
                height={48}
                className="object-cover"
              />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  fill={COLORS.blubeezBlue}
                />
              </svg>
            )}
          </div>
          <div>
            <h1
              className="text-[28px] md:text-[32px] font-semibold leading-tight"
              style={{
                fontFamily: 'var(--font-bricolage-grotesque)',
                color: '#475f73',
              }}
            >
              My trips
            </h1>
          </div>
        </div>

        {/* Search */}
        <div
          className="flex items-center justify-between px-4 py-[10px] rounded-xl border max-w-md mb-4"
          style={{
            backgroundColor: 'rgba(255,255,255,0.45)',
            borderColor: '#a8c2e1',
          }}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trips..."
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

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#475f73] text-white'
                  : 'bg-white/50 text-[#475f73] border border-[#a8c2e1] hover:bg-white/80'
              }`}
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-6 bg-transparent">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2f4f93]"></div>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#e6f0f7] mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                  stroke={COLORS.blubeezBlue}
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#475f73] mb-2" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>
              {searchQuery ? 'No matching trips' : activeTab === 'wishlist' ? 'No saved destinations' : 'No trips yet'}
            </h3>
            <p className="text-sm text-[#7286b0]" style={{ fontFamily: 'var(--font-poppins)' }}>
              {searchQuery 
                ? 'Try a different search term' 
                : activeTab === 'wishlist' 
                  ? 'Explore destinations and tap the heart to save them'
                  : 'Start chatting to plan your next adventure'}
            </p>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Wishlist Section (if showing all or wishlist tab) */}
            {(activeTab === 'all' || activeTab === 'wishlist') && wishlistTrips.length > 0 && (
              <div>
                {activeTab === 'all' && (
                  <h2 className="text-lg font-semibold text-[#475f73] mb-3" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>
                    Saved Destinations
                  </h2>
                )}
                <div
                  className="grid gap-4 md:gap-6 lg:gap-8 justify-center"
                  style={{
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 220px))',
                  }}
                >
                  {wishlistTrips.map(trip => (
                    <WishlistTripCard
                      key={trip.id}
                      trip={trip}
                      onClick={() => onTripClick?.(trip)}
                      onDelete={(e) => handleDeleteTrip(trip.id, e)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Planned/Completed Trips Section */}
            {(activeTab === 'all' || activeTab === 'planned' || activeTab === 'completed') && plannedTrips.length > 0 && (
              <div>
                {activeTab === 'all' && wishlistTrips.length > 0 && (
                  <h2 className="text-lg font-semibold text-[#475f73] mb-3 mt-6" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>
                    Your Trips
                  </h2>
                )}
                <div className="space-y-3">
                  {plannedTrips.map(trip => (
                    <PlannedTripCard
                      key={trip.id}
                      trip={trip}
                      onClick={() => onTripClick?.(trip)}
                      onDelete={(e) => handleDeleteTrip(trip.id, e)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface WishlistTripCardProps {
  trip: Trip;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function WishlistTripCard({ trip, onClick, onDelete }: WishlistTripCardProps) {
  const parseTitle = (title: string): string => {
    const match = title.match(/^(.+?)\s*\(([A-Z]{2})\)$/i);
    if (match) {
      return match[1].trim();
    }
    return title;
  };
  
  const countryName = parseTitle(trip.title);
  const displayName = getCountryDisplayName(countryName);
  const route = trip.preferences.route || [];
  const duration = trip.preferences.duration || '5 Days, 4 Nights';
  const priceINR = trip.preferences.price_inr;

  return (
    <div
      className="relative w-full aspect-[3/4] md:aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300"
      onClick={onClick}
    >
      <div className="absolute inset-0">
        <Image
          src={getDestinationImage(countryName)}
          alt={countryName}
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
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
        }}
      >
        <div className="flex flex-col text-white">
          {priceINR && (
            <>
              <p
                className="text-[10px] md:text-[12px] font-medium leading-tight"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                ₹ {priceINR.toLocaleString()}
              </p>
              <p
                className="text-[8px] md:text-[9px] font-medium opacity-90"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                Per person
              </p>
            </>
          )}
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

      <div 
        className="absolute bottom-3 md:bottom-4 right-3 md:right-4 z-10"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(e);
        }}
      >
        <HeartButton
          isLiked={true}
          onToggle={() => {}}
          size="sm"
        />
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-40 md:h-48 p-3 md:p-[18px] flex flex-col items-center justify-end"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
        }}
      >
        <div className="flex flex-col items-center gap-1.5 md:gap-2 w-full mb-1.5 md:mb-2">
          <div className="w-7 h-3.5 md:w-8 md:h-4 relative overflow-hidden rounded-sm">
            <Image
              src={getFlagImage(countryName)}
              alt={`${displayName} flag`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <p
            className="text-[10px] md:text-[12px] font-medium text-center text-white"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            {duration}
          </p>
        </div>

        <h3
          className="text-[18px] md:text-[24px] font-black italic text-center text-white uppercase w-full mb-0.5 md:mb-1"
          style={{
            fontFamily: 'var(--font-poppins)',
            fontWeight: 900,
          }}
        >
          {displayName}
        </h3>

        <div className="flex items-center gap-0.5 md:gap-1 justify-center w-full flex-wrap">
          {route.map((loc, i) => (
            <div key={i} className="flex items-center gap-0.5 md:gap-1">
              <span
                className="text-[8px] md:text-[9px] text-white"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                {loc}
              </span>
              {i < route.length - 1 && (
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
  );
}

interface PlannedTripCardProps {
  trip: Trip;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function PlannedTripCard({ trip, onClick, onDelete }: PlannedTripCardProps) {
  const parseTitle = (title: string): string => {
    const match = title.match(/^(.+?)\s*\(([A-Z]{2})\)$/i);
    if (match) {
      return match[1].trim();
    }
    return title;
  };
  
  const displayTitle = parseTitle(trip.title);
  const route = trip.preferences.route || [];
  const startDate = trip.start_date ? new Date(trip.start_date) : null;
  const endDate = trip.end_date ? new Date(trip.end_date) : null;
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDuration = () => {
    if (startDate && endDate) {
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return `${days} Days, ${days - 1} Nights`;
    }
    return trip.preferences.duration || 'Duration TBD';
  };

  return (
    <div
      className="relative bg-white rounded-xl border border-[#e0e8f0] p-4 cursor-pointer hover:shadow-md transition-shadow group"
      onClick={onClick}
    >
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden flex-shrink-0 relative">
          <Image
            src={getDestinationImage(displayTitle)}
            alt={displayTitle}
            fill
            className="object-cover"
            unoptimized
          />
          {/* Status badge */}
          <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium ${
            trip.status === 'completed' 
              ? 'bg-green-500 text-white' 
              : 'bg-[#475f73] text-white'
          }`}>
            {trip.status === 'completed' ? 'Completed' : 'Planned'}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#7286b0] mb-1" style={{ fontFamily: 'var(--font-poppins)' }}>
                {startDate ? formatDate(startDate) : 'Dates TBD'} • {getDuration()}
              </p>
              <h3 className="text-lg font-semibold text-[#475f73] mb-2" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>
                {displayTitle}
              </h3>
            </div>
            
            {/* Delete button */}
            <button
              onClick={onDelete}
              className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#ef4444"/>
              </svg>
            </button>
          </div>

          {/* Route */}
          {route.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {route.map((loc, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#2f4f93]" />
                    <span className="text-sm text-[#475f73]" style={{ fontFamily: 'var(--font-poppins)' }}>
                      {loc}
                    </span>
                  </div>
                  {i < route.length - 1 && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#a8c2e1]">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor"/>
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Description if available */}
          {trip.preferences.description && (
            <p className="text-sm text-[#7286b0] mt-2 line-clamp-2" style={{ fontFamily: 'var(--font-poppins)' }}>
              {trip.preferences.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


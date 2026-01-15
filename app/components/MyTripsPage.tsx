'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { COLORS } from '../constants/colors';
import { TripCard, TripDetailView } from './trips';
import { getDestinationImage, getFlagImage, getCountryDisplayName, getISO2Code } from '../utils/countryData';
import HeartButton from './HeartButton';

interface DayActivity {
  morning?: string;
  afternoon?: string;
  evening?: string;
}

interface Place {
  name: string;
  type: 'stays' | 'restaurants' | 'attraction' | 'activities';
  address?: string;
}

interface ItineraryDay {
  dayNumber: number;
  date?: string;
  location: string;
  title: string;
  description?: string;
  activities?: DayActivity;
  places?: Place[];
}

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
    country?: string;
    itinerary?: ItineraryDay[];
    travelers?: number;
    days?: number;
    nights?: number;
  };
  created_at: string;
}

interface MyTripsPageProps {
  onTripClick?: (trip: Trip) => void;
}

export default function MyTripsPage({ onTripClick }: MyTripsPageProps) {
  const { isSignedIn, user } = useUser();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

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
  
  const handleDeleteTrip = useCallback(async (tripId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
  
    setTrips(prev => prev.filter(t => t.id !== tripId));
    if (selectedTrip?.id === tripId) {
      setSelectedTrip(null);
    }
  
    try {
      const response = await fetch(`/api/trips?id=${tripId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Failed');
      }
    } catch {
      const response = await fetch('/api/trips');
      if (response.ok) {
        const data = await response.json();
        setTrips(data.trips || []);
      }
    }
  }, [selectedTrip]);

  const handleTripClick = (trip: Trip) => {
    setSelectedTrip(trip);
  };

  const handleCloseDetail = () => {
    setSelectedTrip(null);
  };
  
  const filteredTrips = trips.filter(trip => {
    const matchesSearch = !searchQuery || 
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.preferences.route?.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  // Convert Trip to format expected by TripCard
  const formatTripForCard = (trip: Trip) => {
    const parseTitle = (title: string): { name: string; country: string } => {
      const match = title.match(/^(.+?)\s*\(([A-Z]{2})\)$/i);
      if (match) {
        return { name: match[1].trim(), country: match[1].trim() };
      }
      return { name: title, country: trip.preferences.country || title };
    };
    
    const { name, country } = parseTitle(trip.title);
    const startDate = trip.start_date ? new Date(trip.start_date) : null;
    const endDate = trip.end_date ? new Date(trip.end_date) : null;
    
    let days = trip.preferences.days || 5;
    let nights = trip.preferences.nights || 4;
    
    if (startDate && endDate) {
      days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      nights = days - 1;
    }

    return {
      id: trip.id,
      title: name,
      country: country,
      iso2: trip.preferences.iso2 || getISO2Code(country),
      duration: trip.preferences.duration || `${days} Days, ${nights} Nights`,
      days,
      nights,
      tripType: trip.trip_type || undefined,
      travelers: trip.number_of_people || trip.preferences.travelers,
      startDate: trip.start_date || undefined,
      endDate: trip.end_date || undefined,
      destinations: trip.preferences.route,
      itinerary: trip.preferences.itinerary,
    };
  };

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

  // Show detail view when a trip is selected
  if (selectedTrip) {
    const formattedTrip = formatTripForCard(selectedTrip);
    return (
      <TripDetailView
        trip={formattedTrip}
        onClose={handleCloseDetail}
        onDelete={() => handleDeleteTrip(selectedTrip.id)}
      />
    );
  }

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
              {searchQuery ? 'No matching trips' : 'No trips yet'}
            </h3>
            <p className="text-sm text-[#7286b0]" style={{ fontFamily: 'var(--font-poppins)' }}>
              {searchQuery 
                ? 'Try a different search term' 
                : 'Start chatting to plan your next adventure'}
            </p>
          </div>
        ) : (
          <div className="mt-4">
            {/* Wishlist Section */}
            {wishlistTrips.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-[#475f73] mb-4" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>
                  Saved Destinations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {wishlistTrips.map(trip => {
                    const formattedTrip = formatTripForCard(trip);
                    return (
                      <TripCard
                        key={trip.id}
                        trip={formattedTrip}
                        onClick={() => handleTripClick(trip)}
                        onDelete={(e) => handleDeleteTrip(trip.id, e)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Planned Trips Section */}
            {plannedTrips.length > 0 && (
              <div>
                {wishlistTrips.length > 0 && (
                  <h2 className="text-lg font-semibold text-[#475f73] mb-4 mt-2" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>
                    Your Trips
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {plannedTrips.map(trip => {
                    const formattedTrip = formatTripForCard(trip);
                    return (
                      <TripCard
                        key={trip.id}
                        trip={formattedTrip}
                        onClick={() => handleTripClick(trip)}
                        onDelete={(e) => handleDeleteTrip(trip.id, e)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

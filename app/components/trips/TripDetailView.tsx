'use client';

import React, { useState } from 'react';
import { getDestinationImage, getFlagImage, getISO2Code } from '@/app/utils/countryData';

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

interface TripDetailViewProps {
  trip: {
    id: string;
    title: string;
    country?: string;
    iso2?: string;
    duration?: string;
    nights?: number;
    days?: number;
    imageUrl?: string;
    tripType?: string;
    travelers?: number;
    startDate?: string;
    endDate?: string;
    destinations?: string[];
    itinerary?: ItineraryDay[];
  };
  onClose: () => void;
  onDelete?: () => void;
}

export function TripDetailView({ trip, onClose, onDelete }: TripDetailViewProps) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));

  // Get unique locations from itinerary
  const locations = trip.itinerary 
    ? [...new Set(trip.itinerary.map(day => day.location))]
    : trip.destinations || [];

  // Filter days by selected location
  const filteredDays = selectedLocation
    ? trip.itinerary?.filter(day => day.location === selectedLocation)
    : trip.itinerary;

  const toggleDayExpanded = (dayNumber: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayNumber)) {
      newExpanded.delete(dayNumber);
    } else {
      newExpanded.add(dayNumber);
    }
    setExpandedDays(newExpanded);
  };

  const country = trip.country || 'Thailand';
  const flagUrl = getFlagImage(country);

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 md:p-6 border-b border-gray-100">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={flagUrl}
            alt={`${country} flag`}
            className="w-10 h-6 object-cover rounded-sm shadow-sm"
          />
          <div>
            <h1 
              className="text-xl md:text-2xl font-bold text-[#475f73]"
              style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
            >
              {trip.title}
            </h1>
            <p 
              className="text-sm text-gray-500"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              {trip.duration || `${trip.days || 5} Days`} • {country}
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Location Pills */}
      {locations.length > 0 && (
        <div className="flex items-center gap-2 px-4 md:px-6 py-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedLocation(null)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              selectedLocation === null
                ? 'bg-[#475f73] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            All
          </button>
          {locations.map((loc, idx) => (
            <React.Fragment key={loc}>
              {idx > 0 && (
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              <button
                onClick={() => setSelectedLocation(loc)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedLocation === loc
                    ? 'bg-[#475f73] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {loc}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Itinerary Timeline */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
        {filteredDays && filteredDays.length > 0 ? (
          <div className="space-y-0">
            {filteredDays.map((day, index) => (
              <DayItem
                key={day.dayNumber}
                day={day}
                isLast={index === filteredDays.length - 1}
                isExpanded={expandedDays.has(day.dayNumber)}
                onToggle={() => toggleDayExpanded(day.dayNumber)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="text-gray-500" style={{ fontFamily: 'var(--font-poppins)' }}>
              No itinerary details available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface DayItemProps {
  day: ItineraryDay;
  isLast: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

function DayItem({ day, isLast, isExpanded, onToggle }: DayItemProps) {
  const activities = day.activities || {};
  const places = day.places || [];
  
  // Categorize places
  const stays = places.filter(p => p.type === 'stays');
  const restaurants = places.filter(p => p.type === 'restaurants');
  const attractions = places.filter(p => p.type === 'attraction' || p.type === 'activities');

  return (
    <div className="flex gap-4">
      {/* Timeline indicator */}
      <div className="flex flex-col items-center">
        <div className="w-6 h-6 rounded-full bg-[#475f73] flex items-center justify-center flex-shrink-0">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gray-200 min-h-[40px]"></div>
        )}
      </div>

      {/* Day content */}
      <div className="flex-1 pb-6">
        {/* Day header */}
        <button 
          onClick={onToggle}
          className="w-full text-left"
        >
          <div className="flex items-baseline gap-2">
            <span 
              className="text-sm font-semibold text-[#475f73]"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Day {day.dayNumber}
            </span>
            {day.date && (
              <span 
                className="text-sm text-gray-400"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                {day.date}
              </span>
            )}
          </div>
          <h3 
            className="text-lg font-bold text-[#475f73] mt-0.5"
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            {day.title || day.location}
          </h3>
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-3 space-y-4">
            {/* Description */}
            {day.description && (
              <p 
                className="text-sm text-gray-600 leading-relaxed"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                {day.description}
              </p>
            )}

            {/* Activities */}
            {(activities.morning || activities.afternoon || activities.evening) && (
              <div className="space-y-3">
                {activities.morning && (
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center text-[10px] md:text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 flex-shrink-0">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                      </svg>
                      Morning
                    </span>
                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed pt-0.5" style={{ fontFamily: 'var(--font-poppins)' }}>
                      {activities.morning}
                    </p>
                  </div>
                )}

                {activities.afternoon && (
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center text-[10px] md:text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 flex-shrink-0">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707" />
                      </svg>
                      Afternoon
                    </span>
                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed pt-0.5" style={{ fontFamily: 'var(--font-poppins)' }}>
                      {activities.afternoon}
                    </p>
                  </div>
                )}

                {activities.evening && (
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center text-[10px] md:text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100 flex-shrink-0">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      Evening
                    </span>
                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed pt-0.5" style={{ fontFamily: 'var(--font-poppins)' }}>
                      {activities.evening}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Place categories */}
            {(stays.length > 0 || restaurants.length > 0 || attractions.length > 0) && (
              <div className="flex flex-wrap gap-6 mt-4">
                {stays.length > 0 && (
                  <div className="flex flex-col items-start">
                    <svg className="w-[18px] h-[18px] text-[#475f73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-xs text-gray-500 mt-2" style={{ fontFamily: 'var(--font-poppins)' }}>
                      {stays[0]?.name || 'Hotel'}
                    </span>
                  </div>
                )}

                {restaurants.length > 0 && (
                  <div className="flex flex-col items-start">
                    <svg className="w-[18px] h-[18px] text-[#475f73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-xs text-gray-500 mt-2" style={{ fontFamily: 'var(--font-poppins)' }}>
                      {restaurants[0]?.name || 'Restaurant'}
                    </span>
                  </div>
                )}

                {attractions.length > 0 && (
                  <div className="flex flex-col items-start">
                    <svg className="w-[18px] h-[18px] text-[#475f73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 22V12h6v10" />
                    </svg>
                    <span className="text-xs text-gray-500 mt-2" style={{ fontFamily: 'var(--font-poppins)' }}>
                      {attractions[0]?.name || 'Sightseeing'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Show more info button */}
            {!isExpanded && (
              <button 
                onClick={onToggle}
                className="flex items-center gap-1 text-sm text-[#475f73] hover:text-[#3a4d5c] mt-2"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                More info
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Collapsed state - show more info button */}
        {!isExpanded && (
          <button 
            onClick={onToggle}
            className="flex items-center gap-1 text-sm text-[#475f73] hover:text-[#3a4d5c] mt-2"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            More info
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { getDestinationImage, getFlagImage, getFlagImageByISO, getISO2Code, getCountryDisplayName, getCountryFromISO } from '@/app/utils/countryData';

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
    priceINR?: number;
    route?: string[];
  };
  onClose: () => void;
  onDelete?: () => void;
  onStartPlanning?: () => void;
  showPlanButton?: boolean;
}

// Strip markdown formatting
function stripMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*\*/g, '')
    .replace(/\*\*/g, '')
    .replace(/(?<!\*)\*(?!\*)/g, '')
    .replace(/___/g, '')
    .replace(/__/g, '')
    .replace(/(?<!_)_(?!_)/g, ' ')
    .replace(/#{1,6}\s/g, '')
    .replace(/`{3}[\s\S]*?`{3}/g, '')
    .replace(/`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function TripDetailView({ trip, onClose, onDelete, onStartPlanning, showPlanButton = false }: TripDetailViewProps) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));
  const [flagError, setFlagError] = useState(false);

  // Get country info - prioritize iso2 for reliable lookups
  const iso2 = trip.iso2 || getISO2Code(trip.country || trip.title);
  const country = trip.country || getCountryFromISO(iso2) || getCountryDisplayName(trip.title);
  const displayCountry = getCountryDisplayName(country);
  
  // Get flag URL using iso2 for reliability
  const flagUrl = iso2 && iso2 !== 'xx' 
    ? getFlagImageByISO(iso2) 
    : getFlagImage(country);

  // Display title - use country name if title is generic
  const displayTitle = trip.title === 'Trip' || !trip.title 
    ? displayCountry 
    : trip.title;

  // Get unique locations from itinerary
  const locations = trip.itinerary 
    ? [...new Set(trip.itinerary.map(day => day.location))]
    : trip.destinations || trip.route || [];

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

  // Check if itinerary has any meaningful content
  const hasItineraryContent = trip.itinerary && trip.itinerary.length > 0 && 
    trip.itinerary.some(day => 
      day.description || 
      day.activities?.morning || 
      day.activities?.afternoon || 
      day.activities?.evening ||
      (day.places && day.places.length > 0)
    );

  // Calculate days for empty state
  const totalDays = trip.days || (trip.nights ? trip.nights + 1 : 5);

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4 p-4 md:p-6 border-b border-gray-100">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={flagError ? `https://flagcdn.com/w80/xx.png` : flagUrl}
            alt={`${displayCountry} flag`}
            className="w-10 h-6 md:w-12 md:h-7 object-cover rounded-sm shadow-sm flex-shrink-0"
            onError={() => setFlagError(true)}
          />
          <div className="min-w-0">
            <h1 
              className="text-lg md:text-2xl font-bold text-[#475f73] truncate"
              style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
            >
              {displayTitle}
            </h1>
            <p 
              className="text-xs md:text-sm text-gray-500"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              {trip.duration || `${totalDays} Days`} • {displayCountry}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
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
        <div className="flex items-center gap-2 px-4 md:px-6 py-3 overflow-x-auto scrollbar-hide bg-gradient-to-r from-[#f8fbff] to-white">
          <button
            onClick={() => setSelectedLocation(null)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
              selectedLocation === null
                ? 'bg-[#2f4f93] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedLocation === loc
                    ? 'bg-[#2f4f93] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                <svg 
                  className={`w-3 h-3 md:w-3.5 md:h-3.5 ${selectedLocation === loc ? 'text-white' : 'text-[#2f4f93]'}`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {stripMarkdown(loc)}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Itinerary Timeline */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
        {hasItineraryContent && filteredDays && filteredDays.length > 0 ? (
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
          // Empty state - not planned yet
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-[#e8f0f7] to-[#d7e7f5] rounded-full flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-[#2f4f93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 
              className="text-lg font-semibold text-[#475f73] mb-2"
              style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
            >
              Not planned yet
            </h3>
            <p 
              className="text-sm text-[#7286b0] max-w-[250px] mb-6"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              This trip doesn't have a detailed itinerary. Start planning to add activities for each day!
            </p>
            {(showPlanButton || onStartPlanning) && (
              <button
                onClick={onStartPlanning}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#2f4f93] to-[#1e3a6e] text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Start Planning
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Bar - for explore trips */}
      {showPlanButton && hasItineraryContent && onStartPlanning && (
        <div className="flex-shrink-0 p-4 md:p-5 border-t border-gray-100 bg-white">
          <button
            onClick={onStartPlanning}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#2f4f93] to-[#1e3a6e] text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Continue Planning with Blu
          </button>
        </div>
      )}
      
      {/* Scrollbar hide styles */}
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

  // Check if this day has any content
  const hasContent = day.description || 
    activities.morning || activities.afternoon || activities.evening ||
    places.length > 0;

  // Clean title
  const cleanTitle = stripMarkdown(day.title || day.location);
  const cleanLocation = stripMarkdown(day.location);
  const displayName = cleanLocation && cleanLocation !== cleanTitle 
    ? cleanLocation 
    : cleanTitle || `Day ${day.dayNumber}`;

  return (
    <div className="flex gap-2 md:gap-3">
      {/* Timeline indicator */}
      <div className="flex flex-col items-center" style={{ width: '28px' }}>
        <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-br from-[#2f4f93] to-[#1e3a6e] flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white text-[10px] md:text-xs font-bold">{day.dayNumber}</span>
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-[#2f4f93] to-[#d7e7f5] mt-1" style={{ minHeight: '50px' }} />
        )}
      </div>

      {/* Day content */}
      <div className="flex-1 pb-5 md:pb-6">
        {/* Day header */}
        <button 
          onClick={onToggle}
          className="w-full text-left"
        >
          <div className="flex items-center gap-2 mb-0.5">
            <span 
              className="text-[10px] md:text-xs font-semibold text-[#2f4f93] uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Day {day.dayNumber}
            </span>
            {day.date && (
              <span 
                className="text-[10px] md:text-xs text-[#a7b8c7]"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                • {day.date}
              </span>
            )}
          </div>
          <h3 
            className="text-sm md:text-base font-semibold text-[#132341] leading-tight"
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            {displayName}
          </h3>
        </button>

        {/* Not planned state for individual day */}
        {!hasContent && (
          <p className="text-xs text-[#a7b8c7] mt-2 italic" style={{ fontFamily: 'var(--font-poppins)' }}>
            Not planned yet
          </p>
        )}

        {/* Expanded content */}
        {isExpanded && hasContent && (
          <div className="mt-3 space-y-3 md:space-y-4 animate-fadeIn">
            {/* Description */}
            {day.description && !activities.morning && !activities.afternoon && !activities.evening && (
              <p 
                className="text-xs md:text-sm text-[#475f73] leading-relaxed"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                {stripMarkdown(day.description)}
              </p>
            )}

            {/* Time-based activities with colored badges */}
            {(activities.morning || activities.afternoon || activities.evening) && (
              <div className="space-y-2.5">
                {activities.morning && (
                  <div className="flex items-start gap-2">
                    <span className="inline-flex items-center text-[10px] md:text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 flex-shrink-0">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                      </svg>
                      Morning
                    </span>
                    <p className="text-xs md:text-sm text-[#475f73] leading-relaxed flex-1 pt-0.5" style={{ fontFamily: 'var(--font-poppins)' }}>
                      {stripMarkdown(activities.morning)}
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
                    <p className="text-xs md:text-sm text-[#475f73] leading-relaxed flex-1 pt-0.5" style={{ fontFamily: 'var(--font-poppins)' }}>
                      {stripMarkdown(activities.afternoon)}
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
                    <p className="text-xs md:text-sm text-[#475f73] leading-relaxed flex-1 pt-0.5" style={{ fontFamily: 'var(--font-poppins)' }}>
                      {stripMarkdown(activities.evening)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Place categories with styled pills */}
            {(stays.length > 0 || restaurants.length > 0 || attractions.length > 0) && (
              <div className="pt-2 border-t border-[#e8f0f7]">
                <p className="text-[10px] md:text-xs text-[#a7b8c7] uppercase tracking-wide mb-2 font-medium">
                  Places
                </p>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {stays.map((place, idx) => (
                    <div
                      key={`stay-${idx}`}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-red-50 text-red-600 border-red-200"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-[11px] md:text-xs font-medium">{stripMarkdown(place.name)}</span>
                    </div>
                  ))}
                  {restaurants.map((place, idx) => (
                    <div
                      key={`food-${idx}`}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-teal-50 text-teal-600 border-teal-200"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="text-[11px] md:text-xs font-medium">{stripMarkdown(place.name)}</span>
                    </div>
                  ))}
                  {attractions.map((place, idx) => (
                    <div
                      key={`attr-${idx}`}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-yellow-50 text-yellow-700 border-yellow-200"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                      <span className="text-[11px] md:text-xs font-medium">{stripMarkdown(place.name)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Collapsed state - show expand button */}
        {!isExpanded && hasContent && (
          <button 
            onClick={onToggle}
            className="flex items-center gap-1.5 mt-2 text-xs md:text-sm text-[#2f4f93] hover:text-[#1e3a6e] transition-colors font-medium group"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            <span>Show details</span>
            <svg
              className="w-3.5 h-3.5 md:w-4 md:h-4 transform transition-transform duration-200 group-hover:translate-y-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}

        {/* Expanded - show collapse button */}
        {isExpanded && hasContent && (
          <button 
            onClick={onToggle}
            className="flex items-center gap-1.5 mt-3 text-xs md:text-sm text-[#2f4f93] hover:text-[#1e3a6e] transition-colors font-medium group"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            <span>Show less</span>
            <svg
              className="w-3.5 h-3.5 md:w-4 md:h-4 transform rotate-180 transition-transform duration-200 group-hover:-translate-y-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

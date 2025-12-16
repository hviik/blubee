'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Itinerary } from '@/app/types/itinerary';
import { DayCard } from './DayCard';

// Strip markdown formatting from text
function stripMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/__/g, '')
    .replace(/_/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/`/g, '')
    .trim();
}

interface ItineraryPanelProps {
  itinerary: Itinerary | null;
  onLocationSelect?: (locationId: string) => void;
}

export function ItineraryPanel({ itinerary, onLocationSelect }: ItineraryPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const uniqueLocations = itinerary?.locations?.filter((location) => {
    const name = location.name.toLowerCase();
    return !name.includes(' to ') && !name.includes(' -> ') && !name.includes('return to');
  }) || [];
  
  const [activeLocation, setActiveLocation] = useState<string | null>(
    uniqueLocations?.[0]?.id || null
  );
  
  useEffect(() => {
    if (uniqueLocations.length > 0 && !activeLocation) {
      const firstLocationId = uniqueLocations[0].id;
      setActiveLocation(firstLocationId);
      onLocationSelect?.(firstLocationId);
    }
  }, [itinerary, uniqueLocations.length, activeLocation, onLocationSelect]);

  if (!itinerary) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#f8fbff] to-white">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#e8f0f7] rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-[#7286b0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-sm md:text-base font-semibold text-[#132341] mb-1">No itinerary yet</h3>
          <p className="text-xs md:text-sm text-[#7286b0] max-w-[200px]">
            Chat with blu to plan your perfect trip
          </p>
        </div>
      </div>
    );
  }

  const handleLocationClick = (locationId: string) => {
    setActiveLocation(locationId);
    onLocationSelect?.(locationId);
  };

  const filteredDays = itinerary.days
    .filter((day) => {
      if (!activeLocation) return true;
      const location = uniqueLocations.find((loc) => loc.id === activeLocation);
      if (!location) return false;
      const dayLocation = day.location.toLowerCase();
      const locationName = location.name.toLowerCase();
      return dayLocation.includes(locationName) || dayLocation === locationName;
    })
    .sort((a, b) => a.dayNumber - b.dayNumber);

  return (
    <div className="flex flex-col h-full bg-transparent relative">

      <div className="p-3 md:p-4 pt-4 md:pt-5 flex-shrink-0">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 bg-white rounded-xl px-3 md:px-4 py-2 md:py-2.5 shadow-sm hover:shadow-md transition-all border border-[#e8f0f7]"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5 text-[#2f4f93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-xs md:text-sm text-[#132341] font-semibold">Your Itinerary</span>
          {itinerary && (
            <span className="text-[10px] md:text-xs text-[#7286b0] bg-[#f0f7ff] px-2 py-0.5 rounded-full">
              {itinerary.totalDays} days
            </span>
          )}
          <svg
            className={`w-4 h-4 text-[#7286b0] transform transition-transform duration-200 ml-auto ${
              isCollapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <div
          className="flex-1 border border-[#d7e7f5] mt-2 overflow-hidden flex flex-col rounded-t-xl shadow-lg"
          style={{ minHeight: '200px' }}
        >
          <div className="bg-gradient-to-r from-[#f8fbff] to-white border-b border-[#d7e7f5] p-2.5 md:p-3 flex-shrink-0">
            <p className="text-[10px] md:text-xs text-[#a7b8c7] uppercase tracking-wider mb-2 font-medium">
              Destinations
            </p>
            <div className="flex items-center gap-1 md:gap-1.5 flex-wrap">
              {uniqueLocations.map((location, index) => (
                <div key={location.id} className="flex items-center">
                  <button
                    onClick={() => handleLocationClick(location.id)}
                    className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg text-[11px] md:text-xs font-medium transition-all duration-200 ${
                      activeLocation === location.id
                        ? 'bg-[#2f4f93] text-white shadow-md'
                        : 'bg-white text-[#475f73] hover:bg-[#e8f0f7] border border-[#d7e7f5]'
                    }`}
                  >
                    <svg 
                      className={`w-3 h-3 md:w-3.5 md:h-3.5 ${activeLocation === location.id ? 'text-white' : 'text-[#2f4f93]'}`}
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{stripMarkdown(location.name)}</span>
                  </button>
                  {index < uniqueLocations.length - 1 && (
                    <svg
                      className="w-4 h-4 mx-0.5 text-[#cbd5e1]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div 
            className="flex-1 overflow-y-auto bg-white"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 #f1f5f9'
            }}
          >
            <div className="p-3 md:p-4">
              {filteredDays.length > 0 ? (
                <div className="space-y-1">
                  {filteredDays.map((day, index) => (
                    <DayCard
                      key={day.dayNumber}
                      day={day}
                      isFirst={index === 0}
                      isLast={index === filteredDays.length - 1}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 md:py-12">
                  <div className="w-12 h-12 mx-auto mb-3 bg-[#f0f7ff] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#7286b0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs md:text-sm text-[#7286b0]">No days planned for this location</p>
                </div>
              )}
            </div>
          </div>

          {filteredDays.length > 3 && (
            <div className="absolute bottom-4 right-4">
              <button
                onClick={() => {
                  const scrollContainer = document.querySelector('.overflow-y-auto');
                  scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-4 h-4 text-[#475f73]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

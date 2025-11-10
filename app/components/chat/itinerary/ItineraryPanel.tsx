'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Itinerary } from '@/app/types/itinerary';
import { DayCard } from './DayCard';

interface ItineraryPanelProps {
  itinerary: Itinerary | null;
  onLocationSelect?: (locationId: string) => void;
}

export function ItineraryPanel({ itinerary, onLocationSelect }: ItineraryPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [panelHeight, setPanelHeight] = useState<number>(377);
  const [isDragging, setIsDragging] = useState(false);
  const [activeLocation, setActiveLocation] = useState<string | null>(
    itinerary?.locations?.[0]?.id || null
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  // --- Hooks must always be declared before any early returns ---

  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      // Get the parent container that has data-itinerary-container
      const container = document.querySelector('[data-itinerary-container]') as HTMLElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const newHeight = rect.bottom - e.clientY;

      // Allow expanding all the way up (min 100px) or all the way down (max 95% of container)
      const minHeight = 100;
      const maxHeight = rect.height * 0.95;
      const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

      setPanelHeight(clampedHeight);
    },
    [isDragging]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  // --- After all hooks are defined, we can safely early-return ---
  if (!itinerary) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white border border-[#d7e7f5]">
        <div className="text-center p-8">
          <div className="text-[#7286b0] mb-2">
            <Image
              src="/assets/logo-icon.svg"
              alt="Logo"
              width={48}
              height={48}
              className="mx-auto opacity-30 mb-4"
            />
          </div>
          <p className="text-sm text-[#7286b0]">
            Start planning your trip to see the itinerary here
          </p>
        </div>
      </div>
    );
  }

  const handleLocationClick = (locationId: string) => {
    setActiveLocation(locationId);
    onLocationSelect?.(locationId);
  };

  const filteredDays = itinerary.days.filter((day) => {
    if (!activeLocation) return true;
    const location = itinerary.locations.find((loc) => loc.id === activeLocation);
    return location && day.location === location.name;
  });

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.preventDefault();
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Drag Handle */}
      <div
        onMouseDown={handleDragStart}
        className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-blue-100 z-10 flex items-center justify-center"
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
      </div>

      {/* Header */}
      <div className="p-4 pt-6 flex-shrink-0">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1 bg-white rounded-full px-3 py-2 shadow-md hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm text-[#475f73] font-medium">Generated itinerary</span>
          <div
            className={`transform transition-transform duration-200 ${
              isCollapsed ? 'rotate-180' : ''
            }`}
          >
            <svg
              className="w-[18px] h-[18px] text-[#475f73]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </div>
        </button>
      </div>

      {/* Itinerary Content */}
      {!isCollapsed && (
        <div
          ref={containerRef}
          className="flex-1 border border-[#d7e7f5] mt-4 overflow-hidden flex flex-col"
          style={{ height: `${panelHeight}px` }}
        >
          {/* Location Tabs */}
          <div className="bg-white border-b border-[#d7e7f5] p-4 flex-shrink-0">
            <div className="flex items-center gap-1 flex-wrap">
              {itinerary.locations.map((location, index) => (
                <div key={location.id} className="flex items-center gap-1">
                  <button
                    onClick={() => handleLocationClick(location.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors ${
                      activeLocation === location.id
                        ? 'bg-[#475f73] text-[#eff7ff]'
                        : 'bg-[#e8f0f7] text-[#475f73] hover:bg-[#d7e7f5]'
                    }`}
                  >
                    <Image
                      src="/assets/logo-icon.svg"
                      alt="Location"
                      width={12}
                      height={12}
                      className={activeLocation === location.id ? 'brightness-0 invert' : ''}
                    />
                    <span>{location.name}</span>
                  </button>
                  {index < itinerary.locations.length - 1 && (
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-[#475f73] rotate-90"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Days List */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="p-4 space-y-0">
              {filteredDays.map((day, index) => (
                <DayCard
                  key={day.dayNumber}
                  day={day}
                  isFirst={index === 0}
                  isLast={index === filteredDays.length - 1}
                />
              ))}
            </div>
          </div>

          {/* Scroll-to-top Button */}
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

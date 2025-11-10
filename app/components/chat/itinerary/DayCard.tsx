'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ItineraryDay } from '@/app/types/itinerary';

interface DayCardProps {
  day: ItineraryDay;
  isFirst?: boolean;
  isLast?: boolean;
  onExpand?: (dayNumber: number) => void;
}

export function DayCard({ day, isFirst, isLast, onExpand }: DayCardProps) {
  const [isExpanded, setIsExpanded] = useState(day.expanded || false);

  const handleToggleExpand = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (onExpand) onExpand(day.dayNumber);
  };

  return (
    <div className="flex gap-3 w-full">
      {/* Location Icon & Line */}
      <div className="flex flex-col items-center" style={{ width: '24px' }}>
        <div className="relative w-6 h-6 flex-shrink-0">
          <Image
            src="/assets/logo-icon.svg"
            alt="Location"
            width={24}
            height={24}
            className="text-[#2f4f93]"
          />
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-[#d7e7f5] mt-1" style={{ minHeight: '92px' }} />
        )}
      </div>

      {/* Day Content */}
      <div className="flex-1 pb-6">
        {/* Day Header */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-[#2f4f93]">DAY {day.dayNumber}</span>
            <span className="text-sm text-[#7286b0]">- {day.date}</span>
          </div>
          <h3 className="text-base font-medium text-[#132341] leading-snug">
            {day.title}
          </h3>
        </div>

        {/* Description */}
        {isExpanded && (
          <p className="text-sm text-[#7286b0] mb-4 leading-relaxed">
            {day.description}
          </p>
        )}

        {/* Activity Icons */}
        {isExpanded && day.activities && (
          <div className="flex gap-6 mb-4">
            {day.activities.icon?.hotel && (
              <div className="flex flex-col items-center gap-2">
                <Image
                  src="/assets/bookmark-bag.svg"
                  alt="Hotel"
                  width={18}
                  height={18}
                  className="opacity-70"
                />
                <span className="text-xs text-[#7286b0]">
                  {day.activities.hotel || 'Hotel stay'}
                </span>
              </div>
            )}
            
            {day.activities.icon?.travel && (
              <div className="flex flex-col items-center gap-2">
                <Image
                  src="/assets/travel-explore.svg"
                  alt="Travel"
                  width={18}
                  height={18}
                  className="opacity-70"
                />
                <span className="text-xs text-[#7286b0]">
                  {day.activities.food || 'Travel'}
                </span>
              </div>
            )}
            
            {day.activities.icon?.sightseeing && (
              <div className="flex flex-col items-center gap-2">
                <Image
                  src="/assets/explore.svg"
                  alt="Sightseeing"
                  width={18}
                  height={18}
                  className="opacity-70"
                />
                <span className="text-xs text-[#7286b0]">
                  {day.activities.sightseeing || 'Sightseeing'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* More Info Button */}
        <button
          onClick={handleToggleExpand}
          className="flex items-center gap-2 text-sm text-[#7286b0] hover:text-[#2f4f93] transition-colors group"
        >
          <span className="uppercase tracking-wide">
            {isExpanded ? 'Less info' : 'More info'}
          </span>
          <div
            className={`transform transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}


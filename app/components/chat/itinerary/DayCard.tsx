'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ItineraryDay, Place } from '@/app/types/itinerary';

interface DayCardProps {
  day: ItineraryDay;
  isFirst?: boolean;
  isLast?: boolean;
  onExpand?: (dayNumber: number) => void;
}

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

// Get icon for place type
function getPlaceIcon(type: string): string {
  switch (type) {
    case 'stays':
      return '/assets/bookmark-bag.svg';
    case 'restaurants':
      return '/assets/stat-0.svg';
    case 'attraction':
      return '/assets/travel-explore.svg';
    case 'activities':
      return '/assets/explore.svg';
    default:
      return '/assets/logo-icon.svg';
  }
}

// Get label for place type
function getPlaceTypeLabel(type: string): string {
  switch (type) {
    case 'stays':
      return 'Stay';
    case 'restaurants':
      return 'Food';
    case 'attraction':
      return 'Visit';
    case 'activities':
      return 'Activity';
    default:
      return 'Place';
  }
}

// Parse activities from description text
function parseActivities(description: string): { morning?: string; afternoon?: string; evening?: string } {
  const activities: { morning?: string; afternoon?: string; evening?: string } = {};
  
  const morningMatch = description.match(/morning[:\s]+([^.]+\.?)/i);
  const afternoonMatch = description.match(/afternoon[:\s]+([^.]+\.?)/i);
  const eveningMatch = description.match(/evening[:\s]+([^.]+\.?)/i);
  
  if (morningMatch) activities.morning = stripMarkdown(morningMatch[1]).trim();
  if (afternoonMatch) activities.afternoon = stripMarkdown(afternoonMatch[1]).trim();
  if (eveningMatch) activities.evening = stripMarkdown(eveningMatch[1]).trim();
  
  return activities;
}

export function DayCard({ day, isFirst, isLast, onExpand }: DayCardProps) {
  const [isExpanded, setIsExpanded] = useState(day.expanded || false);

  const handleToggleExpand = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (onExpand) onExpand(day.dayNumber);
  };

  // Clean up title
  const cleanTitle = stripMarkdown(day.title);
  const cleanLocation = stripMarkdown(day.location);
  
  // Get activities from either the activities object or parse from description
  const activities = day.activities && (day.activities.morning || day.activities.afternoon || day.activities.evening)
    ? {
        morning: typeof day.activities === 'object' ? day.activities.morning : undefined,
        afternoon: typeof day.activities === 'object' ? day.activities.afternoon : undefined,
        evening: typeof day.activities === 'object' ? day.activities.evening : undefined,
      }
    : parseActivities(day.description || '');

  // Get places array
  const places = day.places || [];

  return (
    <div className="flex gap-2 md:gap-3 w-full">
      {/* Timeline indicator */}
      <div className="flex flex-col items-center" style={{ width: '20px' }}>
        <div className="relative w-5 h-5 md:w-6 md:h-6 flex-shrink-0 bg-[#2f4f93] rounded-full flex items-center justify-center">
          <span className="text-white text-[10px] md:text-xs font-bold">{day.dayNumber}</span>
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-[#2f4f93] to-[#d7e7f5] mt-1" style={{ minHeight: '60px' }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4 md:pb-6">
        {/* Header */}
        <div className="mb-2 md:mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs md:text-sm font-semibold text-[#2f4f93] uppercase tracking-wide">
              Day {day.dayNumber}
            </span>
            {day.date && (
              <span className="text-xs text-[#a7b8c7]">• {day.date}</span>
            )}
          </div>
          <h3 className="text-sm md:text-base font-semibold text-[#132341] leading-tight">
            {cleanLocation || cleanTitle}
          </h3>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="space-y-3 md:space-y-4">
            {/* Time-based activities */}
            {(activities.morning || activities.afternoon || activities.evening) && (
              <div className="space-y-2">
                {activities.morning && (
                  <div className="flex items-start gap-2">
                    <div className="flex items-center justify-center w-16 md:w-20 flex-shrink-0">
                      <span className="text-[10px] md:text-xs font-medium text-[#f59e0b] bg-amber-50 px-2 py-0.5 rounded-full">
                        Morning
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-[#475f73] leading-relaxed flex-1">
                      {activities.morning}
                    </p>
                  </div>
                )}
                {activities.afternoon && (
                  <div className="flex items-start gap-2">
                    <div className="flex items-center justify-center w-16 md:w-20 flex-shrink-0">
                      <span className="text-[10px] md:text-xs font-medium text-[#3b82f6] bg-blue-50 px-2 py-0.5 rounded-full">
                        Afternoon
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-[#475f73] leading-relaxed flex-1">
                      {activities.afternoon}
                    </p>
                  </div>
                )}
                {activities.evening && (
                  <div className="flex items-start gap-2">
                    <div className="flex items-center justify-center w-16 md:w-20 flex-shrink-0">
                      <span className="text-[10px] md:text-xs font-medium text-[#8b5cf6] bg-purple-50 px-2 py-0.5 rounded-full">
                        Evening
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-[#475f73] leading-relaxed flex-1">
                      {activities.evening}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Description (fallback if no structured activities) */}
            {!activities.morning && !activities.afternoon && !activities.evening && day.description && (
              <p className="text-xs md:text-sm text-[#475f73] leading-relaxed">
                {stripMarkdown(day.description)}
              </p>
            )}

            {/* Places */}
            {places.length > 0 && (
              <div className="pt-2 border-t border-[#e8f0f7]">
                <p className="text-[10px] md:text-xs text-[#a7b8c7] uppercase tracking-wide mb-2 font-medium">
                  Places to visit
                </p>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {places.map((place, idx) => (
                    <div
                      key={place.id || idx}
                      className="flex items-center gap-1 px-2 py-1 bg-[#f0f7ff] rounded-full border border-[#d7e7f5]"
                    >
                      <Image
                        src={getPlaceIcon(place.type)}
                        alt={place.type}
                        width={12}
                        height={12}
                        className="opacity-70"
                      />
                      <span className="text-[10px] md:text-xs text-[#475f73] font-medium">
                        {stripMarkdown(place.name)}
                      </span>
                      <span className="text-[8px] md:text-[10px] text-[#a7b8c7]">
                        {getPlaceTypeLabel(place.type)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity icons from old format */}
            {day.activities?.icon && (
              <div className="flex gap-4 md:gap-6 pt-2">
                {day.activities.icon.hotel && (
                  <div className="flex items-center gap-1.5">
                    <Image
                      src="/assets/bookmark-bag.svg"
                      alt="Hotel"
                      width={14}
                      height={14}
                      className="opacity-60"
                    />
                    <span className="text-[10px] md:text-xs text-[#7286b0]">
                      {day.activities.hotel || 'Hotel'}
                    </span>
                  </div>
                )}
                {day.activities.icon.travel && (
                  <div className="flex items-center gap-1.5">
                    <Image
                      src="/assets/travel-explore.svg"
                      alt="Travel"
                      width={14}
                      height={14}
                      className="opacity-60"
                    />
                    <span className="text-[10px] md:text-xs text-[#7286b0]">Travel</span>
                  </div>
                )}
                {day.activities.icon.sightseeing && (
                  <div className="flex items-center gap-1.5">
                    <Image
                      src="/assets/explore.svg"
                      alt="Sightseeing"
                      width={14}
                      height={14}
                      className="opacity-60"
                    />
                    <span className="text-[10px] md:text-xs text-[#7286b0]">
                      {day.activities.sightseeing || 'Sightseeing'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Expand/collapse button */}
        <button
          onClick={handleToggleExpand}
          className="flex items-center gap-1.5 mt-2 text-xs md:text-sm text-[#2f4f93] hover:text-[#1e3a6e] transition-colors font-medium"
        >
          <span>{isExpanded ? 'Show less' : 'Show details'}</span>
          <svg
            className={`w-3 h-3 md:w-4 md:h-4 transform transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
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
        </button>
      </div>
    </div>
  );
}

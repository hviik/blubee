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

// Comprehensive markdown stripper
function stripMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*\*/g, '')           // Bold italic
    .replace(/\*\*/g, '')              // Bold
    .replace(/(?<!\*)\*(?!\*)/g, '')   // Single asterisk (italic) but not bold
    .replace(/___/g, '')               // Bold italic underscore
    .replace(/__/g, '')                // Bold underscore
    .replace(/(?<!_)_(?!_)/g, ' ')     // Single underscore (preserve word separation)
    .replace(/#{1,6}\s/g, '')          // Headers
    .replace(/`{3}[\s\S]*?`{3}/g, '')  // Code blocks
    .replace(/`/g, '')                 // Inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links - keep text
    .replace(/^[-*+]\s+/gm, '')        // List items with bullet
    .replace(/^\d+\.\s+/gm, '')        // Numbered lists
    .replace(/^>\s+/gm, '')            // Block quotes
    .replace(/\n{3,}/g, '\n\n')        // Multiple newlines
    .replace(/\s{2,}/g, ' ')           // Multiple spaces
    .trim();
}

// Clean text that might contain "Day X:" prefix
function cleanDayTitle(text: string, dayNumber: number): string {
  if (!text) return '';
  // Remove "Day X:" or "Day X -" prefixes
  const cleaned = text
    .replace(/^day\s*\d+\s*[-:]\s*/i, '')
    .replace(/^\*\*day\s*\d+\s*[-:]\s*\*\*/i, '')
    .replace(/^\*\*day\s*\d+\*\*\s*[-:]\s*/i, '');
  return stripMarkdown(cleaned);
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

// Get color for place type
function getPlaceTypeColor(type: string): string {
  switch (type) {
    case 'stays':
      return 'bg-red-50 text-red-600 border-red-200';
    case 'restaurants':
      return 'bg-teal-50 text-teal-600 border-teal-200';
    case 'attraction':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'activities':
      return 'bg-green-50 text-green-600 border-green-200';
    default:
      return 'bg-blue-50 text-blue-600 border-blue-200';
  }
}

// Parse activities from description text
function parseActivities(description: string): { morning?: string; afternoon?: string; evening?: string } {
  const activities: { morning?: string; afternoon?: string; evening?: string } = {};
  
  if (!description) return activities;
  
  // Try to match patterns like "Morning: ...", "**Morning:** ...", etc.
  const morningPatterns = [
    /\*\*morning[:\s]*\*\*\s*([^*\n]+)/i,
    /morning[:\s]+([^.\n]+\.?)/i,
    /^\s*[-•]\s*morning[:\s]+([^\n]+)/im,
  ];
  
  const afternoonPatterns = [
    /\*\*afternoon[:\s]*\*\*\s*([^*\n]+)/i,
    /afternoon[:\s]+([^.\n]+\.?)/i,
    /^\s*[-•]\s*afternoon[:\s]+([^\n]+)/im,
  ];
  
  const eveningPatterns = [
    /\*\*evening[:\s]*\*\*\s*([^*\n]+)/i,
    /evening[:\s]+([^.\n]+\.?)/i,
    /^\s*[-•]\s*evening[:\s]+([^\n]+)/im,
    /\*\*night[:\s]*\*\*\s*([^*\n]+)/i,
    /night[:\s]+([^.\n]+\.?)/i,
  ];
  
  for (const pattern of morningPatterns) {
    const match = description.match(pattern);
    if (match) {
      activities.morning = stripMarkdown(match[1]).trim();
      break;
    }
  }
  
  for (const pattern of afternoonPatterns) {
    const match = description.match(pattern);
    if (match) {
      activities.afternoon = stripMarkdown(match[1]).trim();
      break;
    }
  }
  
  for (const pattern of eveningPatterns) {
    const match = description.match(pattern);
    if (match) {
      activities.evening = stripMarkdown(match[1]).trim();
      break;
    }
  }
  
  return activities;
}

// Extract a clean summary from description if no structured activities
function extractSummary(description: string): string {
  if (!description) return '';
  
  // Remove time-based sections to avoid duplication
  let cleaned = description
    .replace(/\*\*morning[:\s]*\*\*[^*\n]+/gi, '')
    .replace(/\*\*afternoon[:\s]*\*\*[^*\n]+/gi, '')
    .replace(/\*\*evening[:\s]*\*\*[^*\n]+/gi, '')
    .replace(/morning[:\s]+[^.\n]+\.?/gi, '')
    .replace(/afternoon[:\s]+[^.\n]+\.?/gi, '')
    .replace(/evening[:\s]+[^.\n]+\.?/gi, '')
    .replace(/night[:\s]+[^.\n]+\.?/gi, '');
  
  cleaned = stripMarkdown(cleaned);
  
  // If nothing left after cleanup, return original stripped
  if (!cleaned.trim()) {
    return stripMarkdown(description);
  }
  
  return cleaned;
}

export function DayCard({ day, isFirst, isLast, onExpand }: DayCardProps) {
  const [isExpanded, setIsExpanded] = useState(day.expanded || false);

  const handleToggleExpand = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (onExpand) onExpand(day.dayNumber);
  };

  // Clean up title and location
  const cleanTitle = cleanDayTitle(day.title, day.dayNumber);
  const cleanLocation = stripMarkdown(day.location);
  
  // Display name - prefer location if it's different from title
  const displayName = cleanLocation && cleanLocation !== cleanTitle 
    ? cleanLocation 
    : cleanTitle || `Day ${day.dayNumber}`;
  
  // Get activities from either the activities object or parse from description
  let activities: { morning?: string; afternoon?: string; evening?: string } = {};
  
  if (day.activities) {
    if (typeof day.activities === 'object') {
      activities = {
        morning: day.activities.morning ? stripMarkdown(day.activities.morning) : undefined,
        afternoon: day.activities.afternoon ? stripMarkdown(day.activities.afternoon) : undefined,
        evening: day.activities.evening ? stripMarkdown(day.activities.evening) : undefined,
      };
    }
  }
  
  // If no structured activities, try to parse from description
  if (!activities.morning && !activities.afternoon && !activities.evening && day.description) {
    activities = parseActivities(day.description);
  }

  const hasTimeActivities = !!(activities.morning || activities.afternoon || activities.evening);

  // Get places array
  const places = day.places || [];

  // Get summary text (description minus time-based content)
  const summaryText = !hasTimeActivities ? extractSummary(day.description) : '';

  return (
    <div className="flex gap-2 md:gap-3 w-full">
      {/* Timeline indicator */}
      <div className="flex flex-col items-center" style={{ width: '24px' }}>
        <div className="relative w-6 h-6 md:w-7 md:h-7 flex-shrink-0 bg-gradient-to-br from-[#2f4f93] to-[#1e3a6e] rounded-full flex items-center justify-center shadow-sm">
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
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] md:text-xs font-semibold text-[#2f4f93] uppercase tracking-wide">
              Day {day.dayNumber}
            </span>
            {day.date && (
              <span className="text-[10px] md:text-xs text-[#a7b8c7]">• {day.date}</span>
            )}
          </div>
          <h3 className="text-sm md:text-base font-semibold text-[#132341] leading-tight">
            {displayName}
          </h3>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="space-y-3 md:space-y-4 animate-fadeIn">
            {/* Time-based activities */}
            {hasTimeActivities && (
              <div className="space-y-2.5">
                {activities.morning && (
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-0.5">
                      <span className="inline-flex items-center text-[10px] md:text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                        </svg>
                        Morning
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-[#475f73] leading-relaxed flex-1 pt-0.5">
                      {activities.morning}
                    </p>
                  </div>
                )}
                {activities.afternoon && (
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-0.5">
                      <span className="inline-flex items-center text-[10px] md:text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707" />
                        </svg>
                        Afternoon
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-[#475f73] leading-relaxed flex-1 pt-0.5">
                      {activities.afternoon}
                    </p>
                  </div>
                )}
                {activities.evening && (
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-0.5">
                      <span className="inline-flex items-center text-[10px] md:text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        Evening
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-[#475f73] leading-relaxed flex-1 pt-0.5">
                      {activities.evening}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Description summary (only if no structured activities) */}
            {!hasTimeActivities && summaryText && (
              <p className="text-xs md:text-sm text-[#475f73] leading-relaxed">
                {summaryText}
              </p>
            )}

            {/* Places to visit */}
            {places.length > 0 && (
              <div className="pt-2 border-t border-[#e8f0f7]">
                <p className="text-[10px] md:text-xs text-[#a7b8c7] uppercase tracking-wide mb-2 font-medium">
                  Places to visit
                </p>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {places.map((place, idx) => (
                    <div
                      key={place.id || idx}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${getPlaceTypeColor(place.type)}`}
                    >
                      <Image
                        src={getPlaceIcon(place.type)}
                        alt={place.type}
                        width={14}
                        height={14}
                        className="opacity-80"
                      />
                      <span className="text-[11px] md:text-xs font-medium">
                        {stripMarkdown(place.name)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legacy activity icons from old format */}
            {day.activities?.icon && (
              <div className="flex gap-4 md:gap-6 pt-2 border-t border-[#e8f0f7]">
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
                      {day.activities.hotel ? stripMarkdown(day.activities.hotel) : 'Hotel'}
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
                      {day.activities.sightseeing ? stripMarkdown(day.activities.sightseeing) : 'Sightseeing'}
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
          className="flex items-center gap-1.5 mt-2 text-xs md:text-sm text-[#2f4f93] hover:text-[#1e3a6e] transition-colors font-medium group"
        >
          <span>{isExpanded ? 'Show less' : 'Show details'}</span>
          <svg
            className={`w-3.5 h-3.5 md:w-4 md:h-4 transform transition-transform duration-200 group-hover:translate-y-0.5 ${
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

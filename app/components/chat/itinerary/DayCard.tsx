'use client';

import { useState } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
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
    <div className="flex gap-2 md:gap-3 w-full">
      <div className="flex flex-col items-center" style={{ width: '20px' }}>
        <div className="relative w-5 h-5 md:w-6 md:h-6 flex-shrink-0">
          <Image
            src="/assets/logo-icon.svg"
            alt="Location"
            width={20}
            height={20}
            className="text-[#2f4f93] md:w-6 md:h-6"
          />
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-[#d7e7f5] mt-1" style={{ minHeight: '80px' }} />
        )}
      </div>

      <div className="flex-1 pb-4 md:pb-6">
        <div className="mb-1.5 md:mb-2">
          <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
            <span className="text-xs md:text-sm font-medium text-[#2f4f93]">DAY {day.dayNumber}</span>
            <span className="text-xs md:text-sm text-[#7286b0]">- {day.date}</span>
          </div>
          <h3 className="text-sm md:text-base font-medium text-[#132341] leading-snug">
            {day.title}
          </h3>
        </div>

        {isExpanded && (
          <div className="mb-3 md:mb-4 prose prose-sm max-w-none [&_p]:text-xs [&_p]:md:text-sm [&_p]:text-[#7286b0] [&_p]:mb-2 [&_p]:leading-relaxed [&_strong]:text-[#132341] [&_strong]:font-semibold [&_ul]:text-xs [&_ul]:md:text-sm [&_ul]:text-[#7286b0] [&_li]:mb-1">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
            >
              {day.description}
            </ReactMarkdown>
          </div>
        )}

        {isExpanded && day.activities && (
          <div className="flex gap-4 md:gap-6 mb-3 md:mb-4">
            {day.activities.icon?.hotel && (
              <div className="flex flex-col items-center gap-1 md:gap-2">
                <Image
                  src="/assets/bookmark-bag.svg"
                  alt="Hotel"
                  width={16}
                  height={16}
                  className="opacity-70 md:w-[18px] md:h-[18px]"
                />
                <span className="text-[10px] md:text-xs text-[#7286b0]">
                  {day.activities.hotel || 'Hotel stay'}
                </span>
              </div>
            )}
            
            {day.activities.icon?.travel && (
              <div className="flex flex-col items-center gap-1 md:gap-2">
                <Image
                  src="/assets/travel-explore.svg"
                  alt="Travel"
                  width={16}
                  height={16}
                  className="opacity-70 md:w-[18px] md:h-[18px]"
                />
                <span className="text-[10px] md:text-xs text-[#7286b0]">
                  {day.activities.food || 'Travel'}
                </span>
              </div>
            )}
            
            {day.activities.icon?.sightseeing && (
              <div className="flex flex-col items-center gap-1 md:gap-2">
                <Image
                  src="/assets/explore.svg"
                  alt="Sightseeing"
                  width={16}
                  height={16}
                  className="opacity-70 md:w-[18px] md:h-[18px]"
                />
                <span className="text-[10px] md:text-xs text-[#7286b0]">
                  {day.activities.sightseeing || 'Sightseeing'}
                </span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleToggleExpand}
          className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-[#7286b0] hover:text-[#2f4f93] transition-colors group"
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
              className="w-3 h-3 md:w-4 md:h-4"
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


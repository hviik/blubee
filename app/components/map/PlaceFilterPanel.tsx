'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PlaceFilters } from '@/app/types/itinerary';

interface PlaceFilterPanelProps {
  filters: PlaceFilters;
  onFilterChange: (filters: PlaceFilters) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function PlaceFilterPanel({
  filters,
  onFilterChange,
  onClose,
  isOpen,
}: PlaceFilterPanelProps) {
  const handleFilterToggle = (filterKey: keyof PlaceFilters) => {
    if (filterKey === 'all') {
      // If "All" is selected, uncheck all others
      onFilterChange({
        all: true,
        stays: false,
        restaurants: false,
        attraction: false,
        activities: false,
        locations: false,
        showPrices: filters.showPrices,
      });
    } else if (filterKey === 'showPrices') {
      onFilterChange({
        ...filters,
        showPrices: !filters.showPrices,
      });
    } else {
      // Toggle individual filter and uncheck "All"
      onFilterChange({
        ...filters,
        all: false,
        [filterKey]: !filters[filterKey],
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-4">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="flex items-center gap-1 rounded-full bg-white px-3 py-2 shadow-lg hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm text-[#475f73]">Close</span>
        <Image
          src="/assets/close.svg"
          alt="Close"
          width={18}
          height={18}
          className="opacity-70"
        />
      </button>

      {/* Info Button */}
      <button className="rounded-full bg-white p-2 shadow-lg hover:bg-gray-50 transition-colors">
        <Image
          src="/assets/help.svg"
          alt="Info"
          width={18}
          height={18}
          className="opacity-70"
        />
      </button>

      {/* Filter Panel */}
      <div className="bg-white rounded-lg shadow-lg p-3 flex flex-col gap-3 min-w-[161px]">
        {/* All Option */}
        <button
          onClick={() => handleFilterToggle('all')}
          className="flex items-center gap-2 hover:bg-gray-50 rounded px-1 transition-colors"
        >
          <div className="w-[18px] h-[18px] flex items-center justify-center">
            {filters.all ? (
              <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              </div>
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
            )}
          </div>
          <span className="text-sm text-[#a7b8c7]">All</span>
        </button>

        <div className="h-px bg-[#d7e7f5]"></div>

        {/* Filter Options */}
        <div className="flex flex-col gap-2">
          {/* Stays */}
          <FilterCheckbox
            label="Stays"
            icon="/assets/bookmark-bag.svg"
            checked={filters.stays}
            onChange={() => handleFilterToggle('stays')}
          />

          {/* Restaurants */}
          <FilterCheckbox
            label="Restaurants"
            icon="/assets/stat-0.svg"
            checked={filters.restaurants}
            onChange={() => handleFilterToggle('restaurants')}
          />

          {/* Attraction */}
          <FilterCheckbox
            label="Attraction"
            icon="/assets/travel-explore.svg"
            checked={filters.attraction}
            onChange={() => handleFilterToggle('attraction')}
          />

          {/* Activities */}
          <FilterCheckbox
            label="Activities"
            icon="/assets/explore.svg"
            checked={filters.activities}
            onChange={() => handleFilterToggle('activities')}
          />

          {/* Locations */}
          <FilterCheckbox
            label="Locations"
            icon="/assets/logo-icon.svg"
            checked={filters.locations}
            onChange={() => handleFilterToggle('locations')}
          />
        </div>

        <div className="h-px bg-[#d7e7f5]"></div>

        {/* Show Prices Toggle */}
        <button
          onClick={() => handleFilterToggle('showPrices')}
          className="flex items-center gap-2 hover:bg-gray-50 rounded px-1 transition-colors"
        >
          <div className="w-[18px] h-[18px] flex items-center justify-center">
            {filters.showPrices ? (
              <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              </div>
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
            )}
          </div>
          <span className="text-sm text-[#a7b8c7]">Show prices</span>
        </button>
      </div>
    </div>
  );
}

interface FilterCheckboxProps {
  label: string;
  icon: string;
  checked: boolean;
  onChange: () => void;
}

function FilterCheckbox({ label, icon, checked, onChange }: FilterCheckboxProps) {
  return (
    <button
      onClick={onChange}
      className="flex items-center gap-2 hover:bg-gray-50 rounded px-1 transition-colors"
    >
      <div className="w-[18px] h-[18px] flex items-center justify-center">
        {checked ? (
          <div className="w-4 h-4 border-2 border-blue-500 rounded bg-blue-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6L5 9L10 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : (
          <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
        )}
      </div>
      <Image
        src={icon}
        alt={label}
        width={18}
        height={18}
        className="opacity-70"
      />
      <span className="text-sm text-[#a7b8c7]">{label}</span>
    </button>
  );
}


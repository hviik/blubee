'use client';

import Image from 'next/image';
import { PlaceFilters } from '@/app/types/itinerary';

interface PlaceFilterPanelProps {
  filters: PlaceFilters;
  onFilterChange: (filters: PlaceFilters) => void;
  onClose: () => void;
  isOpen: boolean;
}

// Get active filter count
function getActiveFilterCount(filters: PlaceFilters): number {
  if (filters.all) return 0; // "All" doesn't count as a specific filter
  let count = 0;
  if (filters.stays) count++;
  if (filters.restaurants) count++;
  if (filters.attraction) count++;
  if (filters.activities) count++;
  if (filters.locations) count++;
  return count;
}

export function PlaceFilterPanel({
  filters,
  onFilterChange,
  onClose,
  isOpen,
}: PlaceFilterPanelProps) {
  
  const handleFilterToggle = (filterKey: keyof PlaceFilters) => {
    if (filterKey === 'all') {
      // Toggle "All" on - turns off all specific filters
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
      // Toggle specific filter
      const newValue = !filters[filterKey];
      const newFilters = {
        ...filters,
        all: false, // Turn off "All" when selecting specific filters
        [filterKey]: newValue,
      };
      
      // Check if no specific filters are selected - turn on "All"
      const hasAnyFilter = newFilters.stays || newFilters.restaurants || 
                           newFilters.attraction || newFilters.activities || newFilters.locations;
      
      if (!hasAnyFilter) {
        newFilters.all = true;
      }
      
      onFilterChange(newFilters);
    }
  };

  const activeCount = getActiveFilterCount(filters);

  if (!isOpen) return null;

  return (
    <div className="absolute right-4 top-4 z-10 flex flex-col items-end gap-3">
      {/* Close button */}
      <button
        onClick={onClose}
        className="flex items-center gap-1.5 rounded-full bg-white px-3 py-2 shadow-lg hover:bg-gray-50 transition-colors border border-gray-100"
      >
        <span className="text-sm text-[#475f73] font-medium">Close</span>
        <svg className="w-4 h-4 text-[#475f73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Filter panel */}
      <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col gap-3 min-w-[180px] border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <span className="text-sm font-semibold text-[#132341]">Filters</span>
          {activeCount > 0 && (
            <span className="text-xs bg-[#2f4f93] text-white px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>

        {/* All filter */}
        <button
          onClick={() => handleFilterToggle('all')}
          className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-all ${
            filters.all ? 'bg-[#2f4f93]/10' : 'hover:bg-gray-50'
          }`}
        >
          <div className="w-5 h-5 flex items-center justify-center">
            {filters.all ? (
              <div className="w-4 h-4 rounded-full border-2 border-[#2f4f93] flex items-center justify-center bg-white">
                <div className="w-2 h-2 rounded-full bg-[#2f4f93]" />
              </div>
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
            )}
          </div>
          <span className={`text-sm ${filters.all ? 'text-[#2f4f93] font-medium' : 'text-[#475f73]'}`}>
            Show All
          </span>
        </button>

        <div className="h-px bg-gray-100" />

        {/* Individual filters */}
        <div className="flex flex-col gap-1.5">
          <FilterCheckbox
            label="Stays"
            icon="/assets/bookmark-bag.svg"
            color="#FF6B6B"
            checked={filters.stays}
            onChange={() => handleFilterToggle('stays')}
          />

          <FilterCheckbox
            label="Restaurants"
            icon="/assets/stat-0.svg"
            color="#4ECDC4"
            checked={filters.restaurants}
            onChange={() => handleFilterToggle('restaurants')}
          />

          <FilterCheckbox
            label="Attractions"
            icon="/assets/travel-explore.svg"
            color="#FFD93D"
            checked={filters.attraction}
            onChange={() => handleFilterToggle('attraction')}
          />

          <FilterCheckbox
            label="Activities"
            icon="/assets/explore.svg"
            color="#95E1D3"
            checked={filters.activities}
            onChange={() => handleFilterToggle('activities')}
          />

          <FilterCheckbox
            label="Locations"
            icon="/assets/logo-icon.svg"
            color="#2f4f93"
            checked={filters.locations}
            onChange={() => handleFilterToggle('locations')}
          />
        </div>

        <div className="h-px bg-gray-100" />

        {/* Show prices toggle */}
        <button
          onClick={() => handleFilterToggle('showPrices')}
          className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-all ${
            filters.showPrices ? 'bg-green-50' : 'hover:bg-gray-50'
          }`}
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <div className={`w-8 h-4 rounded-full transition-colors ${
              filters.showPrices ? 'bg-green-500' : 'bg-gray-300'
            }`}>
              <div className={`w-3 h-3 rounded-full bg-white shadow transition-transform mt-0.5 ${
                filters.showPrices ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
              }`} />
            </div>
          </div>
          <span className={`text-sm ${filters.showPrices ? 'text-green-600 font-medium' : 'text-[#475f73]'}`}>
            Show prices
          </span>
        </button>
      </div>
    </div>
  );
}

interface FilterCheckboxProps {
  label: string;
  icon: string;
  color: string;
  checked: boolean;
  onChange: () => void;
}

function FilterCheckbox({ label, icon, color, checked, onChange }: FilterCheckboxProps) {
  return (
    <button
      onClick={onChange}
      className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-all ${
        checked ? 'bg-gray-50' : 'hover:bg-gray-50'
      }`}
    >
      <div className="w-5 h-5 flex items-center justify-center">
        {checked ? (
          <div 
            className="w-4 h-4 rounded flex items-center justify-center"
            style={{ backgroundColor: color }}
          >
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
          <div className="w-4 h-4 border-2 border-gray-300 rounded" />
        )}
      </div>
      <div 
        className="w-4 h-4 rounded-full flex items-center justify-center"
        style={{ backgroundColor: checked ? color : 'transparent' }}
      >
        <Image
          src={icon}
          alt={label}
          width={12}
          height={12}
          className={checked ? 'brightness-0 invert' : 'opacity-60'}
        />
      </div>
      <span className={`text-sm ${checked ? 'text-[#132341] font-medium' : 'text-[#475f73]'}`}>
        {label}
      </span>
    </button>
  );
}

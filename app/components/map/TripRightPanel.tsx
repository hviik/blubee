'use client';

import { useState, useEffect } from 'react';
import { Itinerary, Place } from '@/app/types/itinerary';
import { MapPanel } from './MapPanel';
import { ItineraryPanel } from './ItineraryPanel';
import { useGoogleMaps } from '@/app/hooks/useGoogleMaps';

interface TripRightPanelProps {
  itinerary: Itinerary | null;
  places?: Place[];
  onLocationSelect?: (locationId: string) => void;
}

export function TripRightPanel({
  itinerary,
  places = [],
  onLocationSelect,
}: TripRightPanelProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>();
  const [mapZoom, setMapZoom] = useState<number>(6);

  // Update map center when itinerary changes
  useEffect(() => {
    if (itinerary && itinerary.locations.length > 0) {
      // Center on first location
      setMapCenter(itinerary.locations[0].coordinates);
      setMapZoom(itinerary.locations.length === 1 ? 10 : 6);
    }
  }, [itinerary]);

  const handleLocationSelect = (locationId: string) => {
    if (itinerary) {
      const location = itinerary.locations.find((loc) => loc.id === locationId);
      if (location) {
        setMapCenter(location.coordinates);
        setMapZoom(10);
      }
    }
    if (onLocationSelect) {
      onLocationSelect(locationId);
    }
  };

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <p className="text-red-600 font-medium">Failed to load Google Maps</p>
          <p className="text-sm text-red-500 mt-2">
            Please check your API key configuration
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2f4f93] mx-auto mb-4"></div>
          <p className="text-sm text-[#7286b0]">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Map Section - Fixed height */}
      <div className="relative" style={{ height: '585px' }}>
        <MapPanel
          locations={itinerary?.locations || []}
          places={places}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>

      {/* Itinerary Section - Takes remaining space */}
      <div className="flex-1 overflow-hidden">
        <ItineraryPanel
          itinerary={itinerary}
          onLocationSelect={handleLocationSelect}
        />
      </div>
    </div>
  );
}


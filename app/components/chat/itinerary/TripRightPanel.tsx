'use client';

import { useState, useEffect } from 'react';
import { Itinerary, Place } from '@/app/types/itinerary';
import { MapPanel } from '../map/MapPanel';
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
      const validLocations = itinerary.locations.filter(
        loc => loc.coordinates && loc.coordinates.lat !== 0 && loc.coordinates.lng !== 0
      );
      
      if (validLocations.length > 0) {
        // If multiple locations, let fitBounds handle it, otherwise center on first
        if (validLocations.length === 1) {
          setMapCenter(validLocations[0].coordinates);
          setMapZoom(12); // Better zoom for single location
        } else {
          // For multiple locations, center on first but use better default zoom
          setMapCenter(validLocations[0].coordinates);
          setMapZoom(8); // Better default zoom for multiple locations (was 6, too zoomed out)
        }
      }
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
    <div className="w-full h-full flex flex-col bg-white relative" data-itinerary-container>
      {/* Map Section - Flexible, takes remaining space */}
      <div className="flex-1 relative min-h-0">
        {isLoaded && mapCenter && (
          <MapPanel
            locations={itinerary?.locations || []}
            places={places}
            center={mapCenter}
            zoom={mapZoom}
          />
        )}
      </div>

      {/* Itinerary Section - Absolute positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <ItineraryPanel
          itinerary={itinerary}
          onLocationSelect={handleLocationSelect}
        />
      </div>
    </div>
  );
}


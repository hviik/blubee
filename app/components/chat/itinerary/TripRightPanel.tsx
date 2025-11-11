'use client';

import { useState, useEffect } from 'react';
import { Itinerary, Place } from '@/app/types/itinerary';
import { MapPanel } from '../map/MapPanel';
import { ItineraryPanel } from './ItineraryPanel';
import { useGoogleMaps } from '../map/useGoogleMaps';

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
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ 
    lat: 15.8700, 
    lng: 100.9925 
  });
  const [mapZoom, setMapZoom] = useState<number>(6);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  useEffect(() => {
    if (itinerary && itinerary.locations.length > 0) {
      const validLocations = itinerary.locations.filter(
        loc => loc.coordinates && loc.coordinates.lat !== 0 && loc.coordinates.lng !== 0
      );
      
      if (validLocations.length > 0) {
        if (validLocations.length === 1) {
          setMapCenter(validLocations[0].coordinates);
          setMapZoom(12);
        } else {
          setMapCenter(validLocations[0].coordinates);
          setMapZoom(8);
        }
      }
    }
  }, [itinerary]);

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocationId(locationId);
    
    if (itinerary) {
      const location = itinerary.locations.find((loc) => loc.id === locationId);
      if (location && location.coordinates) {
        if (location.coordinates.lat !== 0 || location.coordinates.lng !== 0) {
          console.log('Zooming to location:', location.name, location.coordinates);
          setMapCenter(location.coordinates);
          setMapZoom(14);
        } else {
          console.warn('Location has invalid coordinates:', location.name);
        }
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
      <div className="flex-1 relative min-h-0">
        {isLoaded && (
          <MapPanel
            locations={itinerary?.locations || []}
            places={places}
            center={mapCenter}
            zoom={mapZoom}
            selectedLocationId={selectedLocationId}
          />
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20">
        <ItineraryPanel
          itinerary={itinerary}
          onLocationSelect={handleLocationSelect}
        />
      </div>
    </div>
  );
}


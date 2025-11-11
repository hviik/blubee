'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Itinerary, Place } from '@/app/types/itinerary';
import { MapPanel } from '../map/MapPanel';
import { ItineraryPanel } from './ItineraryPanel';
import { useGoogleMaps } from '../map/useGoogleMaps';

interface TripRightPanelProps {
  itinerary: Itinerary | null;
  places?: Place[];
  onLocationSelect?: (locationId: string) => void;
  mobileView?: 'itinerary' | 'map' | null;
}

export function TripRightPanel({
  itinerary,
  places = [],
  onLocationSelect,
  mobileView = null,
}: TripRightPanelProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ 
    lat: 15.8700, 
    lng: 100.9925 
  });
  const [mapZoom, setMapZoom] = useState<number>(6);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [itineraryHeight, setItineraryHeight] = useState<number>(377);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
          const bounds = new window.google.maps.LatLngBounds();
          validLocations.forEach(loc => {
            bounds.extend(new window.google.maps.LatLng(loc.coordinates.lat, loc.coordinates.lng));
          });
          const center = bounds.getCenter();
          setMapCenter({ lat: center.lat(), lng: center.lng() });
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
          setMapCenter(location.coordinates);
          setMapZoom(14);
        }
      }
    }
    if (onLocationSelect) {
      onLocationSelect(locationId);
    }
  };

  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const newHeight = rect.bottom - e.clientY;

      const minHeight = 100;
      const maxHeight = rect.height - 100;
      const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

      setItineraryHeight(clampedHeight);
    },
    [isDragging]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
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

  if (mobileView === 'itinerary') {
    return (
      <div className="w-full h-full bg-white overflow-auto">
        <ItineraryPanel
          itinerary={itinerary}
          onLocationSelect={handleLocationSelect}
        />
      </div>
    );
  }

  if (mobileView === 'map') {
    return (
      <div className="w-full h-full bg-white">
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
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex flex-col bg-white relative" 
      data-itinerary-container
    >
      <div 
        className="relative"
        style={{ 
          flex: `0 0 calc(100% - ${itineraryHeight}px)`,
          minHeight: 0
        }}
      >
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

      <div
        onMouseDown={handleDragStart}
        className="relative h-2 cursor-ns-resize bg-transparent hover:bg-blue-200/50 z-30 flex items-center justify-center group transition-colors"
        style={{ 
          touchAction: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          flexShrink: 0
        }}
      >
        <div className="w-20 h-1.5 bg-gray-300 rounded-full group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-200 shadow-sm"></div>
      </div>

      <div 
        className="relative overflow-hidden"
        style={{ 
          height: `${itineraryHeight}px`,
          flexShrink: 0
        }}
      >
        <ItineraryPanel
          itinerary={itinerary}
          onLocationSelect={handleLocationSelect}
        />
      </div>
    </div>
  );
}
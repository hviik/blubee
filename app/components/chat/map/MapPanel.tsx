'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PlaceFilters, Place, MapMarker, TripLocation } from '@/app/types/itinerary';
import { PlaceFilterPanel } from './PlaceFilterPanel';

interface MapPanelProps {
  locations: TripLocation[];
  places?: Place[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onPlaceClick?: (place: Place) => void;
}

export function MapPanel({
  locations,
  places = [],
  center = { lat: 15.8700, lng: 100.9925 }, // Default: Southeast Asia
  zoom = 6,
  onPlaceClick,
}: MapPanelProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<MapMarker[]>([]);
  
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [filters, setFilters] = useState<PlaceFilters>({
    all: true,
    stays: false,
    restaurants: false,
    attraction: false,
    activities: false,
    locations: false,
    showPrices: false,
  });

  // Initialize Google Map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Wait for Google Maps to load
    if (typeof google === 'undefined') {
      console.error('Google Maps not loaded');
      return;
    }

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    mapInstanceRef.current = map;

    // Add location markers for trip destinations
    locations.forEach((location) => {
      const marker = new google.maps.Marker({
        position: location.coordinates,
        map,
        title: location.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#2f4f93',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 8px; font-family: Poppins, sans-serif;">
          <strong>${location.name}</strong>
        </div>`,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    });

    // Fit bounds to show all locations
    if (locations.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      locations.forEach((location) => {
        bounds.extend(location.coordinates);
      });
      map.fitBounds(bounds);
    }
  }, [center, zoom, locations]);

  // Update markers based on filters and places
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing place markers
    markersRef.current.forEach(({ marker }) => {
      if (marker) marker.setMap(null);
    });
    markersRef.current = [];

    // Filter places based on active filters
    const filteredPlaces = places.filter((place) => {
      if (filters.all) return true;
      return filters[place.type];
    });

    // Add new markers
    filteredPlaces.forEach((place) => {
      const marker = new google.maps.Marker({
        position: place.location,
        map: mapInstanceRef.current,
        title: place.name,
        icon: getMarkerIcon(place.type),
      });

      const content = `
        <div style="padding: 12px; font-family: Poppins, sans-serif; max-width: 200px;">
          <strong style="color: #2f4f93;">${place.name}</strong>
          ${place.rating ? `<div style="color: #666; font-size: 12px; margin-top: 4px;">⭐ ${place.rating}</div>` : ''}
          ${filters.showPrices && place.priceLevel ? `<div style="color: #666; font-size: 12px;">${'$'.repeat(place.priceLevel)}</div>` : ''}
          ${place.address ? `<div style="color: #888; font-size: 11px; margin-top: 4px;">${place.address}</div>` : ''}
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({ content });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current!, marker);
        if (onPlaceClick) onPlaceClick(place);
      });

      markersRef.current.push({ place, marker });
    });
  }, [places, filters, onPlaceClick]);

  const getMarkerIcon = (type: Place['type']): google.maps.Symbol => {
    const icons: Record<Place['type'], string> = {
      stays: '#FF6B6B',
      restaurants: '#4ECDC4',
      attraction: '#FFD93D',
      activities: '#95E1D3',
      locations: '#2f4f93',
    };

    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 6,
      fillColor: icons[type],
      fillOpacity: 0.9,
      strokeColor: '#ffffff',
      strokeWeight: 2,
    };
  };

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Dark gradient overlay at top */}
      <div
        className="absolute top-0 left-0 right-0 h-[201px] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0) 100%)',
        }}
      />

      {/* Filter Panel */}
      <PlaceFilterPanel
        filters={filters}
        onFilterChange={setFilters}
        onClose={() => setIsFilterOpen(false)}
        isOpen={isFilterOpen}
      />

      {/* Toggle filter button when closed */}
      {!isFilterOpen && (
        <button
          onClick={() => setIsFilterOpen(true)}
          className="absolute right-4 top-4 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors"
        >
          <svg
            className="w-5 h-5 text-[#475f73]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}


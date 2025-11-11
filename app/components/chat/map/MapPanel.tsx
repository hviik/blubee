'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PlaceFilters, Place, MapMarker, TripLocation } from '@/app/types/itinerary';
import { PlaceFilterPanel } from './PlaceFilterPanel';
import { PlaceInfoCard } from './PlaceInfoCard';
import { searchPlaces } from './googlePlaces';

interface MapPanelProps {
  locations: TripLocation[];
  places?: Place[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onPlaceClick?: (place: Place) => void;
  selectedLocationId?: string | null;
}

export function MapPanel({
  locations,
  places = [],
  center = { lat: 15.8700, lng: 100.9925 },
  zoom = 6,
  onPlaceClick,
  selectedLocationId,
}: MapPanelProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<MapMarker[]>([]);
  const locationMarkersRef = useRef<google.maps.Marker[]>([]);
  
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [filters, setFilters] = useState<PlaceFilters>({
    all: true,
    stays: false,
    restaurants: false,
    attraction: false,
    activities: false,
    locations: false,
    showPrices: false,
  });

  useEffect(() => {
    if (!mapRef.current) return;

    if (typeof google === 'undefined' || !google.maps) {
      console.error('Google Maps not loaded');
      return;
    }

    if (!center || (center.lat === 0 && center.lng === 0)) {
      console.warn('Invalid map center coordinates');
      return;
    }

    if (!mapInstanceRef.current) {
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
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
    } else {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo(center);
        mapInstanceRef.current.setZoom(zoom);
      }
    }

    const map = mapInstanceRef.current;

    locationMarkersRef.current.forEach((marker) => marker.setMap(null));
    locationMarkersRef.current = [];

    const existingMarkers = markersRef.current.filter(m => !m.place && m.location);
    existingMarkers.forEach(({ marker }) => {
      if (marker) marker.setMap(null);
    });
    markersRef.current = markersRef.current.filter(m => m.place || !m.location);

    locations
      .filter(location => location.coordinates && location.coordinates.lat !== 0 && location.coordinates.lng !== 0)
      .forEach((location) => {
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

        markersRef.current.push({ location, marker });
      });

    const validLocations = locations.filter(loc => loc.coordinates && loc.coordinates.lat !== 0 && loc.coordinates.lng !== 0);
    if (validLocations.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      validLocations.forEach((location) => {
        bounds.extend(location.coordinates);
      });
      
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const latDiff = Math.abs(ne.lat() - sw.lat());
      const lngDiff = Math.abs(ne.lng() - sw.lng());
      
      if (latDiff > 10 || lngDiff > 10) {
        map.setCenter(validLocations[0].coordinates);
        map.setZoom(8);
      } else {
        map.fitBounds(bounds, {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50,
        });
        
        const listener = google.maps.event.addListener(map, 'bounds_changed', () => {
          if (map.getZoom() && map.getZoom()! < 6) {
            map.setZoom(6);
          }
          google.maps.event.removeListener(listener);
        });
      }
    } else if (validLocations.length === 1) {
      map.setCenter(validLocations[0].coordinates);
      map.setZoom(zoom || 12);
    }
  }, [center, zoom, locations]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    markersRef.current.forEach(({ marker }) => {
      if (marker) marker.setMap(null);
    });
    markersRef.current = [];

    const filteredPlaces = places.filter((place) => {
      if (filters.all) return true;
      return filters[place.type];
    });

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
        setSelectedPlace(place);
        mapInstanceRef.current?.panTo(place.location);
        if (onPlaceClick) onPlaceClick(place);
      });

      markersRef.current.push({ place, marker });
    });
  }, [places, filters, onPlaceClick]);

  useEffect(() => {
    if (!selectedLocationId || !mapInstanceRef.current || locations.length === 0) return;

    const selectedLocation = locations.find(loc => loc.id === selectedLocationId);
    if (!selectedLocation || !selectedLocation.coordinates) return;

    const { lat, lng } = selectedLocation.coordinates;
    if (lat === 0 && lng === 0) return;

    searchPlaces(mapInstanceRef.current, {
      location: { lat, lng },
      radius: 3000,
      type: 'attraction',
    })
      .then((places) => {
        setNearbyPlaces(places);
      })
      .catch((error) => {
        console.error('Failed to fetch nearby places:', error);
      });
  }, [selectedLocationId, locations]);

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
      <div ref={mapRef} className="w-full h-full" />

      <div
        className="absolute top-0 left-0 right-0 h-[201px] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0) 100%)',
        }}
      />

      <PlaceInfoCard
        place={selectedPlace}
        map={mapInstanceRef.current}
        onClose={() => setSelectedPlace(null)}
      />

      <PlaceFilterPanel
        filters={filters}
        onFilterChange={setFilters}
        onClose={() => setIsFilterOpen(false)}
        isOpen={isFilterOpen}
      />

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


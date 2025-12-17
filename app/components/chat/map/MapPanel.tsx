'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PlaceFilters, Place, MapMarker, TripLocation, ItineraryDay } from '@/app/types/itinerary';
import { PlaceFilterPanel } from './PlaceFilterPanel';
import { searchPlaces } from './googlePlaces';

// Comprehensive markdown stripper
function stripMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*\*/g, '')      // Bold italic
    .replace(/\*\*/g, '')         // Bold
    .replace(/\*/g, '')           // Italic or bullet
    .replace(/___/g, '')          // Bold italic underscore
    .replace(/__/g, '')           // Bold underscore
    .replace(/_/g, ' ')           // Italic underscore (replace with space to preserve word separation)
    .replace(/#{1,6}\s/g, '')     // Headers
    .replace(/`{3}[\s\S]*?`{3}/g, '') // Code blocks
    .replace(/`/g, '')            // Inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links - keep text
    .replace(/^[-*+]\s/gm, '')    // List items
    .replace(/^\d+\.\s/gm, '')    // Numbered lists
    .replace(/^>\s/gm, '')        // Block quotes
    .replace(/\n{3,}/g, '\n\n')   // Multiple newlines
    .trim();
}

function generateId(): string {
  return `place_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

interface MapPanelProps {
  locations: TripLocation[];
  places?: Place[];
  days?: ItineraryDay[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onPlaceClick?: (place: Place) => void;
  selectedLocationId?: string | null;
}

export function MapPanel({
  locations,
  places = [],
  days = [],
  center = { lat: 15.8700, lng: 100.9925 },
  zoom = 6,
  onPlaceClick,
  selectedLocationId,
}: MapPanelProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<MapMarker[]>([]);
  const locationMarkersRef = useRef<google.maps.Marker[]>([]);
  const prevLocationsRef = useRef<string>('');
  const prevCenterRef = useRef<{ lat: number; lng: number } | null>(null);
  const prevZoomRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);
  const infoWindowsRef = useRef<google.maps.InfoWindow[]>([]);
  
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [filters, setFilters] = useState<PlaceFilters>({
    all: true, // Default to all
    stays: false,
    restaurants: false,
    attraction: false,
    activities: false,
    locations: false,
    showPrices: false,
  });

  // Extract places from itinerary days
  const itineraryPlaces = useCallback((): Place[] => {
    const extractedPlaces: Place[] = [];
    
    days.forEach((day, dayIndex) => {
      // Add places from day.places array
      if (day.places && day.places.length > 0) {
        day.places.forEach((place, placeIndex) => {
          if (!extractedPlaces.find(p => p.name === place.name)) {
            extractedPlaces.push({
              ...place,
              id: place.id || `day${dayIndex}_place${placeIndex}_${Date.now()}`
            });
          }
        });
      }
    });
    
    return extractedPlaces;
  }, [days]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    if (typeof google === 'undefined' || !google.maps) {
      console.error('Google Maps not loaded');
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
      isInitializedRef.current = true;
    }
  }, []);

  // Update location markers
  useEffect(() => {
    if (!mapInstanceRef.current || !isInitializedRef.current) return;

    const locationsKey = JSON.stringify(locations.map(l => ({ id: l.id, lat: l.coordinates.lat, lng: l.coordinates.lng })));
    
    if (locationsKey === prevLocationsRef.current) return;
    
    prevLocationsRef.current = locationsKey;

    const map = mapInstanceRef.current;

    // Clear existing location markers
    locationMarkersRef.current.forEach((marker) => marker.setMap(null));
    locationMarkersRef.current = [];

    const existingMarkers = markersRef.current.filter(m => !m.place && m.location);
    existingMarkers.forEach(({ marker }) => {
      if (marker) marker.setMap(null);
    });
    markersRef.current = markersRef.current.filter(m => m.place || !m.location);

    // Add location markers
    locations
      .filter(location => location.coordinates && location.coordinates.lat !== 0 && location.coordinates.lng !== 0)
      .forEach((location) => {
        const marker = new google.maps.Marker({
          position: location.coordinates,
          map,
          title: stripMarkdown(location.name),
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#2f4f93',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
          zIndex: 1000, // Location markers on top
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `<div style="padding: 8px; font-family: Poppins, sans-serif;">
            <strong style="color: #2f4f93; font-size: 14px;">${stripMarkdown(location.name)}</strong>
          </div>`,
        });

        marker.addListener('click', () => {
          infoWindowsRef.current.forEach(iw => iw.close());
          infoWindow.open(map, marker);
          mapInstanceRef.current?.panTo(location.coordinates);
        });
        
        infoWindowsRef.current.push(infoWindow);
        markersRef.current.push({ location, marker });
      });

    // Fit bounds to all locations
    if (!selectedLocationId) {
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
    }
  }, [locations, selectedLocationId, zoom]);

  // Handle selected location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isInitializedRef.current) return;
    if (!selectedLocationId) return;

    const selectedLocation = locations.find(loc => loc.id === selectedLocationId);
    if (!selectedLocation || !selectedLocation.coordinates) return;

    const { lat, lng } = selectedLocation.coordinates;
    if (lat === 0 && lng === 0) return;

    const currentCenter = mapInstanceRef.current.getCenter();
    const centerLat = currentCenter?.lat() || 0;
    const centerLng = currentCenter?.lng() || 0;
    
    const shouldUpdate = 
      !prevCenterRef.current ||
      Math.abs(prevCenterRef.current.lat - lat) > 0.001 ||
      Math.abs(prevCenterRef.current.lng - lng) > 0.001 ||
      Math.abs(centerLat - lat) > 0.01 ||
      Math.abs(centerLng - lng) > 0.01;

    if (shouldUpdate) {
      prevCenterRef.current = { lat, lng };
      mapInstanceRef.current.panTo({ lat, lng });
      mapInstanceRef.current.setZoom(14);
    }
  }, [selectedLocationId, locations]);

  // Handle center/zoom prop changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isInitializedRef.current) return;
    
    const shouldUpdateCenter = 
      !prevCenterRef.current ||
      Math.abs(prevCenterRef.current.lat - center.lat) > 0.001 ||
      Math.abs(prevCenterRef.current.lng - center.lng) > 0.001;

    const shouldUpdateZoom = 
      prevZoomRef.current === null ||
      prevZoomRef.current !== zoom;

    if (shouldUpdateCenter && !selectedLocationId) {
      prevCenterRef.current = center;
      mapInstanceRef.current.panTo(center);
    }

    if (shouldUpdateZoom && !selectedLocationId) {
      prevZoomRef.current = zoom;
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [center, zoom, selectedLocationId]);

  // Update place markers based on filters
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing place markers
    markersRef.current.forEach(({ marker, place }) => {
      if (marker && place) marker.setMap(null);
    });
    markersRef.current = markersRef.current.filter(m => m.location);

    // Combine all places: passed places, nearby places, itinerary places
    const dayPlaces = itineraryPlaces();
    const allPlaces = [...places, ...nearbyPlaces, ...dayPlaces];
    
    // Deduplicate by id or name+location
    const uniquePlaces = allPlaces.filter((place, index, self) =>
      index === self.findIndex((p) => {
        if (p.id && place.id && p.id === place.id) return true;
        if (p.placeId && place.placeId && p.placeId === place.placeId) return true;
        return p.name.toLowerCase() === place.name.toLowerCase();
      })
    );

    // Apply filter logic
    const filteredPlaces = uniquePlaces.filter((place) => {
      // If 'All' is selected, show all places
      if (filters.all) return true;
      
      // Check if any specific filter is enabled
      const hasActiveFilter = filters.stays || filters.restaurants || 
                              filters.attraction || filters.activities || filters.locations;
      
      // If no filters active, show nothing
      if (!hasActiveFilter) return false;
      
      // Match place type to filter
      const placeType = place.type;
      
      switch (placeType) {
        case 'stays':
          return filters.stays;
        case 'restaurants':
          return filters.restaurants;
        case 'attraction':
          return filters.attraction;
        case 'activities':
          return filters.activities;
        case 'locations':
          return filters.locations;
        default:
          // Unknown types show if 'locations' filter is on
          return filters.locations;
      }
    });

    console.log(`[MapPanel] Filter state:`, filters);
    console.log(`[MapPanel] Total places: ${uniquePlaces.length}, Filtered: ${filteredPlaces.length}`);

    // Create markers for filtered places
    filteredPlaces.forEach((place) => {
      if (!place.location || place.location.lat === 0 || place.location.lng === 0) {
        return; // Skip places without valid coordinates
      }

      const marker = new google.maps.Marker({
        position: place.location,
        map: mapInstanceRef.current,
        title: stripMarkdown(place.name),
        icon: getMarkerIcon(place.type),
        zIndex: 100,
      });

      const typeLabel = getTypeLabel(place.type);
      const ratingHtml = place.rating ? `<div style="color: #666; font-size: 12px;">⭐ ${place.rating}</div>` : '';
      
      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 10px; font-family: Poppins, sans-serif; max-width: 200px;">
          <strong style="color: #2f4f93; font-size: 14px;">${stripMarkdown(place.name)}</strong>
          <div style="color: #888; font-size: 11px; margin-top: 4px; text-transform: uppercase;">${typeLabel}</div>
          ${ratingHtml}
          ${place.address ? `<div style="color: #666; font-size: 12px; margin-top: 4px;">${place.address}</div>` : ''}
        </div>`,
      });

      marker.addListener('click', () => {
        infoWindowsRef.current.forEach(iw => iw.close());
        infoWindow.open(mapInstanceRef.current, marker);
        mapInstanceRef.current?.panTo(place.location);
        if (onPlaceClick) onPlaceClick(place);
      });
      
      infoWindowsRef.current.push(infoWindow);
      markersRef.current.push({ place, marker });
    });
  }, [places, nearbyPlaces, filters, onPlaceClick, itineraryPlaces]);

  // Load nearby places when a location is selected
  useEffect(() => {
    if (!selectedLocationId || !mapInstanceRef.current || locations.length === 0) {
      setNearbyPlaces([]);
      return;
    }

    const selectedLocation = locations.find(loc => loc.id === selectedLocationId);
    if (!selectedLocation || !selectedLocation.coordinates) {
      setNearbyPlaces([]);
      return;
    }

    const { lat, lng } = selectedLocation.coordinates;
    if (lat === 0 && lng === 0) {
      setNearbyPlaces([]);
      return;
    }

    // Skip city-level locations for nearby search
    const locationName = stripMarkdown(selectedLocation.name).toLowerCase();
    const cityLevelKeywords = ['city', 'town', 'province', 'state', 'region', 'country', 'district', 'prefecture'];
    const isCityLevel = cityLevelKeywords.some(keyword => locationName.includes(keyword));
    
    if (isCityLevel) {
      console.log(`[MapPanel] Skipping city-level location: ${selectedLocation.name}`);
      setNearbyPlaces([]);
      return;
    }

    // Clear and load new places
    setNearbyPlaces([]);

    const timeoutId = setTimeout(() => {
      console.log(`[MapPanel] Fetching places near ${selectedLocation.name}...`);
      setIsLoadingPlaces(true);
      
      Promise.all([
        searchPlaces(mapInstanceRef.current!, {
          location: { lat, lng },
          radius: 5000,
          type: 'attraction',
        }).catch(() => []),
        searchPlaces(mapInstanceRef.current!, {
          location: { lat, lng },
          radius: 3000,
          type: 'restaurants',
        }).catch(() => []),
        searchPlaces(mapInstanceRef.current!, {
          location: { lat, lng },
          radius: 3000,
          type: 'stays',
        }).catch(() => []),
      ])
        .then(([attractions, restaurants, stays]) => {
          const allPlaces = [...attractions, ...restaurants, ...stays];
          
          // Deduplicate
          const deduplicatedPlaces = allPlaces.reduce((acc: Place[], place: Place) => {
            const existing = acc.find(p => {
              if (p.placeId && place.placeId && p.placeId === place.placeId) return true;
              const pKey = `${p.name.toLowerCase()}_${p.location.lat.toFixed(5)}_${p.location.lng.toFixed(5)}`;
              const placeKey = `${place.name.toLowerCase()}_${place.location.lat.toFixed(5)}_${place.location.lng.toFixed(5)}`;
              return pKey === placeKey;
            });
            if (!existing) acc.push(place);
            return acc;
          }, []);

          console.log(`[MapPanel] Found ${deduplicatedPlaces.length} unique places near ${selectedLocation.name}`);
          setNearbyPlaces(deduplicatedPlaces);
          setIsLoadingPlaces(false);
        })
        .catch((error) => {
          console.error('[MapPanel] Failed to fetch nearby places:', error);
          setNearbyPlaces([]);
          setIsLoadingPlaces(false);
        });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selectedLocationId, locations]);

  // Get marker icon by place type
  const getMarkerIcon = (type: Place['type']): google.maps.Symbol => {
    const colors: Record<Place['type'], string> = {
      stays: '#FF6B6B',        // Red
      restaurants: '#4ECDC4',  // Teal
      attraction: '#FFD93D',   // Yellow
      activities: '#95E1D3',   // Light green
      locations: '#2f4f93',    // Blue
    };

    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 7,
      fillColor: colors[type] || '#2f4f93',
      fillOpacity: 0.9,
      strokeColor: '#ffffff',
      strokeWeight: 2,
    };
  };

  // Get human-readable type label
  const getTypeLabel = (type: Place['type']): string => {
    const labels: Record<Place['type'], string> = {
      stays: 'Accommodation',
      restaurants: 'Restaurant',
      attraction: 'Attraction',
      activities: 'Activity',
      locations: 'Location',
    };
    return labels[type] || 'Place';
  };

  // Handle filter changes with visual feedback
  const handleFilterChange = useCallback((newFilters: PlaceFilters) => {
    console.log('[MapPanel] Filter changed:', newFilters);
    setFilters(newFilters);
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* Gradient overlay */}
      <div
        className="absolute top-0 left-0 right-0 h-[201px] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0) 100%)',
        }}
      />

      {/* Loading indicator */}
      {isLoadingPlaces && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg z-20">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#2f4f93] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[#475f73]">Loading places...</span>
          </div>
        </div>
      )}

      {/* Filter panel */}
      <PlaceFilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onClose={() => setIsFilterOpen(false)}
        isOpen={isFilterOpen}
      />

      {/* Filter toggle button when closed */}
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

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
        <p className="text-[10px] text-[#a7b8c7] uppercase tracking-wide mb-2 font-medium">Legend</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#2f4f93]" />
            <span className="text-xs text-[#475f73]">Locations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FFD93D]" />
            <span className="text-xs text-[#475f73]">Attractions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#4ECDC4]" />
            <span className="text-xs text-[#475f73]">Restaurants</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF6B6B]" />
            <span className="text-xs text-[#475f73]">Stays</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#95E1D3]" />
            <span className="text-xs text-[#475f73]">Activities</span>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PlaceFilters, Place, MapMarker, TripLocation } from '@/app/types/itinerary';
import { PlaceFilterPanel } from './PlaceFilterPanel';
import { PlaceInfoCard } from './PlaceInfoCard';
import { searchPlaces, getPlaceDetails } from './googlePlaces';

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/__/g, '')
    .replace(/_/g, '')
    .trim();
}

function generateId(): string {
  return `place_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

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
  const prevLocationsRef = useRef<string>('');
  const prevCenterRef = useRef<{ lat: number; lng: number } | null>(null);
  const prevZoomRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);
  const infoWindowsRef = useRef<google.maps.InfoWindow[]>([]);
  
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [filters, setFilters] = useState<PlaceFilters>({
    all: false,
    stays: false,
    restaurants: false,
    attraction: true,
    activities: false,
    locations: true,
    showPrices: false,
  });

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

  useEffect(() => {
    if (!mapInstanceRef.current || !isInitializedRef.current) return;

    const locationsKey = JSON.stringify(locations.map(l => ({ id: l.id, lat: l.coordinates.lat, lng: l.coordinates.lng })));
    
    if (locationsKey === prevLocationsRef.current) return;
    
    prevLocationsRef.current = locationsKey;

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
          title: stripMarkdown(location.name),
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#2f4f93',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        marker.addListener('click', async () => {
          setSelectedPlace(null);
          
          if (mapInstanceRef.current) {
            try {
              const service = new google.maps.places.PlacesService(mapInstanceRef.current);
              const request = {
                query: stripMarkdown(location.name),
                location: new google.maps.LatLng(location.coordinates.lat, location.coordinates.lng),
                radius: 1000,
              };

              service.textSearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                  const result = results[0];
                  if (result.place_id) {
                    getPlaceDetails(mapInstanceRef.current!, result.place_id)
                      .then((details) => {
                        const place: Place = {
                          id: result.place_id || generateId(),
                          name: result.name || stripMarkdown(location.name),
                          type: 'locations',
                          location: {
                            lat: result.geometry?.location?.lat() || location.coordinates.lat,
                            lng: result.geometry?.location?.lng() || location.coordinates.lng,
                          },
                          address: result.formatted_address || result.vicinity,
                          rating: result.rating,
                          priceLevel: result.price_level,
                          photoUrl: result.photos?.[0]?.getUrl({ maxWidth: 400 }),
                          placeId: result.place_id,
                        };
                        setSelectedPlace(place);
                        mapInstanceRef.current?.panTo(place.location);
                      })
                      .catch(() => {
                        const place: Place = {
                          id: location.id,
                          name: stripMarkdown(location.name),
                          type: 'locations',
                          location: location.coordinates,
                        };
                        setSelectedPlace(place);
                        mapInstanceRef.current?.panTo(location.coordinates);
                      });
                  } else {
                    const place: Place = {
                      id: location.id,
                      name: stripMarkdown(location.name),
                      type: 'locations',
                      location: location.coordinates,
                    };
                    setSelectedPlace(place);
                    mapInstanceRef.current?.panTo(location.coordinates);
                  }
                } else {
                  const place: Place = {
                    id: location.id,
                    name: stripMarkdown(location.name),
                    type: 'locations',
                    location: location.coordinates,
                  };
                  setSelectedPlace(place);
                  mapInstanceRef.current?.panTo(location.coordinates);
                }
              });
            } catch (error) {
              const place: Place = {
                id: location.id,
                name: stripMarkdown(location.name),
                type: 'locations',
                location: location.coordinates,
              };
              setSelectedPlace(place);
              mapInstanceRef.current?.panTo(location.coordinates);
            }
          }
        });

        markersRef.current.push({ location, marker });
      });

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

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    markersRef.current.forEach(({ marker, place }) => {
      if (marker && place) marker.setMap(null);
    });
    markersRef.current = markersRef.current.filter(m => m.location);

    const allPlaces = [...places, ...nearbyPlaces];
    const uniquePlaces = allPlaces.filter((place, index, self) =>
      index === self.findIndex((p) => p.id === place.id)
    );

    const filteredPlaces = uniquePlaces.filter((place) => {
      if (filters.all) return true;
      return filters[place.type];
    });

    console.log(`Displaying ${filteredPlaces.length} places on map`);

    filteredPlaces.forEach((place) => {
      const marker = new google.maps.Marker({
        position: place.location,
        map: mapInstanceRef.current,
        title: place.name,
        icon: getMarkerIcon(place.type),
      });

      marker.addListener('click', () => {
        setSelectedPlace(place);
        mapInstanceRef.current?.panTo(place.location);
        if (onPlaceClick) onPlaceClick(place);
      });

      markersRef.current.push({ place, marker });
    });
  }, [places, nearbyPlaces, filters, onPlaceClick]);

  useEffect(() => {
    if (!selectedLocationId || !mapInstanceRef.current || locations.length === 0) {
      setNearbyPlaces([]);
      markersRef.current.forEach(({ marker, place }) => {
        if (marker && place) marker.setMap(null);
      });
      markersRef.current = markersRef.current.filter(m => m.location);
      return;
    }

    const selectedLocation = locations.find(loc => loc.id === selectedLocationId);
    if (!selectedLocation || !selectedLocation.coordinates) {
      setNearbyPlaces([]);
      markersRef.current.forEach(({ marker, place }) => {
        if (marker && place) marker.setMap(null);
      });
      markersRef.current = markersRef.current.filter(m => m.location);
      return;
    }

    const { lat, lng } = selectedLocation.coordinates;
    if (lat === 0 && lng === 0) {
      setNearbyPlaces([]);
      markersRef.current.forEach(({ marker, place }) => {
        if (marker && place) marker.setMap(null);
      });
      markersRef.current = markersRef.current.filter(m => m.location);
      return;
    }

    const locationName = stripMarkdown(selectedLocation.name).toLowerCase();
    const cityLevelKeywords = ['city', 'town', 'province', 'state', 'region', 'country', 'district', 'prefecture'];
    const isCityLevel = cityLevelKeywords.some(keyword => locationName.includes(keyword));
    
    if (isCityLevel) {
      console.log(`Skipping city-level location: ${selectedLocation.name}`);
      setNearbyPlaces([]);
      markersRef.current.forEach(({ marker, place }) => {
        if (marker && place) marker.setMap(null);
      });
      markersRef.current = markersRef.current.filter(m => m.location);
      return;
    }

    setNearbyPlaces([]);
    markersRef.current.forEach(({ marker, place }) => {
      if (marker && place) marker.setMap(null);
    });
    markersRef.current = markersRef.current.filter(m => m.location);

    const timeoutId = setTimeout(() => {
      console.log(`Fetching places near ${selectedLocation.name}...`);
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
      ])
        .then(([attractions, restaurants]) => {
          const allPlaces = [...attractions, ...restaurants];
          
          const deduplicatedPlaces = allPlaces.reduce((acc: Place[], place: Place) => {
            const existing = acc.find(p => {
              if (p.placeId && place.placeId && p.placeId === place.placeId) return true;
              const pKey = `${p.name.toLowerCase()}_${p.location.lat.toFixed(6)}_${p.location.lng.toFixed(6)}`;
              const placeKey = `${place.name.toLowerCase()}_${place.location.lat.toFixed(6)}_${place.location.lng.toFixed(6)}`;
              return pKey === placeKey;
            });
            if (!existing) acc.push(place);
            return acc;
          }, []);

          console.log(`Found ${deduplicatedPlaces.length} unique places near ${selectedLocation.name}`);
          setNearbyPlaces(deduplicatedPlaces);
          setIsLoadingPlaces(false);
        })
        .catch((error) => {
          console.error('Failed to fetch nearby places:', error);
          setNearbyPlaces([]);
          setIsLoadingPlaces(false);
        });
    }, 300);

    return () => clearTimeout(timeoutId);
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


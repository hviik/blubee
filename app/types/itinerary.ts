/**
 * TypeScript types for itinerary, places, and map functionality
 */

// Place types for Google Places API integration
export type PlaceType = 'stays' | 'restaurants' | 'attraction' | 'activities' | 'locations';

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  location: {
    lat: number;
    lng: number;
  };
  address?: string;
  rating?: number;
  priceLevel?: number;
  photoUrl?: string;
  placeId?: string; // Google Place ID
}

// Itinerary types
export interface DayActivity {
  hotel?: string;
  food?: string;
  sightseeing?: string;
  icon?: {
    hotel: boolean;
    travel: boolean;
    sightseeing: boolean;
  };
}

export interface ItineraryDay {
  dayNumber: number;
  date: string; // Format: "09 NOV, 25"
  location: string;
  title: string;
  description: string;
  activities?: DayActivity;
  places?: Place[];
  expanded?: boolean;
}

export interface TripLocation {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  active: boolean;
}

export interface Itinerary {
  id: string;
  title: string;
  locations: TripLocation[];
  days: ItineraryDay[];
  totalDays: number;
  startDate: string;
  endDate: string;
}

// Filter types for map
export interface PlaceFilters {
  all: boolean;
  stays: boolean;
  restaurants: boolean;
  attraction: boolean;
  activities: boolean;
  locations: boolean;
  showPrices: boolean;
}

// Map marker type
export interface MapMarker {
  place?: Place; // Optional for location markers
  location?: TripLocation; // Optional for location markers
  marker: google.maps.Marker | null;
}

// Google Maps types
export interface MapConfig {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  mapTypeId?: string;
  styles?: google.maps.MapTypeStyle[];
}

// API Response types for Places
export interface PlacesSearchRequest {
  location: {
    lat: number;
    lng: number;
  };
  radius: number;
  type?: PlaceType;
  keyword?: string;
}

export interface PlacesSearchResponse {
  places: Place[];
  status: string;
  error?: string;
}


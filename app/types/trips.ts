/**
 * Shared TypeScript types for Trips API
 * Use these types in both frontend and backend for type safety
 */

// Base trip interface matching the database schema
export interface Trip {
  id: string;
  user_id: string;
  destination: string;
  start_date: string; // ISO date string (YYYY-MM-DD)
  end_date: string;   // ISO date string (YYYY-MM-DD)
  description?: string | null;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

// Type for creating a new trip (without auto-generated fields)
export interface CreateTripRequest {
  destination: string;
  start_date: string;
  end_date: string;
  description?: string;
}

// Type for updating a trip (all fields optional except those that identify the trip)
export interface UpdateTripRequest {
  destination?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

// API Response types
export interface GetTripsResponse {
  success: true;
  userId: string;
  trips: Trip[];
  count: number;
}

export interface CreateTripResponse {
  success: true;
  message: string;
  trip: Trip;
}

export interface UpdateTripResponse {
  success: true;
  message: string;
  trip: Trip;
}

export interface DeleteTripResponse {
  success: true;
  message: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
  required?: string[];
}

// Type guards
export function isTrip(obj: any): obj is Trip {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.destination === 'string' &&
    typeof obj.start_date === 'string' &&
    typeof obj.end_date === 'string' &&
    typeof obj.created_at === 'string' &&
    typeof obj.updated_at === 'string'
  );
}

export function isGetTripsResponse(obj: any): obj is GetTripsResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    obj.success === true &&
    typeof obj.userId === 'string' &&
    Array.isArray(obj.trips) &&
    typeof obj.count === 'number'
  );
}

// Validation helpers
export function validateTripDates(startDate: string, endDate: string): string | null {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime())) {
    return 'Invalid start date format';
  }

  if (isNaN(end.getTime())) {
    return 'Invalid end date format';
  }

  if (end < start) {
    return 'End date must be after start date';
  }

  return null;
}

export function validateCreateTripRequest(data: any): data is CreateTripRequest {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.destination === 'string' &&
    data.destination.trim().length > 0 &&
    typeof data.start_date === 'string' &&
    typeof data.end_date === 'string' &&
    (data.description === undefined || typeof data.description === 'string')
  );
}


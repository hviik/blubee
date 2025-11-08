# Trips API - Clerk Authentication + Supabase Storage

This is a fully-functional example of a Clerk-verified API route that stores data in Supabase.

## Setup Instructions

### 1. Database Setup

Run the SQL migration in your Supabase SQL Editor:

```bash
# Navigate to: Supabase Dashboard > SQL Editor > New Query
# Copy and paste the contents of lib/supabase-setup.sql
# Click "Run"
```

### 2. Environment Variables

Make sure these are set in your `.env.local`:

```bash
SUPABASE_PROJECT_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 3. Start Your Dev Server

```bash
npm run dev
```

## API Endpoints

### GET /api/trips

List all trips for the authenticated user.

**Authentication:** Required (Clerk session)

**Response:**
```json
{
  "success": true,
  "userId": "user_abc123",
  "trips": [
    {
      "id": "uuid",
      "user_id": "user_abc123",
      "destination": "Paris, France",
      "start_date": "2025-06-01",
      "end_date": "2025-06-10",
      "description": "Summer vacation",
      "created_at": "2025-11-08T...",
      "updated_at": "2025-11-08T..."
    }
  ],
  "count": 1
}
```

### POST /api/trips

Create a new trip for the authenticated user.

**Authentication:** Required (Clerk session)

**Request Body:**
```json
{
  "destination": "Tokyo, Japan",
  "start_date": "2025-12-01",
  "end_date": "2025-12-15",
  "description": "Winter holiday" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trip created successfully",
  "trip": {
    "id": "uuid",
    "user_id": "user_abc123",
    "destination": "Tokyo, Japan",
    "start_date": "2025-12-01",
    "end_date": "2025-12-15",
    "description": "Winter holiday",
    "created_at": "2025-11-08T...",
    "updated_at": "2025-11-08T..."
  }
}
```

## Frontend Usage Example

### React Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

interface Trip {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  description?: string;
}

export function TripsManager() {
  const { isSignedIn } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch trips
  const fetchTrips = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trips');
      const data = await response.json();
      
      if (data.success) {
        setTrips(data.trips);
      }
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a trip
  const createTrip = async (tripData: Omit<Trip, 'id'>) => {
    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the trips list
        await fetchTrips();
        return data.trip;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to create trip:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchTrips();
    }
  }, [isSignedIn]);

  if (!isSignedIn) {
    return <div>Please sign in to view trips</div>;
  }

  return (
    <div>
      <h2>My Trips ({trips.length})</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {trips.map((trip) => (
            <li key={trip.id}>
              <strong>{trip.destination}</strong>
              <br />
              {trip.start_date} to {trip.end_date}
              {trip.description && <p>{trip.description}</p>}
            </li>
          ))}
        </ul>
      )}
      
      <button onClick={() => createTrip({
        destination: 'London, UK',
        start_date: '2025-07-01',
        end_date: '2025-07-07',
        description: 'Business trip'
      })}>
        Add Sample Trip
      </button>
    </div>
  );
}
```

## Testing with cURL

### Create a Trip (requires valid session)

```bash
curl -X POST http://localhost:3000/api/trips \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=your_clerk_session_token" \
  -d '{
    "destination": "Barcelona, Spain",
    "start_date": "2025-08-15",
    "end_date": "2025-08-22",
    "description": "Summer beach vacation"
  }'
```

### Get All Trips

```bash
curl http://localhost:3000/api/trips \
  -H "Cookie: __session=your_clerk_session_token"
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized - Please sign in"
}
```

### 400 Bad Request
```json
{
  "error": "Missing required fields",
  "required": ["destination", "start_date", "end_date"]
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create trip",
  "details": "Database error details"
}
```

## Security Features

1. **Clerk Authentication**: All routes require valid Clerk session
2. **User Isolation**: Users can only access their own trips
3. **Row Level Security**: Supabase RLS policies enforce data access
4. **Input Validation**: Date validation and required field checks
5. **SQL Injection Protection**: Supabase client handles parameterization

## Next Steps

You can extend this API to include:
- **PUT** `/api/trips/[id]` - Update a trip
- **DELETE** `/api/trips/[id]` - Delete a trip
- **GET** `/api/trips/[id]` - Get a specific trip
- Add pagination for large trip lists
- Add search/filter functionality
- Add file uploads for trip photos


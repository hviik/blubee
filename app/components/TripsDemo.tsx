'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { Trip, GetTripsResponse, CreateTripResponse } from '@/app/types/trips';

export function TripsDemo() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    destination: '',
    start_date: '',
    end_date: '',
    description: '',
  });

  // Fetch trips
  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/trips');
      const data: GetTripsResponse = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }

      if (data.success) {
        setTrips(data.trips);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trips');
      console.error('Failed to fetch trips:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a trip
  const createTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: CreateTripResponse = await response.json();

      if (!response.ok) {
        throw new Error('Failed to create trip');
      }

      if (data.success) {
        // Clear form
        setFormData({
          destination: '',
          start_date: '',
          end_date: '',
          description: '',
        });

        // Refresh trips list
        await fetchTrips();
        alert('Trip created successfully!');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trip');
      console.error('Failed to create trip:', err);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchTrips();
    }
  }, [isSignedIn]);

  if (!isSignedIn) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">
            Sign In Required
          </h2>
          <p className="text-blue-700">
            Please sign in to manage your trips
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Trips
        </h1>
        <p className="text-gray-600">
          Logged in as: <strong>{user?.emailAddresses[0]?.emailAddress || 'User'}</strong>
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Create Trip Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Create New Trip
        </h2>
        <form onSubmit={createTrip} className="space-y-4">
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
              Destination *
            </label>
            <input
              type="text"
              id="destination"
              required
              placeholder="e.g., Paris, France"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                id="start_date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                id="end_date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Add some notes about your trip..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Create Trip
          </button>
        </form>
      </div>

      {/* Trips List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Your Trips ({trips.length})
          </h2>
          <button
            onClick={fetchTrips}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {loading && trips.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Loading trips...
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No trips yet. Create your first trip above!
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {trip.destination}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {new Date(trip.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Dates:</strong> {new Date(trip.start_date).toLocaleDateString()} → {new Date(trip.end_date).toLocaleDateString()}
                </div>
                {trip.description && (
                  <p className="text-sm text-gray-700 mt-2">
                    {trip.description}
                  </p>
                )}
                <div className="mt-2 text-xs text-gray-400">
                  Trip ID: {trip.id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


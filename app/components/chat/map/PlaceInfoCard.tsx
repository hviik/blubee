'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Place } from '@/app/types/itinerary';
import { getPlaceDetails } from './googlePlaces';

interface PlaceInfoCardProps {
  place: Place | null;
  map: google.maps.Map | null;
  onClose: () => void;
}

export function PlaceInfoCard({ place, map, onClose }: PlaceInfoCardProps) {
  const [placeDetails, setPlaceDetails] = useState<google.maps.places.PlaceResult | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (place && map && place.placeId) {
      setLoading(true);
      getPlaceDetails(map, place.placeId)
        .then((details) => {
          setPlaceDetails(details);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to load place details:', error);
          setLoading(false);
        });
    }
  }, [place, map]);

  if (!place) return null;

  const photos = placeDetails?.photos || [];
  const rating = placeDetails?.rating || place.rating;
  const address = placeDetails?.formatted_address || place.address;

  return (
    <div
      className={`absolute ${
        isExpanded ? 'inset-4' : 'bottom-4 left-4 right-4'
      } bg-white rounded-2xl shadow-2xl transition-all duration-300 ease-out z-50 flex flex-col max-h-[85vh]`}
      style={{
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <div className="relative h-40 md:h-48 rounded-t-2xl overflow-hidden flex-shrink-0">
        {photos.length > 0 && photos[0] ? (
          <img
            src={photos[0].getUrl({ maxWidth: 800 })}
            alt={place.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-white opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-lg"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className={`flex-1 overflow-y-auto p-4 md:p-5 ${isExpanded ? '' : 'max-h-48'}`}>
        <div className="mb-3">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">
            {place.name}
          </h3>
          {rating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <svg
                  className="w-5 h-5 text-yellow-400 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-medium text-gray-900">{rating.toFixed(1)}</span>
              </div>
              {place.priceLevel && (
                <span className="text-sm text-gray-500">
                  {'$'.repeat(place.priceLevel)}
                </span>
              )}
            </div>
          )}
        </div>

        {address && (
          <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
            <svg
              className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="leading-relaxed">{address}</span>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span>Loading details...</span>
          </div>
        )}

        {isExpanded && photos.length > 1 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">More Photos</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {photos.slice(1, 7).map((photo, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-200"
                >
                  <img
                    src={photo.getUrl({ maxWidth: 400 })}
                    alt={`${place.name} - Photo ${index + 2}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {placeDetails?.types && placeDetails.types.length > 0 && isExpanded && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {placeDetails.types.slice(0, 5).map((type, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full capitalize"
                >
                  {type.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 p-3 flex-shrink-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <span>{isExpanded ? 'Show less' : 'Show more details'}</span>
          <svg
            className={`w-4 h-4 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}


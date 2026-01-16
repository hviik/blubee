'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getDestinationImage, getFlagImage, getFlagImageByISO, getISO2Code, getCountryDisplayName, getCountryFromISO } from '@/app/utils/countryData';

interface TripCardProps {
  trip: {
    id: string;
    title: string;
    country?: string;
    iso2?: string;
    duration?: string;
    nights?: number;
    days?: number;
    imageUrl?: string;
    tripType?: string;
    travelers?: number;
    startDate?: string;
    endDate?: string;
    destinations?: string[];
  };
  onClick: () => void;
  onDelete?: (e: React.MouseEvent) => void;
  onHeart?: (e: React.MouseEvent) => void;
  isWishlisted?: boolean;
  showHeart?: boolean;
}

export function TripCard({ trip, onClick, onDelete, onHeart, isWishlisted = false, showHeart = false }: TripCardProps) {
  const [imgError, setImgError] = useState(false);
  const [flagError, setFlagError] = useState(false);

  // Calculate duration
  const totalDays = trip.days || (trip.nights ? trip.nights + 1 : 5);
  const totalNights = trip.nights || (totalDays > 1 ? totalDays - 1 : 0);
  const durationText = trip.duration || `${totalDays} Days, ${totalNights} Nights`;
  
  // Get country info - prioritize iso2 for reliable lookups
  const iso2 = trip.iso2 || getISO2Code(trip.country || trip.title);
  const country = trip.country || getCountryFromISO(iso2) || getCountryDisplayName(trip.title);
  const displayCountry = getCountryDisplayName(country);
  
  // Get flag URL using iso2 for reliability
  const flagUrl = iso2 && iso2 !== 'xx' 
    ? getFlagImageByISO(iso2) 
    : getFlagImage(country);
  
  // Get destination image
  const imageUrl = trip.imageUrl || getDestinationImage(country);
  
  // Fallback images
  const fallbackImage = '/assets/destinations/th.jpg';
  const fallbackFlag = `https://flagcdn.com/w80/xx.png`;

  // Display title - use country name if title is generic
  const displayTitle = trip.title === 'Trip' || !trip.title 
    ? displayCountry 
    : trip.title;

  return (
    <div 
      className="relative w-full aspect-[536/300] rounded-xl overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={imgError ? fallbackImage : imageUrl}
          alt={displayTitle}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
      </div>

      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
      />

      {/* Flag & Country (Top Right) */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={flagError ? fallbackFlag : flagUrl}
          alt={`${displayCountry} flag`}
          className="w-14 h-8 md:w-16 md:h-9 object-cover rounded-sm shadow-md"
          onError={() => setFlagError(true)}
        />
        <span 
          className="text-white text-sm md:text-base font-black italic uppercase drop-shadow-lg"
          style={{ fontFamily: 'var(--font-poppins)' }}
        >
          {displayCountry}
        </span>
      </div>

      {/* Delete Button (Top Left) */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e);
          }}
          className="absolute top-3 left-3 p-2 bg-black/40 hover:bg-red-500/80 rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}

      {/* Heart Button (Bottom Right) */}
      {showHeart && onHeart && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onHeart(e);
          }}
          className="absolute bottom-3 right-3 md:bottom-4 md:right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10"
        >
          <svg 
            className="w-5 h-5" 
            viewBox="0 0 24 24"
            fill={isWishlisted ? '#ef4444' : 'none'}
            stroke={isWishlisted ? '#ef4444' : 'white'}
            strokeWidth="2"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      )}

      {/* Content (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            {/* Duration */}
            <span 
              className="text-white/90 text-xs md:text-sm font-medium"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              {durationText}
            </span>
            
            {/* Trip Title */}
            <h3 
              className="text-white text-xl md:text-2xl lg:text-[28px] font-black italic uppercase leading-tight mt-0.5"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              {displayTitle}
            </h3>
            
            {/* Route/Destinations */}
            {trip.destinations && trip.destinations.length > 0 && (
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                {trip.destinations.slice(0, 3).map((dest, i) => (
                  <React.Fragment key={i}>
                    <span className="text-white/80 text-[10px] md:text-xs" style={{ fontFamily: 'var(--font-poppins)' }}>
                      {dest}
                    </span>
                    {i < Math.min(trip.destinations!.length, 3) - 1 && (
                      <span className="text-white/50 text-[10px]">→</span>
                    )}
                  </React.Fragment>
                ))}
                {trip.destinations.length > 3 && (
                  <span className="text-white/60 text-[10px]">+{trip.destinations.length - 3}</span>
                )}
              </div>
            )}
          </div>

          {/* Traveler Avatars */}
          {trip.travelers && trip.travelers > 0 && !showHeart && (
            <div className="flex items-center -space-x-2">
              {[...Array(Math.min(trip.travelers, 3))].map((_, i) => (
                <div 
                  key={i}
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-500 shadow-md flex items-center justify-center"
                >
                  <span className="text-white text-[10px] font-bold">{i + 1}</span>
                </div>
              ))}
              {trip.travelers > 3 && (
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white bg-gray-700 shadow-md flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">+{trip.travelers - 3}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

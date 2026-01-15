'use client';

import React from 'react';
import { getDestinationImage, getFlagImage, getISO2Code } from '@/app/utils/countryData';

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
  };
  onClick: () => void;
  onDelete?: (e: React.MouseEvent) => void;
}

export function TripCard({ trip, onClick, onDelete }: TripCardProps) {
  // Calculate duration
  const totalDays = trip.days || (trip.nights ? trip.nights + 1 : 5);
  const totalNights = trip.nights || (totalDays > 1 ? totalDays - 1 : 0);
  const durationText = trip.duration || `${totalDays} Days, ${totalNights} Nights`;
  
  // Get country info
  const country = trip.country || 'Thailand';
  const iso2 = trip.iso2 || getISO2Code(country);
  const flagUrl = getFlagImage(country);
  const imageUrl = trip.imageUrl || getDestinationImage(country);

  return (
    <div 
      className="relative w-full aspect-[536/300] rounded-xl overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={imageUrl}
          alt={trip.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
          src={flagUrl}
          alt={`${country} flag`}
          className="w-14 h-8 md:w-16 md:h-8 object-cover rounded-sm shadow-md"
        />
        <span 
          className="text-white text-sm md:text-lg font-black italic uppercase drop-shadow-lg"
          style={{ fontFamily: 'var(--font-poppins)' }}
        >
          {country}
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
              {trip.title}
            </h3>
          </div>

          {/* Traveler Avatars */}
          {trip.travelers && trip.travelers > 0 && (
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

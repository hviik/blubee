'use client';

import { useState } from 'react';
import Image from 'next/image';
import { COLORS } from '../constants/colors';

interface ExplorePageProps {
  onClose?: () => void;
}

interface Destination {
  id: string;
  name: string;
  flag: string;
  image: string;
  duration: string;
  price: string;
  route: string[];
}

const destinations: Destination[] = [
  {
    id: '1',
    name: 'VIETNAM',
    flag: '/assets/flags/vietnam.png',
    image: '/assets/destinations/vietnam.png',
    duration: '5 Days, 4 Nights',
    price: '₹ 99,779',
    route: ['Hanoi', 'Ha Long Bay', 'Ho Chi Minh City'],
  },
  {
    id: '2',
    name: 'MALAYSIA',
    flag: '/assets/flags/malaysia.png',
    image: '/assets/destinations/malaysia.png',
    duration: '5 Days, 4 Nights',
    price: '₹ 99,779',
    route: ['Hanoi', 'Ha Long Bay', 'Ho Chi Minh City'],
  },
  {
    id: '3',
    name: 'PERU',
    flag: '/assets/flags/peru.png',
    image: '/assets/destinations/peru.png',
    duration: '5 Days, 4 Nights',
    price: '₹ 99,779',
    route: ['Hanoi', 'Ha Long Bay', 'Ho Chi Minh City'],
  },
  {
    id: '4',
    name: 'PHILIPPINES',
    flag: '/assets/flags/philippines.png',
    image: '/assets/destinations/philippines.png',
    duration: '5 Days, 4 Nights',
    price: '₹ 99,779',
    route: ['Hanoi', 'Ha Long Bay', 'Ho Chi Minh City'],
  },
  {
    id: '5',
    name: 'BRAZIL',
    flag: '/assets/flags/brazil.png',
    image: '/assets/destinations/brazil.png',
    duration: '5 Days, 4 Nights',
    price: '₹ 99,779',
    route: ['Hanoi', 'Ha Long Bay', 'Ho Chi Minh City'],
  },
  {
    id: '6',
    name: 'INDIA',
    flag: '/assets/flags/india.png',
    image: '/assets/destinations/india.png',
    duration: '5 Days, 4 Nights',
    price: '₹ 99,779',
    route: ['Hanoi', 'Ha Long Bay', 'Ho Chi Minh City'],
  },
  {
    id: '7',
    name: 'MALDIVES',
    flag: '/assets/flags/maldives.png',
    image: '/assets/destinations/maldives.png',
    duration: '5 Days, 4 Nights',
    price: '₹ 99,779',
    route: ['Hanoi', 'Ha Long Bay', 'Ho Chi Minh City'],
  },
  {
    id: '8',
    name: 'LAOS',
    flag: '/assets/flags/laos.png',
    image: '/assets/destinations/laos.png',
    duration: '5 Days, 4 Nights',
    price: '₹ 99,779',
    route: ['Hanoi', 'Ha Long Bay', 'Ho Chi Minh City'],
  },
];

export default function ExplorePage({ onClose }: ExplorePageProps) {
  const [selectedTab, setSelectedTab] = useState<'trending' | 'mostViewed' | 'mostBooked'>('trending');

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden">
      {/* Header with Tabs - Matching Figma padding */}
      <div className="w-full px-4 md:px-6 lg:px-8 pt-6 pb-4 border-b" style={{ borderColor: '#E6F0F7' }}>
        <h1 
          className="text-[24px] md:text-[28px] lg:text-[32px] font-semibold mb-4"
          style={{
            fontFamily: 'var(--font-bricolage-grotesque)',
            color: COLORS.blubeezNavy,
          }}
        >
          Explore Destinations
        </h1>
        
        {/* Tabs */}
        <div className="flex gap-6">
          <button
            onClick={() => setSelectedTab('trending')}
            className={`pb-3 px-1 text-[14px] md:text-[16px] font-medium transition-all relative ${
              selectedTab === 'trending' ? 'text-[#2C5282]' : 'text-gray-500'
            }`}
            style={{
              fontFamily: 'var(--font-poppins)',
            }}
          >
            Trending
            {selectedTab === 'trending' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: COLORS.blubeezBlue }} />
            )}
          </button>
          
          <button
            onClick={() => setSelectedTab('mostViewed')}
            className={`pb-3 px-1 text-[14px] md:text-[16px] font-medium transition-all relative ${
              selectedTab === 'mostViewed' ? 'text-[#2C5282]' : 'text-gray-500'
            }`}
            style={{
              fontFamily: 'var(--font-poppins)',
            }}
          >
            Most Viewed
            {selectedTab === 'mostViewed' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: COLORS.blubeezBlue }} />
            )}
          </button>
          
          <button
            onClick={() => setSelectedTab('mostBooked')}
            className={`pb-3 px-1 text-[14px] md:text-[16px] font-medium transition-all relative ${
              selectedTab === 'mostBooked' ? 'text-[#2C5282]' : 'text-gray-500'
            }`}
            style={{
              fontFamily: 'var(--font-poppins)',
            }}
          >
            Most Booked
            {selectedTab === 'mostBooked' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: COLORS.blubeezBlue }} />
            )}
          </button>
        </div>
      </div>

      {/* Destinations Grid - Matching Figma padding and layout */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
          {destinations.map((destination) => (
            <div
              key={destination.id}
              className="bg-white rounded-[16px] overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              style={{ border: '1px solid #E6F0F7' }}
            >
              {/* Image Container */}
              <div className="relative w-full h-[180px] md:h-[200px] overflow-hidden">
                <Image
                  src={destination.image}
                  alt={destination.name}
                  fill
                  className="object-cover"
                />
                {/* Flag Overlay */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full overflow-hidden shadow-sm border-2 border-white">
                  <Image
                    src={destination.flag}
                    alt={`${destination.name} flag`}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4">
                {/* Destination Name */}
                <h3
                  className="text-[18px] md:text-[20px] font-semibold mb-2"
                  style={{
                    fontFamily: 'var(--font-bricolage-grotesque)',
                    color: COLORS.blubeezNavy,
                  }}
                >
                  {destination.name}
                </h3>

                {/* Duration and Price */}
                <div className="flex justify-between items-center mb-3">
                  <span
                    className="text-[12px] md:text-[13px] text-gray-600"
                    style={{
                      fontFamily: 'var(--font-poppins)',
                    }}
                  >
                    {destination.duration}
                  </span>
                  <span
                    className="text-[14px] md:text-[15px] font-semibold"
                    style={{
                      fontFamily: 'var(--font-poppins)',
                      color: COLORS.blubeezBlue,
                    }}
                  >
                    {destination.price}
                  </span>
                </div>

                {/* Route */}
                <div className="flex items-center gap-2 text-[11px] md:text-[12px] text-gray-500"
                  style={{
                    fontFamily: 'var(--font-poppins)',
                  }}
                >
                  {destination.route.map((location, index) => (
                    <span key={index} className="flex items-center gap-2">
                      {location}
                      {index < destination.route.length - 1 && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                          <path d="M6 3L11 8L6 13" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                  ))}
                </div>

                {/* Book Now Button */}
                <button
                  className="mt-4 w-full py-2.5 rounded-[8px] text-[14px] font-medium transition-colors hover:opacity-90"
                  style={{
                    backgroundColor: COLORS.blubeezBlue,
                    color: 'white',
                    fontFamily: 'var(--font-poppins)',
                  }}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import React from 'react';
import Image from 'next/image';
import { COLORS } from '../constants/colors';

interface ExplorePageProps {
  onClose?: () => void;
  compact?: boolean;
  onDestinationClick?: (countryName: string) => void;
}

interface Destination {
  id: string;
  name: string;
  flag: string;
  image: string;
  duration: string;
  price: string;
  priceDetail: string;
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
    priceDetail: 'Per person',
    route: ['Hanoi', 'Ha Long Bay', 'Ho Chi Minh City'],
  },
  {
    id: '2',
    name: 'MALAYSIA',
    flag: '/assets/flags/malaysia.png',
    image: '/assets/destinations/malaysia.png',
    duration: '5 Days, 4 Nights',
    price: '₹ 99,779',
    priceDetail: 'Per person',
    route: ['Hanoi', 'Ha Long Bay', 'Ho Chi Minh City'],
  },
  {
    id: '3',
    name: 'PERU',
    flag: '/assets/flags/peru.png',
    image: '/assets/destinations/peru.png',
    duration: '5 Days, 4 Nights',
    price: '₹ 99,779',
    priceDetail: 'Per person',
    route: ['Hanoi', 'Ha Long Bay', 'Ho Chi Minh City'],
  },
  {
    id: '4',
    name: 'PHILIPPINES',
    flag: '/assets/flags/philippines.png',
    image: '/assets/destinations/philippines.png',
    duration: '5 Days, 4 Nights',
    price: '₹ 99,779',
    priceDetail: 'Per person',
    route: ['Hanoi', 'Ha Long Bay', 'Ho Chi Minh City'],
  },
  {
    id: '5',
    name: 'BRAZIL',
    flag: '/assets/flags/brazil.png',
    image: '/assets/destinations/brazil.png',
    duration: '5 Days, 4 Nights',
    price: '₹ 99,779',
    priceDetail: 'Per person',
    route: ['Hanoi', 'Ha Long Bay', 'Ho Chi Minh City'],
  },
  {
    id: '6',
    name: 'INDIA',
    flag: '/assets/flags/india.png',
    image: '/assets/destinations/india.png',
    duration: '5 Days, 4 Nights',
    price: '₹ 99,779',
    priceDetail: 'Per person',
    route: ['Hanoi', 'Ha Long Bay', 'Ho Chi Minh City'],
  },
  {
    id: '7',
    name: 'MALDIVES',
    flag: '/assets/flags/maldives.png',
    image: '/assets/destinations/maldives.png',
    duration: '5 Days, 4 Nights',
    price: '₹ 99,779',
    priceDetail: 'Per person',
    route: ['Hanoi', 'Ha Long Bay', 'Ho Chi Minh City'],
  },
  {
    id: '8',
    name: 'LAOS',
    flag: '/assets/flags/laos.png',
    image: '/assets/destinations/laos.png',
    duration: '5 Days, 4 Nights',
    price: '₹ 99,779',
    priceDetail: 'Per person',
    route: ['Hanoi', 'Ha Long Bay', 'Ho Chi Minh City'],
  },
];

export default function ExplorePage({ onClose, compact = false, onDestinationClick }: ExplorePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [userCurrency, setUserCurrency] = useState<string>('INR');
  const [exchangeRate, setExchangeRate] = useState<number>(1);

  // Detect user's location and currency from IP
  React.useEffect(() => {
    const detectLocationAndCurrency = async () => {
      try {
        // Get user's IP location
        const ipResponse = await fetch('https://ipapi.co/json/');
        const ipData = await ipResponse.json();
        const userCountry = ipData.country_code;

        // Currency mapping based on country
        const currencyMap: Record<string, string> = {
          US: 'USD',
          GB: 'GBP',
          EU: 'EUR',
          IN: 'INR',
          AU: 'AUD',
          CA: 'CAD',
          SG: 'SGD',
          MY: 'MYR',
          TH: 'THB',
          // Add more as needed
        };

        const detectedCurrency = currencyMap[userCountry] || 'USD';
        setUserCurrency(detectedCurrency);

        // Fetch exchange rate from INR to user's currency
        if (detectedCurrency !== 'INR') {
          const rateResponse = await fetch(`https://api.exchangerate-api.com/v4/latest/INR`);
          const rateData = await rateResponse.json();
          const rate = rateData.rates[detectedCurrency] || 1;
          setExchangeRate(rate);
        }
      } catch (error) {
        console.error('Failed to detect location/currency:', error);
        // Default to USD if detection fails
        setUserCurrency('USD');
        setExchangeRate(0.012); // Approximate INR to USD
      }
    };

    detectLocationAndCurrency();
  }, []);

  const convertPrice = (inrPrice: string): string => {
    const numericPrice = parseFloat(inrPrice.replace(/[₹,]/g, ''));
    const converted = Math.round(numericPrice * exchangeRate);
    
    const currencySymbols: Record<string, string> = {
      USD: '$',
      GBP: '£',
      EUR: '€',
      INR: '₹',
      AUD: 'A$',
      CAD: 'C$',
      SGD: 'S$',
      MYR: 'RM',
      THB: '฿',
    };

    const symbol = currencySymbols[userCurrency] || userCurrency;
    return `${symbol} ${converted.toLocaleString()}`;
  };

  const handleDestinationClick = (countryName: string) => {
    if (onDestinationClick) onDestinationClick(countryName);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className={`w-full ${compact ? 'px-3 pt-3 pb-4' : 'px-4 md:px-6 lg:px-8 pt-4 pb-6'}`}>
        {!compact && (
          <div className="flex items-center gap-3 mb-6 border-b pb-4" style={{ borderColor: '#cee2f2' }}>
            <div className="w-12 h-12 flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#E6F0F7" />
                <path d="M24 14L28 22H20L24 14Z" fill={COLORS.blubeezBlue} />
                <path d="M24 34L20 26H28L24 34Z" fill={COLORS.blubeezBlue} />
              </svg>
            </div>
            <h1
              className="text-[32px] md:text-[36px] lg:text-[40px] font-medium"
              style={{
                fontFamily: 'var(--font-bricolage-grotesque)',
                color: '#475f73',
              }}
            >
              Explore
            </h1>
          </div>
        )}

        {compact && (
          <div className="mb-4">
            <p
              className="text-sm font-medium text-gray-600 mb-1"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              For you
            </p>
          </div>
        )}

        {!compact && (
          <div
            className="flex items-center justify-between px-4 py-3 rounded-2xl border max-w-md"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderColor: '#6b85b7',
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="flex-1 bg-transparent text-sm outline-none placeholder-neutral-400"
              style={{ fontFamily: 'var(--font-poppins)' }}
            />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                fill="#6b85b7"
              />
            </svg>
          </div>
        )}
      </div>

        <div 
          className={`flex-1 overflow-y-auto ${compact ? 'px-3 pb-4' : 'px-4 md:px-6 lg:px-8 pb-8'}`}
          onScroll={(e) => {
            const scrollTop = e.currentTarget.scrollTop;
            setIsScrolled(scrollTop > 50);
          }}
        >
          <div
            className={`grid ${compact
              ? 'grid-cols-2 gap-3'
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8'
              }`}
          >
            {destinations.map((destination) => {
              const isSelected = selectedCard === destination.id;
              const shouldBeGlass = isScrolled && !isSelected;
              
              return (
              <div
                key={destination.id}
                onClick={() => setSelectedCard(isSelected ? null : destination.id)}
                className={`relative ${compact ? 'h-[180px]' : 'h-[280px]'} w-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ${
                  isSelected ? 'scale-[1.05] z-10' : 'hover:scale-[1.02]'
                }`}
              >
                {/* Background Image */}
                <div className={`absolute inset-0 transition-all duration-500 ${
                  shouldBeGlass ? 'opacity-40' : 'opacity-100'
                }`}>
                  <Image
                    src={destination.image}
                    alt={destination.name}
                    fill
                    className="object-cover scale-[1.05] brightness-[0.9] contrast-[1.05]"
                    style={{
                      filter: shouldBeGlass ? 'blur(20px) saturate(0.8)' : 'blur(14px) saturate(1.05)',
                      transform: 'translateZ(0)',
                      willChange: 'filter',
                      transition: 'filter 0.5s ease-in-out',
                    }}
                    priority
                  />
                </div>

                {/* Glass Effect Overlay when scrolled */}
                {shouldBeGlass && (
                  <div
                    className="absolute inset-0 transition-opacity duration-500"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(12px)',
                    }}
                  />
                )}

                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    shouldBeGlass ? 'opacity-60' : 'opacity-100'
                  }`}
                  style={{
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.1) 100%)',
                    backdropFilter: 'blur(2px)',
                  }}
                />

                {/* Top overlay - Price & arrow */}
                <div
                  className={`absolute top-0 left-0 right-0 h-24 p-[18px] flex items-start justify-between transition-opacity duration-500 ${
                    shouldBeGlass ? 'opacity-70' : 'opacity-100'
                  }`}
                  style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                  }}
                >
                  <div className="flex flex-col text-white">
                    <p
                      className={`${compact ? 'text-[11px]' : 'text-[12px]'} font-medium leading-[14px]`}
                      style={{ fontFamily: 'var(--font-poppins)' }}
                    >
                      {convertPrice(destination.price)}
                    </p>
                    <p
                      className="text-[8px] font-medium"
                      style={{ fontFamily: 'var(--font-poppins)' }}
                    >
                      {destination.priceDetail}
                    </p>
                  </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDestinationClick(destination.name);
                  }}
                  className="hover:scale-110 transition-transform"
                  aria-label={`Plan trip to ${destination.name}`}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M1 13L13 1M13 1H1M13 1V13"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

                {/* Bottom overlay - Flag, Duration, Route */}
                <div
                  className={`absolute bottom-0 left-0 right-0 ${compact ? 'h-40' : 'h-48'} ${compact ? 'p-[12px]' : 'p-[18px]'} flex flex-col items-center justify-end transition-opacity duration-500 ${
                    shouldBeGlass ? 'opacity-70' : 'opacity-100'
                  }`}
                  style={{
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
                    backdropFilter: 'blur(2px)',
                  }}
                >
                  <div className={`flex flex-col items-center ${compact ? 'gap-1' : 'gap-2'} w-full ${compact ? 'mb-1' : 'mb-2'}`}>
                    <div className={`${compact ? 'w-6 h-3' : 'w-8 h-4'} relative`}>
                      <Image
                        src={destination.flag}
                        alt={`${destination.name} flag`}
                        fill
                        className="object-cover rounded-sm"
                      />
                    </div>
                    <p
                      className={`${compact ? 'text-[10px]' : 'text-[12px]'} font-medium text-center text-white`}
                      style={{ fontFamily: 'var(--font-poppins)' }}
                    >
                      {destination.duration}
                    </p>
                  </div>

                  <h3
                    className={`${compact ? 'text-[16px]' : 'text-[20px]'} font-black italic text-center text-white uppercase w-full mb-1`}
                    style={{
                      fontFamily: 'var(--font-poppins)',
                      fontWeight: 900,
                    }}
                  >
                    {destination.name}
                  </h3>

                  <div className="flex items-center gap-1 justify-center w-full">
                    {destination.route.map((location, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <span
                          className={`${compact ? 'text-[8px]' : 'text-[9px]'} text-white`}
                          style={{ fontFamily: 'var(--font-poppins)' }}
                        >
                          {location}
                        </span>
                        {index < destination.route.length - 1 && (
                          <svg
                            width={compact ? '8' : '10.5'}
                            height={compact ? '8' : '10.5'}
                            viewBox="0 0 11 11"
                            fill="none"
                            className="rotate-90"
                          >
                            <path
                              d="M1 1L10 10"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

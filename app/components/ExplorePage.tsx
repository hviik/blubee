'use client';

import { useState } from 'react';
import Image from 'next/image';
import { COLORS } from '../constants/colors';

interface ExplorePageProps {
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
    route: ['Kuala Lumpur', 'Penang', 'Langkawi'],
  },
  {
    id: '3',
    name: 'PERU',
    flag: '/assets/flags/peru.png',
    image: '/assets/destinations/peru.png',
    duration: '5 Days, 4 Nights',
    price: '₹ 99,779',
    priceDetail: 'Per person',
    route: ['Lima', 'Cusco', 'Machu Picchu'],
  },
  {
    id: '4',
    name: 'PHILIPPINES',
    flag: '/assets/flags/philippines.png',
    image: '/assets/destinations/philippines.png',
    duration: '5 Days, 4 Nights',
    price: '₹ 99,779',
    priceDetail: 'Per person',
    route: ['Manila', 'Cebu', 'Palawan'],
  },
  {
    id: '5',
    name: 'BRAZIL',
    flag: '/assets/flags/brazil.png',
    image: '/assets/destinations/brazil.png',
    duration: '5 Days, 4 Nights',
    price: '₹ 99,779',
    priceDetail: 'Per person',
    route: ['Rio de Janeiro', 'São Paulo', 'Iguazu Falls'],
  },
  {
    id: '6',
    name: 'INDIA',
    flag: '/assets/flags/india.png',
    image: '/assets/destinations/india.png',
    duration: '5 Days, 4 Nights',
    price: '₹ 99,779',
    priceDetail: 'Per person',
    route: ['Delhi', 'Agra', 'Jaipur'],
  },
  {
    id: '7',
    name: 'MALDIVES',
    flag: '/assets/flags/maldives.png',
    image: '/assets/destinations/maldives.png',
    duration: '5 Days, 4 Nights',
    price: '₹ 99,779',
    priceDetail: 'Per person',
    route: ['Male', 'Ari Atoll', 'Vaavu'],
  },
  {
    id: '8',
    name: 'LAOS',
    flag: '/assets/flags/laos.png',
    image: '/assets/destinations/laos.png',
    duration: '5 Days, 4 Nights',
    price: '₹ 99,779',
    priceDetail: 'Per person',
    route: ['Luang Prabang', 'Vang Vieng', 'Vientiane'],
  },
];

export default function ExplorePage({ compact = false, onDestinationClick }: ExplorePageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-full h-full flex flex-col bg-transparent overflow-hidden">
      <div className={`${compact ? 'px-3 pt-3 pb-3' : 'px-6 pt-4 pb-2'} shrink-0`}>
        {!compact && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#e6f0f7]">
              <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                <path d="M24 14L28 22H20L24 14Z" fill={COLORS.blubeezBlue} />
                <path d="M24 34L20 26H28L24 34Z" fill={COLORS.blubeezBlue} />
              </svg>
            </div>
            <h1
              className="text-[28px] md:text-[32px] font-semibold"
              style={{
                fontFamily: 'var(--font-bricolage-grotesque)',
                color: '#475f73',
              }}
            >
              Explore
            </h1>
          </div>
        )}

        <div
          className="flex items-center justify-between px-4 py-[10px] rounded-xl border max-w-md"
          style={{
            backgroundColor: 'rgba(255,255,255,0.45)',
            borderColor: '#a8c2e1',
          }}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
            style={{ fontFamily: 'var(--font-poppins)', color: '#333' }}
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
              fill="#6b85b7"
            />
          </svg>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 md:px-6 pb-6 bg-transparent"
        style={{
          minWidth: '0',
          flexShrink: 1,
        }}
      >
        <div
          className="grid gap-6 md:gap-8 mt-4 justify-center"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          }}
        >
          {destinations.map((d) => (
            <div
              key={d.id}
              className="relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300"
              onClick={() => onDestinationClick?.(d.name)}
            >
              <div className="absolute inset-0">
                <Image
                  src={d.image}
                  alt={d.name}
                  fill
                  className="object-cover brightness-[0.95] contrast-[1.08]"
                  style={{
                    transform: 'translateZ(0)',
                    willChange: 'filter',
                  }}
                  priority
                />
              </div>

              <div
                className="absolute top-0 left-0 right-0 h-24 p-[18px] flex items-start justify-between"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
                }}
              >
                <div className="flex flex-col text-white">
                  <p
                    className="text-[12px] font-medium leading-[14px]"
                    style={{ fontFamily: 'var(--font-poppins)' }}
                  >
                    {d.price}
                  </p>
                  <p
                    className="text-[9px] font-medium opacity-90"
                    style={{ fontFamily: 'var(--font-poppins)' }}
                  >
                    {d.priceDetail}
                  </p>
                </div>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="hover:scale-110 transition-transform"
                >
                  <path
                    d="M1 13L13 1M13 1H1M13 1V13"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 h-48 p-[18px] flex flex-col items-center justify-end"
                style={{
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.05) 100%)',
                }}
              >
                <div className="flex flex-col items-center gap-2 w-full mb-2">
                  <div className="w-8 h-4 relative">
                    <Image
                      src={d.flag}
                      alt={`${d.name} flag`}
                      fill
                      className="object-cover rounded-sm"
                    />
                  </div>
                  <p
                    className="text-[12px] font-medium text-center text-white"
                    style={{ fontFamily: 'var(--font-poppins)' }}
                  >
                    {d.duration}
                  </p>
                </div>

                <h3
                  className="text-[20px] font-black italic text-center text-white uppercase w-full mb-1"
                  style={{
                    fontFamily: 'var(--font-poppins)',
                    fontWeight: 900,
                  }}
                >
                  {d.name}
                </h3>

                <div className="flex items-center gap-1 justify-center w-full">
                  {d.route.map((loc, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span
                        className="text-[9px] text-white"
                        style={{ fontFamily: 'var(--font-poppins)' }}
                      >
                        {loc}
                      </span>
                      {i < d.route.length - 1 && (
                        <svg
                          width="10.5"
                          height="10.5"
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
          ))}
        </div>
      </div>
    </div>
  );
}

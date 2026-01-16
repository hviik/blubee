'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { COLORS } from '../constants/colors';
import { detectUserCurrency, getExchangeRate, CurrencyInfo } from '../utils/currencyDetection';
import { getDestinationImageByISO, getFlagImageByISO, getISO2Code, getCountryFromISO } from '../utils/countryData';
import HeartButton, { DoubleTapHeartOverlay } from './HeartButton';
import { TripDetailView } from './trips';

interface ExplorePageProps {
  compact?: boolean;
  onDestinationClick?: (countryName: string, route: string[]) => void;
}

interface DayActivity {
  morning?: string;
  afternoon?: string;
  evening?: string;
}

interface ItineraryDay {
  dayNumber: number;
  date?: string;
  location: string;
  title: string;
  description?: string;
  activities?: DayActivity;
  places?: { name: string; type: 'stays' | 'restaurants' | 'attraction' | 'activities' }[];
}

export interface Destination {
  id: string;
  name: string;
  iso2: string;
  duration: string;
  priceINR: number;
  priceDetail: string;
  route: string[];
  itinerary?: ItineraryDay[];
}

// Sample itineraries for explore destinations
const sampleItineraries: Record<string, ItineraryDay[]> = {
  'vn': [
    { dayNumber: 1, location: 'Hanoi', title: 'Arrival in Hanoi', activities: { morning: 'Arrive at Noi Bai International Airport and transfer to hotel', afternoon: 'Explore the Old Quarter and Hoan Kiem Lake', evening: 'Enjoy Vietnamese street food and water puppet show' } },
    { dayNumber: 2, location: 'Hanoi', title: 'Hanoi Exploration', activities: { morning: 'Visit Ho Chi Minh Mausoleum and Temple of Literature', afternoon: 'Explore the Vietnam Museum of Ethnology', evening: 'Walking food tour through Hanoi' } },
    { dayNumber: 3, location: 'Ha Long Bay', title: 'Ha Long Bay Cruise', activities: { morning: 'Drive to Ha Long Bay and board overnight cruise', afternoon: 'Cruise through limestone karsts and visit caves', evening: 'Sunset kayaking and seafood dinner on the boat' } },
    { dayNumber: 4, location: 'Ho Chi Minh City', title: 'Flight to Ho Chi Minh City', activities: { morning: 'Morning Tai Chi on the cruise deck, return to Hanoi', afternoon: 'Fly to Ho Chi Minh City', evening: 'Explore Ben Thanh Market and Nguyen Hue Walking Street' } },
    { dayNumber: 5, location: 'Ho Chi Minh City', title: 'Departure', activities: { morning: 'Visit Cu Chi Tunnels or War Remnants Museum', afternoon: 'Last-minute shopping and departure' } },
  ],
  'my': [
    { dayNumber: 1, location: 'Kuala Lumpur', title: 'Arrival in Kuala Lumpur', activities: { morning: 'Arrive at KLIA and transfer to hotel', afternoon: 'Visit Petronas Twin Towers and KLCC Park', evening: 'Dinner at Jalan Alor food street' } },
    { dayNumber: 2, location: 'Kuala Lumpur', title: 'KL City Tour', activities: { morning: 'Batu Caves and Hindu temple visit', afternoon: 'Explore Chinatown and Central Market', evening: 'Visit the KL Tower for panoramic night views' } },
    { dayNumber: 3, location: 'Penang', title: 'Penang Heritage', activities: { morning: 'Fly to Penang, explore George Town street art', afternoon: 'Visit Kek Lok Si Temple', evening: 'Penang hawker food at Gurney Drive' } },
    { dayNumber: 4, location: 'Langkawi', title: 'Langkawi Paradise', activities: { morning: 'Ferry to Langkawi, cable car ride', afternoon: 'Island hopping tour', evening: 'Sunset cruise with dinner' } },
    { dayNumber: 5, location: 'Langkawi', title: 'Departure', activities: { morning: 'Relax at Cenang Beach or duty-free shopping', afternoon: 'Departure from Langkawi' } },
  ],
  'pe': [
    { dayNumber: 1, location: 'Lima', title: 'Arrival in Lima', activities: { morning: 'Arrive at Jorge Chavez Airport', afternoon: 'Explore Miraflores district and Larcomar', evening: 'Dinner featuring Peruvian cuisine' } },
    { dayNumber: 2, location: 'Cusco', title: 'Gateway to the Incas', activities: { morning: 'Fly to Cusco, acclimatize to altitude', afternoon: 'Walking tour of Plaza de Armas and San Pedro Market', evening: 'Traditional dinner with live Andean music' } },
    { dayNumber: 3, location: 'Sacred Valley', title: 'Sacred Valley Tour', activities: { morning: 'Visit Pisac ruins and market', afternoon: 'Explore Ollantaytambo fortress', evening: 'Return to Cusco or stay in the Valley' } },
    { dayNumber: 4, location: 'Machu Picchu', title: 'Machu Picchu Wonder', activities: { morning: 'Early train to Aguas Calientes, guided tour of Machu Picchu', afternoon: 'Free time to explore the citadel', evening: 'Return to Cusco' } },
    { dayNumber: 5, location: 'Lima', title: 'Departure', activities: { morning: 'Fly back to Lima', afternoon: 'Departure or extend in Lima' } },
  ],
  'ph': [
    { dayNumber: 1, location: 'Manila', title: 'Manila Arrival', activities: { morning: 'Arrive at NAIA', afternoon: 'Explore Intramuros and Fort Santiago', evening: 'Dinner at Manila Bay' } },
    { dayNumber: 2, location: 'Cebu', title: 'Cebu Island', activities: { morning: 'Fly to Cebu, Magellan\'s Cross visit', afternoon: 'Whale shark watching in Oslob', evening: 'Seafood dinner in Cebu City' } },
    { dayNumber: 3, location: 'Cebu', title: 'Cebu Adventures', activities: { morning: 'Canyoneering at Kawasan Falls', afternoon: 'Visit Moalboal for snorkeling', evening: 'Beach relaxation' } },
    { dayNumber: 4, location: 'Palawan', title: 'Palawan Paradise', activities: { morning: 'Fly to Puerto Princesa or El Nido', afternoon: 'Underground River tour or island hopping', evening: 'Beach dinner under the stars' } },
    { dayNumber: 5, location: 'Palawan', title: 'Departure', activities: { morning: 'Lagoon kayaking or snorkeling', afternoon: 'Departure from Palawan' } },
  ],
  'br': [
    { dayNumber: 1, location: 'Rio de Janeiro', title: 'Welcome to Rio', activities: { morning: 'Arrive at Galeão Airport', afternoon: 'Copacabana and Ipanema beach walk', evening: 'Samba show in Lapa' } },
    { dayNumber: 2, location: 'Rio de Janeiro', title: 'Rio Landmarks', activities: { morning: 'Christ the Redeemer via Corcovado train', afternoon: 'Sugarloaf Mountain cable car', evening: 'Dinner at a churrascaria' } },
    { dayNumber: 3, location: 'São Paulo', title: 'São Paulo Culture', activities: { morning: 'Fly to São Paulo', afternoon: 'Visit MASP and Paulista Avenue', evening: 'Explore Vila Madalena nightlife' } },
    { dayNumber: 4, location: 'Iguazu Falls', title: 'Iguazu Falls', activities: { morning: 'Fly to Foz do Iguaçu', afternoon: 'Brazilian side of the falls', evening: 'Return to hotel, relax' } },
    { dayNumber: 5, location: 'Iguazu Falls', title: 'Departure', activities: { morning: 'Optional visit to Argentine side', afternoon: 'Departure' } },
  ],
  'in': [
    { dayNumber: 1, location: 'Delhi', title: 'Delhi Arrival', activities: { morning: 'Arrive at Indira Gandhi Airport', afternoon: 'Visit India Gate and Humayun\'s Tomb', evening: 'Explore Connaught Place' } },
    { dayNumber: 2, location: 'Delhi', title: 'Old Delhi Heritage', activities: { morning: 'Red Fort and Jama Masjid', afternoon: 'Chandni Chowk street food tour', evening: 'Qutub Minar at sunset' } },
    { dayNumber: 3, location: 'Agra', title: 'Taj Mahal Day', activities: { morning: 'Early drive to Agra, sunrise Taj Mahal visit', afternoon: 'Agra Fort exploration', evening: 'Drive to Jaipur' } },
    { dayNumber: 4, location: 'Jaipur', title: 'Pink City', activities: { morning: 'Amber Fort elephant ride', afternoon: 'City Palace and Hawa Mahal', evening: 'Shopping at Johari Bazaar' } },
    { dayNumber: 5, location: 'Jaipur', title: 'Departure', activities: { morning: 'Jantar Mantar observatory', afternoon: 'Return to Delhi for departure' } },
  ],
  'mv': [
    { dayNumber: 1, location: 'Male', title: 'Maldives Arrival', activities: { morning: 'Arrive at Velana Airport', afternoon: 'Speedboat/seaplane to resort in Ari Atoll', evening: 'Welcome dinner and beach relaxation' } },
    { dayNumber: 2, location: 'Ari Atoll', title: 'Ocean Adventures', activities: { morning: 'Snorkeling at house reef', afternoon: 'Dolphin watching cruise', evening: 'Romantic beach dinner' } },
    { dayNumber: 3, location: 'Ari Atoll', title: 'Water Sports', activities: { morning: 'Scuba diving or whale shark excursion', afternoon: 'Spa treatment overwater', evening: 'Sunset fishing trip' } },
    { dayNumber: 4, location: 'Vaavu', title: 'Island Hopping', activities: { morning: 'Visit local island and village', afternoon: 'Sandbank picnic lunch', evening: 'Night snorkeling with manta rays' } },
    { dayNumber: 5, location: 'Male', title: 'Departure', activities: { morning: 'Final snorkeling or beach time', afternoon: 'Transfer back to Male for departure' } },
  ],
  'la': [
    { dayNumber: 1, location: 'Luang Prabang', title: 'Arrival in Luang Prabang', activities: { morning: 'Arrive at Luang Prabang Airport', afternoon: 'Explore the UNESCO heritage town', evening: 'Night market and traditional dinner' } },
    { dayNumber: 2, location: 'Luang Prabang', title: 'Cultural Immersion', activities: { morning: 'Alms giving ceremony at dawn, Kuang Si Falls', afternoon: 'Visit Wat Xieng Thong and Royal Palace', evening: 'Mekong River sunset cruise' } },
    { dayNumber: 3, location: 'Vang Vieng', title: 'Vang Vieng Adventure', activities: { morning: 'Drive to Vang Vieng through scenic route', afternoon: 'Tubing or kayaking on Nam Song River', evening: 'Caves exploration' } },
    { dayNumber: 4, location: 'Vientiane', title: 'Capital City', activities: { morning: 'Drive to Vientiane', afternoon: 'Patuxai Monument and Pha That Luang', evening: 'French colonial quarter and local Lao BBQ' } },
    { dayNumber: 5, location: 'Vientiane', title: 'Departure', activities: { morning: 'Buddha Park excursion', afternoon: 'Departure from Wattay Airport' } },
  ],
};

const destinations: Destination[] = [
  {
    id: 'vn',
    name: 'VIETNAM',
    iso2: 'vn',
    duration: '5 Days, 4 Nights',
    priceINR: 74500,
    priceDetail: 'Per person',
    route: ['Hanoi', 'Ha Long Bay', 'Ho Chi Minh City'],
    itinerary: sampleItineraries['vn'],
  },
  {
    id: 'my',
    name: 'MALAYSIA',
    iso2: 'my',
    duration: '5 Days, 4 Nights',
    priceINR: 68900,
    priceDetail: 'Per person',
    route: ['Kuala Lumpur', 'Penang', 'Langkawi'],
    itinerary: sampleItineraries['my'],
  },
  {
    id: 'pe',
    name: 'PERU',
    iso2: 'pe',
    duration: '5 Days, 4 Nights',
    priceINR: 215000,
    priceDetail: 'Per person',
    route: ['Lima', 'Cusco', 'Machu Picchu'],
    itinerary: sampleItineraries['pe'],
  },
  {
    id: 'ph',
    name: 'PHILIPPINES',
    iso2: 'ph',
    duration: '5 Days, 4 Nights',
    priceINR: 82400,
    priceDetail: 'Per person',
    route: ['Manila', 'Cebu', 'Palawan'],
    itinerary: sampleItineraries['ph'],
  },
  {
    id: 'br',
    name: 'BRAZIL',
    iso2: 'br',
    duration: '5 Days, 4 Nights',
    priceINR: 245000,
    priceDetail: 'Per person',
    route: ['Rio de Janeiro', 'São Paulo', 'Iguazu Falls'],
    itinerary: sampleItineraries['br'],
  },
  {
    id: 'in',
    name: 'INDIA',
    iso2: 'in',
    duration: '5 Days, 4 Nights',
    priceINR: 38500,
    priceDetail: 'Per person',
    route: ['Delhi', 'Agra', 'Jaipur'],
    itinerary: sampleItineraries['in'],
  },
  {
    id: 'mv',
    name: 'MALDIVES',
    iso2: 'mv',
    duration: '5 Days, 4 Nights',
    priceINR: 112000,
    priceDetail: 'Per person',
    route: ['Male', 'Ari Atoll', 'Vaavu'],
    itinerary: sampleItineraries['mv'],
  },
  {
    id: 'la',
    name: 'LAOS',
    iso2: 'la',
    duration: '5 Days, 4 Nights',
    priceINR: 71200,
    priceDetail: 'Per person',
    route: ['Luang Prabang', 'Vang Vieng', 'Vientiane'],
    itinerary: sampleItineraries['la'],
  },
];

export default function ExplorePage({ compact = false, onDestinationClick }: ExplorePageProps) {
  const { isSignedIn } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [likedDestinations, setLikedDestinations] = useState<Set<string>>(new Set());
  const [loadingLikes, setLoadingLikes] = useState<Set<string>>(new Set());
  const [showHeartOverlay, setShowHeartOverlay] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  
  const lastTapTimeRef = useRef<{ [key: string]: number }>({});

  useEffect(() => {
    const initCurrency = async () => {
      const currency = await detectUserCurrency();
      setCurrencyInfo(currency);
      
      if (currency.code !== 'INR') {
        const rate = await getExchangeRate('INR', currency.code);
        setExchangeRate(rate);
      }
    };

    initCurrency();
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isSignedIn) {
        setLikedDestinations(new Set());
        return;
      }

      try {
        const response = await fetch('/api/wishlist');
        if (response.ok) {
          const data = await response.json();
          const ids = data.wishlistIds || [];
          setLikedDestinations(new Set(ids));
        }
      } catch (error) {
      }
    };

    fetchWishlist();
  }, [isSignedIn]);

  const convertAndFormatPrice = (priceINR: number): string => {
    if (!currencyInfo) {
      return `₹ ${priceINR.toLocaleString()}`;
    }
    
    if (currencyInfo.code === 'INR') {
      return `${currencyInfo.symbol} ${priceINR.toLocaleString()}`;
    }
    
    const convertedAmount = Math.round(priceINR * exchangeRate);
    
    return `${currencyInfo.symbol} ${convertedAmount.toLocaleString()}`;
  };

  const toggleLike = useCallback(async (destination: Destination) => {
    if (!isSignedIn) {
      return;
    }

    const isCurrentlyLiked = likedDestinations.has(destination.id);
    
    setLikedDestinations(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyLiked) {
        newSet.delete(destination.id);
      } else {
        newSet.add(destination.id);
      }
      return newSet;
    });

    setLoadingLikes(prev => new Set(prev).add(destination.id));

    try {
      if (isCurrentlyLiked) {
        const response = await fetch(`/api/wishlist?destinationId=${encodeURIComponent(destination.id)}`, {
          method: 'DELETE',
        });
        
        const responseData = await response.json().catch(() => ({}));
        
        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to remove from wishlist');
        }
      } else {
        const destinationImage = getDestinationImageByISO(destination.iso2);
        const flagImage = getFlagImageByISO(destination.iso2);
        const countryName = getCountryFromISO(destination.iso2);
        
        const payload = {
          destinationId: destination.id,
          destinationName: countryName,
          route: destination.route,
          priceINR: destination.priceINR,
          duration: destination.duration,
          iso2: destination.iso2,
          image: destinationImage,
          flag: flagImage,
          itinerary: destination.itinerary,
          country: countryName,
          days: 5,
          nights: 4,
        };
        
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        const responseData = await response.json().catch(() => ({}));
        
        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to add to wishlist');
        }
      }
      
      try {
        const refreshResponse = await fetch('/api/wishlist');
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const ids = refreshData.wishlistIds || [];
          setLikedDestinations(new Set(ids));
        }
      } catch (refreshError) {
      }
    } catch (error) {
      setLikedDestinations(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.add(destination.id);
        } else {
          newSet.delete(destination.id);
        }
        return newSet;
      });
    } finally {
      setLoadingLikes(prev => {
        const newSet = new Set(prev);
        newSet.delete(destination.id);
        return newSet;
      });
    }
  }, [isSignedIn, likedDestinations]);

  const handleCardDoubleTap = useCallback((destination: Destination) => {
    const now = Date.now();
    const lastTap = lastTapTimeRef.current[destination.id] || 0;
    
    if (now - lastTap < 300) {
      setShowHeartOverlay(destination.id);
      setTimeout(() => setShowHeartOverlay(null), 700);
      toggleLike(destination);
      lastTapTimeRef.current[destination.id] = 0;
      return true; // Was double tap
    } else {
      lastTapTimeRef.current[destination.id] = now;
      return false; // Was single tap (first tap)
    }
  }, [toggleLike]);

  const pendingClickRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  
  const handleCardClick = useCallback((destination: Destination, e: React.MouseEvent) => {
    if (pendingClickRef.current[destination.id]) {
      clearTimeout(pendingClickRef.current[destination.id]);
      delete pendingClickRef.current[destination.id];
    }

    const wasDoubleTap = handleCardDoubleTap(destination);
    
    if (!wasDoubleTap) {
      pendingClickRef.current[destination.id] = setTimeout(() => {
        delete pendingClickRef.current[destination.id];
        // Open detail view instead of redirecting to chat
        setSelectedDestination(destination);
      }, 300);
    }
  }, [handleCardDoubleTap]);

  const handleStartPlanning = useCallback(() => {
    if (selectedDestination && onDestinationClick) {
      const countryName = getCountryFromISO(selectedDestination.iso2);
      onDestinationClick(countryName, selectedDestination.route);
    }
  }, [selectedDestination, onDestinationClick]);

  const handleCloseDetail = () => {
    setSelectedDestination(null);
  };

  const filteredDestinations = searchQuery
    ? destinations.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.route.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : destinations;

  // Show detail view when a destination is selected
  if (selectedDestination) {
    // Get proper country display name from ISO2 code
    const countryName = selectedDestination.iso2 
      ? getCountryFromISO(selectedDestination.iso2)
      : selectedDestination.name.charAt(0) + selectedDestination.name.slice(1).toLowerCase();
    
    const tripData = {
      id: selectedDestination.id,
      title: countryName,
      country: countryName,
      iso2: selectedDestination.iso2,
      duration: selectedDestination.duration,
      days: 5,
      nights: 4,
      destinations: selectedDestination.route,
      itinerary: selectedDestination.itinerary,
      priceINR: selectedDestination.priceINR,
      route: selectedDestination.route,
    };

    return (
      <TripDetailView
        trip={tripData}
        onClose={handleCloseDetail}
        onStartPlanning={handleStartPlanning}
        showPlanButton={true}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-transparent overflow-hidden">
      <div className={`${compact ? 'px-3 pt-3 pb-3' : 'px-4 md:px-6 pt-4 pb-2'} shrink-0`}>
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

        {!compact && (
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
              placeholder="Search destinations..."
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
        )}
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 md:px-6 pb-6 bg-transparent"
        style={{
          minWidth: '0',
          flexShrink: 1,
        }}
      >
        <div
          className="grid gap-4 md:gap-6 lg:gap-8 mt-4 justify-center"
          style={{
            gridTemplateColumns: compact 
              ? 'repeat(2, 1fr)' 
              : 'repeat(auto-fill, minmax(160px, 220px))',
          }}
        >
          {filteredDestinations.map((d) => (
            <div
              key={d.id}
              className="relative w-full aspect-[3/4] md:aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300"
              onClick={(e) => handleCardClick(d, e)}
            >
              {/* Double-tap heart overlay animation */}
              <DoubleTapHeartOverlay show={showHeartOverlay === d.id} />

              <div className="absolute inset-0">
                <Image
                  src={getDestinationImageByISO(d.iso2)}
                  alt={getCountryFromISO(d.iso2)}
                  fill
                  className="object-cover object-center brightness-[0.95] contrast-[1.08]"
                  style={{
                    transform: 'translateZ(0)',
                    willChange: 'filter',
                  }}
                  unoptimized
                  sizes="(max-width: 768px) 45vw, 220px"
                />
              </div>

              <div
                className="absolute top-0 left-0 right-0 h-20 md:h-24 p-3 md:p-[18px] flex items-start justify-between"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
                }}
              >
                <div className="flex flex-col text-white">
                  <p
                    className="text-[10px] md:text-[12px] font-medium leading-tight"
                    style={{ fontFamily: 'var(--font-poppins)' }}
                  >
                    {convertAndFormatPrice(d.priceINR)}
                  </p>
                  <p
                    className="text-[8px] md:text-[9px] font-medium opacity-90"
                    style={{ fontFamily: 'var(--font-poppins)' }}
                  >
                    {d.priceDetail}
                  </p>
                </div>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="hover:scale-110 transition-transform md:w-[14px] md:h-[14px]"
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

              {/* Heart button positioned at actual bottom right */}
              <div className="absolute bottom-3 md:bottom-4 right-3 md:right-4 z-10">
                <HeartButton
                  isLiked={likedDestinations.has(d.id)}
                  onToggle={() => toggleLike(d)}
                  size={compact ? 'xs' : 'sm'}
                  disabled={loadingLikes.has(d.id) || !isSignedIn}
                />
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 h-40 md:h-48 p-3 md:p-[18px] flex flex-col items-center justify-end"
                style={{
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                }}
              >
                <div className="flex flex-col items-center gap-1.5 md:gap-2 w-full mb-1.5 md:mb-2">
                  <div className="w-7 h-3.5 md:w-8 md:h-4 relative overflow-hidden rounded-sm">
                    <Image
                      src={getFlagImageByISO(d.iso2)}
                      alt={`${getCountryFromISO(d.iso2)} flag`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <p
                    className="text-[10px] md:text-[12px] font-medium text-center text-white"
                    style={{ fontFamily: 'var(--font-poppins)' }}
                  >
                    {d.duration}
                  </p>
                </div>

                <h3
                  className="text-[18px] md:text-[24px] font-black italic text-center text-white uppercase w-full mb-0.5 md:mb-1"
                  style={{
                    fontFamily: 'var(--font-poppins)',
                    fontWeight: 900,
                  }}
                >
                  {getCountryFromISO(d.iso2)}
                </h3>

                <div className="flex items-center gap-0.5 md:gap-1 justify-center w-full flex-wrap">
                  {d.route.map((loc, i) => (
                    <div key={i} className="flex items-center gap-0.5 md:gap-1">
                      <span
                        className="text-[8px] md:text-[9px] text-white"
                        style={{ fontFamily: 'var(--font-poppins)' }}
                      >
                        {loc}
                      </span>
                      {i < d.route.length - 1 && (
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 11 11"
                          fill="none"
                          className="rotate-90 md:w-[10.5px] md:h-[10.5px]"
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

'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { COLORS } from '../constants/colors';
import { TripCard, TripDetailView } from './trips';
import { getDestinationImage, getFlagImage, getCountryDisplayName, getISO2Code, getCountryFromISO } from '../utils/countryData';

interface DayActivity {
  morning?: string;
  afternoon?: string;
  evening?: string;
}

interface Place {
  name: string;
  type: 'stays' | 'restaurants' | 'attraction' | 'activities';
  address?: string;
}

interface ItineraryDay {
  dayNumber: number;
  date?: string;
  location: string;
  title: string;
  description?: string;
  activities?: DayActivity;
  places?: Place[];
}

interface WishlistItem {
  id: string;
  title: string;
  preferences: {
    destination_id: string;
    route?: string[];
    price_inr?: number;
    duration?: string;
    iso2?: string;
    country?: string;
    itinerary?: ItineraryDay[];
    days?: number;
    nights?: number;
  };
  created_at: string;
}

interface WishlistPageProps {
  onDestinationClick?: (countryName: string, route: string[]) => void;
}

// Confirmation Modal Component
function RemoveConfirmModal({ 
  isOpen, 
  itemName, 
  onConfirm, 
  onCancel 
}: { 
  isOpen: boolean; 
  itemName: string; 
  onConfirm: () => void; 
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 
            className="text-lg font-semibold text-[#475f73] mb-2"
            style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
          >
            Remove from Wishlist?
          </h3>
          <p 
            className="text-sm text-[#7286b0] mb-6"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            Are you sure you want to remove <span className="font-medium text-[#475f73]">{itemName}</span> from your wishlist?
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-colors"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm transition-colors"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function WishlistPage({ onDestinationClick }: WishlistPageProps) {
  const { isSignedIn, user } = useUser();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<WishlistItem | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isSignedIn) {
        setWishlist([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/wishlist');
        if (response.ok) {
          const data = await response.json();
          setWishlist(data.wishlist || []);
        }
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [isSignedIn]);

  const handleRemoveFromWishlist = useCallback(async (item: WishlistItem) => {
    const destinationId = item.preferences.destination_id;
    
    setRemovingIds(prev => new Set(prev).add(destinationId));
    setWishlist(prev => prev.filter(w => w.preferences.destination_id !== destinationId));
    setConfirmRemove(null);
    
    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
    }

    try {
      const response = await fetch(`/api/wishlist?destinationId=${destinationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove');
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      setWishlist(prev => [...prev, item]);
    } finally {
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(destinationId);
        return newSet;
      });
    }
  }, [selectedItem]);

  const handleItemClick = (item: WishlistItem) => {
    setSelectedItem(item);
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
  };

  const handleStartPlanning = () => {
    if (selectedItem && onDestinationClick) {
      const route = selectedItem.preferences.route || [];
      const countryName = parseTitle(selectedItem.title);
      onDestinationClick(countryName, route);
    }
  };

  const handleHeartClick = (item: WishlistItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmRemove(item);
  };

  const parseTitle = (title: string): string => {
    const match = title.match(/^(.+?)\s*\(([A-Z]{2})\)$/i);
    if (match) {
      return match[1].trim();
    }
    return title;
  };

  // Convert WishlistItem to format expected by TripCard
  const formatItemForCard = (item: WishlistItem) => {
    const parsedTitle = parseTitle(item.title);
    
    // Try multiple sources for ISO2 code
    let iso2 = item.preferences.iso2;
    
    // If no iso2, try from country preference
    if (!iso2 || iso2 === 'xx') {
      iso2 = getISO2Code(item.preferences.country || '');
    }
    
    // If still no iso2, try from title
    if (!iso2 || iso2 === 'xx') {
      iso2 = getISO2Code(parsedTitle);
    }
    
    // If still no valid iso2, try from destinations/route
    if ((!iso2 || iso2 === 'xx') && item.preferences.route && item.preferences.route.length > 0) {
      for (const dest of item.preferences.route) {
        const destISO2 = getISO2Code(dest);
        if (destISO2 !== 'xx') {
          iso2 = destISO2;
          break;
        }
      }
    }
    
    // Get display country name from ISO2 if we have a valid one
    let displayName = item.preferences.country || parsedTitle;
    if (iso2 && iso2 !== 'xx') {
      displayName = getCountryFromISO(iso2);
    } else {
      displayName = getCountryDisplayName(displayName);
    }
    
    // Final fallback to first destination
    if ((!displayName || displayName === parsedTitle) && item.preferences.route && item.preferences.route.length > 0) {
      const firstDest = item.preferences.route[0];
      const derivedCountry = getCountryDisplayName(firstDest);
      if (derivedCountry !== firstDest) {
        displayName = derivedCountry;
      }
    }
    
    let days = item.preferences.days || 5;
    let nights = item.preferences.nights || 4;
    
    return {
      id: item.id,
      title: displayName,
      country: displayName,
      iso2: iso2 || 'xx',
      duration: item.preferences.duration || `${days} Days, ${nights} Nights`,
      days,
      nights,
      destinations: item.preferences.route,
      itinerary: item.preferences.itinerary,
      priceINR: item.preferences.price_inr,
      route: item.preferences.route,
    };
  };

  const filteredWishlist = searchQuery
    ? wishlist.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.preferences.route?.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : wishlist;

  if (!isSignedIn) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-transparent p-8">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#e6f0f7] mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill={COLORS.blubeezBlue}
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[#475f73] mb-2" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>
          Sign in to see your wishlist
        </h2>
        <p className="text-sm text-[#7286b0]" style={{ fontFamily: 'var(--font-poppins)' }}>
          Save your favorite destinations and access them anytime
        </p>
      </div>
    );
  }

  // Show detail view when an item is selected
  if (selectedItem) {
    const formattedItem = formatItemForCard(selectedItem);
    return (
      <>
        <TripDetailView
          trip={formattedItem}
          onClose={handleCloseDetail}
          onDelete={() => setConfirmRemove(selectedItem)}
          onStartPlanning={handleStartPlanning}
          showPlanButton={true}
        />
        <RemoveConfirmModal
          isOpen={confirmRemove !== null}
          itemName={confirmRemove ? parseTitle(confirmRemove.title) : ''}
          onConfirm={() => confirmRemove && handleRemoveFromWishlist(confirmRemove)}
          onCancel={() => setConfirmRemove(null)}
        />
      </>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-transparent overflow-hidden">
      {/* Header */}
      <div className="px-4 md:px-6 pt-4 pb-2 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-[#e6f0f7] flex items-center justify-center">
            {user?.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt="Profile"
                width={48}
                height={48}
                className="object-cover"
              />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  fill={COLORS.blubeezBlue}
                />
              </svg>
            )}
          </div>
          <div>
            <h1
              className="text-[28px] md:text-[32px] font-semibold leading-tight"
              style={{
                fontFamily: 'var(--font-bricolage-grotesque)',
                color: '#475f73',
              }}
            >
              Wishlist
            </h1>
          </div>
        </div>

        {/* Search */}
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
            placeholder="Search wishlist..."
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-6 bg-transparent">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2f4f93]"></div>
          </div>
        ) : filteredWishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#e6f0f7] mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  stroke={COLORS.blubeezBlue}
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#475f73] mb-2" style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}>
              {searchQuery ? 'No matching destinations' : 'Your wishlist is empty'}
            </h3>
            <p className="text-sm text-[#7286b0]" style={{ fontFamily: 'var(--font-poppins)' }}>
              {searchQuery ? 'Try a different search term' : 'Explore destinations and tap the heart to save them'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4">
            {filteredWishlist.map(item => {
              const formattedItem = formatItemForCard(item);
              return (
                <TripCard
                  key={item.id}
                  trip={formattedItem}
                  onClick={() => handleItemClick(item)}
                  onHeart={(e) => handleHeartClick(item, e)}
                  isWishlisted={true}
                  showHeart={true}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <RemoveConfirmModal
        isOpen={confirmRemove !== null}
        itemName={confirmRemove ? parseTitle(confirmRemove.title) : ''}
        onConfirm={() => confirmRemove && handleRemoveFromWishlist(confirmRemove)}
        onCancel={() => setConfirmRemove(null)}
      />

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

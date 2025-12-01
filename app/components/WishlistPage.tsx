'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { COLORS } from '../constants/colors';
import { getDestinationImage, getFlagImage, getCountryDisplayName } from '../utils/countryData';

interface WishlistItem {
  id: string;
  title: string;
  preferences: {
    destination_id: string;
    route?: string[];
    price_inr?: number;
    duration?: string;
    iso2?: string;
  };
  created_at: string;
}

interface WishlistPageProps {
  onDestinationClick?: (countryName: string, route: string[]) => void;
}

export default function WishlistPage({ onDestinationClick }: WishlistPageProps) {
  const { isSignedIn, user } = useUser();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
  }, []);

  const handleCardClick = (item: WishlistItem) => {
    const route = item.preferences.route || [];
    onDestinationClick?.(item.title, route);
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
            placeholder="Search..."
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {filteredWishlist.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                onClick={() => handleCardClick(item)}
                onRemove={() => handleRemoveFromWishlist(item)}
                isRemoving={removingIds.has(item.preferences.destination_id)}
                userImage={user?.imageUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface WishlistCardProps {
  item: WishlistItem;
  onClick: () => void;
  onRemove: () => void;
  isRemoving: boolean;
  userImage?: string;
}

function WishlistCard({ item, onClick, onRemove, isRemoving, userImage }: WishlistCardProps) {
  const parseTitle = (title: string): string => {
    const match = title.match(/^(.+?)\s*\(([A-Z]{2})\)$/i);
    if (match) {
      return match[1].trim();
    }
    return title;
  };
  
  const countryName = parseTitle(item.title);
  const displayName = getCountryDisplayName(countryName);
  const route = item.preferences.route || [];
  const duration = item.preferences.duration || '5 Days, 4 Nights';
  const iso2 = item.preferences.iso2 || item.preferences.destination_id;

  return (
    <div
      className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer group hover:scale-[1.01] transition-transform duration-300 shadow-lg"
      onClick={onClick}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={getDestinationImage(countryName)}
          alt={countryName}
          fill
          className="object-cover object-center"
          unoptimized
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Top-right: Flag and Country Name */}
      <div className="absolute top-0 right-0 p-4 flex flex-col items-end">
        <div className="w-16 h-8 relative overflow-hidden rounded shadow-md">
          <Image
            src={getFlagImage(countryName)}
            alt={`${displayName} flag`}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <span
          className="mt-2 text-white text-sm font-medium drop-shadow-lg"
          style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
        >
          {displayName}
        </span>
      </div>

      {/* Remove button (appears on hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        disabled={isRemoving}
        className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
      >
        {isRemoving ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="#ef4444"
            />
          </svg>
        )}
      </button>

      {/* Bottom gradient with info */}
      <div
        className="absolute bottom-0 left-0 right-0 p-4 pt-16"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
        }}
      >
        <div className="flex items-end justify-between">
          <div>
            <p
              className="text-white/80 text-sm mb-1"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              {duration}
            </p>
            <h3
              className="text-white text-2xl md:text-3xl font-bold capitalize"
              style={{ fontFamily: 'var(--font-bricolage-grotesque)' }}
            >
              {route.length > 0 ? route.join(' • ') : displayName + ' Trip'}
            </h3>
          </div>

          {/* User avatars */}
          <div className="flex -space-x-2">
            {userImage && (
              <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                <Image
                  src={userImage}
                  alt="You"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


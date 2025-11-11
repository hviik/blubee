import { Itinerary } from '@/app/types/itinerary';

export const mockItinerary: Itinerary = {
  id: 'trip_vietnam_001',
  title: '7-Day Vietnam Adventure',
  startDate: '2025-11-09',
  endDate: '2025-11-16',
  totalDays: 7,
  locations: [
    {
      id: 'loc_hanoi',
      name: 'Hanoi',
      coordinates: { lat: 21.0285, lng: 105.8542 },
      active: true,
    },
    {
      id: 'loc_halong',
      name: 'Ha Long Bay',
      coordinates: { lat: 20.9101, lng: 107.1839 },
      active: false,
    },
    {
      id: 'loc_hcmc',
      name: 'Ho Chi Minh City',
      coordinates: { lat: 10.8231, lng: 106.6297 },
      active: false,
    },
  ],
  days: [
    {
      dayNumber: 1,
      date: '09 NOV, 25',
      location: 'Hanoi',
      title: 'Arrival at Bangkok – Chiang Mai (3 Nights)',
      description:
        "The word 'Khyaal' itself has so much love, warmth and care in it that I instantly felt connected. Arrive in Bangkok and transfer to Chiang Mai, where you'll spend the next three nights exploring temples and local markets.",
      activities: {
        hotel: 'Chiang Mai Hotel',
        food: 'Local Thai Cuisine',
        sightseeing: 'Temple Tours',
        icon: {
          hotel: true,
          travel: true,
          sightseeing: true,
        },
      },
      expanded: false,
    },
    {
      dayNumber: 2,
      date: '10 NOV, 25',
      location: 'Hanoi',
      title: 'Old Quarter Walking Tour',
      description: 'Explore the bustling streets of Hanoi Old Quarter, visit Hoan Kiem Lake, and enjoy traditional Vietnamese coffee.',
      activities: {
        icon: {
          hotel: false,
          travel: true,
          sightseeing: true,
        },
      },
      expanded: false,
    },
    {
      dayNumber: 3,
      date: '11 NOV, 25',
      location: 'Ha Long Bay',
      title: 'Ha Long Bay Cruise (2 Nights)',
      description: 'Embark on a luxury cruise through Ha Long Bay. Kayaking, swimming, and cave exploration included.',
      activities: {
        icon: {
          hotel: true,
          travel: false,
          sightseeing: true,
        },
      },
      expanded: false,
    },
    {
      dayNumber: 4,
      date: '12 NOV, 25',
      location: 'Ha Long Bay',
      title: 'Ha Long Bay Exploration',
      description: 'Continue exploring the emerald waters and limestone karsts of Ha Long Bay.',
      activities: {
        icon: {
          hotel: false,
          travel: false,
          sightseeing: true,
        },
      },
      expanded: false,
    },
    {
      dayNumber: 5,
      date: '13 NOV, 25',
      location: 'Ho Chi Minh City',
      title: 'Arrival in Ho Chi Minh City',
      description: 'Fly to Ho Chi Minh City (Saigon). Visit the War Remnants Museum and Ben Thanh Market.',
      activities: {
        icon: {
          hotel: true,
          travel: true,
          sightseeing: true,
        },
      },
      expanded: false,
    },
    {
      dayNumber: 6,
      date: '14 NOV, 25',
      location: 'Ho Chi Minh City',
      title: 'Cu Chi Tunnels Day Trip',
      description: 'Explore the famous Cu Chi Tunnels and learn about Vietnam War history.',
      activities: {
        icon: {
          hotel: false,
          travel: true,
          sightseeing: true,
        },
      },
      expanded: false,
    },
    {
      dayNumber: 7,
      date: '15 NOV, 25',
      location: 'Ho Chi Minh City',
      title: 'Mekong Delta Tour & Departure',
      description: 'Morning tour of the Mekong Delta before your evening departure flight.',
      activities: {
        icon: {
          hotel: false,
          travel: true,
          sightseeing: true,
        },
      },
      expanded: false,
    },
  ],
};


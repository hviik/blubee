import { Itinerary, ItineraryDay, TripLocation } from '@/app/types/itinerary';

export interface ProcessedMessage {
  hasItinerary: boolean;
  itinerary?: Itinerary;
  intent?: 'plan_trip' | 'get_info' | 'modify_trip' | 'general';
  locations?: string[];
  dates?: { start?: string; end?: string };
}


export function processMessage(content: string): ProcessedMessage {
  const result: ProcessedMessage = {
    hasItinerary: false,
    intent: detectIntent(content),
  };

  // Extract locations
  result.locations = extractLocations(content);

  // Extract dates
  result.dates = extractDates(content);

  // Extract itinerary if present
  const itinerary = extractItinerary(content);
  if (itinerary) {
    result.hasItinerary = true;
    result.itinerary = itinerary;
  }

  return result;
}


function detectIntent(content: string): ProcessedMessage['intent'] {
  const lower = content.toLowerCase();
  
  if (
    lower.includes('plan') ||
    lower.includes('itinerary') ||
    lower.includes('trip') ||
    lower.includes('organize')
  ) {
    return 'plan_trip';
  }
  
  if (
    lower.includes('change') ||
    lower.includes('modify') ||
    lower.includes('update') ||
    lower.includes('adjust')
  ) {
    return 'modify_trip';
  }
  
  if (
    lower.includes('tell me') ||
    lower.includes('what is') ||
    lower.includes('how to')
  ) {
    return 'get_info';
  }
  
  return 'general';
}

/**
 * Extract location names from text
 */
function extractLocations(content: string): string[] {
  const locations: string[] = [];
  
  // Common location patterns
  const patterns = [
    /(?:to|in|visit|explore)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
    /Day\s+\d+:\s*([^-\n]+)/g,
  ];
  
  patterns.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        const loc = match[1].trim();
        if (loc.length > 2 && !locations.includes(loc)) {
          locations.push(loc);
        }
      }
    }
  });
  
  return locations;
}

/**
 * Extract dates from text
 */
function extractDates(content: string): { start?: string; end?: string } {
  const dates: { start?: string; end?: string } = {};
  
  // Look for date patterns
  const datePattern = /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*,?\s+(\d{2,4})/gi;
  const matches = [...content.matchAll(datePattern)];
  
  if (matches.length > 0) {
    dates.start = matches[0][0];
    if (matches.length > 1) {
      dates.end = matches[matches.length - 1][0];
    }
  }
  
  return dates;
}

/**
 * Extract itinerary structure from AI response
 */
function extractItinerary(content: string): Itinerary | null {
  // Look for day-by-day structure
  const dayPattern = /Day\s+(\d+):\s*([^\n]+)/gi;
  const dayMatches = [...content.matchAll(dayPattern)];
  
  if (dayMatches.length < 2) return null;
  
  const days: ItineraryDay[] = [];
  const locationSet = new Set<string>();
  
  dayMatches.forEach(match => {
    const dayNumber = parseInt(match[1]);
    const title = match[2].trim();
    
    // Extract location from title
    const locationMatch = title.match(/^([^-–(]+)/);
    const location = locationMatch ? locationMatch[1].trim() : 'Unknown';
    locationSet.add(location);
    
    // Get description (text after the day line until next day)
    const dayIndex = content.indexOf(match[0]);
    const nextDayIndex = content.indexOf(`Day ${dayNumber + 1}:`, dayIndex);
    const description = nextDayIndex > -1
      ? content.slice(dayIndex + match[0].length, nextDayIndex).trim()
      : content.slice(dayIndex + match[0].length).trim();
    
    days.push({
      dayNumber,
      date: '', // Will be filled later
      location,
      title,
      description: description.split('\n').slice(0, 3).join(' ').trim(),
      expanded: false,
    });
  });
  
  // Create locations array
  const locations: TripLocation[] = Array.from(locationSet).map((name, idx) => ({
    id: `loc_${idx}`,
    name,
    coordinates: { lat: 0, lng: 0 }, // Will be geocoded later
    active: idx === 0,
  }));
  
  return {
    id: `trip_${Date.now()}`,
    title: `Trip to ${locations.map(l => l.name).join(', ')}`,
    locations,
    days,
    totalDays: days.length,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + days.length * 86400000).toISOString().split('T')[0],
  };
}

/**
 * Check if message contains itinerary data
 */
export function hasItineraryData(content: string): boolean {
  const dayPattern = /Day\s+\d+:/gi;
  const matches = content.match(dayPattern);
  return (matches?.length || 0) >= 2;
}


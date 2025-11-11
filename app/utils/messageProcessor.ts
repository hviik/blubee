import { Itinerary, ItineraryDay, TripLocation, PlaceType } from '@/app/types/itinerary';

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

  result.locations = extractLocations(content);

  result.dates = extractDates(content);

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

function extractLocations(content: string): string[] {
  const locations: string[] = [];
  
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

function extractDates(content: string): { start?: string; end?: string } {
  const dates: { start?: string; end?: string } = {};
  
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

function extractItinerary(content: string): Itinerary | null {
  const dayPattern = /Day\s+(\d+):\s*([^\n]+)/gi;
  const dayMatches = [...content.matchAll(dayPattern)];
  
  if (dayMatches.length < 1) return null;
  
  const days: ItineraryDay[] = [];
  const locationSet = new Set<string>();
  
  dayMatches.forEach(match => {
    const dayNumber = parseInt(match[1]);
    const title = match[2].trim();
    
    const locationMatch = title.match(/^([^-–(]+)/);
    const mainLocation = locationMatch ? locationMatch[1].trim() : 'Unknown';
    locationSet.add(mainLocation);
    
    const dayIndex = content.indexOf(match[0]);
    const nextDayIndex = content.indexOf(`Day ${dayNumber + 1}:`, dayIndex);
    const fullDescription = nextDayIndex > -1
      ? content.slice(dayIndex + match[0].length, nextDayIndex).trim()
      : content.slice(dayIndex + match[0].length).trim();
    
    const places = extractPlacesFromDescription(fullDescription, mainLocation);
    
    days.push({
      dayNumber,
      date: '',
      location: mainLocation,
      title,
      description: fullDescription.split('\n').slice(0, 3).join(' ').trim(),
      expanded: false,
      places,
    });
  });
  
  const locations: TripLocation[] = Array.from(locationSet).map((name, idx) => ({
    id: `loc_${idx}`,
    name,
    coordinates: { lat: 0, lng: 0 },
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

function extractPlacesFromDescription(description: string, mainLocation: string) {
  const places: Array<{ name: string; type: PlaceType }> = [];
  const lines = description.split('\n');
  
  lines.forEach(line => {
    if (/morning:/i.test(line)) {
      const matches = line.match(/:\s*([^,\n]+)/gi);
      matches?.forEach(m => {
        const name = m.replace(/^:\s*/, '').trim();
        if (name) places.push({ name, type: 'attraction' as PlaceType });
      });
    }
    
    if (/afternoon:/i.test(line)) {
      const matches = line.match(/:\s*([^,\n]+)/gi);
      matches?.forEach(m => {
        const name = m.replace(/^:\s*/, '').trim();
        if (name) places.push({ name, type: 'attraction' as PlaceType });
      });
    }
    
    if (/evening:/i.test(line) || /dinner/i.test(line)) {
      const matches = line.match(/(?:at|near)\s+([^,\n]+)/gi);
      matches?.forEach(m => {
        const name = m.replace(/^(?:at|near)\s+/i, '').trim();
        if (name) places.push({ name, type: 'restaurants' as PlaceType });
      });
    }
    
    if (/hotel|stay|accommodation/i.test(line)) {
      const matches = line.match(/(?:at|stay at)\s+([^,\n]+)/gi);
      matches?.forEach(m => {
        const name = m.replace(/^(?:at|stay at)\s+/i, '').trim();
        if (name) places.push({ name, type: 'stays' as PlaceType });
      });
    }
  });
  
  return places.slice(0, 5).map((p, idx) => ({
    id: `place_${Date.now()}_${idx}`,
    name: p.name,
    type: p.type,
    location: { lat: 0, lng: 0 }
  }));
}

export function hasItineraryData(content: string): boolean {
  const dayPattern = /Day\s+\d+:/gi;
  const matches = content.match(dayPattern);
  return (matches?.length || 0) >= 2;
}


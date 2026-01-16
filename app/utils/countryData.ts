import countriesData from '@/lib/countries.json';

export interface CountryInfo {
  iso2: string;
  name: string;
  aliases?: string[];
}

// Build lookup maps from the JSON data
const countries: CountryInfo[] = countriesData.countries;

// ISO2 to country info map
const iso2ToCountry: Map<string, CountryInfo> = new Map();
// Country name (lowercase) to country info map
const nameToCountry: Map<string, CountryInfo> = new Map();
// Alias (lowercase) to country info map
const aliasToCountry: Map<string, CountryInfo> = new Map();

// Initialize the maps
countries.forEach(country => {
  const lowerISO = country.iso2.toLowerCase();
  const lowerName = country.name.toLowerCase();
  
  iso2ToCountry.set(lowerISO, country);
  nameToCountry.set(lowerName, country);
  
  // Also map without spaces and special characters
  const simplifiedName = lowerName.replace(/[^a-z]/g, '');
  if (simplifiedName !== lowerName) {
    nameToCountry.set(simplifiedName, country);
  }
  
  // Add aliases
  if (country.aliases) {
    country.aliases.forEach(alias => {
      const lowerAlias = alias.toLowerCase();
      aliasToCountry.set(lowerAlias, country);
      // Also simplified version
      const simplifiedAlias = lowerAlias.replace(/[^a-z]/g, '');
      if (simplifiedAlias !== lowerAlias) {
        aliasToCountry.set(simplifiedAlias, country);
      }
    });
  }
});

/**
 * Look up country info from any input (ISO2, country name, city, or alias)
 */
export function lookupCountry(input: string): CountryInfo | null {
  if (!input || typeof input !== 'string') return null;
  
  const cleaned = input.trim().toLowerCase();
  if (!cleaned) return null;
  
  // Try ISO2 code first (exactly 2 characters)
  if (cleaned.length === 2) {
    const byISO = iso2ToCountry.get(cleaned);
    if (byISO) return byISO;
  }
  
  // Try exact country name match
  const byName = nameToCountry.get(cleaned);
  if (byName) return byName;
  
  // Try alias match (cities, regions, alternative names)
  const byAlias = aliasToCountry.get(cleaned);
  if (byAlias) return byAlias;
  
  // Try simplified name (removing spaces and special chars)
  const simplified = cleaned.replace(/[^a-z]/g, '');
  const bySimplifiedName = nameToCountry.get(simplified);
  if (bySimplifiedName) return bySimplifiedName;
  
  const bySimplifiedAlias = aliasToCountry.get(simplified);
  if (bySimplifiedAlias) return bySimplifiedAlias;
  
  return null;
}

/**
 * Get ISO2 code from any input (country name, city, alias, or existing ISO2)
 */
export function getISO2Code(input: string): string {
  const country = lookupCountry(input);
  return country?.iso2 || 'xx';
}

/**
 * Get country name from any input (ISO2, country name, city, or alias)
 */
export function getCountryDisplayName(input: string): string {
  const country = lookupCountry(input);
  return country?.name || input;
}

/**
 * Get country name from ISO2 code
 */
export function getCountryFromISO(iso2: string): string {
  if (!iso2) return 'Unknown';
  const country = iso2ToCountry.get(iso2.toLowerCase());
  return country?.name || iso2.toUpperCase();
}

/**
 * Get local flag image path by ISO2 code
 */
export function getFlagImageByISO(iso2: string): string {
  if (!iso2 || iso2.length !== 2 || iso2.toLowerCase() === 'xx') {
    return '/assets/flags/th.png'; // Default to Thailand
  }
  return `/assets/flags/${iso2.toLowerCase()}.png`;
}

/**
 * Get flag image from any input (country name, city, alias, or ISO2)
 */
export function getFlagImage(input: string): string {
  const iso2 = getISO2Code(input);
  return getFlagImageByISO(iso2);
}

/**
 * Get destination image by ISO2 code
 */
export function getDestinationImageByISO(iso2: string): string {
  if (!iso2 || iso2.length !== 2 || iso2.toLowerCase() === 'xx') {
    return '/assets/destinations/th.jpg';
  }
  const lowerISO = iso2.toLowerCase();
  // Some destinations are stored as .png instead of .jpg
  const pngDestinations = new Set(['br', 'in', 'la', 'mv', 'my', 'pe', 'ph', 'vn']);
  const ext = pngDestinations.has(lowerISO) ? 'png' : 'jpg';
  return `/assets/destinations/${lowerISO}.${ext}`;
}

/**
 * Get destination image from any input (country name, city, alias, or ISO2)
 */
export function getDestinationImage(input: string): string {
  const iso2 = getISO2Code(input);
  return getDestinationImageByISO(iso2);
}

/**
 * Check if a valid country exists for the given input
 */
export function isValidCountry(input: string): boolean {
  return lookupCountry(input) !== null;
}

/**
 * Check if destination image likely exists
 */
export function hasDestinationImage(iso2: string): boolean {
  if (!iso2 || iso2.length !== 2) return false;
  return iso2ToCountry.has(iso2.toLowerCase());
}

/**
 * Get all countries list
 */
export function getAllCountries(): CountryInfo[] {
  return countries;
}

// Legacy exports for backward compatibility
export const COUNTRY_DATA = Object.fromEntries(
  countries.map(c => [c.name.toUpperCase(), { name: c.name, iso2: c.iso2, imageExt: 'jpg' as const }])
);

export const ISO2_TO_COUNTRY = Object.fromEntries(
  countries.map(c => [c.iso2.toLowerCase(), c.name])
);

export interface CountryInfo {
  name: string;
  iso2: string;
  imageExt: 'jpg' | 'png';
}

// Comprehensive country data with ISO codes
export const COUNTRY_DATA: Record<string, CountryInfo> = {
  'VIETNAM': { name: 'Vietnam', iso2: 'vn', imageExt: 'png' },
  'MALAYSIA': { name: 'Malaysia', iso2: 'my', imageExt: 'png' },
  'PERU': { name: 'Peru', iso2: 'pe', imageExt: 'png' },
  'PHILIPPINES': { name: 'Philippines', iso2: 'ph', imageExt: 'png' },
  'BRAZIL': { name: 'Brazil', iso2: 'br', imageExt: 'png' },
  'INDIA': { name: 'India', iso2: 'in', imageExt: 'png' },
  'MALDIVES': { name: 'Maldives', iso2: 'mv', imageExt: 'png' },
  'LAOS': { name: 'Laos', iso2: 'la', imageExt: 'png' },
  'THAILAND': { name: 'Thailand', iso2: 'th', imageExt: 'jpg' },
  'INDONESIA': { name: 'Indonesia', iso2: 'id', imageExt: 'jpg' },
  'JAPAN': { name: 'Japan', iso2: 'jp', imageExt: 'jpg' },
  'SOUTH KOREA': { name: 'South Korea', iso2: 'kr', imageExt: 'jpg' },
  'CHINA': { name: 'China', iso2: 'cn', imageExt: 'jpg' },
  'SINGAPORE': { name: 'Singapore', iso2: 'sg', imageExt: 'jpg' },
  'AUSTRALIA': { name: 'Australia', iso2: 'au', imageExt: 'jpg' },
  'NEW ZEALAND': { name: 'New Zealand', iso2: 'nz', imageExt: 'jpg' },
  'FRANCE': { name: 'France', iso2: 'fr', imageExt: 'jpg' },
  'ITALY': { name: 'Italy', iso2: 'it', imageExt: 'jpg' },
  'SPAIN': { name: 'Spain', iso2: 'es', imageExt: 'jpg' },
  'GERMANY': { name: 'Germany', iso2: 'de', imageExt: 'jpg' },
  'UNITED KINGDOM': { name: 'United Kingdom', iso2: 'gb', imageExt: 'jpg' },
  'UNITED STATES': { name: 'United States', iso2: 'us', imageExt: 'jpg' },
  'CANADA': { name: 'Canada', iso2: 'ca', imageExt: 'jpg' },
  'MEXICO': { name: 'Mexico', iso2: 'mx', imageExt: 'jpg' },
  'ARGENTINA': { name: 'Argentina', iso2: 'ar', imageExt: 'jpg' },
  'CHILE': { name: 'Chile', iso2: 'cl', imageExt: 'jpg' },
  'COLOMBIA': { name: 'Colombia', iso2: 'co', imageExt: 'jpg' },
  'EGYPT': { name: 'Egypt', iso2: 'eg', imageExt: 'jpg' },
  'MOROCCO': { name: 'Morocco', iso2: 'ma', imageExt: 'jpg' },
  'SOUTH AFRICA': { name: 'South Africa', iso2: 'za', imageExt: 'jpg' },
  'KENYA': { name: 'Kenya', iso2: 'ke', imageExt: 'jpg' },
  'TANZANIA': { name: 'Tanzania', iso2: 'tz', imageExt: 'jpg' },
  'GREECE': { name: 'Greece', iso2: 'gr', imageExt: 'jpg' },
  'TURKEY': { name: 'Turkey', iso2: 'tr', imageExt: 'jpg' },
  'UAE': { name: 'United Arab Emirates', iso2: 'ae', imageExt: 'jpg' },
  'UNITED ARAB EMIRATES': { name: 'United Arab Emirates', iso2: 'ae', imageExt: 'jpg' },
  'SAUDI ARABIA': { name: 'Saudi Arabia', iso2: 'sa', imageExt: 'jpg' },
  'QATAR': { name: 'Qatar', iso2: 'qa', imageExt: 'jpg' },
  'SWITZERLAND': { name: 'Switzerland', iso2: 'ch', imageExt: 'jpg' },
  'AUSTRIA': { name: 'Austria', iso2: 'at', imageExt: 'jpg' },
  'NETHERLANDS': { name: 'Netherlands', iso2: 'nl', imageExt: 'jpg' },
  'BELGIUM': { name: 'Belgium', iso2: 'be', imageExt: 'jpg' },
  'PORTUGAL': { name: 'Portugal', iso2: 'pt', imageExt: 'jpg' },
  'SWEDEN': { name: 'Sweden', iso2: 'se', imageExt: 'jpg' },
  'NORWAY': { name: 'Norway', iso2: 'no', imageExt: 'jpg' },
  'DENMARK': { name: 'Denmark', iso2: 'dk', imageExt: 'jpg' },
  'FINLAND': { name: 'Finland', iso2: 'fi', imageExt: 'jpg' },
  'ICELAND': { name: 'Iceland', iso2: 'is', imageExt: 'jpg' },
  'IRELAND': { name: 'Ireland', iso2: 'ie', imageExt: 'jpg' },
  'RUSSIA': { name: 'Russia', iso2: 'ru', imageExt: 'jpg' },
  'POLAND': { name: 'Poland', iso2: 'pl', imageExt: 'jpg' },
  'CZECH REPUBLIC': { name: 'Czech Republic', iso2: 'cz', imageExt: 'jpg' },
  'HUNGARY': { name: 'Hungary', iso2: 'hu', imageExt: 'jpg' },
  'CROATIA': { name: 'Croatia', iso2: 'hr', imageExt: 'jpg' },
  'NEPAL': { name: 'Nepal', iso2: 'np', imageExt: 'jpg' },
  'SRI LANKA': { name: 'Sri Lanka', iso2: 'lk', imageExt: 'jpg' },
  'BHUTAN': { name: 'Bhutan', iso2: 'bt', imageExt: 'jpg' },
  'CAMBODIA': { name: 'Cambodia', iso2: 'kh', imageExt: 'jpg' },
  'MYANMAR': { name: 'Myanmar', iso2: 'mm', imageExt: 'jpg' },
  'CUBA': { name: 'Cuba', iso2: 'cu', imageExt: 'jpg' },
  'JAMAICA': { name: 'Jamaica', iso2: 'jm', imageExt: 'jpg' },
  'FIJI': { name: 'Fiji', iso2: 'fj', imageExt: 'jpg' },
  'BALI': { name: 'Bali', iso2: 'id', imageExt: 'jpg' },
};

// ISO2 to country name reverse lookup
export const ISO2_TO_COUNTRY: Record<string, string> = {
  'vn': 'Vietnam', 'my': 'Malaysia', 'pe': 'Peru', 'ph': 'Philippines',
  'br': 'Brazil', 'in': 'India', 'mv': 'Maldives', 'la': 'Laos',
  'th': 'Thailand', 'id': 'Indonesia', 'jp': 'Japan', 'kr': 'South Korea',
  'cn': 'China', 'sg': 'Singapore', 'au': 'Australia', 'nz': 'New Zealand',
  'fr': 'France', 'it': 'Italy', 'es': 'Spain', 'de': 'Germany',
  'gb': 'United Kingdom', 'us': 'United States', 'ca': 'Canada', 'mx': 'Mexico',
  'ar': 'Argentina', 'cl': 'Chile', 'co': 'Colombia', 'eg': 'Egypt',
  'ma': 'Morocco', 'za': 'South Africa', 'ke': 'Kenya', 'tz': 'Tanzania',
  'gr': 'Greece', 'tr': 'Turkey', 'ae': 'United Arab Emirates',
  'sa': 'Saudi Arabia', 'qa': 'Qatar', 'ch': 'Switzerland', 'at': 'Austria',
  'nl': 'Netherlands', 'be': 'Belgium', 'pt': 'Portugal', 'se': 'Sweden',
  'no': 'Norway', 'dk': 'Denmark', 'fi': 'Finland', 'is': 'Iceland',
  'ie': 'Ireland', 'ru': 'Russia', 'pl': 'Poland', 'cz': 'Czech Republic',
  'hu': 'Hungary', 'hr': 'Croatia', 'np': 'Nepal', 'lk': 'Sri Lanka',
  'bt': 'Bhutan', 'kh': 'Cambodia', 'mm': 'Myanmar', 'cu': 'Cuba',
  'jm': 'Jamaica', 'fj': 'Fiji',
};

/**
 * Get destination image by country name
 */
export function getDestinationImage(countryName: string): string {
  const upperName = countryName.toUpperCase();
  const country = COUNTRY_DATA[upperName];
  
  if (country) {
    return `/assets/destinations/${country.iso2}.${country.imageExt}`;
  }
  
  // If it looks like an ISO2 code already
  if (countryName.length === 2) {
    return `/assets/destinations/${countryName.toLowerCase()}.jpg`;
  }
  
  return `/assets/destinations/th.jpg`; // Default to Thailand
}

/**
 * Get destination image by ISO2 code directly
 */
export function getDestinationImageByISO(iso2: string): string {
  if (!iso2 || iso2.length !== 2) {
    return `/assets/destinations/th.jpg`;
  }
  
  const lowerISO = iso2.toLowerCase();
  
  // Check if we have specific extension info
  const countryName = ISO2_TO_COUNTRY[lowerISO];
  if (countryName) {
    const country = COUNTRY_DATA[countryName.toUpperCase()];
    if (country) {
      return `/assets/destinations/${lowerISO}.${country.imageExt}`;
    }
  }
  
  // Default to jpg
  return `/assets/destinations/${lowerISO}.jpg`;
}

/**
 * Get flag image by country name
 */
export function getFlagImage(countryName: string): string {
  const upperName = countryName.toUpperCase();
  const country = COUNTRY_DATA[upperName];
  
  if (country) {
    return `https://flagcdn.com/w80/${country.iso2}.png`;
  }
  
  if (countryName.length === 2) {
    return `https://flagcdn.com/w80/${countryName.toLowerCase()}.png`;
  }
  
  return '/assets/flags/default.png';
}

/**
 * Get flag image by ISO2 code directly
 */
export function getFlagImageByISO(iso2: string): string {
  if (!iso2 || iso2.length !== 2) {
    return '/assets/flags/default.png';
  }
  return `https://flagcdn.com/w80/${iso2.toLowerCase()}.png`;
}

/**
 * Get ISO2 code from country name
 */
export function getISO2Code(countryName: string): string {
  const upperName = countryName.toUpperCase();
  const country = COUNTRY_DATA[upperName];
  return country?.iso2 || 'xx';
}

/**
 * Get country display name from ISO2 or country name
 */
export function getCountryDisplayName(countryName: string): string {
  // If it's an ISO2 code
  if (countryName.length === 2) {
    return ISO2_TO_COUNTRY[countryName.toLowerCase()] || countryName;
  }
  
  const upperName = countryName.toUpperCase();
  const country = COUNTRY_DATA[upperName];
  return country?.name || countryName;
}

/**
 * Get country name from ISO2 code
 */
export function getCountryFromISO(iso2: string): string {
  return ISO2_TO_COUNTRY[iso2.toLowerCase()] || iso2.toUpperCase();
}

/**
 * Check if a valid destination image exists for the ISO code
 */
export function hasDestinationImage(iso2: string): boolean {
  if (!iso2 || iso2.length !== 2) return false;
  return iso2.toLowerCase() in ISO2_TO_COUNTRY;
}
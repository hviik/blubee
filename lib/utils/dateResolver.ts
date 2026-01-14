/**
 * Date Resolution Utility
 * 
 * Provides date validation, formatting, and context for the travel planning agent.
 * All dates are handled in ISO format (YYYY-MM-DD) for API consistency.
 */

export interface DateContext {
  currentDate: string;          // ISO format: YYYY-MM-DD
  currentDateTime: string;      // ISO 8601: YYYY-MM-DDTHH:mm:ss.sssZ
  currentYear: number;
  currentMonth: number;
  currentDay: number;
  dayOfWeek: string;
  timezone: string;
}

export interface DateValidationResult {
  isValid: boolean;
  isoDate: string | null;
  error?: string;
  isPast: boolean;
  isFuture: boolean;
  isToday: boolean;
  daysFromNow: number;
}

export interface DateRangeValidationResult {
  isValid: boolean;
  checkInDate: string | null;
  checkOutDate: string | null;
  nights: number;
  error?: string;
}

/**
 * Get the current date context for the agent
 */
export function getCurrentDateContext(): DateContext {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return {
    currentDate: formatToISO(now),
    currentDateTime: now.toISOString(),
    currentYear: now.getFullYear(),
    currentMonth: now.getMonth() + 1,
    currentDay: now.getDate(),
    dayOfWeek: days[now.getDay()],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

/**
 * Format a Date object to ISO date string (YYYY-MM-DD)
 */
export function formatToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse various date formats and return ISO format
 */
export function parseToISO(dateInput: string | Date): string | null {
  if (!dateInput) return null;
  
  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return null;
    return formatToISO(dateInput);
  }
  
  const input = dateInput.trim();
  
  // Already in ISO format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const date = new Date(input + 'T00:00:00');
    if (!isNaN(date.getTime())) {
      return input;
    }
  }
  
  // ISO 8601 full format
  if (/^\d{4}-\d{2}-\d{2}T/.test(input)) {
    const date = new Date(input);
    if (!isNaN(date.getTime())) {
      return formatToISO(date);
    }
  }
  
  // MM/DD/YYYY or M/D/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(input)) {
    const parts = input.split('/');
    const date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
    if (!isNaN(date.getTime())) {
      return formatToISO(date);
    }
  }
  
  // DD/MM/YYYY (European format) - detected by context
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
    const parts = input.split('/');
    // Try as DD/MM/YYYY first if day > 12
    if (parseInt(parts[0]) > 12) {
      const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      if (!isNaN(date.getTime())) {
        return formatToISO(date);
      }
    }
  }
  
  // Natural language parsing (basic)
  const naturalDate = parseNaturalDate(input);
  if (naturalDate) {
    return formatToISO(naturalDate);
  }
  
  // Fallback to Date parsing
  const date = new Date(input);
  if (!isNaN(date.getTime())) {
    return formatToISO(date);
  }
  
  return null;
}

/**
 * Parse natural language dates like "next Friday", "June 15th", etc.
 */
function parseNaturalDate(input: string): Date | null {
  const now = new Date();
  const lowered = input.toLowerCase().trim();
  
  // "today"
  if (lowered === 'today') {
    return now;
  }
  
  // "tomorrow"
  if (lowered === 'tomorrow') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  
  // "next week"
  if (lowered === 'next week') {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek;
  }
  
  // "in X days"
  const inDaysMatch = lowered.match(/^in\s+(\d+)\s+days?$/);
  if (inDaysMatch) {
    const days = parseInt(inDaysMatch[1]);
    const future = new Date(now);
    future.setDate(future.getDate() + days);
    return future;
  }
  
  // Month and day: "June 15", "June 15th", "15 June"
  const months: Record<string, number> = {
    january: 0, jan: 0,
    february: 1, feb: 1,
    march: 2, mar: 2,
    april: 3, apr: 3,
    may: 4,
    june: 5, jun: 5,
    july: 6, jul: 6,
    august: 7, aug: 7,
    september: 8, sep: 8, sept: 8,
    october: 9, oct: 9,
    november: 10, nov: 10,
    december: 11, dec: 11,
  };
  
  // "Month Day" or "Month Day, Year"
  const monthDayMatch = lowered.match(/^([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*,?\s*(\d{4}))?$/);
  if (monthDayMatch) {
    const month = months[monthDayMatch[1]];
    if (month !== undefined) {
      const day = parseInt(monthDayMatch[2]);
      const year = monthDayMatch[3] ? parseInt(monthDayMatch[3]) : now.getFullYear();
      const date = new Date(year, month, day);
      
      // If date is in the past this year, assume next year
      if (!monthDayMatch[3] && date < now) {
        date.setFullYear(date.getFullYear() + 1);
      }
      
      return date;
    }
  }
  
  // "Day Month" or "Day Month Year"
  const dayMonthMatch = lowered.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)(?:\s+(\d{4}))?$/);
  if (dayMonthMatch) {
    const day = parseInt(dayMonthMatch[1]);
    const month = months[dayMonthMatch[2]];
    if (month !== undefined) {
      const year = dayMonthMatch[3] ? parseInt(dayMonthMatch[3]) : now.getFullYear();
      const date = new Date(year, month, day);
      
      // If date is in the past this year, assume next year
      if (!dayMonthMatch[3] && date < now) {
        date.setFullYear(date.getFullYear() + 1);
      }
      
      return date;
    }
  }
  
  return null;
}

/**
 * Validate a date and return detailed information
 */
export function validateDate(dateInput: string | Date): DateValidationResult {
  const isoDate = parseToISO(dateInput);
  
  if (!isoDate) {
    return {
      isValid: false,
      isoDate: null,
      error: `Invalid date format: "${dateInput}". Please use YYYY-MM-DD format.`,
      isPast: false,
      isFuture: false,
      isToday: false,
      daysFromNow: 0,
    };
  }
  
  const inputDate = new Date(isoDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = inputDate.getTime() - today.getTime();
  const daysFromNow = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    isValid: true,
    isoDate,
    isPast: daysFromNow < 0,
    isFuture: daysFromNow > 0,
    isToday: daysFromNow === 0,
    daysFromNow,
  };
}

/**
 * Validate a date range for hotel booking
 */
export function validateDateRange(
  checkInInput: string | Date,
  checkOutInput: string | Date
): DateRangeValidationResult {
  const checkInValidation = validateDate(checkInInput);
  const checkOutValidation = validateDate(checkOutInput);
  
  // Check if dates are valid
  if (!checkInValidation.isValid) {
    return {
      isValid: false,
      checkInDate: null,
      checkOutDate: null,
      nights: 0,
      error: `Invalid check-in date: ${checkInValidation.error}`,
    };
  }
  
  if (!checkOutValidation.isValid) {
    return {
      isValid: false,
      checkInDate: checkInValidation.isoDate,
      checkOutDate: null,
      nights: 0,
      error: `Invalid check-out date: ${checkOutValidation.error}`,
    };
  }
  
  // Check if check-in is in the past
  if (checkInValidation.isPast) {
    return {
      isValid: false,
      checkInDate: checkInValidation.isoDate,
      checkOutDate: checkOutValidation.isoDate,
      nights: 0,
      error: `Check-in date (${checkInValidation.isoDate}) cannot be in the past. Today is ${formatToISO(new Date())}.`,
    };
  }
  
  // Check if check-out is after check-in
  const checkIn = new Date(checkInValidation.isoDate! + 'T00:00:00');
  const checkOut = new Date(checkOutValidation.isoDate! + 'T00:00:00');
  
  if (checkOut <= checkIn) {
    return {
      isValid: false,
      checkInDate: checkInValidation.isoDate,
      checkOutDate: checkOutValidation.isoDate,
      nights: 0,
      error: `Check-out date (${checkOutValidation.isoDate}) must be after check-in date (${checkInValidation.isoDate}).`,
    };
  }
  
  // Calculate nights
  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  
  // Check reasonable duration (max 30 nights for booking)
  if (nights > 30) {
    return {
      isValid: false,
      checkInDate: checkInValidation.isoDate,
      checkOutDate: checkOutValidation.isoDate,
      nights,
      error: `Booking duration of ${nights} nights exceeds maximum of 30 nights. Please book in segments for longer stays.`,
    };
  }
  
  return {
    isValid: true,
    checkInDate: checkInValidation.isoDate,
    checkOutDate: checkOutValidation.isoDate,
    nights,
  };
}

/**
 * Assert that a date is valid and not in the past
 * Throws an error if validation fails
 */
export function assertFutureDate(dateInput: string | Date, fieldName: string = 'Date'): string {
  const validation = validateDate(dateInput);
  
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  if (validation.isPast) {
    throw new Error(
      `${fieldName} (${validation.isoDate}) cannot be in the past. Today is ${formatToISO(new Date())}.`
    );
  }
  
  return validation.isoDate!;
}

/**
 * Assert that a date range is valid for booking
 * Throws an error if validation fails
 */
export function assertValidDateRange(
  checkInInput: string | Date,
  checkOutInput: string | Date
): { checkInDate: string; checkOutDate: string; nights: number } {
  const validation = validateDateRange(checkInInput, checkOutInput);
  
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  return {
    checkInDate: validation.checkInDate!,
    checkOutDate: validation.checkOutDate!,
    nights: validation.nights,
  };
}

/**
 * Get a human-readable date string for the agent
 */
export function getAgentDateContext(): string {
  const context = getCurrentDateContext();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return `Today is ${context.dayOfWeek}, ${monthNames[context.currentMonth - 1]} ${context.currentDay}, ${context.currentYear} (${context.currentDate} in ISO format).`;
}

/**
 * Calculate future date from today
 */
export function addDays(days: number, fromDate?: Date): string {
  const date = fromDate ? new Date(fromDate) : new Date();
  date.setDate(date.getDate() + days);
  return formatToISO(date);
}

/**
 * Get relative date description
 */
export function getRelativeDateDescription(isoDate: string): string {
  const validation = validateDate(isoDate);
  if (!validation.isValid) return 'invalid date';
  
  const days = validation.daysFromNow;
  
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  if (days > 0 && days <= 7) return `in ${days} days`;
  if (days < 0 && days >= -7) return `${Math.abs(days)} days ago`;
  if (days > 7 && days <= 30) return `in ${Math.round(days / 7)} weeks`;
  if (days > 30) return `in ${Math.round(days / 30)} months`;
  
  return `${Math.abs(days)} days ago`;
}

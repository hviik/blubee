# Currency System Architecture

## Overview

This document describes the refactored currency system that enforces a **single, consistent currency per user session**, derived from server-side geo-detection with ISO-4217 compliance.

## Key Principles

1. **Server-First**: Currency detection and validation happen on the server. Never trust browser locale.
2. **Single-Currency Invariant**: One currency per session. No mixed-currency displays or calculations.
3. **ISO Compliance**: All currency codes are ISO-4217; all country codes are ISO-3166-1 alpha-2.
4. **User Override Priority**: User-selected currency always takes precedence over geo-detection.
5. **Explicit API Contract**: All requests must include currency and country.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT                                  │
│  ┌─────────────────┐    ┌──────────────────────────────────┐   │
│  │ useCurrencyContext│ →  │ GET /api/currency                │   │
│  │ Hook              │    │ (Returns resolved CurrencyContext)│   │
│  └─────────────────┘    └──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                         MIDDLEWARE                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Extract x-vercel-ip-country header                    │   │
│  │ 2. Check x-user-currency override header                 │   │
│  │ 3. Resolve country → currency from static map            │   │
│  │ 4. Inject X-Currency-* headers into response             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API ROUTES                                │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │ /api/currency │  │ /api/agent    │  │ /api/booking  │       │
│  │               │  │               │  │               │       │
│  │ GET: Resolve  │  │ Requires:     │  │ Requires:     │       │
│  │ POST: Update  │  │ - currency    │  │ - currency    │       │
│  │ DELETE: Reset │  │ - country     │  │ - country     │       │
│  └───────────────┘  └───────────────┘  └───────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                  │
│  profiles table:                                                 │
│  - preferred_currency (VARCHAR 3, ISO-4217)                     │
│  - preferred_country (VARCHAR 2, ISO-3166-1)                    │
│  - currency_source (VARCHAR 20: user_override|geo|default)      │
│  - currency_updated_at (TIMESTAMP)                              │
└─────────────────────────────────────────────────────────────────┘
```

## Resolution Priority

1. **User Override** (stored in profile with `currency_source = 'user_override'`)
2. **Request Header** (`X-User-Currency` header)
3. **Geo-Detection** (`x-vercel-ip-country` → static country-to-currency map)
4. **Default Fallback** (USD/US)

## Canonical CurrencyContext

```typescript
interface CurrencyContext {
  currency: ISO4217CurrencyCode; // e.g., "USD", "EUR", "INR"
  country: ISO3166CountryCode;   // e.g., "US", "DE", "IN"
  source: 'user_override' | 'geo' | 'default';
  symbol: string;                // e.g., "$", "€", "₹"
  name: string;                  // e.g., "US Dollar"
  resolvedAt: string;            // ISO 8601 timestamp
}
```

## API Contract

### Request Requirements

Every API request to `/api/agent` and `/api/booking` **MUST** include:

```json
{
  "currency": "USD",      // ISO-4217 (REQUIRED)
  "country": "US",        // ISO-3166-1 alpha-2 (recommended)
  "currencyContext": {}   // Full context (optional, for traceability)
}
```

### GET /api/currency

Resolves the currency context for the current user/request.

**Response:**
```json
{
  "currency": "INR",
  "country": "IN",
  "source": "geo",
  "symbol": "₹",
  "name": "Indian Rupee",
  "resolvedAt": "2026-01-15T10:30:00.000Z"
}
```

### POST /api/currency

Updates user's currency preference.

**Request:**
```json
{
  "currency": "EUR",
  "country": "DE"
}
```

**Response:**
```json
{
  "success": true,
  "context": {
    "currency": "EUR",
    "country": "DE",
    "source": "user_override",
    "symbol": "€",
    "name": "Euro",
    "resolvedAt": "2026-01-15T10:31:00.000Z"
  },
  "message": "Currency preference updated to Euro (EUR)"
}
```

### DELETE /api/currency

Resets user's currency preference to geo-detection.

**Response:**
```json
{
  "success": true,
  "context": {
    "currency": "INR",
    "country": "IN",
    "source": "geo",
    ...
  },
  "message": "Currency preference reset to geo-detection"
}
```

## Hotel Search Request

```json
{
  "destination": "Milan",
  "checkInDate": "2026-02-14",
  "checkOutDate": "2026-02-15",
  "adults": 2,
  "rooms": 1,
  "currency": "EUR",
  "country": "IT"
}
```

## Hotel Search Response

```json
{
  "success": true,
  "destination": "Milan",
  "checkInDate": "2026-02-14",
  "checkOutDate": "2026-02-15",
  "nights": 1,
  "currency": "EUR",
  "currencyInjected": false,
  "hotels": [
    {
      "id": "12608997",
      "name": "AF Duomo - Milano Luxury Suites",
      "price": 1561.5,
      "currency": "EUR",
      "pricePerNight": 1562
    }
  ]
}
```

## Validation Rules

### Currency Code Validation

- Must be exactly 3 uppercase letters
- Must match pattern: `/^[A-Z]{3}$/`
- Unknown codes are accepted but may not have full metadata

### Country Code Validation

- Must be exactly 2 uppercase letters
- Must match pattern: `/^[A-Z]{2}$/`
- Falls back to "US" if invalid

### Failure Modes

| Scenario | Behavior |
|----------|----------|
| Missing currency in request | Auto-inject from geo-detection (with warning log) |
| Invalid currency format | Return 400 error |
| Missing country in request | Auto-inject from geo-detection (with warning) |
| Invalid country format | Fall back to "US" |
| Geo-detection unavailable | Fall back to "US"/"USD" |
| Database error on preference | Continue with geo-detection |

## Backward Compatibility

### Migration Path

1. **Phase 1 (Current)**: Auto-inject currency if missing, log warnings
2. **Phase 2**: Require currency in requests, return 400 if missing
3. **Phase 3**: Remove legacy `currencyDetection.ts`

### Deprecated Functions

The following in `app/utils/currencyDetection.ts` are deprecated:

- `detectUserCurrency()` → Use `useCurrencyContext()` hook
- `getExchangeRate()` → Use single-currency pricing
- `convertAndFormat()` → Use `formatPrice()` from `lib/currency/format`

## Files Structure

```
lib/currency/
├── index.ts              # Public API exports
├── types.ts              # Type definitions (CurrencyContext, ISO types)
├── countryToCurrency.ts  # Static country → currency mapping
├── resolver.ts           # Server-side resolution logic
└── format.ts             # Price formatting utilities

app/hooks/
└── useCurrencyContext.ts # React hook for currency context

app/api/currency/
└── route.ts              # Currency API endpoint

middleware.ts             # Geo-detection and currency header injection

supabase/migrations/
└── 20260115_user_currency_preferences.sql
```

## Monitoring & Logging

The system logs the following events:

- `[Currency] resolution`: Successful currency resolution
- `[Currency] fallback`: When default values are used
- `[Currency] override`: When user override is applied
- `[Currency] warning`: Auto-injection or format issues
- `[Booking API] Currency auto-injected`: When request missing currency

## Testing

To test the currency system:

1. **Geo-detection**: Deploy to Vercel and access from different countries
2. **User override**: Use POST /api/currency to set preference
3. **Fallback**: Remove `x-vercel-ip-country` header to test default behavior
4. **Validation**: Send invalid currency codes to verify error handling

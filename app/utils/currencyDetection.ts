export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'Fr',
  CNY: '¥',
  INR: '₹',
  AED: 'د.إ',
  SGD: 'S$',
  HKD: 'HK$',
  NZD: 'NZ$',
  KRW: '₩',
  MXN: '$',
  BRL: 'R$',
  ZAR: 'R',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  THB: '฿',
  IDR: 'Rp',
  MYR: 'RM',
  PHP: '₱',
  VND: '₫',
};

const currencyNames: Record<string, string> = {
  USD: 'US Dollars',
  EUR: 'Euros',
  GBP: 'British Pounds',
  JPY: 'Japanese Yen',
  AUD: 'Australian Dollars',
  CAD: 'Canadian Dollars',
  CHF: 'Swiss Francs',
  CNY: 'Chinese Yuan',
  INR: 'Indian Rupees',
  AED: 'UAE Dirhams',
  SGD: 'Singapore Dollars',
  HKD: 'Hong Kong Dollars',
  NZD: 'New Zealand Dollars',
  KRW: 'South Korean Won',
  MXN: 'Mexican Pesos',
  BRL: 'Brazilian Reais',
  ZAR: 'South African Rand',
  SEK: 'Swedish Kronor',
  NOK: 'Norwegian Krone',
  DKK: 'Danish Krone',
  PLN: 'Polish Zloty',
  THB: 'Thai Baht',
  IDR: 'Indonesian Rupiah',
  MYR: 'Malaysian Ringgit',
  PHP: 'Philippine Pesos',
  VND: 'Vietnamese Dong',
};

export async function detectUserCurrency(): Promise<CurrencyInfo> {
  const cached = sessionStorage.getItem('userCurrency');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
    }
  }

  const defaultCurrency: CurrencyInfo = {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupees',
  };

  try {
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.warn('Currency detection failed, using default INR');
      return defaultCurrency;
    }

    const data = await response.json();
    const currencyCode = data.currency;

    if (!currencyCode) {
      console.warn('No currency in response, using default INR');
      return defaultCurrency;
    }

    const currencyInfo: CurrencyInfo = {
      code: currencyCode,
      symbol: currencySymbols[currencyCode] || currencyCode,
      name: currencyNames[currencyCode] || currencyCode,
    };

    sessionStorage.setItem('userCurrency', JSON.stringify(currencyInfo));

    return currencyInfo;
  } catch (error) {
    console.error('Failed to detect currency:', error);
    return defaultCurrency;
  }
}

export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) return 1;

  try {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`,
      {
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      console.warn('Exchange rate fetch failed');
      return 1;
    }

    const data = await response.json();
    return data.rates[toCurrency] || 1;
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);
    return 1;
  }
}

export function formatPrice(
  amount: number,
  currencyInfo: CurrencyInfo
): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyInfo.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currencyInfo.symbol} ${Math.round(amount).toLocaleString()}`;
  }
}

export function convertAndFormat(
  amountINR: number,
  targetCurrency: CurrencyInfo,
  exchangeRate: number
): string {
  if (targetCurrency.code === 'INR') {
    return formatPrice(amountINR, targetCurrency);
  }
  
  const convertedAmount = Math.round(amountINR * exchangeRate);
  
  return formatPrice(convertedAmount, targetCurrency);
}


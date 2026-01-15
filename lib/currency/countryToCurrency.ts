/**
 * Static Country to Currency Mapping
 * 
 * This module provides a complete, explicit mapping from ISO-3166-1 alpha-2 country codes
 * to ISO-4217 currency codes. This is the authoritative source for currency resolution
 * based on country - no dynamic inference is performed.
 * 
 * Coverage: 200+ countries mapped to their primary currency
 */

import { ISO4217CurrencyCode, ISO3166CountryCode } from './types';

/**
 * Currency metadata for display
 */
export interface CurrencyMetadata {
  code: ISO4217CurrencyCode;
  symbol: string;
  name: string;
  decimalPlaces: number;
}

/**
 * Static map of ISO-3166-1 alpha-2 country codes to ISO-4217 currency codes
 * This map is intentionally exhaustive and explicit
 */
export const COUNTRY_TO_CURRENCY: Record<string, ISO4217CurrencyCode> = {
  // A
  'AD': 'EUR' as ISO4217CurrencyCode, // Andorra
  'AE': 'AED' as ISO4217CurrencyCode, // United Arab Emirates
  'AF': 'AFN' as ISO4217CurrencyCode, // Afghanistan
  'AG': 'XCD' as ISO4217CurrencyCode, // Antigua and Barbuda
  'AI': 'XCD' as ISO4217CurrencyCode, // Anguilla
  'AL': 'ALL' as ISO4217CurrencyCode, // Albania
  'AM': 'AMD' as ISO4217CurrencyCode, // Armenia
  'AO': 'AOA' as ISO4217CurrencyCode, // Angola
  'AR': 'ARS' as ISO4217CurrencyCode, // Argentina
  'AS': 'USD' as ISO4217CurrencyCode, // American Samoa
  'AT': 'EUR' as ISO4217CurrencyCode, // Austria
  'AU': 'AUD' as ISO4217CurrencyCode, // Australia
  'AW': 'AWG' as ISO4217CurrencyCode, // Aruba
  'AX': 'EUR' as ISO4217CurrencyCode, // Åland Islands
  'AZ': 'AZN' as ISO4217CurrencyCode, // Azerbaijan
  
  // B
  'BA': 'BAM' as ISO4217CurrencyCode, // Bosnia and Herzegovina
  'BB': 'BBD' as ISO4217CurrencyCode, // Barbados
  'BD': 'BDT' as ISO4217CurrencyCode, // Bangladesh
  'BE': 'EUR' as ISO4217CurrencyCode, // Belgium
  'BF': 'XOF' as ISO4217CurrencyCode, // Burkina Faso
  'BG': 'BGN' as ISO4217CurrencyCode, // Bulgaria
  'BH': 'BHD' as ISO4217CurrencyCode, // Bahrain
  'BI': 'BIF' as ISO4217CurrencyCode, // Burundi
  'BJ': 'XOF' as ISO4217CurrencyCode, // Benin
  'BL': 'EUR' as ISO4217CurrencyCode, // Saint Barthélemy
  'BM': 'BMD' as ISO4217CurrencyCode, // Bermuda
  'BN': 'BND' as ISO4217CurrencyCode, // Brunei
  'BO': 'BOB' as ISO4217CurrencyCode, // Bolivia
  'BQ': 'USD' as ISO4217CurrencyCode, // Caribbean Netherlands
  'BR': 'BRL' as ISO4217CurrencyCode, // Brazil
  'BS': 'BSD' as ISO4217CurrencyCode, // Bahamas
  'BT': 'BTN' as ISO4217CurrencyCode, // Bhutan
  'BW': 'BWP' as ISO4217CurrencyCode, // Botswana
  'BY': 'BYN' as ISO4217CurrencyCode, // Belarus
  'BZ': 'BZD' as ISO4217CurrencyCode, // Belize
  
  // C
  'CA': 'CAD' as ISO4217CurrencyCode, // Canada
  'CC': 'AUD' as ISO4217CurrencyCode, // Cocos Islands
  'CD': 'CDF' as ISO4217CurrencyCode, // DR Congo
  'CF': 'XAF' as ISO4217CurrencyCode, // Central African Republic
  'CG': 'XAF' as ISO4217CurrencyCode, // Republic of Congo
  'CH': 'CHF' as ISO4217CurrencyCode, // Switzerland
  'CI': 'XOF' as ISO4217CurrencyCode, // Côte d'Ivoire
  'CK': 'NZD' as ISO4217CurrencyCode, // Cook Islands
  'CL': 'CLP' as ISO4217CurrencyCode, // Chile
  'CM': 'XAF' as ISO4217CurrencyCode, // Cameroon
  'CN': 'CNY' as ISO4217CurrencyCode, // China
  'CO': 'COP' as ISO4217CurrencyCode, // Colombia
  'CR': 'CRC' as ISO4217CurrencyCode, // Costa Rica
  'CU': 'CUP' as ISO4217CurrencyCode, // Cuba
  'CV': 'CVE' as ISO4217CurrencyCode, // Cape Verde
  'CW': 'ANG' as ISO4217CurrencyCode, // Curaçao
  'CX': 'AUD' as ISO4217CurrencyCode, // Christmas Island
  'CY': 'EUR' as ISO4217CurrencyCode, // Cyprus
  'CZ': 'CZK' as ISO4217CurrencyCode, // Czech Republic
  
  // D
  'DE': 'EUR' as ISO4217CurrencyCode, // Germany
  'DJ': 'DJF' as ISO4217CurrencyCode, // Djibouti
  'DK': 'DKK' as ISO4217CurrencyCode, // Denmark
  'DM': 'XCD' as ISO4217CurrencyCode, // Dominica
  'DO': 'DOP' as ISO4217CurrencyCode, // Dominican Republic
  'DZ': 'DZD' as ISO4217CurrencyCode, // Algeria
  
  // E
  'EC': 'USD' as ISO4217CurrencyCode, // Ecuador
  'EE': 'EUR' as ISO4217CurrencyCode, // Estonia
  'EG': 'EGP' as ISO4217CurrencyCode, // Egypt
  'EH': 'MAD' as ISO4217CurrencyCode, // Western Sahara
  'ER': 'ERN' as ISO4217CurrencyCode, // Eritrea
  'ES': 'EUR' as ISO4217CurrencyCode, // Spain
  'ET': 'ETB' as ISO4217CurrencyCode, // Ethiopia
  
  // F
  'FI': 'EUR' as ISO4217CurrencyCode, // Finland
  'FJ': 'FJD' as ISO4217CurrencyCode, // Fiji
  'FK': 'FKP' as ISO4217CurrencyCode, // Falkland Islands
  'FM': 'USD' as ISO4217CurrencyCode, // Micronesia
  'FO': 'DKK' as ISO4217CurrencyCode, // Faroe Islands
  'FR': 'EUR' as ISO4217CurrencyCode, // France
  
  // G
  'GA': 'XAF' as ISO4217CurrencyCode, // Gabon
  'GB': 'GBP' as ISO4217CurrencyCode, // United Kingdom
  'GD': 'XCD' as ISO4217CurrencyCode, // Grenada
  'GE': 'GEL' as ISO4217CurrencyCode, // Georgia
  'GF': 'EUR' as ISO4217CurrencyCode, // French Guiana
  'GG': 'GBP' as ISO4217CurrencyCode, // Guernsey
  'GH': 'GHS' as ISO4217CurrencyCode, // Ghana
  'GI': 'GIP' as ISO4217CurrencyCode, // Gibraltar
  'GL': 'DKK' as ISO4217CurrencyCode, // Greenland
  'GM': 'GMD' as ISO4217CurrencyCode, // Gambia
  'GN': 'GNF' as ISO4217CurrencyCode, // Guinea
  'GP': 'EUR' as ISO4217CurrencyCode, // Guadeloupe
  'GQ': 'XAF' as ISO4217CurrencyCode, // Equatorial Guinea
  'GR': 'EUR' as ISO4217CurrencyCode, // Greece
  'GT': 'GTQ' as ISO4217CurrencyCode, // Guatemala
  'GU': 'USD' as ISO4217CurrencyCode, // Guam
  'GW': 'XOF' as ISO4217CurrencyCode, // Guinea-Bissau
  'GY': 'GYD' as ISO4217CurrencyCode, // Guyana
  
  // H
  'HK': 'HKD' as ISO4217CurrencyCode, // Hong Kong
  'HN': 'HNL' as ISO4217CurrencyCode, // Honduras
  'HR': 'EUR' as ISO4217CurrencyCode, // Croatia (joined EUR in 2023)
  'HT': 'HTG' as ISO4217CurrencyCode, // Haiti
  'HU': 'HUF' as ISO4217CurrencyCode, // Hungary
  
  // I
  'ID': 'IDR' as ISO4217CurrencyCode, // Indonesia
  'IE': 'EUR' as ISO4217CurrencyCode, // Ireland
  'IL': 'ILS' as ISO4217CurrencyCode, // Israel
  'IM': 'GBP' as ISO4217CurrencyCode, // Isle of Man
  'IN': 'INR' as ISO4217CurrencyCode, // India
  'IO': 'USD' as ISO4217CurrencyCode, // British Indian Ocean Territory
  'IQ': 'IQD' as ISO4217CurrencyCode, // Iraq
  'IR': 'IRR' as ISO4217CurrencyCode, // Iran
  'IS': 'ISK' as ISO4217CurrencyCode, // Iceland
  'IT': 'EUR' as ISO4217CurrencyCode, // Italy
  
  // J
  'JE': 'GBP' as ISO4217CurrencyCode, // Jersey
  'JM': 'JMD' as ISO4217CurrencyCode, // Jamaica
  'JO': 'JOD' as ISO4217CurrencyCode, // Jordan
  'JP': 'JPY' as ISO4217CurrencyCode, // Japan
  
  // K
  'KE': 'KES' as ISO4217CurrencyCode, // Kenya
  'KG': 'KGS' as ISO4217CurrencyCode, // Kyrgyzstan
  'KH': 'KHR' as ISO4217CurrencyCode, // Cambodia
  'KI': 'AUD' as ISO4217CurrencyCode, // Kiribati
  'KM': 'KMF' as ISO4217CurrencyCode, // Comoros
  'KN': 'XCD' as ISO4217CurrencyCode, // Saint Kitts and Nevis
  'KP': 'KPW' as ISO4217CurrencyCode, // North Korea
  'KR': 'KRW' as ISO4217CurrencyCode, // South Korea
  'KW': 'KWD' as ISO4217CurrencyCode, // Kuwait
  'KY': 'KYD' as ISO4217CurrencyCode, // Cayman Islands
  'KZ': 'KZT' as ISO4217CurrencyCode, // Kazakhstan
  
  // L
  'LA': 'LAK' as ISO4217CurrencyCode, // Laos
  'LB': 'LBP' as ISO4217CurrencyCode, // Lebanon
  'LC': 'XCD' as ISO4217CurrencyCode, // Saint Lucia
  'LI': 'CHF' as ISO4217CurrencyCode, // Liechtenstein
  'LK': 'LKR' as ISO4217CurrencyCode, // Sri Lanka
  'LR': 'LRD' as ISO4217CurrencyCode, // Liberia
  'LS': 'LSL' as ISO4217CurrencyCode, // Lesotho
  'LT': 'EUR' as ISO4217CurrencyCode, // Lithuania
  'LU': 'EUR' as ISO4217CurrencyCode, // Luxembourg
  'LV': 'EUR' as ISO4217CurrencyCode, // Latvia
  'LY': 'LYD' as ISO4217CurrencyCode, // Libya
  
  // M
  'MA': 'MAD' as ISO4217CurrencyCode, // Morocco
  'MC': 'EUR' as ISO4217CurrencyCode, // Monaco
  'MD': 'MDL' as ISO4217CurrencyCode, // Moldova
  'ME': 'EUR' as ISO4217CurrencyCode, // Montenegro
  'MF': 'EUR' as ISO4217CurrencyCode, // Saint Martin
  'MG': 'MGA' as ISO4217CurrencyCode, // Madagascar
  'MH': 'USD' as ISO4217CurrencyCode, // Marshall Islands
  'MK': 'MKD' as ISO4217CurrencyCode, // North Macedonia
  'ML': 'XOF' as ISO4217CurrencyCode, // Mali
  'MM': 'MMK' as ISO4217CurrencyCode, // Myanmar
  'MN': 'MNT' as ISO4217CurrencyCode, // Mongolia
  'MO': 'MOP' as ISO4217CurrencyCode, // Macau
  'MP': 'USD' as ISO4217CurrencyCode, // Northern Mariana Islands
  'MQ': 'EUR' as ISO4217CurrencyCode, // Martinique
  'MR': 'MRU' as ISO4217CurrencyCode, // Mauritania
  'MS': 'XCD' as ISO4217CurrencyCode, // Montserrat
  'MT': 'EUR' as ISO4217CurrencyCode, // Malta
  'MU': 'MUR' as ISO4217CurrencyCode, // Mauritius
  'MV': 'MVR' as ISO4217CurrencyCode, // Maldives
  'MW': 'MWK' as ISO4217CurrencyCode, // Malawi
  'MX': 'MXN' as ISO4217CurrencyCode, // Mexico
  'MY': 'MYR' as ISO4217CurrencyCode, // Malaysia
  'MZ': 'MZN' as ISO4217CurrencyCode, // Mozambique
  
  // N
  'NA': 'NAD' as ISO4217CurrencyCode, // Namibia
  'NC': 'XPF' as ISO4217CurrencyCode, // New Caledonia
  'NE': 'XOF' as ISO4217CurrencyCode, // Niger
  'NF': 'AUD' as ISO4217CurrencyCode, // Norfolk Island
  'NG': 'NGN' as ISO4217CurrencyCode, // Nigeria
  'NI': 'NIO' as ISO4217CurrencyCode, // Nicaragua
  'NL': 'EUR' as ISO4217CurrencyCode, // Netherlands
  'NO': 'NOK' as ISO4217CurrencyCode, // Norway
  'NP': 'NPR' as ISO4217CurrencyCode, // Nepal
  'NR': 'AUD' as ISO4217CurrencyCode, // Nauru
  'NU': 'NZD' as ISO4217CurrencyCode, // Niue
  'NZ': 'NZD' as ISO4217CurrencyCode, // New Zealand
  
  // O
  'OM': 'OMR' as ISO4217CurrencyCode, // Oman
  
  // P
  'PA': 'PAB' as ISO4217CurrencyCode, // Panama (also uses USD)
  'PE': 'PEN' as ISO4217CurrencyCode, // Peru
  'PF': 'XPF' as ISO4217CurrencyCode, // French Polynesia
  'PG': 'PGK' as ISO4217CurrencyCode, // Papua New Guinea
  'PH': 'PHP' as ISO4217CurrencyCode, // Philippines
  'PK': 'PKR' as ISO4217CurrencyCode, // Pakistan
  'PL': 'PLN' as ISO4217CurrencyCode, // Poland
  'PM': 'EUR' as ISO4217CurrencyCode, // Saint Pierre and Miquelon
  'PN': 'NZD' as ISO4217CurrencyCode, // Pitcairn
  'PR': 'USD' as ISO4217CurrencyCode, // Puerto Rico
  'PS': 'ILS' as ISO4217CurrencyCode, // Palestine
  'PT': 'EUR' as ISO4217CurrencyCode, // Portugal
  'PW': 'USD' as ISO4217CurrencyCode, // Palau
  'PY': 'PYG' as ISO4217CurrencyCode, // Paraguay
  
  // Q
  'QA': 'QAR' as ISO4217CurrencyCode, // Qatar
  
  // R
  'RE': 'EUR' as ISO4217CurrencyCode, // Réunion
  'RO': 'RON' as ISO4217CurrencyCode, // Romania
  'RS': 'RSD' as ISO4217CurrencyCode, // Serbia
  'RU': 'RUB' as ISO4217CurrencyCode, // Russia
  'RW': 'RWF' as ISO4217CurrencyCode, // Rwanda
  
  // S
  'SA': 'SAR' as ISO4217CurrencyCode, // Saudi Arabia
  'SB': 'SBD' as ISO4217CurrencyCode, // Solomon Islands
  'SC': 'SCR' as ISO4217CurrencyCode, // Seychelles
  'SD': 'SDG' as ISO4217CurrencyCode, // Sudan
  'SE': 'SEK' as ISO4217CurrencyCode, // Sweden
  'SG': 'SGD' as ISO4217CurrencyCode, // Singapore
  'SH': 'SHP' as ISO4217CurrencyCode, // Saint Helena
  'SI': 'EUR' as ISO4217CurrencyCode, // Slovenia
  'SJ': 'NOK' as ISO4217CurrencyCode, // Svalbard and Jan Mayen
  'SK': 'EUR' as ISO4217CurrencyCode, // Slovakia
  'SL': 'SLE' as ISO4217CurrencyCode, // Sierra Leone
  'SM': 'EUR' as ISO4217CurrencyCode, // San Marino
  'SN': 'XOF' as ISO4217CurrencyCode, // Senegal
  'SO': 'SOS' as ISO4217CurrencyCode, // Somalia
  'SR': 'SRD' as ISO4217CurrencyCode, // Suriname
  'SS': 'SSP' as ISO4217CurrencyCode, // South Sudan
  'ST': 'STN' as ISO4217CurrencyCode, // São Tomé and Príncipe
  'SV': 'USD' as ISO4217CurrencyCode, // El Salvador
  'SX': 'ANG' as ISO4217CurrencyCode, // Sint Maarten
  'SY': 'SYP' as ISO4217CurrencyCode, // Syria
  'SZ': 'SZL' as ISO4217CurrencyCode, // Eswatini
  
  // T
  'TC': 'USD' as ISO4217CurrencyCode, // Turks and Caicos Islands
  'TD': 'XAF' as ISO4217CurrencyCode, // Chad
  'TF': 'EUR' as ISO4217CurrencyCode, // French Southern Territories
  'TG': 'XOF' as ISO4217CurrencyCode, // Togo
  'TH': 'THB' as ISO4217CurrencyCode, // Thailand
  'TJ': 'TJS' as ISO4217CurrencyCode, // Tajikistan
  'TK': 'NZD' as ISO4217CurrencyCode, // Tokelau
  'TL': 'USD' as ISO4217CurrencyCode, // Timor-Leste
  'TM': 'TMT' as ISO4217CurrencyCode, // Turkmenistan
  'TN': 'TND' as ISO4217CurrencyCode, // Tunisia
  'TO': 'TOP' as ISO4217CurrencyCode, // Tonga
  'TR': 'TRY' as ISO4217CurrencyCode, // Turkey
  'TT': 'TTD' as ISO4217CurrencyCode, // Trinidad and Tobago
  'TV': 'AUD' as ISO4217CurrencyCode, // Tuvalu
  'TW': 'TWD' as ISO4217CurrencyCode, // Taiwan
  'TZ': 'TZS' as ISO4217CurrencyCode, // Tanzania
  
  // U
  'UA': 'UAH' as ISO4217CurrencyCode, // Ukraine
  'UG': 'UGX' as ISO4217CurrencyCode, // Uganda
  'UM': 'USD' as ISO4217CurrencyCode, // U.S. Minor Outlying Islands
  'US': 'USD' as ISO4217CurrencyCode, // United States
  'UY': 'UYU' as ISO4217CurrencyCode, // Uruguay
  'UZ': 'UZS' as ISO4217CurrencyCode, // Uzbekistan
  
  // V
  'VA': 'EUR' as ISO4217CurrencyCode, // Vatican City
  'VC': 'XCD' as ISO4217CurrencyCode, // Saint Vincent and the Grenadines
  'VE': 'VES' as ISO4217CurrencyCode, // Venezuela
  'VG': 'USD' as ISO4217CurrencyCode, // British Virgin Islands
  'VI': 'USD' as ISO4217CurrencyCode, // U.S. Virgin Islands
  'VN': 'VND' as ISO4217CurrencyCode, // Vietnam
  'VU': 'VUV' as ISO4217CurrencyCode, // Vanuatu
  
  // W
  'WF': 'XPF' as ISO4217CurrencyCode, // Wallis and Futuna
  'WS': 'WST' as ISO4217CurrencyCode, // Samoa
  
  // X - (No standard countries)
  
  // Y
  'YE': 'YER' as ISO4217CurrencyCode, // Yemen
  'YT': 'EUR' as ISO4217CurrencyCode, // Mayotte
  
  // Z
  'ZA': 'ZAR' as ISO4217CurrencyCode, // South Africa
  'ZM': 'ZMW' as ISO4217CurrencyCode, // Zambia
  'ZW': 'ZWL' as ISO4217CurrencyCode, // Zimbabwe
};

/**
 * Currency metadata for commonly used currencies
 * Only currencies that are commonly used in the application
 */
export const CURRENCY_METADATA: Record<string, CurrencyMetadata> = {
  'USD': { code: 'USD' as ISO4217CurrencyCode, symbol: '$', name: 'US Dollar', decimalPlaces: 2 },
  'EUR': { code: 'EUR' as ISO4217CurrencyCode, symbol: '€', name: 'Euro', decimalPlaces: 2 },
  'GBP': { code: 'GBP' as ISO4217CurrencyCode, symbol: '£', name: 'British Pound', decimalPlaces: 2 },
  'JPY': { code: 'JPY' as ISO4217CurrencyCode, symbol: '¥', name: 'Japanese Yen', decimalPlaces: 0 },
  'AUD': { code: 'AUD' as ISO4217CurrencyCode, symbol: 'A$', name: 'Australian Dollar', decimalPlaces: 2 },
  'CAD': { code: 'CAD' as ISO4217CurrencyCode, symbol: 'C$', name: 'Canadian Dollar', decimalPlaces: 2 },
  'CHF': { code: 'CHF' as ISO4217CurrencyCode, symbol: 'Fr', name: 'Swiss Franc', decimalPlaces: 2 },
  'CNY': { code: 'CNY' as ISO4217CurrencyCode, symbol: '¥', name: 'Chinese Yuan', decimalPlaces: 2 },
  'INR': { code: 'INR' as ISO4217CurrencyCode, symbol: '₹', name: 'Indian Rupee', decimalPlaces: 2 },
  'AED': { code: 'AED' as ISO4217CurrencyCode, symbol: 'د.إ', name: 'UAE Dirham', decimalPlaces: 2 },
  'SGD': { code: 'SGD' as ISO4217CurrencyCode, symbol: 'S$', name: 'Singapore Dollar', decimalPlaces: 2 },
  'HKD': { code: 'HKD' as ISO4217CurrencyCode, symbol: 'HK$', name: 'Hong Kong Dollar', decimalPlaces: 2 },
  'NZD': { code: 'NZD' as ISO4217CurrencyCode, symbol: 'NZ$', name: 'New Zealand Dollar', decimalPlaces: 2 },
  'KRW': { code: 'KRW' as ISO4217CurrencyCode, symbol: '₩', name: 'South Korean Won', decimalPlaces: 0 },
  'MXN': { code: 'MXN' as ISO4217CurrencyCode, symbol: '$', name: 'Mexican Peso', decimalPlaces: 2 },
  'BRL': { code: 'BRL' as ISO4217CurrencyCode, symbol: 'R$', name: 'Brazilian Real', decimalPlaces: 2 },
  'ZAR': { code: 'ZAR' as ISO4217CurrencyCode, symbol: 'R', name: 'South African Rand', decimalPlaces: 2 },
  'SEK': { code: 'SEK' as ISO4217CurrencyCode, symbol: 'kr', name: 'Swedish Krona', decimalPlaces: 2 },
  'NOK': { code: 'NOK' as ISO4217CurrencyCode, symbol: 'kr', name: 'Norwegian Krone', decimalPlaces: 2 },
  'DKK': { code: 'DKK' as ISO4217CurrencyCode, symbol: 'kr', name: 'Danish Krone', decimalPlaces: 2 },
  'PLN': { code: 'PLN' as ISO4217CurrencyCode, symbol: 'zł', name: 'Polish Zloty', decimalPlaces: 2 },
  'THB': { code: 'THB' as ISO4217CurrencyCode, symbol: '฿', name: 'Thai Baht', decimalPlaces: 2 },
  'IDR': { code: 'IDR' as ISO4217CurrencyCode, symbol: 'Rp', name: 'Indonesian Rupiah', decimalPlaces: 0 },
  'MYR': { code: 'MYR' as ISO4217CurrencyCode, symbol: 'RM', name: 'Malaysian Ringgit', decimalPlaces: 2 },
  'PHP': { code: 'PHP' as ISO4217CurrencyCode, symbol: '₱', name: 'Philippine Peso', decimalPlaces: 2 },
  'VND': { code: 'VND' as ISO4217CurrencyCode, symbol: '₫', name: 'Vietnamese Dong', decimalPlaces: 0 },
  'RUB': { code: 'RUB' as ISO4217CurrencyCode, symbol: '₽', name: 'Russian Ruble', decimalPlaces: 2 },
  'TRY': { code: 'TRY' as ISO4217CurrencyCode, symbol: '₺', name: 'Turkish Lira', decimalPlaces: 2 },
  'SAR': { code: 'SAR' as ISO4217CurrencyCode, symbol: '﷼', name: 'Saudi Riyal', decimalPlaces: 2 },
  'QAR': { code: 'QAR' as ISO4217CurrencyCode, symbol: '﷼', name: 'Qatari Riyal', decimalPlaces: 2 },
  'KWD': { code: 'KWD' as ISO4217CurrencyCode, symbol: 'د.ك', name: 'Kuwaiti Dinar', decimalPlaces: 3 },
  'BHD': { code: 'BHD' as ISO4217CurrencyCode, symbol: '.د.ب', name: 'Bahraini Dinar', decimalPlaces: 3 },
  'OMR': { code: 'OMR' as ISO4217CurrencyCode, symbol: '﷼', name: 'Omani Rial', decimalPlaces: 3 },
  'LKR': { code: 'LKR' as ISO4217CurrencyCode, symbol: '₨', name: 'Sri Lankan Rupee', decimalPlaces: 2 },
  'PKR': { code: 'PKR' as ISO4217CurrencyCode, symbol: '₨', name: 'Pakistani Rupee', decimalPlaces: 2 },
  'BDT': { code: 'BDT' as ISO4217CurrencyCode, symbol: '৳', name: 'Bangladeshi Taka', decimalPlaces: 2 },
  'NPR': { code: 'NPR' as ISO4217CurrencyCode, symbol: '₨', name: 'Nepalese Rupee', decimalPlaces: 2 },
  'EGP': { code: 'EGP' as ISO4217CurrencyCode, symbol: '£', name: 'Egyptian Pound', decimalPlaces: 2 },
  'NGN': { code: 'NGN' as ISO4217CurrencyCode, symbol: '₦', name: 'Nigerian Naira', decimalPlaces: 2 },
  'KES': { code: 'KES' as ISO4217CurrencyCode, symbol: 'KSh', name: 'Kenyan Shilling', decimalPlaces: 2 },
  'COP': { code: 'COP' as ISO4217CurrencyCode, symbol: '$', name: 'Colombian Peso', decimalPlaces: 2 },
  'ARS': { code: 'ARS' as ISO4217CurrencyCode, symbol: '$', name: 'Argentine Peso', decimalPlaces: 2 },
  'CLP': { code: 'CLP' as ISO4217CurrencyCode, symbol: '$', name: 'Chilean Peso', decimalPlaces: 0 },
  'PEN': { code: 'PEN' as ISO4217CurrencyCode, symbol: 'S/', name: 'Peruvian Sol', decimalPlaces: 2 },
};

/**
 * Get currency code for a country
 * @param countryCode ISO-3166-1 alpha-2 country code
 * @returns ISO-4217 currency code or null if not found
 */
export function getCurrencyForCountry(countryCode: string): ISO4217CurrencyCode | null {
  const upperCode = countryCode.toUpperCase();
  return COUNTRY_TO_CURRENCY[upperCode] || null;
}

/**
 * Get currency metadata
 * @param currencyCode ISO-4217 currency code
 * @returns Currency metadata or default USD metadata
 */
export function getCurrencyMetadata(currencyCode: string): CurrencyMetadata {
  const upperCode = currencyCode.toUpperCase();
  return CURRENCY_METADATA[upperCode] || CURRENCY_METADATA['USD'];
}

/**
 * Check if a currency code is supported with full metadata
 */
export function isSupportedCurrency(currencyCode: string): boolean {
  return currencyCode.toUpperCase() in CURRENCY_METADATA;
}

/**
 * Get list of all supported currencies with metadata
 */
export function getSupportedCurrencies(): CurrencyMetadata[] {
  return Object.values(CURRENCY_METADATA);
}

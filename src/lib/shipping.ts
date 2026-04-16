import type { ShippingZone, ShippingQuote } from '@/types'

// ─── Japan Post EMS Shipping Calculator (worldwide, 4 zones) ─────────────────
// Based on Japan Post official EMS zone classifications
// Rates verified from Japan Post published schedule

const COUNTRY_ZONES: Record<string, ShippingZone> = {
  // ── Zone 1: Asia ──────────────────────────────────────────────────────────
  AF: 1, // Afghanistan
  BD: 1, // Bangladesh
  BT: 1, // Bhutan
  BN: 1, // Brunei
  KH: 1, // Cambodia
  CN: 1, // China
  HK: 1, // Hong Kong
  IN: 1, // India
  ID: 1, // Indonesia
  KP: 1, // North Korea
  KR: 1, // South Korea
  LA: 1, // Laos
  MO: 1, // Macau
  MY: 1, // Malaysia
  MV: 1, // Maldives
  MN: 1, // Mongolia
  MM: 1, // Myanmar
  NP: 1, // Nepal
  PK: 1, // Pakistan
  PH: 1, // Philippines
  SG: 1, // Singapore
  LK: 1, // Sri Lanka
  TW: 1, // Taiwan
  TH: 1, // Thailand
  TL: 1, // Timor-Leste
  VN: 1, // Vietnam

  // ── Zone 2: Oceania, North & Central America, Caribbean, Middle East ──────
  // Oceania
  AU: 2, // Australia
  FJ: 2, // Fiji
  KI: 2, // Kiribati
  MH: 2, // Marshall Islands
  FM: 2, // Micronesia
  NR: 2, // Nauru
  NZ: 2, // New Zealand
  PW: 2, // Palau
  PG: 2, // Papua New Guinea
  WS: 2, // Samoa
  SB: 2, // Solomon Islands
  TO: 2, // Tonga
  TV: 2, // Tuvalu
  VU: 2, // Vanuatu
  // North America
  CA: 2, // Canada
  MX: 2, // Mexico
  US: 2, // United States
  // Central America
  BZ: 2, // Belize
  CR: 2, // Costa Rica
  SV: 2, // El Salvador
  GT: 2, // Guatemala
  HN: 2, // Honduras
  NI: 2, // Nicaragua
  PA: 2, // Panama
  // Caribbean
  AG: 2, // Antigua and Barbuda
  BS: 2, // Bahamas
  BB: 2, // Barbados
  CU: 2, // Cuba
  DM: 2, // Dominica
  DO: 2, // Dominican Republic
  GD: 2, // Grenada
  HT: 2, // Haiti
  JM: 2, // Jamaica
  KN: 2, // Saint Kitts and Nevis
  LC: 2, // Saint Lucia
  VC: 2, // Saint Vincent and the Grenadines
  TT: 2, // Trinidad and Tobago
  // Middle East
  BH: 2, // Bahrain
  IR: 2, // Iran
  IQ: 2, // Iraq
  IL: 2, // Israel
  JO: 2, // Jordan
  KW: 2, // Kuwait
  LB: 2, // Lebanon
  OM: 2, // Oman
  PS: 2, // Palestine
  QA: 2, // Qatar
  SA: 2, // Saudi Arabia
  SY: 2, // Syria
  AE: 2, // United Arab Emirates
  YE: 2, // Yemen

  // ── Zone 3: Europe & CIS ──────────────────────────────────────────────────
  AL: 3, // Albania
  AD: 3, // Andorra
  AM: 3, // Armenia
  AT: 3, // Austria
  AZ: 3, // Azerbaijan
  BY: 3, // Belarus
  BE: 3, // Belgium
  BA: 3, // Bosnia and Herzegovina
  BG: 3, // Bulgaria
  HR: 3, // Croatia
  CY: 3, // Cyprus
  CZ: 3, // Czech Republic
  DK: 3, // Denmark
  EE: 3, // Estonia
  FI: 3, // Finland
  FR: 3, // France
  GE: 3, // Georgia
  DE: 3, // Germany
  GR: 3, // Greece
  HU: 3, // Hungary
  IS: 3, // Iceland
  IE: 3, // Ireland
  IT: 3, // Italy
  KZ: 3, // Kazakhstan
  XK: 3, // Kosovo
  KG: 3, // Kyrgyzstan
  LV: 3, // Latvia
  LI: 3, // Liechtenstein
  LT: 3, // Lithuania
  LU: 3, // Luxembourg
  MT: 3, // Malta
  MD: 3, // Moldova
  MC: 3, // Monaco
  ME: 3, // Montenegro
  NL: 3, // Netherlands
  MK: 3, // North Macedonia
  NO: 3, // Norway
  PL: 3, // Poland
  PT: 3, // Portugal
  RO: 3, // Romania
  RU: 3, // Russia
  SM: 3, // San Marino
  RS: 3, // Serbia
  SK: 3, // Slovakia
  SI: 3, // Slovenia
  ES: 3, // Spain
  SE: 3, // Sweden
  CH: 3, // Switzerland
  TJ: 3, // Tajikistan
  TR: 3, // Turkey
  TM: 3, // Turkmenistan
  UA: 3, // Ukraine
  GB: 3, // United Kingdom
  UZ: 3, // Uzbekistan
  VA: 3, // Vatican City

  // ── Zone 4: South America, Africa, Other ──────────────────────────────────
  // South America
  AR: 4, // Argentina
  BO: 4, // Bolivia
  BR: 4, // Brazil
  CL: 4, // Chile
  CO: 4, // Colombia
  EC: 4, // Ecuador
  GY: 4, // Guyana
  PY: 4, // Paraguay
  PE: 4, // Peru
  SR: 4, // Suriname
  UY: 4, // Uruguay
  VE: 4, // Venezuela
  // Africa
  DZ: 4, // Algeria
  AO: 4, // Angola
  BJ: 4, // Benin
  BW: 4, // Botswana
  BF: 4, // Burkina Faso
  BI: 4, // Burundi
  CV: 4, // Cape Verde
  CM: 4, // Cameroon
  CF: 4, // Central African Republic
  TD: 4, // Chad
  KM: 4, // Comoros
  CG: 4, // Republic of the Congo
  CD: 4, // DR Congo
  CI: 4, // Côte d'Ivoire
  DJ: 4, // Djibouti
  EG: 4, // Egypt
  GQ: 4, // Equatorial Guinea
  ER: 4, // Eritrea
  SZ: 4, // Eswatini
  ET: 4, // Ethiopia
  GA: 4, // Gabon
  GM: 4, // Gambia
  GH: 4, // Ghana
  GN: 4, // Guinea
  GW: 4, // Guinea-Bissau
  KE: 4, // Kenya
  LS: 4, // Lesotho
  LR: 4, // Liberia
  LY: 4, // Libya
  MG: 4, // Madagascar
  MW: 4, // Malawi
  ML: 4, // Mali
  MR: 4, // Mauritania
  MU: 4, // Mauritius
  MA: 4, // Morocco
  MZ: 4, // Mozambique
  NA: 4, // Namibia
  NE: 4, // Niger
  NG: 4, // Nigeria
  RW: 4, // Rwanda
  ST: 4, // São Tomé and Príncipe
  SN: 4, // Senegal
  SC: 4, // Seychelles
  SL: 4, // Sierra Leone
  SO: 4, // Somalia
  ZA: 4, // South Africa
  SS: 4, // South Sudan
  SD: 4, // Sudan
  TZ: 4, // Tanzania
  TG: 4, // Togo
  TN: 4, // Tunisia
  UG: 4, // Uganda
  ZM: 4, // Zambia
  ZW: 4, // Zimbabwe
}

// ─── Japan Post EMS Rates (JPY) ───────────────────────────────────────────────
// Source: Japan Post official EMS rate schedule
// Weight brackets in grams → price in JPY per zone

interface RateTier {
  maxWeight: number // grams (inclusive)
  zone1: number
  zone2: number
  zone3: number
  zone4: number
}

const EMS_RATE_TIERS: RateTier[] = [
  { maxWeight: 300,  zone1: 1400, zone2: 2000, zone3: 2400, zone4: 2700 },
  { maxWeight: 500,  zone1: 1550, zone2: 2200, zone3: 2700, zone4: 3000 },
  { maxWeight: 750,  zone1: 1700, zone2: 2500, zone3: 3000, zone4: 3400 },
  { maxWeight: 1000, zone1: 1900, zone2: 2800, zone3: 3400, zone4: 3800 },
  { maxWeight: 1250, zone1: 2150, zone2: 3150, zone3: 3900, zone4: 4350 },
  { maxWeight: 1500, zone1: 2350, zone2: 3500, zone3: 4300, zone4: 4850 },
  { maxWeight: 1750, zone1: 2600, zone2: 3850, zone3: 4750, zone4: 5350 },
  { maxWeight: 2000, zone1: 2850, zone2: 4200, zone3: 5200, zone4: 5850 },
  { maxWeight: 2500, zone1: 3300, zone2: 4950, zone3: 6100, zone4: 6850 },
  { maxWeight: 3000, zone1: 3750, zone2: 5700, zone3: 7000, zone4: 7850 },
  { maxWeight: 4000, zone1: 4650, zone2: 7200, zone3: 8800, zone4: 9850 },
  { maxWeight: 5000, zone1: 5550, zone2: 8700, zone3: 10600, zone4: 11850 },
  { maxWeight: 6000, zone1: 6450, zone2: 10200, zone3: 12400, zone4: 13850 },
  { maxWeight: 7000, zone1: 7350, zone2: 11700, zone3: 14200, zone4: 15850 },
  { maxWeight: 30000, zone1: 8250, zone2: 13200, zone3: 16000, zone4: 17850 }, // max ~30kg
]

const ZONE_DELIVERY_DAYS: Record<ShippingZone, string> = {
  1: '3–7 business days',
  2: '5–10 business days',
  3: '6–12 business days',
  4: '7–14 business days',
}

// Estimated shipped weight per vinyl format (grams)
const FORMAT_WEIGHTS: Record<string, number> = {
  LP: 400,
  '2xLP': 650,
  '3xLP': 900,
  '12"': 300,
  '10"': 250,
  '7"': 180,
  Single: 180,
  EP: 250,
  default: 400,
}

export function getFormatWeight(format: string): number {
  for (const [key, weight] of Object.entries(FORMAT_WEIGHTS)) {
    if (format.toLowerCase().includes(key.toLowerCase())) return weight
  }
  return FORMAT_WEIGHTS.default
}

export function getShippingZone(countryCode: string): ShippingZone | null {
  return COUNTRY_ZONES[countryCode.toUpperCase()] || null
}

export function calculateEmsRate(
  weightGrams: number,
  zone: ShippingZone
): number {
  const tier = EMS_RATE_TIERS.find((t) => weightGrams <= t.maxWeight)
  if (!tier) {
    // Over 30kg — use max tier
    return EMS_RATE_TIERS[EMS_RATE_TIERS.length - 1][`zone${zone}` as keyof RateTier] as number
  }
  return tier[`zone${zone}` as keyof RateTier] as number
}

export function calculateShipping(
  items: { format: string }[],
  countryCode: string
): ShippingQuote | null {
  const zone = getShippingZone(countryCode)
  if (!zone) return null

  // Base packaging weight: 100g
  const baseWeight = 100
  const itemsWeight = items.reduce((total, item) => {
    return total + getFormatWeight(item.format || 'LP')
  }, 0)

  const totalWeight = baseWeight + itemsWeight
  const cost = calculateEmsRate(totalWeight, zone)

  return {
    cost,
    currency: 'JPY',
    service: 'Japan Post EMS (Express Mail Service)',
    estimatedDays: ZONE_DELIVERY_DAYS[zone],
    zone,
  }
}

export function getCountryList(): { code: string; name: string; zone: ShippingZone }[] {
  const countryNames: Record<string, string> = {
    AU: 'Australia', AT: 'Austria', BE: 'Belgium', BR: 'Brazil', CA: 'Canada',
    CN: 'China', DK: 'Denmark', EG: 'Egypt', FI: 'Finland', FR: 'France',
    DE: 'Germany', GH: 'Ghana', GR: 'Greece', HK: 'Hong Kong', HU: 'Hungary',
    IN: 'India', ID: 'Indonesia', IE: 'Ireland', IL: 'Israel', IT: 'Italy',
    JP: 'Japan', KE: 'Kenya', KR: 'South Korea', MY: 'Malaysia', MX: 'Mexico',
    NL: 'Netherlands', NZ: 'New Zealand', NG: 'Nigeria', NO: 'Norway',
    PH: 'Philippines', PL: 'Poland', PT: 'Portugal', RU: 'Russia',
    SA: 'Saudi Arabia', SG: 'Singapore', ZA: 'South Africa', ES: 'Spain',
    SE: 'Sweden', CH: 'Switzerland', TW: 'Taiwan', TH: 'Thailand',
    TN: 'Tunisia', TR: 'Turkey', UA: 'Ukraine', AE: 'United Arab Emirates',
    GB: 'United Kingdom', US: 'United States', VN: 'Vietnam',
    AR: 'Argentina', CL: 'Chile', CO: 'Colombia', CZ: 'Czech Republic',
    FJ: 'Fiji', BD: 'Bangladesh', BG: 'Bulgaria', HR: 'Croatia',
    EE: 'Estonia', GE: 'Georgia', IS: 'Iceland', KZ: 'Kazakhstan',
    LV: 'Latvia', LT: 'Lithuania', LU: 'Luxembourg', MA: 'Morocco',
    MU: 'Mauritius', PE: 'Peru', PK: 'Pakistan', RO: 'Romania',
    RS: 'Serbia', SK: 'Slovakia', SI: 'Slovenia', LK: 'Sri Lanka',
    TZ: 'Tanzania', UG: 'Uganda', UY: 'Uruguay', VE: 'Venezuela', ZM: 'Zambia',
  }

  return Object.entries(COUNTRY_ZONES)
    .map(([code, zone]) => ({
      code,
      name: countryNames[code] || code,
      zone,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

// This is a simplified address validation service
// In a real application, you would use a proper address validation API

export interface AddressValidationResult {
  valid: boolean
  formatted?: {
    street?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
  error?: string
}

export const countries = {
  US: {
    name: "United States",
    hasRealValidation: true,
    example: "90210",
  },
  CA: {
    name: "Canada",
    hasRealValidation: true,
    example: "V6B 4Y8",
  },
  UK: {
    name: "United Kingdom",
    hasRealValidation: true,
    example: "SW1A 1AA",
  },
  AU: {
    name: "Australia",
    hasRealValidation: false,
    example: "2000",
  },
  DE: {
    name: "Germany",
    hasRealValidation: false,
    example: "10115",
  },
  FR: {
    name: "France",
    hasReal: false,
    example: "75001",
  },
  JP: {
    name: "Japan",
    hasRealValidation: false,
    example: "100-0001",
  },
  BR: {
    name: "Brazil",
    hasRealValidation: false,
    example: "01000-000",
  },
  IN: {
    name: "India",
    hasRealValidation: false,
    example: "110001",
  },
  CN: {
    name: "China",
    hasRealValidation: false,
    example: "100000",
  },
  RU: {
    name: "Russia",
    hasRealValidation: false,
    example: "101000",
  },
  MX: {
    name: "Mexico",
    hasRealValidation: false,
    example: "01000",
  },
  ES: {
    name: "Spain",
    hasRealValidation: false,
    example: "28001",
  },
  IT: {
    name: "Italy",
    hasRealValidation: false,
    example: "00100",
  },
  NL: {
    name: "Netherlands",
    hasRealValidation: false,
    example: "1000 AA",
  },
  SE: {
    name: "Sweden",
    hasRealValidation: false,
    example: "111 22",
  },
  NO: {
    name: "Norway",
    hasRealValidation: false,
    example: "0001",
  },
  DK: {
    name: "Denmark",
    hasRealValidation: false,
    example: "1000",
  },
  FI: {
    name: "Finland",
    hasRealValidation: false,
    example: "00100",
  },
  PT: {
    name: "Portugal",
    hasRealValidation: false,
    example: "1000-001",
  },
  GR: {
    name: "Greece",
    hasRealValidation: false,
    example: "104 31",
  },
  IE: {
    name: "Ireland",
    hasRealValidation: false,
    example: "D01 F5P2",
  },
  PL: {
    name: "Poland",
    hasRealValidation: false,
    example: "00-001",
  },
  AT: {
    name: "Austria",
    hasRealValidation: false,
    example: "1010",
  },
  CH: {
    name: "Switzerland",
    hasRealValidation: false,
    example: "1000",
  },
  BE: {
    name: "Belgium",
    hasRealValidation: false,
    example: "1000",
  },
  SG: {
    name: "Singapore",
    hasRealValidation: false,
    example: "238839",
  },
  NZ: {
    name: "New Zealand",
    hasRealValidation: false,
    example: "1010",
  },
  ZA: {
    name: "South Africa",
    hasRealValidation: false,
    example: "2000",
  },
  AE: {
    name: "United Arab Emirates",
    hasRealValidation: false,
    example: "00000",
  },
  SA: {
    name: "Saudi Arabia",
    hasRealValidation: false,
    example: "12345",
  },
  KR: {
    name: "South Korea",
    hasRealValidation: false,
    example: "03051",
  },
  TW: {
    name: "Taiwan",
    hasRealValidation: false,
    example: "100",
  },
  HK: {
    name: "Hong Kong",
    hasRealValidation: false,
    example: "999077",
  },
  TH: {
    name: "Thailand",
    hasRealValidation: false,
    example: "10330",
  },
  MY: {
    name: "Malaysia",
    hasRealValidation: false,
    example: "50000",
  },
  ID: {
    name: "Indonesia",
    hasRealValidation: false,
    example: "10110",
  },
  PH: {
    name: "Philippines",
    hasRealValidation: false,
    example: "1000",
  },
  VN: {
    name: "Vietnam",
    hasRealValidation: false,
    example: "100000",
  },
  TR: {
    name: "Turkey",
    hasRealValidation: false,
    example: "34000",
  },
  IL: {
    name: "Israel",
    hasRealValidation: false,
    example: "9100000",
  },
  EG: {
    name: "Egypt",
    hasRealValidation: false,
    example: "11511",
  },
  NG: {
    name: "Nigeria",
    hasRealValidation: false,
    example: "100001",
  },
  KE: {
    name: "Kenya",
    hasRealValidation: false,
    example: "00100",
  },
  ZW: {
    name: "Zimbabwe",
    hasRealValidation: false,
    example: "00263",
  },
  GH: {
    name: "Ghana",
    hasRealValidation: false,
    example: "00233",
  },
  MA: {
    name: "Morocco",
    hasRealValidation: false,
    example: "10000",
  },
  DZ: {
    name: "Algeria",
    hasRealValidation: false,
    example: "16000",
  },
  TN: {
    name: "Tunisia",
    hasRealValidation: false,
    example: "1000",
  },
  AR: {
    name: "Argentina",
    hasRealValidation: false,
    example: "C1001AAA",
  },
  CL: {
    name: "Chile",
    hasRealValidation: false,
    example: "8320000",
  },
  CO: {
    name: "Colombia",
    hasRealValidation: false,
    example: "110111",
  },
  PE: {
    name: "Peru",
    hasRealValidation: false,
    example: "15001",
  },
  VE: {
    name: "Venezuela",
    hasRealValidation: false,
    example: "1010",
  },
  EC: {
    name: "Ecuador",
    hasRealValidation: false,
    example: "170515",
  },
  BO: {
    name: "Bolivia",
    hasRealValidation: false,
    example: "0000",
  },
  PY: {
    name: "Paraguay",
    hasRealValidation: false,
    example: "1101",
  },
  UY: {
    name: "Uruguay",
    hasRealValidation: false,
    example: "11000",
  },
  CR: {
    name: "Costa Rica",
    hasRealValidation: false,
    example: "10101",
  },
  PA: {
    name: "Panama",
    hasRealValidation: false,
    example: "0801",
  },
  DO: {
    name: "Dominican Republic",
    hasRealValidation: false,
    example: "10101",
  },
  JM: {
    name: "Jamaica",
    hasRealValidation: false,
    example: "JMAAW01",
  },
  TT: {
    name: "Trinidad and Tobago",
    hasRealValidation: false,
    example: "100001",
  },
  BS: {
    name: "Bahamas",
    hasRealValidation: false,
    example: "AB-1234",
  },
  BB: {
    name: "Barbados",
    hasRealValidation: false,
    example: "BB12345",
  },
  LC: {
    name: "Saint Lucia",
    hasRealValidation: false,
    example: "LC01 101",
  },
  GD: {
    name: "Grenada",
    hasRealValidation: false,
    example: "12345",
  },
  VC: {
    name: "Saint Vincent and the Grenadines",
    hasRealValidation: false,
    example: "VC0100",
  },
  AG: {
    name: "Antigua and Barbuda",
    hasRealValidation: false,
    example: "12345",
  },
  KN: {
    name: "Saint Kitts and Nevis",
    hasRealValidation: false,
    example: "KN 01234",
  },
  DM: {
    name: "Dominica",
    hasRealValidation: false,
    example: "12345",
  },
  BZ: {
    name: "Belize",
    hasRealValidation: false,
    example: "12345",
  },
  GT: {
    name: "Guatemala",
    hasRealValidation: false,
    example: "01001",
  },
  SV: {
    name: "El Salvador",
    hasRealValidation: false,
    example: "CP 1101",
  },
  HN: {
    name: "Honduras",
    hasRealValidation: false,
    example: "12345",
  },
  NI: {
    name: "Nicaragua",
    hasRealValidation: false,
    example: "12345",
  },
  CU: {
    name: "Cuba",
    hasRealValidation: false,
    example: "10100",
  },
  HT: {
    name: "Haiti",
    hasRealValidation: false,
    example: "HT1110",
  },
  PR: {
    name: "Puerto Rico",
    hasRealValidation: false,
    example: "00901",
  },
  GU: {
    name: "Guam",
    hasRealValidation: false,
    example: "96910",
  },
  VI: {
    name: "U.S. Virgin Islands",
    hasRealValidation: false,
    example: "00802",
  },
  MP: {
    name: "Northern Mariana Islands",
    hasRealValidation: false,
    example: "96950",
  },
  AS: {
    name: "American Samoa",
    hasRealValidation: false,
    example: "96799",
  },
  FM: {
    name: "Micronesia",
    hasRealValidation: false,
    example: "96941",
  },
  MH: {
    name: "Marshall Islands",
    hasRealValidation: false,
    example: "96960",
  },
  PW: {
    name: "Palau",
    hasRealValidation: false,
    example: "96939",
  },
  WS: {
    name: "Samoa",
    hasRealValidation: false,
    example: "WS1330",
  },
  TO: {
    name: "Tonga",
    hasRealValidation: false,
    example: "12345",
  },
  FJ: {
    name: "Fiji",
    hasRealValidation: false,
    example: "12345",
  },
  PG: {
    name: "Papua New Guinea",
    hasRealValidation: false,
    example: "111",
  },
  SB: {
    name: "Solomon Islands",
    hasRealValidation: false,
    example: "12345",
  },
  VU: {
    name: "Vanuatu",
    hasRealValidation: false,
    example: "12345",
  },
  KI: {
    name: "Kiribati",
    hasRealValidation: false,
    example: "12345",
  },
  TV: {
    name: "Tuvalu",
    hasRealValidation: false,
    example: "12345",
  },
  NR: {
    name: "Nauru",
    hasRealValidation: false,
    example: "12345",
  },
}

export interface AddressToValidate {
  street?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
}

export async function validateAddress(address: AddressToValidate): Promise<AddressValidationResult> {
  // Simulate network request
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Basic validation
  if (!address.postal_code || !address.city || !address.country) {
    return {
      valid: false,
      error: "Missing required fields",
    }
  }

  // Check if country is supported
  if (!countries[address.country as keyof typeof countries]) {
    return {
      valid: false,
      error: "Unsupported country",
    }
  }

  // For countries with "real" validation, perform more checks
  const country = countries[address.country as keyof typeof countries]
  if (country.hasRealValidation) {
    // Simulate postal code validation
    const postalCodeValid = validatePostalCode(address.postal_code, address.country)
    if (!postalCodeValid) {
      return {
        valid: false,
        error: `Invalid postal code format for ${country.name}`,
      }
    }
  }

  // Return success with formatted address
  return {
    valid: true,
    formatted: {
      street: formatStreet(address.street),
      city: formatCity(address.city),
      state: address.state,
      postal_code: formatPostalCode(address.postal_code, address.country),
      country: address.country,
    },
  }
}

// Helper functions for formatting
function formatStreet(street?: string): string | undefined {
  if (!street) return undefined
  // Capitalize first letter of each word
  return street
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

function formatCity(city?: string): string | undefined {
  if (!city) return undefined
  // Capitalize first letter of each word
  return city
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

function formatPostalCode(postalCode?: string, country?: string): string | undefined {
  if (!postalCode) return undefined

  // Format based on country
  switch (country) {
    case "US":
      // Format as 5-digit or 5+4 digit ZIP code
      if (postalCode.length === 5) {
        return postalCode
      } else if (postalCode.length === 9) {
        return `${postalCode.slice(0, 5)}-${postalCode.slice(5)}`
      }
      return postalCode
    case "CA":
      // Format as A1A 1A1
      if (postalCode.length === 6) {
        return `${postalCode.slice(0, 3)} ${postalCode.slice(3)}`
      }
      return postalCode
    case "UK":
      // Basic UK postcode formatting
      return postalCode.toUpperCase()
    default:
      return postalCode
  }
}

function validatePostalCode(postalCode?: string, country?: string): boolean {
  if (!postalCode || !country) return false

  // Validate based on country
  switch (country) {
    case "US":
      // US ZIP code: 5 digits or 5+4 digits
      return /^\d{5}(-\d{4})?$/.test(postalCode) || /^\d{9}$/.test(postalCode)
    case "CA":
      // Canadian postal code: A1A 1A1 or A1A1A1
      return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(postalCode)
    case "UK":
      // UK postcode: Basic validation
      return /^[A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}$/.test(postalCode)
    default:
      // For other countries, just check if it's not empty
      return postalCode.length > 0
  }
}

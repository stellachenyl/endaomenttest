// Mapping for 30 common countries
const countryCodeMapping: { [key: string]: string } = {
    'United States': 'USA',
    'Canada': 'CAN',
    'United Kingdom': 'GBR',
    'Germany': 'DEU',
    'France': 'FRA',
    'Australia': 'AUS',
    'India': 'IND',
    'Italy': 'ITA',
    'Spain': 'ESP',
    'Netherlands': 'NLD',
    'Belgium': 'BEL',
    'Japan': 'JPN',
    'China': 'CHN',
    'Brazil': 'BRA',
    'Mexico': 'MEX',
    'South Korea': 'KOR',
    'Russia': 'RUS',
    'Switzerland': 'CHE',
    'Sweden': 'SWE',
    'Norway': 'NOR',
    'Denmark': 'DNK',
    'Finland': 'FIN',
    'South Africa': 'ZAF',
    'New Zealand': 'NZL',
    'Singapore': 'SGP',
    'Argentina': 'ARG',
    'Poland': 'POL',
    'Austria': 'AUT',
    'Ireland': 'IRL',
  };
  
  export const convertCountryToCode = (countryName: string): string => {
    const countryCode = countryCodeMapping[countryName];
    if (countryCode) {
      return countryCode; // Return the mapped ISO Alpha-3 code
    }
  
    // If it's a valid ISO Alpha-3 code, return it directly
    if (Object.values(countryCodeMapping).includes(countryName)) {
      return countryName;
    }
  
    throw new Error('Invalid or unsupported country name/Alpha-3 code');
  };
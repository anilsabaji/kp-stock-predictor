/**
 * KP Astrology Engine for Stock Market Prediction
 * 
 * Implements the Krishnamurti Paddhati (KP) system with 5 levels:
 * L1: Planet (determines basic sentiment)
 * L2: Sign Lord (zodiac sign ruler)
 * L3: Star Lord (nakshatra ruler)
 * L4: Sub Lord (finer sub-division ruler)
 * L5: Prana Lord (finest sub-division ruler)
 * 
 * Uses Vimshottari Dasha proportions to divide the zodiac
 * 
 * MUMBAI COORDINATES (NSE Location - Bandra Kurla Complex):
 * Latitude:  19.0560° N
 * Longitude: 72.8470° E
 * Timezone:  IST (UTC+5:30)
 */

// Mumbai (NSE) geographic coordinates
const MUMBAI = {
  latitude: 19.0560,     // 19°03'22"N
  longitude: 72.8470,    // 72°50'49"E
  timezone: 5.5,         // IST = UTC+5:30
  name: 'Mumbai (NSE - Bandra Kurla Complex)',
  ayanamsa: 'Lahiri'    // KP uses Lahiri Ayanamsa
};

// 9 Planets used in KP system with their Vimshottari Dasha periods (years)
const PLANETS = {
  KETU: { id: 0, name: 'Ketu', years: 7, symbol: '☋' },
  VENUS: { id: 1, name: 'Venus', years: 20, symbol: '♀' },
  SUN: { id: 2, name: 'Sun', years: 6, symbol: '☉' },
  MOON: { id: 3, name: 'Moon', years: 10, symbol: '☽' },
  MARS: { id: 4, name: 'Mars', years: 7, symbol: '♂' },
  RAHU: { id: 5, name: 'Rahu', years: 18, symbol: '☊' },
  JUPITER: { id: 6, name: 'Jupiter', years: 16, symbol: '♃' },
  SATURN: { id: 7, name: 'Saturn', years: 19, symbol: '♄' },
  MERCURY: { id: 8, name: 'Mercury', years: 17, symbol: '☿' }
};

// Vimshottari Dasha sequence
const DASHA_SEQUENCE = ['KETU', 'VENUS', 'SUN', 'MOON', 'MARS', 'RAHU', 'JUPITER', 'SATURN', 'MERCURY'];
const TOTAL_DASHA_YEARS = 120;

// 12 Zodiac Signs with their rulers
const SIGNS = [
  { name: 'Aries', ruler: 'MARS', start: 0 },
  { name: 'Taurus', ruler: 'VENUS', start: 30 },
  { name: 'Gemini', ruler: 'MERCURY', start: 60 },
  { name: 'Cancer', ruler: 'MOON', start: 90 },
  { name: 'Leo', ruler: 'SUN', start: 120 },
  { name: 'Virgo', ruler: 'MERCURY', start: 150 },
  { name: 'Libra', ruler: 'VENUS', start: 180 },
  { name: 'Scorpio', ruler: 'MARS', start: 210 },
  { name: 'Sagittarius', ruler: 'JUPITER', start: 240 },
  { name: 'Capricorn', ruler: 'SATURN', start: 270 },
  { name: 'Aquarius', ruler: 'SATURN', start: 300 },
  { name: 'Pisces', ruler: 'JUPITER', start: 330 }
];

// 27 Nakshatras with their rulers (each spans 13°20' = 13.3333°)
const NAKSHATRAS = [
  { name: 'Ashwini', ruler: 'KETU' },
  { name: 'Bharani', ruler: 'VENUS' },
  { name: 'Krittika', ruler: 'SUN' },
  { name: 'Rohini', ruler: 'MOON' },
  { name: 'Mrigashira', ruler: 'MARS' },
  { name: 'Ardra', ruler: 'RAHU' },
  { name: 'Punarvasu', ruler: 'JUPITER' },
  { name: 'Pushya', ruler: 'SATURN' },
  { name: 'Ashlesha', ruler: 'MERCURY' },
  { name: 'Magha', ruler: 'KETU' },
  { name: 'Purva Phalguni', ruler: 'VENUS' },
  { name: 'Uttara Phalguni', ruler: 'SUN' },
  { name: 'Hasta', ruler: 'MOON' },
  { name: 'Chitra', ruler: 'MARS' },
  { name: 'Swati', ruler: 'RAHU' },
  { name: 'Vishakha', ruler: 'JUPITER' },
  { name: 'Anuradha', ruler: 'SATURN' },
  { name: 'Jyeshtha', ruler: 'MERCURY' },
  { name: 'Mula', ruler: 'KETU' },
  { name: 'Purva Ashadha', ruler: 'VENUS' },
  { name: 'Uttara Ashadha', ruler: 'SUN' },
  { name: 'Shravana', ruler: 'MOON' },
  { name: 'Dhanishta', ruler: 'MARS' },
  { name: 'Shatabhisha', ruler: 'RAHU' },
  { name: 'Purva Bhadrapada', ruler: 'JUPITER' },
  { name: 'Uttara Bhadrapada', ruler: 'SATURN' },
  { name: 'Revati', ruler: 'MERCURY' }
];

const NAKSHATRA_SPAN = 13 + 20/60; // 13°20' in decimal degrees

// Planetary nature for stock market (bullish/bearish tendencies)
const PLANET_NATURE = {
  KETU: { nature: 'volatile', weight: -0.3, description: 'Sudden moves, confusion' },
  VENUS: { nature: 'bullish', weight: 0.7, description: 'Luxury, gains, positive' },
  SUN: { nature: 'neutral_bullish', weight: 0.4, description: 'Authority, steady' },
  MOON: { nature: 'fluctuating', weight: 0.2, description: 'Emotional, volatile' },
  MARS: { nature: 'bearish', weight: -0.5, description: 'Aggressive selling, red' },
  RAHU: { nature: 'volatile_bullish', weight: 0.3, description: 'Unusual gains, manipulation' },
  JUPITER: { nature: 'bullish', weight: 0.8, description: 'Expansion, growth, green' },
  SATURN: { nature: 'bearish', weight: -0.6, description: 'Contraction, fear, slow' },
  MERCURY: { nature: 'neutral', weight: 0.1, description: 'Mixed signals, communication' }
};

/**
 * Calculate planetary positions using simplified astronomical formulas
 * For production use, this should use Swiss Ephemeris
 */
function calculatePlanetaryPositions(dateTime) {
  const JD = getJulianDay(dateTime);
  const T = (JD - 2451545.0) / 36525.0; // Julian centuries from J2000.0
  
  return {
    SUN: calcSunPosition(T),
    MOON: calcMoonPosition(T),
    MARS: calcMarsPosition(T),
    MERCURY: calcMercuryPosition(T),
    JUPITER: calcJupiterPosition(T),
    VENUS: calcVenusPosition(T),
    SATURN: calcSaturnPosition(T),
    RAHU: calcRahuPosition(T),
    KETU: calcKetuPosition(T)
  };
}

function getJulianDay(date) {
  const d = new Date(date);
  const Y = d.getUTCFullYear();
  const M = d.getUTCMonth() + 1;
  const D = d.getUTCDate() + d.getUTCHours()/24 + d.getUTCMinutes()/1440 + d.getUTCSeconds()/86400;
  
  let y = Y, m = M;
  if (M <= 2) { y -= 1; m += 12; }
  
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + D + B - 1524.5;
}

function normalizeDegrees(deg) {
  return ((deg % 360) + 360) % 360;
}

// Simplified planetary position calculations (mean anomaly based)
function calcSunPosition(T) {
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mrad = M * Math.PI / 180;
  const C = (1.914602 - 0.004817 * T) * Math.sin(Mrad) + 0.019993 * Math.sin(2*Mrad);
  return normalizeDegrees(L0 + C);
}

function calcMoonPosition(T) {
  const L = 218.3165 + 481267.8813 * T;
  const D = 297.8502 + 445267.1115 * T;
  const M = 357.5291 + 35999.0503 * T;
  const Mp = 134.9634 + 477198.8676 * T;
  const F = 93.2720 + 483202.0175 * T;
  
  const Drad = D * Math.PI / 180;
  const Mrad = M * Math.PI / 180;
  const Mprad = Mp * Math.PI / 180;
  const Frad = F * Math.PI / 180;
  
  let longitude = L 
    + 6.289 * Math.sin(Mprad)
    + 1.274 * Math.sin(2*Drad - Mprad)
    + 0.658 * Math.sin(2*Drad)
    + 0.214 * Math.sin(2*Mprad)
    - 0.186 * Math.sin(Mrad)
    - 0.114 * Math.sin(2*Frad);
    
  return normalizeDegrees(longitude);
}

function calcMarsPosition(T) {
  const L = 355.433 + 19140.2993 * T;
  const M = 19.373 + 19139.8585 * T;
  const Mrad = M * Math.PI / 180;
  const C = 10.691 * Math.sin(Mrad) + 0.623 * Math.sin(2*Mrad);
  return normalizeDegrees(L + C);
}

function calcMercuryPosition(T) {
  const L = 252.251 + 149472.6746 * T;
  const M = 174.795 + 149472.5153 * T;
  const Mrad = M * Math.PI / 180;
  const C = 23.440 * Math.sin(Mrad) + 2.9818 * Math.sin(2*Mrad);
  return normalizeDegrees(L + C);
}

function calcJupiterPosition(T) {
  const L = 34.351 + 3034.9057 * T;
  const M = 20.020 + 3034.6874 * T;
  const Mrad = M * Math.PI / 180;
  const C = 5.555 * Math.sin(Mrad) + 0.168 * Math.sin(2*Mrad);
  return normalizeDegrees(L + C);
}

function calcVenusPosition(T) {
  const L = 181.980 + 58517.8157 * T;
  const M = 50.416 + 58517.8039 * T;
  const Mrad = M * Math.PI / 180;
  const C = 0.776 * Math.sin(Mrad) + 0.0005 * Math.sin(2*Mrad);
  return normalizeDegrees(L + C);
}

function calcSaturnPosition(T) {
  const L = 50.077 + 1222.1138 * T;
  const M = 317.020 + 1222.1132 * T;
  const Mrad = M * Math.PI / 180;
  const C = 6.406 * Math.sin(Mrad) + 0.318 * Math.sin(2*Mrad);
  return normalizeDegrees(L + C);
}

function calcRahuPosition(T) {
  // Rahu (North Node) moves retrograde ~19.355° per year
  const longitude = 125.0445 - 1934.1362 * T;
  return normalizeDegrees(longitude);
}

function calcKetuPosition(T) {
  // Ketu is always 180° opposite to Rahu
  return normalizeDegrees(calcRahuPosition(T) + 180);
}

/**
 * Calculate Lahiri Ayanamsa for a given Julian Day
 * Ayanamsa is the precession offset between Tropical and Sidereal zodiac
 * KP Astrology uses Sidereal positions with Lahiri Ayanamsa
 */
function calculateLahiriAyanamsa(JD) {
  const T = (JD - 2451545.0) / 36525.0;
  // Lahiri ayanamsa formula (approximation)
  // Based on the standard: 23°51'39" on Jan 1, 2000
  const ayanamsa = 23.8611 + 0.013972 * (JD - 2451545.0) / 365.25;
  return ayanamsa;
}

/**
 * Calculate the Sidereal Time for a given date and location
 * This is crucial for determining the Ascendant (Lagna) at Mumbai
 */
function calculateSiderealTime(dateTime, longitude) {
  const JD = getJulianDay(dateTime);
  const T = (JD - 2451545.0) / 36525.0;
  
  // Greenwich Mean Sidereal Time (in degrees)
  let GMST = 280.46061837 + 360.98564736629 * (JD - 2451545.0) 
             + 0.000387933 * T * T 
             - T * T * T / 38710000.0;
  
  GMST = normalizeDegrees(GMST);
  
  // Local Sidereal Time = GMST + observer's longitude (east positive)
  const LST = normalizeDegrees(GMST + longitude);
  
  return LST; // in degrees
}

/**
 * Calculate the Ascendant (Lagna) for Mumbai using Placidus house system
 * KP Astrology specifically uses Placidus houses
 * 
 * @param {Date} dateTime - The date/time for calculation
 * @param {number} lat - Latitude in degrees (default: Mumbai)
 * @param {number} lng - Longitude in degrees (default: Mumbai)
 * @returns {number} Tropical Ascendant in degrees
 */
function calculateAscendant(dateTime, lat = MUMBAI.latitude, lng = MUMBAI.longitude) {
  const LST = calculateSiderealTime(dateTime, lng);
  const LSTrad = LST * Math.PI / 180;
  const latRad = lat * Math.PI / 180;
  
  // Obliquity of the ecliptic
  const JD = getJulianDay(dateTime);
  const T = (JD - 2451545.0) / 36525.0;
  const epsilon = 23.4393 - 0.0130 * T; // degrees
  const epsRad = epsilon * Math.PI / 180;
  
  // Ascendant formula (Placidus)
  // tan(ASC) = cos(LST) / -(sin(epsilon) * tan(lat) + cos(epsilon) * sin(LST))
  const numerator = Math.cos(LSTrad);
  const denominator = -(Math.sin(epsRad) * Math.tan(latRad) + Math.cos(epsRad) * Math.sin(LSTrad));
  
  let ascendant = Math.atan2(numerator, denominator) * 180 / Math.PI;
  ascendant = normalizeDegrees(ascendant);
  
  return ascendant;
}

/**
 * Calculate Sidereal Ascendant (subtract Ayanamsa for KP)
 */
function calculateSiderealAscendant(dateTime, lat = MUMBAI.latitude, lng = MUMBAI.longitude) {
  const tropicalAsc = calculateAscendant(dateTime, lat, lng);
  const JD = getJulianDay(dateTime);
  const ayanamsa = calculateLahiriAyanamsa(JD);
  return normalizeDegrees(tropicalAsc - ayanamsa);
}

/**
 * Calculate all 12 Placidus House Cusps for Mumbai
 * KP uses Placidus house system exclusively
 * 
 * @param {Date} dateTime - The date/time for calculation
 * @returns {Object} All 12 house cusps with their KP levels
 */
function calculateHouseCusps(dateTime, lat = MUMBAI.latitude, lng = MUMBAI.longitude) {
  const JD = getJulianDay(dateTime);
  const ayanamsa = calculateLahiriAyanamsa(JD);
  const ascendant = calculateAscendant(dateTime, lat, lng);
  
  // Simplified Placidus house calculation
  // MC (Midheaven / 10th house cusp)
  const LST = calculateSiderealTime(dateTime, lng);
  const LSTrad = LST * Math.PI / 180;
  const T = (JD - 2451545.0) / 36525.0;
  const epsilon = 23.4393 - 0.0130 * T;
  const epsRad = epsilon * Math.PI / 180;
  
  // MC = atan(tan(LST) / cos(epsilon))
  let MC = Math.atan2(Math.sin(LSTrad), Math.cos(LSTrad) * Math.cos(epsRad)) * 180 / Math.PI;
  MC = normalizeDegrees(MC);
  
  // For Placidus, intermediate cusps are calculated by time-based trisection
  // Simplified: use equal division between IC-Asc-MC-Desc with adjustments
  const IC = normalizeDegrees(MC + 180);
  const DESC = normalizeDegrees(ascendant + 180);
  
  // Trisect arcs for intermediate houses
  const cusps = new Array(12);
  cusps[0] = ascendant;           // 1st house (Ascendant/Lagna)
  cusps[9] = MC;                  // 10th house (MC)
  cusps[6] = DESC;                // 7th house (Descendant)
  cusps[3] = IC;                  // 4th house (IC)
  
  // Trisect between IC and Ascendant for houses 2 and 3
  const icToAsc = normalizeDegrees(ascendant - IC);
  cusps[1] = normalizeDegrees(IC + icToAsc / 3);          // 2nd house
  cusps[2] = normalizeDegrees(IC + 2 * icToAsc / 3);      // 3rd house
  
  // Trisect between Ascendant and MC for houses 11 and 12
  const ascToMC = normalizeDegrees(MC - ascendant);
  cusps[10] = normalizeDegrees(ascendant + ascToMC / 3);   // 11th house
  cusps[11] = normalizeDegrees(ascendant + 2 * ascToMC / 3); // 12th house
  
  // Trisect between MC and Descendant for houses 8 and 9
  const mcToDesc = normalizeDegrees(DESC - MC);
  cusps[7] = normalizeDegrees(MC + mcToDesc / 3);          // 8th house
  cusps[8] = normalizeDegrees(MC + 2 * mcToDesc / 3);      // 9th house
  
  // Trisect between Descendant and IC for houses 5 and 6
  const descToIC = normalizeDegrees(IC + 360 - DESC);
  cusps[4] = normalizeDegrees(DESC + descToIC / 3);        // 5th house
  cusps[5] = normalizeDegrees(DESC + 2 * descToIC / 3);    // 6th house
  
  // Convert to Sidereal and get KP levels for each cusp
  const houseCuspsData = cusps.map((tropCusp, idx) => {
    const siderealCusp = normalizeDegrees(tropCusp - ayanamsa);
    const levels = getKPLevels(siderealCusp);
    const signIndex = Math.floor(siderealCusp / 30);
    const nakshatraIndex = Math.floor(siderealCusp / NAKSHATRA_SPAN) % 27;
    
    return {
      house: idx + 1,
      tropicalDegree: tropCusp.toFixed(4),
      siderealDegree: siderealCusp.toFixed(4),
      sign: SIGNS[signIndex].name,
      nakshatra: NAKSHATRAS[nakshatraIndex].name,
      signLord: PLANETS[levels.L2_SignLord].name,
      starLord: PLANETS[levels.L3_StarLord].name,
      subLord: PLANETS[levels.L4_SubLord].name,
      pranaLord: PLANETS[levels.L5_PranaLord].name,
      levels
    };
  });
  
  return houseCuspsData;
}

/**
 * Calculate Mumbai-specific daily transit report
 * Shows all planets' positions relative to Mumbai's sky with house placements
 * 
 * @param {string|Date} date - Target date
 * @returns {Object} Complete Mumbai transit analysis
 */
function calculateMumbaiDailyTransit(date) {
  const targetDate = new Date(date);
  
  // Calculate for multiple key times during market day (IST)
  const marketTimes = [
    { label: 'Pre-Market (8:30 IST)', hour: 3, minute: 0 },    // 8:30 IST = 3:00 UTC
    { label: 'Market Open (9:15 IST)', hour: 3, minute: 45 },   // 9:15 IST = 3:45 UTC
    { label: 'Mid-Morning (10:30 IST)', hour: 5, minute: 0 },   // 10:30 IST = 5:00 UTC
    { label: 'Noon (12:00 IST)', hour: 6, minute: 30 },         // 12:00 IST = 6:30 UTC
    { label: 'Afternoon (14:00 IST)', hour: 8, minute: 30 },    // 14:00 IST = 8:30 UTC
    { label: 'Market Close (15:30 IST)', hour: 10, minute: 0 }, // 15:30 IST = 10:00 UTC
    { label: 'Post-Market (16:00 IST)', hour: 10, minute: 30 }  // 16:00 IST = 10:30 UTC
  ];
  
  const transitReport = marketTimes.map(mt => {
    const dateTime = new Date(targetDate);
    dateTime.setUTCHours(mt.hour, mt.minute, 0, 0);
    
    const positions = calculatePlanetaryPositions(dateTime);
    const JD = getJulianDay(dateTime);
    const ayanamsa = calculateLahiriAyanamsa(JD);
    
    // Sidereal Ascendant for Mumbai
    const siderealAsc = calculateSiderealAscendant(dateTime);
    const ascLevels = getKPLevels(siderealAsc);
    
    // House cusps
    const houses = calculateHouseCusps(dateTime);
    
    // Planet positions with house placements
    const planetTransits = {};
    for (const [planet, tropLong] of Object.entries(positions)) {
      const sidLong = normalizeDegrees(tropLong - ayanamsa);
      const levels = getKPLevels(sidLong);
      levels.L1_Planet = planet;
      const signIndex = Math.floor(sidLong / 30);
      const nakshatraIndex = Math.floor(sidLong / NAKSHATRA_SPAN) % 27;
      
      // Determine which house this planet occupies
      let houseNum = 1;
      for (let h = 0; h < 12; h++) {
        const nextH = (h + 1) % 12;
        const cuspStart = parseFloat(houses[h].siderealDegree);
        const cuspEnd = parseFloat(houses[nextH].siderealDegree);
        
        if (cuspEnd > cuspStart) {
          if (sidLong >= cuspStart && sidLong < cuspEnd) { houseNum = h + 1; break; }
        } else {
          // Wraps around 360°
          if (sidLong >= cuspStart || sidLong < cuspEnd) { houseNum = h + 1; break; }
        }
      }
      
      planetTransits[planet] = {
        tropicalLongitude: tropLong.toFixed(4),
        siderealLongitude: sidLong.toFixed(4),
        sign: SIGNS[signIndex].name,
        nakshatra: NAKSHATRAS[nakshatraIndex].name,
        house: houseNum,
        levels: {
          signLord: PLANETS[levels.L2_SignLord].name,
          starLord: PLANETS[levels.L3_StarLord].name,
          subLord: PLANETS[levels.L4_SubLord].name,
          pranaLord: PLANETS[levels.L5_PranaLord].name
        },
        nature: PLANET_NATURE[planet],
        symbol: PLANETS[planet].symbol,
        score: calculateKPScore(levels).toFixed(4)
      };
    }
    
    return {
      time: mt.label,
      dateTimeUTC: dateTime.toISOString(),
      ascendant: {
        siderealDegree: siderealAsc.toFixed(4),
        sign: SIGNS[Math.floor(siderealAsc / 30)].name,
        nakshatra: NAKSHATRAS[Math.floor(siderealAsc / NAKSHATRA_SPAN) % 27].name,
        signLord: PLANETS[ascLevels.L2_SignLord].name,
        starLord: PLANETS[ascLevels.L3_StarLord].name,
        subLord: PLANETS[ascLevels.L4_SubLord].name,
        pranaLord: PLANETS[ascLevels.L5_PranaLord].name
      },
      planets: planetTransits,
      houses: houses.slice(0, 6) // First 6 houses (most relevant for stock)
    };
  });
  
  // Calculate day-level aggregate score
  const dayScores = transitReport.map(tr => {
    let totalScore = 0;
    let count = 0;
    for (const [, pData] of Object.entries(tr.planets)) {
      totalScore += parseFloat(pData.score);
      count++;
    }
    return totalScore / count;
  });
  const avgDayScore = dayScores.reduce((a, b) => a + b, 0) / dayScores.length;
  
  // Identify key transits affecting stock market
  const marketRelevantHouses = [2, 5, 6, 10, 11]; // Wealth, speculation, debts, career, gains
  const keyTransits = [];
  
  const marketOpenData = transitReport[1]; // Market open snapshot
  for (const [planet, pData] of Object.entries(marketOpenData.planets)) {
    if (marketRelevantHouses.includes(pData.house)) {
      keyTransits.push({
        planet: PLANETS[planet].name,
        symbol: PLANETS[planet].symbol,
        house: pData.house,
        houseSignificance: getHouseSignificance(pData.house),
        sign: pData.sign,
        nakshatra: pData.nakshatra,
        nature: pData.nature.nature,
        impact: pData.nature.weight > 0 ? 'POSITIVE' : pData.nature.weight < 0 ? 'NEGATIVE' : 'MIXED'
      });
    }
  }
  
  return {
    location: MUMBAI,
    date: targetDate.toISOString().split('T')[0],
    ayanamsa: calculateLahiriAyanamsa(getJulianDay(targetDate)).toFixed(4),
    dailySentiment: avgDayScore > 0.15 ? 'BULLISH' : avgDayScore < -0.15 ? 'BEARISH' : 'NEUTRAL',
    dailyScore: avgDayScore.toFixed(4),
    keyTransits,
    transitReport
  };
}

/**
 * Get house significance for stock market
 */
function getHouseSignificance(house) {
  const significances = {
    1: 'Self/Market sentiment',
    2: 'Wealth/Finance accumulation',
    3: 'Communication/Short-term moves',
    4: 'Property/Stability/Fixed assets',
    5: 'Speculation/Creativity/Trading gains',
    6: 'Debts/Obstacles/Service sector',
    7: 'Partnerships/Contracts/Trade',
    8: 'Sudden events/Hidden matters/Losses',
    9: 'Fortune/Long-term growth',
    10: 'Career/Status/Market leadership',
    11: 'Gains/Income/Fulfillment of desires',
    12: 'Losses/Expenses/Foreign markets'
  };
  return significances[house] || 'General';
}

/**
 * Generate enhanced minute-level predictions using Mumbai transit
 * Incorporates proper Mumbai Ascendant via Placidus for each minute
 */
function generateMumbaiMinutePredictions(date, startHour = 9, endHour = 15, intervalMinutes = 5) {
  const predictions = [];
  const baseDate = new Date(date);
  const JD = getJulianDay(baseDate);
  const ayanamsa = calculateLahiriAyanamsa(JD);
  
  for (let hour = startHour; hour <= endHour; hour++) {
    const maxMin = (hour === endHour) ? 30 : 60;
    for (let minute = 0; minute < maxMin; minute += intervalMinutes) {
      const dateTime = new Date(baseDate);
      // Convert IST to UTC: IST hour - 5:30
      const utcHour = hour - 5;
      const utcMinute = minute - 30;
      dateTime.setUTCHours(utcHour, utcMinute, 0, 0);
      
      const positions = calculatePlanetaryPositions(dateTime);
      
      // Calculate proper Mumbai Ascendant (Sidereal)
      const siderealAsc = calculateSiderealAscendant(dateTime);
      const ascLevels = getKPLevels(siderealAsc);
      ascLevels.L1_Planet = getSignLord(siderealAsc);
      
      // Moon sidereal position (primary KP timer)
      const moonSidereal = normalizeDegrees(positions.MOON - ayanamsa);
      const moonLevels = getKPLevels(moonSidereal);
      moonLevels.L1_Planet = 'MOON';
      
      // Calculate house cusps for this moment
      const houses = calculateHouseCusps(dateTime);
      
      // Determine Moon's house
      let moonHouse = 1;
      for (let h = 0; h < 12; h++) {
        const nextH = (h + 1) % 12;
        const cuspStart = parseFloat(houses[h].siderealDegree);
        const cuspEnd = parseFloat(houses[nextH].siderealDegree);
        if (cuspEnd > cuspStart) {
          if (moonSidereal >= cuspStart && moonSidereal < cuspEnd) { moonHouse = h + 1; break; }
        } else {
          if (moonSidereal >= cuspStart || moonSidereal < cuspEnd) { moonHouse = h + 1; break; }
        }
      }
      
      // Enhanced scoring: factor in Moon's house position for market
      const moonHouseBonus = getMoonHouseBonus(moonHouse);
      
      // Consider other transiting planet aspects to Ascendant
      let transitAspectScore = 0;
      for (const [planet, tropLong] of Object.entries(positions)) {
        if (planet === 'MOON') continue;
        const sidLong = normalizeDegrees(tropLong - ayanamsa);
        const diff = Math.abs(sidLong - siderealAsc);
        const normalizedDiff = Math.min(diff, 360 - diff);
        
        // Check major aspects to Ascendant
        if (normalizedDiff < 5) { // Conjunction
          transitAspectScore += PLANET_NATURE[planet].weight * 0.3;
        } else if (Math.abs(normalizedDiff - 120) < 5) { // Trine
          transitAspectScore += PLANET_NATURE[planet].weight * 0.2;
        } else if (Math.abs(normalizedDiff - 90) < 5) { // Square
          transitAspectScore -= PLANET_NATURE[planet].weight * 0.15;
        } else if (Math.abs(normalizedDiff - 180) < 5) { // Opposition
          transitAspectScore -= PLANET_NATURE[planet].weight * 0.1;
        }
      }
      
      const moonScore = calculateKPScore(moonLevels);
      const ascScore = calculateKPScore(ascLevels);
      const compositeScore = (moonScore * 0.40 + ascScore * 0.30 + moonHouseBonus * 0.15 + transitAspectScore * 0.15);
      
      // Determine signal
      let signal = 'NEUTRAL';
      if (compositeScore > 0.3) signal = 'STRONG_BUY';
      else if (compositeScore > 0.1) signal = 'BUY';
      else if (compositeScore < -0.3) signal = 'STRONG_SELL';
      else if (compositeScore < -0.1) signal = 'SELL';
      
      predictions.push({
        time: dateTime.toISOString(),
        istTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} IST`,
        hour,
        minute,
        location: 'Mumbai',
        moonPosition: moonSidereal.toFixed(4),
        moonHouse,
        moonHouseSignificance: getHouseSignificance(moonHouse),
        ascendantPosition: siderealAsc.toFixed(4),
        ascendantSign: SIGNS[Math.floor(siderealAsc / 30)].name,
        moonLevels: {
          planet: PLANETS.MOON.symbol + ' Moon',
          signLord: PLANETS[moonLevels.L2_SignLord].symbol + ' ' + PLANETS[moonLevels.L2_SignLord].name,
          starLord: PLANETS[moonLevels.L3_StarLord].symbol + ' ' + PLANETS[moonLevels.L3_StarLord].name,
          subLord: PLANETS[moonLevels.L4_SubLord].symbol + ' ' + PLANETS[moonLevels.L4_SubLord].name,
          pranaLord: PLANETS[moonLevels.L5_PranaLord].symbol + ' ' + PLANETS[moonLevels.L5_PranaLord].name
        },
        ascLevels: {
          planet: PLANETS[ascLevels.L1_Planet].symbol + ' ' + PLANETS[ascLevels.L1_Planet].name,
          signLord: PLANETS[ascLevels.L2_SignLord].symbol + ' ' + PLANETS[ascLevels.L2_SignLord].name,
          starLord: PLANETS[ascLevels.L3_StarLord].symbol + ' ' + PLANETS[ascLevels.L3_StarLord].name,
          subLord: PLANETS[ascLevels.L4_SubLord].symbol + ' ' + PLANETS[ascLevels.L4_SubLord].name,
          pranaLord: PLANETS[ascLevels.L5_PranaLord].symbol + ' ' + PLANETS[ascLevels.L5_PranaLord].name
        },
        transitAspectScore: transitAspectScore.toFixed(4),
        moonHouseBonus: moonHouseBonus.toFixed(4),
        score: compositeScore.toFixed(4),
        signal,
        rawMoonLevels: moonLevels,
        rawAscLevels: ascLevels
      });
    }
  }
  
  return predictions;
}

/**
 * Moon's house position bonus/penalty for stock market
 * Houses 2, 5, 10, 11 are benefic for financial gains
 * Houses 6, 8, 12 are malefic for financial matters
 */
function getMoonHouseBonus(house) {
  const houseScores = {
    1: 0.1,    // Neutral - market sentiment
    2: 0.5,    // Wealth accumulation - very positive
    3: 0.1,    // Short-term communication
    4: 0.0,    // Stability - neutral
    5: 0.6,    // Speculation/Trading - very positive
    6: -0.3,   // Debts/Obstacles - negative
    7: 0.2,    // Partnerships - mildly positive
    8: -0.5,   // Sudden losses - negative
    9: 0.3,    // Fortune - positive
    10: 0.5,   // Career/Status - very positive
    11: 0.7,   // Gains/Income - most positive
    12: -0.6   // Losses/Expenses - most negative
  };
  return houseScores[house] || 0;
}

/**
 * Get the Sign Lord for a given longitude
 */
function getSignLord(longitude) {
  const signIndex = Math.floor(longitude / 30);
  return SIGNS[signIndex].ruler;
}

/**
 * Get the Star Lord (Nakshatra Lord) for a given longitude
 */
function getStarLord(longitude) {
  const nakshatraIndex = Math.floor(longitude / NAKSHATRA_SPAN);
  return NAKSHATRAS[nakshatraIndex % 27].ruler;
}

/**
 * Get the Sub Lord for a given longitude
 * Each nakshatra is divided into 9 sub-divisions proportional to dasha periods
 */
function getSubLord(longitude) {
  const nakshatraIndex = Math.floor(longitude / NAKSHATRA_SPAN);
  const posInNakshatra = longitude - (nakshatraIndex * NAKSHATRA_SPAN);
  
  // Start from the star lord's position in the dasha sequence
  const starLordName = NAKSHATRAS[nakshatraIndex % 27].ruler;
  const startIdx = DASHA_SEQUENCE.indexOf(starLordName);
  
  let accumulated = 0;
  for (let i = 0; i < 9; i++) {
    const planetName = DASHA_SEQUENCE[(startIdx + i) % 9];
    const proportion = PLANETS[planetName].years / TOTAL_DASHA_YEARS;
    const subSpan = NAKSHATRA_SPAN * proportion;
    accumulated += subSpan;
    if (posInNakshatra < accumulated) {
      return planetName;
    }
  }
  return starLordName; // Fallback
}

/**
 * Get the Sub-Sub Lord (L4) for a given longitude
 * Further division of sub into 9 parts proportional to dasha periods
 */
function getSubSubLord(longitude) {
  const nakshatraIndex = Math.floor(longitude / NAKSHATRA_SPAN);
  const posInNakshatra = longitude - (nakshatraIndex * NAKSHATRA_SPAN);
  
  const starLordName = NAKSHATRAS[nakshatraIndex % 27].ruler;
  const startIdx = DASHA_SEQUENCE.indexOf(starLordName);
  
  // Find sub-lord first
  let accumulated = 0;
  let subStart = 0;
  let subLordIdx = 0;
  for (let i = 0; i < 9; i++) {
    const planetName = DASHA_SEQUENCE[(startIdx + i) % 9];
    const proportion = PLANETS[planetName].years / TOTAL_DASHA_YEARS;
    const subSpan = NAKSHATRA_SPAN * proportion;
    if (posInNakshatra < accumulated + subSpan) {
      subStart = accumulated;
      subLordIdx = (startIdx + i) % 9;
      break;
    }
    accumulated += subSpan;
  }
  
  // Now divide the sub-lord segment into 9 sub-sub parts
  const posInSub = posInNakshatra - subStart;
  const subLordPlanet = DASHA_SEQUENCE[subLordIdx];
  const subSpan = NAKSHATRA_SPAN * (PLANETS[subLordPlanet].years / TOTAL_DASHA_YEARS);
  
  let subSubAccumulated = 0;
  for (let i = 0; i < 9; i++) {
    const planetName = DASHA_SEQUENCE[(subLordIdx + i) % 9];
    const proportion = PLANETS[planetName].years / TOTAL_DASHA_YEARS;
    const subSubSpan = subSpan * proportion;
    subSubAccumulated += subSubSpan;
    if (posInSub < subSubAccumulated) {
      return planetName;
    }
  }
  return subLordPlanet;
}

/**
 * Get the Prana Lord (L5) for a given longitude
 * Finest division - divides sub-sub into 9 further parts
 */
function getPranaLord(longitude) {
  const nakshatraIndex = Math.floor(longitude / NAKSHATRA_SPAN);
  const posInNakshatra = longitude - (nakshatraIndex * NAKSHATRA_SPAN);
  
  const starLordName = NAKSHATRAS[nakshatraIndex % 27].ruler;
  const startIdx = DASHA_SEQUENCE.indexOf(starLordName);
  
  // Find sub-lord
  let accumulated = 0;
  let subStart = 0;
  let subLordIdx = 0;
  for (let i = 0; i < 9; i++) {
    const planetName = DASHA_SEQUENCE[(startIdx + i) % 9];
    const proportion = PLANETS[planetName].years / TOTAL_DASHA_YEARS;
    const subSpan = NAKSHATRA_SPAN * proportion;
    if (posInNakshatra < accumulated + subSpan) {
      subStart = accumulated;
      subLordIdx = (startIdx + i) % 9;
      break;
    }
    accumulated += subSpan;
  }
  
  // Find sub-sub lord
  const posInSub = posInNakshatra - subStart;
  const subLordPlanet = DASHA_SEQUENCE[subLordIdx];
  const subSpan = NAKSHATRA_SPAN * (PLANETS[subLordPlanet].years / TOTAL_DASHA_YEARS);
  
  let subSubAccumulated = 0;
  let subSubStart = 0;
  let subSubLordIdx = 0;
  for (let i = 0; i < 9; i++) {
    const planetName = DASHA_SEQUENCE[(subLordIdx + i) % 9];
    const proportion = PLANETS[planetName].years / TOTAL_DASHA_YEARS;
    const subSubSpan = subSpan * proportion;
    if (posInSub < subSubAccumulated + subSubSpan) {
      subSubStart = subSubAccumulated;
      subSubLordIdx = (subLordIdx + i) % 9;
      break;
    }
    subSubAccumulated += subSubSpan;
  }
  
  // Find prana lord within sub-sub
  const subSubPlanet = DASHA_SEQUENCE[subSubLordIdx];
  const subSubSpan2 = subSpan * (PLANETS[subSubPlanet].years / TOTAL_DASHA_YEARS);
  const posInSubSub = posInSub - subSubStart;
  
  let pranaAccumulated = 0;
  for (let i = 0; i < 9; i++) {
    const planetName = DASHA_SEQUENCE[(subSubLordIdx + i) % 9];
    const proportion = PLANETS[planetName].years / TOTAL_DASHA_YEARS;
    const pranaSpan = subSubSpan2 * proportion;
    pranaAccumulated += pranaSpan;
    if (posInSubSub < pranaAccumulated) {
      return planetName;
    }
  }
  return subSubPlanet;
}

/**
 * Get all 5 KP levels for a given longitude
 */
function getKPLevels(longitude) {
  return {
    L1_Planet: null, // Will be set from the actual planet
    L2_SignLord: getSignLord(longitude),
    L3_StarLord: getStarLord(longitude),
    L4_SubLord: getSubLord(longitude),
    L5_PranaLord: getPranaLord(longitude)
  };
}

/**
 * Calculate composite KP score for stock prediction
 * Uses weighted combination of all 5 levels
 */
function calculateKPScore(levels) {
  const weights = { L1: 0.10, L2: 0.15, L3: 0.25, L4: 0.30, L5: 0.20 };
  
  let score = 0;
  if (levels.L1_Planet) score += weights.L1 * PLANET_NATURE[levels.L1_Planet].weight;
  score += weights.L2 * PLANET_NATURE[levels.L2_SignLord].weight;
  score += weights.L3 * PLANET_NATURE[levels.L3_StarLord].weight;
  score += weights.L4 * PLANET_NATURE[levels.L4_SubLord].weight;
  score += weights.L5 * PLANET_NATURE[levels.L5_PranaLord].weight;
  
  return score;
}

/**
 * Generate minute-level KP prediction chart for a given date
 * Returns array of minute-by-minute predictions based on Moon's transit
 */
function generateMinutePredictions(date, startHour = 9, endHour = 15, intervalMinutes = 5) {
  const predictions = [];
  const baseDate = new Date(date);
  
  for (let hour = startHour; hour <= endHour; hour++) {
    const maxMin = (hour === endHour) ? 30 : 60; // Market closes at 15:30
    for (let minute = 0; minute < maxMin; minute += intervalMinutes) {
      const dateTime = new Date(baseDate);
      dateTime.setHours(hour, minute, 0, 0);
      
      const positions = calculatePlanetaryPositions(dateTime);
      
      // Moon is the primary timer in KP for intraday
      const moonLong = positions.MOON;
      const moonLevels = getKPLevels(moonLong);
      moonLevels.L1_Planet = 'MOON';
      
      // Also consider the Ascendant (approximation using time)
      // Ascendant moves ~1° every 4 minutes
      const minutesSinceSunrise = (hour - 6) * 60 + minute;
      const ascLong = normalizeDegrees(positions.SUN + minutesSinceSunrise * 0.25);
      const ascLevels = getKPLevels(ascLong);
      ascLevels.L1_Planet = getSignLord(ascLong);
      
      const moonScore = calculateKPScore(moonLevels);
      const ascScore = calculateKPScore(ascLevels);
      const compositeScore = (moonScore * 0.6 + ascScore * 0.4);
      
      // Determine trend signal
      let signal = 'NEUTRAL';
      if (compositeScore > 0.3) signal = 'STRONG_BUY';
      else if (compositeScore > 0.1) signal = 'BUY';
      else if (compositeScore < -0.3) signal = 'STRONG_SELL';
      else if (compositeScore < -0.1) signal = 'SELL';
      
      predictions.push({
        time: dateTime.toISOString(),
        hour,
        minute,
        moonPosition: moonLong.toFixed(4),
        ascendantPosition: ascLong.toFixed(4),
        moonLevels: {
          planet: PLANETS.MOON.symbol + ' Moon',
          signLord: PLANETS[moonLevels.L2_SignLord].symbol + ' ' + PLANETS[moonLevels.L2_SignLord].name,
          starLord: PLANETS[moonLevels.L3_StarLord].symbol + ' ' + PLANETS[moonLevels.L3_StarLord].name,
          subLord: PLANETS[moonLevels.L4_SubLord].symbol + ' ' + PLANETS[moonLevels.L4_SubLord].name,
          pranaLord: PLANETS[moonLevels.L5_PranaLord].symbol + ' ' + PLANETS[moonLevels.L5_PranaLord].name
        },
        ascLevels: {
          planet: PLANETS[ascLevels.L1_Planet].symbol + ' ' + PLANETS[ascLevels.L1_Planet].name,
          signLord: PLANETS[ascLevels.L2_SignLord].symbol + ' ' + PLANETS[ascLevels.L2_SignLord].name,
          starLord: PLANETS[ascLevels.L3_StarLord].symbol + ' ' + PLANETS[ascLevels.L3_StarLord].name,
          subLord: PLANETS[ascLevels.L4_SubLord].symbol + ' ' + PLANETS[ascLevels.L4_SubLord].name,
          pranaLord: PLANETS[ascLevels.L5_PranaLord].symbol + ' ' + PLANETS[ascLevels.L5_PranaLord].name
        },
        score: compositeScore.toFixed(4),
        signal,
        rawMoonLevels: moonLevels,
        rawAscLevels: ascLevels
      });
    }
  }
  
  return predictions;
}

/**
 * Generate company horoscope based on incorporation date
 */
function generateCompanyHoroscope(incorporationDate) {
  const date = new Date(incorporationDate + 'T12:00:00Z'); // Noon on incorporation date
  const positions = calculatePlanetaryPositions(date);
  
  const horoscope = {};
  for (const [planet, longitude] of Object.entries(positions)) {
    const levels = getKPLevels(longitude);
    levels.L1_Planet = planet;
    const signIndex = Math.floor(longitude / 30);
    const nakshatraIndex = Math.floor(longitude / NAKSHATRA_SPAN) % 27;
    
    horoscope[planet] = {
      longitude: longitude.toFixed(4),
      sign: SIGNS[signIndex].name,
      nakshatra: NAKSHATRAS[nakshatraIndex].name,
      levels,
      planetInfo: PLANETS[planet],
      score: calculateKPScore(levels).toFixed(4)
    };
  }
  
  return horoscope;
}

/**
 * Analyze transit influence on company natal chart
 */
function analyzeTransitOnNatal(transitDate, incorporationDate) {
  const natalPositions = calculatePlanetaryPositions(new Date(incorporationDate + 'T12:00:00Z'));
  const transitPositions = calculatePlanetaryPositions(transitDate);
  
  const aspects = [];
  const aspectAngles = [0, 60, 90, 120, 180]; // Conjunction, Sextile, Square, Trine, Opposition
  const aspectNames = ['Conjunction', 'Sextile', 'Square', 'Trine', 'Opposition'];
  const aspectNatures = ['strong', 'positive', 'challenging', 'positive', 'challenging'];
  const orb = 8; // Degrees of orb allowed
  
  for (const [tPlanet, tLong] of Object.entries(transitPositions)) {
    for (const [nPlanet, nLong] of Object.entries(natalPositions)) {
      for (let a = 0; a < aspectAngles.length; a++) {
        const diff = Math.abs(tLong - nLong);
        const normalizedDiff = Math.min(diff, 360 - diff);
        if (Math.abs(normalizedDiff - aspectAngles[a]) <= orb) {
          aspects.push({
            transitPlanet: tPlanet,
            natalPlanet: nPlanet,
            aspect: aspectNames[a],
            nature: aspectNatures[a],
            exactDegree: normalizedDiff.toFixed(2),
            orb: Math.abs(normalizedDiff - aspectAngles[a]).toFixed(2)
          });
        }
      }
    }
  }
  
  // Calculate overall transit score
  let transitScore = 0;
  for (const aspect of aspects) {
    const transitWeight = PLANET_NATURE[aspect.transitPlanet].weight;
    const multiplier = aspect.nature === 'positive' ? 1 : aspect.nature === 'challenging' ? -1 : 0.5;
    transitScore += transitWeight * multiplier * (1 - parseFloat(aspect.orb) / orb);
  }
  
  return {
    aspects: aspects.slice(0, 20), // Top 20 aspects
    transitScore: transitScore.toFixed(4),
    sentiment: transitScore > 0.5 ? 'BULLISH' : transitScore < -0.5 ? 'BEARISH' : 'NEUTRAL'
  };
}

module.exports = {
  PLANETS,
  SIGNS,
  NAKSHATRAS,
  PLANET_NATURE,
  MUMBAI,
  calculatePlanetaryPositions,
  getKPLevels,
  calculateKPScore,
  generateMinutePredictions,
  generateMumbaiMinutePredictions,
  generateCompanyHoroscope,
  analyzeTransitOnNatal,
  calculateMumbaiDailyTransit,
  calculateHouseCusps,
  calculateAscendant,
  calculateSiderealAscendant,
  calculateLahiriAyanamsa,
  getSignLord,
  getStarLord,
  getSubLord,
  getSubSubLord,
  getPranaLord,
  getHouseSignificance,
  getMoonHouseBonus
};

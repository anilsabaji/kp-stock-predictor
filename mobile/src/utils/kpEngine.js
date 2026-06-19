/**
 * KP Astrology Engine for Mobile App
 * Pure JavaScript implementation - no native dependencies
 * 
 * Mumbai (NSE) coordinates for transit calculations:
 * Latitude: 19.0560°N, Longitude: 72.8470°E, IST (UTC+5:30)
 */

export const MUMBAI = {
  latitude: 19.0560,
  longitude: 72.8470,
  timezone: 5.5,
  name: 'Mumbai (NSE - BKC)',
};

export const PLANETS = {
  KETU: { id: 0, name: 'Ketu', years: 7, symbol: '\u260B' },
  VENUS: { id: 1, name: 'Venus', years: 20, symbol: '\u2640' },
  SUN: { id: 2, name: 'Sun', years: 6, symbol: '\u2609' },
  MOON: { id: 3, name: 'Moon', years: 10, symbol: '\u263D' },
  MARS: { id: 4, name: 'Mars', years: 7, symbol: '\u2642' },
  RAHU: { id: 5, name: 'Rahu', years: 18, symbol: '\u260A' },
  JUPITER: { id: 6, name: 'Jupiter', years: 16, symbol: '\u2643' },
  SATURN: { id: 7, name: 'Saturn', years: 19, symbol: '\u2644' },
  MERCURY: { id: 8, name: 'Mercury', years: 17, symbol: '\u263F' },
};

const DASHA_SEQUENCE = ['KETU', 'VENUS', 'SUN', 'MOON', 'MARS', 'RAHU', 'JUPITER', 'SATURN', 'MERCURY'];
const TOTAL_DASHA_YEARS = 120;

export const SIGNS = [
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
  { name: 'Pisces', ruler: 'JUPITER', start: 330 },
];

export const NAKSHATRAS = [
  { name: 'Ashwini', ruler: 'KETU' }, { name: 'Bharani', ruler: 'VENUS' },
  { name: 'Krittika', ruler: 'SUN' }, { name: 'Rohini', ruler: 'MOON' },
  { name: 'Mrigashira', ruler: 'MARS' }, { name: 'Ardra', ruler: 'RAHU' },
  { name: 'Punarvasu', ruler: 'JUPITER' }, { name: 'Pushya', ruler: 'SATURN' },
  { name: 'Ashlesha', ruler: 'MERCURY' }, { name: 'Magha', ruler: 'KETU' },
  { name: 'Purva Phalguni', ruler: 'VENUS' }, { name: 'Uttara Phalguni', ruler: 'SUN' },
  { name: 'Hasta', ruler: 'MOON' }, { name: 'Chitra', ruler: 'MARS' },
  { name: 'Swati', ruler: 'RAHU' }, { name: 'Vishakha', ruler: 'JUPITER' },
  { name: 'Anuradha', ruler: 'SATURN' }, { name: 'Jyeshtha', ruler: 'MERCURY' },
  { name: 'Mula', ruler: 'KETU' }, { name: 'Purva Ashadha', ruler: 'VENUS' },
  { name: 'Uttara Ashadha', ruler: 'SUN' }, { name: 'Shravana', ruler: 'MOON' },
  { name: 'Dhanishta', ruler: 'MARS' }, { name: 'Shatabhisha', ruler: 'RAHU' },
  { name: 'Purva Bhadrapada', ruler: 'JUPITER' }, { name: 'Uttara Bhadrapada', ruler: 'SATURN' },
  { name: 'Revati', ruler: 'MERCURY' },
];

const NAKSHATRA_SPAN = 13 + 20 / 60;

export const PLANET_NATURE = {
  KETU: { nature: 'volatile', weight: -0.3, color: '#9e9e9e' },
  VENUS: { nature: 'bullish', weight: 0.7, color: '#e91e63' },
  SUN: { nature: 'neutral_bullish', weight: 0.4, color: '#ff9800' },
  MOON: { nature: 'fluctuating', weight: 0.2, color: '#90caf9' },
  MARS: { nature: 'bearish', weight: -0.5, color: '#f44336' },
  RAHU: { nature: 'volatile_bullish', weight: 0.3, color: '#607d8b' },
  JUPITER: { nature: 'bullish', weight: 0.8, color: '#ffc107' },
  SATURN: { nature: 'bearish', weight: -0.6, color: '#455a64' },
  MERCURY: { nature: 'neutral', weight: 0.1, color: '#4caf50' },
};

function normalizeDegrees(deg) {
  return ((deg % 360) + 360) % 360;
}

function getJulianDay(date) {
  const d = new Date(date);
  const Y = d.getUTCFullYear();
  const M = d.getUTCMonth() + 1;
  const D = d.getUTCDate() + d.getUTCHours() / 24 + d.getUTCMinutes() / 1440 + d.getUTCSeconds() / 86400;
  let y = Y, m = M;
  if (M <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + D + B - 1524.5;
}

function calcSunPosition(T) {
  const L0 = 280.46646 + 36000.76983 * T;
  const M = 357.52911 + 35999.05029 * T;
  const Mrad = M * Math.PI / 180;
  const C = (1.914602 - 0.004817 * T) * Math.sin(Mrad) + 0.019993 * Math.sin(2 * Mrad);
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
  let longitude = L + 6.289 * Math.sin(Mprad) + 1.274 * Math.sin(2 * Drad - Mprad)
    + 0.658 * Math.sin(2 * Drad) + 0.214 * Math.sin(2 * Mprad)
    - 0.186 * Math.sin(Mrad) - 0.114 * Math.sin(2 * Frad);
  return normalizeDegrees(longitude);
}

function calcMarsPosition(T) {
  const L = 355.433 + 19140.2993 * T;
  const M = 19.373 + 19139.8585 * T;
  const Mrad = M * Math.PI / 180;
  return normalizeDegrees(L + 10.691 * Math.sin(Mrad) + 0.623 * Math.sin(2 * Mrad));
}

function calcMercuryPosition(T) {
  const L = 252.251 + 149472.6746 * T;
  const M = 174.795 + 149472.5153 * T;
  const Mrad = M * Math.PI / 180;
  return normalizeDegrees(L + 23.440 * Math.sin(Mrad) + 2.9818 * Math.sin(2 * Mrad));
}

function calcJupiterPosition(T) {
  const L = 34.351 + 3034.9057 * T;
  const M = 20.020 + 3034.6874 * T;
  const Mrad = M * Math.PI / 180;
  return normalizeDegrees(L + 5.555 * Math.sin(Mrad) + 0.168 * Math.sin(2 * Mrad));
}

function calcVenusPosition(T) {
  const L = 181.980 + 58517.8157 * T;
  const M = 50.416 + 58517.8039 * T;
  const Mrad = M * Math.PI / 180;
  return normalizeDegrees(L + 0.776 * Math.sin(Mrad));
}

function calcSaturnPosition(T) {
  const L = 50.077 + 1222.1138 * T;
  const M = 317.020 + 1222.1132 * T;
  const Mrad = M * Math.PI / 180;
  return normalizeDegrees(L + 6.406 * Math.sin(Mrad) + 0.318 * Math.sin(2 * Mrad));
}

function calcRahuPosition(T) {
  return normalizeDegrees(125.0445 - 1934.1362 * T);
}

function calcKetuPosition(T) {
  return normalizeDegrees(calcRahuPosition(T) + 180);
}

export function calculatePlanetaryPositions(dateTime) {
  const JD = getJulianDay(dateTime);
  const T = (JD - 2451545.0) / 36525.0;
  return {
    SUN: calcSunPosition(T), MOON: calcMoonPosition(T), MARS: calcMarsPosition(T),
    MERCURY: calcMercuryPosition(T), JUPITER: calcJupiterPosition(T),
    VENUS: calcVenusPosition(T), SATURN: calcSaturnPosition(T),
    RAHU: calcRahuPosition(T), KETU: calcKetuPosition(T),
  };
}

export function calculateLahiriAyanamsa(date) {
  const JD = getJulianDay(date);
  return 23.8611 + 0.013972 * (JD - 2451545.0) / 365.25;
}

export function getSignLord(longitude) {
  return SIGNS[Math.floor(longitude / 30)].ruler;
}

export function getStarLord(longitude) {
  return NAKSHATRAS[Math.floor(longitude / NAKSHATRA_SPAN) % 27].ruler;
}

export function getSubLord(longitude) {
  const nakshatraIndex = Math.floor(longitude / NAKSHATRA_SPAN);
  const posInNakshatra = longitude - (nakshatraIndex * NAKSHATRA_SPAN);
  const starLordName = NAKSHATRAS[nakshatraIndex % 27].ruler;
  const startIdx = DASHA_SEQUENCE.indexOf(starLordName);
  let accumulated = 0;
  for (let i = 0; i < 9; i++) {
    const planetName = DASHA_SEQUENCE[(startIdx + i) % 9];
    accumulated += NAKSHATRA_SPAN * (PLANETS[planetName].years / TOTAL_DASHA_YEARS);
    if (posInNakshatra < accumulated) return planetName;
  }
  return starLordName;
}

export function getPranaLord(longitude) {
  const nakshatraIndex = Math.floor(longitude / NAKSHATRA_SPAN);
  const posInNakshatra = longitude - (nakshatraIndex * NAKSHATRA_SPAN);
  const starLordName = NAKSHATRAS[nakshatraIndex % 27].ruler;
  const startIdx = DASHA_SEQUENCE.indexOf(starLordName);

  let accumulated = 0, subStart = 0, subLordIdx = 0;
  for (let i = 0; i < 9; i++) {
    const planetName = DASHA_SEQUENCE[(startIdx + i) % 9];
    const subSpan = NAKSHATRA_SPAN * (PLANETS[planetName].years / TOTAL_DASHA_YEARS);
    if (posInNakshatra < accumulated + subSpan) { subStart = accumulated; subLordIdx = (startIdx + i) % 9; break; }
    accumulated += subSpan;
  }

  const posInSub = posInNakshatra - subStart;
  const subLordPlanet = DASHA_SEQUENCE[subLordIdx];
  const subSpan = NAKSHATRA_SPAN * (PLANETS[subLordPlanet].years / TOTAL_DASHA_YEARS);

  let subSubAccumulated = 0, subSubStart = 0, subSubLordIdx = 0;
  for (let i = 0; i < 9; i++) {
    const planetName = DASHA_SEQUENCE[(subLordIdx + i) % 9];
    const subSubSpan = subSpan * (PLANETS[planetName].years / TOTAL_DASHA_YEARS);
    if (posInSub < subSubAccumulated + subSubSpan) { subSubStart = subSubAccumulated; subSubLordIdx = (subLordIdx + i) % 9; break; }
    subSubAccumulated += subSubSpan;
  }

  const subSubPlanet = DASHA_SEQUENCE[subSubLordIdx];
  const subSubSpan2 = subSpan * (PLANETS[subSubPlanet].years / TOTAL_DASHA_YEARS);
  const posInSubSub = posInSub - subSubStart;

  let pranaAccumulated = 0;
  for (let i = 0; i < 9; i++) {
    const planetName = DASHA_SEQUENCE[(subSubLordIdx + i) % 9];
    pranaAccumulated += subSubSpan2 * (PLANETS[planetName].years / TOTAL_DASHA_YEARS);
    if (posInSubSub < pranaAccumulated) return planetName;
  }
  return subSubPlanet;
}

export function getKPLevels(longitude) {
  return {
    signLord: getSignLord(longitude),
    starLord: getStarLord(longitude),
    subLord: getSubLord(longitude),
    pranaLord: getPranaLord(longitude),
  };
}

export function calculateKPScore(levels, planet = null) {
  const weights = { L1: 0.10, L2: 0.15, L3: 0.25, L4: 0.30, L5: 0.20 };
  let score = 0;
  if (planet) score += weights.L1 * PLANET_NATURE[planet].weight;
  score += weights.L2 * PLANET_NATURE[levels.signLord].weight;
  score += weights.L3 * PLANET_NATURE[levels.starLord].weight;
  score += weights.L4 * PLANET_NATURE[levels.subLord].weight;
  score += weights.L5 * PLANET_NATURE[levels.pranaLord].weight;
  return score;
}

export function calculateSiderealAscendant(dateTime, lat = MUMBAI.latitude, lng = MUMBAI.longitude) {
  const JD = getJulianDay(dateTime);
  const T = (JD - 2451545.0) / 36525.0;
  let GMST = 280.46061837 + 360.98564736629 * (JD - 2451545.0) + 0.000387933 * T * T;
  GMST = normalizeDegrees(GMST);
  const LST = normalizeDegrees(GMST + lng);
  const LSTrad = LST * Math.PI / 180;
  const latRad = lat * Math.PI / 180;
  const epsilon = 23.4393 - 0.0130 * T;
  const epsRad = epsilon * Math.PI / 180;
  const num = Math.cos(LSTrad);
  const den = -(Math.sin(epsRad) * Math.tan(latRad) + Math.cos(epsRad) * Math.sin(LSTrad));
  let asc = Math.atan2(num, den) * 180 / Math.PI;
  asc = normalizeDegrees(asc);
  const ayanamsa = calculateLahiriAyanamsa(dateTime);
  return normalizeDegrees(asc - ayanamsa);
}

export function getMoonHouseBonus(house) {
  const scores = { 1: 0.1, 2: 0.5, 3: 0.1, 4: 0.0, 5: 0.6, 6: -0.3, 7: 0.2, 8: -0.5, 9: 0.3, 10: 0.5, 11: 0.7, 12: -0.6 };
  return scores[house] || 0;
}

export function getHouseSignificance(house) {
  const sigs = {
    1: 'Market sentiment', 2: 'Wealth/Finance', 3: 'Short-term moves',
    4: 'Stability/Fixed assets', 5: 'Speculation/Trading', 6: 'Debts/Obstacles',
    7: 'Partnerships', 8: 'Sudden events/Losses', 9: 'Fortune/Growth',
    10: 'Career/Leadership', 11: 'Gains/Income', 12: 'Losses/Expenses',
  };
  return sigs[house] || '';
}

export function generateMumbaiPredictions(dateStr, intervalMinutes = 5) {
  const predictions = [];
  const baseDate = new Date(dateStr);
  const ayanamsa = calculateLahiriAyanamsa(baseDate);

  for (let hour = 9; hour <= 15; hour++) {
    const maxMin = hour === 15 ? 30 : 60;
    for (let minute = 0; minute < maxMin; minute += intervalMinutes) {
      const dateTime = new Date(baseDate);
      dateTime.setUTCHours(hour - 5, minute - 30, 0, 0);

      const positions = calculatePlanetaryPositions(dateTime);
      const siderealAsc = calculateSiderealAscendant(dateTime);
      const ascLevels = getKPLevels(siderealAsc);
      const moonSid = normalizeDegrees(positions.MOON - ayanamsa);
      const moonLevels = getKPLevels(moonSid);

      // Simplified moon house
      const moonHouse = (Math.floor(normalizeDegrees(moonSid - siderealAsc) / 30) % 12) + 1;
      const moonHouseBonus = getMoonHouseBonus(moonHouse);

      const moonScore = calculateKPScore(moonLevels, 'MOON');
      const ascScore = calculateKPScore(ascLevels, getSignLord(siderealAsc));
      const compositeScore = moonScore * 0.45 + ascScore * 0.35 + moonHouseBonus * 0.20;

      let signal = 'NEUTRAL';
      if (compositeScore > 0.3) signal = 'STRONG_BUY';
      else if (compositeScore > 0.1) signal = 'BUY';
      else if (compositeScore < -0.3) signal = 'STRONG_SELL';
      else if (compositeScore < -0.1) signal = 'SELL';

      predictions.push({
        time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        hour, minute, signal,
        score: compositeScore.toFixed(4),
        moonHouse, moonHouseBonus: moonHouseBonus.toFixed(2),
        ascSign: SIGNS[Math.floor(siderealAsc / 30)].name,
        moonSign: SIGNS[Math.floor(moonSid / 30)].name,
        moonLevels: {
          starLord: PLANETS[moonLevels.starLord].name,
          subLord: PLANETS[moonLevels.subLord].name,
          pranaLord: PLANETS[moonLevels.pranaLord].name,
        },
        ascLevels: {
          starLord: PLANETS[ascLevels.starLord].name,
          subLord: PLANETS[ascLevels.subLord].name,
          pranaLord: PLANETS[ascLevels.pranaLord].name,
        },
      });
    }
  }
  return predictions;
}

// ---- Vimshottari Dasha + transit-on-natal for company-specific mobile predictions ----
function _subDashaM(lord, L, rem, depth, out) {
  out.push(lord);
  if (depth === 0) return out;
  const idx = DASHA_SEQUENCE.indexOf(lord);
  for (let i = 0; i < 9; i++) {
    const sub = DASHA_SEQUENCE[(idx + i) % 9];
    const sl = L * (PLANETS[sub].years / 120);
    if (rem < sl) return _subDashaM(sub, sl, rem, depth - 1, out);
    rem -= sl;
  }
  return out;
}

export function vimshottariDasha(moonSid, birth, at) {
  const ni = Math.floor(moonSid / NAKSHATRA_SPAN);
  const frac = (moonSid - ni * NAKSHATRA_SPAN) / NAKSHATRA_SPAN;
  const sl = NAKSHATRAS[ni % 27].ruler;
  const si = DASHA_SEQUENCE.indexOf(sl);
  const fy = PLANETS[sl].years;
  let t = fy * frac + (at - birth) / (365.2425 * 86400000);
  t = ((t % 120) + 120) % 120;
  let rem = t, maha = sl;
  for (let i = 0; i < 9; i++) {
    const ld = DASHA_SEQUENCE[(si + i) % 9];
    const sp = PLANETS[ld].years;
    if (rem < sp) { maha = ld; break; }
    rem -= sp;
  }
  const out = [];
  _subDashaM(maha, PLANETS[maha].years, rem, 4, out);
  return out;
}

export function dashaCompositeScore(d) {
  const w = [0.35, 0.25, 0.20, 0.12, 0.08];
  let s = 0;
  for (let i = 0; i < 5; i++) s += w[i] * PLANET_NATURE[d[i]].weight;
  return s;
}

function transitNatalM(tps, asc, natal) {
  const asp = [[0, 1], [60, 0.5], [90, -0.7], [120, 0.8], [180, -0.5]];
  let s = 0;
  const pts = Object.assign({ ASC: asc }, tps);
  for (const tk in pts) {
    const wt = tk === 'ASC' ? 0.3 : PLANET_NATURE[tk].weight;
    for (const nk in natal) {
      let df = Math.abs(pts[tk] - natal[nk]);
      df = Math.min(df, 360 - df);
      for (const a of asp) {
        if (Math.abs(df - a[0]) <= 6) {
          const of = 1 - Math.abs(df - a[0]) / 6;
          s += a[1] * of * (wt * 0.5 + PLANET_NATURE[nk].weight * 0.5) * 0.15;
        }
      }
    }
  }
  return s;
}

export function generateCompanyPredictions(dateStr, incorporationDate, newsScore = 0, basePrice = 100, intervalMinutes = 5) {
  const birth = new Date(incorporationDate + 'T12:00:00Z');
  const natal = calculatePlanetaryPositions(birth);
  const ay0 = calculateLahiriAyanamsa(birth);
  const moonSid = normalizeDegrees(natal.MOON - ay0);
  const dasha = vimshottariDasha(moonSid, birth, new Date(dateStr + 'T06:00:00Z'));
  const ds5 = dashaCompositeScore(dasha);
  const predictions = [];
  const baseDate = new Date(dateStr);
  const ay = calculateLahiriAyanamsa(baseDate);
  for (let hour = 9; hour <= 15; hour++) {
    const maxMin = hour === 15 ? 30 : 60;
    for (let minute = 0; minute < maxMin; minute += intervalMinutes) {
      const dt = new Date(baseDate);
      dt.setUTCHours(hour - 5, minute - 30, 0, 0);
      const positions = calculatePlanetaryPositions(dt);
      const sa = calculateSiderealAscendant(dt);
      const al = getKPLevels(sa);
      const ms = normalizeDegrees(positions.MOON - ay);
      const ml = getKPLevels(ms);
      const mh = (Math.floor(normalizeDegrees(ms - sa) / 30) % 12) + 1;
      const mhb = getMoonHouseBonus(mh);
      const tn = transitNatalM(positions, sa, natal);
      const score = calculateKPScore(ml, 'MOON') * 0.20 + calculateKPScore(al, getSignLord(sa)) * 0.15 +
                    mhb * 0.10 + tn * 0.30 + ds5 * 0.15 + newsScore * 0.10;
      let signal = 'NEUTRAL';
      if (score > 0.3) signal = 'STRONG_BUY';
      else if (score > 0.1) signal = 'BUY';
      else if (score < -0.3) signal = 'STRONG_SELL';
      else if (score < -0.1) signal = 'SELL';
      predictions.push({
        time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        hour, minute, signal, score: score.toFixed(4), moonHouse: mh,
        ascSign: SIGNS[Math.floor(sa / 30)].name, moonSign: SIGNS[Math.floor(ms / 30)].name,
        moonLevels: {
          starLord: PLANETS[ml.starLord].name, subLord: PLANETS[ml.subLord].name, pranaLord: PLANETS[ml.pranaLord].name,
        },
      });
    }
  }
  let cum = 0;
  predictions.forEach(x => {
    cum += parseFloat(x.score) * 0.004;
    cum = Math.max(-0.15, Math.min(0.15, cum));
    x.predPrice = +(basePrice * (1 + cum)).toFixed(2);
  });
  const levels = ['Maha', 'Antar', 'Pratyantar', 'Sookshma', 'Prana'];
  const dashaInfo = dasha.map((p, i) => ({
    level: levels[i], planet: PLANETS[p].name, symbol: PLANETS[p].symbol,
    nature: PLANET_NATURE[p].nature, weight: PLANET_NATURE[p].weight,
  }));
  return { predictions, dasha: dashaInfo, dashaScore: ds5.toFixed(4) };
}

export function generateCompanyHoroscope(incorporationDate) {
  const date = new Date(incorporationDate + 'T12:00:00Z');
  const positions = calculatePlanetaryPositions(date);
  const horoscope = {};
  for (const [planet, longitude] of Object.entries(positions)) {
    const levels = getKPLevels(longitude);
    const signIndex = Math.floor(longitude / 30);
    const nakshatraIndex = Math.floor(longitude / NAKSHATRA_SPAN) % 27;
    horoscope[planet] = {
      longitude: longitude.toFixed(2),
      sign: SIGNS[signIndex].name,
      nakshatra: NAKSHATRAS[nakshatraIndex].name,
      levels, score: calculateKPScore(levels, planet).toFixed(4),
      symbol: PLANETS[planet].symbol,
    };
  }
  return horoscope;
}

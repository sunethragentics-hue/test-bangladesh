// Yearly future forecast data (2026-2036) per destination.
// Keys match existing destination keys used across the app.
export interface YearlyForecast {
  tci: number;
  hci: number;
  tis: number;
}

export const yearlyForecast: Record<string, Record<number, YearlyForecast>> = {
  // Cox's Bazar (formerly Digha)
  digha: {
    2026: { tci: 90.0, hci: 88.2, tis: 79.28 },
    2027: { tci: 89.1, hci: 87.95, tis: 79.05 },
    2028: { tci: 88.35, hci: 87.1, tis: 78.62 },
    2029: { tci: 87.55, hci: 86.85, tis: 78.18 },
    2030: { tci: 86.9, hci: 85.95, tis: 77.8 },
    2031: { tci: 86.15, hci: 85.4, tis: 77.3 },
    2032: { tci: 85.3, hci: 84.75, tis: 76.82 },
    2033: { tci: 84.6, hci: 83.95, tis: 75.98 },
    2034: { tci: 83.55, hci: 82.85, tis: 74.92 },
    2035: { tci: 82.1, hci: 81.35, tis: 73.65 },
    2036: { tci: 80.3, hci: 80.0, tis: 72.12 },
  },
  // Kuakata (formerly Mandarmani)
  mandarmani: {
    2026: { tci: 90.0, hci: 90.38, tis: 80.15 },
    2027: { tci: 90.32, hci: 90.47, tis: 80.28 },
    2028: { tci: 90.68, hci: 90.55, tis: 80.46 },
    2029: { tci: 91.18, hci: 90.71, tis: 80.72 },
    2030: { tci: 91.42, hci: 90.88, tis: 80.96 },
    2031: { tci: 91.88, hci: 91.03, tis: 81.19 },
    2032: { tci: 92.26, hci: 91.18, tis: 81.43 },
    2033: { tci: 92.73, hci: 91.42, tis: 81.71 },
    2034: { tci: 93.08, hci: 91.58, tis: 81.95 },
    2035: { tci: 93.52, hci: 91.77, tis: 82.16 },
    2036: { tci: 94.0, hci: 92.0, tis: 82.4 },
  },
  // Satkhira (formerly Sundarban)
  sundarban: {
    2026: { tci: 95.0, hci: 90.2, tis: 82.1 },
    2027: { tci: 94.82, hci: 90.08, tis: 81.94 },
    2028: { tci: 94.45, hci: 89.92, tis: 81.7 },
    2029: { tci: 94.1, hci: 89.76, tis: 81.46 },
    2030: { tci: 93.75, hci: 89.58, tis: 81.18 },
    2031: { tci: 93.35, hci: 89.35, tis: 80.9 },
    2032: { tci: 92.9, hci: 89.1, tis: 80.62 },
    2033: { tci: 92.35, hci: 88.82, tis: 80.32 },
    2034: { tci: 91.8, hci: 88.56, tis: 80.05 },
    2035: { tci: 91.1, hci: 88.28, tis: 79.7 },
    2036: { tci: 90.4, hci: 88.0, tis: 79.35 },
  },
};

// Get yearly forecast for a given year, clamping to available range and
// linearly extrapolating for years just outside if needed.
export function getYearlyForecast(key: string, year: number): YearlyForecast | null {
  const data = yearlyForecast[key];
  if (!data) return null;
  if (data[year]) return data[year];
  const years = Object.keys(data).map(Number).sort((a, b) => a - b);
  const min = years[0];
  const max = years[years.length - 1];
  if (year < min) return data[min];
  if (year > max) return data[max];
  return null;
}

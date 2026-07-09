import climateData from "./climate.json";
import destinationsData from "./destinations.json";
import rankingData from "./ranking.json";
import guidanceData from "./guidance.json";

export interface ClimateMonth {
  tci: number;
  hci: number;
  tis: number;
  temperature: { min: number; max: number };
  humidity: number;
  rainfall: number;
  windSpeed: number;
  weatherCondition: string;
  positivePoints: string[];
  negativePoints: string[];
  activities: string[];
  precautions: string[];
}

export interface FamousPlace {
  name: string;
  description: string;
  image: string;
}
export interface WhereToTry {
  spot: string;
  area: string;
  timing: string;
}
export interface FamousFood {
  name: string;
  description: string;
  image: string;
  whereToTry: WhereToTry[];
}
export interface ReachStep {
  point: string;
  detail: string;
}
export interface HowToReach {
  mode: string;
  icon: string;
  summary: string;
  steps: ReachStep[];
}
export interface TravelTip {
  title: string;
  answer: string;
  image: string;
}
export interface Destination {
  name: string;
  description: string;
  image: string;
  tis: number;
  bestTime: string;
  famousPlaces: FamousPlace[];
  famousFoods: FamousFood[];
  howToReach: HowToReach[];
  travelTips: TravelTip[];
}
export interface RankingItem {
  key: string;
  name: string;
  tis: number;
}

export const climate = climateData as Record<string, Record<string, ClimateMonth>>;
export const destinations = destinationsData as Record<string, Destination>;
export const ranking = rankingData as RankingItem[];
export const guidance = guidanceData as Record<string, Record<string, string>>;

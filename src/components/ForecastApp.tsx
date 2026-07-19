import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  BedDouble,
  Brain,
  Building2,
  Bus,
  Calendar,
  CalendarDays,
  Camera,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Cloud,
  CloudRain,
  CloudSun,
  Compass,
  Droplets,
  Info,
  Lightbulb,
  MapPin,
  Navigation,
  ShieldCheck,
  Sparkles,
  Sun,
  Thermometer,
  Train,
  Trophy,
  Utensils,
  UtensilsCrossed,
  Wind,
  X,
  Zap,
} from "lucide-react";
import {
  climate,
  destinations,
  guidance,
  ranking,
  type ClimateMonth,
} from "@/data/coastal";
import { getYearlyForecast } from "@/data/yearly";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface Prediction {
  location: string;
  locationKey: string;
  date: string;
  year: number;
  month: number;
  monthName: string;
  tci: number;
  hci: number;
  tis: number;
  temperature: { min: number; max: number };
  humidity: number;
  rainfall: number;
  windSpeed: number;
  weatherCondition: string;
  status: string;
  statusColor: string;
  statusBg: string;
  positivePoints: string[];
  negativePoints: string[];
  activities: string[];
  precautions: string[];
  bookingAdvice: string;
  bookingColor: string;
}

interface Alternative {
  key: string;
  name: string;
  tis: number;
  reason: string;
}

function statusFor(v: number) {
  if (v >= 95)
    return {
      status: "Excellent for Tourism",
      color: "text-emerald-700",
      bg: "bg-emerald-50 border-emerald-200",
      bookingAdvice: "Highly Recommended – Proceed with booking!",
      bookingColor: "text-emerald-600",
    };
  if (v >= 88)
    return {
      status: "Very Good for Tourism",
      color: "text-teal-700",
      bg: "bg-teal-50 border-teal-200",
      bookingAdvice: "Good conditions – Recommended for booking",
      bookingColor: "text-teal-600",
    };
  if (v >= 80)
    return {
      status: "Moderate Tourism Potential",
      color: "text-amber-700",
      bg: "bg-amber-50 border-amber-200",
      bookingAdvice: "Consider flexible booking options",
      bookingColor: "text-amber-600",
    };
  if (v >= 73)
    return {
      status: "Below Average Conditions",
      color: "text-orange-700",
      bg: "bg-orange-50 border-orange-200",
      bookingAdvice: "Not ideal – Consider postponing trip",
      bookingColor: "text-orange-600",
    };
  return {
    status: "Not Recommended for Travel",
    color: "text-rose-700",
    bg: "bg-rose-50 border-rose-200",
    bookingAdvice: "Avoid travel – Dangerous weather conditions",
    bookingColor: "text-rose-600",
  };
}

function findAlternatives(month: number, tis: number): Alternative[] {
  const out: Alternative[] = [];
  Object.entries(climate).forEach(([key, months]) => {
    const m = months[String(month)];
    if (m && m.tis > tis + 5) {
      out.push({
        key,
        name: destinations[key].name,
        tis: m.tis,
        reason: m.tis >= 88 ? "Excellent conditions" : "Better weather expected",
      });
    }
  });
  return out.sort((a, b) => b.tis - a.tis).slice(0, 2);
}

function parseDate(v: string) {
  const w = new Date(v);
  return {
    formatted: `${w.getDate()}-${MONTHS[w.getMonth()]}-${w.getFullYear()}`,
    year: w.getFullYear(),
    month: w.getMonth() + 1,
    monthName: MONTHS[w.getMonth()],
  };
}

interface SubOption {
  id: string;
  label: string;
  sub: string;
  details: string[];
}
interface GuideSection {
  id: string;
  label: string;
  sub: string;
  icon: ReactNode;
  bg: string;
  subOptions: SubOption[];
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "weather",
    label: "Check Weather Updates",
    sub: "Real-time forecast and alerts",
    icon: <Cloud className="w-5 h-5 text-blue-600" />,
    bg: "bg-blue-100",
    subOptions: [
      { id: "realtime", label: "Real-time Weather Monitoring", sub: "Current conditions & hourly forecast", details: ["Temperature Range", "Humidity Level", "Rainfall Probability", "Wind Conditions"] },
      { id: "forecast", label: "7-Day Forecast", sub: "Day-by-day predictions for coastal areas", details: ["Source", "Update Frequency", "Coverage", "Alerts"] },
      { id: "cyclone", label: "Storm & Cyclone Alerts", sub: "Real-time severe weather warnings", details: ["Alert Levels", "Warning System", "Emergency Contacts", "Shelter Locations"] },
    ],
  },
  {
    id: "indoor",
    label: "Indoor Activity Options",
    sub: "Things to do if weather is bad",
    icon: <Building2 className="w-5 h-5 text-amber-600" />,
    bg: "bg-amber-100",
    subOptions: [
      { id: "cultural", label: "Cultural Attractions", sub: "Museums, temples & heritage sites", details: ["Marine Aquarium", "Chandaneswar Temple", "Local Villages", "Mangrove Interpretation Center"] },
      { id: "spa", label: "Spa & Wellness", sub: "Indoor relaxation and wellness centers", details: ["Beach Resorts", "Ayurvedic Centers", "Massage Centers", "Yoga Sessions"] },
      { id: "dining", label: "Dining & Entertainment", sub: "Restaurants and food experiences", details: ["Seafood Restaurants", "Local Cuisine", "Beachside Cafes", "Food Tours"] },
    ],
  },
  {
    id: "flexible",
    label: "Flexible Booking Options",
    sub: "Insurance, refunds & alternate dates",
    icon: <Calendar className="w-5 h-5 text-orange-600" />,
    bg: "bg-orange-100",
    subOptions: [
      { id: "insurance", label: "Travel Insurance Options", sub: "Protect against weather disruptions", details: ["Basic Coverage", "Weather Shield", "Premium Protection", "Group Plans"] },
      { id: "refund", label: "Refundable Bookings", sub: "Hotels with free cancellation", details: ["Free Cancellation", "Partial Refund", "Weather Guarantee", "Reschedule Policy"] },
      { id: "altdates", label: "Alternative Date Suggestions", sub: "Better dates based on weather patterns", details: ["Peak Season", "Shoulder Season", "Off Season", "Best Value"] },
    ],
  },
  {
    id: "hotel",
    label: "Hotel & Stay Booking",
    sub: "Accommodations and platforms",
    icon: <BedDouble className="w-5 h-5 text-teal-600" />,
    bg: "bg-teal-100",
    subOptions: [
      { id: "availhotel", label: "Available Hotels", sub: "Accommodations in your destination", details: ["Budget Range", "Mid-Range", "Luxury", "Eco-Resorts"] },
      { id: "beachfront", label: "Beachfront Properties", sub: "Hotels with direct beach access", details: ["Hotel Sea Hawk", "Sujata Beach Resort", "Rose Valley Resort", "Sajnekhali Tourist Lodge"] },
      { id: "platforms", label: "Booking Platforms", sub: "Where to book your stay", details: ["Booking.com", "MakeMyTrip", "Direct Hotel", "WBTDC"] },
    ],
  },
  {
    id: "transport",
    label: "Transport & Getting There",
    sub: "Trains, buses and car options",
    icon: <Car className="w-5 h-5 text-cyan-600" />,
    bg: "bg-cyan-100",
    subOptions: [
      { id: "train", label: "Train Options", sub: "Rail travel from Kolkata", details: ["Howrah-Digha", "Howrah-Contai", "Sealdah-Canning", "Cost Range"] },
      { id: "bus", label: "Bus Services", sub: "Road transport options", details: ["AC Volvo", "Non-AC", "Popular Lines", "Travel Time"] },
      { id: "carrent", label: "Car Rental", sub: "Self-drive and taxi options", details: ["Self-Drive", "With Driver", "Popular Routes", "Providers"] },
    ],
  },
  {
    id: "packing",
    label: "What to Pack & Safety",
    sub: "Essentials and precautions",
    icon: <Lightbulb className="w-5 h-5 text-emerald-600" />,
    bg: "bg-emerald-100",
    subOptions: [
      { id: "essential", label: "Essential Items", sub: "Must-have items for your trip", details: ["Sun Protection", "Swimwear", "Footwear", "Documents"] },
      { id: "clothing", label: "Clothing Suggestions", sub: "What to wear based on weather", details: ["Day Wear", "Evening Wear", "Temple Visits", "Forest Safari"] },
      { id: "health", label: "Health & Safety", sub: "Medical and safety supplies", details: ["First Aid", "Medications", "Insect Protection", "Water Purification"] },
    ],
  },
  {
    id: "activities",
    label: "Things to Do",
    sub: "Activities suitable for this weather",
    icon: <Sparkles className="w-5 h-5 text-blue-500" />,
    bg: "bg-blue-50 border border-blue-100",
    subOptions: [
      { id: "beach", label: "Beach Activities", sub: "Water and beach sports available", details: ["Swimming", "Beach Buggy", "Jet Ski", "Parasailing"] },
      { id: "nature", label: "Nature & Wildlife", sub: "Eco-tourism experiences", details: ["Sundarbans Safari", "Bird Watching", "Mangrove Tours", "Photography Tours"] },
      { id: "culture", label: "Cultural Experiences", sub: "Local culture and heritage", details: ["Fishing Villages", "Temple Tours", "Local Markets", "Village Homestays"] },
    ],
  },
];

const SUNDARBAN_PERMITS: GuideSection = {
  id: "permits",
  label: "Required Permits (Sundarban)",
  sub: "Forest and photography permits",
  icon: <Info className="w-5 h-5 text-rose-600" />,
  bg: "bg-rose-100",
  subOptions: [
    { id: "forestpermit", label: "Sundarbans Forest Permit", sub: "Required for UNESCO site access", details: ["Cost", "Processing Time", "Validity", "Where to Apply"] },
    { id: "photopermit", label: "Photography Permit", sub: "Required for professional filming", details: ["Cost", "Drone Use", "Processing", "Contact"] },
    { id: "boatbook", label: "Boat Safari Booking", sub: "Mandatory boat for forest exploration", details: ["Shared Boat", "Private Boat", "Multi-day Tour", "Booking"] },
  ],
};

function reachIcon(icon: string) {
  switch (icon) {
    case "train":
      return <Train className="w-5 h-5 text-teal-600" />;
    case "bus":
      return <Bus className="w-5 h-5 text-teal-600" />;
    case "car":
      return <Car className="w-5 h-5 text-teal-600" />;
    default:
      return <Compass className="w-5 h-5 text-teal-600" />;
  }
}

export default function ForecastApp() {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState("");
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [openDetail, setOpenDetail] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [openFood, setOpenFood] = useState<number | null>(null);
  const [openReach, setOpenReach] = useState<number | null>(null);
  const [openTip, setOpenTip] = useState<number | null>(null);

  useEffect(() => {
    if (prediction) {
      const t = setTimeout(() => setRevealed(true), 100);
      return () => clearTimeout(t);
    }
  }, [prediction]);

  const modalDest = destinations[modalKey];

  const predict = () => {
    if (!location || !date) return;
    setLoading(true);
    setRevealed(false);
    setOpenSection(null);
    setOpenSub(null);
    setOpenDetail(null);
    setTimeout(() => {
      const d = parseDate(date);
      const m: ClimateMonth = climate[location][String(d.month)];
      const s = statusFor(m.tis);
      setPrediction({
        location: destinations[location].name,
        locationKey: location,
        date: d.formatted,
        year: d.year,
        month: d.month,
        monthName: d.monthName,
        tci: m.tci,
        hci: m.hci,
        tis: m.tis,
        temperature: m.temperature,
        humidity: m.humidity,
        rainfall: m.rainfall,
        windSpeed: m.windSpeed,
        weatherCondition: m.weatherCondition,
        status: s.status,
        statusColor: s.color,
        statusBg: s.bg,
        positivePoints: m.positivePoints,
        negativePoints: m.negativePoints,
        activities: m.activities,
        precautions: m.precautions,
        bookingAdvice: s.bookingAdvice,
        bookingColor: s.bookingColor,
      });
      setAlternatives(m.tis < 80 ? findAlternatives(d.month, m.tis) : []);
      setLoading(false);
    }, 1500);
  };

  const openModal = (key: string) => {
    setModalKey(key);
    setModalOpen(true);
    setOpenFood(null);
    setOpenReach(null);
    setOpenTip(null);
  };

  const toggleSection = (id: string) => {
    setOpenSection((v) => (v === id ? null : id));
    setOpenSub(null);
    setOpenDetail(null);
  };
  const toggleSub = (id: string) => {
    setOpenSub((v) => (v === id ? null : id));
    setOpenDetail(null);
  };
  const toggleDetail = (id: string) => setOpenDetail((v) => (v === id ? null : id));

  const sections = useMemo(
    () =>
      prediction?.locationKey === "sundarban"
        ? [...GUIDE_SECTIONS, SUNDARBAN_PERMITS]
        : GUIDE_SECTIONS,
    [prediction?.locationKey],
  );

  const today = new Date().toISOString().split("T")[0];
  const canPredict = location && date && !loading;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fixed background */}
      <div className="fixed inset-0 z-0">
        <img
          src="/images/Screenshot_2026-07-05_125311.png"
          alt="Beach background"
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.35) saturate(0.85)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-ocean-900/50 to-ocean-950/70" />
        <div className="absolute inset-0 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 min-h-screen py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-10 sm:mb-14">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0">
                <img
                  src="/images/image.png"
                  alt="Storm coast"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ clipPath: "polygon(0 0, 65% 0, 100% 100%, 0 100%)", filter: "brightness(0.75) saturate(1.2)" }}
                />
                <img
                  src="/images/Screenshot_2026-07-05_124554.png"
                  alt="Hill town sunset"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ clipPath: "polygon(55% 0, 100% 0, 100% 100%, 20% 100%)", filter: "brightness(0.8) saturate(1.1)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-ocean-900/60 to-slate-900/60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                <div className="absolute inset-0 opacity-20" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,200,100,0.08) 100%)" }} />
              </div>
              <div className="relative z-10 py-10 sm:py-14 px-6 sm:px-10 text-center">
                <div className="flex justify-center mb-5">
                  <div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/30 w-24 h-24 sm:w-28 sm:h-28">
                    <img
                      src="https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400"
                      alt="Coastal beach"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-teal-500/30 to-transparent" />
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                  AI Driven Future Tourism
                  <br />
                  <span className="text-teal-300">Climate Forecasting</span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-slate-200 max-w-3xl mx-auto drop-shadow">
                  Intelligent climate predictions for Cox's Bazar · Kuakata · Satkhira
                </p>
                <div className="flex flex-wrap justify-center gap-3 mt-6">
                  {["Cox's Bazar Beach", "Kuakata", "Satkhira Sundarbans"].map((v) => (
                    <span key={v} className="px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs font-medium">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left column */}
            <div className="lg:col-span-1">
              <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/50">
                <h2 className="text-lg sm:text-xl font-bold text-ocean-800 mb-6 flex items-center gap-2">
                  <CloudSun className="w-5 h-5 text-teal-500" />
                  Forecast Parameters
                </h2>
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-ocean-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Select Destination
                  </label>
                  <div className="relative">
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full appearance-none bg-white border-2 border-ocean-200 rounded-xl px-4 py-3 pr-10 text-ocean-800 font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all cursor-pointer"
                    >
                      <option value="">Choose location...</option>
                      <option value="digha">Digha</option>
                      <option value="mandarmani">Mandarmani</option>
                      <option value="sundarban">Sundarban</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean-400 pointer-events-none" />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-ocean-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Select Future Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={today}
                    className="w-full bg-white border-2 border-ocean-200 rounded-xl px-4 py-3 text-ocean-800 font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all cursor-pointer"
                  />
                </div>
                <button
                  onClick={predict}
                  disabled={!canPredict}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg transform transition-all duration-300 flex items-center justify-center gap-2 ${
                    !canPredict
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-teal-500 to-ocean-600 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Analyzing Climate...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Predict Climate</span>
                    </>
                  )}
                </button>

                <div className="mt-8 pt-6 border-t border-ocean-200">
                  <h3 className="text-sm font-bold text-ocean-700 mb-4 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-sand-500" />
                    Tourism Ranking (TIS Score)
                  </h3>
                  <div className="space-y-2">
                    {ranking.map((v, i) => (
                      <button
                        key={v.key}
                        onClick={() => setLocation(v.key)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                          location === v.key
                            ? "bg-teal-100 border-2 border-teal-400"
                            : "bg-ocean-50 hover:bg-ocean-100 border-2 border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              i === 0
                                ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white"
                                : i === 1
                                  ? "bg-slate-300 text-slate-700"
                                  : "bg-amber-200 text-amber-700"
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span className="text-sm font-semibold text-ocean-800">{v.name}</span>
                        </div>
                        <span className="text-sm font-bold text-teal-600">{v.tis}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="lg:col-span-2 space-y-6">
              {prediction && revealed ? (
                <div className="space-y-6">
                  {/* Result card */}
                  <div className="bg-white/92 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-5 border-b border-ocean-200">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-ocean-800 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-teal-500" />
                          {prediction.location}
                        </h2>
                        <p className="text-ocean-600 mt-1 flex items-center gap-1 text-sm sm:text-base">
                          <Calendar className="w-4 h-4" />
                          {prediction.date} | {prediction.monthName} {prediction.year}
                        </p>
                      </div>
                      <div className={`mt-3 sm:mt-0 px-4 py-2 rounded-full border ${prediction.statusBg}`}>
                        <span className={`font-semibold text-sm ${prediction.statusColor}`}>{prediction.status}</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-ocean-50 to-teal-50 rounded-xl p-4 mb-6 border border-ocean-200">
                      <div className="flex items-center gap-3 mb-3">
                        <CloudSun className="w-6 h-6 text-teal-600" />
                        <h3 className="font-bold text-ocean-800">Weather Forecast: {prediction.weatherCondition}</h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { icon: <Thermometer className="w-4 h-4" />, label: "Temperature", value: `${prediction.temperature.min}°–${prediction.temperature.max}°C` },
                          { icon: <Droplets className="w-4 h-4" />, label: "Humidity", value: `${prediction.humidity}%` },
                          { icon: <CloudRain className="w-4 h-4" />, label: "Rainfall", value: `${prediction.rainfall}mm` },
                          { icon: <Wind className="w-4 h-4" />, label: "Wind", value: `${prediction.windSpeed} km/h` },
                        ].map((v) => (
                          <div key={v.label} className="bg-white/80 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-ocean-600 text-sm">
                              {v.icon}
                              <span>{v.label}</span>
                            </div>
                            <p className="text-lg font-bold text-ocean-800 mt-1">{v.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                          <Sun className="w-5 h-5 text-orange-500" />
                          <span className="text-xs font-bold text-orange-600 bg-orange-200 px-2 py-0.5 rounded-full">TCI</span>
                        </div>
                        <h3 className="text-xs text-orange-700 mb-0.5">Tourism Climate Index</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-orange-800">{prediction.tci}</p>
                        <p className="text-xs text-orange-600 mt-1">/ 100</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <CloudSun className="w-5 h-5 text-blue-500" />
                          <span className="text-xs font-bold text-blue-600 bg-blue-200 px-2 py-0.5 rounded-full">HCI</span>
                        </div>
                        <h3 className="text-xs text-blue-700 mb-0.5">Holiday Climate Index</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-800">{prediction.hci}</p>
                        <p className="text-xs text-blue-600 mt-1">/ 100</p>
                      </div>
                      <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-4 border border-teal-200">
                        <div className="flex items-center justify-between mb-2">
                          <Activity className="w-5 h-5 text-teal-500" />
                          <span className="text-xs font-bold text-teal-600 bg-teal-200 px-2 py-0.5 rounded-full">TIS</span>
                        </div>
                        <h3 className="text-xs text-teal-700 mb-0.5">Tourism Index Score</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-teal-800">{prediction.tis}</p>
                        <p className="text-xs text-teal-600 mt-1">/ 100</p>
                      </div>
                    </div>

                    <div className="bg-white/80 rounded-2xl p-5 border border-ocean-100">
                      <h3 className="text-base font-bold text-ocean-800 mb-4">Climate Suitability Meter</h3>
                      <div className="relative pt-6">
                        <div className="h-6 sm:h-8 bg-gradient-to-r from-rose-300 via-amber-300 to-emerald-400 rounded-full">
                          <div
                            className="absolute top-6 h-6 sm:h-8 w-1.5 bg-ocean-900 shadow-lg rounded-full transition-all duration-1000"
                            style={{ left: `${prediction.tis - 70}%`, transform: "translateX(-50%)" }}
                          >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-ocean-900 text-white text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap">
                              {prediction.tis}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-ocean-600 mt-2 px-1">
                          <span>Poor (70)</span>
                          <span>Moderate</span>
                          <span>Good</span>
                          <span>Excellent (100)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Positive / Concerns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-bold text-emerald-800">Positive Conditions</h3>
                      </div>
                      <ul className="space-y-2">
                        {prediction.positivePoints.map((v, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-ocean-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>{v}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl p-5 border border-rose-200 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                        <h3 className="font-bold text-rose-800">Concerns &amp; Risks</h3>
                      </div>
                      <ul className="space-y-2">
                        {prediction.negativePoints.map((v, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-ocean-700">
                            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span>{v}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Alternatives */}
                  {alternatives.length > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border-2 border-amber-300">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-amber-200">
                          <Compass className="w-5 h-5 text-amber-700" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-ocean-800 mb-2">Better Alternative Destinations</h3>
                          <p className="text-sm text-ocean-600 mb-3">
                            {prediction.location} has challenging weather in {prediction.monthName}. Consider:
                          </p>
                          <div className="space-y-2">
                            {alternatives.map((v) => (
                              <button
                                key={v.key}
                                onClick={() => {
                                  setLocation(v.key);
                                  setPrediction(null);
                                  setRevealed(false);
                                }}
                                className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all"
                              >
                                <div className="text-left">
                                  <p className="font-semibold text-ocean-800">{v.name}</p>
                                  <p className="text-xs text-ocean-600">{v.reason}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-emerald-600">{v.tis}</p>
                                  <p className="text-xs text-ocean-500">TIS Score</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Booking decision + guidance accordions */}
                  <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border-2 border-teal-200 overflow-hidden">
                    <div className="p-5 sm:p-6 border-b border-ocean-100 bg-gradient-to-r from-teal-50 to-ocean-50">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${prediction.tis >= 88 ? "bg-emerald-100" : prediction.tis >= 80 ? "bg-amber-100" : "bg-rose-100"}`}>
                          <BedDouble className={`w-6 h-6 ${prediction.bookingColor}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-ocean-800 mb-1">Booking Decision</h3>
                          <p className={`text-base font-semibold ${prediction.bookingColor}`}>{prediction.bookingAdvice}</p>
                          <p className="text-xs text-ocean-500 mt-1">
                            Expand each section below for detailed guidance – answers appear inside each card.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-3 bg-ocean-50/60">
                      {sections.map((section) => (
                        <div key={section.id} className="bg-white rounded-2xl border border-ocean-200 overflow-hidden shadow-sm">
                          <button onClick={() => toggleSection(section.id)} className="w-full flex items-center justify-between p-4 hover:bg-ocean-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${section.bg}`}>{section.icon}</div>
                              <div className="text-left">
                                <h4 className="font-semibold text-ocean-800 text-sm">{section.label}</h4>
                                <p className="text-xs text-ocean-500">{section.sub}</p>
                              </div>
                            </div>
                            <ChevronRight className={`w-5 h-5 text-ocean-400 transition-transform duration-200 ${openSection === section.id ? "rotate-90" : ""}`} />
                          </button>
                          {openSection === section.id && (
                            <div className="border-t border-ocean-100 bg-slate-50 p-3 space-y-2">
                              {section.subOptions.map((sub) => (
                                <div key={sub.id} className="bg-white rounded-xl border border-ocean-100 overflow-hidden">
                                  <button
                                    onClick={() => toggleSub(`${section.id}_${sub.id}`)}
                                    className="w-full flex items-center justify-between p-3 hover:bg-ocean-50 transition-colors text-left"
                                  >
                                    <div>
                                      <p className="text-sm font-semibold text-ocean-800">{sub.label}</p>
                                      <p className="text-xs text-ocean-500 mt-0.5">{sub.sub}</p>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 text-ocean-400 transition-transform duration-200 flex-shrink-0 ml-2 ${openSub === `${section.id}_${sub.id}` ? "rotate-90" : ""}`} />
                                  </button>
                                  {openSub === `${section.id}_${sub.id}` && (
                                    <div className="border-t border-ocean-100 bg-gradient-to-br from-ocean-50 to-teal-50 p-3 space-y-2">
                                      <p className="text-xs text-teal-700 font-medium mb-2">Click any item for the full answer:</p>
                                      {sub.details.map((detail) => {
                                        const map = guidance[sub.label];
                                        const answer = map ? map[detail] : null;
                                        const detailId = `${section.id}_${sub.id}_${detail}`;
                                        return (
                                          <div key={detail} className="bg-white rounded-lg border border-ocean-100 overflow-hidden">
                                            <button
                                              onClick={() => toggleDetail(detailId)}
                                              className="w-full flex items-center justify-between p-2.5 hover:bg-ocean-50 transition-colors text-left"
                                            >
                                              <span className="text-xs font-semibold text-ocean-700">{detail}</span>
                                              <ChevronRight className={`w-3.5 h-3.5 text-ocean-400 transition-transform duration-200 flex-shrink-0 ${openDetail === detailId ? "rotate-90" : ""}`} />
                                            </button>
                                            {openDetail === detailId && answer && (
                                              <div className="px-3 pb-3 pt-1 border-t border-teal-100 bg-gradient-to-br from-teal-50 to-ocean-50">
                                                <div className="flex items-start gap-2 mt-2">
                                                  <Info className="w-3.5 h-3.5 text-teal-500 flex-shrink-0 mt-0.5" />
                                                  <p className="text-xs text-ocean-700 leading-relaxed">{answer}</p>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => openModal(prediction.locationKey)}
                    className="w-full py-4 px-6 bg-gradient-to-r from-teal-500 to-ocean-500 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <Compass className="w-5 h-5" />
                    <span>Explore {prediction.location} – Places, Food &amp; Tips</span>
                  </button>
                </div>
              ) : (
                <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/50 text-center">
                  <div className="inline-flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="absolute -inset-4 bg-teal-400/20 rounded-full blur-2xl animate-pulse" />
                      <div className="relative bg-gradient-to-br from-teal-500 to-ocean-600 rounded-full p-6 sm:p-8 shadow-lg">
                        <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-white animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-ocean-800 mb-3">Tourism Climate Forecasting</h2>
                  <p className="text-ocean-600 max-w-md mx-auto mb-6 text-sm sm:text-base">
                    Select a destination and date to receive AI-driven climate predictions with detailed booking recommendations.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {[
                      { icon: <CalendarDays className="w-4 h-4 text-sand-500" />, label: "Date-Based Predictions", bg: "bg-sand-50 border-sand-200" },
                      { icon: <Brain className="w-4 h-4 text-ocean-500" />, label: "Smart Recommendations", bg: "bg-ocean-50 border-ocean-200" },
                      { icon: <Zap className="w-4 h-4 text-teal-500" />, label: "Alternative Locations", bg: "bg-teal-50 border-teal-200" },
                    ].map((v) => (
                      <div key={v.label} className={`flex items-center gap-2 ${v.bg} rounded-full px-4 py-2 border`}>
                        {v.icon}
                        <span className="text-xs font-medium text-ocean-700">{v.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Explore Destinations */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 drop-shadow-md">
                  <MapPin className="w-5 h-5 text-teal-300" />
                  Explore Destinations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {Object.entries(destinations).map(([key, w]) => (
                    <button
                      key={key}
                      onClick={() => openModal(key)}
                      className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-left group border border-white/50"
                    >
                      <div className="h-32 overflow-hidden relative">
                        <img src={w.image} alt={w.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <span className="text-xs text-white font-semibold drop-shadow">Click to explore →</span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-bold text-ocean-800 flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3 text-teal-500" />
                          {w.name}
                        </h4>
                        <p className="text-xs text-ocean-600 mt-1 line-clamp-2">{w.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-bold text-teal-600">TIS {w.tis}</span>
                          <span className="text-ocean-300">·</span>
                          <span className="text-xs text-ocean-500">Best: {w.bestTime}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-12 text-center">
            <p className="text-slate-300 text-sm drop-shadow">
              AI Tourism Climate Forecasting System | West Bengal Coastal Destinations
            </p>
          </footer>
        </div>
      </div>

      {/* Destination modal */}
      {modalOpen && modalDest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative min-h-screen flex items-start justify-center p-4 pt-10">
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white z-10 border-b border-ocean-100 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-ocean-800 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-teal-500" />
                    {modalDest.name}
                  </h2>
                  <p className="text-sm text-ocean-600">{modalDest.description}</p>
                </div>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-ocean-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-ocean-600" />
                </button>
              </div>

              <div className="relative h-52 sm:h-72 overflow-hidden">
                <img src={modalDest.image} alt={modalDest.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-6 text-white">
                  <p className="text-lg font-bold">{modalDest.name}</p>
                  <p className="text-sm opacity-80">Best time: {modalDest.bestTime}</p>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Famous places */}
                <div>
                  <h3 className="text-lg font-bold text-ocean-800 mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-teal-500" />
                    Famous Places to Visit
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modalDest.famousPlaces.map((v, i) => (
                      <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden border border-ocean-100 hover:shadow-lg transition-shadow">
                        <div className="h-36 overflow-hidden relative">
                          <img src={v.image} alt={v.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-white text-xs font-bold">{v.name}</p>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-ocean-600">{v.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Famous foods */}
                <div>
                  <h3 className="text-lg font-bold text-ocean-800 mb-2 flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                    Famous Local Foods
                  </h3>
                  <p className="text-xs text-ocean-500 mb-4">Click any dish to see where to try it, with locations and timings:</p>
                  <div className="space-y-3">
                    {modalDest.famousFoods.map((v, i) => (
                      <div key={i} className="bg-white rounded-xl border border-orange-200 overflow-hidden shadow-sm">
                        <button
                          onClick={() => setOpenFood(openFood === i ? null : i)}
                          className="w-full flex items-center gap-4 p-3 hover:bg-orange-50 transition-colors text-left"
                        >
                          <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border-2 border-orange-100">
                            <img src={v.image} alt={v.name} className="w-full h-full object-cover" loading="eager" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Utensils className="w-4 h-4 text-orange-500 flex-shrink-0" />
                              <h4 className="font-bold text-ocean-800 text-sm">{v.name}</h4>
                            </div>
                            <p className="text-xs text-ocean-600 leading-relaxed">{v.description}</p>
                            <span className="inline-flex items-center gap-1 mt-2 text-xs text-orange-600 font-medium">
                              {openFood === i ? "Hide locations ↑" : "Where to try this →"}
                            </span>
                          </div>
                          <ChevronRight className={`w-5 h-5 text-ocean-400 transition-transform duration-200 flex-shrink-0 ${openFood === i ? "rotate-90" : ""}`} />
                        </button>
                        {openFood === i && (
                          <div className="border-t border-orange-100 p-4 bg-gradient-to-br from-orange-50 to-yellow-50">
                            <h5 className="text-sm font-bold text-ocean-800 mb-3 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-orange-500" />
                              Where to Try {v.name}:
                            </h5>
                            <div className="space-y-2">
                              {v.whereToTry.map((a, x) => (
                                <div key={x} className="bg-white rounded-lg p-3 border border-orange-100 flex items-start gap-3">
                                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{x + 1}</div>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-ocean-800">{a.spot}</p>
                                    <p className="text-xs text-ocean-600 mt-0.5 flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-teal-500" />
                                      {a.area}
                                    </p>
                                    <p className="text-xs text-ocean-600 mt-0.5 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-teal-500" />
                                      {a.timing}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* How to reach */}
                <div>
                  <h3 className="text-lg font-bold text-ocean-800 mb-2 flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-ocean-500" />
                    How to Reach
                  </h3>
                  <p className="text-xs text-ocean-500 mb-4">Click any transport mode for step-by-step directions, bus/train numbers, timings and fares:</p>
                  <div className="space-y-3">
                    {modalDest.howToReach.map((v, i) => (
                      <div key={i} className="bg-white rounded-xl border border-ocean-200 overflow-hidden shadow-sm">
                        <button
                          onClick={() => setOpenReach(openReach === i ? null : i)}
                          className="w-full flex items-center gap-3 p-4 hover:bg-ocean-50 transition-colors text-left"
                        >
                          <div className="p-2 rounded-lg bg-teal-100 flex-shrink-0">{reachIcon(v.icon)}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-ocean-800 text-sm">{v.mode}</h4>
                            <p className="text-xs text-ocean-600 mt-0.5">{v.summary}</p>
                          </div>
                          <ChevronRight className={`w-5 h-5 text-ocean-400 transition-transform duration-200 ${openReach === i ? "rotate-90" : ""}`} />
                        </button>
                        {openReach === i && (
                          <div className="border-t border-ocean-100 p-4 bg-gradient-to-br from-ocean-50 to-teal-50">
                            <h5 className="text-sm font-bold text-ocean-800 mb-3 flex items-center gap-2">
                              <Compass className="w-4 h-4 text-teal-500" />
                              Step-by-Step Directions:
                            </h5>
                            <div className="space-y-3">
                              {v.steps.map((a, x) => (
                                <div key={x} className="bg-white rounded-lg p-3 border border-ocean-100 flex items-start gap-3">
                                  <div className="w-7 h-7 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{x + 1}</div>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-ocean-800">{a.point}</p>
                                    <p className="text-xs text-ocean-600 mt-1 leading-relaxed">{a.detail}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Travel tips */}
                <div>
                  <h3 className="text-lg font-bold text-ocean-800 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-teal-500" />
                    Travel Tips &amp; Suggestions
                  </h3>
                  <p className="text-xs text-ocean-500 mb-4">Click any tip to expand the detailed answer and guidance:</p>
                  <div className="space-y-3">
                    {modalDest.travelTips.map((v, i) => (
                      <div key={i} className="bg-white rounded-xl border border-teal-200 overflow-hidden shadow-sm">
                        <button
                          onClick={() => setOpenTip(openTip === i ? null : i)}
                          className="w-full flex items-center justify-between p-4 hover:bg-teal-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-teal-100">
                              <CheckCircle2 className="w-4 h-4 text-teal-600" />
                            </div>
                            <h4 className="font-semibold text-ocean-800 text-sm">{v.title}</h4>
                          </div>
                          <ChevronRight className={`w-5 h-5 text-ocean-400 transition-transform duration-200 ${openTip === i ? "rotate-90" : ""}`} />
                        </button>
                        {openTip === i && (
                          <div className="border-t border-teal-100 bg-gradient-to-br from-teal-50 to-ocean-50">
                            <div className="flex flex-col sm:flex-row gap-4 p-4">
                              <div className="w-full sm:w-44 h-36 rounded-xl overflow-hidden flex-shrink-0 border-2 border-teal-100">
                                <img src={v.image} alt={v.title} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1">
                                <h5 className="text-sm font-bold text-ocean-800 mb-2 flex items-center gap-2">
                                  <Info className="w-4 h-4 text-teal-500" />
                                  Guidance:
                                </h5>
                                <p className="text-sm text-ocean-700 leading-relaxed">{v.answer}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal footer */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-ocean-100">
                  <button
                    onClick={() => {
                      setModalOpen(false);
                      setLocation(modalKey);
                      setPrediction(null);
                      setRevealed(false);
                    }}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-teal-500 to-ocean-500 rounded-xl font-bold text-white shadow-md hover:shadow-lg transition-all"
                  >
                    Check Climate Forecast
                  </button>
                  <button onClick={() => setModalOpen(false)} className="flex-1 py-3 px-6 bg-ocean-100 rounded-xl font-bold text-ocean-700 hover:bg-ocean-200 transition-all">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

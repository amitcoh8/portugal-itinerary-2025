import type { ItineraryItem, SuggestedDay } from "@/src/types";

export type TripLocation = {
  name: string;
  startDate: string;
};

export type TripConfig = {
  tripName: string;
  tripSubtitle: string;
  locations: TripLocation[];
  regionHints: {
    mainRegion: string;
    secondaryRegion?: string;
    secondaryRegionStartDate?: string;
  };
};

let cachedConfig: TripConfig | null = null;
let cachedItinerary: ItineraryItem[] | null = null;
let cachedSuggestedDays: SuggestedDay[] | null = null;

export async function loadTripConfig(): Promise<TripConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }
  
  try {
    const configModule = await import("../data/trip-config.json");
    cachedConfig = configModule.default;
    return cachedConfig;
  } catch (error) {
    console.error("Failed to load trip configuration:", error);
    throw new Error("Could not load trip configuration");
  }
}

export async function loadItineraryData(): Promise<ItineraryItem[]> {
  if (cachedItinerary) {
    return cachedItinerary;
  }
  
  try {
    const itineraryModule = await import("../data/booked-itinerary.json");
    cachedItinerary = (itineraryModule.default || []) as ItineraryItem[];
    return cachedItinerary;
  } catch (error) {
    console.error("Failed to load itinerary data:", error);
    throw new Error("Could not load itinerary data");
  }
}

export async function loadSuggestedDays(): Promise<SuggestedDay[]> {
  if (cachedSuggestedDays) {
    return cachedSuggestedDays;
  }
  
  try {
    const suggestedModule = await import("../data/suggested-itinerary.json");
    cachedSuggestedDays = (suggestedModule.default || []) as SuggestedDay[];
    return cachedSuggestedDays;
  } catch (error) {
    console.error("Failed to load suggested activities:", error);
    throw new Error("Could not load suggested activities");
  }
}

export function getRegionForDate(dateISO: string, config: TripConfig): string {
  if (!config.regionHints.secondaryRegion || !config.regionHints.secondaryRegionStartDate) {
    return config.regionHints.mainRegion;
  }
  
  const date = new Date(dateISO);
  const secondaryStartDate = new Date(config.regionHints.secondaryRegionStartDate);
  
  return date.getTime() >= secondaryStartDate.getTime() 
    ? config.regionHints.secondaryRegion 
    : config.regionHints.mainRegion;
}

import type { ItineraryItem } from "@/src/types";

// This will be loaded dynamically by components
export async function getTripData(): Promise<ItineraryItem[]> {
  try {
    const itineraryModule = await import("../data/booked-itinerary.json");
    return (itineraryModule.default || []) as ItineraryItem[];
  } catch (error) {
    console.error("Failed to load itinerary data:", error);
    throw new Error("Could not load itinerary data");
  }
}

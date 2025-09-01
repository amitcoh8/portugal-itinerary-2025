import React from "react";
import { ItineraryHeader } from "@/components/Itinerary/ItineraryHeader";
import { ItineraryItemCard } from "@/components/Itinerary/ItineraryItemCard";
import type { ItineraryItem, TripConfig } from "@/src/types";
import { getTripData } from "@/src/itinerary";
import { loadTripConfig, loadSuggestedDays } from "@/src/config";
import { cn } from "@/src/utils";
import SuggestedItinerary from "./components/Itinerary/SuggestedItinerary";

function formatDate(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function formatWeekday(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getTripBounds(items: { date: string }[]) {
  if (items.length === 0) return null;
  const sorted = [...items].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const start = new Date(sorted[0].date);
  const end = new Date(sorted[sorted.length - 1].date);
  return { start, end };
}

function getProgressPercent(today: Date, start: Date, end: Date) {
  const total = end.getTime() - start.getTime();
  if (total <= 0) return 0;
  const current = clamp(today.getTime() - start.getTime(), 0, total);
  return (current / total) * 100;
}

export default function TravelItinerary() {
  const [tripData, setTripData] = React.useState<ItineraryItem[]>([]);
  const [config, setConfig] = React.useState<TripConfig | null>(null);
  const [suggestedDays, setSuggestedDays] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'booked' | 'suggested'>('booked');

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [configData, itineraryData, suggestedData] = await Promise.all([
          loadTripConfig(),
          getTripData(),
          loadSuggestedDays()
        ]);
        setConfig(configData);
        const sortedTripData = [...itineraryData].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setTripData(sortedTripData);
        setSuggestedDays(suggestedData);
      } catch (error) {
        console.error("Failed to load trip data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const today = new Date();
  const bookedBounds = getTripBounds(tripData);

  const progressPercent = bookedBounds ? getProgressPercent(today, bookedBounds.start, bookedBounds.end) : 0;

  const goToToday = () => {
    const todayStr = today.toISOString().split("T")[0];

    let dates: string[];
    if (activeTab === "booked") {
      // tripData is already sorted
      dates = tripData.map((item) => item.date);
    } else {
      // suggestedDays needs to be sorted by date
      dates = [...suggestedDays]
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((day: any) => day.date);
    }

    // Find the first date that is on or after today
    let targetDate = dates.find((date) => date >= todayStr);

    // If no future date is found, use the last date of the trip.
    if (!targetDate && dates.length > 0) {
      targetDate = dates[dates.length - 1];
    }

    if (targetDate) {
      const element = document.getElementById(`date-${targetDate}`);
      element?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans print:bg-white">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-gray-500">Loading travel itinerary...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans print:bg-white">
      <ItineraryHeader
        title={config?.tripName ?? "Travel Itinerary"}
        subtitle={config?.tripSubtitle ?? ""}
        progressPercent={progressPercent}
        onGoToToday={activeTab === 'booked' ? goToToday : undefined}
      />

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8 flex gap-2 border-b border-gray-200">
          <button
            className={cn(
              "px-4 py-2 -mb-px border-b-2 text-sm font-medium",
              activeTab === 'booked' ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
            )}
            onClick={() => setActiveTab('booked')}
          >
            Booked
          </button>
          <button
            className={cn(
              "px-4 py-2 -mb-px border-b-2 text-sm font-medium",
              activeTab === 'suggested' ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
            )}
            onClick={() => setActiveTab('suggested')}
          >
            Suggested
          </button>
        </div>

        {activeTab === 'booked' && (
          <div className="space-y-12">
            {tripData.map((item, index) => (
              <section id={`date-${item.date}`} key={`${item.date}-${index}`} className="break-inside-avoid-page">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{formatDate(item.date)}</h2>
                  <p className="text-gray-500">{formatWeekday(item.date)}</p>
                </div>
                <ItineraryItemCard item={item} showBadge={false} />
              </section>
            ))}
          </div>
        )}

        {activeTab === 'suggested' && (
          <SuggestedItinerary />
        )}
      </main>

      <footer className="py-10 print:hidden">
        <div className="text-center text-gray-400 text-sm">
          <p>End of itinerary.</p>
        </div>
      </footer>
    </div>
  );
}

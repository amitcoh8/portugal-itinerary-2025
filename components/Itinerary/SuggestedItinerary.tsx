import React from "react";
import type { SuggestedCategory, SuggestedDay, SuggestedItem, TripConfig } from "@/src/types";
import { loadTripConfig, loadSuggestedDays } from "@/src/config";
import { getVisitedPlaces, toggleVisitedPlace } from "@/src/utils";
import { getCurrentLocation, calculateDistance, geocodePlaceBrowser, type Coordinates } from "@/src/geocoding";

function formatDate(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function formatWeekday(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

function getGenericImage(category: SuggestedCategory): string {
  const genericImages: Record<SuggestedCategory, string> = {
    hike: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop&auto=format",
    beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&auto=format",
    food: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop&auto=format",
    view: "https://plus.unsplash.com/premium_photo-1666963323736-5ee1c16ef19d?q=80&w=2150&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    town: "https://images.unsplash.com/photo-1549144511-f099e773c147?w=400&h=300&fit=crop&auto=format",
    winery: "https://plus.unsplash.com/premium_photo-1675727579766-f79e14302cd2?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    monument: "https://plus.unsplash.com/premium_photo-1677327622517-b2e4b202c0bb?q=80&w=1288&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    activity: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop&auto=format",
    pool: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&auto=format",
    waterfall: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400&h=300&fit=crop&auto=format",
    garden: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&auto=format",
    market: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop&auto=format",
    transport: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop&auto=format",
  };
  return genericImages[category] || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format";
}
function getCategoryIcon(category: SuggestedCategory) {
  const icons: Record<SuggestedCategory, string> = {
    hike: "🥾",
    beach: "🏖️",
    food: "🍽️",
    view: "🌄",
    town: "🏘️",
    winery: "🍷",
    monument: "🏛️",
    activity: "⚡",
    pool: "🏊",
    waterfall: "💧",
    garden: "🌸",
    market: "🛍️",
    transport: "🚗",
  } as const;
  return icons[category] || "📍";
}

type LocationGroup = {
  area: string;
  days: SuggestedDay[];
  categoryGroups: CategoryGroup[];
};

type CategoryGroup = {
  category: SuggestedCategory;
  items: (SuggestedItem & { dayDescription?: string })[];
};

export default function SuggestedItinerary() {
  const [days, setDays] = React.useState<SuggestedDay[]>([]);
  const [config, setConfig] = React.useState<TripConfig | null>(null);
  const [imageByKey, setImageByKey] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [visitedPlaces, setVisitedPlaces] = React.useState<Set<string>>(new Set());
  const [userLocation, setUserLocation] = React.useState<Coordinates | null>(null);
  const [locationGroups, setLocationGroups] = React.useState<LocationGroup[]>([]);
  const [coordsLoading, setCoordsLoading] = React.useState<Set<string>>(new Set());
  const [coordsFailed, setCoordsFailed] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [configData, suggestedData] = await Promise.all([
          loadTripConfig(),
          loadSuggestedDays()
        ]);
        setConfig(configData);
        const sortedDays = [...suggestedData];
        setDays(sortedDays);
      } catch (error) {
        console.error("Failed to load configuration or suggested activities:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Load visited places from localStorage
  React.useEffect(() => {
    setVisitedPlaces(getVisitedPlaces());
  }, []);

  // Get user's current location
  React.useEffect(() => {
    getCurrentLocation().then(location => {
      if (location) {
        setUserLocation(location);
        console.log('User location obtained:', location);
      } else {
        console.warn('Could not get user location - will use original order');
      }
    });
  }, []);

  // Group and sort data by location and distance
  React.useEffect(() => {
    if (days.length === 0) return;

    // Group days by area
    const groupsByArea = new Map<string, SuggestedDay[]>();
    
    for (const day of days) {
      const area = day.area || 'Other';
      if (!groupsByArea.has(area)) {
        groupsByArea.set(area, []);
      }
      groupsByArea.get(area)!.push(day);
    }

    // Convert to location groups with category sub-groups
    const groups: LocationGroup[] = Array.from(groupsByArea.entries()).map(([area, areaDays]) => {
      // Collect all items with metadata
      const allItems: (SuggestedItem & { dayDescription?: string })[] = [];
      
      for (const day of areaDays) {
        for (const item of day.items) {
          allItems.push({
            ...item,
            dayDescription: day.description
          });
        }
      }

      // Group items by category
      const categoryMap = new Map<SuggestedCategory, (SuggestedItem & { dayDescription?: string })[]>();
      
      for (const item of allItems) {
        if (!categoryMap.has(item.category)) {
          categoryMap.set(item.category, []);
        }
        categoryMap.get(item.category)!.push(item);
      }

      // Sort items within each category by distance, then name
      const categoryGroups: CategoryGroup[] = Array.from(categoryMap.entries()).map(([category, items]) => {
        const sortedItems = [...items].sort((a, b) => {
          if (userLocation) {
            const aHasCoords = !!a.coordinates;
            const bHasCoords = !!b.coordinates;
            if (aHasCoords && bHasCoords) {
              const distanceA = calculateDistance(userLocation, a.coordinates!);
              const distanceB = calculateDistance(userLocation, b.coordinates!);
              if (distanceA !== distanceB) return distanceA - distanceB;
            } else if (aHasCoords !== bHasCoords) {
              return aHasCoords ? -1 : 1;
            }
          }

          const nameA = a.nameLocal || a.nameEn || "";
          const nameB = b.nameLocal || b.nameEn || "";
          return nameA.localeCompare(nameB);
        });

        return {
          category,
          items: sortedItems
        };
      });

      // Sort category groups by category name
      categoryGroups.sort((a, b) => a.category.localeCompare(b.category));

      return {
        area,
        days: areaDays,
        categoryGroups
      };
    });

    // Maintain group order by first appearance (no explicit sorting)

    setLocationGroups(groups);
  }, [days, userLocation]);

  // Toggle visited status for a place
  const handleToggleVisited = (placeId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const updatedVisited = toggleVisitedPlace(placeId);
    setVisitedPlaces(new Set(updatedVisited));
  };

  function buildSearchQuery(item: SuggestedItem): string {
    if (!config) return [item.nameLocal, item.nameEn, item.category].filter(Boolean).join(" ");
    
    const parts = [item.nameLocal, item.nameEn, item.category];
    return parts.filter(Boolean).join(" ");
  }

  async function fetchWikipediaImage(query: string): Promise<string | undefined> {
    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
      const searchResp = await fetch(searchUrl);
      if (!searchResp.ok) return undefined;
      const searchJson = await searchResp.json();
      const first = searchJson?.query?.search?.[0];
      const title = first?.title as string | undefined;
      if (!title) return undefined;

      const pageImgUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=thumbnail&pithumbsize=480&titles=${encodeURIComponent(title)}&origin=*`;
      const pageResp = await fetch(pageImgUrl);
      if (!pageResp.ok) return undefined;
      const pageJson = await pageResp.json();
      const pages = pageJson?.query?.pages;
      if (!pages) return undefined;
      const page = Object.values(pages)[0] as any;
      const thumb = page?.thumbnail?.source as string | undefined;
      return thumb;
    } catch {
      return undefined;
    }
  }

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const tasks: Array<Promise<void>> = [];
      for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
        const day = days[dayIndex];
        for (const item of day.items) {
          if (item.image) continue;
          const key = item.link;
          if (imageByKey[key]) continue;
          const q = buildSearchQuery(item);
          tasks.push(
            (async () => {
              const url = await fetchWikipediaImage(q);
              if (!cancelled && url) {
                setImageByKey((prev) => ({ ...prev, [key]: url }));
              }
            })()
          );
        }
      }
      await Promise.all(tasks);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, config]);

  // Client-side geocoding to enrich items without coordinates
  React.useEffect(() => {
    if (!days.length) return;

    let cancelled = false;

    (async () => {
      for (const day of days) {
        for (const item of day.items) {
          if (item.coordinates) continue;

          const ttlMs = 30 * 24 * 60 * 60 * 1000; // 30 days
          const cacheKey = `coords:${encodeURIComponent(item.link || item.nameLocal)}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            try {
              const parsed = JSON.parse(cached) as { lat: number; lng: number; ts?: number };
              if (parsed.lat && parsed.lng && parsed.ts && (Date.now() - parsed.ts) < ttlMs) {
                item.coordinates = { lat: parsed.lat, lng: parsed.lng };
                continue;
              } else {
                localStorage.removeItem(cacheKey);
              }
            } catch {
              localStorage.removeItem(cacheKey);
            }
          }

          // mark loading
          setCoordsFailed(prev => { const next = new Set(prev); next.delete(cacheKey); return next; });
          setCoordsLoading(prev => new Set(prev).add(cacheKey));

          const coords = await geocodePlaceBrowser(item.nameLocal);
          if (!coords && item.nameEn) {
            const coordsEn = await geocodePlaceBrowser(item.nameEn);
            if (coordsEn) {
              item.coordinates = coordsEn;
              localStorage.setItem(cacheKey, JSON.stringify({ ...coordsEn, ts: Date.now() }));
              setCoordsLoading(prev => { const next = new Set(prev); next.delete(cacheKey); return next; });
              continue;
            }
          }
          if (coords) {
            item.coordinates = coords;
            localStorage.setItem(cacheKey, JSON.stringify({ ...coords, ts: Date.now() }));
            setCoordsFailed(prev => { const next = new Set(prev); next.delete(cacheKey); return next; });
          } else {
            // mark failure for this key
            setCoordsFailed(prev => new Set(prev).add(cacheKey));
          }
          // unmark loading
          setCoordsLoading(prev => { const next = new Set(prev); next.delete(cacheKey); return next; });

          if (cancelled) return;
        }
      }
      // trigger re-grouping after enrichment
      setDays((prev) => [...prev]);
    })();

    return () => { cancelled = true; };
  }, [days]);

  if (loading) {
    return <div className="flex justify-center py-8"><div className="text-gray-500">Loading suggested activities...</div></div>;
  }

  return (
    <div className="space-y-10">
      {/* Location permission message */}
      {!userLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">
          💡 Allow location access to sort attractions by distance from your current position
        </div>
      )}

      {locationGroups.map((group) => (
        <section key={group.area} className="break-inside-avoid-page">
          {/* Location header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.area}</h1>
            <div className="text-gray-500 text-sm">
              {group.days.length} day{group.days.length !== 1 ? 's' : ''} • {group.categoryGroups.reduce((sum, cg) => sum + cg.items.length, 0)} attractions
              {userLocation && (
                <span className="ml-2 text-green-600">📍 Sorted by type, then distance from you</span>
              )}
            </div>
          </div>

          {/* Category groups */}
          <div className="space-y-8">
            {group.categoryGroups.map((categoryGroup) => (
              <div key={categoryGroup.category} className="space-y-3">
                {/* Category header */}
                <div className="border-b border-gray-200 pb-2">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(categoryGroup.category)}</span>
                    <span className="capitalize">{categoryGroup.category}</span>
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({categoryGroup.items.length} attraction{categoryGroup.items.length !== 1 ? 's' : ''})
                    </span>
                  </h2>
                </div>

                {/* Items within category */}
                <ul className="space-y-3">
                  {categoryGroup.items.map((it) => {
                    const key = it.link;
                    const imageUrl = it.image ?? imageByKey[key];
                    const isVisited = visitedPlaces.has(it.link);
                    const cacheKey = `coords:${encodeURIComponent(it.link || it.nameLocal)}`;
                    const isCoordsLoading = coordsLoading.has(cacheKey);
                    const isCoordsFailed = coordsFailed.has(cacheKey);
                    const distance = userLocation && it.coordinates 
                      ? calculateDistance(userLocation, it.coordinates) 
                      : null;

                    return (
                      <li key={key} className={`rounded-xl border border-gray-200 bg-white shadow-sm relative ${isVisited ? 'opacity-50' : ''}`}>
                        {/* Visited toggle button */}
                        <button
                          onClick={(e) => handleToggleVisited(it.link, e)}
                          className={`absolute top-2 left-2 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all z-10 shadow-sm ${
                            isVisited 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'bg-white border-gray-300 hover:border-green-400 hover:bg-green-50'
                          }`}
                          title={isVisited ? 'Mark as not visited' : 'Mark as visited'}
                        >
                          {isVisited && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>

                        <a
                          href={it.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block p-4 hover:bg-gray-50 transition-colors group ${isVisited ? 'filter grayscale-[0.3]' : ''}`}
                        >
                          <div className="flex gap-4">
                            <div className="w-28 h-20 flex-shrink-0 bg-gray-100 rounded-md relative">
                              <img
                                src={imageUrl || getGenericImage(it.category)}
                                alt={it.nameLocal}
                                className={`w-full h-full object-cover rounded-md ${isVisited ? 'filter grayscale-[0.5]' : ''}`}
                                loading="lazy"
                              />
                              {!imageUrl && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs px-1 py-0.5 rounded-b-md">
                                  <span className="block text-center text-[10px] leading-tight">Placeholder</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-3">
                                <p
                                  className="text-gray-900 font-medium group-hover:underline truncate"
                                  title={it.nameEn ? `${it.nameLocal} – ${it.nameEn}` : it.nameLocal}
                                >
                                  {it.nameLocal}
                                  {it.nameEn ? ` – ${it.nameEn}` : ""}
                                </p>
                                <div className="flex items-center gap-2 text-gray-500">
                                  {isCoordsLoading && (
                                    <span className="text-xs inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded animate-pulse">
                                      <span className="inline-block h-2 w-2 rounded-full bg-gray-300"></span>
                                      <span>Locating…</span>
                                    </span>
                                  )}
                                  {distance && !isCoordsLoading && (
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                      {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
                                    </span>
                                  )}
                                  {!isCoordsLoading && isCoordsFailed && !it.coordinates && (
                                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-200">
                                      Location missing
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-gray-600 text-sm mt-1">{it.summary}</p>
                              {/* Removed bottom-right category tag since it's now in the header */}
                            </div>
                          </div>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}



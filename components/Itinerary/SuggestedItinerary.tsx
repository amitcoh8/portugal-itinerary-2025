import React from "react";
import type { SuggestedCategory, SuggestedDay, SuggestedItem, TripConfig } from "@/src/types";
import { loadTripConfig, loadSuggestedDays } from "@/src/config";
import { getVisitedPlaces, toggleVisitedPlace } from "@/src/utils";

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
  allItems: (SuggestedItem & { dayDescription?: string })[];
};

export default function SuggestedItinerary() {
  const [days, setDays] = React.useState<SuggestedDay[]>([]);
  const [config, setConfig] = React.useState<TripConfig | null>(null);
  const [imageByKey, setImageByKey] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [visitedPlaces, setVisitedPlaces] = React.useState<Set<string>>(new Set());
  const [locationGroups, setLocationGroups] = React.useState<LocationGroup[]>([]);
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({});

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

  // Group data by location
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

    // Convert to location groups
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

      // Sort items by category, then name
      allItems.sort((a, b) => {
        const categoryCompare = a.category.localeCompare(b.category);
        if (categoryCompare !== 0) return categoryCompare;

        const nameA = a.nameLocal || a.nameEn || "";
        const nameB = b.nameLocal || b.nameEn || "";
        return nameA.localeCompare(nameB);
      });

      return {
        area,
        days: areaDays,
        allItems
      };
    });

    setLocationGroups(groups);
  }, [days]);

  // Toggle visited status for a place
  const handleToggleVisited = (placeId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const updatedVisited = toggleVisitedPlace(placeId);
    setVisitedPlaces(new Set(updatedVisited));
  };

  const toggleCategoryOpen = (area: string, category: SuggestedCategory) => {
    const key = `${area}:${category}`;
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
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

  if (loading) {
    return <div className="flex justify-center py-8"><div className="text-gray-500">Loading suggested activities...</div></div>;
  }

  return (
    <div className="space-y-10">
      {locationGroups.map((group) => (
        <section key={group.area} className="break-inside-avoid-page">
          {/* Location header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.area}</h1>
            <div className="text-gray-500 text-sm">
              {group.days.length} day{group.days.length !== 1 ? 's' : ''} • {group.allItems.length} attractions
            </div>
          </div>

          {/* Category foldable sections */}
          {(() => {
            const itemsByCategory = new Map<SuggestedCategory, (SuggestedItem & { dayDescription?: string })[]>();
            for (const it of group.allItems) {
              const arr = itemsByCategory.get(it.category as SuggestedCategory) || [];
              arr.push(it);
              itemsByCategory.set(it.category as SuggestedCategory, arr);
            }
            const categories = Array.from(itemsByCategory.entries()).sort(([a], [b]) => a.localeCompare(b));

            return (
              <div className="space-y-3">
                {categories.map(([category, items]) => {
                  const sectionKey = `${group.area}:${category}`;
                  const isOpen = !!openSections[sectionKey];

                  const sortedItems = [...items].sort((a, b) => {
                    const nameA = a.nameLocal || a.nameEn || "";
                    const nameB = b.nameLocal || b.nameEn || "";
                    return nameA.localeCompare(nameB);
                  });

                  return (
                    <div key={sectionKey}>
                      <button
                        onClick={() => toggleCategoryOpen(group.area, category)}
                        className="w-full rounded-xl border border-gray-200 bg-white shadow-sm p-4 flex items-center justify-between hover:bg-gray-50"
                        aria-expanded={isOpen}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getCategoryIcon(category)}</span>
                          <span className="text-lg font-medium capitalize">{category}</span>
                          <span className="text-gray-500 text-sm">({items.length})</span>
                        </div>
                        <span className="text-gray-500 text-xl leading-none">{isOpen ? '−' : '+'}</span>
                      </button>

                      {isOpen && (
                        <ul className="mt-3 space-y-3">
                          {sortedItems.map((it) => {
                            const key = it.link;
                            const imageUrl = it.image ?? imageByKey[key];
                            const isVisited = visitedPlaces.has(it.link);

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
                                      </div>
                                      <p className="text-gray-600 text-sm mt-1">{it.summary}</p>
                                      {/* Bottom-right category tag */}
                                      <div className="absolute bottom-2 right-4 flex items-center gap-2 text-gray-500">
                                        <span className="text-lg">{getCategoryIcon(it.category)}</span>
                                        <span className="text-sm capitalize">{it.category}</span>
                                      </div>
                                    </div>
                                  </div>
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </section>
      ))}
    </div>
  );
}




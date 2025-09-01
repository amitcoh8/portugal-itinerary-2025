export function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(' ');
}

// Visited places localStorage utilities
const VISITED_PLACES_KEY = 'travel-itinerary-visited-places';

export function getVisitedPlaces(): Set<string> {
  try {
    const stored = localStorage.getItem(VISITED_PLACES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Set(Array.isArray(parsed) ? parsed : []);
    }
  } catch (error) {
    console.warn('Error loading visited places from localStorage:', error);
  }
  return new Set();
}

export function saveVisitedPlaces(visitedPlaces: Set<string>): void {
  try {
    localStorage.setItem(VISITED_PLACES_KEY, JSON.stringify(Array.from(visitedPlaces)));
  } catch (error) {
    console.warn('Error saving visited places to localStorage:', error);
  }
}

export function toggleVisitedPlace(placeId: string): Set<string> {
  const visited = getVisitedPlaces();
  if (visited.has(placeId)) {
    visited.delete(placeId);
  } else {
    visited.add(placeId);
  }
  saveVisitedPlaces(visited);
  return visited;
}

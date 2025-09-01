

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

// Delay function for rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function geocodePlace(placeName: string, region: string = 'Portugal'): Promise<Coordinates | null> {
  try {
    // Clean and format the query
    const query = `${placeName}, ${region}`;
    const encodedQuery = encodeURIComponent(query);
    
    const url = `http://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1&countrycodes=pt`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Portugal-Itinerary-App/1.0 (https://github.com/user/portugal-itinerary)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const results: NominatimResult[] = await response.json();
    
    if (results.length === 0) {
      console.warn(`No coordinates found for: ${placeName}`);
      return null;
    }

    const result = results[0];
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };
  } catch (error) {
    console.error(`Error geocoding ${placeName}:`, error);
    return null;
  }
}

// Browser-safe geocoding (uses HTTPS and avoids restricted headers)
export async function geocodePlaceBrowser(placeName: string, region: string = 'Portugal'): Promise<Coordinates | null> {
  try {
    const query = `${placeName}, ${region}`;
    const encodedQuery = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1&countrycodes=pt`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const results: NominatimResult[] = await response.json();
    if (!results || results.length === 0) return null;

    const top = results[0];
    return { lat: parseFloat(top.lat), lng: parseFloat(top.lon) };
  } catch (error) {
    console.warn('Browser geocoding failed for', placeName, error);
    return null;
  }
}

export async function geocodeAllPlaces(places: Array<{nameLocal: string, nameEn: string}>, region: string = 'Portugal'): Promise<Record<string, Coordinates>> {
  const coordinates: Record<string, Coordinates> = {};
  
  for (const place of places) {
    // Try with local name first, then English name
    const queries = [place.nameLocal, place.nameEn].filter(Boolean);
    
    for (const query of queries) {
      const coords = await geocodePlace(query, region);
      if (coords) {
        coordinates[place.nameLocal] = coords;
        console.log(`✓ Found coordinates for ${place.nameLocal}: ${coords.lat}, ${coords.lng}`);
        break;
      }
    }
    
    if (!coordinates[place.nameLocal]) {
      console.warn(`✗ Could not find coordinates for: ${place.nameLocal}`);
    }
    
    // Rate limiting: wait 1 second between requests to respect Nominatim's usage policy
    await delay(1000);
  }
  
  return coordinates;
}

// Haversine distance calculation
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
}

export async function getCurrentLocation(): Promise<Coordinates | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.warn('Error getting current location:', error);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
      }
    );
  });
}

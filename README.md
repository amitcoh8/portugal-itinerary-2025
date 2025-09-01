# Travel Itinerary Application

A flexible, configurable travel itinerary app that can be easily customized for any trip.

## Configuration

The application uses a configuration-based architecture that separates the trip-specific data from the application logic. This makes it easy to adapt the app for different trips by simply updating the configuration files.

### Configuration Files

#### 1. Trip Configuration (`data/trip-config.json`)
Contains trip metadata and regional settings:

```json
{
  "tripName": "Your Trip Name",
  "tripSubtitle": "Trip dates or subtitle",
  "locations": [
    {
      "name": "Location 1",
      "startDate": "YYYY-MM-DD"
    },
    {
      "name": "Location 2", 
      "startDate": "YYYY-MM-DD"
    }
  ],
  "regionHints": {
    "mainRegion": "Primary Region",
    "secondaryRegion": "Secondary Region (optional)",
    "secondaryRegionStartDate": "YYYY-MM-DD (optional)"
  }
}
```

#### 2. Itinerary Data (`data/booked-itinerary.json`)
Contains the actual booked itinerary items (flights, stays, etc.):

```json
[
  {
    "date": "YYYY-MM-DD",
    "type": "flight" | "stay" | "food" | "visit",
    "title": "Item title",
    "location": "Location (optional)",
    "details": { /* type-specific details */ },
    "image": "Image URL (optional)",
    "link": "External link (optional)"
  }
]
```

#### 3. Suggested Activities (`data/suggested-itinerary.json`)
Contains suggested activities organized by date:

```json
[
  {
    "date": "YYYY-MM-DD",
    "items": [
      {
        "nameLocal": "Local name",
        "nameEn": "English name", 
        "link": "URL to more info",
        "summary": "Brief description",
        "category": "hike" | "beach" | "food" | "view" | etc.,
        "image": "Image URL (optional)"
      }
    ]
  }
]
```

## How to Adapt for a New Trip

1. **Update Trip Configuration**: Edit `data/trip-config.json` with your trip name, dates, locations, and regional settings.

2. **Replace Itinerary Data**: Replace the contents of `data/booked-itinerary.json` with your actual bookings and itinerary items.

3. **Update Suggested Activities**: Replace `data/suggested-itinerary.json` with activities relevant to your destination(s).

4. **Regional Logic**: The app automatically determines which region an activity belongs to based on the date and your configuration in `regionHints`. This is used for image search and other region-specific features.

## Features

- **Responsive Design**: Works on desktop and mobile devices
- **Two Views**: Toggle between "Booked" (confirmed itinerary) and "Suggested" (potential activities)
- **Progress Tracking**: Shows trip progress based on current date
- **Image Integration**: Automatically fetches Wikipedia images for suggested activities
- **Print Support**: Optimized for printing travel itineraries

## Development

```bash
# Install dependencies
npm install

# Start development server  
npm run dev

# Build for production
npm run build
```

The app is built with React, TypeScript, and Tailwind CSS using Vite as the build tool.

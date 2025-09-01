export type ItineraryType = 'stay' | 'flight' | 'food' | 'visit';

export type FlightSegment = {
  route: string;
  flight: string;
  departure: string;
  arrival: string;
  date?: string;
  link?: string;
};

export type FlightDetails = {
  departure?: { time: string; airport: string; terminal?: string };
  arrival?: { time: string; airport: string; terminal?: string };
  duration?: string;
  flight1?: FlightSegment;
  flight2?: FlightSegment;
  operator?: string;
  status?: string;
};

export type StayDetails = {
  status?: string;
  checkin?: string;
  checkout?: string;
  dates?: string;
  cancellation?: string;
  source?: string;
};

export type VisitOption = {
  label: 'Main' | 'Alternative' | 'Bonus';
  nameLocal: string;
  what: string;
  why: string;
};

export type ItineraryItem = {
  date: string;
  type: ItineraryType;
  title: string;
  location?: string;
  details?: FlightDetails | StayDetails;
  options?: VisitOption[];
  footerNote?: string;
  host?: string;
  image?: string;
  link?: string;
};

// Suggested itinerary types
export type SuggestedCategory =
  | 'hike'
  | 'beach'
  | 'food'
  | 'view'
  | 'town'
  | 'winery'
  | 'monument'
  | 'activity'
  | 'pool'
  | 'waterfall'
  | 'garden'
  | 'market'
  | 'transport';

export type SuggestedItem = {
  nameLocal: string;
  nameEn: string;
  link: string;
  summary: string;
  category: SuggestedCategory;
  image?: string;
};

export type SuggestedDay = {
  date: string;
  area?: string;
  description?: string;
  items: SuggestedItem[];
};

// Configuration types
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

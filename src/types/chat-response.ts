/**
 * Flight search result from Duffel
 */
export interface FlightResult {
  id: string;
  price: {
    amount: number;
    currency: string;
  };
  segments: FlightSegment[];
  totalDuration: number;
  stops: number;
}

export interface FlightSegment {
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  duration: number;
  carrier: string;
  flightNumber: string;
  aircraft: string;
}

/**
 * Parsed flight search parameters from AI
 */
export interface ParsedFlightQuery {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children?: number;
    infants?: number;
  };
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
  maxStops?: number;
}

/**
 * Chat response - parsed query and flight results
 */
export interface ChatResponse {
  /**
   * Parsed flight search parameters
   */
  parsedQuery: ParsedFlightQuery;

  /**
   * Flight search results
   */
  results: FlightResult[];

  /**
   * Search metadata
   */
  metadata: {
    searchId: string;
    resultsCount: number;
    searchTime: number;
    timestamp: string;
  };
}

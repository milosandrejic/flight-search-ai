import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { Duffel } from '@duffel/api';
import type { CreateOfferRequestPassenger, CreateOfferRequestSlice, OfferSliceSegment } from '@duffel/api/types';
import { ParsedFlightQuery, FlightResult } from 'src/types/chat-response';
import { ExternalApiException } from 'src/common/exceptions';

/**
 * Duffel repository - handles all Duffel API interactions for flight search
 */
@Injectable()
export class DuffelRepository {
  private readonly client: Duffel;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(DuffelRepository.name);

    const apiKey = this.config.get<string>('DUFFEL_API_KEY');
    if (!apiKey) {
      throw new Error('DUFFEL_API_KEY is not configured');
    }

    this.client = new Duffel({
      token: apiKey,
    });
  }

  /**
   * Search flights using Duffel API
   */
  async searchFlights(params: ParsedFlightQuery): Promise<FlightResult[]> {
    const startTime = Date.now();

    try {
      this.logger.info(
        {
          origin: params.origin,
          destination: params.destination,
          departureDate: params.departureDate,
        },
        'Searching flights via Duffel',
      );

      // Build passengers array - use discriminated union types
      const passengers: CreateOfferRequestPassenger[] = [];
      
      // Adults use type
      for (let i = 0; i < params.passengers.adults; i++) {
        passengers.push({ type: 'adult' });
      }
      
      // Children use age (assuming 10 years old as default)
      if (params.passengers.children) {
        for (let i = 0; i < params.passengers.children; i++) {
          passengers.push({ age: 10 });
        }
      }
      
      // Infants use age (assuming 1 year old as default)
      if (params.passengers.infants) {
        for (let i = 0; i < params.passengers.infants; i++) {
          passengers.push({ age: 1 });
        }
      }

      // Build slices (flight segments)
      const slices: CreateOfferRequestSlice[] = [
        {
          origin: params.origin,
          destination: params.destination,
          departure_date: params.departureDate,
          arrival_time: null,
          departure_time: null,
        },
      ];

      // Add return slice if round trip
      if (params.returnDate) {
        slices.push({
          origin: params.destination,
          destination: params.origin,
          departure_date: params.returnDate,
          arrival_time: null,
          departure_time: null,
        });
      }

      // Map max stops to Duffel's allowed values (0, 1, or 2)
      let maxConnections: 0 | 1 | 2 | undefined;
      if (params.maxStops !== null && params.maxStops !== undefined) {
        maxConnections = Math.min(2, Math.max(0, params.maxStops)) as 0 | 1 | 2;
      }

      // Create offer request
      const offerRequest = await this.client.offerRequests.create({
        slices,
        passengers,
        cabin_class: params.cabinClass,
        max_connections: maxConnections,
      });

      // List offers from the offer request
      const offersResponse = await this.client.offers.list({
        offer_request_id: offerRequest.data.id,
        sort: 'total_amount',
      });

      const latency = Date.now() - startTime;

      // Transform offers to internal format - return full Duffel segments
      const results: FlightResult[] = offersResponse.data.slice(0, 20).map((offer) => ({
        id: offer.id,
        price: {
          amount: parseFloat(offer.total_amount),
          currency: offer.total_currency,
        },
        segments: offer.slices.flatMap((slice) => slice.segments as OfferSliceSegment[]),
        totalDuration: offer.slices.reduce(
          (total: number, slice) => total + (slice.duration ? parseInt(slice.duration.replace(/[^\d]/g, '')) || 0 : 0),
          0,
        ),
        stops: offer.slices.reduce((total: number, slice) => total + slice.segments.length - 1, 0),
      }));

      this.logger.info(
        {
          resultsCount: results.length,
          latency,
        },
        'Duffel search completed',
      );

      return results;
    } catch (error) {
      const latency = Date.now() - startTime;

      this.logger.error(
        {
          latency,
          error: error instanceof Error ? {
            name: error.name,
            message: error.message,
          } : error,
        },
        'Duffel search failed',
      );

      throw new ExternalApiException('Duffel', error, 'Flight search failed');
    }
  }
}

import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { OpenAiRepository } from 'src/repositories/openai.repository';
import { ParsedFlightQuery } from 'src/types/chat-response';
import { InvalidFlightSearchException } from 'src/common/exceptions';

/**
 * Flight query parser - converts natural language to structured flight search parameters
 */
@Injectable()
export class FlightQueryParser {
  constructor(
    private readonly openAi: OpenAiRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(FlightQueryParser.name);
  }

  /**
   * Parse natural language flight query into structured parameters
   */
  async parse(query: string): Promise<ParsedFlightQuery> {
    this.logger.info({ queryLength: query.length }, 'Parsing flight query');

    const systemPrompt = `Extract flight search parameters from natural language queries.

Rules:
- Use 3-letter IATA airport codes
- Dates in YYYY-MM-DD format
- Default: 1 adult, economy class
- Dates relative to: ${new Date().toISOString().split('T')[0]}

Examples:
- "NYC to London" → origin: JFK, destination: LHR
- "tomorrow" → +1 day from today
- "next week" → +7 days from today`;

    const schema = {
      type: 'object',
      properties: {
        origin: {
          type: 'string',
          description: 'Origin airport IATA code (3 letters)',
        },
        destination: {
          type: 'string',
          description: 'Destination airport IATA code (3 letters)',
        },
        departureDate: {
          type: 'string',
          description: 'Departure date in ISO 8601 format (YYYY-MM-DD)',
        },
        returnDate: {
          type: ['string', 'null'],
          description: 'Return date in ISO 8601 format (YYYY-MM-DD), null for one-way',
        },
        passengers: {
          type: 'object',
          properties: {
            adults: { type: 'integer', minimum: 1, maximum: 9 },
            children: { type: 'integer', minimum: 0, maximum: 9, default: 0 },
            infants: { type: 'integer', minimum: 0, maximum: 9, default: 0 },
          },
          required: ['adults', 'children', 'infants'],
          additionalProperties: false,
        },
        cabinClass: {
          type: 'string',
          enum: ['economy', 'premium_economy', 'business', 'first'],
        },
        maxStops: {
          type: ['integer', 'null'],
          description: 'Maximum number of stops (0 for direct)',
        },
      },
      required: ['origin', 'destination', 'departureDate', 'returnDate', 'passengers', 'cabinClass', 'maxStops'],
      additionalProperties: false,
    };

    try {
      const result = await this.openAi.generateStructuredOutput<ParsedFlightQuery>({
        systemPrompt,
        userPrompt: query,
        schema,
        temperature: 0.3, // Lower temperature for more consistent parsing
      });

      // Validate dates are in the future
      const departureDate = new Date(result.departureDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (departureDate < today) {
        throw new InvalidFlightSearchException(
          'Departure date must be in the future',
          'departureDate',
        );
      }

      if (result.returnDate) {
        const returnDate = new Date(result.returnDate);
        if (returnDate <= departureDate) {
          throw new InvalidFlightSearchException(
            'Return date must be after departure date',
            'returnDate',
          );
        }
      }

      this.logger.info(
        {
          origin: result.origin,
          destination: result.destination,
          departureDate: result.departureDate,
        },
        'Flight query parsed successfully',
      );

      return result;
    } catch (error) {
      if (error instanceof InvalidFlightSearchException) {
        throw error;
      }

      if (error && typeof error === 'object' && 'name' in error) {
        if ((error as { name: string }).name === 'AiValidationException') {
          throw error;
        }
      }

      this.logger.error(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Failed to parse flight query',
      );

      throw new InvalidFlightSearchException('Failed to parse flight query');
    }
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import OpenAI from 'openai';
import { AiValidationException } from 'src/common/exceptions';

/**
 * OpenAI repository - handles all OpenAI API interactions
 */
@Injectable()
export class OpenAiRepository {
  private readonly client: OpenAI;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(OpenAiRepository.name);

    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    this.client = new OpenAI({ apiKey });
  }

  /**
   * Call OpenAI with JSON schema enforcement
   */
  async generateStructuredOutput<T>(params: {
    model?: string;
    systemPrompt: string;
    userPrompt: string;
    schema: Record<string, unknown>;
    temperature?: number;
  }): Promise<T> {
    const startTime = Date.now();

    try {
      const response = await this.client.chat.completions.create({
        model: params.model || 'gpt-4o-mini',
        temperature: params.temperature ?? 0.7,
        messages: [
          { role: 'system', content: params.systemPrompt },
          { role: 'user', content: params.userPrompt },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'response',
            strict: true,
            schema: params.schema,
          },
        },
      });

      const latency = Date.now() - startTime;
      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new AiValidationException('OpenAI returned empty response');
      }

      const parsed = JSON.parse(content) as T;

      this.logger.info(
        {
          model: params.model,
          latency,
          tokens: {
            prompt: response.usage?.prompt_tokens,
            completion: response.usage?.completion_tokens,
            total: response.usage?.total_tokens,
          },
        },
        'OpenAI request completed',
      );

      return parsed;
    } catch (error) {
      const latency = Date.now() - startTime;

      this.logger.error(
        {
          latency,
          error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          } : error,
        },
        'OpenAI request failed',
      );

      if (error instanceof AiValidationException) {
        throw error;
      }

      // Extract meaningful error message
      let errorMessage = 'Failed to generate structured output from OpenAI';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      throw new AiValidationException(errorMessage, error);
    }
  }
}

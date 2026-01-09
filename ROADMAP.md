# Flight Search - Feature Roadmap

## Project Overview
Conversational flight search backend using NestJS + PostgreSQL + Duffel API + OpenAI.
Powers a chat-based frontend where users search flights using natural language.

---

## Phase 1: Foundation & Core Infrastructure

### 1.1 Project Setup
- [x] Initialize NestJS project structure
- [x] Configure TypeScript (strict mode)
- [x] Set up PostgreSQL connection (TypeORM)
- [x] Environment configuration (.env management)
- [x] Docker setup (dev + prod)
- [x] Logging infrastructure (Pino)
- [x] Error handling middleware

**Dependencies:**
- [x] `@nestjs/core`, `@nestjs/common`, `@nestjs/config`
- [x] `class-validator`, `class-transformer`
- [x] ESLint with `@stylistic/eslint-plugin`
- [x] `@nestjs/typeorm`, `typeorm`, `pg`
- [x] `nestjs-pino`, `pino-http`, `pino-pretty`

**Deliverables:**
- [x] Working NestJS app skeleton
- [x] Database connection established
- [x] Docker Compose setup (dev + prod)
- [x] Migration system configured
- [x] Structured logging in place

---

### 1.2 Chat API Implementation
- [x] Chat endpoint (POST /chat)
- [x] Conversation context management
- [x] Input validation framework (class-validator)
- [x] Response formatter (enforce strict JSON)
- [x] Error handling middleware

**API Endpoints to Implement:**
- [x] `POST /chat` - natural language flight search
- [x] `GET /searches/history` - retrieve search history
- [x] `GET /searches/popular` - list popular searches

**Deliverables:**
- [x] Chat endpoint accepting natural language
- [x] Search history tracking (stateless)
- [x] Frontend-ready API responses

---

## Phase 2: AI Natural Language Processing

### 2.1 OpenAI Integration
- [x] OpenAI client wrapper
- [x] Prompt engineering for flight query parsing
- [x] Response schema enforcement (JSON mode)
- [x] Token usage tracking
- [x] Cost estimation per request
- [x] Retry logic with exponential backoff

**Tool:** `parse_flight_query`

**Input Schema:**
```typescript
{
  query: string  // e.g., "cheap flight from NYC to London next week"
}
```

**Output Schema:**
```typescript
{
  origin: string           // IATA code (e.g., "JFK")
  destination: string      // IATA code
  departureDate: string    // ISO 8601
  returnDate?: string      // optional for round-trip
  passengers: {
    adults: number
    children: number
    infants: number
  }
  cabinClass: "economy" | "premium_economy" | "business" | "first"
  maxStops?: number
  flexibility?: {
    dates: boolean         // ±3 days
    airports: boolean      // include nearby airports
  }
}
```

**Tasks:**
- [x] Create OpenAI service module
- [x] Define prompt template for flight extraction
- [x] Validate IATA codes from LLM output
- [x] Handle ambiguous queries gracefully
- [x] Log all AI interactions (no PII)

---

## Phase 3: Flight Search via Duffel API

### 3.1 Duffel Provider Abstraction
- [x] Create FlightProvider interface
- [x] Implement DuffelProvider (wraps Duffel API)
- [x] HTTP client with retry logic
- [x] Rate limit handling
- [x] Response normalization to internal format

**Interface:**
```typescript
interface FlightProvider {
  search(params: FlightSearchParams): Promise<Flight[]>
  getOfferDetails(offerId: string): Promise<FlightOffer>
}
```

**Tasks:**
- [x] Duffel API authentication
- [x] Offer search endpoint integration
- [x] Map Duffel response to internal Flight model
- [x] Handle API errors (quota, timeouts, invalid requests)
- [ ] Cache frequent searches (Redis/in-memory)

---

### 3.2 Flight Search Tool
**Tool:** `search_flights`

**Input Schema:**
```typescript
{
  origin: string           // validated IATA
  destination: string
  departureDate: string    // ISO 8601
  returnDate?: string
  passengers: {
    adults: number
    children?: number
    infants?: number
  }
  cabinClass: string
  maxStops?: number
}
```

**Output Schema:**
```typescript
{
  results: [
    {
      id: string           // Duffel offer ID
      price: {
        amount: number     // minor units (cents)
        currency: string
      }
      segments: [
        {
          origin: string
          destination: string
          departure: string  // ISO 8601
          arrival: string
          duration: number   // minutes
          carrier: string    // airline IATA
          flightNumber: string
          aircraft: string
        }
      ]
      totalDuration: number
      stops: number
    }
  ]
  searchMetadata: {
    origin: string
    destination: string
    date: string
    resultsCount: number
    searchTime: number     // ms
  }
}
```

**Tasks:**
- [x] Implement search_flights tool handler
- [x] Validate all inputs before Duffel call
- [x] Transform Duffel offers to normalized format
- [x] Sort results (default: by price)
- [x] Limit results (max 20-50)

---

## Phase 4: AI Flight Ranking (Optional)

### 4.1 Intelligent Flight Ranking
**Tool:** `rank_flights`

**Purpose:** Re-rank flight results based on user preferences with AI explanations.

**Input Schema:**
```typescript
{
  flights: Flight[]        // output from search_flights
  preferences?: {
    prioritize: "price" | "duration" | "convenience"
    avoid?: string[]       // airlines, long layovers
    prefer?: string[]      // direct flights, specific airlines
  }
  userContext?: string     // natural language context
}
```

**Output Schema:**
```typescript
{
  rankedFlights: [
    {
      flight: Flight
      rank: number
      score: number
      explanation: string  // short (1-2 sentences)
    }
  ]
}
```

**Tasks:**
- [ ] Implement ranking algorithm
- [ ] Use OpenAI for explanation generation
- [ ] Keep explanations concise
- [ ] Cache rankings for identical queries

---

## Phase 5: Observability & Production Readiness

### 5.1 Logging & Metrics
- [ ] Structured logging for all tool calls
- [ ] Track external API latencies (Duffel, OpenAI)
- [ ] Count tool invocations
- [ ] Track success/error rates
- [ ] Cost tracking (API usage)

**Log Format:**
```typescript
{
  timestamp: ISO8601,
  level: "info" | "error",
  service: "flight-search-mcp",
  event: "tool.call" | "api.duffel" | "api.openai",
  data: {
    tool: string,
    latency: number,
    success: boolean,
    error?: string
  }
}
```

---

### 5.2 Database Schema
**Tables:**

1. `flight_searches` (already created)
   - id (UUID)
   - origin (string)
   - destination (string)
   - departure_date (date)
   - return_date (date, nullable)
   - results_count (integer)
   - search_time_ms (integer)
   - created_at (timestamp)

**Tasks:**
- [x] Create flight_searches table migration
- [x] Run migration (table created)
- [ ] Add retention policy (90 days)
- [ ] Create entity class for TypeORM

---

### 5.3 Testing
- [ ] Unit tests for core services
- [ ] Integration tests for Duffel provider
- [ ] MCP tool end-to-end tests
- [ ] Mock OpenAI responses for testing
- [ ] Load testing for concurrent requests

---

### 5.4 Documentation
- [ ] API documentation (tool schemas)
- [ ] Setup guide (environment variables)
- [ ] Duffel API integration guide
- [ ] MCP client configuration examples
- [ ] Troubleshooting guide

---

## Phase 6: Enhancements (Future)

### 6.1 Advanced Features
- [ ] Multi-city flight search
- [ ] Flexible date search (±3 days)
- [ ] Price alerts and tracking
- [ ] Airline preference learning
- [ ] Historical price data

### 6.2 Performance Optimizations
- [ ] Redis caching for popular routes
- [ ] Response compression
- [ ] Batch requests to Duffel
- [ ] Database query optimization

### 6.3 Additional Providers
- [ ] Add secondary flight API (fallback)
- [ ] Provider failover logic
- [ ] Compare prices across providers

---

## Success Metrics

### MVP (Phase 1-3)
- MCP server responds to `parse_flight_query` and `search_flights`
- Successfully parses natural language queries (80%+ accuracy)
- Returns Duffel flight results in <2 seconds
- All tool calls logged to database

### Production Ready (Phase 5)
- 99%+ tool call success rate
- <3 second end-to-end latency
- <$0.05 cost per search (OpenAI + Duffel)
- Zero data leaks (no PII in logs)

---

## Current Status
- [x] Project initialization
- [x] NestJS app running with health check endpoint
- [x] TypeScript strict mode configured
- [x] ESLint with stylistic plugin configured
- [x] Environment configuration ready
- [x] PostgreSQL + TypeORM integrated
- [x] Database migrations system configured
- [x] flight_searches table created
- [x] Docker Compose setup (dev + prod)
- [x] Pino structured logging configured
- [x] Global exception filter with structured errors
- [x] Phase 1.1: Project Setup (complete)
- [ ] Phase 1.2: Chat API Implementation (next)
- [ ] Phase 2: AI Integration (OpenAI natural language parsing)
- [ ] Phase 3: Flight Search (Duffel API)
- [ ] Phase 4: Ranking
- [ ] Phase 5: Production Readiness

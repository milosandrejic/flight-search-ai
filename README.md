# flight-search-mcp

Flight Search MCP server - A Model Context Protocol server for intelligent flight search using NestJS, Duffel API, and OpenAI.

## About

This project implements an [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server that enables AI assistants to search for flights using natural language queries.

## Quick Start with Docker

### Development (local code + containerized database)
```bash
# Start PostgreSQL only
docker-compose -f docker-compose.dev.yml up -d

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Run migrations
npm run migration:run

# Start development server
npm run start:dev
```

### Production (full stack in containers)
```bash
# Copy environment file and add API keys
cp .env.example .env

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## Local Development (without Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL 16+

### Setup
```bash
# Install dependencies
npm install

# Create database
createdb flight_search_mcp

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and API keys

# Run migrations
npm run migration:run

# Start development server
npm run start:dev
```

## Available Scripts

- `npm run start:dev` - Start development server with watch mode
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix code style issues
- `npm run migration:run` - Apply database migrations
- `npm run migration:revert` - Rollback last migration
- `npm run migration:create` - Create new migration

## References

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Project Roadmap](./ROADMAP.md)
- [AI Agent Instructions](./.github/copilot-instructions.md)
- [Database Migrations Guide](./MIGRATIONS.md)

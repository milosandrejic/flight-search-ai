# Flight Search AI Backend

Conversational flight search backend using NestJS + PostgreSQL + OpenAI + Duffel API.

## Stack

- **NestJS** - Backend framework
- **PostgreSQL** - Database (TypeORM)
- **OpenAI** - Natural language parsing
- **Duffel API** - Flight search
- **Pino** - Structured logging

## Quick Start

```bash
# Start database
docker-compose -f docker-compose.dev.yml up -d

# Setup
cp .env.example .env
npm install
npm run migration:run

# Run
npm run start:dev
```

## Scripts

- `npm run start:dev` - Development server
- `npm run build` - Production build
- `npm run migration:run` - Apply migrations
- `npm run migration:create` - New migration
- `npm run lint:fix` - Fix linting

## Production

```bash
docker-compose up -d
```

## References

- [ROADMAP.md](./ROADMAP.md) - Feature roadmap
- [MIGRATIONS.md](./MIGRATIONS.md) - Database migrations
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - AI guidelines

# Database Migration Guide

## Overview
All database schema changes MUST be done through migrations. Never create tables manually.

## Available Commands

### Create a new migration
```bash
npm run migration:create src/database/migrations/YourMigrationName
```

### Generate migration from entity changes
```bash
npm run migration:generate src/database/migrations/YourMigrationName
```

### Run pending migrations
```bash
npm run migration:run
```

### Revert last migration
```bash
npm run migration:revert
```

### Show migration status
```bash
npm run migration:show
```

## Migration Workflow

1. **Create Entity** - Define your TypeScript entity with decorators
2. **Generate Migration** - Run `npm run migration:generate` to create migration from entity changes
3. **Review Migration** - Always review generated SQL before running
4. **Run Migration** - Execute `npm run migration:run` to apply changes
5. **Test Rollback** - Verify `down()` method works with `npm run migration:revert`

## Critical Rules

- ✅ ALWAYS use migrations for schema changes
- ✅ ALWAYS test both `up()` and `down()` methods
- ✅ ALWAYS add indexes for frequently queried columns
- ❌ NEVER use `synchronize: true` in production
- ❌ NEVER modify existing migrations after they've been run
- ❌ NEVER create tables manually via SQL client

## Initial Setup

1. Create local PostgreSQL database:
```bash
createdb flight_search_mcp
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update database credentials in `.env`

4. Run initial migration:
```bash
npm run migration:run
```

## Database Schema

### flight_searches
Logs all flight searches to track popular routes and display on frontend.
- `origin`, `destination` - route information
- `departure_date`, `return_date` - travel dates
- `results_count` - how many flights were found
- `search_time_ms` - query performance tracking

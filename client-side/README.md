# Climate Event Stream Aggregator - Backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start PostgreSQL and Redis

4. Run migrations:
```bash
npm run typeorm migration:run
```

5. Start development server:
```bash
npm run dev
```

## API Endpoints

- `GET /candlesticks?city=Berlin&from=2023-01-01&to=2023-01-02` - Get candlestick data
- `GET /health` - Health check

## Architecture

- **Domain Layer**: Business logic and models
- **Application Layer**: Services and use cases
- **Infrastructure Layer**: External dependencies (DB, Redis, WS)
- **Presentation Layer**: HTTP API (Fastify)

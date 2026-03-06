# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev      # Start dev server (Next.js with Turbopack)
npm run build    # Production build
npm start        # Start production server
```

No test runner or linter is configured.

## Architecture

WxFx is a Next.js 16 (App Router) weather dashboard using React 19, Tailwind CSS v4, and SWR. It fetches data exclusively from the free NWS (National Weather Service) API — no API keys required.

### Data Flow

Client components use SWR hooks (`hooks/useWeather.ts`, `hooks/useWeatherAlerts.ts`) that poll internal API routes. The API routes (`app/api/weather/[locationId]/*`) proxy requests to the NWS API server-side with `revalidate` caching (15 min for forecasts, 5 min for alerts). NWS grid coordinates are resolved at runtime via `/points/{lat},{lon}` and cached in-memory in `lib/api/nwsWeather.ts`.

### Key Patterns

- **NWS gridpoint expansion**: `expandLayer` in `lib/api/nwsWeather.ts` converts NWS ISO 8601 duration time-series into individual hourly slots with unit conversion (metric to US customary).
- **Tailwind v4**: No `tailwind.config` file — uses `@import 'tailwindcss'` in `globals.css` with the `@tailwindcss/postcss` plugin.
- **Path alias**: `@/*` maps to project root (e.g., `@/types/weather`).
- **Timezone**: All time formatting defaults to `America/Chicago`. Daytime is defined as hours 6–20.

### Locations

8 hardcoded locations in `data/locations.ts`, grouped into two regions: `southern-plains` (OKC, Tulsa, Springfield MO, Dallas) and `wdw` (Magic Kingdom, EPCOT, Hollywood Studios, Animal Kingdom). Add new locations by adding entries with `id`, `name`, `shortName`, `lat`, `lon`, `region`, `state`.

### Routes

| Route | Purpose |
|---|---|
| `/` | Redirects to `/weather` |
| `/weather` | Dashboard showing all locations |
| `/weather/[locationId]` | Detail view with hourly timeline, 7-day forecast, alerts |
| `/api/weather/[locationId]/gridpoint` | NWS numerical data proxy |
| `/api/weather/[locationId]/forecast` | NWS 7-day text forecast proxy |
| `/api/weather/[locationId]/alerts` | NWS active alerts proxy |

### Environment Variables

- `NWS_USER_AGENT` — Optional. User-Agent string for NWS API requests (defaults to `WxFx/1.0 (michaelccollins@icloud.com)`).

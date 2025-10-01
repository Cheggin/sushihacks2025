# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm install` - Install dependencies
- `npm run dev` - Start both Vite frontend dev server and Convex backend in parallel
- `npm run dev:frontend` - Start only the Vite frontend development server
- `npm run dev:backend` - Start only the Convex backend development
- `npm run predev` - Run Convex dev until success and open dashboard
- `npm run build` - Build the project for production (TypeScript compilation + Vite build)
- `npm run lint` - Run TypeScript type checking and ESLint
- `npm run preview` - Preview production build locally
- `convex dashboard` - Open the Convex dashboard in browser

## Architecture

This is a **Convex + React + Vite** full-stack application for fishery and health monitoring. The project combines:
- **Convex** as the backend (database, server logic, real-time data)
- **React 19** with TypeScript for the frontend
- **Vite** for optimized development and production builds
- **Tailwind CSS v4** for styling
- **React Router v7** for client-side routing
- **Recharts** for data visualization
- **Leaflet/React-Leaflet** for interactive maps

### Application Purpose
The app provides three main features accessible via a dashboard interface:
1. **Dashboard (HomePage)** - Displays fish catch data, KPI trends, fish type distribution, and real-time weather
2. **Map (FishMapPage)** - Interactive map showing fish distribution across Asia-Pacific with filtering by species and view modes (points/zones)
3. **Health (HealthPage)** - Carpal Tunnel Syndrome (CTS) risk assessment for fishery workers with grip strength tracking

### Key Structure
- `/src` - Frontend React application
  - `/pages` - Main page components (HomePage, FishMapPage, Health)
  - `/components` - Reusable UI components (Navbar, PageLayout, FishMap, Card)
  - `App.tsx` - Root component with popup-based navigation state management
  - `main.tsx` - Application entry point with React, React Router, and ConvexProvider setup
- `/convex` - Backend Convex functions and schema
  - `schema.ts` - Database table definitions with Convex validators
  - `myFunctions.ts` - Example queries, mutations, and actions
  - `/_generated` - Auto-generated API and type definitions
- `/public` - Static assets (logo.png, avatar.png, etc.)

### Import Aliases
The project uses `@/` as an alias for `/src` directory, configured in:
- `vite.config.ts` - Bundler resolution
- `tsconfig.app.json` - TypeScript path mapping

### Convex Backend Guidelines
This project follows the Convex best practices outlined in `.cursor/rules/convex_rules.mdc`:
- **Always use the new function syntax** with explicit `args`, `returns`, and `handler` properties
- **Use `query`, `mutation`, `action`** for public API functions
- **Use `internalQuery`, `internalMutation`, `internalAction`** for private functions
- **Always include validators** for all function arguments and return values using `v.*` from `convex/values`
- **Use file-based routing** - functions in `convex/example.ts` are accessed via `api.example.functionName`
- **Define indexes** in schema instead of using `.filter()` on queries, then use `.withIndex()`
- **Use `.order('asc' | 'desc')` and `.take(n)`** for efficient querying
- **Call other functions** via `ctx.runQuery()`, `ctx.runMutation()`, or `ctx.runAction()` with function references from `api` or `internal`

### Navigation Pattern
The app uses a **popup-based navigation system** instead of traditional routing:
- State managed in `App.tsx` with `activePopup` (which page to show) and visibility flags
- Clicking navbar buttons toggles pages with fade/slide animations
- Only one page is visible at a time with smooth transitions
- Pages are conditionally rendered based on `activePopup` state

### Styling Approach
- **Tailwind CSS v4** with custom configuration via `@tailwindcss/vite` plugin
- **Glass morphism design** - translucent backgrounds with backdrop blur effects
- **Blue gradient theme** - `from-[#1d3f8b] via-[#2b6cb0] to-[#2563eb]` background
- **Responsive design** with mobile-first approach
- Custom color variables for text, borders, backgrounds, and semantic colors (primary, secondary, warning, danger)

### React Patterns
- **React 19** features enabled (strict mode, new JSX transform)
- **Hooks-based components** - all components are function components using hooks
- **TypeScript strict mode** with explicit prop interfaces
- **Controlled form inputs** with local state management
- **Data fetching** via Convex `useQuery` and `useMutation` hooks (when integrated)

### Environment Variables
- `VITE_CONVEX_URL` - Convex backend URL (required for ConvexProvider)
- Set in `.env.local` (not committed to git)

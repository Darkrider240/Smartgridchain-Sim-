# GridChain Simulator

GridChain Simulator is a browser-based microgrid simulation with a tamper-evident blockchain ledger. It models solar generation, battery behavior, grid exchange, and records state transitions as blocks. The UI includes a user/admin login, admin governance console, real-time weather integration, and a map-based location selector. The project aims in teaching about how the block chain technology works and how Micro grid transitions take place. Only for educational purpose.

## Features

- **Microgrid simulation** with solar, load, battery SOC, and grid import/export.
- **Blockchain ledger** for state snapshots, integrity checks, and tamper detection.
- **Admin console** for user approvals and system monitoring.
- **Manual block injection** to simulate malicious tampering.
- **Real weather data** via Open-Meteo (no API key required).
- **Interactive map** for location-based solar estimation.

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind (CDN)
- Leaflet + React-Leaflet
- Lucide icons

## Getting Started

**Prerequisites:** Node.js 18+ recommended

1. Install dependencies:
   `npm install`
2. Start the dev server:
   `npm run dev`

Open the URL shown in the terminal.

## Demo Credentials

- **Admin user:** `admin`
- **Admin password:** `admin123` (visual-only demo field)
- **Admin key (for audits/manual blocks):** `admin_key_123`

> Note: Authentication is a mock in-memory flow for demo purposes only.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview build

## Data Sources

- Weather data: Open-Meteo public API

## License

This project is provided as-is for educational and demo use.

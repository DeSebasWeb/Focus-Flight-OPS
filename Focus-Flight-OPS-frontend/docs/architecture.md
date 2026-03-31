# Focus Flight Ops - Architecture Document

## Overview

Focus Flight Ops is a mobile application for professional drone pilots in Colombia, designed to ensure every flight operation is 100% legal, safe, and documented under Colombian aviation regulations (RAC 91 Apendice 13 / RAC 100).

## Regulatory Context

As of May 1, 2025, Colombia transitioned from RAC 91 Appendice 13 to **RAC 100** (Resolution 03034/2024). This architecture satisfies both regulatory frameworks since the core data obligations remain substantially the same:

- Drone registration for aircraft >= 200g (MTOW up to 25 kg for civil ops)
- UAS pilot competency certificate issued by UAEAC
- Pre-flight inspection with maintenance log evidence
- Flight log: pilot name/ID, date, takeoff/landing times, total flight time, manufacturer, model, aircraft characteristics, operation type and conditions
- Maximum altitude 123m AGL, maximum range 500m from operator (VLOS)
- 5km exclusion from airports; prohibited zones around military, government, prisons, critical infrastructure
- Insurance coverage (poliza de responsabilidad civil extracontractual)

## Architecture: Hexagonal (Ports & Adapters) + Clean Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  React Native Screens, Components, Hooks, Navigation        │
│  (depends on Application layer only)                        │
├─────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                        │
│  Use Cases, DTOs, Domain Services                           │
│  (depends on Core layer only)                               │
├─────────────────────────────────────────────────────────────┤
│                    CORE LAYER (Domain)                      │
│  Entities, Value Objects, Enums, Port Interfaces, Errors    │
│  (ZERO external dependencies)                               │
├─────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE LAYER                     │
│  Database, API Adapters, Device Services, DI Container      │
│  (implements Core ports, injected into Application)         │
└─────────────────────────────────────────────────────────────┘
```

### Dependency Rule

Dependencies always point inward:
- `presentation` -> `application` -> `core`
- `infrastructure` implements `core/ports/outbound`
- Nothing in `core` imports from any outer layer

### SOLID Principles

- **S** (Single Responsibility): Each use case handles one business operation. Each adapter handles one external concern.
- **O** (Open/Closed): New checklist types, weather providers, or map providers are added by creating new adapters without modifying existing code.
- **L** (Liskov Substitution): All repository and provider implementations are interchangeable through their port interfaces.
- **I** (Interface Segregation): Ports are split by concern (IDroneRepository, IGeofenceProvider, IWeatherProvider), not bundled into monolithic interfaces.
- **D** (Dependency Inversion): Use cases depend on port interfaces defined in Core, never on concrete SQLite or API implementations. The DI container wires adapters at startup.

## Modules

1. **Fleet & Pilot Profile**: Drone registration (Aerocivil matricula), insurance policies (RC extracontractual), pilot certificates (UAEAC)
2. **Pre-flight Legal**: Geofencing (No-Fly Zones), weather conditions, NOTAMs
3. **Safety Protocol**: Step-by-step checklists (Pre-assembly, Configuration, Pre-takeoff)
4. **Automated Logbook**: Flight hours, GPS telemetry, mission purpose
5. **Emergency**: ATC contacts, flyaway protocols, emergency event logging

## Technology Stack

- **Framework**: React Native (Expo managed or bare workflow)
- **Language**: TypeScript (strict mode)
- **Local DB**: WatermelonDB (SQLite-based, offline-first)
- **State Management**: Zustand (lightweight, TypeScript-friendly)
- **Maps**: Mapbox SDK (offline tile support)
- **Navigation**: React Navigation v7
- **DI**: tsyringe (decorator-based DI container)
- **Testing**: Jest + React Native Testing Library

## External APIs

| Service | Purpose | Tier |
|---------|---------|------|
| Open-Meteo | Weather data (primary) | Free |
| OpenWeatherMap | Weather (fallback) | Free tier |
| IDEAM | Colombian weather stations | Free |
| Mapbox | Map rendering + offline tiles | Free tier |
| AirMap | Airspace advisories | Free tier |
| ICAO API | NOTAMs | Varies |

## Offline-First Strategy

The app must function without internet connectivity since drone operations often occur in rural areas. Strategy:
- All checklists bundled as JSON assets
- Restricted zones bundled as GeoJSON
- WatermelonDB for all local data persistence
- Mapbox offline tile packs for operational areas
- Weather data cached with 1-hour TTL
- Sync to cloud when connectivity is available

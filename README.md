# Focus Flight Ops

Plataforma profesional para pilotos de drones en Colombia. Cumplimiento RAC 100, espacio aereo UAEAC en tiempo real, checklists de seguridad, telemetria GPS, indice Kp geomagnetico, exportar bitacora PDF, firma digital y modo offline.

## Stack

| Componente | Tecnologia |
|---|---|
| **Backend** | NestJS 11 + Prisma 6 + PostgreSQL 17 |
| **Frontend** | React Native (Expo SDK 54) + TypeScript |
| **Arquitectura** | Hexagonal (Ports & Adapters) + SOLID |
| **Auth** | JWT + Refresh Tokens (SHA-256) |
| **Datos aereos** | UAEAC ArcGIS FeatureServer (tiempo real) |
| **Clima** | Open-Meteo API |
| **Geomagnetico** | NOAA SWPC Kp Index |

## Quick Start

```bash
# 1. Clonar
git clone https://github.com/DeSebasWeb/Focus-Flight-OPS.git
cd Focus-Flight-OPS

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Levantar PostgreSQL (si no tienes uno corriendo)
# Descomenta el servicio postgres en docker-compose.yml

# 4. Backend
cd focus-flight-ops-backend
npm install
npx prisma migrate deploy
npx prisma db seed
cd ..

# 5. Levantar backend en Docker
docker compose up -d backend

# 6. Frontend
cd Focus-Flight-OPS-frontend
npm install
# Editar .env con tu IP local
npm start
```

## Estructura

```
Focus-Flight-OPS/
├── focus-flight-ops-backend/     # NestJS API (44 endpoints)
├── Focus-Flight-OPS-frontend/    # React Native Expo (20 pantallas)
├── scripts/init-db.sql           # Init script PostgreSQL
├── docker-compose.yml            # Orquestacion Docker
└── CLAUDE.md                     # Documentacion tecnica completa
```

## Licencia

All Rights Reserved. Este software es propiedad privada.

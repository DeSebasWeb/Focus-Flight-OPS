# Focus Flight Ops - Contexto del Proyecto

## Qué es
Plataforma full-stack para pilotos de drones profesionales en Colombia. Garantiza que cada operación de vuelo sea 100% legal, segura y documentada bajo RAC 91 Apéndice 13 / RAC 100.

## Owner
Juan Rodriguez (juans) - Developer y piloto de drones profesional en Colombia.

## Estructura del Proyecto

```
c:\Users\juans\Projects\focus-flight-ops\
├── Focus-Flight-OPS-backend\     # NestJS + Prisma + PostgreSQL
├── Focus-Flight-OPS-frontend\    # React Native (Expo SDK 54)
├── docker-compose.yml            # Backend dockerizado
├── scripts\init-db.sql           # Init script para PostgreSQL
└── CLAUDE.md                     # Este archivo
```

## Stack Técnico

### Backend (Focus-Flight-OPS-backend/)
- **Framework:** NestJS 11 con TypeScript strict
- **Arquitectura:** Hexagonal estricta (Ports & Adapters) + SOLID
- **ORM:** Prisma 6.19 con auto-migrations
- **DB:** PostgreSQL 17 en Docker (puerto 5432, password: 2607)
- **Auth:** JWT (solo `sub` en payload - sin PII), refresh tokens SHA-256, bcrypt
- **Puerto:** 3001

### Frontend (Focus-Flight-OPS-frontend/)
- **Framework:** React Native con Expo SDK 54
- **State:** Zustand
- **Navegación:** React Navigation v7 (Bottom Tabs + Native Stacks)
- **Iconos:** @expo/vector-icons (Ionicons)
- **HTTP:** Axios con interceptores JWT + refresh automático
- **Token Storage:** expo-secure-store
- **Mapas:** WebView + Leaflet.js (porque react-native-maps no funciona en Expo Go)

## Arquitectura Backend (Hexagonal)

```
src/
├── domain/              # CAPA INTERNA - Zero dependencias de NestJS/Prisma
│   ├── enums/index.ts
│   ├── errors/index.ts
│   └── ports/
│       ├── inbound/index.ts    # Interfaces de servicios (IAuthService, IDroneService, etc.)
│       └── outbound/index.ts   # Interfaces de repos + data types (IUserRepository, DroneData, etc.)
├── application/
│   ├── services/        # Implementaciones (AuthServiceImpl, DroneServiceImpl, etc.)
│   └── dto/             # DTOs con class-validator
├── infrastructure/
│   ├── adapters/
│   │   ├── inbound/rest/       # Controllers HTTP
│   │   ├── inbound/guards/     # JwtAuthGuard
│   │   ├── outbound/persistence/  # PrismaXxxRepository
│   │   ├── outbound/external/     # OpenMeteoWeatherAdapter, LocalGeofenceAdapter
│   │   └── outbound/security/     # JwtTokenProvider, BcryptPasswordHasher
│   ├── modules/         # NestJS modules (composición DI con INJECTION_TOKENS)
│   └── prisma/          # schema.prisma + migrations + seed.ts
├── shared/
│   ├── constants/injection-tokens.ts
│   ├── filters/domain-exception.filter.ts
│   ├── interceptors/response-transform.interceptor.ts
│   └── decorators/current-user.decorator.ts
├── app.module.ts
└── main.ts
```

## Base de Datos - 22 Tablas en 3NF

**Autenticación:** users, refresh_tokens
**Piloto:** pilots (FK -> users, 1:1)
**Documentos:** certificates, insurance_policies
**Flota:** drone_manufacturers, drone_models, drones
**Operaciones:** mission_purposes, missions
**Vuelos:** flight_logs, flight_weather_snapshots, telemetry_points
**Checklists:** checklist_templates, checklist_item_categories, checklist_template_items, checklist_executions, checklist_execution_items
**Emergencias:** emergency_contacts, emergency_events, emergency_event_actions
**Espacio aéreo:** airspace_zone_types, airspace_zones

### Normalizaciones 3NF aplicadas:
- drone_manufacturers + drone_models extraídos de drones
- mission_purposes extraído de missions
- flight_weather_snapshots separado de flight_logs
- checklist_item_categories extraído
- emergency_event_actions normalizado de JSON a tabla
- airspace_zone_types extraído

### Datos seed existentes:
- 3 fabricantes (DJI, Autel, Skydio), 13 modelos de drones
- 10 propósitos de misión
- 4 templates de checklist con 45 items
- 6 categorías de items de checklist
- 10 contactos de emergencia (ATC Colombia)
- 6 tipos de zonas aéreas, 17 zonas restringidas colombianas

## API REST - 44 Endpoints bajo /api/v1/

```
Auth:     POST /register, /login, /refresh, /logout | GET /me
Pilots:   GET /me, POST /, PUT /me
Drones:   GET /models, GET /, GET /:id, POST /, PUT /:id, DELETE /:id
Certs:    GET /, GET /expiring, POST /, DELETE /:id
Insurance: GET /, GET /active, POST /, PUT /:id
Missions: GET /purposes, GET /, GET /:id, POST /, PUT /:id, PATCH /:id/status
FlightLogs: GET /, GET /:id, POST /start, PATCH /:id/end, POST /:id/telemetry, GET /:id/telemetry
Checklists: GET /templates, GET /templates/:type, POST /executions, PATCH .../items/:id, PATCH .../finalize, GET /missions/:id
Weather:  GET /current?lat&lng, GET /forecast?lat&lng&hours
Geofence: GET /check?lat&lng, GET /zones?lat&lng&radiusKm
Emergency: GET /contacts, GET /contacts/nearest, GET /flyaway-protocol, POST /events, PATCH .../actions, PATCH .../resolve
```

## Frontend - Pantallas Actuales (20)

**Dashboard:** DashboardScreen (resumen flota, clima, alertas, acciones rápidas)
**Auth:** LoginScreen, RegisterScreen
**Onboarding:** OnboardingScreen (4 pasos: bienvenida, perfil piloto, próximos pasos, listo)
**Fleet:** DroneListScreen, DroneDetailScreen (+ QR code), PilotProfileScreen, RegisterDroneScreen, CreatePilotProfileScreen, MaintenanceHistoryScreen
**Pre-Flight:** PreFlightScreen (unificada: mapa + clima + legal), AirspaceMapScreen
**Mission:** CreateMissionScreen
**Checklist:** ChecklistScreen (3 fases + captura de fotos + firma digital)
**Flight:** ActiveFlightScreen (HUD con telemetría GPS real), FlightLogListScreen, FlightLogDetailScreen (+ exportar PDF RAC 100)
**Emergency:** EmergencyDashboardScreen, FlyawayProtocolScreen

**Componentes comunes:** Card, StatusBadge, ProgressBar, EmergencyFAB (con pulso animado), ThemedInput, ThemedButton (con haptic feedback), Skeleton/SkeletonCard/SkeletonList, AnimatedListItem, AnimatedSplash, BottomSheetModal, OfflineBanner, SignaturePad

## Sistema de Tema (Dark/Light) - COMPLETADO

Todas las 20 pantallas y componentes usan el sistema de estilos dinámico:
- Hook `useStyles(createStyles)` memoiza estilos basados en el tema activo
- ThemeContext enriquecido con typography, spacing, borderRadius, touchTarget, layout
- Mapas usan `colors.mapTileUrl` dinámico (dark/light tiles)
- Tab bar, headers, splash screen - todos reactivos al tema
- Bottom sheet para selector de tema (Oscuro/Claro/Sistema)

### Design System:
1. `useStyles(createStyles)` - hook central que recibe StyleTheme con todos los tokens
2. `createStyles` - función fuera del componente que genera estilos dinámicos
3. `useTheme()` - solo para valores inline dinámicos (Ionicons color, etc.)

## UX Profesional
- **Pull-to-refresh** en 6 pantallas (DroneList, FlightLogList, PilotProfile, PreFlight, Emergency, Checklist)
- **Skeleton loaders** en 5 pantallas (DroneList, FlightLogList, PilotProfile, Checklist, Emergency)
- **Haptic feedback** en 7+ puntos (EmergencyFAB, checklist toggle, start/end flight, theme toggle, logout)
- **Bottom sheet modals** (selector de tema, historial de mantenimiento)
- **Animaciones** (AnimatedListItem fade+slide en listas, EmergencyFAB pulso, AnimatedSplash)
- **Splash screen animado** con logo bounce + progress bar

## Features Implementados
- **Exportar PDF RAC 100** - Bitácora de vuelo con formato Aeronáutica Civil
- **Captura fotográfica** en checklists para items con requiresPhoto
- **Firma digital del piloto** - Canvas HTML5 via WebView al finalizar checklist
- **QR Code por drone** - Generación y compartir QR con datos del drone
- **Historial de mantenimiento** - Pantalla local-first por drone
- **Notificaciones de vencimiento** - Push locales a 30, 15, 7 días
- **Modo offline** - Cache SQLite para contactos emergencia, checklists, protocolo flyaway
- **Onboarding flow** - 4 pasos post-registro con creación de perfil piloto
- **Dashboard principal** - Tab de inicio con clima, alertas, flota, acciones rápidas

## Usuario de prueba existente en DB
- Email: juan@focusflight.co
- Password: SecurePass123
- ID: a2c67283-4fb6-4406-aee2-dbaef9a8aea2

## Seguridad JWT
- Token payload solo contiene `{ sub: userId }` - sin email ni datos personales
- JwtAuthGuard resuelve email y pilotId desde DB, no del token
- Refresh tokens hasheados con SHA-256 en tabla refresh_tokens

## Integraciones Externas
- **Open-Meteo:** API de clima gratuita sin API key. Adaptador en OpenMeteoWeatherAdapter
- **Geofence:** 17 zonas colombianas con cálculo Haversine en LocalGeofenceAdapter
- **DJI:** Estructura lista para DJI FlightHub 2 OpenAPI pero no implementado (requiere credenciales enterprise)

## Docker

```bash
# DB ya corre en contenedor 'postgresql' existente (puerto 5432)
# Backend puede correr en Docker o local:
docker compose up -d backend          # Dockerizado
cd Focus-Flight-OPS-backend && npm run start:dev  # Local con hot-reload

# Frontend siempre local:
cd Focus-Flight-OPS-frontend && npm start
```

## .env del Backend
```
DATABASE_URL="postgresql://postgres:2607@localhost:5432/focus_flight_ops?schema=public"
JWT_SECRET="focus-flight-ops-jwt-secret-key-change-in-production-2026"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
PORT=3001
```

## .env del Frontend
```
EXPO_PUBLIC_API_URL=http://<TU_IP_LOCAL>:3001/api/v1
# IMPORTANTE: Cambiar la IP cada vez que cambies de red WiFi
```

## MEJORAS COMPLETADAS
- [x] Refactorización Frontend completa (design system, useStyles, tema dark/light)
- [x] Dashboard Principal (clima, alertas, flota, acciones rápidas)
- [x] Exportar Bitácora PDF (formato RAC 100)
- [x] Registro Fotográfico en Checklists
- [x] Firma Digital del Piloto (Canvas HTML5)
- [x] QR Code por Drone
- [x] Historial de Mantenimiento por Drone (local-first)
- [x] Notificaciones de Vencimiento (push locales 30/15/7 días)
- [x] Modo Offline (SQLite cache para emergencia, checklists)
- [x] Onboarding Flow post-registro
- [x] Skeleton loaders, pull-to-refresh, haptic feedback, animaciones
- [x] Bottom sheet modals, splash screen animado

## PLAN DE MEJORAS PENDIENTES (próximas iteraciones)

### 1. Multi-piloto por Organización
- Empresas con varios pilotos bajo una misma cuenta
- Requiere cambios significativos en backend (roles, organizaciones)

### 2. Mapa de Calor de Vuelos
- Visualización del historial de vuelos en el mapa con heatmap

### 3. Comparador de Clima Hora por Hora
- Planificación de ventana de vuelo óptima (usa GET /weather/forecast)

### 4. Integración ADS-B
- Tráfico aéreo en tiempo real (API externa)

### 5. NOTAM Parser
- Avisos a navegantes de la Aeronáutica Civil

### 6. Integración Stripe
- Suscripciones mensuales por piloto/organización
- Tiers: Free (1 drone), Pro (5 drones), Enterprise (ilimitado)

### 7. Backend para Mantenimiento
- Endpoints CRUD para maintenance_logs (actualmente local-first)
- Sincronización con backend cuando esté disponible

### 8. Upload de Fotos al Backend
- Endpoint de upload para fotos de checklists
- Storage en S3/CloudFlare R2

### 9. App Icon y Assets Personalizados
- Diseñar icon profesional con tema de aviación/drones
- Assets de marketing para stores

## Comandos Útiles

```bash
# Backend
cd Focus-Flight-OPS-backend
npm run build                    # Compilar
npm run start:dev                # Dev con hot-reload
node dist/src/main.js            # Producción
npx prisma migrate dev --name X  # Nueva migración
npx prisma db seed               # Seed de datos
npx prisma studio                # GUI de la DB

# Frontend
cd Focus-Flight-OPS-frontend
npm start                        # Expo dev server
npx expo export --platform android  # Test build

# Docker
docker compose up -d backend     # Levantar backend
docker compose build backend     # Rebuild imagen
docker logs focus-flight-ops-api # Ver logs
```

# Focus Flight Ops - Contexto del Proyecto

## Qué es
Plataforma full-stack para pilotos de drones profesionales en Colombia. Garantiza que cada operación de vuelo sea 100% legal, segura y documentada bajo RAC 91 Apéndice 13 / RAC 100.

## Owner
Juan Rodriguez (juans) - Developer y piloto de drones profesional en Colombia.
Socio: Piloto profesional DJI (tiene drone DJI con cámara).

## Repositorio
- **GitHub (privado):** https://github.com/DeSebasWeb/Focus-Flight-OPS.git
- **Branch:** main
- **Licencia:** All Rights Reserved (plataforma de pago, modelo freemium)

## Estructura del Proyecto

```
c:\Users\juans\Projects\focus-flight-ops\
├── focus-flight-ops-backend\     # NestJS + Prisma + PostgreSQL
├── Focus-Flight-OPS-frontend\    # React Native (Expo SDK 54)
├── scripts\init-db.sql           # Init script para PostgreSQL
├── docker-compose.yml            # Backend dockerizado
├── docker-compose.dev.yml        # Dev config
├── .env.example                  # Variables de entorno template
├── .gitignore
├── README.md
└── CLAUDE.md                     # Este archivo
```

## Stack Técnico

### Backend (focus-flight-ops-backend/)
- **Framework:** NestJS 11 con TypeScript strict
- **Arquitectura:** Hexagonal estricta (Ports & Adapters) + SOLID
- **ORM:** Prisma 6.19 con auto-migrations
- **DB:** PostgreSQL 17 en Docker (puerto 5432, password: 2607)
- **Auth:** JWT (solo `sub` en payload - sin PII), refresh tokens SHA-256, bcrypt
- **Puerto:** 3001

### Frontend (Focus-Flight-OPS-frontend/)
- **Framework:** React Native con Expo SDK 54
- **State:** Zustand 5
- **Navegación:** React Navigation v7 (Bottom Tabs + Native Stacks)
- **Iconos:** @expo/vector-icons (Ionicons)
- **HTTP:** Axios con interceptores JWT + refresh automático (apiClient con tipo `ApiClient` custom que refleja el unwrap del interceptor)
- **Token Storage:** expo-secure-store
- **Mapas:** WebView + Leaflet.js
- **Offline:** expo-sqlite + SyncManager + OfflineStorage
- **Haptics:** expo-haptics
- **Bottom Sheets:** Modal nativo de React Native (NO @gorhom/bottom-sheet - causa crash de NativeWorklets en Expo Go)

### IMPORTANTE - Compatibilidad Expo Go
- **NO usar** `@gorhom/bottom-sheet` - causa error TurboModule/NativeWorklets
- **NO usar** `react-native-reanimated` directamente - el plugin de babel NO debe estar en babel.config.js
- `expo-notifications` se importa lazy con `Constants.appOwnership === 'expo'` check para evitar crash en Expo Go
- El `BottomSheetModal` component usa `Modal` + `Animated` nativo, NO gorhom

## Arquitectura Backend (Hexagonal)

```
src/
├── domain/              # CAPA INTERNA - Zero dependencias de NestJS/Prisma
│   ├── enums/index.ts
│   ├── errors/index.ts
│   └── ports/
│       ├── inbound/index.ts    # Interfaces de servicios
│       └── outbound/index.ts   # Interfaces de repos + data types
├── application/
│   ├── services/        # Implementaciones (AuthServiceImpl, DroneServiceImpl, etc.)
│   └── dto/             # DTOs con class-validator
├── infrastructure/
│   ├── adapters/
│   │   ├── inbound/rest/       # Controllers HTTP
│   │   ├── inbound/guards/     # JwtAuthGuard
│   │   ├── outbound/persistence/  # PrismaXxxRepository
│   │   ├── outbound/external/     # OpenMeteoWeatherAdapter, UaeacArcGisGeofenceAdapter, NoaaKpIndexAdapter
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

### Datos seed existentes:
- 3 fabricantes (DJI, Autel, Skydio), 13 modelos de drones
- 10 propósitos de misión
- 4 templates de checklist con 45+ items
- 6 categorías de items de checklist
- 10 contactos de emergencia (ATC Colombia)
- 6 tipos de zonas aéreas, 17 zonas restringidas colombianas

## API REST - 45 Endpoints bajo /api/v1/

```
Auth:       POST /register, /login, /refresh, /logout | GET /me
Pilots:     GET /me, POST /, PUT /me
Drones:     GET /models, GET /, GET /:id, POST /, PUT /:id, DELETE /:id
Certs:      GET /, GET /expiring, POST /, DELETE /:id
Insurance:  GET /, GET /active, POST /, PUT /:id
Missions:   GET /purposes, GET /, GET /:id, POST /, PUT /:id, PATCH /:id/status
FlightLogs: GET /, GET /:id, POST /start, PATCH /:id/end, POST /:id/telemetry, GET /:id/telemetry
Checklists: GET /templates, GET /templates/:type, POST /executions, PATCH .../items/:id, PATCH .../finalize, GET /missions/:id
Weather:    GET /current?lat&lng, GET /forecast?lat&lng&hours, GET /kp-index
Geofence:   GET /check?lat&lng, GET /zones?lat&lng&radiusKm
Emergency:  GET /contacts, GET /contacts/nearest, GET /flyaway-protocol, POST /events, PATCH .../actions, PATCH .../resolve
```

## Integraciones Externas Activas

### UAEAC ArcGIS (Espacio Aéreo Colombia - DATOS REALES)
- **Adaptador:** `UaeacArcGisGeofenceAdapter` reemplazó al `LocalGeofenceAdapter` estático
- **Endpoint:** `https://services7.arcgis.com/oJtolNh5k8HxCVtB/arcgis/rest/services/UAS_WEBLAYER/FeatureServer`
- **Capas:** 11 capas (aeropuertos, helipuertos, zonas no vuelo, infraestructura crítica, áreas AIP, aviación deportiva)
- **Radio:** 50km desde la posición del piloto
- **Cache:** 15 minutos en memoria del backend
- **Polígonos reales:** Las zonas se renderizan como polígonos reales (no círculos) en los mapas del frontend
- **271 zonas** solo en Bogotá 50km (zonas no vuelo, aeropuertos, helipuertos, infraestructura crítica)
- **API pública**, sin API key, `allowAnonymousToQuery: true`

### NOAA Kp Index (Índice Geomagnético)
- **Adaptador:** `NoaaKpIndexAdapter`
- **Endpoint:** `https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json`
- **Datos:** Kp actual + pronóstico 24h (8 intervalos de 3h)
- **Niveles:** quiet (<4), unsettled (4-5), storm (5-7), severe (7-8), extreme (8+)
- **Cache:** 30 minutos
- **Impacto en drones:** Kp >= 5 degrada GPS, Kp >= 7 NO VOLAR
- **Endpoint frontend:** `GET /weather/kp-index`

### Open-Meteo (Clima)
- **Adaptador:** `OpenMeteoWeatherAdapter`
- API gratuita sin API key
- Temperatura, viento, ráfagas, humedad, visibilidad, tormentas, presión, índice K

## Frontend - Pantallas Actuales (20)

**Dashboard:** DashboardScreen (clima, índice Kp con pronóstico 24h, alertas vencimiento, flota, acciones rápidas)
**Auth:** LoginScreen, RegisterScreen
**Onboarding:** OnboardingScreen (4 pasos: bienvenida, perfil piloto, próximos pasos, listo)
**Fleet:** DroneListScreen, DroneDetailScreen (+ QR code), PilotProfileScreen, RegisterDroneScreen, CreatePilotProfileScreen, MaintenanceHistoryScreen
**Pre-Flight:** PreFlightScreen (mapa UAEAC + clima + Kp + legal), AirspaceMapScreen
**Mission:** CreateMissionScreen
**Checklist:** ChecklistScreen (3 fases + captura de fotos + firma digital)
**Flight:** ActiveFlightScreen (mapa en vivo + HUD + gauges editables + alertas proximidad), FlightLogListScreen, FlightLogDetailScreen (+ exportar PDF RAC 100)
**Emergency:** EmergencyDashboardScreen, FlyawayProtocolScreen

**Componentes comunes:** Card, StatusBadge, ProgressBar, ThemedInput, ThemedButton (con haptic), Skeleton/SkeletonCard/SkeletonList, AnimatedListItem, AnimatedSplash, BottomSheetModal (Modal nativo), OfflineBanner, SignaturePad

## Sistema de Tema (Dark/Light)

Optimizado para uso outdoor bajo sol directo:
- Superficies levantadas del negro puro (surface0: #101018)
- Colores neón brillantes (success: #00E676, warning: #FFEA00)
- Zonas del mapa con alta opacidad (0.30-0.45) para visibilidad al sol
- Hook `useStyles(createStyles)` memoiza estilos basados en el tema activo
- ThemeContext con typography, spacing, borderRadius, touchTarget, layout

## Mapa de Espacio Aéreo - Estrategia de Renderizado

Los mapas usan `buildAirspaceMapHtml` (estático) y `buildLiveFlightMapHtml` (vuelo activo):
- **Zonas buffer** (aeropuerto 6km/9km, helipuerto 3km): borde punteado, fillOpacity 0.04-0.06
- **Zonas advisory** (AIP, deportiva): borde punteado, fillOpacity 0.08-0.10
- **Zonas restricción dura** (no vuelo, infraestructura, militar): borde sólido, fillOpacity 0.25-0.30
- Marcadores de punto para aeropuertos/helipuertos siempre on top
- Leyenda actualizada con tipos UAEAC reales

## ActiveFlightScreen - Mapa en Vivo

El HUD de vuelo activo incluye:
- **Mapa WebView** (~40% pantalla) con posición drone en tiempo real
- **Comunicación bidireccional** WebView <-> React Native via postMessage
- **Marcador drone** con heading rotable + trail de vuelo
- **Zonas UAEAC** cargadas al iniciar vuelo (10km radio)
- **Cache offline SQLite** para zonas sin conexión
- **Alertas de proximidad:** < 200m haptic.error + banner rojo, < 500m haptic.warning + banner amarillo
- **Cooldown 10s** entre alertas para no saturar al piloto
- **Auto-center** en drone (se desactiva con pan manual, re-activa a los 8s)
- **Gauges editables:** tap en ALT/DIST abre input numérico para datos manuales del piloto
- GPS del teléfono como fuente de posición (cada 3s)

## UX Profesional
- **Pull-to-refresh** en 6 pantallas
- **Skeleton loaders** en 5 pantallas
- **Haptic feedback** en 7+ puntos
- **Bottom sheet modals** (selector de tema - usa Modal nativo, NO gorhom)
- **Animaciones** (AnimatedListItem fade+slide, FAB pulso, AnimatedSplash)
- **Splash screen animado** con logo bounce + progress bar
- **Onboarding** 4 pasos post-registro con persistencia SecureStore

## Features Implementados
- [x] Refactorización Frontend completa (design system, useStyles, tema dark/light outdoor)
- [x] Dashboard Principal (clima, Kp geomagnético con pronóstico 24h barras, alertas, flota)
- [x] Espacio aéreo UAEAC en tiempo real (271 zonas, polígonos reales, 50km radio)
- [x] Índice Kp geomagnético NOAA (current + forecast 24h)
- [x] Mapa de vuelo en vivo con alertas de proximidad y gauges editables
- [x] Exportar Bitácora PDF (formato RAC 100)
- [x] Registro Fotográfico en Checklists
- [x] Firma Digital del Piloto (Canvas HTML5)
- [x] QR Code por Drone
- [x] Historial de Mantenimiento por Drone (local-first)
- [x] Notificaciones de Vencimiento (lazy import, degrada en Expo Go)
- [x] Modo Offline (SQLite cache para emergencia, checklists, zonas vuelo)
- [x] Onboarding Flow post-registro
- [x] Skeleton loaders, pull-to-refresh, haptic feedback, animaciones
- [x] Bottom sheet modals (Modal nativo), splash screen animado
- [x] Colores optimizados para uso outdoor/sol directo

## DJI Developer - PRÓXIMA INTEGRACIÓN

### Cuenta DJI Developer
- **Estado:** APROBADA
- **App Name:** FocusFlightOPS
- **Platform:** Android
- **Package Name:** com.focusflightops.app
- **App Key:** dfce378a784d5af2748ee8cf
- **Category:** Drone flight operations management

### Plan de Integración DJI MSDK v5
**Estado:** PENDIENTE - próxima fase mayor

Requiere migrar de Expo Go a Development Build (EAS Build).

**Datos disponibles via MSDK v5:**
- `KeyAircraftLocation3D` - GPS + altitud
- `KeyAircraftVelocity` - Velocidad 3D (NED)
- `KeyCompassHeading` - Heading 0-360°
- `KeyAircraftAttitude` - Pitch/Roll/Yaw
- `KeyGPSSatelliteCount` - Satélites GPS
- `KeyGPSSignalLevel` - Señal GPS
- `KeyFlightTimeInSeconds` - Tiempo de vuelo
- `KeyFlightMode` - Modo de vuelo
- `KeyWindSpeed` / `KeyWindDirection` - Viento
- `KeyIsLowBatteryWarning` - Batería baja
- `KeyAreMotorsOn` - Estado motores
- `KeyHomeLocation` - Home point
- `KeyIsFlying` - En vuelo

**Dependencias gradle MSDK v5:**
```
implementation 'com.dji:dji-sdk-v5-aircraft:5.17.0'
compileOnly 'com.dji:dji-sdk-v5-aircraft-provided:5.17.0'
runtimeOnly 'com.dji:dji-sdk-v5-networkImp:5.17.0'
```

**Fases de implementación:**
1. Migrar a EAS Development Build (ya no Expo Go)
2. Crear Expo Native Module en Kotlin (`expo-dji-telemetry`)
3. Bridge Kotlin <-> React Native para telemetría en tiempo real
4. Conectar al ActiveFlightScreen (reemplazar GPS teléfono con datos drone)
5. Funciona SIN internet (comunicación directa Drone → Control → USB → Teléfono)

**NOTA:** No existe bridge React Native mantenido para MSDK v5. Los paquetes `react-native-dji-mobile` y `react-native-dji-mobile-sdk` están abandonados (2023). Hay que crear un native module custom.

**Compatibilidad:** Si el drone no es DJI compatible, el piloto puede ingresar datos manualmente (gauges editables ya implementados).

## Usuario de prueba existente en DB
- Email: juan@focusflight.co
- Password: SecurePass123
- ID: a2c67283-4fb6-4406-aee2-dbaef9a8aea2

## Seguridad JWT
- Token payload solo contiene `{ sub: userId }` - sin email ni datos personales
- JwtAuthGuard resuelve email y pilotId desde DB, no del token
- Refresh tokens hasheados con SHA-256 en tabla refresh_tokens

## Docker

```bash
# DB ya corre en contenedor 'postgresql' existente (puerto 5432)
# IMPORTANTE: Siempre rebuild antes de levantar para incluir cambios de código
docker compose build backend && docker compose up -d backend

# Frontend siempre local:
cd Focus-Flight-OPS-frontend && npx expo start --clear
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

## PLAN DE MEJORAS PENDIENTES (próximas iteraciones)

### 1. Integración DJI MSDK v5 (PRÓXIMO - App Key lista)
- Migrar a EAS Development Build
- Crear Expo Native Module Kotlin
- Telemetría en tiempo real del drone
- App Key: dfce378a784d5af2748ee8cf

### 2. Multi-piloto por Organización
- Empresas con varios pilotos bajo una misma cuenta
- Requiere cambios significativos en backend (roles, organizaciones)

### 3. Integración Stripe (Monetización)
- Suscripciones mensuales por piloto/organización
- Tiers: Free (1 drone), Pro (5 drones), Enterprise (ilimitado)

### 4. NOTAM Parser
- Avisos a navegantes de la Aeronáutica Civil en tiempo real

### 5. Mapa de Calor de Vuelos
- Visualización del historial de vuelos en el mapa con heatmap

### 6. Planificador de Ventana de Vuelo
- Comparar clima + Kp hora por hora para próximas 24h
- Recomendar mejor ventana para volar

### 7. Integración ADS-B
- Tráfico aéreo en tiempo real

### 8. Modo Inspector UAEAC
- Vista web donde inspector escanea QR del drone y ve toda la documentación

### 9. Backend para Mantenimiento
- Endpoints CRUD para maintenance_logs (actualmente local-first)

### 10. Upload de Fotos al Backend
- Storage en S3/CloudFlare R2

### 11. App Icon y Assets Personalizados
- Diseñar icon profesional para stores

## Comandos Útiles

```bash
# Backend
cd focus-flight-ops-backend
npm run build                    # Compilar
npm run start:dev                # Dev con hot-reload
npx prisma migrate dev --name X  # Nueva migración
npx prisma db seed               # Seed de datos
npx prisma studio                # GUI de la DB

# Frontend
cd Focus-Flight-OPS-frontend
npx expo start --clear           # Dev server (limpiar cache)
npx tsc --noEmit                 # Type check

# Docker
docker compose build backend     # Rebuild imagen
docker compose up -d backend     # Levantar backend
docker logs focus-flight-ops-api # Ver logs

# Git
git add -A && git commit -m "msg" && git push origin main
```

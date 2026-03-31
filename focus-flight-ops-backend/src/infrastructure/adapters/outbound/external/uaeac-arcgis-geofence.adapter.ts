import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { IGeofenceProvider, AirspaceCheckResult, AirspaceZoneData } from '../../../../domain/ports/outbound';

/**
 * UAEAC ArcGIS Geofence Adapter
 *
 * Queries the official Colombian Civil Aviation Authority (Aeronáutica Civil / UAEAC)
 * ArcGIS FeatureServer for real airspace restriction data.
 *
 * Service: https://services7.arcgis.com/oJtolNh5k8HxCVtB/arcgis/rest/services/UAS_WEBLAYER/FeatureServer
 *
 * Layers:
 *   10  - AEROPUERTOS (points)
 *   20  - HELIPUERTOS (points)
 *   30  - HELIPUERTOS_BOGOTÁ (points)
 *   40  - ÁREA_AEROPUERTOS_6KM (polygons)
 *   50  - ÁREA_AEROPUERTOS_9KM (polygons)
 *   60  - ÁREA_HELIPUERTOS_3KM (polygons)
 *   70  - ÁREA_HELIPUERTOS_BOGOTÁ_3KM (polygons)
 *   80  - ÁREAS_AIP (polygons)
 *   90  - AVIACIÓN_DEPORTIVA (polygons)
 *   100 - INFRAESTRUCTURA_AERONAUTICA (polygons)
 *   110 - ZONA_NO_VUELO_DRONES (polygons)
 */

const BASE_URL =
  'https://services7.arcgis.com/oJtolNh5k8HxCVtB/arcgis/rest/services/UAS_WEBLAYER/FeatureServer';

// Layers to query for restriction checks and map display
const RESTRICTION_LAYERS = [
  { id: 110, type: 'NO_FLY_ZONE', label: 'Zona No Vuelo Drones' },
  { id: 100, type: 'CRITICAL_INFRA', label: 'Infraestructura Aeronautica' },
  { id: 80,  type: 'AIP_AREA', label: 'Area AIP' },
  { id: 50,  type: 'AIRPORT_9KM', label: 'Area Aeropuerto 9km' },
  { id: 40,  type: 'AIRPORT_6KM', label: 'Area Aeropuerto 6km' },
  { id: 70,  type: 'HELIPORT_BOG_3KM', label: 'Area Helipuerto Bogota 3km' },
  { id: 60,  type: 'HELIPORT_3KM', label: 'Area Helipuerto 3km' },
  { id: 90,  type: 'SPORT_AVIATION', label: 'Aviacion Deportiva' },
];

const POINT_LAYERS = [
  { id: 10, type: 'AIRPORT', label: 'Aeropuerto' },
  { id: 20, type: 'HELIPORT', label: 'Helipuerto' },
  { id: 30, type: 'HELIPORT_BOG', label: 'Helipuerto Bogota' },
];

// Cache: store results for 15 minutes to avoid hammering ArcGIS
interface CacheEntry {
  data: AirspaceZoneData[];
  timestamp: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000;

@Injectable()
export class UaeacArcGisGeofenceAdapter implements IGeofenceProvider {
  private readonly logger = new Logger(UaeacArcGisGeofenceAdapter.name);

  async checkAirspace(lat: number, lng: number): Promise<AirspaceCheckResult> {
    // Check with a tight radius - is the pilot's exact position inside a restricted zone?
    const zones = await this.fetchAllLayers(lat, lng, 5);

    const restrictedZones = zones.filter((z) =>
      ['NO_FLY_ZONE', 'CRITICAL_INFRA', 'AIP_AREA', 'AIRPORT_9KM', 'AIRPORT_6KM'].includes(z.type),
    );
    const advisoryZones = zones.filter((z) =>
      ['HELIPORT_3KM', 'HELIPORT_BOG_3KM', 'SPORT_AVIATION'].includes(z.type),
    );

    // Find nearest airport
    const airports = await this.queryLayer(10, lat, lng, 50, ['NOMBRE', 'OACI']);
    let nearestAirportDistanceM: number | undefined;
    for (const apt of airports) {
      if (apt.geometry) {
        const dist = this.haversineDistance(lat, lng, apt.centerLat, apt.centerLng);
        if (nearestAirportDistanceM === undefined || dist < nearestAirportDistanceM) {
          nearestAirportDistanceM = Math.round(dist);
        }
      }
    }

    return {
      isRestricted: restrictedZones.length > 0,
      restrictedZones,
      advisoryZones,
      nearestAirportDistanceM,
    };
  }

  async getZonesInArea(lat: number, lng: number, radiusKm: number): Promise<AirspaceZoneData[]> {
    const effectiveRadius = Math.min(radiusKm, 50);
    return this.fetchAllLayers(lat, lng, effectiveRadius);
  }

  private async fetchAllLayers(lat: number, lng: number, radiusKm: number): Promise<AirspaceZoneData[]> {
    const cacheKey = `${lat.toFixed(3)}_${lng.toFixed(3)}_${radiusKm}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    const allZones: AirspaceZoneData[] = [];

    // Query restriction polygon layers in parallel
    const polygonResults = await Promise.allSettled(
      RESTRICTION_LAYERS.map((layer) =>
        this.queryLayer(layer.id, lat, lng, radiusKm, ['*']).then((features) =>
          features.map((f) => ({ ...f, type: layer.type })),
        ),
      ),
    );

    for (const result of polygonResults) {
      if (result.status === 'fulfilled') {
        allZones.push(...result.value);
      }
    }

    // Query airport/heliport point layers in parallel
    const pointResults = await Promise.allSettled(
      POINT_LAYERS.map((layer) =>
        this.queryLayer(layer.id, lat, lng, radiusKm, ['*']).then((features) =>
          features.map((f) => ({ ...f, type: layer.type })),
        ),
      ),
    );

    for (const result of pointResults) {
      if (result.status === 'fulfilled') {
        allZones.push(...result.value);
      }
    }

    cache.set(cacheKey, { data: allZones, timestamp: Date.now() });
    return allZones;
  }

  private async queryLayer(
    layerId: number,
    lat: number,
    lng: number,
    radiusKm: number,
    outFields: string[],
  ): Promise<AirspaceZoneData[]> {
    try {
      const response = await axios.get(`${BASE_URL}/${layerId}/query`, {
        params: {
          where: '1=1',
          geometry: `${lng},${lat}`,
          geometryType: 'esriGeometryPoint',
          spatialRel: 'esriSpatialRelIntersects',
          distance: radiusKm * 1000,
          units: 'esriSRUnit_Meter',
          outFields: outFields.join(','),
          outSR: 4326,
          f: 'json',
          resultRecordCount: 200,
        },
        timeout: 10000,
      });

      if (!response.data?.features) return [];

      return response.data.features.map((feature: any) => {
        const attrs = feature.attributes || {};
        const geo = feature.geometry;

        // Extract center point from geometry
        let centerLat = lat;
        let centerLng = lng;
        let geometry: number[][][] | null = null;

        if (geo?.rings) {
          // Polygon - compute centroid and keep rings
          geometry = geo.rings;
          const ring = geo.rings[0];
          if (ring && ring.length > 0) {
            let sumLng = 0, sumLat = 0;
            for (const [pLng, pLat] of ring) {
              sumLng += pLng;
              sumLat += pLat;
            }
            centerLng = sumLng / ring.length;
            centerLat = sumLat / ring.length;
          }
        } else if (geo?.x !== undefined && geo?.y !== undefined) {
          // Point
          centerLng = geo.x;
          centerLat = geo.y;
        }

        // Extract name from various possible field names
        const name =
          attrs.NOMBRE || attrs.nombre || attrs.NOMAIP || attrs.NOM_INFRA ||
          attrs.RAZON_SOCIAL || attrs.NOM_EST || attrs.OBJECTID?.toString() || 'Zona Restringida';

        const icaoCode = attrs.OACI || attrs.oaci || null;

        const description =
          attrs.DESCRIPCION || attrs.RESTRICCION || attrs.OBSERVACIONES ||
          attrs.TIPO_ZONA || attrs.CATEGORIA || null;

        // Estimate radius from polygon extent (for backward compatibility)
        let radiusM = 1000;
        if (geo?.rings?.[0]) {
          const ring = geo.rings[0];
          let maxDist = 0;
          for (const [pLng, pLat] of ring) {
            const d = this.haversineDistance(centerLat, centerLng, pLat, pLng);
            if (d > maxDist) maxDist = d;
          }
          radiusM = Math.round(maxDist);
        }

        return {
          id: `uaeac_${layerId}_${attrs.OBJECTID || attrs.FID || Math.random().toString(36).slice(2)}`,
          name,
          type: '', // Will be overwritten by the caller
          icaoCode,
          centerLat,
          centerLng,
          radiusM,
          isPermanent: true,
          geometry,
          description,
          source: 'UAEAC' as const,
        };
      });
    } catch (error) {
      this.logger.warn(`Failed to query UAEAC layer ${layerId}: ${(error as Error).message}`);
      return [];
    }
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}

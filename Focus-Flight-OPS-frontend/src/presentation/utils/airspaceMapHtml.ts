/**
 * Generates Leaflet HTML for airspace zone maps.
 * Renders real UAEAC polygons when geometry is available, circles as fallback.
 *
 * Layered rendering strategy to avoid visual clutter:
 * - Buffer zones (airport 6km/9km, heliport 3km): border-only, very low fill
 * - AIP / Sport aviation: low fill, dashed border
 * - No-fly zones / Critical infra: solid fill, visible
 * - Point markers (airports/heliports): always on top
 */

interface AirspaceZone {
  id: string;
  name: string;
  type: string;
  icaoCode: string | null;
  centerLat: number;
  centerLng: number;
  radiusM: number;
  geometry?: number[][][] | null;
  description?: string | null;
  source?: string;
}

// High-contrast colors optimized for outdoor/sunlight use
const ZONE_COLORS: Record<string, string> = {
  NO_FLY_ZONE: '#FF1744',
  CRITICAL_INFRA: '#FF6D00',
  AIP_AREA: '#D500F9',
  AIRPORT_9KM: '#FF5252',
  AIRPORT_6KM: '#FF8A65',
  HELIPORT_3KM: '#FF9100',
  HELIPORT_BOG_3KM: '#FFB300',
  SPORT_AVIATION: '#FFEA00',
  AIRPORT: '#FF5252',
  HELIPORT: '#FF9100',
  HELIPORT_BOG: '#FFB300',
  MILITARY: '#D50000',
  GOVERNMENT: '#FFD600',
  PRISON: '#FF6D00',
  TFR: '#AA00FF',
};

// Render style per zone type
interface ZoneStyle {
  fillOpacity: number;
  weight: number;
  dashArray?: string;
}

// Buffer zones: border-only so the map stays readable
// No-fly / critical: solid fill so the pilot sees danger clearly
const ZONE_STYLES: Record<string, ZoneStyle> = {
  // Large buffer zones - border only, minimal fill
  AIRPORT_9KM:      { fillOpacity: 0.04, weight: 2, dashArray: '8,6' },
  AIRPORT_6KM:      { fillOpacity: 0.06, weight: 2, dashArray: '6,4' },
  HELIPORT_3KM:     { fillOpacity: 0.06, weight: 2, dashArray: '6,4' },
  HELIPORT_BOG_3KM: { fillOpacity: 0.06, weight: 2, dashArray: '6,4' },
  // Advisory zones - low fill, dashed
  AIP_AREA:         { fillOpacity: 0.10, weight: 2, dashArray: '4,4' },
  SPORT_AVIATION:   { fillOpacity: 0.08, weight: 2, dashArray: '4,4' },
  // Hard restrictions - visible solid fill
  NO_FLY_ZONE:      { fillOpacity: 0.30, weight: 3 },
  CRITICAL_INFRA:   { fillOpacity: 0.30, weight: 3 },
  MILITARY:         { fillOpacity: 0.30, weight: 3 },
  GOVERNMENT:       { fillOpacity: 0.25, weight: 3 },
  PRISON:           { fillOpacity: 0.30, weight: 3 },
  TFR:              { fillOpacity: 0.25, weight: 2 },
};

const DEFAULT_STYLE: ZoneStyle = { fillOpacity: 0.20, weight: 2 };

const TYPE_LABELS: Record<string, string> = {
  NO_FLY_ZONE: 'Zona No Vuelo',
  CRITICAL_INFRA: 'Infraestructura Critica',
  AIP_AREA: 'Area AIP',
  AIRPORT_9KM: 'Area Aeropuerto 9km',
  AIRPORT_6KM: 'Area Aeropuerto 6km',
  HELIPORT_3KM: 'Area Helipuerto 3km',
  HELIPORT_BOG_3KM: 'Area Helipuerto Bogota',
  SPORT_AVIATION: 'Aviacion Deportiva',
  AIRPORT: 'Aeropuerto',
  HELIPORT: 'Helipuerto',
  HELIPORT_BOG: 'Helipuerto Bogota',
  MILITARY: 'Base Militar',
  GOVERNMENT: 'Gobierno',
  PRISON: 'Carcel',
  TFR: 'TFR',
};

// Render order: large buffers first (bottom), restrictions on top
const RENDER_ORDER: string[] = [
  'AIRPORT_9KM', 'AIRPORT_6KM',
  'HELIPORT_3KM', 'HELIPORT_BOG_3KM',
  'AIP_AREA', 'SPORT_AVIATION',
  'TFR', 'GOVERNMENT',
  'MILITARY', 'PRISON',
  'CRITICAL_INFRA', 'NO_FLY_ZONE',
];

function escapeHtml(str: string): string {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '<br>').replace(/\r/g, '');
}

export function buildAirspaceMapHtml(
  lat: number,
  lng: number,
  zones: AirspaceZone[],
  tileUrl: string,
  options?: { zoom?: number; showLegend?: boolean },
): string {
  const zoom = options?.zoom ?? 13;
  const showLegend = options?.showLegend ?? false;

  // Sort zones by render order: large buffers first (behind), restrictions last (on top)
  const sorted = [...zones].sort((a, b) => {
    const ai = RENDER_ORDER.indexOf(a.type);
    const bi = RENDER_ORDER.indexOf(b.type);
    return (ai === -1 ? 50 : ai) - (bi === -1 ? 50 : bi);
  });

  // Build zone rendering JS
  const zonesJs = sorted
    .filter((z) => !['AIRPORT', 'HELIPORT', 'HELIPORT_BOG'].includes(z.type))
    .map((z) => {
      const color = ZONE_COLORS[z.type] || '#FF5252';
      const style = ZONE_STYLES[z.type] || DEFAULT_STYLE;
      const label = escapeHtml(z.icaoCode ? `${z.name} (${z.icaoCode})` : z.name);
      const typeLabel = TYPE_LABELS[z.type] || z.type;
      const desc = z.description ? `<br><small>${escapeHtml(z.description.slice(0, 120))}</small>` : '';
      const popup = `'<b>${label}</b><br><em>${typeLabel}</em>${desc}'`;
      const dash = style.dashArray ? `,dashArray:'${style.dashArray}'` : '';

      if (z.geometry && z.geometry.length > 0) {
        const rings = z.geometry.map(
          (ring) => '[' + ring.map((coord) => `[${coord[1]},${coord[0]}]`).join(',') + ']',
        );
        return `L.polygon([${rings.join(',')}],{color:'${color}',fillColor:'${color}',fillOpacity:${style.fillOpacity},weight:${style.weight}${dash}}).addTo(map).bindPopup(${popup});`;
      }

      return `L.circle([${z.centerLat},${z.centerLng}],{radius:${z.radiusM},color:'${color}',fillColor:'${color}',fillOpacity:${style.fillOpacity},weight:${style.weight}${dash}}).addTo(map).bindPopup(${popup});`;
    }).join('\n');

  // Point markers for airports/heliports - always on top
  const markersJs = sorted
    .filter((z) => ['AIRPORT', 'HELIPORT', 'HELIPORT_BOG'].includes(z.type))
    .map((z) => {
      const label = escapeHtml(z.icaoCode ? `${z.name} (${z.icaoCode})` : z.name);
      const typeLabel = TYPE_LABELS[z.type] || z.type;
      return `L.circleMarker([${z.centerLat},${z.centerLng}],{radius:8,color:'#FFF',fillColor:'${ZONE_COLORS[z.type]}',fillOpacity:1,weight:3}).addTo(map).bindPopup('<b>${label}</b><br>${typeLabel}');`;
    }).join('\n');

  const legendHtml = showLegend ? `
    var legend = L.control({ position: 'bottomleft' });
    legend.onAdd = function() {
      var div = L.DomUtil.create('div', 'legend');
      div.innerHTML =
        '<b>Espacio Aereo UAEAC</b><br>' +
        '<span class="ld" style="background:#FF1744"></span>Zona No Vuelo<br>' +
        '<span class="ld" style="background:#FF5252"></span>Area Aeropuerto<br>' +
        '<span class="ld" style="background:#FF9100"></span>Helipuerto<br>' +
        '<span class="ld" style="background:#FF6D00"></span>Infra. Critica<br>' +
        '<span class="ld" style="background:#D500F9"></span>Area AIP<br>' +
        '<span class="ld" style="background:#FFEA00"></span>Aviacion Deportiva<br>' +
        '<small style="color:#aaa">Lineas punteadas = zonas buffer</small>';
      return div;
    };
    legend.addTo(map);` : '';

  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
*{margin:0;padding:0}
#map{width:100vw;height:100vh}
.pilot{background:#00E5FF;border:3px solid #fff;border-radius:50%;width:16px;height:16px;box-shadow:0 0 20px rgba(0,229,255,0.9)}
.leaflet-control-zoom{border:none!important}
.leaflet-control-zoom a{background:rgba(10,10,24,0.9)!important;color:#F8F8F8!important;border:1px solid rgba(255,255,255,0.2)!important;width:40px!important;height:40px!important;line-height:40px!important;font-size:18px!important;border-radius:10px!important;margin-bottom:4px!important}
.legend{background:rgba(10,10,24,0.92);padding:12px 16px;border-radius:10px;color:#F8F8F8;font-family:system-ui;font-size:12px;line-height:22px;max-width:190px;border:1px solid rgba(255,255,255,0.15)}
.ld{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;vertical-align:middle}
</style></head><body><div id="map"></div><script>
var map=L.map('map',{zoomControl:false,attributionControl:false}).setView([${lat},${lng}],${zoom});
L.tileLayer('${tileUrl}',{maxZoom:18}).addTo(map);
L.control.zoom({position:'topright'}).addTo(map);
var pi=L.divIcon({className:'pilot',iconSize:[16,16]});
L.marker([${lat},${lng}],{icon:pi}).addTo(map).bindPopup('<b>Tu ubicacion</b><br>${lat.toFixed(6)}, ${lng.toFixed(6)}');
L.circle([${lat},${lng}],{radius:500,color:'#00E5FF',fillColor:'#00E5FF',fillOpacity:0.10,weight:2,dashArray:'6,6'}).addTo(map);
${zonesJs}
${markersJs}
${legendHtml}
</script></body></html>`;
}

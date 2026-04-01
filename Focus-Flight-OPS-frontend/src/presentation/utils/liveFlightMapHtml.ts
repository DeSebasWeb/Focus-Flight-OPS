/**
 * Live Flight Map HTML for WebView
 *
 * Bidirectional communication with React Native:
 * RN -> WebView: postMessage({ type: 'updatePosition', lat, lng, heading })
 * WebView -> RN: postMessage({ type: 'proximityAlert', zoneName, distanceM, zoneType })
 *
 * Features:
 * - Real-time drone position marker (rotatable with heading)
 * - UAEAC airspace zones rendered with same styles as static map
 * - Proximity detection: alerts when drone < 500m from restricted zone
 * - Auto-center on drone (disables on manual pan, re-enables after 5s)
 * - Trail line showing flight path
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
}

// Reuse same colors/styles from airspaceMapHtml
const ZONE_COLORS: Record<string, string> = {
  NO_FLY_ZONE: '#FF1744', CRITICAL_INFRA: '#FF6D00', AIP_AREA: '#D500F9',
  AIRPORT_9KM: '#FF5252', AIRPORT_6KM: '#FF8A65', HELIPORT_3KM: '#FF9100',
  HELIPORT_BOG_3KM: '#FFB300', SPORT_AVIATION: '#FFEA00', AIRPORT: '#FF5252',
  HELIPORT: '#FF9100', HELIPORT_BOG: '#FFB300', MILITARY: '#D50000',
  GOVERNMENT: '#FFD600', PRISON: '#FF6D00', TFR: '#AA00FF',
};

const ZONE_STYLES: Record<string, { fillOpacity: number; weight: number; dashArray?: string }> = {
  AIRPORT_9KM: { fillOpacity: 0.04, weight: 2, dashArray: '8,6' },
  AIRPORT_6KM: { fillOpacity: 0.06, weight: 2, dashArray: '6,4' },
  HELIPORT_3KM: { fillOpacity: 0.06, weight: 2, dashArray: '6,4' },
  HELIPORT_BOG_3KM: { fillOpacity: 0.06, weight: 2, dashArray: '6,4' },
  AIP_AREA: { fillOpacity: 0.10, weight: 2, dashArray: '4,4' },
  SPORT_AVIATION: { fillOpacity: 0.08, weight: 2, dashArray: '4,4' },
  NO_FLY_ZONE: { fillOpacity: 0.30, weight: 3 },
  CRITICAL_INFRA: { fillOpacity: 0.30, weight: 3 },
  MILITARY: { fillOpacity: 0.30, weight: 3 },
  GOVERNMENT: { fillOpacity: 0.25, weight: 3 },
  PRISON: { fillOpacity: 0.30, weight: 3 },
  TFR: { fillOpacity: 0.25, weight: 2 },
};

function escapeHtml(str: string): string {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, ' ').replace(/\r/g, '');
}

export function buildLiveFlightMapHtml(
  lat: number,
  lng: number,
  zones: AirspaceZone[],
  tileUrl: string,
  options?: { fromCache?: boolean },
): string {
  const fromCache = options?.fromCache ?? false;

  // Build zone rendering + zone data array for proximity detection
  const restrictionTypes = new Set([
    'NO_FLY_ZONE', 'CRITICAL_INFRA', 'MILITARY', 'GOVERNMENT', 'PRISON',
    'AIRPORT_9KM', 'AIRPORT_6KM', 'AIP_AREA',
  ]);

  // Zone centers for proximity calculation (only restricted/important zones)
  const zoneCentersJson = JSON.stringify(
    zones
      .filter((z) => restrictionTypes.has(z.type))
      .map((z) => ({
        name: z.icaoCode ? `${z.name} (${z.icaoCode})` : z.name,
        type: z.type,
        lat: z.centerLat,
        lng: z.centerLng,
        radiusM: z.radiusM,
      })),
  );

  // Build zone polygons/circles JS
  const sorted = [...zones].sort((a, b) => {
    const order = ['AIRPORT_9KM','AIRPORT_6KM','HELIPORT_3KM','HELIPORT_BOG_3KM','AIP_AREA','SPORT_AVIATION','TFR','GOVERNMENT','MILITARY','PRISON','CRITICAL_INFRA','NO_FLY_ZONE'];
    return (order.indexOf(a.type) === -1 ? 50 : order.indexOf(a.type)) - (order.indexOf(b.type) === -1 ? 50 : order.indexOf(b.type));
  });

  const zonesJs = sorted
    .filter((z) => !['AIRPORT', 'HELIPORT', 'HELIPORT_BOG'].includes(z.type))
    .map((z) => {
      const color = ZONE_COLORS[z.type] || '#FF5252';
      const style = ZONE_STYLES[z.type] || { fillOpacity: 0.20, weight: 2 };
      const label = escapeHtml(z.icaoCode ? `${z.name} (${z.icaoCode})` : z.name);
      const dash = style.dashArray ? `,dashArray:'${style.dashArray}'` : '';

      if (z.geometry && z.geometry.length > 0) {
        const rings = z.geometry.map(
          (ring) => '[' + ring.map((c) => `[${c[1]},${c[0]}]`).join(',') + ']',
        );
        return `L.polygon([${rings.join(',')}],{color:'${color}',fillColor:'${color}',fillOpacity:${style.fillOpacity},weight:${style.weight}${dash}}).addTo(map).bindPopup('<b>${label}</b>');`;
      }
      return `L.circle([${z.centerLat},${z.centerLng}],{radius:${z.radiusM},color:'${color}',fillColor:'${color}',fillOpacity:${style.fillOpacity},weight:${style.weight}${dash}}).addTo(map).bindPopup('<b>${label}</b>');`;
    }).join('\n');

  const markersJs = sorted
    .filter((z) => ['AIRPORT', 'HELIPORT', 'HELIPORT_BOG'].includes(z.type))
    .map((z) => {
      const label = escapeHtml(z.icaoCode ? `${z.name} (${z.icaoCode})` : z.name);
      return `L.circleMarker([${z.centerLat},${z.centerLng}],{radius:8,color:'#FFF',fillColor:'${ZONE_COLORS[z.type]}',fillOpacity:1,weight:3}).addTo(map).bindPopup('<b>${label}</b>');`;
    }).join('\n');

  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
*{margin:0;padding:0}
#map{width:100vw;height:100vh}
.drone-marker{width:24px;height:24px;position:relative}
.drone-dot{width:16px;height:16px;background:#00E5FF;border:3px solid #fff;border-radius:50%;box-shadow:0 0 20px rgba(0,229,255,0.9);position:absolute;top:4px;left:4px}
.drone-heading{width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:10px solid #00E5FF;position:absolute;top:-6px;left:6px;filter:drop-shadow(0 0 4px rgba(0,229,255,0.7))}
.leaflet-control-zoom{border:none!important}
.leaflet-control-zoom a{background:rgba(10,10,24,0.9)!important;color:#F8F8F8!important;border:1px solid rgba(255,255,255,0.2)!important;width:36px!important;height:36px!important;line-height:36px!important;font-size:16px!important;border-radius:8px!important;margin-bottom:3px!important}
.offline-badge{position:fixed;top:8px;left:50%;transform:translateX(-50%);background:rgba(255,234,0,0.9);color:#1A1A2E;padding:4px 12px;border-radius:12px;font-size:11px;font-weight:700;font-family:system-ui;z-index:9999;display:${fromCache ? 'block' : 'none'}}
</style></head><body>
<div class="offline-badge">Datos offline</div>
<div id="map"></div>
<script>
var map=L.map('map',{zoomControl:false,attributionControl:false}).setView([${lat},${lng}],15);
L.tileLayer('${tileUrl}',{maxZoom:19}).addTo(map);
L.control.zoom({position:'topright'}).addTo(map);

// Zone data for proximity checks
var zoneCenters=${zoneCentersJson};

// Render zones
${zonesJs}
${markersJs}

// Drone marker
var droneIcon=L.divIcon({className:'drone-marker',iconSize:[24,24],iconAnchor:[12,12],html:'<div class="drone-heading" id="droneHeading"></div><div class="drone-dot"></div>'});
var droneMarker=L.marker([${lat},${lng}],{icon:droneIcon,zIndex:9999}).addTo(map);

// Flight trail
var trail=L.polyline([[${lat},${lng}]],{color:'#00E5FF',weight:2,opacity:0.6,dashArray:'4,4'}).addTo(map);

// Auto-center control
var autoCenter=true;
var autoCenterTimer=null;
map.on('dragstart',function(){
  autoCenter=false;
  if(autoCenterTimer)clearTimeout(autoCenterTimer);
  autoCenterTimer=setTimeout(function(){autoCenter=true},8000);
});

// Haversine distance in meters
function haversine(lat1,lng1,lat2,lng2){
  var R=6371000;
  var dLat=(lat2-lat1)*Math.PI/180;
  var dLng=(lng2-lng1)*Math.PI/180;
  var a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)*Math.sin(dLng/2);
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

// Check proximity to zones
var lastAlertTime=0;
function checkProximity(lat,lng){
  var now=Date.now();
  if(now-lastAlertTime<10000)return; // 10s cooldown
  for(var i=0;i<zoneCenters.length;i++){
    var z=zoneCenters[i];
    var dist=haversine(lat,lng,z.lat,z.lng);
    // For zones with radius, check if we're within radius + 500m buffer
    var threshold=Math.min(z.radiusM+500,z.radiusM*1.5+200);
    if(dist<threshold){
      var distToEdge=Math.max(0,dist-z.radiusM);
      if(distToEdge<500){
        lastAlertTime=now;
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type:'proximityAlert',
          zoneName:z.name,
          zoneType:z.type,
          distanceM:Math.round(distToEdge)
        }));
        return;
      }
    }
  }
}

// Listen for position updates from React Native
document.addEventListener('message',function(e){handleMsg(e.data)});
window.addEventListener('message',function(e){handleMsg(e.data)});
function handleMsg(data){
  try{
    var msg=JSON.parse(data);
    if(msg.type==='updatePosition'){
      var lat=msg.lat,lng=msg.lng,heading=msg.heading||0;
      droneMarker.setLatLng([lat,lng]);
      trail.addLatLng([lat,lng]);
      // Rotate heading arrow
      var el=document.getElementById('droneHeading');
      if(el)el.style.transform='rotate('+heading+'deg)';
      // Auto center
      if(autoCenter)map.setView([lat,lng],map.getZoom());
      // Check proximity
      checkProximity(lat,lng);
    }
  }catch(err){}
}
</script></body></html>`;
}

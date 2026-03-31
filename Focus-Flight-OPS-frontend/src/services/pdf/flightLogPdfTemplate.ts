export interface FlightLogPdfData {
  // Pilot
  pilotName: string;
  pilotLicense?: string;
  pilotUaeac?: string;

  // Drone
  droneManufacturer: string;
  droneModel: string;
  droneSerial: string;
  droneRegistration?: string;
  droneMtow: number;

  // Flight
  missionId: string;
  operationType: string;
  takeoffTime: string;
  landingTime?: string;
  totalMinutes?: number;
  takeoffLat: number;
  takeoffLng: number;
  landingLat?: number;
  landingLng?: number;
  maxAltitudeM?: number;
  maxDistanceM?: number;
  status: string;
  notes?: string;

  // Generated
  exportDate: string;
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return iso;
  }
}

function formatCoord(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(6)}&deg; ${latDir}, ${Math.abs(lng).toFixed(6)}&deg; ${lngDir}`;
}

function statusLabel(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'COMPLETADO';
    case 'EMERGENCY':
      return 'EMERGENCIA';
    case 'IN_PROGRESS':
      return 'EN PROGRESO';
    case 'ABORTED':
      return 'ABORTADO';
    default:
      return status;
  }
}

export function generateFlightLogHtml(data: FlightLogPdfData): string {
  const mtowKg = (data.droneMtow / 1000).toFixed(2);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bitacora de Vuelo UAS - RAC 100</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 11px;
      color: #1a1a1a;
      background: #fff;
      padding: 24px;
      line-height: 1.4;
    }

    .header {
      text-align: center;
      border: 2px solid #1a1a1a;
      padding: 12px 16px;
      margin-bottom: 16px;
    }

    .header-republic {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 2px;
    }

    .header-authority {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #333;
      margin-bottom: 8px;
    }

    .header-title {
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-top: 1px solid #999;
      padding-top: 8px;
      margin-top: 4px;
    }

    .header-subtitle {
      font-size: 10px;
      color: #555;
      margin-top: 4px;
    }

    .branding {
      text-align: right;
      font-size: 9px;
      color: #777;
      margin-bottom: 12px;
    }

    .branding strong {
      font-size: 10px;
      color: #0055a5;
    }

    .section {
      margin-bottom: 14px;
    }

    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      background: #f0f0f0;
      padding: 5px 8px;
      border: 1px solid #ccc;
      border-bottom: none;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #ccc;
    }

    table td,
    table th {
      border: 1px solid #ccc;
      padding: 5px 8px;
      text-align: left;
      vertical-align: top;
    }

    table th {
      background: #fafafa;
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: #555;
      width: 35%;
    }

    table td {
      font-size: 11px;
    }

    .mono {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
    }

    .coord-table td {
      font-family: 'Courier New', Courier, monospace;
    }

    .status-completed {
      color: #1b7a2b;
      font-weight: 700;
    }

    .status-emergency {
      color: #c62828;
      font-weight: 700;
    }

    .status-other {
      color: #e65100;
      font-weight: 700;
    }

    .telemetry-grid {
      display: flex;
      gap: 0;
    }

    .telemetry-grid .tel-cell {
      flex: 1;
      text-align: center;
      border: 1px solid #ccc;
      padding: 8px 4px;
    }

    .tel-cell .tel-value {
      font-family: 'Courier New', Courier, monospace;
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
    }

    .tel-cell .tel-unit {
      font-size: 9px;
      color: #777;
    }

    .tel-cell .tel-label {
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #555;
      margin-top: 2px;
    }

    .notes-box {
      border: 1px solid #ccc;
      padding: 8px;
      min-height: 40px;
      font-style: italic;
      color: #333;
    }

    .footer {
      margin-top: 24px;
      border-top: 2px solid #1a1a1a;
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .footer-left {
      font-size: 9px;
      color: #777;
    }

    .footer-right {
      text-align: right;
      font-size: 9px;
      color: #777;
    }

    .footer-disclaimer {
      font-size: 8px;
      color: #999;
      text-align: center;
      margin-top: 8px;
      font-style: italic;
    }

    .signature-area {
      margin-top: 32px;
      display: flex;
      justify-content: space-between;
    }

    .signature-line {
      width: 40%;
      text-align: center;
    }

    .signature-line .line {
      border-top: 1px solid #1a1a1a;
      margin-top: 40px;
      padding-top: 4px;
      font-size: 10px;
      color: #555;
    }

    @media print {
      body {
        padding: 12px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-republic">Republica de Colombia</div>
    <div class="header-authority">Unidad Administrativa Especial de Aeronautica Civil - UAEAC</div>
    <div class="header-title">Bitacora de Vuelo UAS - RAC 100</div>
    <div class="header-subtitle">Reglamentos Aeronauticos de Colombia - RAC 91 Apendice 13 / RAC 100</div>
  </div>

  <div class="branding">
    <strong>Focus Flight Ops</strong> &mdash; Plataforma de Operaciones UAS
  </div>

  <!-- Pilot Info -->
  <div class="section">
    <div class="section-title">1. Informacion del Piloto</div>
    <table>
      <tr>
        <th>Nombre Completo</th>
        <td>${escapeHtml(data.pilotName)}</td>
      </tr>
      <tr>
        <th>Licencia</th>
        <td>${data.pilotLicense ? escapeHtml(data.pilotLicense) : 'No registrada'}</td>
      </tr>
      <tr>
        <th>No. UAEAC</th>
        <td class="mono">${data.pilotUaeac ? escapeHtml(data.pilotUaeac) : 'No registrado'}</td>
      </tr>
    </table>
  </div>

  <!-- Aircraft/Drone Info -->
  <div class="section">
    <div class="section-title">2. Informacion de la Aeronave (UAS)</div>
    <table>
      <tr>
        <th>Fabricante</th>
        <td>${escapeHtml(data.droneManufacturer)}</td>
      </tr>
      <tr>
        <th>Modelo</th>
        <td>${escapeHtml(data.droneModel)}</td>
      </tr>
      <tr>
        <th>No. Serie</th>
        <td class="mono">${escapeHtml(data.droneSerial)}</td>
      </tr>
      <tr>
        <th>Matricula</th>
        <td class="mono">${data.droneRegistration ? escapeHtml(data.droneRegistration) : 'No registrada'}</td>
      </tr>
      <tr>
        <th>MTOW</th>
        <td class="mono">${mtowKg} kg (${data.droneMtow} g)</td>
      </tr>
    </table>
  </div>

  <!-- Flight Details -->
  <div class="section">
    <div class="section-title">3. Detalles del Vuelo</div>
    <table>
      <tr>
        <th>ID Mision</th>
        <td class="mono">${escapeHtml(data.missionId)}</td>
      </tr>
      <tr>
        <th>Tipo de Operacion</th>
        <td>${escapeHtml(data.operationType)}</td>
      </tr>
      <tr>
        <th>Hora de Despegue</th>
        <td class="mono">${formatDateTime(data.takeoffTime)}</td>
      </tr>
      <tr>
        <th>Hora de Aterrizaje</th>
        <td class="mono">${data.landingTime ? formatDateTime(data.landingTime) : '---'}</td>
      </tr>
      <tr>
        <th>Duracion Total</th>
        <td class="mono">${data.totalMinutes != null ? data.totalMinutes.toFixed(1) + ' minutos' : '---'}</td>
      </tr>
      <tr>
        <th>Estado</th>
        <td class="${data.status === 'COMPLETED' ? 'status-completed' : data.status === 'EMERGENCY' ? 'status-emergency' : 'status-other'}">
          ${statusLabel(data.status)}
        </td>
      </tr>
    </table>
  </div>

  <!-- GPS Coordinates -->
  <div class="section">
    <div class="section-title">4. Coordenadas GPS</div>
    <table class="coord-table">
      <tr>
        <th>Punto de Despegue</th>
        <td>${formatCoord(data.takeoffLat, data.takeoffLng)}</td>
      </tr>
      <tr>
        <th>Punto de Aterrizaje</th>
        <td>${data.landingLat != null && data.landingLng != null ? formatCoord(data.landingLat, data.landingLng) : '---'}</td>
      </tr>
    </table>
  </div>

  <!-- Telemetry Summary -->
  <div class="section">
    <div class="section-title">5. Resumen de Telemetria</div>
    <div class="telemetry-grid">
      <div class="tel-cell">
        <div class="tel-value">${data.maxAltitudeM != null ? data.maxAltitudeM.toFixed(0) : '---'}</div>
        <div class="tel-unit">m AGL</div>
        <div class="tel-label">Altitud Maxima</div>
      </div>
      <div class="tel-cell">
        <div class="tel-value">${data.maxDistanceM != null ? data.maxDistanceM.toFixed(0) : '---'}</div>
        <div class="tel-unit">m</div>
        <div class="tel-label">Distancia Maxima</div>
      </div>
      <div class="tel-cell">
        <div class="tel-value">${data.totalMinutes != null ? data.totalMinutes.toFixed(1) : '---'}</div>
        <div class="tel-unit">min</div>
        <div class="tel-label">Tiempo de Vuelo</div>
      </div>
    </div>
  </div>

  <!-- Notes -->
  <div class="section">
    <div class="section-title">6. Observaciones del Piloto</div>
    <div class="notes-box">
      ${data.notes ? escapeHtml(data.notes) : 'Sin observaciones registradas.'}
    </div>
  </div>

  <!-- Signature -->
  <div class="signature-area">
    <div class="signature-line">
      <div class="line">Firma del Piloto al Mando</div>
    </div>
    <div class="signature-line">
      <div class="line">Firma del Supervisor (si aplica)</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-left">
      Fecha de exportacion: ${escapeHtml(data.exportDate)}<br />
      Generado por Focus Flight Ops v1.0.0
    </div>
    <div class="footer-right">
      RAC 91 Apendice 13 / RAC 100<br />
      UAEAC - Colombia
    </div>
  </div>

  <div class="footer-disclaimer">
    Este documento fue generado automaticamente por Focus Flight Ops. La informacion contenida
    corresponde a los datos registrados en el sistema al momento de la exportacion. Este documento
    no reemplaza los registros oficiales requeridos por la UAEAC.
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

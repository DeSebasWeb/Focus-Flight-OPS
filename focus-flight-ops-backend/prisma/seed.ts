import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ============================================================
  // DRONE MANUFACTURERS & MODELS
  // ============================================================
  const dji = await prisma.droneManufacturer.upsert({
    where: { name: 'DJI' },
    update: {},
    create: { name: 'DJI' },
  });
  const autel = await prisma.droneManufacturer.upsert({
    where: { name: 'Autel Robotics' },
    update: {},
    create: { name: 'Autel Robotics' },
  });
  const skydio = await prisma.droneManufacturer.upsert({
    where: { name: 'Skydio' },
    update: {},
    create: { name: 'Skydio' },
  });

  const djiModels = [
    { name: 'Mavic 3 Enterprise', defaultMtowGrams: 1050, defaultNumRotors: 4, category: 'SPECIFIC' },
    { name: 'Mavic 3 Pro', defaultMtowGrams: 958, defaultNumRotors: 4, category: 'OPEN' },
    { name: 'Matrice 350 RTK', defaultMtowGrams: 9200, defaultNumRotors: 4, category: 'SPECIFIC' },
    { name: 'Matrice 30T', defaultMtowGrams: 3770, defaultNumRotors: 4, category: 'SPECIFIC' },
    { name: 'Mini 4 Pro', defaultMtowGrams: 249, defaultNumRotors: 4, category: 'OPEN' },
    { name: 'Air 3', defaultMtowGrams: 720, defaultNumRotors: 4, category: 'OPEN' },
    { name: 'Avata 2', defaultMtowGrams: 377, defaultNumRotors: 4, category: 'OPEN' },
    { name: 'Inspire 3', defaultMtowGrams: 8240, defaultNumRotors: 4, category: 'SPECIFIC' },
    { name: 'Phantom 4 RTK', defaultMtowGrams: 1391, defaultNumRotors: 4, category: 'SPECIFIC' },
    { name: 'Agras T40', defaultMtowGrams: 52300, defaultNumRotors: 8, category: 'CERTIFIED' },
  ];

  for (const m of djiModels) {
    await prisma.droneModel.upsert({
      where: { manufacturerId_name: { manufacturerId: dji.id, name: m.name } },
      update: {},
      create: { manufacturerId: dji.id, ...m },
    });
  }

  const autelModels = [
    { name: 'EVO II Pro V3', defaultMtowGrams: 1250, defaultNumRotors: 4, category: 'SPECIFIC' },
    { name: 'EVO Max 4T', defaultMtowGrams: 1164, defaultNumRotors: 4, category: 'SPECIFIC' },
    { name: 'EVO Lite+', defaultMtowGrams: 835, defaultNumRotors: 4, category: 'OPEN' },
  ];

  for (const m of autelModels) {
    await prisma.droneModel.upsert({
      where: { manufacturerId_name: { manufacturerId: autel.id, name: m.name } },
      update: {},
      create: { manufacturerId: autel.id, ...m },
    });
  }

  // ============================================================
  // MISSION PURPOSES
  // ============================================================
  const purposes = [
    { code: 'MAPPING', nameEs: 'Mapeo y Topografia', nameEn: 'Mapping & Survey' },
    { code: 'INSPECTION', nameEs: 'Inspeccion de Infraestructura', nameEn: 'Infrastructure Inspection' },
    { code: 'PHOTOGRAPHY', nameEs: 'Fotografia Aerea', nameEn: 'Aerial Photography' },
    { code: 'VIDEOGRAPHY', nameEs: 'Produccion Audiovisual', nameEn: 'Video Production' },
    { code: 'AGRICULTURE', nameEs: 'Agricultura de Precision', nameEn: 'Precision Agriculture' },
    { code: 'SURVEILLANCE', nameEs: 'Vigilancia y Seguridad', nameEn: 'Surveillance & Security' },
    { code: 'TRAINING', nameEs: 'Entrenamiento', nameEn: 'Training' },
    { code: 'REAL_ESTATE', nameEs: 'Fotografia Inmobiliaria', nameEn: 'Real Estate Photography' },
    { code: 'EMERGENCY', nameEs: 'Respuesta a Emergencias', nameEn: 'Emergency Response' },
    { code: 'OTHER', nameEs: 'Otro', nameEn: 'Other' },
  ];

  for (const p of purposes) {
    await prisma.missionPurpose.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
  }

  // ============================================================
  // CHECKLIST ITEM CATEGORIES
  // ============================================================
  const categories = [
    { code: 'STRUCTURAL', nameEs: 'Estructura' },
    { code: 'BATTERY', nameEs: 'Bateria' },
    { code: 'SENSORS', nameEs: 'Sensores' },
    { code: 'PROPULSION', nameEs: 'Propulsion' },
    { code: 'CONTROL', nameEs: 'Control' },
    { code: 'SAFETY', nameEs: 'Seguridad' },
  ];

  const categoryMap: Record<string, string> = {};
  for (const c of categories) {
    const cat = await prisma.checklistItemCategory.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
    categoryMap[c.code] = cat.id;
  }

  // ============================================================
  // CHECKLIST TEMPLATES & ITEMS
  // ============================================================
  const templates = [
    {
      type: 'PRE_ASSEMBLY', nameEs: 'Pre-Armado e Inspeccion Fisica',
      items: [
        { textEs: 'Fuselaje sin danos visibles (grietas, abolladuras, deformaciones)', isCritical: true, category: 'STRUCTURAL' },
        { textEs: 'Brazos desplegados y asegurados en posicion de vuelo', isCritical: true, category: 'STRUCTURAL' },
        { textEs: 'Helices sin grietas ni desgaste - direccion correcta CW/CCW', isCritical: true, category: 'PROPULSION' },
        { textEs: 'Helices ajustadas firmemente en los motores', isCritical: true, category: 'PROPULSION' },
        { textEs: 'Motores giran libremente sin obstrucciones', isCritical: true, category: 'PROPULSION' },
        { textEs: 'Bateria de vuelo cargada >= 80%', isCritical: true, category: 'BATTERY' },
        { textEs: 'Bateria insertada y asegurada correctamente', isCritical: true, category: 'BATTERY' },
        { textEs: 'Contactos de bateria limpios y sin corrosion', isCritical: false, category: 'BATTERY' },
        { textEs: 'Tarjeta microSD insertada y con espacio disponible', isCritical: false, category: 'SENSORS' },
        { textEs: 'Lente de camara/sensor limpia y sin obstrucciones', isCritical: false, category: 'SENSORS' },
        { textEs: 'Gimbal desenganchado y se mueve libremente', isCritical: false, category: 'SENSORS' },
        { textEs: 'Tren de aterrizaje en posicion correcta', isCritical: true, category: 'STRUCTURAL' },
        { textEs: 'Sensores de proximidad/anticolision limpios', isCritical: false, category: 'SENSORS' },
      ],
    },
    {
      type: 'CONFIGURATION', nameEs: 'Configuracion y Enlace',
      items: [
        { textEs: 'Control remoto encendido y enlazado con la aeronave', isCritical: true, category: 'CONTROL' },
        { textEs: 'Bateria del control remoto >= 80%', isCritical: true, category: 'CONTROL' },
        { textEs: 'App de vuelo conectada y mostrando telemetria', isCritical: true, category: 'CONTROL' },
        { textEs: 'Senal GPS activa con >= 8 satelites', isCritical: true, category: 'SENSORS' },
        { textEs: 'Brujula calibrada - sin interferencia magnetica', isCritical: true, category: 'SENSORS' },
        { textEs: 'IMU calibrada (sin alertas de calibracion)', isCritical: true, category: 'SENSORS' },
        { textEs: 'Altitud RTH configurada (min 50m sobre obstaculos, max 120m)', isCritical: true, category: 'SAFETY' },
        { textEs: 'Geofence/limite de distancia activado', isCritical: true, category: 'SAFETY' },
        { textEs: 'Failsafe configurado: RTH en perdida de senal', isCritical: true, category: 'SAFETY' },
        { textEs: 'Limite de altitud maxima configurado (123m AGL)', isCritical: true, category: 'SAFETY' },
        { textEs: 'Enlace de video estable y sin interferencias', isCritical: false, category: 'CONTROL' },
        { textEs: 'Firmware de aeronave y control actualizado', isCritical: false, category: 'CONTROL' },
      ],
    },
    {
      type: 'PRE_TAKEOFF', nameEs: 'Pre-Despegue y Verificacion de Zona',
      items: [
        { textEs: 'Area de despegue despejada en radio de 3 metros', isCritical: true, category: 'SAFETY' },
        { textEs: 'Observador(es) visual(es) informado(s) y en posicion', isCritical: true, category: 'SAFETY' },
        { textEs: 'Sin personas no autorizadas en zona de operacion', isCritical: true, category: 'SAFETY' },
        { textEs: 'Condiciones de viento verificadas in-situ - aceptables', isCritical: true, category: 'SAFETY' },
        { textEs: 'Punto de aterrizaje de emergencia identificado', isCritical: true, category: 'SAFETY' },
        { textEs: 'Altitud maxima de operacion recordada: 123m AGL', isCritical: true, category: 'SAFETY' },
        { textEs: 'Distancia maxima de operacion recordada: 500m VLOS', isCritical: true, category: 'SAFETY' },
        { textEs: 'Satelites GPS confirmados >= 12 para despegue', isCritical: true, category: 'SENSORS' },
        { textEs: 'Enlace de video confirmado estable', isCritical: true, category: 'CONTROL' },
        { textEs: 'Motores inician correctamente (prueba de arranque)', isCritical: true, category: 'PROPULSION' },
        { textEs: 'Hover test a 2m de altura - aeronave estable', isCritical: true, category: 'SAFETY' },
        { textEs: 'Contactos de emergencia a la mano', isCritical: false, category: 'SAFETY' },
      ],
    },
    {
      type: 'POST_FLIGHT', nameEs: 'Post-Vuelo e Inspeccion Final',
      items: [
        { textEs: 'Motores apagados y helices detenidas completamente', isCritical: true, category: 'SAFETY' },
        { textEs: 'Bateria retirada de la aeronave', isCritical: true, category: 'BATTERY' },
        { textEs: 'Inspeccion visual post-vuelo: sin danos visibles', isCritical: false, requiresPhoto: true, category: 'STRUCTURAL' },
        { textEs: 'Helices sin danos ni desgaste post-vuelo', isCritical: false, category: 'PROPULSION' },
        { textEs: 'Registrar nivel final de bateria', isCritical: false, category: 'BATTERY' },
        { textEs: 'Datos de vuelo guardados (fotos, video, telemetria)', isCritical: false, category: 'SENSORS' },
        { textEs: 'Bitacora de vuelo completada con observaciones', isCritical: true, category: 'SAFETY' },
        { textEs: 'Equipo empacado y asegurado para transporte', isCritical: false, category: 'SAFETY' },
      ],
    },
  ];

  for (const t of templates) {
    const existing = await prisma.checklistTemplate.findFirst({
      where: { type: t.type, version: 1 },
    });

    if (!existing) {
      const template = await prisma.checklistTemplate.create({
        data: { type: t.type, version: 1, nameEs: t.nameEs, isActive: true },
      });

      for (let i = 0; i < t.items.length; i++) {
        const item = t.items[i];
        await prisma.checklistTemplateItem.create({
          data: {
            templateId: template.id,
            categoryId: categoryMap[item.category] ?? null,
            orderIndex: i + 1,
            textEs: item.textEs,
            isCritical: item.isCritical,
            requiresPhoto: (item as any).requiresPhoto ?? false,
          },
        });
      }
    }
  }

  // ============================================================
  // EMERGENCY CONTACTS (Colombia)
  // ============================================================
  const contacts = [
    { name: 'Torre de Control El Dorado', role: 'ATC', phone: '+571 266 2000', airportCode: 'SKBO', region: 'Bogota', frequencyMhz: 118.1 },
    { name: 'Torre de Control Guaymaral', role: 'ATC', phone: '+571 676 1222', airportCode: 'SKGY', region: 'Bogota', frequencyMhz: 118.7 },
    { name: 'Torre de Control Jose Maria Cordova', role: 'ATC', phone: '+574 562 2828', airportCode: 'SKRG', region: 'Medellin', frequencyMhz: 121.1 },
    { name: 'Torre de Control Alfonso Bonilla Aragon', role: 'ATC', phone: '+572 666 2323', airportCode: 'SKCL', region: 'Cali', frequencyMhz: 118.3 },
    { name: 'Torre de Control Rafael Nunez', role: 'ATC', phone: '+575 666 6020', airportCode: 'SKCG', region: 'Cartagena', frequencyMhz: 118.9 },
    { name: 'Torre de Control Ernesto Cortissoz', role: 'ATC', phone: '+575 334 8362', airportCode: 'SKBQ', region: 'Barranquilla', frequencyMhz: 118.3 },
    { name: 'Aeronautica Civil (UAEAC)', role: 'AEROCIVIL', phone: '+571 425 1000', region: 'Nacional' },
    { name: 'Linea de Emergencias', role: 'BOMBEROS', phone: '123', region: 'Nacional', isDefault: true },
    { name: 'Policia Nacional', role: 'POLICIA', phone: '112', region: 'Nacional' },
    { name: 'Cruz Roja Colombiana', role: 'AMBULANCIA', phone: '132', region: 'Nacional' },
  ];

  for (const c of contacts) {
    const existing = await prisma.emergencyContact.findFirst({
      where: { name: c.name },
    });
    if (!existing) {
      await prisma.emergencyContact.create({ data: c });
    }
  }

  // ============================================================
  // AIRSPACE ZONE TYPES
  // ============================================================
  const zoneTypes = [
    { code: 'AIRPORT', nameEs: 'Aeropuerto', defaultRadiusM: 5000 },
    { code: 'MILITARY', nameEs: 'Base Militar', defaultRadiusM: 5000 },
    { code: 'GOVERNMENT', nameEs: 'Zona Gubernamental', defaultRadiusM: 1000 },
    { code: 'PRISON', nameEs: 'Centro Penitenciario', defaultRadiusM: 500 },
    { code: 'CRITICAL_INFRA', nameEs: 'Infraestructura Critica', defaultRadiusM: 1000 },
    { code: 'TFR', nameEs: 'Restriccion Temporal', defaultRadiusM: 2000 },
  ];

  const typeMap: Record<string, string> = {};
  for (const zt of zoneTypes) {
    const zoneType = await prisma.airspaceZoneType.upsert({
      where: { code: zt.code },
      update: {},
      create: zt,
    });
    typeMap[zt.code] = zoneType.id;
  }

  // ============================================================
  // AIRSPACE ZONES (Major Colombian airports & restricted areas)
  // ============================================================
  const zones = [
    { name: 'Aeropuerto Internacional El Dorado', type: 'AIRPORT', icaoCode: 'SKBO', lat: 4.7016, lng: -74.1469, radiusM: 5000 },
    { name: 'Aeropuerto Guaymaral', type: 'AIRPORT', icaoCode: 'SKGY', lat: 4.8122, lng: -74.0647, radiusM: 5000 },
    { name: 'Aeropuerto Jose Maria Cordova', type: 'AIRPORT', icaoCode: 'SKRG', lat: 6.1645, lng: -75.4231, radiusM: 5000 },
    { name: 'Aeropuerto Olaya Herrera', type: 'AIRPORT', icaoCode: 'SKMD', lat: 6.2204, lng: -75.5906, radiusM: 5000 },
    { name: 'Aeropuerto Alfonso Bonilla Aragon', type: 'AIRPORT', icaoCode: 'SKCL', lat: 3.5431, lng: -76.3816, radiusM: 5000 },
    { name: 'Aeropuerto Rafael Nunez', type: 'AIRPORT', icaoCode: 'SKCG', lat: 10.4424, lng: -75.5130, radiusM: 5000 },
    { name: 'Aeropuerto Ernesto Cortissoz', type: 'AIRPORT', icaoCode: 'SKBQ', lat: 10.8896, lng: -74.7806, radiusM: 5000 },
    { name: 'Aeropuerto Camilo Daza', type: 'AIRPORT', icaoCode: 'SKCC', lat: 7.9275, lng: -72.5115, radiusM: 5000 },
    { name: 'Aeropuerto Matecana', type: 'AIRPORT', icaoCode: 'SKPE', lat: 4.8127, lng: -75.7395, radiusM: 5000 },
    { name: 'Aeropuerto Simon Bolivar', type: 'AIRPORT', icaoCode: 'SKSM', lat: 11.1196, lng: -74.2306, radiusM: 5000 },
    { name: 'Casa de Narino', type: 'GOVERNMENT', lat: 4.5981, lng: -74.0757, radiusM: 1000 },
    { name: 'Base Aerea CATAM', type: 'MILITARY', lat: 4.6900, lng: -74.1500, radiusM: 5000 },
    { name: 'Canton Norte', type: 'MILITARY', lat: 4.7520, lng: -74.0408, radiusM: 2000 },
    { name: 'Base Aerea Marco Fidel Suarez', type: 'MILITARY', lat: 3.5430, lng: -76.3860, radiusM: 5000 },
    { name: 'Carcel La Picota', type: 'PRISON', lat: 4.5722, lng: -74.1022, radiusM: 500 },
    { name: 'Carcel Modelo', type: 'PRISON', lat: 4.6142, lng: -74.0919, radiusM: 500 },
    { name: 'Carcel El Buen Pastor', type: 'PRISON', lat: 4.6257, lng: -74.0617, radiusM: 500 },
  ];

  for (const z of zones) {
    const existing = await prisma.airspaceZone.findFirst({
      where: { name: z.name },
    });
    if (!existing) {
      await prisma.airspaceZone.create({
        data: {
          typeId: typeMap[z.type],
          name: z.name,
          icaoCode: z.icaoCode ?? null,
          centerLat: z.lat,
          centerLng: z.lng,
          radiusM: z.radiusM,
          isPermanent: true,
          source: 'BUNDLED',
        },
      });
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

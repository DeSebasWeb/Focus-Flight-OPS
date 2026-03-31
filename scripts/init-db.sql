-- =============================================================================
-- Focus Flight Ops - Inicializacion de Base de Datos
-- =============================================================================
-- Este script se ejecuta automaticamente cuando el contenedor de PostgreSQL
-- se crea por primera vez. Crea la base de datos si no existe.
--
-- Las tablas y datos se crean via Prisma Migrate (npx prisma migrate deploy)
-- y Prisma Seed (npx prisma db seed).
-- =============================================================================

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Mensaje de confirmacion
DO $$
BEGIN
  RAISE NOTICE 'Focus Flight Ops: Base de datos inicializada correctamente.';
  RAISE NOTICE 'Ejecutar migraciones: cd Focus-Flight-OPS-backend && npx prisma migrate deploy';
  RAISE NOTICE 'Ejecutar seed: cd Focus-Flight-OPS-backend && npx prisma db seed';
END $$;

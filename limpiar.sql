-- ============================================================
-- LIMPIAR TODAS LAS TABLAS DE SUPABASE
-- Ejecutar en SQL Editor → New Query → Run
-- ============================================================

TRUNCATE TABLE campana_envios CASCADE;
TRUNCATE TABLE campanas CASCADE;
TRUNCATE TABLE pagos CASCADE;
TRUNCATE TABLE renovaciones CASCADE;
TRUNCATE TABLE cotizacion_ofertas CASCADE;
TRUNCATE TABLE cotizaciones CASCADE;
TRUNCATE TABLE polizas CASCADE;
TRUNCATE TABLE leads CASCADE;
TRUNCATE TABLE clientes CASCADE;

-- Reinsertar asesores (son los únicos datos base necesarios)
DELETE FROM asesores;
INSERT INTO asesores (nombre, iniciales, email, rol) VALUES
  ('Mateo Herrera', 'MH', 'mateoherrerap@gmail.com', 'admin'),
  ('Andrea', 'AN', 'andrea@mateoherrera.com', 'asesor');

-- Verificar
SELECT 'asesores' AS tabla, COUNT(*) FROM asesores
UNION ALL SELECT 'clientes', COUNT(*) FROM clientes
UNION ALL SELECT 'leads', COUNT(*) FROM leads
UNION ALL SELECT 'cotizaciones', COUNT(*) FROM cotizaciones
UNION ALL SELECT 'polizas', COUNT(*) FROM polizas
UNION ALL SELECT 'pagos', COUNT(*) FROM pagos
UNION ALL SELECT 'campanas', COUNT(*) FROM campanas;

-- ============================================================
-- MATEO HERRERA SEGUROS — ESQUEMA SUPABASE
-- Ejecutar en SQL Editor de Supabase (supabase.com → tu proyecto → SQL Editor)
-- ============================================================

-- 1) EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2) TABLA DE ASESORES (usuarios del portal)
CREATE TABLE IF NOT EXISTS asesores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  iniciales TEXT NOT NULL DEFAULT '',
  email TEXT UNIQUE,
  rol TEXT NOT NULL DEFAULT 'asesor' CHECK (rol IN ('admin','asesor')),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) TABLA DE CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  documento TEXT,
  tipo TEXT NOT NULL DEFAULT 'Persona' CHECK (tipo IN ('Persona','Empresa')),
  celular TEXT,
  email TEXT,
  ciudad TEXT DEFAULT 'Ibagué',
  direccion TEXT,
  nacimiento DATE,
  hijos INT DEFAULT 0,
  observaciones TEXT,
  asesor_id UUID REFERENCES asesores(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) TABLA DE PÓLIZAS
CREATE TABLE IF NOT EXISTS polizas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  ramo TEXT NOT NULL,
  aseguradora TEXT NOT NULL,
  numero_poliza TEXT,
  prima_anual BIGINT NOT NULL DEFAULT 0,
  fecha_inicio DATE,
  fecha_vencimiento DATE NOT NULL,
  financiacion TEXT NOT NULL DEFAULT 'contado' CHECK (financiacion IN ('contado','financiado')),
  cuotas INT DEFAULT 1,
  valor_cuota BIGINT DEFAULT 0,
  cuotas_pagadas INT DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'vigente' CHECK (estado IN ('vigente','vencida','renovada','cancelada')),
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) PIPELINE DE VENTAS (LEADS)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  celular TEXT,
  email TEXT,
  ciudad TEXT DEFAULT 'Ibagué',
  direccion TEXT,
  nacimiento DATE,
  hijos INT DEFAULT 0,
  ramo TEXT NOT NULL,
  origen TEXT NOT NULL DEFAULT 'wa' CHECK (origen IN ('meta','wa','ref','ig','web','tel')),
  campana TEXT,
  asesor_id UUID REFERENCES asesores(id),
  etapa INT NOT NULL DEFAULT 0 CHECK (etapa BETWEEN 0 AND 8),
  valor_prima BIGINT DEFAULT 0,
  aseguradora TEXT DEFAULT 'Por definir',
  dias_en_etapa INT DEFAULT 0,
  proximo_contacto DATE,
  nota TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6) COTIZACIONES
CREATE TABLE IF NOT EXISTS cotizaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero TEXT UNIQUE NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  ramo TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'generada' CHECK (estado IN ('generada','aprobada','rechazada')),
  financiacion TEXT DEFAULT 'Por definir',
  asesor_id UUID REFERENCES asesores(id),
  pdf_url TEXT,
  observaciones TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7) OFERTAS DE COTIZACIÓN (comparativo por aseguradora)
CREATE TABLE IF NOT EXISTS cotizacion_ofertas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cotizacion_id UUID NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
  aseguradora TEXT NOT NULL,
  valor BIGINT NOT NULL,
  seleccionada BOOLEAN DEFAULT false
);

-- 8) PAGOS (CARTERA)
CREATE TABLE IF NOT EXISTS pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poliza_id UUID NOT NULL REFERENCES polizas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  numero_cuota INT NOT NULL,
  total_cuotas INT NOT NULL,
  valor BIGINT NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  pagado BOOLEAN NOT NULL DEFAULT false,
  fecha_pago DATE,
  recordatorio_enviado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9) CAMPAÑAS DE WHATSAPP
CREATE TABLE IF NOT EXISTS campanas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  objetivo TEXT NOT NULL,
  audiencia TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  imagen_url TEXT,
  total_contactos INT DEFAULT 0,
  total_enviados INT DEFAULT 0,
  asesor_id UUID REFERENCES asesores(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10) DETALLE DE ENVÍOS DE CAMPAÑA
CREATE TABLE IF NOT EXISTS campana_envios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campana_id UUID NOT NULL REFERENCES campanas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  enviado BOOLEAN DEFAULT false,
  fecha_envio TIMESTAMPTZ
);

-- 11) RENOVACIONES
CREATE TABLE IF NOT EXISTS renovaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poliza_id UUID NOT NULL REFERENCES polizas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  etapa INT NOT NULL DEFAULT 0 CHECK (etapa BETWEEN 0 AND 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_leads_etapa ON leads(etapa);
CREATE INDEX IF NOT EXISTS idx_leads_ramo ON leads(ramo);
CREATE INDEX IF NOT EXISTS idx_leads_asesor ON leads(asesor_id);
CREATE INDEX IF NOT EXISTS idx_polizas_cliente ON polizas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_polizas_vencimiento ON polizas(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_pagos_vencimiento ON pagos(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_pagos_pagado ON pagos(pagado);
CREATE INDEX IF NOT EXISTS idx_clientes_nacimiento ON clientes(nacimiento);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_estado ON cotizaciones(estado);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE asesores ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE polizas ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizacion_ofertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanas ENABLE ROW LEVEL SECURITY;
ALTER TABLE campana_envios ENABLE ROW LEVEL SECURITY;
ALTER TABLE renovaciones ENABLE ROW LEVEL SECURITY;

-- Política: los usuarios autenticados pueden ver y editar todo
-- (después se puede restringir por asesor si se necesita)
CREATE POLICY "auth_full_access" ON asesores FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_full_access" ON clientes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_full_access" ON polizas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_full_access" ON leads FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_full_access" ON cotizaciones FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_full_access" ON cotizacion_ofertas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_full_access" ON pagos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_full_access" ON campanas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_full_access" ON campana_envios FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_full_access" ON renovaciones FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE BUCKETS (ejecutar después en Storage → New Bucket)
-- O usar este SQL:
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('cotizaciones', 'cotizaciones', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('campanas', 'campanas', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('polizas', 'polizas', true) ON CONFLICT DO NOTHING;

-- Políticas de storage: usuarios autenticados pueden subir/leer
CREATE POLICY "auth_upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON storage.objects FOR SELECT USING (true);

-- ============================================================
-- DATOS INICIALES: Asesores
-- ============================================================
INSERT INTO asesores (nombre, iniciales, email, rol) VALUES
  ('Mateo Herrera', 'MH', 'mateoherrerap@gmail.com', 'admin'),
  ('Andrea', 'AN', 'andrea@mateoherrera.com', 'asesor')
ON CONFLICT DO NOTHING;

-- ============================================================
-- FUNCIÓN: auto-updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clientes_updated BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_polizas_updated BEFORE UPDATE ON polizas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_cotizaciones_updated BEFORE UPDATE ON cotizaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_renovaciones_updated BEFORE UPDATE ON renovaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- VISTA: próximos pagos con datos del cliente
-- ============================================================
CREATE OR REPLACE VIEW v_proximos_pagos AS
SELECT
  p.id, p.numero_cuota, p.total_cuotas, p.valor, p.fecha_vencimiento, p.pagado,
  p.fecha_vencimiento - CURRENT_DATE AS dias_para_vencer,
  c.nombre AS cliente_nombre, c.celular, c.email AS cliente_email,
  pol.ramo, pol.aseguradora, pol.numero_poliza
FROM pagos p
JOIN clientes c ON c.id = p.cliente_id
JOIN polizas pol ON pol.id = p.poliza_id
WHERE p.pagado = false
ORDER BY p.fecha_vencimiento;

-- ============================================================
-- VISTA: cumpleaños próximos
-- ============================================================
CREATE OR REPLACE VIEW v_cumpleanos AS
SELECT
  c.id, c.nombre, c.celular, c.email, c.nacimiento,
  EXTRACT(MONTH FROM c.nacimiento) AS mes_nac,
  EXTRACT(DAY FROM c.nacimiento) AS dia_nac,
  CASE
    WHEN (EXTRACT(MONTH FROM c.nacimiento)*100 + EXTRACT(DAY FROM c.nacimiento))
         >= (EXTRACT(MONTH FROM CURRENT_DATE)*100 + EXTRACT(DAY FROM CURRENT_DATE))
    THEN (EXTRACT(MONTH FROM c.nacimiento)*100 + EXTRACT(DAY FROM c.nacimiento))
         - (EXTRACT(MONTH FROM CURRENT_DATE)*100 + EXTRACT(DAY FROM CURRENT_DATE))
    ELSE 1200 + (EXTRACT(MONTH FROM c.nacimiento)*100 + EXTRACT(DAY FROM c.nacimiento))
         - (EXTRACT(MONTH FROM CURRENT_DATE)*100 + EXTRACT(DAY FROM CURRENT_DATE))
  END AS dias_faltan
FROM clientes c
WHERE c.nacimiento IS NOT NULL
ORDER BY dias_faltan;

-- ==============================================================================
-- INSTRUCCIONES:
-- 1. Ve a tu Dashboard de Supabase -> SQL Editor
-- 2. Pega este contenido y dale a "Run"
-- ==============================================================================

-- 1. Habilitar RLS en la tabla admins (si no estaba habilitado)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 2. Policy BOOTSTRAP: Permitir insertar el PRIMER admin si la tabla está vacía
-- Esto soluciona el problema de "Huevo y Gallina"
DROP POLICY IF EXISTS "Bootstrap Policy" ON public.admins;
CREATE POLICY "Bootstrap Policy"
ON public.admins
FOR INSERT
WITH CHECK (
  (SELECT count(*) FROM public.admins) = 0
);

-- 3. Policy PRINCIPAL: Los admins activos pueden gestionar otros admins (CRUD total)
DROP POLICY IF EXISTS "Admins Only" ON public.admins;
CREATE POLICY "Admins Only"
ON public.admins
USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND activo = true)
);

-- 4. Policy LECTURA PROPIA: Un usuario autenticado puede leer SU PROPIO registro
-- Necesario para login y comprobaciones iniciales
DROP POLICY IF EXISTS "Read Own Profile" ON public.admins;
CREATE POLICY "Read Own Profile"
ON public.admins
FOR SELECT
USING (
  auth.uid() = id
);

-- ==============================================================================
-- POLICIES DE STORAGE (Fotos y Videos)
-- ==============================================================================

-- VITRINA FOTOS (Bucket: vitrina-fotos)
-- Permitir lectura pública
CREATE POLICY "Public Read Vitrina"
ON storage.objects FOR SELECT
USING ( bucket_id = 'vitrina-fotos' );

-- Permitir gestión TOTAL solo a Admins Activos
CREATE POLICY "Admins Manage Vitrina"
ON storage.objects FOR ALL
USING (
  bucket_id = 'vitrina-fotos'
  AND EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND activo = true)
);

-- VIDEOS EMPRENDIMIENTOS (Bucket: videos-emprendimientos)
-- Permitir lectura pública
CREATE POLICY "Public Read Videos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'videos-emprendimientos' );

-- Permitir gestión TOTAL solo a Admins Activos
CREATE POLICY "Admins Manage Videos"
ON storage.objects FOR ALL
USING (
  bucket_id = 'videos-emprendimientos'
  AND EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND activo = true)
);


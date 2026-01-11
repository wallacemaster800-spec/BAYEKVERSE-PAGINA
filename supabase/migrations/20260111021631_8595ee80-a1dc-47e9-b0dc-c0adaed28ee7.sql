-- Create enum for series status
CREATE TYPE public.estado_serie AS ENUM ('En emisión', 'Finalizada');

-- Create series table
CREATE TABLE public.series (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    portada_url TEXT,
    estado public.estado_serie NOT NULL DEFAULT 'En emisión',
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create capitulos (episodes) table
CREATE TABLE public.capitulos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    series_id UUID REFERENCES public.series(id) ON DELETE CASCADE NOT NULL,
    titulo TEXT NOT NULL,
    youtube_id TEXT NOT NULL,
    miniatura_url TEXT,
    orden INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lore table
CREATE TABLE public.lore (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    series_id UUID REFERENCES public.series(id) ON DELETE CASCADE NOT NULL,
    titulo TEXT NOT NULL,
    contenido_md TEXT,
    orden INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create galeria table
CREATE TABLE public.galeria (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    series_id UUID REFERENCES public.series(id) ON DELETE CASCADE NOT NULL,
    imagen_url TEXT NOT NULL,
    titulo TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capitulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lore ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeria ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (streaming platform - content is public)
CREATE POLICY "Public can view series" ON public.series FOR SELECT USING (true);
CREATE POLICY "Public can view capitulos" ON public.capitulos FOR SELECT USING (true);
CREATE POLICY "Public can view lore" ON public.lore FOR SELECT USING (true);
CREATE POLICY "Public can view galeria" ON public.galeria FOR SELECT USING (true);

-- Authenticated users can manage content (admin will be validated in app)
CREATE POLICY "Authenticated users can insert series" ON public.series FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update series" ON public.series FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete series" ON public.series FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert capitulos" ON public.capitulos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update capitulos" ON public.capitulos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete capitulos" ON public.capitulos FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert lore" ON public.lore FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update lore" ON public.lore FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete lore" ON public.lore FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert galeria" ON public.galeria FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update galeria" ON public.galeria FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete galeria" ON public.galeria FOR DELETE TO authenticated USING (true);

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_series_updated_at
    BEFORE UPDATE ON public.series
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lore_updated_at
    BEFORE UPDATE ON public.lore
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_capitulos_series_id ON public.capitulos(series_id);
CREATE INDEX idx_capitulos_orden ON public.capitulos(orden);
CREATE INDEX idx_lore_series_id ON public.lore(series_id);
CREATE INDEX idx_galeria_series_id ON public.galeria(series_id);
CREATE INDEX idx_series_slug ON public.series(slug);
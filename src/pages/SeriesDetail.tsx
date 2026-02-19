import { useState, useEffect, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { useSeriesBySlug, Capitulo } from '@/hooks/useSeries';
import { useAllCapitulos } from '@/hooks/useAllCapitulos';
import { VideoPlayer } from '@/components/series/VideoPlayer';
import { EpisodeNavigation } from '@/components/series/EpisodeNavigation';
import { SeasonTabs } from '@/components/series/SeasonTabs';
import { LoreViewer } from '@/components/series/LoreViewer';
import { GalleryMosaic } from '@/components/series/GalleryMosaic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Play, BookOpen, Image as ImageIcon, Lock, ShieldAlert, Globe, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { META_DEFAULTS } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function SeriesDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { session } = useAuth();
  const { data: seriesData, isLoading, error } = useSeriesBySlug(slug || '');
  
  // Normalizamos la serie porque a veces los hooks devuelven arrays
  const series = Array.isArray(seriesData) ? seriesData[0] : seriesData;

  const [selectedEpisode, setSelectedEpisode] = useState<Capitulo | null>(null);
  const [activeTab, setActiveTab] = useState<'episodios' | 'lore' | 'galeria'>('episodios');
  const [hasPurchased, setHasPurchased] = useState(false);
  
  const playerRef = useRef<HTMLDivElement>(null);
  const { data: allEpisodes } = useAllCapitulos(activeTab === 'episodios' ? series?.id || '' : '');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // VERIFICACIÓN DE COMPRA - ROBUSTA
  useEffect(() => {
    const checkPurchase = async () => {
      if (!session?.user?.id || !series?.id) return;
      
      const { data, error: purchaseError } = await (supabase as any)
        .from('compras')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('series_id', series.id);

      if (purchaseError) {
        console.error("Error al consultar compras:", purchaseError.message);
        return;
      }

      if (data && data.length > 0) {
        setHasPurchased(true);
      } else {
        setHasPurchased(false);
      }
    };
    
    checkPurchase();
  }, [session, series]);

  useEffect(() => {
    if (selectedEpisode && playerRef.current) {
      setTimeout(() => {
        playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedEpisode]);

  const handlePurchase = () => {
    if (!session) return alert("Iniciá sesión para comprar.");
    const gumroadUrl = (series as any)?.lemon_url; 
    if (!gumroadUrl) return alert("Link global no configurado.");
    window.location.href = `${gumroadUrl}${gumroadUrl.includes('?') ? '&' : '?'}user_id=${session.user.id}&series_id=${series?.id}`;
  };

  // MANEJO DE MERCADO PAGO CORREGIDO
  const handleMPPurchase = async () => {
    if (!session) return alert("Iniciá sesión para comprar.");
    if (!series?.id) return alert("Error: No se cargó el ID de la serie.");

    try {
      console.log("Enviando a checkout:", { seriesId: series.id, userId: session.user.id });
      
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seriesId: series.id, // UUID Seguro
          userId: session.user.id,
          title: (series as any).titulo
        })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Error del backend:", data.error);
        alert(`Error: ${data.error || 'No se pudo generar el pago'}`);
      }
    } catch (e) {
      alert("Error de conexión al servidor de pagos.");
    }
  };

  if (error) return <Navigate to="/" />;
  if (isLoading || !series) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="aspect-video max-w-4xl mx-auto skeleton-shimmer rounded-lg" />
        </div>
      </Layout>
    );
  }

  const isEpisodeLocked = selectedEpisode?.es_pago && !hasPurchased;

  return (
    <>
      <Helmet>
        <title>{(series as any).titulo} | {META_DEFAULTS.siteName}</title>
        <meta name="description" content={(series as any).descripcion || META_DEFAULTS.description} />
      </Helmet>

      <Layout>
        <div className="container mx-auto px-4 py-8">
          <AnimatePresence>
            {selectedEpisode && (
              <motion.div ref={playerRef} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 32 }} exit={{ opacity: 0, height: 0 }} className="max-w-5xl mx-auto overflow-hidden">
                {isEpisodeLocked ? (
                  <div className="relative w-full aspect-auto min-h-[500px] md:aspect-video bg-black rounded-xl border-2 border-amber-500/30 shadow-2xl flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dpv3kpsmt/image/upload/v1739818821/bayekverse_logo_vzr0r8.png')] bg-cover bg-center opacity-10 blur-sm mix-blend-screen" />
                    <ShieldAlert className="w-16 h-16 text-amber-500 mb-4 z-10" />
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2 z-10 uppercase italic">Contenido PREMIUM</h2>
                    <p className="text-muted-foreground mb-8 max-w-lg z-10 text-xs md:text-sm">Adquiere el pase completo para desbloquear <strong className="text-amber-500">{(series as any).titulo}</strong>.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md z-10">
                      <Button onClick={handleMPPurchase} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-16 flex flex-col items-center justify-center">
                        <span className="text-[10px] uppercase opacity-70 font-black">Argentina</span>
                        <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> PAGAR EN PESOS</span>
                      </Button>
                      <Button onClick={handlePurchase} variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500/10 h-16 flex flex-col items-center justify-center">
                        <span className="text-[10px] uppercase opacity-70 font-black">Global</span>
                        <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> PAY IN USD</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <VideoPlayer src={selectedEpisode.video_url || ''} title={selectedEpisode.titulo} poster={selectedEpisode.miniatura_url} />
                )}
                <div className="mt-4 px-1">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    T{selectedEpisode.temporada} · Ep. {selectedEpisode.orden}: {selectedEpisode.titulo}
                    {selectedEpisode.es_pago && <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded uppercase font-bold">Premium</span>}
                  </h2>
                </div>
                {allEpisodes && <EpisodeNavigation currentEpisode={selectedEpisode} allEpisodes={allEpisodes as any} onNavigate={setSelectedEpisode} />}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="max-w-5xl mx-auto mb-10">
            <div className="flex items-start gap-5">
              {(series as any).portada_url && <OptimizedImage src={(series as any).portada_url} alt={(series as any).titulo} size="thumbnail" className="w-24 h-36 rounded-xl hidden sm:block object-cover border border-white/10" />}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-display font-bold uppercase italic text-primary">{(series as any).titulo}</h1>
                <p className="text-muted-foreground mt-2">{(series as any).descripcion}</p>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="bg-card/50 border mb-8">
                <TabsTrigger value="episodios"><Play className="w-4 h-4 mr-2" /> Episodios</TabsTrigger>
                <TabsTrigger value="lore"><BookOpen className="w-4 h-4 mr-2" /> Lore</TabsTrigger>
                <TabsTrigger value="galeria"><ImageIcon className="w-4 h-4 mr-2" /> Galería</TabsTrigger>
              </TabsList>
              <TabsContent value="episodios">{allEpisodes && <SeasonTabs episodes={allEpisodes as any} onSelectEpisode={setSelectedEpisode} selectedEpisodeId={selectedEpisode?.id} hasPurchased={hasPurchased} />}</TabsContent>
              <TabsContent value="lore"><LoreViewer seriesId={series.id} isActive={activeTab === 'lore'} /></TabsContent>
              <TabsContent value="galeria"><GalleryMosaic seriesId={series.id} isActive={activeTab === 'galeria'} /></TabsContent>
            </Tabs>
          </div>
        </div>
      </Layout>
    </>
  );
}
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
import { Play, BookOpen, Image, Lock, ShieldAlert, Globe, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { META_DEFAULTS } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function SeriesDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { session } = useAuth();
  const { data: series, isLoading, error } = useSeriesBySlug(slug || '');
  
  const [selectedEpisode, setSelectedEpisode] = useState<Capitulo | null>(null);
  const [activeTab, setActiveTab] = useState<'episodios' | 'lore' | 'galeria'>('episodios');
  const [hasPurchased, setHasPurchased] = useState(false);
  
  const playerRef = useRef<HTMLDivElement>(null);
  const { data: allEpisodes } = useAllCapitulos(activeTab === 'episodios' ? (series as any)?.id || '' : '');

  // Efecto para scroll al cambiar de serie
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Verificar estado de compra en Supabase
  useEffect(() => {
    const checkPurchase = async () => {
      if (!session?.user?.id || !(series as any)?.id) return;
      
      const { data } = await (supabase as any)
        .from('compras')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('series_id', (series as any).id)
        .maybeSingle();

      if (data) setHasPurchased(true);
    };
    checkPurchase();
  }, [session, series]);

  // Scroll suave al seleccionar episodio
  useEffect(() => {
    if (selectedEpisode && playerRef.current) {
      setTimeout(() => {
        playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedEpisode]);

  // Manejo de compra Global (Gumroad)
  const handlePurchase = () => {
    if (!session) return alert("Debes iniciar sesión para comprar.");
    const gumroadUrl = (series as any)?.lemon_url; 
    if (!gumroadUrl) return alert("Link global no configurado en la base de datos.");
    
    const separator = gumroadUrl.includes('?') ? '&' : '?';
    window.location.href = `${gumroadUrl}${separator}user_id=${session.user.id}&series_id=${(series as any).id}`;
  };

  // Manejo de compra Argentina (Mercado Pago)
  const handleMPPurchase = () => {
    if (!session) return alert("Debes iniciar sesión para comprar.");
    const mpUrl = (series as any)?.mp_url; 
    if (!mpUrl) return alert("Link de Argentina no configurado en la base de datos.");

    const separator = mpUrl.includes('?') ? '&' : '?';
    const finalUrl = `${mpUrl}${separator}external_reference=${session.user.id}|${(series as any).id}`;
    
    console.log("Redirigiendo a Mercado Pago:", finalUrl);
    window.location.href = finalUrl;
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
              <motion.div
                ref={playerRef}
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="max-w-5xl mx-auto overflow-hidden"
              >
                {isEpisodeLocked ? (
                  /* EL CAMBIO CLAVE: aspect-auto y min-h para móviles */
                  <div className="relative w-full aspect-auto min-h-[500px] md:aspect-video bg-black rounded-xl border-2 border-amber-500/30 shadow-2xl flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dpv3kpsmt/image/upload/v1739818821/bayekverse_logo_vzr0r8.png')] bg-cover bg-center opacity-10 blur-sm mix-blend-screen" />
                    
                    <ShieldAlert className="w-16 h-16 text-amber-500 mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] z-10" />
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2 z-10 uppercase italic">Contenido Clasificado</h2>
                    <p className="text-muted-foreground mb-8 max-w-lg z-10 text-xs md:text-sm leading-relaxed">
                      Esta transmisión requiere una llave de acceso Premium. Adquiere el pase completo para desbloquear <strong className="text-amber-500">{(series as any).titulo}</strong> y todos sus archivos secretos.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md z-10">
                      <Button 
                        onClick={handleMPPurchase}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-16 flex flex-col items-center justify-center transition-all hover:scale-105 shadow-lg"
                      >
                        <span className="text-[10px] uppercase opacity-70 tracking-tighter font-black">Argentina</span>
                        <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> PAGAR EN PESOS</span>
                      </Button>

                      <Button 
                        onClick={handlePurchase}
                        variant="outline"
                        className="border-amber-500 text-amber-500 hover:bg-amber-500/10 h-16 flex flex-col items-center justify-center transition-all hover:scale-105"
                      >
                        <span className="text-[10px] uppercase opacity-70 tracking-tighter font-black">Resto del Mundo</span>
                        <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> GLOBAL (USD)</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <VideoPlayer 
                    src={selectedEpisode.video_url || ''} 
                    title={selectedEpisode.titulo} 
                    poster={selectedEpisode.miniatura_url} 
                  />
                )}

                <div className="mt-4 px-1">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    T{selectedEpisode.temporada || 1} · Ep. {selectedEpisode.orden}: {selectedEpisode.titulo}
                    {selectedEpisode.es_pago && <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded uppercase font-bold tracking-wider">Premium</span>}
                  </h2>
                </div>

                {allEpisodes && (
                  <EpisodeNavigation 
                    currentEpisode={selectedEpisode} 
                    allEpisodes={allEpisodes as any} 
                    onNavigate={setSelectedEpisode} 
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Información de la Serie */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="max-w-5xl mx-auto mb-10">
            <div className="flex items-start gap-5">
              {(series as any).portada_url && (
                <OptimizedImage 
                  src={(series as any).portada_url} 
                  alt={(series as any).titulo} 
                  size="thumbnail" 
                  className="w-24 h-36 rounded-xl flex-shrink-0 hidden sm:block object-cover border border-white/10 shadow-xl" 
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tighter italic text-primary">{(series as any).titulo}</h1>
                  {(series as any).estado === 'En emisión' ? <span className="badge-emision">En emisión</span> : <span className="badge-finalizada">Finalizada</span>}
                </div>
                {(series as any).descripcion && <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-3xl">{(series as any).descripcion}</p>}
              </div>
            </div>
          </motion.div>

          {/* Navegación por Pestañas */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="max-w-5xl mx-auto">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="w-full justify-start bg-card/50 backdrop-blur-sm border border-border mb-8 p-1">
                <TabsTrigger value="episodios" className="tab-cinematic flex items-center gap-2 px-6"><Play className="w-4 h-4" /> Episodios</TabsTrigger>
                <TabsTrigger value="lore" className="tab-cinematic flex items-center gap-2 px-6"><BookOpen className="w-4 h-4" /> Lore</TabsTrigger>
                <TabsTrigger value="galeria" className="tab-cinematic flex items-center gap-2 px-6"><Image className="w-4 h-4" /> Galería</TabsTrigger>
              </TabsList>

              <TabsContent value="episodios" className="mt-0 focus-visible:outline-none">
                {allEpisodes ? (
                  <SeasonTabs 
                    episodes={allEpisodes as any} 
                    onSelectEpisode={setSelectedEpisode} 
                    selectedEpisodeId={selectedEpisode?.id} 
                    hasPurchased={hasPurchased} 
                  />
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-video skeleton-shimmer rounded-lg" /> )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="lore" className="mt-0 focus-visible:outline-none">
                <LoreViewer seriesId={(series as any).id} isActive={activeTab === 'lore'} />
              </TabsContent>
              
              <TabsContent value="galeria" className="mt-0 focus-visible:outline-none">
                <GalleryMosaic seriesId={(series as any).id} isActive={activeTab === 'galeria'} />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </Layout>
    </>
  );
}
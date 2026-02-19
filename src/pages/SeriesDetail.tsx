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
  const { data: allEpisodes } = useAllCapitulos(activeTab === 'episodios' ? series?.id || '' : '');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const checkPurchase = async () => {
      if (!session?.user?.id || !series?.id) return;
      
      const { data } = await (supabase as any)
        .from('compras')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('series_id', series.id)
        .maybeSingle();

      if (data) setHasPurchased(true);
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

  // --- FUNCIÓN GUMROAD (GLOBAL) ---
  const handlePurchase = () => {
    if (!session) return alert("Debes iniciar sesión para comprar.");
    const gumroadUrl = (series as any)?.lemon_url; 
    if (!gumroadUrl) return alert("Link global no configurado.");

    const separator = gumroadUrl.includes('?') ? '&' : '?';
    window.location.href = `${gumroadUrl}${separator}user_id=${session.user.id}&series_id=${series.id}`;
  };

  // --- FUNCIÓN MERCADO PAGO (ARGENTINA) ---
  const handleMPPurchase = () => {
    if (!session) return alert("Debes iniciar sesión para comprar.");
    // PEGÁ ACÁ TU LINK DE MERCADO PAGO (el de 22 dígitos o el slug)
    const mpBaseUrl = "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=TU_ID_AQUI"; 
    
    // Mandamos el ID de usuario y de serie en external_reference
    const GUMROAD_LINK = `${mpBaseUrl}&external_reference=${session.user.id}|${series.id}`;
    window.location.href = GUMROAD_LINK;
  };

  if (error) return <Navigate to="/" />;
  if (isLoading || !series) return <Layout><div className="p-20 text-center">Cargando transmisión...</div></Layout>;

  const isEpisodeLocked = selectedEpisode?.es_pago && !hasPurchased;

  return (
    <>
      <Helmet>
        <title>{series.titulo} | {META_DEFAULTS.siteName}</title>
      </Helmet>

      <Layout>
        <div className="container mx-auto px-4 py-8">
          <AnimatePresence>
            {selectedEpisode && (
              <motion.div ref={playerRef} className="max-w-5xl mx-auto overflow-hidden mb-8">
                {isEpisodeLocked ? (
                  <div className="relative w-full aspect-video bg-black rounded-xl border-2 border-amber-500/30 shadow-2xl flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dpv3kpsmt/image/upload/v1739818821/bayekverse_logo_vzr0r8.png')] bg-cover bg-center opacity-10 blur-sm" />
                    
                    <ShieldAlert className="w-12 h-12 text-amber-500 mb-4 z-10" />
                    <h2 className="text-2xl font-display font-bold text-white mb-2 z-10 uppercase tracking-tighter italic">Acceso Restringido</h2>
                    <p className="text-muted-foreground mb-6 max-w-md z-10 text-xs md:text-sm">
                      Esta transmisión requiere autorización de nivel Premium. Elige tu método de pago para desbloquear el contenido.
                    </p>
                    
                    {/* DOBLE BOTÓN DE PAGO */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md z-10">
                      <Button 
                        onClick={handleMPPurchase}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 flex flex-col gap-0"
                      >
                        <span className="text-xs opacity-80 uppercase">Argentina</span>
                        <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Pagar en Pesos</span>
                      </Button>

                      <Button 
                        onClick={handlePurchase}
                        variant="outline"
                        className="border-amber-500 text-amber-500 hover:bg-amber-500/10 h-14 flex flex-col gap-0"
                      >
                        <span className="text-xs opacity-80 uppercase">Global</span>
                        <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> USD / Internacional</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <VideoPlayer src={selectedEpisode.video_url || ''} title={selectedEpisode.titulo} poster={selectedEpisode.miniatura_url} />
                )}

                <div className="mt-3 px-1">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    T{selectedEpisode.temporada} · Ep. {selectedEpisode.orden}: {selectedEpisode.titulo}
                    {selectedEpisode.es_pago && <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded uppercase font-bold tracking-wider">Premium</span>}
                  </h2>
                </div>

                {allEpisodes && (
                  <EpisodeNavigation currentEpisode={selectedEpisode} allEpisodes={allEpisodes as any} onNavigate={setSelectedEpisode} />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* SERIES INFO */}
          <div className="max-w-5xl mx-auto mb-8 flex items-start gap-4">
            {series.portada_url && <OptimizedImage src={series.portada_url} alt={series.titulo} size="thumbnail" className="w-20 h-28 rounded-lg hidden sm:block" />}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-display font-bold uppercase italic tracking-tighter text-primary">{series.titulo}</h1>
                <span className={series.estado === 'En emisión' ? 'badge-emision' : 'badge-finalizada'}>{series.estado}</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{series.descripcion}</p>
            </div>
          </div>

          {/* TABS */}
          <div className="max-w-5xl mx-auto">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="w-full justify-start bg-card border border-border mb-6">
                <TabsTrigger value="episodios" className="tab-cinematic gap-2"><Play className="w-4 h-4" /> Episodios</TabsTrigger>
                <TabsTrigger value="lore" className="tab-cinematic gap-2"><BookOpen className="w-4 h-4" /> Lore</TabsTrigger>
                <TabsTrigger value="galeria" className="tab-cinematic gap-2"><Image className="w-4 h-4" /> Galería</TabsTrigger>
              </TabsList>
              <TabsContent value="episodios">
                {allEpisodes && <SeasonTabs episodes={allEpisodes as any} onSelectEpisode={setSelectedEpisode} selectedEpisodeId={selectedEpisode?.id} hasPurchased={hasPurchased} />}
              </TabsContent>
              <TabsContent value="lore"><LoreViewer seriesId={series.id} isActive={activeTab === 'lore'} /></TabsContent>
              <TabsContent value="galeria"><GalleryMosaic seriesId={series.id} isActive={activeTab === 'galeria'} /></TabsContent>
            </Tabs>
          </div>
        </div>
      </Layout>
    </>
  );
}
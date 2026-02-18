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
import { Play, BookOpen, Image } from 'lucide-react';
import { META_DEFAULTS } from '@/lib/constants';

export default function SeriesDetail() {

  const { slug } = useParams<{ slug: string }>();

  const { data: series, isLoading, error } = useSeriesBySlug(slug || '');

  const [selectedEpisode, setSelectedEpisode] = useState<Capitulo | null>(null);

  const [activeTab, setActiveTab] =
    useState<'episodios' | 'lore' | 'galeria'>('episodios');

  const playerRef = useRef<HTMLDivElement>(null);

  const { data: allEpisodes } =
    useAllCapitulos(activeTab === 'episodios' ? series?.id || '' : '');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {

    if (selectedEpisode && playerRef.current) {

      setTimeout(() => {
        playerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);

    }

  }, [selectedEpisode]);


  if (error) return <Navigate to="/" />;

  if (isLoading) {

    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="aspect-video max-w-4xl mx-auto skeleton-shimmer rounded-lg" />
        </div>
      </Layout>
    );
  }

  if (!series) return <Navigate to="/" />;

  const metaTitle = `${series.titulo} | ${META_DEFAULTS.siteName}`;

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={series.descripcion || META_DEFAULTS.description} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={series.descripcion || ''} />
        <meta property="og:type" content="video.tv_show" />
        {series.portada_url && <meta property="og:image" content={series.portada_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        {series.portada_url && <meta name="twitter:image" content={series.portada_url} />}
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

                <VideoPlayer
                  src={selectedEpisode.video_url || ''}
                  title={selectedEpisode.titulo}
                  poster={selectedEpisode.miniatura_url}
                />

                <div className="mt-3 px-1">

                  <h2 className="text-lg font-semibold">
                    T{selectedEpisode.temporada || 1}
                    {' '}· Ep. {selectedEpisode.orden}
                    : {selectedEpisode.titulo}
                  </h2>

                </div>

                {allEpisodes && (

                  <EpisodeNavigation
                    currentEpisode={selectedEpisode}
                    allEpisodes={allEpisodes}
                    onNavigate={setSelectedEpisode}
                  />

                )}

              </motion.div>

            )}

          </AnimatePresence>


          {/* SERIES INFO */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-5xl mx-auto mb-8"
          >

            <div className="flex items-start gap-4">

              {series.portada_url && (

                <OptimizedImage
                  src={series.portada_url}
                  alt={series.titulo}
                  size="thumbnail"
                  className="w-20 h-28 rounded-lg flex-shrink-0 hidden sm:block"
                />

              )}

              <div>

                <div className="flex items-center gap-3 mb-2">

                  <h1 className="text-2xl md:text-3xl font-display font-bold">
                    {series.titulo}
                  </h1>

                  {series.estado === 'En emisión'
                    ? <span className="badge-emision">En emisión</span>
                    : <span className="badge-finalizada">Finalizada</span>
                  }

                </div>

                {series.descripcion &&
                  <p className="text-muted-foreground">{series.descripcion}</p>
                }

              </div>

            </div>

          </motion.div>


          {/* TABS */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-5xl mx-auto"
          >

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>

              <TabsList className="w-full justify-start bg-card border border-border mb-6">

                <TabsTrigger value="episodios" className="tab-cinematic flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Episodios
                </TabsTrigger>

                <TabsTrigger value="lore" className="tab-cinematic flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Lore
                </TabsTrigger>

                <TabsTrigger value="galeria" className="tab-cinematic flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Galería
                </TabsTrigger>

              </TabsList>


              <TabsContent value="episodios">

                {allEpisodes ? (

                  <SeasonTabs
                    episodes={allEpisodes}
                    onSelectEpisode={setSelectedEpisode}
                    selectedEpisodeId={selectedEpisode?.id}
                  />

                ) : (

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) =>
                      <div key={i} className="aspect-video skeleton-shimmer rounded-lg" />
                    )}
                  </div>

                )}

              </TabsContent>


              <TabsContent value="lore">
                <LoreViewer seriesId={series.id} isActive={activeTab === 'lore'} />
              </TabsContent>

              <TabsContent value="galeria">
                <GalleryMosaic seriesId={series.id} isActive={activeTab === 'galeria'} />
              </TabsContent>

            </Tabs>

          </motion.div>

        </div>
      </Layout>
    </>
  );
}

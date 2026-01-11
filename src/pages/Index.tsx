import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { SeriesGrid } from '@/components/series/SeriesGrid';
import { META_DEFAULTS } from '@/lib/constants';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>{META_DEFAULTS.title}</title>
        <meta name="description" content={META_DEFAULTS.description} />
        <meta property="og:title" content={META_DEFAULTS.title} />
        <meta property="og:description" content={META_DEFAULTS.description} />
      </Helmet>

      <Layout>
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-glow-red/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-4">
                <span className="text-gradient-metallic">BAYEKVERSE</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Lo que no vas a encontrar en el stream de siempre. Series, lore, arte y más: conoce el universo de Bayek
              </p>
            </motion.div>
          </div>
        </section>

        {/* Series Grid */}
        <section className="container mx-auto px-4 pb-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-display font-semibold mb-8">Series</h2>
            <SeriesGrid />
          </motion.div>
        </section>
      </Layout>
    </>
  );
};

export default Index;
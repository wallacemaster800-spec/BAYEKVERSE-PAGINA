import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import { useLore, Lore } from '@/hooks/useSeries';
import { BookOpen, ChevronRight } from 'lucide-react';

interface LoreViewerProps {
  seriesId: string;
  isActive?: boolean;
}

export function LoreViewer({ seriesId, isActive = true }: LoreViewerProps) {
  const { data: loreItems, isLoading, error } = useLore(isActive ? seriesId : '');
  const [selectedLore, setSelectedLore] = useState<Lore | null>(null);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error al cargar el lore</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg skeleton-shimmer" />
        ))}
      </div>
    );
  }

  if (!loreItems || loreItems.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No hay contenido de lore disponible</p>
      </div>
    );
  }

  // Sanitize markdown content
  const sanitizeContent = (content: string | null) => {
    if (!content) return '';
    return DOMPurify.sanitize(content);
  };

  return (
    <div className="grid md:grid-cols-[300px,1fr] gap-6">
      {/* Lore List */}
      <div className="space-y-2">
        {loreItems.map((lore) => (
          <button
            key={lore.id}
            onClick={() => setSelectedLore(lore)}
            className={`w-full text-left p-4 rounded-lg border transition-all duration-300 flex items-center justify-between group ${
              selectedLore?.id === lore.id
                ? 'bg-secondary border-primary'
                : 'bg-card border-border hover:border-muted-foreground/30'
            }`}
          >
            <span className="font-medium line-clamp-1">{lore.titulo}</span>
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                selectedLore?.id === lore.id ? 'rotate-90' : 'group-hover:translate-x-1'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Lore Content */}
      <div className="min-h-[400px] bg-card rounded-lg border border-border p-6">
        <AnimatePresence mode="wait">
          {selectedLore ? (
            <motion.article
              key={selectedLore.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="prose-lore"
            >
              <h2 className="text-2xl font-display font-bold mb-6">
                {selectedLore.titulo}
              </h2>
              <div className="text-muted-foreground leading-relaxed">
                <ReactMarkdown>
                  {sanitizeContent(selectedLore.contenido_md)}
                </ReactMarkdown>
              </div>
            </motion.article>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Selecciona un artículo del lore para leer
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
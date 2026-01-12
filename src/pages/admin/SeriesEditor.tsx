import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { extractYoutubeId, getYoutubeThumbnail } from "@/utils/youtube";
import {
  useCreateCapitulo,
  useUpdateCapitulo,
} from "@/hooks/useCapitulos";
import { useSeriesBySlug } from "@/hooks/useSeries";

interface ChapterFormData {
  titulo: string;
  youtube_url: string; // SOLO UI
  orden: number;
  temporada: number;
  miniatura_url: string;
}

export default function SeriesEditor() {
  const { slug } = useParams();
  const { data: series } = useSeriesBySlug(slug!);

  const createCapitulo = useCreateCapitulo();
  const updateCapitulo = useUpdateCapitulo();

  const [isChapterOpen, setIsChapterOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<any>(null);

  const [chapterForm, setChapterForm] = useState<ChapterFormData>({
    titulo: "",
    youtube_url: "",
    orden: 1,
    temporada: 1,
    miniatura_url: "",
  });

  if (!series) return null;

  const resetChapterForm = () => {
    setChapterForm({
      titulo: "",
      youtube_url: "",
      orden: 1,
      temporada: 1,
      miniatura_url: "",
    });
    setEditingChapter(null);
  };

  const handleSaveChapter = async () => {
    const youtubeId = extractYoutubeId(chapterForm.youtube_url);

    if (!chapterForm.titulo || !youtubeId) {
      toast({
        title: "Error",
        description: "URL de YouTube inválida",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      titulo: chapterForm.titulo,
      orden: chapterForm.orden,
      temporada: chapterForm.temporada,
      youtube_id: youtubeId,
      miniatura_url:
        chapterForm.miniatura_url ||
        getYoutubeThumbnail(youtubeId, "maxres"),
    };

    try {
      if (editingChapter) {
        await updateCapitulo.mutateAsync({
          id: editingChapter.id,
          ...payload,
        });
      } else {
        await createCapitulo.mutateAsync({
          series_id: series.id,
          ...payload,
        });
      }

      setIsChapterOpen(false);
      resetChapterForm();
      toast({ title: "Capítulo guardado" });
    } catch (error) {
      toast({
        title: "Error al guardar",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button onClick={() => setIsChapterOpen(true)}>
        Nuevo capítulo
      </Button>

      <Dialog open={isChapterOpen} onOpenChange={setIsChapterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingChapter ? "Editar capítulo" : "Nuevo capítulo"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                value={chapterForm.titulo}
                onChange={(e) =>
                  setChapterForm({
                    ...chapterForm,
                    titulo: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label>URL de YouTube</Label>
              <Input
                value={chapterForm.youtube_url}
                onChange={(e) =>
                  setChapterForm({
                    ...chapterForm,
                    youtube_url: e.target.value,
                  })
                }
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <div>
              <Label>Orden</Label>
              <Input
                type="number"
                value={chapterForm.orden}
                onChange={(e) =>
                  setChapterForm({
                    ...chapterForm,
                    orden: Number(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <Label>Temporada</Label>
              <Input
                type="number"
                value={chapterForm.temporada}
                onChange={(e) =>
                  setChapterForm({
                    ...chapterForm,
                    temporada: Number(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <Label>Miniatura (opcional)</Label>
              <Input
                value={chapterForm.miniatura_url}
                onChange={(e) =>
                  setChapterForm({
                    ...chapterForm,
                    miniatura_url: e.target.value,
                  })
                }
              />
            </div>

            <Button onClick={handleSaveChapter}>
              Guardar capítulo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

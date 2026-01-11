import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Video, ExternalLink } from 'lucide-react';
import { 
  useSeries,
  useCapitulos, 
  useCreateCapitulo, 
  useUpdateCapitulo, 
  useDeleteCapitulo,
  Capitulo 
} from '@/hooks/useSeries';
import { extractYoutubeId, getYoutubeThumbnail } from '@/lib/cloudinary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const capituloSchema = z.object({
  series_id: z.string().min(1, 'Selecciona una serie'),
  titulo: z.string().min(1, 'El título es requerido').max(200),
  youtube_url: z.string().min(1, 'El link de YouTube es requerido'),
  miniatura_url: z.string().optional(),
  orden: z.coerce.number().int().min(0, 'El orden debe ser mayor o igual a 0'),
  temporada: z.coerce.number().int().min(1, 'La temporada debe ser mayor o igual a 1').default(1),
});

type CapituloFormData = z.infer<typeof capituloSchema>;

export function CapitulosManager() {
  const { data: series, isLoading: seriesLoading } = useSeries();
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('');
  const { data: capitulosData, isLoading: capitulosLoading } = useCapitulos(selectedSeriesId, 0);
  
  const createCapitulo = useCreateCapitulo();
  const updateCapitulo = useUpdateCapitulo();
  const deleteCapitulo = useDeleteCapitulo();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCapitulo, setEditingCapitulo] = useState<Capitulo | null>(null);
  const [deleteData, setDeleteData] = useState<{ id: string; seriesId: string } | null>(null);
  const [extractedId, setExtractedId] = useState<string | null>(null);

  const form = useForm<CapituloFormData>({
    resolver: zodResolver(capituloSchema),
    defaultValues: {
      series_id: '',
      titulo: '',
      youtube_url: '',
      miniatura_url: '',
      orden: 0,
      temporada: 1,
    },
  });

  const handleYoutubeUrlChange = (url: string) => {
    const id = extractYoutubeId(url);
    setExtractedId(id);
  };

  const openCreate = () => {
    setEditingCapitulo(null);
    setExtractedId(null);
    form.reset({
      series_id: selectedSeriesId || '',
      titulo: '',
      youtube_url: '',
      miniatura_url: '',
      orden: (capitulosData?.data?.length || 0) + 1,
      temporada: 1,
    });
    setIsDialogOpen(true);
  };

  const openEdit = (c: Capitulo) => {
    setEditingCapitulo(c);
    setExtractedId(c.youtube_id);
    form.reset({
      series_id: c.series_id,
      titulo: c.titulo,
      youtube_url: c.youtube_id,
      miniatura_url: c.miniatura_url || '',
      orden: c.orden,
      temporada: c.temporada || 1,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: CapituloFormData) => {
    const youtubeId = extractYoutubeId(data.youtube_url);
    if (!youtubeId) {
      toast.error('URL de YouTube inválida');
      return;
    }

    try {
      const payload = {
        series_id: data.series_id,
        titulo: data.titulo,
        youtube_id: youtubeId,
        miniatura_url: data.miniatura_url || null,
        orden: data.orden,
        temporada: data.temporada || 1,
      };

      if (editingCapitulo) {
        await updateCapitulo.mutateAsync({
          id: editingCapitulo.id,
          ...payload,
        });
        toast.success('Capítulo actualizado correctamente');
      } else {
        await createCapitulo.mutateAsync(payload);
        toast.success('Capítulo creado correctamente');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Error al guardar el capítulo');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!deleteData) return;
    try {
      await deleteCapitulo.mutateAsync(deleteData);
      toast.success('Capítulo eliminado correctamente');
      setDeleteData(null);
    } catch (error) {
      toast.error('Error al eliminar el capítulo');
      console.error(error);
    }
  };

  if (seriesLoading) {
    return <div className="animate-pulse text-muted-foreground">Cargando series...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Series Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 w-full sm:max-w-xs">
          <Select value={selectedSeriesId} onValueChange={setSelectedSeriesId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una serie" />
            </SelectTrigger>
            <SelectContent>
              {series?.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate} className="gap-2" disabled={!selectedSeriesId}>
          <Plus className="w-4 h-4" />
          Nuevo Capítulo
        </Button>
      </div>

      {/* Chapters List */}
      {!selectedSeriesId ? (
        <div className="text-center py-12 text-muted-foreground">
          Selecciona una serie para ver sus capítulos
        </div>
      ) : capitulosLoading ? (
        <div className="animate-pulse text-muted-foreground">Cargando capítulos...</div>
      ) : (
        <div className="space-y-3">
          {capitulosData?.data?.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-center gap-4 p-4">
                {/* Thumbnail */}
                <div className="shrink-0 w-32 aspect-video overflow-hidden rounded bg-muted">
                  <img 
                    src={c.miniatura_url || getYoutubeThumbnail(c.youtube_id, 'mq')} 
                    alt={c.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground font-mono">
                      #{c.orden}
                    </span>
                    <h3 className="font-medium truncate">{c.titulo}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Video className="w-3 h-3" />
                    <code>{c.youtube_id}</code>
                    <a 
                      href={`https://www.youtube.com/watch?v=${c.youtube_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openEdit(c)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setDeleteData({ id: c.id, seriesId: c.series_id })}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {capitulosData?.data?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No hay capítulos en esta serie. Crea el primero.
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCapitulo ? 'Editar Capítulo' : 'Nuevo Capítulo'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="series_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serie</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona serie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {series?.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.titulo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título del Capítulo</FormLabel>
                    <FormControl>
                      <Input placeholder="Capítulo 1: El Origen" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="youtube_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de YouTube</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://www.youtube.com/watch?v=..." 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleYoutubeUrlChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    {extractedId && (
                      <FormDescription className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        ID extraído: <code className="bg-muted px-1 rounded">{extractedId}</code>
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="orden"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Orden</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="temporada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temporada</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="miniatura_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de Miniatura (Opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Dejar vacío para usar miniatura de YouTube" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={createCapitulo.isPending || updateCapitulo.isPending}
                >
                  {createCapitulo.isPending || updateCapitulo.isPending 
                    ? 'Guardando...' 
                    : 'Guardar'
                  }
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteData} onOpenChange={() => setDeleteData(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar capítulo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

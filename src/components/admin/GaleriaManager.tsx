import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { 
  useSeries,
  useGaleria, 
  useCreateGaleriaItem, 
  useDeleteGaleriaItem,
  GaleriaItem 
} from '@/hooks/useSeries';
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

const galeriaSchema = z.object({
  series_id: z.string().min(1, 'Selecciona una serie'),
  imagen_url: z.string().url('URL inválida').min(1, 'La URL de imagen es requerida'),
  titulo: z.string().max(200).optional(),
});

type GaleriaFormData = z.infer<typeof galeriaSchema>;

export function GaleriaManager() {
  const { data: series, isLoading: seriesLoading } = useSeries();
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('');
  const { data: galeriaData, isLoading: galeriaLoading } = useGaleria(selectedSeriesId, 0);
  
  const createGaleria = useCreateGaleriaItem();
  const deleteGaleria = useDeleteGaleriaItem();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<{ id: string; seriesId: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const form = useForm<GaleriaFormData>({
    resolver: zodResolver(galeriaSchema),
    defaultValues: {
      series_id: '',
      imagen_url: '',
      titulo: '',
    },
  });

  const openCreate = () => {
    setPreviewUrl('');
    form.reset({
      series_id: selectedSeriesId || '',
      imagen_url: '',
      titulo: '',
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: GaleriaFormData) => {
    try {
      await createGaleria.mutateAsync({
        series_id: data.series_id,
        imagen_url: data.imagen_url,
        titulo: data.titulo || null,
      });
      toast.success('Imagen añadida correctamente');
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Error al añadir la imagen');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!deleteData) return;
    try {
      await deleteGaleria.mutateAsync(deleteData);
      toast.success('Imagen eliminada correctamente');
      setDeleteData(null);
    } catch (error) {
      toast.error('Error al eliminar la imagen');
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
          Nueva Imagen
        </Button>
      </div>

      {/* Gallery Grid */}
      {!selectedSeriesId ? (
        <div className="text-center py-12 text-muted-foreground">
          Selecciona una serie para ver su galería
        </div>
      ) : galeriaLoading ? (
        <div className="animate-pulse text-muted-foreground">Cargando galería...</div>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {galeriaData?.data?.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="aspect-square overflow-hidden relative">
                <img 
                  src={item.imagen_url} 
                  alt={item.titulo || 'Imagen de galería'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => setDeleteData({ id: item.id, seriesId: item.series_id })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {item.titulo && (
                <CardContent className="p-2">
                  <p className="text-xs text-muted-foreground truncate">
                    {item.titulo}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}

          {galeriaData?.data?.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No hay imágenes en esta serie. Añade la primera.
            </div>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Imagen</DialogTitle>
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
                name="imagen_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de Imagen</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://res.cloudinary.com/... o https://images.unsplash.com/..." 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setPreviewUrl(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preview */}
              {previewUrl && (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={previewUrl} 
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                    onError={() => setPreviewUrl('')}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Descripción breve de la imagen" {...field} />
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
                  disabled={createGaleria.isPending}
                >
                  {createGaleria.isPending ? 'Guardando...' : 'Guardar'}
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
            <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
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

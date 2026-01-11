import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { 
  useSeries, 
  useCreateSeries, 
  useUpdateSeries, 
  useDeleteSeries,
  Series 
} from '@/hooks/useSeries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const seriesSchema = z.object({
  titulo: z.string().min(1, 'El título es requerido').max(100),
  descripcion: z.string().max(1000).optional(),
  slug: z.string().min(1, 'El slug es requerido').max(100).regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  portada_url: z.string().url('URL inválida').optional().or(z.literal('')),
  estado: z.enum(['En emisión', 'Finalizada']),
});

type SeriesFormData = z.infer<typeof seriesSchema>;

export function SeriesManager() {
  const { data: series, isLoading } = useSeries();
  const createSeries = useCreateSeries();
  const updateSeries = useUpdateSeries();
  const deleteSeries = useDeleteSeries();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<SeriesFormData>({
    resolver: zodResolver(seriesSchema),
    defaultValues: {
      titulo: '',
      descripcion: '',
      slug: '',
      portada_url: '',
      estado: 'En emisión',
    },
  });

  const openCreate = () => {
    setEditingSeries(null);
    form.reset({
      titulo: '',
      descripcion: '',
      slug: '',
      portada_url: '',
      estado: 'En emisión',
    });
    setIsDialogOpen(true);
  };

  const openEdit = (s: Series) => {
    setEditingSeries(s);
    form.reset({
      titulo: s.titulo,
      descripcion: s.descripcion || '',
      slug: s.slug,
      portada_url: s.portada_url || '',
      estado: s.estado,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: SeriesFormData) => {
    try {
      if (editingSeries) {
        await updateSeries.mutateAsync({
          id: editingSeries.id,
          titulo: data.titulo,
          slug: data.slug,
          estado: data.estado,
          portada_url: data.portada_url || null,
          descripcion: data.descripcion || null,
        });
        toast.success('Serie actualizada correctamente');
      } else {
        await createSeries.mutateAsync({
          titulo: data.titulo,
          slug: data.slug,
          estado: data.estado,
          portada_url: data.portada_url || null,
          descripcion: data.descripcion || null,
        });
        toast.success('Serie creada correctamente');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Error al guardar la serie');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSeries.mutateAsync(deleteId);
      toast.success('Serie eliminada correctamente');
      setDeleteId(null);
    } catch (error) {
      toast.error('Error al eliminar la serie');
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse text-muted-foreground">Cargando series...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Gestión de Series</h2>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Nueva Serie
        </Button>
      </div>

      {/* Series List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {series?.map((s) => (
          <Card key={s.id} className="overflow-hidden">
            {s.portada_url && (
              <div className="aspect-video overflow-hidden">
                <img 
                  src={s.portada_url} 
                  alt={s.titulo}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-1">{s.titulo}</CardTitle>
                <span className={`shrink-0 px-2 py-0.5 text-xs rounded-full ${
                  s.estado === 'En emisión' 
                    ? 'bg-destructive/20 text-destructive' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {s.estado}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {s.descripcion || 'Sin descripción'}
              </p>
              <code className="block text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                /{s.slug}
              </code>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => openEdit(s)}
                  className="flex-1 gap-1"
                >
                  <Pencil className="w-3 h-3" />
                  Editar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => setDeleteId(s.id)}
                  className="gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {series?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No hay series. Crea la primera.
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSeries ? 'Editar Serie' : 'Nueva Serie'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Punto Zero" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="punto-zero" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descripción de la serie..." 
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="portada_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de Portada (Cloudinary)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://res.cloudinary.com/..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="En emisión">En emisión</SelectItem>
                        <SelectItem value="Finalizada">Finalizada</SelectItem>
                      </SelectContent>
                    </Select>
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
                  disabled={createSeries.isPending || updateSeries.isPending}
                >
                  {createSeries.isPending || updateSeries.isPending 
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
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar serie?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los capítulos, 
              lore y galería asociados a esta serie.
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

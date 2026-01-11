import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import { Plus, Pencil, Trash2, BookOpen, Eye } from 'lucide-react';
import { 
  useSeries,
  useLore, 
  useCreateLore, 
  useUpdateLore, 
  useDeleteLore,
  Lore 
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
import { ScrollArea } from '@/components/ui/scroll-area';

const loreSchema = z.object({
  series_id: z.string().min(1, 'Selecciona una serie'),
  titulo: z.string().min(1, 'El título es requerido').max(200),
  contenido_md: z.string().max(50000).optional(),
  orden: z.coerce.number().int().min(0),
});

type LoreFormData = z.infer<typeof loreSchema>;

export function LoreManager() {
  const { data: series, isLoading: seriesLoading } = useSeries();
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('');
  const { data: loreData, isLoading: loreLoading } = useLore(selectedSeriesId);
  
  const createLore = useCreateLore();
  const updateLore = useUpdateLore();
  const deleteLore = useDeleteLore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLore, setEditingLore] = useState<Lore | null>(null);
  const [deleteData, setDeleteData] = useState<{ id: string; seriesId: string } | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');

  const form = useForm<LoreFormData>({
    resolver: zodResolver(loreSchema),
    defaultValues: {
      series_id: '',
      titulo: '',
      contenido_md: '',
      orden: 0,
    },
  });

  const watchContent = form.watch('contenido_md');

  const openCreate = () => {
    setEditingLore(null);
    setPreviewContent('');
    form.reset({
      series_id: selectedSeriesId || '',
      titulo: '',
      contenido_md: '',
      orden: (loreData?.length || 0) + 1,
    });
    setIsDialogOpen(true);
  };

  const openEdit = (l: Lore) => {
    setEditingLore(l);
    setPreviewContent(l.contenido_md || '');
    form.reset({
      series_id: l.series_id,
      titulo: l.titulo,
      contenido_md: l.contenido_md || '',
      orden: l.orden,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: LoreFormData) => {
    try {
      const payload = {
        series_id: data.series_id,
        titulo: data.titulo,
        contenido_md: data.contenido_md || null,
        orden: data.orden,
      };

      if (editingLore) {
        await updateLore.mutateAsync({
          id: editingLore.id,
          ...payload,
        });
        toast.success('Entrada de lore actualizada correctamente');
      } else {
        await createLore.mutateAsync(payload);
        toast.success('Entrada de lore creada correctamente');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Error al guardar el lore');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!deleteData) return;
    try {
      await deleteLore.mutateAsync(deleteData);
      toast.success('Entrada de lore eliminada correctamente');
      setDeleteData(null);
    } catch (error) {
      toast.error('Error al eliminar el lore');
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
          Nueva Entrada
        </Button>
      </div>

      {/* Lore List */}
      {!selectedSeriesId ? (
        <div className="text-center py-12 text-muted-foreground">
          Selecciona una serie para ver su lore
        </div>
      ) : loreLoading ? (
        <div className="animate-pulse text-muted-foreground">Cargando lore...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {loreData?.map((l) => (
            <Card key={l.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-mono">
                      #{l.orden}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(l)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteData({ id: l.id, seriesId: l.series_id })}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg">{l.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {l.contenido_md 
                    ? l.contenido_md.replace(/[#*`_~\[\]]/g, '').substring(0, 150) + '...'
                    : 'Sin contenido'
                  }
                </p>
              </CardContent>
            </Card>
          ))}

          {loreData?.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No hay entradas de lore en esta serie. Crea la primera.
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Dialog - Split View */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {editingLore ? 'Editar Lore' : 'Nueva Entrada de Lore'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full gap-4">
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="El Origen del Universo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Split Editor/Preview */}
              <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
                <FormField
                  control={form.control}
                  name="contenido_md"
                  render={({ field }) => (
                    <FormItem className="flex flex-col h-full">
                      <FormLabel>Contenido (Markdown)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="# Título&#10;&#10;Escribe aquí el lore en formato **Markdown**..." 
                          className="flex-1 resize-none font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">Vista Previa</span>
                  </div>
                  <ScrollArea className="flex-1 border rounded-md p-4 bg-muted/20">
                    <div className="prose-lore">
                      <ReactMarkdown>
                        {DOMPurify.sanitize(watchContent || '*Escribe algo para ver la vista previa...*')}
                      </ReactMarkdown>
                    </div>
                  </ScrollArea>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
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
                  disabled={createLore.isPending || updateLore.isPending}
                >
                  {createLore.isPending || updateLore.isPending 
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
            <AlertDialogTitle>¿Eliminar entrada de lore?</AlertDialogTitle>
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

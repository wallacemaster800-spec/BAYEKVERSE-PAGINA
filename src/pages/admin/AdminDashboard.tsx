import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Eye, Loader2, Lock, Unlock } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useSeries, useCreateSeries, useDeleteSeries, Series } from '@/hooks/useSeries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { data: series, isLoading: seriesLoading } = useSeries();
  const createSeries = useCreateSeries();
  const deleteSeries = useDeleteSeries();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // 🔥 ESTADO INICIAL CORREGIDO (Incluye es_pago)
  const [formData, setFormData] = useState({
    titulo: '',
    slug: '',
    descripcion: '',
    portada_url: '',
    estado: 'En emisión' as 'En emisión' | 'Finalizada',
    es_pago: false,
  });

  // Redirect if not admin
  if (!authLoading && (!user || !isAdmin)) {
    navigate('/');
    return null;
  }

  if (authLoading || seriesLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleCreate = async () => {
    if (!formData.titulo || !formData.slug) {
      toast({
        title: 'Error',
        description: 'Título y slug son obligatorios',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createSeries.mutateAsync(formData);
      toast({ title: 'Serie creada con éxito' });
      setIsCreateOpen(false);
      // 🔥 RESET FORM CORREGIDO
      setFormData({
        titulo: '',
        slug: '',
        descripcion: '',
        portada_url: '',
        estado: 'En emisión',
        es_pago: false,
      });
    } catch (error) {
      toast({
        title: 'Error al crear serie',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteSeries.mutateAsync(deleteId);
      toast({ title: 'Serie eliminada' });
      setDeleteId(null);
    } catch (error) {
      toast({
        title: 'Error al eliminar',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Bayekverse</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Layout>
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-display font-bold">Panel de Administración</h1>
                <p className="text-muted-foreground mt-1">Gestiona tu contenido de Bayekverse</p>
              </div>
              <Button onClick={() => setIsCreateOpen(true)} className="w-fit">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Serie
              </Button>
            </div>

            {/* Series Table */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Portada</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Acceso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {series && series.length > 0 ? (
                    series.map((s: Series) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          {s.portada_url ? (
                            <img
                              src={s.portada_url}
                              alt={s.titulo}
                              className="w-12 h-16 object-cover rounded shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-16 bg-muted rounded flex items-center justify-center text-muted-foreground text-[10px] text-center p-1">
                              Sin imagen
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                           <div className="font-medium">{s.titulo}</div>
                           <div className="text-xs text-muted-foreground">{s.slug}</div>
                        </TableCell>
                        <TableCell>
                          {/* 🔥 BADGE DE ACCESO CORREGIDO */}
                          {s.es_pago ? (
                            <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-500/5 gap-1">
                              <Lock className="w-3 h-3" /> Premium
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-500/5 gap-1">
                              <Unlock className="w-3 h-3" /> Gratis
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={s.estado === 'En emisión' ? 'default' : 'secondary'}>
                            {s.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(`/series/${s.slug}`, '_blank')}
                              title="Ver serie"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/series/${s.slug}`)}
                              title="Editar serie"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(s.id)}
                              title="Eliminar serie"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        No hay series. Crea tu primera serie para comenzar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </div>
      </Layout>

      {/* Create Series Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear Nueva Serie</DialogTitle>
            <DialogDescription>
              Ingresa los datos de la nueva serie. Podrás agregar capítulos después.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      titulo: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  placeholder="Ej: Punto Zero"
                />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="punto-zero"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="De qué trata esta obra..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portada">URL de Portada</Label>
              <Input
                id="portada"
                value={formData.portada_url}
                onChange={(e) => setFormData({ ...formData, portada_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value: 'En emisión' | 'Finalizada') =>
                    setFormData({ ...formData, estado: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="En emisión">En emisión</SelectItem>
                    <SelectItem value="Finalizada">Finalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 🔥 CAMPO ES_PAGO INTEGRADO */}
              <div className="flex items-center space-x-2 pt-8">
                <input
                  id="es_pago"
                  type="checkbox"
                  className="w-4 h-4 accent-primary cursor-pointer"
                  checked={formData.es_pago}
                  onChange={(e) => setFormData({ ...formData, es_pago: e.target.checked })}
                />
                <Label htmlFor="es_pago" className="text-sm font-bold cursor-pointer">
                  ¿Es Serie Premium?
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createSeries.isPending}>
              {createSeries.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Crear Serie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta serie?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán también todos los capítulos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
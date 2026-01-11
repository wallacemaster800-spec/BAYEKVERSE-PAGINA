import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  Youtube, 
  GripVertical,
  Image as ImageIcon,
  Upload 
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { 
  useSeriesBySlug, 
  useUpdateSeries,
  useCapitulos, 
  useCreateCapitulo, 
  useUpdateCapitulo, 
  useDeleteCapitulo,
  useLore,
  useCreateLore,
  useUpdateLore,
  useDeleteLore,
  useGaleria,
  useCreateGaleriaItem,
  useDeleteGaleriaItem,
  Capitulo,
  Lore
} from '@/hooks/useSeries';
import { extractYoutubeId, getYoutubeThumbnail } from '@/lib/cloudinary';
import { uploadToCloudinary } from '@/utils/fileUpload';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Interfaces
interface ChapterFormData {
  titulo: string;
  youtube_url: string;
  orden: number;
  temporada: number;
  miniatura_url: string;
}

interface LoreFormData {
  titulo: string;
  contenido_md: string;
  orden: number;
}

export default function SeriesEditor() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Sincronización con URL para mantener la pestaña activa al actualizar
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'general';

  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // --- DATA FETCHING ---
  const { data: series, isLoading: seriesLoading } = useSeriesBySlug(slug || '');
  const seriesId = series?.id || '';
  
  const { data: capitulosData, isLoading: capitulosLoading } = useCapitulos(seriesId);
  const { data: loreData, isLoading: loreLoading } = useLore(seriesId);
  const { data: galeriaData, isLoading: galeriaLoading } = useGaleria(seriesId);

  // --- MUTATIONS ---
  const updateSeries = useUpdateSeries();
  const createCapitulo = useCreateCapitulo();
  const updateCapitulo = useUpdateCapitulo();
  const deleteCapitulo = useDeleteCapitulo();
  const createLore = useCreateLore();
  const updateLore = useUpdateLore();
  const deleteLore = useDeleteLore();
  const createGaleriaItem = useCreateGaleriaItem();
  const deleteGaleriaItem = useDeleteGaleriaItem();

  // --- STATES ---
  const [seriesForm, setSeriesForm] = useState({
    titulo: '',
    slug: '',
    descripcion: '',
    portada_url: '',
    estado: 'En emisión' as 'En emisión' | 'Finalizada',
  });

  // Estado Capítulos
  const [isChapterOpen, setIsChapterOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Capitulo | null>(null);
  const [deleteChapterId, setDeleteChapterId] = useState<string | null>(null);
  const [chapterForm, setChapterForm] = useState<ChapterFormData>({
    titulo: '',
    youtube_url: '',
    orden: 1,
    temporada: 1,
    miniatura_url: '',
  });

  // Estado Lore
  const [isLoreOpen, setIsLoreOpen] = useState(false);
  const [editingLore, setEditingLore] = useState<Lore | null>(null);
  const [deleteLoreId, setDeleteLoreId] = useState<string | null>(null);
  const [loreForm, setLoreForm] = useState<LoreFormData>({ titulo: '', contenido_md: '', orden: 1 });
  const [isUploadingLoreImage, setIsUploadingLoreImage] = useState(false);
  
  // Referencia al textarea para saber dónde está el cursor
  const loreTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Estado Galería
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [deleteGalleryId, setDeleteGalleryId] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // --- EFFECTS ---
  useEffect(() => {
    if (series) {
      setSeriesForm({
        titulo: series.titulo,
        slug: series.slug,
        descripcion: series.descripcion || '',
        portada_url: series.portada_url || '',
        estado: series.estado,
      });
    }
  }, [series]);

  // --- AUTH PROTECTION ---
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [authLoading, user, isAdmin, navigate]);

  if (authLoading || seriesLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!series) return null;

  // --- HANDLERS ---
  
  // 1. Guardar Serie
  const handleSaveSeries = async () => {
    try { await updateSeries.mutateAsync({ id: series.id, ...seriesForm }); toast({ title: 'Serie actualizada' }); } 
    catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };

  // 2. Lógica de Capítulos
  const capitulos = capitulosData?.data || [];
  const capitulosPorTemporada = capitulos.reduce((acc, cap) => {
    const temp = cap.temporada || 1;
    if (!acc[temp]) acc[temp] = [];
    acc[temp].push(cap);
    return acc;
  }, {} as Record<number, Capitulo[]>);

  const openCreateChapter = () => {
    const nextOrder = capitulos.length > 0 ? Math.max(...capitulos.map(c => c.orden)) + 1 : 1;
    setChapterForm({ titulo: '', youtube_url: '', orden: nextOrder, temporada: 1, miniatura_url: '' });
    setEditingChapter(null);
    setIsChapterOpen(true);
  };
  const openEditChapter = (chapter: Capitulo) => {
    setChapterForm({
      titulo: chapter.titulo,
      youtube_url: `https://youtube.com/watch?v=${chapter.youtube_id}`,
      orden: chapter.orden,
      temporada: chapter.temporada || 1,
      miniatura_url: chapter.miniatura_url || '',
    });
    setEditingChapter(chapter);
    setIsChapterOpen(true);
  };
  const handleSaveChapter = async () => {
    const youtubeId = extractYoutubeId(chapterForm.youtube_url);
    if (!chapterForm.titulo || !youtubeId) return toast({ title: 'Error: URL inválida', variant: 'destructive' });
    const miniatura = chapterForm.miniatura_url || getYoutubeThumbnail(youtubeId, 'maxres');
    try {
      if (editingChapter) await updateCapitulo.mutateAsync({ id: editingChapter.id, ...chapterForm, youtube_id: youtubeId, miniatura_url: miniatura });
      else await createCapitulo.mutateAsync({ series_id: series.id, ...chapterForm, youtube_id: youtubeId, miniatura_url: miniatura });
      setIsChapterOpen(false); toast({ title: 'Guardado' });
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };
  const handleDeleteChapter = async () => {
    if (!deleteChapterId) return;
    await deleteCapitulo.mutateAsync({ id: deleteChapterId, seriesId: series.id });
    setDeleteChapterId(null);
  };

  // 3. Lógica Lore (CON CORRECCIÓN DE POSICIÓN DE CURSOR)
  const loreItems = loreData || [];
  
  const handleLoreImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploadingLoreImage(true);
    
    try {
      const file = e.target.files[0];
      const url = await uploadToCloudinary(file);
      
      const textarea = loreTextareaRef.current;
      
      if (textarea) {
        // Obtenemos la posición exacta del cursor
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        // Texto actual
        const currentText = loreForm.contenido_md;
        
        // Construimos el nuevo texto: (Lo de antes) + (Imagen Markdown) + (Lo de después)
        // Agregamos saltos de línea (\n) para que no quede pegado
        const imageMarkdown = `\n![Imagen](${url})\n`;
        const newText = currentText.substring(0, start) + imageMarkdown + currentText.substring(end);
        
        setLoreForm({ ...loreForm, contenido_md: newText });
      } else {
        // Fallback por si no encuentra el textarea (raro, pero posible)
        setLoreForm({ ...loreForm, contenido_md: loreForm.contenido_md + `\n![Imagen](${url})\n` });
      }
      
      toast({ title: 'Imagen insertada en el texto' });
    } catch { 
      toast({ title: 'Error al subir', variant: 'destructive' }); 
    } finally {
      setIsUploadingLoreImage(false);
      // Limpiar input para permitir subir la misma foto de nuevo si se quiere
      if (e.target) e.target.value = '';
    }
  };

  const handleSaveLore = async () => {
    if (!loreForm.titulo) return toast({ title: 'Falta título', variant: 'destructive' });
    if (editingLore) await updateLore.mutateAsync({ id: editingLore.id, ...loreForm });
    else await createLore.mutateAsync({ series_id: series.id, ...loreForm });
    setIsLoreOpen(false); toast({ title: 'Guardado' });
  };
  const handleDeleteLore = async () => {
    if (!deleteLoreId) return;
    await deleteLore.mutateAsync({ id: deleteLoreId, seriesId: series.id });
    setDeleteLoreId(null);
  };

  // 4. Lógica Galería
  const galeriaItems = galeriaData?.data || [];
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploadingGallery(true);
    try {
      for (const file of Array.from(e.target.files)) {
        const url = await uploadToCloudinary(file);
        await createGaleriaItem.mutateAsync({ series_id: series.id, imagen_url: url, titulo: file.name.split('.')[0] });
      }
      toast({ title: 'Imágenes subidas' });
    } catch { toast({ title: 'Error al subir', variant: 'destructive' }); }
    setIsUploadingGallery(false);
  };
  const handleDeleteGallery = async () => {
    if (!deleteGalleryId) return;
    await deleteGaleriaItem.mutateAsync({ id: deleteGalleryId, seriesId: series.id });
    setDeleteGalleryId(null);
  };

  const previewYoutubeId = extractYoutubeId(chapterForm.youtube_url);

  return (
    <>
      <Helmet>
        <title>Editar: {series.titulo} | Bayekverse Admin</title>
      </Helmet>

      <Layout>
        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={() => navigate('/admin')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Dashboard
              </Button>
              <h1 className="text-2xl font-bold font-display text-primary">{series.titulo}</h1>
            </div>

            {/* TABS (Persistencia en URL) */}
            <Tabs 
              value={currentTab} 
              onValueChange={(val) => setSearchParams({ tab: val })} 
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="chapters">Capítulos</TabsTrigger>
                <TabsTrigger value="lore">Lore</TabsTrigger>
                <TabsTrigger value="gallery">Galería</TabsTrigger>
              </TabsList>

              {/* TAB GENERAL */}
              <TabsContent value="general">
                <Card>
                  <CardHeader><CardTitle>Detalles</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Título</Label><Input value={seriesForm.titulo} onChange={e => setSeriesForm({...seriesForm, titulo: e.target.value})} /></div>
                      <div className="space-y-2"><Label>Slug</Label><Input value={seriesForm.slug} onChange={e => setSeriesForm({...seriesForm, slug: e.target.value})} /></div>
                    </div>
                    <div className="space-y-2"><Label>Descripción</Label><Textarea value={seriesForm.descripcion} onChange={e => setSeriesForm({...seriesForm, descripcion: e.target.value})} /></div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Portada URL</Label><Input value={seriesForm.portada_url} onChange={e => setSeriesForm({...seriesForm, portada_url: e.target.value})} /></div>
                      <div className="space-y-2"><Label>Estado</Label>
                        <Select value={seriesForm.estado} onValueChange={(val: any) => setSeriesForm({...seriesForm, estado: val})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="En emisión">En emisión</SelectItem><SelectItem value="Finalizada">Finalizada</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end pt-4"><Button onClick={handleSaveSeries} disabled={updateSeries.isPending}><Save className="w-4 h-4 mr-2" /> Guardar</Button></div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB CAPÍTULOS */}
              <TabsContent value="chapters">
                <div className="flex justify-between mb-6">
                   <h2 className="text-2xl font-bold">Capítulos</h2>
                   <Button onClick={openCreateChapter}><Plus className="w-4 h-4 mr-2" /> Agregar</Button>
                </div>
                {Object.keys(capitulosPorTemporada).length > 0 ? (
                  Object.entries(capitulosPorTemporada).map(([temp, caps]) => (
                    <div key={temp} className="mb-8">
                      <h3 className="text-lg font-semibold mb-3">Temporada {temp}</h3>
                      <div className="space-y-2">
                        {caps.map(cap => (
                           <Card key={cap.id} className="p-4 flex items-center gap-4 hover:bg-muted/10">
                             <span className="font-mono w-8 text-center">{cap.orden}</span>
                             <img src={cap.miniatura_url || getYoutubeThumbnail(cap.youtube_id)} className="w-24 h-14 object-cover rounded bg-black" alt="" />
                             <div className="flex-1 font-medium">{cap.titulo}</div>
                             <div className="flex gap-2">
                               <Button size="icon" variant="ghost" onClick={() => openEditChapter(cap)}><Pencil className="w-4 h-4" /></Button>
                               <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteChapterId(cap.id)}><Trash2 className="w-4 h-4" /></Button>
                             </div>
                           </Card>
                        ))}
                      </div>
                    </div>
                  ))
                ) : <div className="text-center py-12 text-muted-foreground">No hay capítulos.</div>}
              </TabsContent>

              {/* TAB LORE */}
              <TabsContent value="lore">
                 <div className="flex justify-between mb-6">
                   <h2 className="text-2xl font-bold">Lore</h2>
                   <Button onClick={() => { setLoreForm({titulo: '', contenido_md: '', orden: loreItems.length + 1}); setEditingLore(null); setIsLoreOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Nuevo</Button>
                 </div>
                 <div className="grid md:grid-cols-3 gap-4">
                    {loreItems.map(item => (
                      <Card key={item.id} className="relative group hover:border-primary transition-colors">
                        <CardHeader><CardTitle className="text-lg">{item.titulo}</CardTitle></CardHeader>
                        <CardContent><p className="line-clamp-3 text-sm text-muted-foreground">{item.contenido_md}</p></CardContent>
                        <div className="absolute top-2 right-2 hidden group-hover:flex bg-background/80 rounded">
                           <Button size="icon" variant="ghost" onClick={() => { setLoreForm({titulo: item.titulo, contenido_md: item.contenido_md || '', orden: item.orden}); setEditingLore(item); setIsLoreOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                           <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteLoreId(item.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </Card>
                    ))}
                 </div>
              </TabsContent>

              {/* TAB GALERÍA */}
              <TabsContent value="gallery">
                <div className="flex justify-between mb-6">
                   <h2 className="text-2xl font-bold">Galería</h2>
                   <div className="relative">
                     <input type="file" multiple accept="image/*" className="hidden" ref={galleryInputRef} onChange={handleGalleryUpload} />
                     <Button onClick={() => galleryInputRef.current?.click()} disabled={isUploadingGallery}>
                       {isUploadingGallery ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />} Subir
                     </Button>
                   </div>
                 </div>
                 <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                    {galeriaItems.map(item => (
                      <div key={item.id} className="group relative aspect-square bg-muted rounded overflow-hidden">
                        <img src={item.imagen_url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                           <Button size="icon" variant="destructive" onClick={() => setDeleteGalleryId(item.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                 </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </Layout>

      {/* DIALOGS */}
      
      {/* Chapter Dialog */}
      <Dialog open={isChapterOpen} onOpenChange={setIsChapterOpen}>
        <DialogContent>
           <DialogHeader><DialogTitle>{editingChapter ? 'Editar' : 'Crear'} Capítulo</DialogTitle></DialogHeader>
           <div className="space-y-4">
             <div className="space-y-2"><Label>Título</Label><Input value={chapterForm.titulo} onChange={e => setChapterForm({...chapterForm, titulo: e.target.value})} /></div>
             <div className="space-y-2"><Label>YouTube URL</Label><Input value={chapterForm.youtube_url} onChange={e => setChapterForm({...chapterForm, youtube_url: e.target.value})} /></div>
             {previewYoutubeId && <div className="text-xs text-green-500">ID Válido: {previewYoutubeId}</div>}
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2"><Label>Orden</Label><Input type="number" value={chapterForm.orden} onChange={e => setChapterForm({...chapterForm, orden: +e.target.value})} /></div>
               <div className="space-y-2"><Label>Temporada</Label><Input type="number" value={chapterForm.temporada} onChange={e => setChapterForm({...chapterForm, temporada: +e.target.value})} /></div>
             </div>
           </div>
           <DialogFooter><Button onClick={handleSaveChapter}>Guardar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lore Dialog */}
      <Dialog open={isLoreOpen} onOpenChange={setIsLoreOpen}>
         <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
            <DialogHeader><DialogTitle>Editor Lore</DialogTitle></DialogHeader>
            <div className="flex-1 flex flex-col gap-4 py-4">
               <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3"><Input placeholder="Título del artículo" value={loreForm.titulo} onChange={e => setLoreForm({...loreForm, titulo: e.target.value})} /></div>
                  <Input type="number" placeholder="Orden" value={loreForm.orden} onChange={e => setLoreForm({...loreForm, orden: +e.target.value})} />
               </div>
               
               <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm font-medium">Contenido</span>
                  <div className="relative">
                    <input type="file" id="lore-img" className="hidden" accept="image/*" onChange={handleLoreImageUpload} />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('lore-img')?.click()} disabled={isUploadingLoreImage}>
                      {isUploadingLoreImage ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />} Insertar Imagen
                    </Button>
                  </div>
               </div>
               
               {/* TEXTAREA CON REFERENCIA PARA CURSOR */}
               <Textarea 
                 ref={loreTextareaRef} 
                 className="flex-1 font-mono text-sm leading-relaxed p-4 resize-none" 
                 value={loreForm.contenido_md} 
                 onChange={e => setLoreForm({...loreForm, contenido_md: e.target.value})} 
                 placeholder="Escribe aquí tu historia... Usa Markdown." 
               />
            </div>
            <DialogFooter><Button onClick={handleSaveLore}>Guardar</Button></DialogFooter>
         </DialogContent>
      </Dialog>
      
      {/* Alertas */}
      <AlertDialog open={!!deleteChapterId} onOpenChange={() => setDeleteChapterId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Borrar?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>No</AlertDialogCancel><AlertDialogAction className="bg-destructive" onClick={handleDeleteChapter}>Sí</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!deleteLoreId} onOpenChange={() => setDeleteLoreId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Borrar?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>No</AlertDialogCancel><AlertDialogAction className="bg-destructive" onClick={handleDeleteLore}>Sí</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!deleteGalleryId} onOpenChange={() => setDeleteGalleryId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Borrar?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>No</AlertDialogCancel><AlertDialogAction className="bg-destructive" onClick={handleDeleteGallery}>Sí</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </>
  );
}
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "@/hooks/use-toast" // Asegúrate que esta ruta sea la correcta en tu proyecto
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save, Globe, Lock, Loader2, Image as ImageIcon, Video } from "lucide-react"

// 🔥 IMAGEN GENÉRICA (Placeholder elegante oscuro)
const DEFAULT_THUMBNAIL = "https://placehold.co/600x400/1a1a1a/ffffff?text=Sin+Imagen&font=montserrat"

interface Chapter {
  id: string
  titulo: string
  video_url: string // Quitamos el opcional ? porque lo exigimos en el form
  orden: number
  temporada: number
  miniatura_url?: string | null
  es_pago?: boolean
}

export default function SeriesEditor() {
  const { slug } = useParams()
  const navigate = useNavigate()
  
  const [serieId, setSerieId] = useState<string | null>(null)
  const [serieEsPago, setSerieEsPago] = useState(false)
  const [seriePortada, setSeriePortada] = useState("")
  const [chapters, setChapters] = useState<Chapter[]>([])
  
  // Estados de carga
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingSeries, setIsSavingSeries] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Formulario del capítulo
  const [chapterForm, setChapterForm] = useState({
    titulo: "",
    video_url: "",
    orden: 1,
    temporada: 1,
    miniatura_url: "",
    es_pago: false
  })

  const [editingChapterId, setEditingChapterId] = useState<string | null>(null)

  // 1. CARGAR DATOS
  useEffect(() => {
    const fetchSerieAndChapters = async () => {
      if (!slug) return
      
      // Cargar Serie
      const { data: serie, error: sError } = await supabase
        .from('series')
        .select('id, es_pago, portada_url')
        .eq('slug', slug)
        .single()

      if (sError) {
        toast({ title: "Error al cargar serie", variant: "destructive" })
        setIsLoading(false)
        return
      }

      if (serie) {
        setSerieId(serie.id)
        setSerieEsPago(serie.es_pago ?? false)
        setSeriePortada(serie.portada_url ?? "")

        // Cargar Capítulos
        const { data: caps } = await supabase
          .from('capitulos')
          .select('*')
          .eq('series_id', serie.id)
          .order('orden', { ascending: true })
        
        // Mapeamos para asegurar compatibilidad de tipos
        if (caps) {
           const mappedCaps: Chapter[] = caps.map(c => ({
             id: c.id,
             titulo: c.titulo,
             video_url: c.video_url || c.youtube_id || "", // Fallback para compatibilidad
             orden: c.orden,
             temporada: c.temporada,
             miniatura_url: c.miniatura_url,
             es_pago: c.es_pago
           }))
           setChapters(mappedCaps)
           // Autocalcular siguiente orden
           setChapterForm(prev => ({ ...prev, orden: mappedCaps.length + 1 }))
        }
      }
      setIsLoading(false)
    }

    fetchSerieAndChapters()
  }, [slug])

  // 2. ACTUALIZAR INFO GENERAL DE LA SERIE
  const handleUpdateSeriesMetadata = async () => {
    if (!serieId) return
    setIsSavingSeries(true)
    
    const { error } = await supabase
      .from('series')
      .update({ 
        portada_url: seriePortada,
        es_pago: serieEsPago 
      })
      .eq('id', serieId)

    if (error) {
      toast({ title: "Error al actualizar serie", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Datos de la serie actualizados" })
    }
    setIsSavingSeries(false)
  }

  // 3. GUARDAR CAPÍTULO (CREAR O EDITAR)
  const handleSaveChapter = async () => {
    if (!chapterForm.titulo || !chapterForm.video_url || !serieId) {
      toast({ title: "Falta título, URL del video o ID de serie", variant: "destructive" })
      return
    }

    setIsSaving(true)

    // Objeto a guardar (limpiamos miniatura vacía a null si se prefiere, o dejamos string vacío)
    const payload = {
      titulo: chapterForm.titulo,
      video_url: chapterForm.video_url, // Ahora usamos video_url genérico para todo
      youtube_id: chapterForm.video_url, // Guardamos copia en youtube_id por compatibilidad si tu DB lo pide
      orden: chapterForm.orden,
      temporada: chapterForm.temporada,
      miniatura_url: chapterForm.miniatura_url || null, // Si está vacío, mandamos null
      es_pago: chapterForm.es_pago
    }

    if (editingChapterId) {
      // -- MODO EDICIÓN --
      const { error } = await supabase
        .from('capitulos')
        .update(payload)
        .eq('id', editingChapterId)

      if (error) {
        toast({ title: "Error al actualizar", description: error.message, variant: "destructive" })
      } else {
        setChapters(prev => prev.map(c => c.id === editingChapterId ? { ...c, id: c.id, ...payload } : c))
        toast({ title: "Capítulo actualizado" })
        resetForm()
      }
    } else {
      // -- MODO CREACIÓN --
      const { data, error } = await supabase
        .from('capitulos')
        .insert([{
          series_id: serieId,
          ...payload
        }])
        .select()

      if (error) {
        toast({ title: "Error al insertar", description: error.message, variant: "destructive" })
      } else if (data) {
        // Adaptamos el tipo de retorno
        const newCap: Chapter = {
            id: data[0].id,
            titulo: data[0].titulo,
            video_url: data[0].video_url || data[0].youtube_id,
            orden: data[0].orden,
            temporada: data[0].temporada,
            miniatura_url: data[0].miniatura_url,
            es_pago: data[0].es_pago
        }
        setChapters(prev => [...prev, newCap])
        toast({ title: "Capítulo guardado exitosamente" })
        resetForm()
      }
    }
    setIsSaving(false)
  }

  const resetForm = () => {
    setEditingChapterId(null)
    setChapterForm({
      titulo: "",
      video_url: "",
      orden: chapters.length + 1, // Autoincrementar
      temporada: 1,
      miniatura_url: "",
      es_pago: false
    })
  }

  const deleteChapter = async (id: string) => {
    if (!window.confirm("¿Seguro que quieres borrar este capítulo?")) return

    const { error } = await supabase.from('capitulos').delete().eq('id', id)
    if (!error) {
      setChapters(prev => prev.filter(c => c.id !== id))
      toast({ title: "Capítulo eliminado" })
    } else {
        toast({ title: "Error al borrar", variant: "destructive" })
    }
  }

  const openEditChapter = (chapter: Chapter) => {
    setEditingChapterId(chapter.id)
    setChapterForm({
      titulo: chapter.titulo,
      video_url: chapter.video_url || "",
      orden: chapter.orden,
      temporada: chapter.temporada,
      miniatura_url: chapter.miniatura_url || "",
      es_pago: chapter.es_pago ?? false
    })
    document.getElementById('chapter-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (isLoading) return <div className="p-20 text-center flex justify-center"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 pb-32 space-y-10">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <button onClick={() => navigate('/admin')} className="flex items-center text-sm text-muted-foreground hover:text-primary transition mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver al panel
          </button>
          <h1 className="text-3xl font-bold font-display uppercase tracking-tighter italic">Editor de Contenido</h1>
        </div>
      </div>

      {/* SECCIÓN 1: PORTADA Y CONFIG DE SERIE */}
      <section className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
          <ImageIcon className="w-5 h-5" /> Identidad Visual y Acceso
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="portada">URL de la Portada Principal (Serie)</Label>
              <Input 
                id="portada"
                placeholder="https://..."
                value={seriePortada}
                onChange={(e) => setSeriePortada(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground italic">Esta es la imagen del catálogo general.</p>
            </div>

            <div className="flex items-center space-x-3 bg-muted/30 p-4 rounded-lg border border-dashed">
              <input 
                type="checkbox"
                id="serie_pago"
                className="w-5 h-5 accent-primary cursor-pointer"
                checked={serieEsPago}
                onChange={(e) => setSerieEsPago(e.target.checked)}
              />
              <Label htmlFor="serie_pago" className="text-base font-semibold cursor-pointer italic">¿Esta obra es de Pago (Premium)?</Label>
            </div>
            
            <button 
              onClick={handleUpdateSeriesMetadata}
              disabled={isSavingSeries}
              className="w-full md:w-auto bg-secondary text-secondary-foreground px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-widest hover:opacity-80 transition flex items-center gap-2 justify-center"
            >
              {isSavingSeries && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSavingSeries ? "Actualizando..." : "Actualizar Datos de Serie"}
            </button>
          </div>

          <div className="flex flex-col items-center justify-center border rounded-xl bg-muted/10 p-4">
            <Label className="mb-2 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Previsualización Portada</Label>
            {seriePortada ? (
              <img 
                src={seriePortada} 
                onError={(e) => e.currentTarget.src = DEFAULT_THUMBNAIL} // Fallback si falla
                alt="Portada" 
                className="w-32 h-48 object-cover rounded shadow-2xl border-2 border-primary/20" 
              />
            ) : (
              <div className="w-32 h-48 bg-muted rounded flex items-center justify-center text-xs italic text-muted-foreground text-center p-2 border border-dashed">Sin Portada</div>
            )}
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: LISTADO DE CAPÍTULOS */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold uppercase italic tracking-tighter">Episodios Actuales ({chapters.length})</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {chapters.map(cap => (
            <div key={cap.id} className="bg-card border rounded-xl p-4 flex gap-4 shadow-sm group hover:border-primary/50 transition">
              <div className="relative w-32 h-20 flex-shrink-0">
                {/* 🔥 LÓGICA DE MINIATURA INTELIGENTE */}
                <img 
                    src={cap.miniatura_url || DEFAULT_THUMBNAIL} 
                    onError={(e) => e.currentTarget.src = DEFAULT_THUMBNAIL} // Si falla, pone la default
                    className="w-full h-full object-cover rounded-lg bg-black/20 shadow-inner" 
                    alt="Miniatura" 
                />
                
                {/* Candado si es de pago */}
                {cap.es_pago && (
                  <div className="absolute top-1 right-1 bg-amber-500 text-white p-1 rounded-sm shadow-sm">
                    <Lock className="w-3 h-3" />
                  </div>
                )}
                
                {/* Indicador de número */}
                <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 rounded font-mono backdrop-blur-sm">
                    EP.{cap.orden}
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                    <div className="font-bold truncate text-sm uppercase italic text-primary">{cap.titulo}</div>
                    <div className="text-[10px] text-muted-foreground font-mono mt-1">
                        TEMP {cap.temporada} // {cap.es_pago ? "PREMIUM" : "GRATIS"}
                    </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <button onClick={() => openEditChapter(cap)} className="text-[10px] font-bold text-foreground hover:text-primary hover:underline uppercase flex items-center gap-1">
                    ✏️ Editar
                  </button>
                  <button onClick={() => deleteChapter(cap.id)} className="text-[10px] font-bold text-destructive hover:underline uppercase flex items-center gap-1">
                    🗑️ Borrar
                  </button>
                </div>
              </div>
            </div>
          ))}
          {chapters.length === 0 && (
            <div className="col-span-2 py-10 text-center text-muted-foreground italic border-2 border-dashed rounded-xl">
                No hay episodios cargados todavía. ¡Agrega el primero abajo!
            </div>
          )}
        </div>
      </section>

      {/* SECCIÓN 3: FORMULARIO */}
      <section id="chapter-form" className="bg-card border rounded-xl p-6 space-y-6 shadow-lg border-t-4 border-t-primary">
        <h3 className="text-lg font-bold uppercase italic flex items-center gap-2">
            {editingChapterId ? <><Save className="w-5 h-5"/> Modificar Episodio</> : <><Video className="w-5 h-5"/> Añadir Nuevo Episodio</>}
        </h3>
        
        <div className="grid md:grid-cols-12 gap-4">
          {/* Título */}
          <div className="md:col-span-8 space-y-2">
            <Label>Título del Episodio</Label>
            <Input 
                placeholder="Ej: La Caída del Muro" 
                value={chapterForm.titulo} 
                onChange={e => setChapterForm({...chapterForm, titulo: e.target.value})} 
            />
          </div>

          {/* Temporada */}
          <div className="md:col-span-2 space-y-2">
            <Label>Temporada</Label>
            <Input 
                type="number" 
                value={chapterForm.temporada} 
                onChange={e => setChapterForm({...chapterForm, temporada: Number(e.target.value)})} 
            />
          </div>

          {/* Orden */}
          <div className="md:col-span-2 space-y-2">
            <Label>Orden #</Label>
            <Input 
                type="number" 
                value={chapterForm.orden} 
                onChange={e => setChapterForm({...chapterForm, orden: Number(e.target.value)})} 
            />
          </div>

          {/* URL Video */}
          <div className="md:col-span-12 space-y-2">
            <Label className="flex justify-between">
                <span>URL del Video (.m3u8 o YouTube)</span>
                <span className="text-[10px] text-muted-foreground">Obligatorio</span>
            </Label>
            <Input 
                placeholder="https://stream.bayekverse.com/..." 
                value={chapterForm.video_url} 
                onChange={e => setChapterForm({...chapterForm, video_url: e.target.value})} 
                className="font-mono text-xs bg-muted/20" 
            />
          </div>

          {/* URL Miniatura */}
          <div className="md:col-span-12 space-y-2">
            <Label className="flex justify-between">
                <span>URL Miniatura Personalizada</span>
                <span className="text-[10px] text-muted-foreground">Opcional (Usa genérica si está vacío)</span>
            </Label>
            <div className="flex gap-4">
                <Input 
                    placeholder="https://imgur.com/..." 
                    value={chapterForm.miniatura_url} 
                    onChange={e => setChapterForm({...chapterForm, miniatura_url: e.target.value})} 
                />
                {/* Previsualización pequeña al lado del input */}
                <div className="w-16 h-10 bg-black rounded flex-shrink-0 overflow-hidden border">
                    <img 
                        src={chapterForm.miniatura_url || DEFAULT_THUMBNAIL} 
                        className="w-full h-full object-cover" 
                        alt="Preview" 
                        onError={(e) => e.currentTarget.src = DEFAULT_THUMBNAIL}
                    />
                </div>
            </div>
          </div>
        </div>

        {/* Footer del Formulario */}
        <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-muted/20 rounded-lg gap-4">
          <label className="flex items-center gap-2 text-sm font-bold cursor-pointer italic select-none">
            <input 
                type="checkbox" 
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer" 
                checked={chapterForm.es_pago} 
                onChange={e => setChapterForm({...chapterForm, es_pago: e.target.checked})} 
            /> 
            <span className={chapterForm.es_pago ? "text-amber-600" : "text-muted-foreground"}>
                {chapterForm.es_pago ? "🔒 CONTENIDO PREMIUM (Requiere Pago)" : "🔓 CONTENIDO GRATUITO"}
            </span>
          </label>
          
          <div className="flex gap-2 w-full md:w-auto">
             {editingChapterId && (
                 <button onClick={resetForm} className="px-6 py-2 rounded-lg font-bold uppercase text-muted-foreground hover:bg-muted transition text-xs">
                     Cancelar Edición
                 </button>
             )}
             <button 
                onClick={handleSaveChapter} 
                disabled={isSaving} 
                className="flex-1 md:flex-none bg-primary text-primary-foreground px-10 py-2 rounded-lg font-black uppercase tracking-widest hover:scale-105 transition active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
                {isSaving ? <Loader2 className="animate-spin w-4 h-4"/> : <Save className="w-4 h-4" />}
                {isSaving ? "Guardando..." : editingChapterId ? "Actualizar Cambios" : "Guardar Capítulo"}
             </button>
          </div>
        </div>
      </section>

      {/* BARRA INFERIOR FIJA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t p-4 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <p className="text-[10px] text-muted-foreground uppercase font-bold hidden md:block tracking-widest">
            Bayekverse Admin // {chapters.length} Episodios Cargados
          </p>
          <button 
            onClick={() => navigate('/admin')} 
            className="w-full md:w-auto bg-foreground text-background px-12 py-3 rounded-xl font-black uppercase italic tracking-tighter hover:bg-foreground/90 transition shadow-xl"
          >
            Finalizar y Salir
          </button>
        </div>
      </div>
    </div>
  )
}
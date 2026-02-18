import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save, Globe, Lock, Loader2, Image as ImageIcon } from "lucide-react"

interface Chapter {
  id: string
  titulo: string
  video_url?: string
  orden: number
  temporada: number
  miniatura_url?: string
  es_pago?: boolean
}

export default function SeriesEditor() {
  const { slug } = useParams()
  const navigate = useNavigate()
  
  const [serieId, setSerieId] = useState<string | null>(null)
  const [serieEsPago, setSerieEsPago] = useState(false)
  const [seriePortada, setSeriePortada] = useState("") // 🔥 NUEVO: Estado para la portada
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingSeries, setIsSavingSeries] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [chapterForm, setChapterForm] = useState({
    titulo: "",
    video_url: "",
    orden: 1,
    temporada: 1,
    miniatura_url: "",
    es_pago: false
  })

  const [editingChapterId, setEditingChapterId] = useState<string | null>(null)

  useEffect(() => {
    const fetchSerieAndChapters = async () => {
      if (!slug) return
      
      const { data: serie, error: sError } = await supabase
        .from('series')
        .select('id, es_pago, portada_url')
        .eq('slug', slug)
        .single()

      if (serie) {
        setSerieId(serie.id)
        setSerieEsPago(serie.es_pago ?? false)
        setSeriePortada(serie.portada_url ?? "")

        const { data: caps } = await supabase
          .from('capitulos')
          .select('*')
          .eq('series_id', serie.id)
          .order('orden', { ascending: true })
        
        if (caps) setChapters(caps)
      }
      setIsLoading(false)
    }

    fetchSerieAndChapters()
  }, [slug])

  // 🔥 NUEVO: Función para actualizar datos globales de la serie (Portada y Pago)
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

  const handleSaveChapter = async () => {
    if (!chapterForm.titulo || !chapterForm.video_url || !serieId) {
      toast({ title: "Falta título, video o ID de serie", variant: "destructive" })
      return
    }

    setIsSaving(true)

    if (editingChapterId) {
      const { error } = await supabase
        .from('capitulos')
        .update({
          titulo: chapterForm.titulo,
          video_url: chapterForm.video_url,
          orden: chapterForm.orden,
          temporada: chapterForm.temporada,
          miniatura_url: chapterForm.miniatura_url,
          es_pago: chapterForm.es_pago
        })
        .eq('id', editingChapterId)

      if (error) {
        toast({ title: "Error al actualizar", description: error.message, variant: "destructive" })
      } else {
        setChapters(prev => prev.map(c => c.id === editingChapterId ? { ...c, ...chapterForm } : c))
        toast({ title: "Capítulo actualizado" })
      }
    } else {
      const { data, error } = await supabase
        .from('capitulos')
        .insert([{
          series_id: serieId,
          ...chapterForm
        }])
        .select()

      if (error) {
        toast({ title: "Error al insertar", description: error.message, variant: "destructive" })
      } else if (data) {
        setChapters(prev => [...prev, data[0]])
        toast({ title: "Capítulo guardado" })
      }
    }

    setEditingChapterId(null)
    setChapterForm({
      titulo: "",
      video_url: "",
      orden: chapters.length + 2,
      temporada: 1,
      miniatura_url: "",
      es_pago: false
    })
    setIsSaving(false)
  }

  const deleteChapter = async (id: string) => {
    const { error } = await supabase.from('capitulos').delete().eq('id', id)
    if (!error) {
      setChapters(prev => prev.filter(c => c.id !== id))
      toast({ title: "Capítulo eliminado" })
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

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-primary" /></div>

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 pb-32 space-y-10">
      
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <button onClick={() => navigate('/admin')} className="flex items-center text-sm text-muted-foreground hover:text-primary transition mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver al panel
          </button>
          <h1 className="text-3xl font-bold font-display uppercase tracking-tighter italic">Editor de Contenido</h1>
        </div>
      </div>

      {/* 🔥 NUEVA SECCIÓN: IDENTIDAD Y ACCESO */}
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
                placeholder="https://res.cloudinary.com/..."
                value={seriePortada}
                onChange={(e) => setSeriePortada(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground italic">Esta es la imagen que aparece en el catálogo principal de Bayekverse.</p>
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
              className="w-full md:w-auto bg-secondary text-secondary-foreground px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-widest hover:opacity-80 transition"
            >
              {isSavingSeries ? "Actualizando..." : "Actualizar Datos de Serie"}
            </button>
          </div>

          <div className="flex flex-col items-center justify-center border rounded-xl bg-muted/10 p-4">
            <Label className="mb-2 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Previsualización</Label>
            {seriePortada ? (
              <img src={seriePortada} alt="Portada" className="w-32 h-48 object-cover rounded shadow-2xl border-2 border-primary/20" />
            ) : (
              <div className="w-32 h-48 bg-muted rounded flex items-center justify-center text-xs italic text-muted-foreground text-center p-2">Sube una URL para ver la portada</div>
            )}
          </div>
        </div>
      </section>

      {/* LISTADO DE CAPÍTULOS */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold uppercase italic tracking-tighter">Episodios Actuales</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {chapters.map(cap => (
            <div key={cap.id} className="bg-card border rounded-xl p-4 flex gap-4 shadow-sm group hover:border-primary/50 transition">
              <div className="relative">
                <img src={cap.miniatura_url || ""} className="w-32 h-20 object-cover rounded-lg bg-muted shadow-inner" alt="" />
                {cap.es_pago && <div className="absolute top-1 right-1 bg-amber-500 text-white p-1 rounded"><Lock className="w-3 h-3" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate text-sm uppercase italic">{cap.titulo}</div>
                <div className="text-[10px] text-muted-foreground font-mono">SEASON {cap.temporada} // EPISODE {cap.orden}</div>
                <div className="flex gap-4 pt-2">
                  <button onClick={() => openEditChapter(cap)} className="text-[10px] font-bold text-primary hover:underline uppercase">Editar</button>
                  <button onClick={() => deleteChapter(cap.id)} className="text-[10px] font-bold text-destructive hover:underline uppercase">Borrar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FORMULARIO DE CAPÍTULO */}
      <section id="chapter-form" className="bg-card border rounded-xl p-6 space-y-6 shadow-lg border-t-4 border-t-primary">
        <h3 className="text-lg font-bold uppercase italic">{editingChapterId ? "📝 Modificar Episodio" : "➕ Añadir Nuevo Episodio"}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="col-span-2 space-y-2">
            <Label>Título del Episodio</Label>
            <Input placeholder="Ej: La Caída del Muro" value={chapterForm.titulo} onChange={e => setChapterForm({...chapterForm, titulo: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Temporada</Label>
            <Input type="number" value={chapterForm.temporada} onChange={e => setChapterForm({...chapterForm, temporada: Number(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <Label>Orden (Episodio N°)</Label>
            <Input type="number" value={chapterForm.orden} onChange={e => setChapterForm({...chapterForm, orden: Number(e.target.value)})} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>URL del Video (.m3u8)</Label>
            <Input placeholder="https://..." value={chapterForm.video_url} onChange={e => setChapterForm({...chapterForm, video_url: e.target.value})} className="font-mono text-xs" />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>URL Miniatura del Capítulo</Label>
            <Input placeholder="https://..." value={chapterForm.miniatura_url} onChange={e => setChapterForm({...chapterForm, miniatura_url: e.target.value})} />
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
          <label className="flex items-center gap-2 text-sm font-bold cursor-pointer italic">
            <input type="checkbox" className="w-4 h-4 accent-amber-500" checked={chapterForm.es_pago} onChange={e => setChapterForm({...chapterForm, es_pago: e.target.checked})} /> ¿Este capítulo requiere suscripción?
          </label>
          <button onClick={handleSaveChapter} disabled={isSaving} className="bg-primary text-primary-foreground px-10 py-2 rounded-lg font-black uppercase tracking-widest hover:scale-105 transition active:scale-95">
            {isSaving ? "Guardando..." : "Guardar Capítulo"}
          </button>
        </div>
      </section>

      {/* BARRA INFERIOR FIJA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t p-4 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <p className="text-[10px] text-muted-foreground uppercase font-bold hidden md:block tracking-widest">Panel de Control // Bayekverse Admin</p>
          <button onClick={() => navigate('/admin')} className="bg-primary text-white px-12 py-3 rounded-xl font-black uppercase italic tracking-tighter hover:bg-primary/90 transition shadow-xl shadow-primary/20">
            Finalizar y Salir
          </button>
        </div>
      </div>
    </div>
  )
}
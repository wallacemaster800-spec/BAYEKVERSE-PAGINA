import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Video } from 'lucide-react'

import {
  useSeries,
  useCapitulos,
  useCreateCapitulo,
  useUpdateCapitulo,
  useDeleteCapitulo,
  Capitulo,
} from '@/hooks/useSeries'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'


const capituloSchema = z.object({
  series_id: z.string().min(1),
  titulo: z.string().min(1).max(200),
  video_url: z.string().min(1, 'URL del HLS requerida'),
  miniatura_url: z.string().optional(),
  orden: z.coerce.number().int().min(0),
  temporada: z.coerce.number().int().min(1).default(1),
})

type CapituloFormData = z.infer<typeof capituloSchema>


export function CapitulosManager() {

  const { data: series } = useSeries()
  const [selectedSeriesId, setSelectedSeriesId] = useState('')

  const { data: capitulosData } = useCapitulos(selectedSeriesId, 0)

  const createCapitulo = useCreateCapitulo()
  const updateCapitulo = useUpdateCapitulo()
  const deleteCapitulo = useDeleteCapitulo()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCapitulo, setEditingCapitulo] = useState<Capitulo | null>(null)

  const [deleteData, setDeleteData] =
    useState<{ id: string; seriesId: string } | null>(null)

  const form = useForm<CapituloFormData>({
    resolver: zodResolver(capituloSchema),
    defaultValues: {
      series_id: '',
      titulo: '',
      video_url: '',
      miniatura_url: '',
      orden: 0,
      temporada: 1,
    },
  })


  const openCreate = () => {
    setEditingCapitulo(null)
    form.reset({
      series_id: selectedSeriesId,
      titulo: '',
      video_url: '',
      miniatura_url: '',
      orden: (capitulosData?.data?.length || 0) + 1,
      temporada: 1,
    })
    setIsDialogOpen(true)
  }


  const openEdit = (c: Capitulo) => {
    setEditingCapitulo(c)

    form.reset({
      series_id: c.series_id,
      titulo: c.titulo,
      video_url: (c as any).video_url || '',
      miniatura_url: c.miniatura_url || '',
      orden: c.orden,
      temporada: c.temporada || 1,
    })

    setIsDialogOpen(true)
  }


  const onSubmit = async (data: CapituloFormData) => {
    try {

      const payload = {
        series_id: data.series_id,
        titulo: data.titulo,
        video_url: data.video_url,
        miniatura_url: data.miniatura_url || null,
        orden: data.orden,
        temporada: data.temporada || 1,
      }

      if (editingCapitulo) {
        await updateCapitulo.mutateAsync({
          id: editingCapitulo.id,
          ...payload,
        })
      } else {
        await createCapitulo.mutateAsync(payload)
      }

      setIsDialogOpen(false)
      toast.success('Guardado')

    } catch {
      toast.error('Error al guardar')
    }
  }


  const handleDelete = async () => {
    if (!deleteData) return
    await deleteCapitulo.mutateAsync(deleteData)
    setDeleteData(null)
  }


  return (
    <div className="space-y-6">

      <div className="flex gap-4">

        <Select value={selectedSeriesId} onValueChange={setSelectedSeriesId}>
          <SelectTrigger><SelectValue placeholder="Serie" /></SelectTrigger>
          <SelectContent>
            {series?.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.titulo}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={openCreate} disabled={!selectedSeriesId}>
          <Plus className="w-4 h-4 mr-2"/> Nuevo
        </Button>

      </div>


      {capitulosData?.data?.map((c) => (

        <Card key={c.id}>
          <CardContent className="flex items-center gap-4 p-4">

            <div className="flex-1">
              <h3>{c.titulo}</h3>
              <div className="text-xs text-muted-foreground flex gap-2">
                <Video className="w-3 h-3"/>
                {(c as any).video_url}
              </div>
            </div>

            <Button size="icon" variant="ghost" onClick={() => openEdit(c)}>
              <Pencil className="w-4 h-4"/>
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => setDeleteData({ id: c.id, seriesId: c.series_id })}
            >
              <Trash2 className="w-4 h-4"/>
            </Button>

          </CardContent>
        </Card>

      ))}

      {/* Dialog */}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>

          <DialogHeader>
            <DialogTitle>Capítulo</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              <FormField control={form.control} name="titulo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl><Input {...field}/></FormControl>
                  <FormMessage/>
                </FormItem>
              )}/>

              <FormField control={form.control} name="video_url" render={({ field }) => (
                <FormItem>
                  <FormLabel>URL HLS (.m3u8)</FormLabel>
                  <FormControl><Input {...field}/></FormControl>
                  <FormMessage/>
                </FormItem>
              )}/>

              <Button type="submit" className="w-full">Guardar</Button>

            </form>
          </Form>

        </DialogContent>
      </Dialog>

    </div>
  )
}


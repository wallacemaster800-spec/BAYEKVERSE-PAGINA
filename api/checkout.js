import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Método no permitido');

  try {
    const { seriesId, userId, title } = req.body;

    // 1. Nos conectamos a Supabase con la llave maestra
    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 2. Buscamos el precio REAL en la base de datos (Nadie puede hackear esto)
    const { data: serie, error: dbError } = await supabaseAdmin
      .from('series')
      .select('precio')
      .eq('id', seriesId)
      .single();

    if (dbError || !serie || !serie.precio) {
      console.error('Error: Serie no encontrada o no tiene precio asignado.');
      return res.status(400).json({ error: 'Precio no configurado en la base de datos' });
    }

    const precioReal = serie.precio; // ¡Acá tenemos el precio seguro!

    // 3. Creamos el link en Mercado Pago
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [
          {
            id: seriesId,
            title: title || 'Serie Premium',
            quantity: 1,
            unit_price: Number(precioReal) // Usamos el precio de la base de datos
          }
        ],
        external_reference: `${userId}|${seriesId}`,
        back_urls: {
          success: 'https://bayekverse.com',
          failure: 'https://bayekverse.com',
          pending: 'https://bayekverse.com'
        },
        auto_return: 'approved',
        notification_url: 'https://bayekverse.com/api/webhook'
      })
    });

    const data = await mpResponse.json();
    
    if (!mpResponse.ok) {
      console.error('Error creando link en MP:', data);
      return res.status(400).json({ error: 'Error de Mercado Pago' });
    }

    return res.status(200).json({ url: data.init_point });

  } catch (error) {
    console.error('Error interno del checkout:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
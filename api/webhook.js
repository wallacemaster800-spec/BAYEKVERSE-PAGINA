import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Solo permitimos que Lemon Squeezy nos envíe datos (POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const payload = req.body;
    const eventName = payload.meta.event_name;

    // Solo nos interesa cuando alguien paga con éxito
    if (eventName === 'order_created') {
      const customData = payload.meta.custom_data;
      const orderId = payload.data.id;

      // Verificamos que vengan los datos que le mandamos desde React
      if (!customData || !customData.user_id || !customData.series_id) {
        return res.status(400).json({ error: 'Faltan datos de usuario o serie' });
      }

      // ⚠️ Nos conectamos a Supabase con la LLAVE MAESTRA (Service Role Key)
      // Esta llave ignora la seguridad que pusimos en el Paso 1, por lo que SÍ puede insertar.
      const supabaseAdmin = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Insertamos la compra en la base de datos
      const { error } = await supabaseAdmin
        .from('compras')
        .insert({
          user_id: customData.user_id,
          series_id: customData.series_id,
          lemon_order_id: orderId
        });

      if (error) {
        console.error('Error al insertar compra:', error);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
    }

    // Le decimos a Lemon Squeezy "Mensaje recibido, todo OK"
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error catastrófico en el webhook:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
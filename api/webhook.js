import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Gumroad envía peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const payload = req.body;

    // Gumroad manda 'resource_name: sale' cuando alguien compra
    if (payload.resource_name === 'sale') {
      
      // En Gumroad los custom fields llegan sueltos en el body
      const userId = payload.user_id;
      const seriesId = payload.series_id;
      const orderId = payload.order_number; // El identificador del recibo de Gumroad

      // Verificamos que vengan los datos que le mandamos desde el frontend
      if (!userId || !seriesId) {
        return res.status(400).json({ error: 'Faltan datos de usuario o serie' });
      }

      // ⚠️ Nos conectamos a Supabase con la LLAVE MAESTRA
      const supabaseAdmin = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Insertamos la compra en la base de datos
      const { error } = await supabaseAdmin
        .from('compras')
        .insert({
          user_id: userId,
          series_id: seriesId,
          lemon_order_id: orderId // Usamos la misma columna para no tener que modificar Supabase
        });

      if (error) {
        console.error('Error al insertar compra:', error);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
    }

    // Le decimos a Gumroad "Mensaje recibido, todo OK"
    return res.status(200).send('OK');

  } catch (error) {
    console.error('Error catastrófico en el webhook:', error);
    return res.status(500).send('Error interno del servidor');
  }
}
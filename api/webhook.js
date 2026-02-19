import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Método no permitido');

  // 1. Siempre respondemos 200 a Mercado Pago primero
  res.status(200).send('OK');

  try {
    const id = req.query.id || (req.body.data && req.body.data.id);
    const type = req.query.topic || req.body.type;

    if (type !== 'payment') return;

    // 2. Consultamos el pago real
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
    });

    const paymentData = await mpResponse.json();

    if (paymentData.status === 'approved') {
      // 3. Extraemos el usuario y la serie (separados por |)
      const [userId, seriesId] = paymentData.external_reference.split('|');

      // 4. Conectamos a Supabase
      const supabaseAdmin = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      // 5. Guardamos la compra (SOLO las columnas que sabemos que existen)
      const { error } = await supabaseAdmin
        .from('compras')
        .insert([
          { 
            user_id: userId, 
            series_id: seriesId,
            payment_id: String(id) // Guardamos el ID de MP por seguridad
          }
        ]);

      if (error) {
        console.error('Error insertando en Supabase:', error.message);
      } else {
        console.log('✅ COMPRA GUARDADA CON ÉXITO');
      }
    }
  } catch (err) {
    console.error('Webhook Error CRÍTICO:', err.message);
  }
}
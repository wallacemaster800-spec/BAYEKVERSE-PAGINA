import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const payload = req.body;

    // --- CASO 1: GUMROAD ---
    if (payload.resource_name === 'sale') {
      const { error } = await supabaseAdmin.from('compras').insert({
        user_id: payload.user_id,
        series_id: payload.series_id,
        lemon_order_id: `GUM-${payload.order_number}`
      });
      if (error) throw error;
      return res.status(200).send('OK Gumroad');
    }

    // --- CASO 2: MERCADO PAGO ---
    // MP envía 'type: payment' o 'action: payment.created'
    if (payload.type === 'payment' || payload.action === 'payment.created') {
      const paymentId = payload.data?.id || payload.id;

      // Consultamos a MP para verificar el pago
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      const paymentData = await mpRes.json();

      if (paymentData.status === 'approved') {
        // Sacamos los IDs del external_reference que mandamos: "userId|seriesId"
        const [userId, seriesId] = paymentData.external_reference.split('|');

        const { error } = await supabaseAdmin.from('compras').insert({
          user_id: userId,
          series_id: seriesId,
          lemon_order_id: `MP-${paymentId}`
        });
        if (error) throw error;
      }
      return res.status(200).send('OK MercadoPago');
    }

    return res.status(200).send('Evento ignorado');

  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).send('Error interno');
  }
}
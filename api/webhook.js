import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  // 1. EL RADAR: Esto va a imprimir en Vercel TODO lo que mande Mercado Pago
  console.log('=== NUEVO EVENTO RECIBIDO EN EL WEBHOOK ===');
  console.log('Cuerpo del mensaje (Payload):', JSON.stringify(req.body, null, 2));

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const payload = req.body;

    // --- CASO 1: GUMROAD ---
    if (payload.resource_name === 'sale') {
      console.log('Detectada compra de Gumroad. Procesando...');
      const { error } = await supabaseAdmin.from('compras').insert({
        user_id: payload.user_id,
        series_id: payload.series_id,
        lemon_order_id: `GUM-${payload.order_number}`
      });
      if (error) throw error;
      console.log('Gumroad: Compra guardada con éxito.');
      return res.status(200).send('OK Gumroad');
    }

    // --- CASO 2: MERCADO PAGO ---
    // MP envía 'type: payment' o 'action: payment.created'
    if (payload.type === 'payment' || payload.action === 'payment.created') {
      console.log('Detectado aviso de Pago de Mercado Pago. ID:', payload.data?.id || payload.id);
      
      const paymentId = payload.data?.id || payload.id;

      // Consultamos a MP para verificar que el pago sea real y esté aprobado
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      
      const paymentData = await mpRes.json();
      console.log('Estado del pago en MP:', paymentData.status);

      if (paymentData.status === 'approved') {
        console.log('El pago está APROBADO. Referencia externa:', paymentData.external_reference);
        
        // Sacamos los IDs: "userId|seriesId"
        if (!paymentData.external_reference) {
          console.error('ERROR CRÍTICO: Mercado Pago no devolvió el external_reference');
          return res.status(400).send('Falta external_reference');
        }

        const [userId, seriesId] = paymentData.external_reference.split('|');

        console.log(`Guardando en DB -> User: ${userId}, Serie: ${seriesId}`);
        const { error } = await supabaseAdmin.from('compras').insert({
          user_id: userId,
          series_id: seriesId,
          lemon_order_id: `MP-${paymentId}`
        });
        
        if (error) throw error;
        console.log('Mercado Pago: Compra guardada con éxito en Supabase.');
      } else {
        console.log('El pago no está aprobado todavía. Estado actual:', paymentData.status);
      }
      
      return res.status(200).send('OK MercadoPago');
    }

    console.log('Evento ignorado (no es payment ni sale)');
    return res.status(200).send('Evento ignorado');

  } catch (error) {
    console.error('Webhook Error CRÍTICO:', error);
    return res.status(500).send('Error interno');
  }
}
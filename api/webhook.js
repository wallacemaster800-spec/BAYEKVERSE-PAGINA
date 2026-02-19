import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Método no permitido');

  try {
    // Mercado Pago manda el ID a veces en la URL y a veces en el Body
    const id = req.query.id || (req.body.data && req.body.data.id) || req.body.id;
    const type = req.query.topic || req.body.type || req.body.action;

    console.log(`[WEBHOOK] Detectado ID: ${id} | Tipo: ${type}`);

    // Solo procesamos pagos aprobados
    if (type === 'payment' || type === 'payment.created' || type === 'payment.updated') {
      
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });

      const paymentData = await mpResponse.json();

      if (paymentData.status === 'approved') {
        const reference = paymentData.external_reference;
        
        if (reference && reference.includes('|')) {
          const [userId, seriesId] = reference.split('|');
          console.log(`[OK] Pago aprobado. User: ${userId}, Series: ${seriesId}`);

          const supabaseAdmin = createClient(
            process.env.VITE_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
          );

          // Insertamos en la tabla compras
          const { error } = await supabaseAdmin
            .from('compras')
            .insert([{ 
              user_id: userId, 
              series_id: seriesId, 
              payment_id: String(id) 
            }]);

          if (error) throw new Error(`Error Supabase: ${error.message}`);
          
          console.log('✅ COMPRA REGISTRADA EN SUPABASE');
        }
      }
    }

    // RECIÉN ACÁ RESPONDEMOS: Así Vercel no mata el proceso antes de tiempo
    return res.status(200).send('Webhook procesado');

  } catch (err) {
    console.error('❌ ERROR EN WEBHOOK:', err.message);
    // Aunque falle, le decimos 200 a MP para que no reintente como loco
    return res.status(200).send('Error interno pero recibido');
  }
}
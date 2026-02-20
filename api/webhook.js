import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Método no permitido');

  try {
    // =====================================================================
    // 🟢 NUEVO: DETECCIÓN DE GUMROAD MEJORADA (Lee la caja fuerte url_params)
    // =====================================================================
    // Si trae un email, sabemos que 100% es un ping de Gumroad
    if (req.body && req.body.email) {
      console.log(`[GUMROAD] Ping recibido de: ${req.body.email}`);
      
      let userId = req.body.user_id;
      let seriesId = req.body.series_id;

      // Acá está el truco: Gumroad esconde los datos de la URL acá adentro
      if (req.body.url_params) {
        try {
          // A veces lo manda como texto, a veces como objeto
          const params = typeof req.body.url_params === 'string' 
            ? JSON.parse(req.body.url_params) 
            : req.body.url_params;
          
          userId = params.user_id || userId;
          seriesId = params.series_id || seriesId;
        } catch (e) {
          console.error("No se pudo leer url_params");
        }
      }

      // Si después de buscar, encontramos los IDs, guardamos la compra
      if (userId && seriesId) {
        console.log(`[GUMROAD] Datos extraídos -> User: ${userId} | Series: ${seriesId}`);
        
        const supabaseAdmin = createClient(
          process.env.VITE_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { error } = await supabaseAdmin
          .from('compras')
          .insert([{ 
            user_id: userId, 
            series_id: seriesId, 
            payment_id: req.body.receipt_url || 'gumroad_pago' 
          }]);

        if (error) throw new Error(`Error Supabase Gumroad: ${error.message}`);
        console.log('✅ COMPRA DE GUMROAD REGISTRADA EN SUPABASE');
      } else {
        console.error('❌ Gumroad llegó, pero no trajo los IDs en la URL.');
      }
      
      // Cortamos acá. A Gumroad le decimos 200 OK para que no siga insistiendo.
      return res.status(200).send('Webhook Gumroad procesado');
    }
    // =====================================================================
    // 🟢 FIN DE GUMROAD
    // =====================================================================


    // =====================================================================
    // 🔵 CÓDIGO INTACTO DE MERCADO PAGO
    // =====================================================================
    const id = req.query.id || (req.body.data && req.body.data.id) || req.body.id;
    const type = req.query.topic || req.body.type || req.body.action;

    console.log(`[WEBHOOK] Detectado ID: ${id} | Tipo: ${type}`);

    if (type === 'payment' || type === 'payment.created' || type === 'payment.updated') {
      
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });

      const paymentData = await mpResponse.json();

      if (paymentData.status === 'approved') {
        const reference = paymentData.external_reference;
        
        if (reference && reference.includes('|')) {
          const [mpUserId, mpSeriesId] = reference.split('|');
          console.log(`[OK] Pago aprobado. User: ${mpUserId}, Series: ${mpSeriesId}`);

          const supabaseAdmin = createClient(
            process.env.VITE_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
          );

          const { error } = await supabaseAdmin
            .from('compras')
            .insert([{ 
              user_id: mpUserId, 
              series_id: mpSeriesId, 
              payment_id: String(id) 
            }]);

          if (error) throw new Error(`Error Supabase: ${error.message}`);
          
          console.log('✅ COMPRA REGISTRADA EN SUPABASE');
        }
      }
    }

    return res.status(200).send('Webhook procesado');
    // =====================================================================
    // 🔵 FIN CÓDIGO INTACTO DE MERCADO PAGO
    // =====================================================================

  } catch (err) {
    console.error('❌ ERROR EN WEBHOOK:', err.message);
    return res.status(200).send('Error interno pero recibido');
  }
}
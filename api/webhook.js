import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Método no permitido');

  try {
    // 🟢 DETECCIÓN DE GUMROAD
    if (req.body && req.body.email) {
      console.log("--- [DEBUG GUMROAD] INICIO ---");
      console.log("Cuerpo recibido:", JSON.stringify(req.body));
      
      let userId = req.body.user_id;
      let seriesId = req.body.series_id;

      // Intentamos extraer de url_params si vienen ahí
      if (req.body.url_params) {
        try {
          const params = typeof req.body.url_params === 'string' 
            ? JSON.parse(req.body.url_params) 
            : req.body.url_params;
          
          userId = params.user_id || userId;
          seriesId = params.series_id || seriesId;
          console.log(`[DEBUG] IDs extraídos de url_params: User=${userId}, Series=${seriesId}`);
        } catch (e) {
          console.log("[DEBUG] url_params no es JSON, probando lectura directa...");
          // Si no es JSON, a veces viene como string de URL (user_id=xxx&series_id=yyy)
          const searchParams = new URLSearchParams(req.body.url_params);
          userId = searchParams.get('user_id') || userId;
          seriesId = searchParams.get('series_id') || seriesId;
        }
      }

      if (userId && seriesId) {
        const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        const { error } = await supabaseAdmin.from('compras').insert([{ 
          user_id: userId, 
          series_id: seriesId, 
          payment_id: req.body.receipt_url || 'gumroad_pago' 
        }]);

        if (error) {
          console.error('❌ Error Supabase:', error.message);
        } else {
          console.log('✅ COMPRA REGISTRADA EXITOSAMENTE');
        }
      } else {
        console.error('❌ No se encontraron IDs. User:', userId, 'Series:', seriesId);
      }
      
      console.log("--- [DEBUG GUMROAD] FIN ---");
      return res.status(200).send('OK');
    }

    // 🔵 CÓDIGO INTACTO DE MERCADO PAGO
    const id = req.query.id || (req.body.data && req.body.data.id) || req.body.id;
    const type = req.query.topic || req.body.type || req.body.action;

    if (type === 'payment' || type === 'payment.created' || type === 'payment.updated') {
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      const paymentData = await mpResponse.json();
      if (paymentData.status === 'approved') {
        const reference = paymentData.external_reference;
        if (reference && reference.includes('|')) {
          const [u, s] = reference.split('|');
          const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
          await supabaseAdmin.from('compras').insert([{ user_id: u, series_id: s, payment_id: String(id) }]);
          console.log('✅ COMPRA MP REGISTRADA');
        }
      }
    }
    return res.status(200).send('OK');

  } catch (err) {
    console.error('❌ ERROR GENERAL:', err.message);
    return res.status(200).send('Error');
  }
}
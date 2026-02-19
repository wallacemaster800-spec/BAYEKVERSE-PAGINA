import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { META_DEFAULTS } from '@/lib/constants';

export default function Reembolsos() {
  return (
    <>
      <Helmet>
        <title>Política de Reembolsos | {META_DEFAULTS.siteName}</title>
      </Helmet>
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-3xl font-display font-bold text-primary mb-8 uppercase tracking-tighter italic">Política de Reembolsos</h1>
          
          <div className="space-y-6 text-muted-foreground prose prose-invert">
            <p>Última actualización: Febrero de 2026</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Naturaleza del Producto</h2>
            <p>Bayekverse ofrece acceso inmediato a contenido digital, video bajo demanda (VOD) y productos intangibles. Al realizar una compra de "Acceso Premium" o pases similares, el usuario recibe acceso instantáneo al material.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Política de No Reembolso</h2>
            <p>Debido a la naturaleza digital e intangible de nuestros productos, <strong>todas las ventas son definitivas y no se emitirán reembolsos una vez completada la compra.</strong></p>
            <p>Al procesar el pago y acceder al contenido, el usuario renuncia expresamente a su derecho de desistimiento, ya que el servicio digital se considera completamente ejecutado en el momento en que se otorga el acceso a la plataforma.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Excepciones (Problemas Técnicos)</h2>
            <p>Únicamente consideraremos excepciones a esta regla bajo las siguientes circunstancias comprobables:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cobros duplicados por error del sistema:</strong> Si se le cobró dos veces por la misma serie debido a un fallo en la pasarela de pago.</li>
              <li><strong>Fallo técnico prolongado:</strong> Si debido a un problema exclusivo de nuestros servidores, usted no puede acceder al contenido adquirido durante un período ininterrumpido mayor a 72 horas inmediatamente después de su compra, y nuestro equipo de soporte no puede brindarle una solución.</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Proceso de Soporte</h2>
            <p>Si experimenta algún problema técnico para acceder a su contenido o reproducir los episodios, estamos aquí para ayudarle. No inicie una disputa (chargeback) con su tarjeta de crédito sin antes contactarnos, ya que esto resultará en el bloqueo automático y permanente de su cuenta.</p>
            
            <p className="mt-8">Comuníquese con nosotros enviando un correo a: <strong>wallacemaster800@gmail.com</strong> (Tiempo de respuesta estimado: 24-48 horas hábiles).</p>
          </div>
        </div>
      </Layout>
    </>
  );
}
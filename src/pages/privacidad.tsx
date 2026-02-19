import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { META_DEFAULTS } from '@/lib/constants';

export default function Privacidad() {
  return (
    <>
      <Helmet>
        <title>Política de Privacidad | {META_DEFAULTS.siteName}</title>
      </Helmet>
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-3xl font-display font-bold text-primary mb-8 uppercase tracking-tighter italic">Política de Privacidad</h1>
          
          <div className="space-y-6 text-muted-foreground prose prose-invert">
            <p>Última actualización: Febrero de 2026</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Información que recopilamos</h2>
            <p>En Bayekverse respetamos su privacidad. Solo recopilamos la información estrictamente necesaria para brindarle acceso a nuestro contenido digital:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Datos de cuenta:</strong> Dirección de correo electrónico y nombre de usuario al momento de registrarse.</li>
              <li><strong>Datos de uso:</strong> Información sobre los capítulos reproducidos y el progreso para mejorar la experiencia de usuario.</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Información de Pagos (Importante)</h2>
            <p><strong>Nosotros NO procesamos, almacenamos ni tenemos acceso a los datos de su tarjeta de crédito o información bancaria.</strong></p>
            <p>Todos los pagos son procesados de forma segura a través de pasarelas de pago de terceros certificadas y reguladas internacionalmente (como Lemon Squeezy o similares), quienes actúan como <em>Merchant of Record</em>. Toda transacción está sujeta a las políticas de privacidad de dichos procesadores.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Uso de la Información</h2>
            <p>Utilizamos su correo electrónico exclusivamente para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Crear y gestionar su cuenta de acceso.</li>
              <li>Enviar recibos de compra y confirmaciones de acceso premium.</li>
              <li>Notificarle sobre nuevos episodios o lanzamientos en la plataforma (puede darse de baja en cualquier momento).</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Protección y Divulgación de Datos</h2>
            <p>No vendemos, alquilamos ni compartimos su información personal con terceros bajo ninguna circunstancia, excepto cuando sea requerido por la ley o para facilitar el procesamiento de pagos a través de nuestros proveedores autorizados.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Sus Derechos</h2>
            <p>Usted tiene derecho a solicitar la eliminación completa de su cuenta y sus datos de nuestros servidores en cualquier momento. Para ejercer este derecho, contáctenos en <strong>wallacemaster800@gmail.com</strong>.</p>
          </div>
        </div>
      </Layout>
    </>
  );
}
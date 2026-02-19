import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { META_DEFAULTS } from '@/lib/constants';

export default function Terminos() {
  return (
    <>
      <Helmet>
        <title>Términos y Condiciones | {META_DEFAULTS.siteName}</title>
      </Helmet>
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-3xl font-display font-bold text-primary mb-8 uppercase tracking-tighter italic">Términos y Condiciones</h1>
          
          <div className="space-y-6 text-muted-foreground prose prose-invert">
            <p>Última actualización: Febrero de 2026</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Aceptación de los Términos</h2>
            <p>Al acceder y utilizar Bayekverse (en adelante, "la Plataforma"), usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios ni adquirir acceso a nuestro contenido.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Propiedad Intelectual y Derechos de Autor</h2>
            <p>Todo el contenido disponible en la Plataforma, incluyendo pero no limitado a series de video (como "Punto Zero"), audiolibros, textos, lore, imágenes, logotipos y código fuente, es propiedad intelectual exclusiva del creador de Bayekverse y está protegido por las leyes internacionales de derechos de autor.</p>
            <p>La compra de cualquier "Acceso Premium" u otro producto digital otorga al usuario una licencia personal, no exclusiva y no transferible para visualizar el contenido únicamente a través de la Plataforma.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Restricciones de Uso</h2>
            <p>Queda estrictamente prohibido:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Descargar, grabar (screen record), reproducir, distribuir, transmitir o vender el contenido de video o audio disponible en la Plataforma.</li>
              <li>Compartir las credenciales de su cuenta con terceros. El acceso es estrictamente personal.</li>
              <li>Utilizar el contenido para fines comerciales o exhibiciones públicas.</li>
            </ul>
            <p>El incumplimiento de estas normas resultará en la suspensión inmediata y permanente de la cuenta sin derecho a reembolso.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Cuentas de Usuario</h2>
            <p>Para acceder al contenido premium, el usuario debe registrarse proporcionando información veraz y mantener la confidencialidad de su contraseña. La Plataforma se reserva el derecho de rechazar el servicio o cancelar cuentas a su entera discreción.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Modificaciones del Servicio</h2>
            <p>Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto de la Plataforma en cualquier momento, incluyendo la disponibilidad de cualquier serie o episodio, sin previo aviso.</p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">6. Contacto</h2>
            <p>Para cualquier consulta legal o técnica relacionada con estos Términos, puede contactarnos en: <strong>wallacemaster800@gmail.com</strong></p>
          </div>
        </div>
      </Layout>
    </>
  );
}
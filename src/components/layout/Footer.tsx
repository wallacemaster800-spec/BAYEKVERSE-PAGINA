import { Film, Heart, Coffee, ExternalLink, Mail, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SOCIAL_LINKS, CONTACT_EMAIL } from '@/lib/constants';

// Componente Icono TikTok (Estilo Lucide)
const TiktokIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export function Footer() {
  const socialIcons = [
    { name: 'YouTube', href: SOCIAL_LINKS.youtube, icon: Youtube },
    // Asegúrate de agregar .tiktok en tu archivo constants.ts o pon el link 'https://...'
    { name: 'TikTok', href: SOCIAL_LINKS.tiktok || '#', icon: TiktokIcon },
  ];

  return (
    <footer className="footer-gradient border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Support Section */}
        <div className="text-center mb-12">
          <h3 className="text-lg font-display font-semibold mb-3 flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 text-glow-red" />
            Apoya el proyecto
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            Si disfrutas del contenido de Bayekverse, considera apoyarnos para que podamos seguir creando.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={SOCIAL_LINKS.Cafecito}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FF5E5B] text-white font-medium text-sm hover:bg-[#FF5E5B]/90 transition-colors"
            >
              <Coffee className="w-4 h-4" />
              Cafecito
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={SOCIAL_LINKS.Kofi}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FF424D] text-white font-medium text-sm hover:bg-[#FF424D]/90 transition-colors"
            >
              <Heart className="w-4 h-4" />
             Kofi
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <Film className="w-6 h-6 text-primary" />
              <span className="font-display font-bold">BAYEKVERSE</span>
            </Link>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialIcons.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5 text-muted-foreground" />
                </a>
              ))}
            </div>

            {/* Contact */}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contacto
            </a>
          </div>

          <div className="mt-8 text-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Bayekverse. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
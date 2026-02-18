import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { EightBallLogo } from '@/components/ui/EightBallLogo';

export function Header() {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, isAdmin, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-none md:bg-background/80 md:backdrop-blur-lg transition-all">

      <div className="container mx-auto px-4">

        <nav className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex items-center gap-2">
              <EightBallLogo className="w-8 h-8" />
              <span className="text-xl font-display font-bold tracking-tight">
                BAYEKVERSE
              </span>
            </div>
          </Link>


          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">

            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Series
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}

            {/* LOGIN / LOGOUT */}

            {!user && (
              <Link to="/login">
                <button className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-md transition">
                  Iniciar sesión
                </button>
              </Link>
            )}

            {user && (
              <div className="flex items-center gap-3">

                <span className="text-xs text-muted-foreground hidden lg:block">
                  {user.email}
                </span>

                <button
                  onClick={signOut}
                  className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-md transition"
                >
                  Cerrar sesión
                </button>

              </div>
            )}

          </div>


          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen
              ? <X className="w-6 h-6" />
              : <Menu className="w-6 h-6" />
            }
          </button>

        </nav>


        {/* Mobile Menu */}

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border overflow-hidden bg-background"
            >

              <div className="flex flex-col gap-4 py-4">

                <Link
                  to="/"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Series
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}


                {/* MOBILE LOGIN */}

                {!user && (
                  <Link
                    to="/login"
                    className="text-sm font-medium px-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Iniciar sesión
                  </Link>
                )}

                {user && (
                  <button
                    onClick={()=>{
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-sm text-left px-2"
                  >
                    Cerrar sesión
                  </button>
                )}

              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </header>
  );
}

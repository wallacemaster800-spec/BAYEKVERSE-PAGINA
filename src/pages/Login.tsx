import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Loader2, Eye, EyeOff } from 'lucide-react';

import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useToast } from '@/hooks/use-toast';
import { EightBallLogo } from '@/components/ui/EightBallLogo';

// Ícono de Google SVG
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path
      fill="#EA4335"
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.9 3.47-1.92 4.64-1.17 1.17-2.67 1.93-5.92 1.93-5.04 0-9.27-4.06-9.27-9.1s4.23-9.1 9.27-9.1c2.73 0 4.81 1.07 6.36 2.52l2.31-2.31C18.25 1.02 15.42 0 12 0 5.38 0 0 5.38 0 12s5.38 12 12 12c3.58 0 6.36-1.17 8.52-3.4 2.2-2.2 2.91-5.3 2.91-7.83 0-.75-.07-1.46-.19-2.11H12.48z"
    />
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 🔥 Importamos signInWithGoogle desde tu hook
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({
        title: 'Error de acceso',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
    } else {
      navigate('/'); 
    }
  };

  // 🔥 Nueva función para Google
  const handleGoogleLogin = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Error con Google',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Iniciar Sesión | Bayekverse</title>
      </Helmet>

      <Layout hideFooter>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm"
          >
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <EightBallLogo className="w-16 h-16" />
              </div>
              <h1 className="text-2xl font-display font-bold">Bienvenido de nuevo</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Ingresá a tu cuenta de Bayekverse
              </p>
            </div>

            <div className="space-y-4">
              {/* 🔥 BOTÓN DE GOOGLE */}
              <Button 
                type="button" 
                variant="outline" 
                className="w-full bg-white text-black hover:bg-gray-50 border-gray-300"
                onClick={handleGoogleLogin}
              >
                <GoogleIcon />
                Continuar con Google
              </Button>

              {/* SEPARADOR VISUAL */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">O con tu email</span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Contraseña</Label>
                    <Link 
                      to="/forgot-password" 
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>

                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Iniciar Sesión
                </Button>

                <div className="text-center text-sm pt-2">
                  <span className="text-muted-foreground">¿No tienes cuenta? </span>
                  <Link to="/signup" className="text-primary hover:underline font-medium">
                    Regístrate
                  </Link>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </Layout>
    </>
  );
}

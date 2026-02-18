import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useToast } from '@/hooks/use-toast';
import { EightBallLogo } from '@/components/ui/EightBallLogo';

export default function Signup() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setIsLoading(true);

    const { error } = await signUp(email, password);

    if (error) {

      toast({
        title: 'Error al crear cuenta',
        description: error.message,
        variant: 'destructive',
      });

    } else {

      toast({
        title: 'Cuenta creada',
        description: 'Revisá tu email para confirmar. Si no lo ves, revisa la casilla de SPAM',
      });

      navigate('/login');
    }

    setIsLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Crear cuenta | Bayekverse</title>
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
              <h1 className="text-2xl font-display font-bold">Crear cuenta</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Contraseña</Label>

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
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>

                </div>

              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Crear cuenta
              </Button>

              <div className="text-center text-sm pt-2">
                <Link to="/login" className="text-primary hover:underline">
                  Ya tengo cuenta
                </Link>
              </div>

            </form>

          </motion.div>

        </div>

      </Layout>
    </>
  );
}

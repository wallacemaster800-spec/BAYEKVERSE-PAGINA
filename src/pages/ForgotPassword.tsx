import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { EightBallLogo } from "@/components/ui/EightBallLogo";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { toast } = useToast();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // 🔥 CORRECCIÓN: Ahora coincide con la ruta en App.tsx
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setIsSent(true);
        toast({
          title: "Correo enviado",
          description: "Revisá tu bandeja de entrada (y spam).",
        });
      }
    } catch (error) {
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al intentar enviar el correo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Recuperar Contraseña | Bayekverse</title>
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
              <h1 className="text-2xl font-display font-bold">Recuperar acceso</h1>
            </div>

            {!isSent ? (
              <>
                <p className="text-center text-muted-foreground mb-6 text-sm">
                  Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                <form onSubmit={handle} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="pl-9"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Enviar enlace
                  </Button>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-muted/50 p-6 rounded-lg text-center space-y-4 border border-border"
              >
                <div className="flex justify-center">
                  <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-500">
                    <CheckCircle2 size={24} />
                  </div>
                </div>
                <h3 className="font-semibold text-lg">¡Email enviado!</h3>
                <p className="text-muted-foreground text-sm">
                  Hemos enviado un enlace a <strong>{email}</strong>.
                  <br />
                  Revisá tu bandeja de entrada y SPAM.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setIsSent(false)} 
                  className="w-full mt-2"
                >
                  Intentar con otro correo
                </Button>
              </motion.div>
            )}

            <div className="text-center text-sm pt-6">
              <Link
                to="/login"
                className="text-muted-foreground hover:text-primary flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft size={14} /> Volver al inicio de sesión
              </Link>
            </div>

          </motion.div>
        </div>
      </Layout>
    </>
  );
}
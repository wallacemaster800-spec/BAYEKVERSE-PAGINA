import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { EightBallLogo } from "@/components/ui/EightBallLogo";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verificamos que el usuario tenga una sesión activa (el link de Supabase la crea temporalmente)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Acceso denegado",
          description: "El enlace es inválido o ha expirado.",
          variant: "destructive",
        });
        navigate("/login");
      }
    };
    checkSession();
  }, [navigate, toast]);

  const update = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      toast({
        title: "Error al actualizar",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      setIsDone(true);
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada con éxito.",
      });
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => navigate("/login"), 3000);
    }
  };

  return (
    <>
      <Helmet>
        <title>Nueva Contraseña | Bayekverse</title>
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
              <h1 className="text-2xl font-display font-bold">Nueva contraseña</h1>
            </div>

            {!isDone ? (
              <form onSubmit={update} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="pl-9 pr-10"
                      required
                      minLength={6}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || password.length < 6}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Guardar nueva contraseña
                </Button>
              </form>
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
                <h3 className="font-semibold text-lg">¡Todo listo!</h3>
                <p className="text-muted-foreground text-sm">
                  Tu contraseña fue actualizada. Serás redirigido al inicio de sesión en unos segundos...
                </p>
                <Button onClick={() => navigate("/login")} className="w-full">
                  Ir al Login ahora
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </Layout>
    </>
  );
}

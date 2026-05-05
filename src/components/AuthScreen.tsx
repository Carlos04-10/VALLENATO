import { motion, AnimatePresence } from "motion/react";
import { Chrome, Facebook, Mail, Lock, ArrowLeft, UserPlus, LogIn, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from "firebase/auth";
import { auth } from "../lib/firebase";

interface AuthScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function AuthScreen({ onBack, onSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (fullName) {
          await updateProfile(userCredential.user, { displayName: fullName });
        }
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 lg:p-12 bg-background relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="fixed top-0 right-0 p-8 hidden xl:block pointer-events-none">
        <div className="w-64 h-64 bg-primary-container/10 rounded-full blur-3xl absolute -top-20 -right-20"></div>
        <div className="w-32 h-32 bg-secondary-container/20 rounded-full blur-2xl absolute top-40 right-10"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_24px_48px_rgba(75,36,10,0.1)] relative z-10"
      >
        {/* Left Side: Editorial Image (Desktop Only) */}
        <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              alt="Gourmet food display" 
              className="w-full h-full object-cover" 
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/85 to-primary-container/60 mix-blend-multiply"></div>
          </div>
          
          <div className="relative z-10">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-on-primary/80 hover:text-on-primary transition-colors mb-8 group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Volver al Inicio</span>
            </button>
            <h1 className="font-headline font-black text-4xl text-on-primary tracking-tight">Vallenato Eats</h1>
            <p className="mt-4 text-on-primary/90 text-lg max-w-md font-light leading-relaxed">
              Vive los sabores auténticos de Valledupar entregados directamente en tu puerta.
            </p>
          </div>

          <div className="relative z-10 mt-auto">
            <div className="flex -space-x-3 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <img 
                  key={i}
                  alt="Usuario" 
                  className="inline-block h-12 w-12 rounded-full ring-2 ring-primary-container object-cover" 
                  src={`https://picsum.photos/seed/user${i}/100/100`}
                  referrerPolicy="no-referrer"
                />
              ))}
            </div>
            <p className="mt-4 text-on-primary font-medium">Únete a más de 5,000+ amantes de la comida local.</p>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="flex flex-col p-8 md:p-16 bg-surface-container-lowest">
          <div className="mb-10 lg:hidden flex justify-between items-center">
            <h2 className="font-headline font-black text-2xl text-primary tracking-tight">Vallenato Eats</h2>
            <button onClick={onBack} className="p-2 text-on-surface-variant">
              <ArrowLeft size={24} />
            </button>
          </div>

          <div className="flex flex-col gap-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="font-headline font-extrabold text-3xl text-on-surface tracking-tight">
                  {mode === "login" ? "Bienvenido de Nuevo" : "Crear Cuenta"}
                </h2>
                <p className="text-on-surface-variant mt-2 font-medium">
                  {mode === "login" 
                    ? "Inicia sesión para continuar tu viaje culinario." 
                    : "Únete a nosotros y descubre la mejor comida de la ciudad."}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col gap-4">
              {error && (
                <div className="bg-error-container/20 text-error-dim p-4 rounded-xl text-sm font-medium border border-error-container/30">
                  {error}
                </div>
              )}
              <button 
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-full bg-surface-container-low text-on-surface font-semibold hover:bg-surface-container-highest transition-all duration-300 active:scale-95 group disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Chrome size={20} className="text-primary" />}
                Continuar con Google
              </button>
              <button className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-full bg-surface-container-low text-on-surface font-semibold hover:bg-surface-container-highest transition-all duration-300 active:scale-95 group">
                <Facebook size={20} className="text-primary" />
                Continuar con Facebook
              </button>
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-outline-variant/30"></div>
              <span className="flex-shrink mx-4 text-on-surface-variant text-sm font-medium">o usa tu correo</span>
              <div className="flex-grow border-t border-outline-variant/30"></div>
            </div>

            <form className="space-y-5" onSubmit={handleAuth}>
              {mode === "register" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-1"
                >
                  <label className="block text-sm font-semibold text-on-surface-variant ml-4 mb-1">Nombre Completo</label>
                  <div className="relative">
                    <input 
                      className="w-full px-6 py-4 bg-surface-container-low border-none rounded-full focus:ring-2 focus:ring-primary-container text-on-surface placeholder:text-on-surface-variant/50 transition-all" 
                      placeholder="Juan Pérez" 
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </motion.div>
              )}
              
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-on-surface-variant ml-4 mb-1">Correo Electrónico</label>
                <input 
                  className="w-full px-6 py-4 bg-surface-container-low border-none rounded-full focus:ring-2 focus:ring-primary-container text-on-surface placeholder:text-on-surface-variant/50 transition-all" 
                  placeholder="ejemplo@vallenato.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center px-4 mb-1">
                  <label className="block text-sm font-semibold text-on-surface-variant">Contraseña</label>
                  {mode === "login" && (
                    <a className="text-xs font-bold text-primary hover:text-primary-dim transition-colors" href="#">¿Olvidaste?</a>
                  )}
                </div>
                <input 
                  className="w-full px-6 py-4 bg-surface-container-low border-none rounded-full focus:ring-2 focus:ring-primary-container text-on-surface placeholder:text-on-surface-variant/50 transition-all" 
                  placeholder="••••••••" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary text-on-primary font-bold rounded-full shadow-[0_12px_24px_rgba(163,55,0,0.2)] hover:bg-primary-dim hover:shadow-none transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    mode === "login" ? <LogIn size={20} /> : <UserPlus size={20} />
                  )}
                  {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
                </button>
              </div>
            </form>

            <p className="text-center text-on-surface-variant font-medium">
              {mode === "login" ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}
              <button 
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-primary font-bold hover:underline ml-1"
              >
                {mode === "login" ? "Crear Cuenta" : "Iniciar Sesión"}
              </button>
            </p>
          </div>

          <div className="mt-auto pt-12 flex flex-wrap gap-x-6 gap-y-2 justify-center">
            <a className="text-xs text-on-surface-variant hover:text-primary transition-colors" href="#">Política de Privacidad</a>
            <a className="text-xs text-on-surface-variant hover:text-primary transition-colors" href="#">Términos de Servicio</a>
            <a className="text-xs text-on-surface-variant hover:text-primary transition-colors" href="#">Centro de Ayuda</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

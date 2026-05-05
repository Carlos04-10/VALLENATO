import { motion } from "motion/react";
import { MapPin, Search, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-24 px-6">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-6 z-10"
        >
          <h1 className="text-5xl lg:text-7xl font-black font-headline text-on-surface leading-[1.1] tracking-tight mb-6">
            Encuentra la mejor comida en <span className="text-primary italic">Valledupar</span>
          </h1>
          <p className="text-lg text-on-surface-variant mb-10 max-w-lg font-body leading-relaxed">
            Desde el mejor arroz de lisa hasta el sancocho más auténtico. Pedir comida nunca fue tan vallenato.
          </p>
          
          <div className="bg-surface-container-low rounded-xl p-2 flex flex-col md:flex-row gap-2 max-w-2xl shadow-sm">
            <div className="flex-1 flex items-center px-4 gap-3 bg-surface-container-lowest rounded-full py-3">
              <MapPin className="text-primary" size={20} />
              <input 
                className="bg-transparent border-none focus:outline-none w-full text-on-surface font-body" 
                placeholder="Ingresa tu dirección de entrega..." 
                type="text"
              />
            </div>
            <button className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold hover:bg-primary-dim transition-all active:scale-95 flex items-center justify-center gap-2">
              <Search size={20} />
              <span>Explorar Ahora</span>
            </button>
          </div>
        </motion.div>

        <div className="lg:col-span-6 relative">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4 pt-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl overflow-hidden aspect-[4/5] shadow-lg"
              >
                <img 
                  className="w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000" 
                  alt="Gourmet salad"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-secondary-container p-6 rounded-xl flex flex-col justify-end aspect-square"
              >
                <span className="text-3xl font-black font-headline text-on-secondary-container">150+</span>
                <span className="text-on-secondary-container font-medium">Joyas Locales</span>
              </motion.div>
            </div>
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl overflow-hidden aspect-square shadow-lg"
              >
                <img 
                  className="w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1000" 
                  alt="Grilled meat"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-xl overflow-hidden aspect-[4/5] shadow-lg"
              >
                <img 
                  className="w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1000" 
                  alt="Artisanal pizza"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
            className="absolute -bottom-6 -left-6 bg-surface-bright/70 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/20 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container">
              <Zap size={24} fill="currentColor" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Entrega Rápida</p>
              <p className="text-on-surface font-black">25-35 Minutos</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

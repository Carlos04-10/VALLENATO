import { motion } from "motion/react";
import { User, MapPin, Settings, LogOut, ChevronRight, Bell, CreditCard, Shield, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

interface ProfileViewProps {
  onBack: () => void;
  onLogout: () => void;
}

export default function ProfileView({ onBack, onLogout }: ProfileViewProps) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([
    { id: 1, label: "Casa", address: "Carrera 9 #12-45, Barrio Novalito, Valledupar", isDefault: true },
    { id: 2, label: "Trabajo", address: "Calle 16 #8-22, Centro, Valledupar", isDefault: false }
  ]);

  const menuItems = [
    { icon: <Bell size={20} />, label: "Notificaciones", sub: "Alertas de pedidos y promos" },
    { icon: <CreditCard size={20} />, label: "Métodos de Pago", sub: "Visa •••• 4242" },
    { icon: <Shield size={20} />, label: "Seguridad", sub: "Contraseña y privacidad" },
    { icon: <Settings size={20} />, label: "Preferencias", sub: "Idioma y tema" },
  ];

  return (
    <div className="bg-background min-h-screen pb-24">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-12">
          <button 
            onClick={onBack}
            className="p-3 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-headline font-black text-on-surface tracking-tight">Mi Perfil</h1>
            <p className="text-on-surface-variant font-medium">Gestiona tu cuenta y direcciones</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* User Info Card */}
          <div className="md:col-span-4">
            <div className="bg-surface-container-lowest rounded-3xl p-8 text-center border border-outline-variant/20 shadow-sm">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6 relative">
                <User size={48} />
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-on-primary rounded-full flex items-center justify-center border-4 border-surface-container-lowest shadow-lg">
                  <Plus size={16} />
                </button>
              </div>
              <h2 className="text-xl font-bold text-on-surface mb-1">{user?.displayName || "Usuario Vallenato"}</h2>
              <p className="text-sm text-on-surface-variant mb-6">{user?.email}</p>
              <button 
                onClick={onLogout}
                className="w-full py-3 rounded-2xl border-2 border-error/20 text-error font-bold flex items-center justify-center gap-2 hover:bg-error/5 transition-all"
              >
                <LogOut size={18} />
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Settings & Addresses */}
          <div className="md:col-span-8 space-y-8">
            {/* Addresses Section */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black font-headline text-on-surface uppercase tracking-widest">Mis Direcciones</h3>
                <button className="text-primary font-bold text-sm flex items-center gap-1">
                  <Plus size={16} /> Añadir Nueva
                </button>
              </div>
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-surface-container-low p-6 rounded-2xl flex justify-between items-start group">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-on-surface">{addr.label}</h4>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full">Principal</span>
                          )}
                        </div>
                        <p className="text-sm text-on-surface-variant leading-relaxed">{addr.address}</p>
                      </div>
                    </div>
                    <button className="text-on-surface-variant/30 hover:text-error transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Menu Section */}
            <section>
              <h3 className="text-lg font-black font-headline text-on-surface uppercase tracking-widest mb-4">Ajustes</h3>
              <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 overflow-hidden">
                {menuItems.map((item, i) => (
                  <button 
                    key={i}
                    className={`w-full p-6 flex items-center justify-between hover:bg-surface-container-low transition-all ${i !== menuItems.length - 1 ? 'border-b border-outline-variant/10' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-on-surface-variant">
                        {item.icon}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-on-surface">{item.label}</p>
                        <p className="text-xs text-on-surface-variant">{item.sub}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-on-surface-variant/30" />
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

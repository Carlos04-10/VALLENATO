import { motion, AnimatePresence } from "motion/react";
import { MapPin, CreditCard, Banknote, Check, ChevronRight, ArrowRight, Clock, Utensils, Bike, PackageCheck, Loader2, CheckCircle2, ArrowLeft, PartyPopper } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { createOrder, validatePromoCode } from "../services/dataService";
import confetti from "canvas-confetti";

interface CheckoutViewProps {
  onBack: () => void;
  onOrderPlaced: () => void;
}

export default function CheckoutView({ onBack, onOrderPlaced }: CheckoutViewProps) {
  const { items, subtotal, deliveryFee, serviceFee, total, clearCart, restaurantId, restaurantName } = useCart();
  const { user } = useAuth();
  const [isPlacing, setIsPlacing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [address, setAddress] = useState("Carrera 9 #12-45, Barrio Novalito, Valledupar");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discount: number} | null>(null);
  const [promoError, setPromoError] = useState("");

  const finalTotal = appliedPromo ? total * (1 - appliedPromo.discount) : total;
  const discountAmount = appliedPromo ? total * appliedPromo.discount : 0;

  const handleApplyPromo = async () => {
    setPromoError("");
    const promo = await validatePromoCode(promoCode);
    if (promo) {
      if (promo.minOrder && subtotal < promo.minOrder) {
        setPromoError(`Pedido mínimo de $${promo.minOrder.toLocaleString()} para este código.`);
        return;
      }
      setAppliedPromo({ code: promo.code, discount: promo.discount });
      setPromoCode("");
    } else {
      setPromoError("Código no válido.");
    }
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 200 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      alert("Por favor, inicia sesión para realizar un pedido.");
      return;
    }

    if (!restaurantId || !restaurantName) {
      alert("Tu carrito está vacío o falta información del restaurante.");
      return;
    }

    setIsPlacing(true);
    try {
      await createOrder({
        customerUid: user.uid,
        restaurantId: restaurantId,
        restaurantName: restaurantName,
        items: items,
        total: finalTotal,
        status: 'pending',
        deliveryAddress: address,
        discount: discountAmount,
        promoCode: appliedPromo?.code
      });

      setIsSuccess(true);
      triggerConfetti();
      
      setTimeout(() => {
        clearCart();
        onOrderPlaced();
      }, 4000);
    } catch (error) {
      console.error("Error placing order:", error);
      alert("No se pudo realizar el pedido. Por favor, intenta de nuevo.");
    } finally {
      setIsPlacing(false);
    }
  };

  const journeySteps = [
    { label: "CONFIRMADO", icon: <Check size={18} />, active: true, completed: true },
    { label: "PREPARANDO", icon: <Utensils size={18} />, active: false, completed: false },
    { label: "EN CAMINO", icon: <Bike size={18} />, active: false, completed: false },
    { label: "ENTREGADO", icon: <PackageCheck size={18} />, active: false, completed: false }
  ];

  return (
    <div className="bg-background min-h-screen pb-20">
      <main className="max-w-screen-2xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-12 flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-90 shadow-sm"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mb-2">Finaliza tu pedido</h1>
            <p className="text-on-surface-variant font-body text-lg">Siente el corazón de Valledupar entregado en tu puerta.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Delivery Address */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-headline font-bold text-on-surface">Dirección de Entrega</h2>
                <button className="text-primary font-bold text-sm hover:underline">Cambiar</button>
              </div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden group"
              >
                <div className="flex gap-6 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div className="space-y-1 flex-grow">
                    <h3 className="font-headline font-bold text-xl text-on-surface">Casa</h3>
                    <input 
                      type="text" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-transparent border-none p-0 text-on-surface-variant font-body leading-relaxed focus:ring-0"
                    />
                    <p className="text-primary font-bold text-sm mt-4 flex items-center gap-2">
                      <Clock size={16} />
                      Entrega estimada: 25-35 mins
                    </p>
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-surface-container-high/30 rounded-full blur-3xl"></div>
              </motion.div>
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="text-2xl font-headline font-bold text-on-surface mb-6">Método de Pago</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex items-center justify-between p-6 rounded-xl border-2 border-primary bg-surface-container-lowest shadow-sm transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                      <CreditCard size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-on-surface">Visa •••• 4242</p>
                      <p className="text-xs text-on-surface-variant">Expira 12/26</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary">
                    <Check size={14} />
                  </div>
                </button>
                <button className="flex items-center gap-4 p-6 rounded-xl border-2 border-transparent bg-surface-container-low hover:bg-surface-container-high transition-all">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                    <Banknote size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-on-surface">Pago en Efectivo</p>
                    <p className="text-xs text-on-surface-variant">Paga al recibir la comida</p>
                  </div>
                </button>
              </div>
            </section>

            {/* Order Journey */}
            <section>
              <h2 className="text-2xl font-headline font-bold text-on-surface mb-8">Estado del Pedido</h2>
              <div className="bg-surface-container-low p-8 rounded-xl">
                <div className="relative flex justify-between">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-0 w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="w-1/4 h-full bg-primary"></div>
                  </div>
                  
                  {journeySteps.map((step, i) => (
                    <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step.completed ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
                        {step.icon}
                      </div>
                      <span className={`text-[10px] font-black tracking-widest uppercase ${step.completed ? "text-on-surface" : "text-on-surface-variant"}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar - Order Summary */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden border border-surface-container-high">
              <div className="bg-surface-container-low p-6">
                <h2 className="text-2xl font-headline font-black text-on-surface">Resumen del Pedido</h2>
                <p className="text-on-surface-variant text-sm font-medium">{restaurantName}</p>
              </div>
              
              <div className="p-6 space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 rounded-xl object-cover shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-on-surface">{item.name}</h4>
                        <span className="font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">Cant: {item.quantity}</p>
                    </div>
                  </div>
                ))}

                <div className="h-px bg-surface-container-high w-full"></div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Subtotal</span>
                    <span className="font-bold text-on-surface">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Envío</span>
                    <span className="font-bold text-on-surface">${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Tarifa de Servicio</span>
                    <span className="font-bold text-on-surface">${serviceFee.toFixed(2)}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-sm text-tertiary font-bold">
                      <span>Descuento ({appliedPromo.code})</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-between items-end">
                  <div>
                    <p className="text-3xl font-headline font-black text-primary">${finalTotal.toFixed(2)}</p>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Incluye IVA</p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePlaceOrder}
                    disabled={isPlacing || items.length === 0}
                    className="bg-primary text-on-primary px-8 py-4 rounded-full font-black flex items-center gap-3 shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all disabled:opacity-50"
                  >
                    {isPlacing ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        Hacer Pedido
                        <ArrowRight size={20} />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isSuccess && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
                >
                  <motion.div 
                    initial={{ scale: 0.5, y: 100, rotate: -10 }}
                    animate={{ scale: 1, y: 0, rotate: 0 }}
                    exit={{ scale: 0.5, y: 100, rotate: 10 }}
                    transition={{ type: "spring", damping: 15, stiffness: 100 }}
                    className="bg-surface-container-lowest rounded-[3rem] p-12 max-w-md w-full text-center shadow-[0_32px_64px_rgba(0,0,0,0.4)] border border-outline-variant/20 relative overflow-hidden"
                  >
                    {/* Decorative Background Circles */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-tertiary/10 rounded-full blur-3xl"></div>

                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="w-28 h-28 bg-primary rounded-full flex items-center justify-center text-on-primary mx-auto mb-8 shadow-xl shadow-primary/30"
                    >
                      <CheckCircle2 size={64} strokeWidth={3} />
                    </motion.div>

                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-4xl font-headline font-black text-on-surface mb-4 tracking-tight"
                    >
                      ¡Pedido Exitoso!
                    </motion.h2>

                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-on-surface-variant font-medium text-lg mb-10 leading-relaxed"
                    >
                      Tu deliciosa comida está siendo preparada con amor. <br/>
                      <span className="text-primary font-bold">¡Valledupar pronto estará en tu mesa!</span>
                    </motion.p>

                    <div className="space-y-4">
                      <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 4, ease: "linear" }}
                          className="h-full bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]"
                        />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant animate-pulse">
                        Redirigiéndote al inicio...
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Promo Code */}
            <div className="space-y-2">
              <div className="bg-surface-container-low p-4 rounded-xl flex gap-3">
                <input 
                  type="text" 
                  placeholder="Código promocional"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-grow bg-surface-container-lowest border-none rounded-full px-6 py-3 text-sm focus:ring-2 focus:ring-primary transition-all"
                />
                <button 
                  onClick={handleApplyPromo}
                  className="bg-on-surface text-surface-bright px-6 py-3 rounded-full font-bold text-sm hover:bg-on-surface-variant transition-colors"
                >
                  Aplicar
                </button>
              </div>
              {promoError && <p className="text-xs text-error font-bold px-4">{promoError}</p>}
              {appliedPromo && <p className="text-xs text-tertiary font-bold px-4">¡Código {appliedPromo.code} aplicado con éxito!</p>}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

import { motion } from "motion/react";
import { Star, Clock, DollarSign, ArrowRight, ShoppingCart, ShoppingBag, Plus, Heart, ChevronRight, Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import { getRestaurantById, getMenuItems, Restaurant, MenuItem } from "../services/dataService";

interface RestaurantDetailProps {
  restaurantId: string;
  onBack: () => void;
  onViewOrder: () => void;
}

export default function RestaurantDetail({ restaurantId, onBack, onViewOrder }: RestaurantDetailProps) {
  const { addItem, totalItems, total } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const resData = await getRestaurantById(restaurantId);
        const itemsData = await getMenuItems(restaurantId);
        setRestaurant(resData);
        setMenuItems(itemsData);
      } catch (err) {
        console.error("Error loading restaurant detail:", err);
        setError("No pudimos cargar el menú. Por favor, intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [restaurantId]);

  const handleAddToCart = (item: any) => {
    if (!restaurant) return;
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
        <p className="text-on-surface-variant font-medium animate-pulse">Cargando menú...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background p-6 text-center">
        <div className="w-20 h-20 bg-error-container/10 rounded-full flex items-center justify-center text-error">
          <AlertTriangle size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">¡Ups! Algo salió mal</h2>
          <p className="text-on-surface-variant max-w-md">{error}</p>
        </div>
        <button 
          onClick={onBack}
          className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Volver
        </button>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-on-surface-variant font-medium">Restaurante no encontrado.</p>
        <button onClick={onBack} className="text-primary font-bold flex items-center gap-2">
          <ArrowLeft size={20} /> Volver a Explorar
        </button>
      </div>
    );
  }

  // Group items by category
  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  return (
    <div className="bg-background min-h-screen pb-32">
      <main className="max-w-screen-2xl mx-auto px-4 md:px-8 py-6">
        
        {/* Hero Restaurant Header */}
        <header className="relative overflow-hidden rounded-xl mb-12">
          <div className="aspect-[16/9] md:aspect-[21/9] w-full relative">
            <img 
              className="w-full h-full object-cover" 
              src={restaurant.image} 
              alt={restaurant.name}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <button 
                  onClick={onBack}
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4 group"
                >
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="font-medium">Volver</span>
                </button>
                <h1 className="text-4xl md:text-6xl font-headline font-extrabold text-background tracking-tighter">{restaurant.name}</h1>
                <div className="flex items-center gap-4 text-background/90 font-medium">
                  <div className="flex items-center gap-1">
                    <Star size={18} fill="#ffc965" className="text-secondary-fixed" />
                    <span>{restaurant.rating} ({restaurant.reviews} Reseñas)</span>
                  </div>
                  <span>•</span>
                  <span>{restaurant.cuisine}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-surface-bright/70 backdrop-blur-xl p-4 rounded-xl flex items-center gap-6 shadow-xl">
                  <div className="text-center px-2">
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Entrega</p>
                    <p className="text-lg font-headline font-bold text-primary">{restaurant.deliveryTime}</p>
                  </div>
                  <div className="h-8 w-px bg-outline-variant/30"></div>
                  <div className="text-center px-2">
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Tarifa</p>
                    <p className="text-lg font-headline font-bold text-primary">{restaurant.deliveryFee === 0 ? "Gratis" : `$${restaurant.deliveryFee}`}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Category Navigation */}
          <aside className="lg:col-span-3 space-y-8">
            <div className="sticky top-28 space-y-6">
              <div>
                <h3 className="text-on-surface font-headline font-bold text-xl mb-4">Categorías</h3>
                <nav className="flex flex-col gap-2">
                  {categories.map((category, i) => (
                    <a 
                      key={category}
                      href={`#${category}`}
                      className={`flex items-center justify-between px-4 py-3 rounded-full transition-all ${i === 0 ? "bg-primary text-on-primary font-bold shadow-md" : "hover:bg-surface-container-high font-medium text-on-surface-variant"}`}
                    >
                      <span>{category}</span>
                      {i === 0 && <ChevronRight size={16} />}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Promo Card */}
              <div className="bg-secondary-container p-6 rounded-lg relative overflow-hidden group">
                <div className="relative z-10">
                  <h4 className="font-headline font-black text-on-secondary-container text-2xl leading-tight">Vallenato Prime</h4>
                  <p className="text-on-secondary-container/80 text-sm mt-2">Obtén envío gratis en cada pedido con nuestra membresía premium.</p>
                  <button className="mt-4 bg-on-secondary-container text-secondary-container px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform">Únete Ahora</button>
                </div>
                <ShoppingCart size={96} className="absolute -right-4 -bottom-4 text-on-secondary-container/10 rotate-12 group-hover:rotate-0 transition-transform" />
              </div>
            </div>
          </aside>

          {/* Menu Sections */}
          <div className="lg:col-span-9 space-y-16">
            {menuItems.length === 0 ? (
              <div className="text-center py-24 bg-surface-container-lowest rounded-3xl border-2 border-dashed border-outline-variant/30">
                <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center text-on-surface-variant/30 mx-auto mb-6">
                  <ShoppingBag size={40} />
                </div>
                <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Aún no hay platos</h2>
                <p className="text-on-surface-variant mb-8">Este restaurante aún no ha añadido platos deliciosos a su menú.</p>
                <button 
                  onClick={onBack}
                  className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all"
                >
                  Volver a Explorar
                </button>
              </div>
            ) : (
              categories.map((category) => (
                <section key={category} id={category}>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">{category}</h2>
                    <span className="h-1 flex-grow mx-6 bg-surface-container-high rounded-full"></span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {menuItems.filter(item => item.category === category).map((item) => (
                      <motion.div 
                        key={item.id}
                        whileHover={ (item.isAvailable ?? true) ? { y: -4 } : {} }
                        className={`group bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col shadow-sm transition-all duration-300 ${ (item.isAvailable ?? true) ? 'hover:shadow-xl' : 'opacity-60 grayscale-[0.5]' }`}
                      >
                        <div className={`flex flex-col`}>
                          <div className={`relative overflow-hidden h-48`}>
                            <img 
                              className={`w-full h-full object-cover transition-transform duration-700 ${ (item.isAvailable ?? true) ? 'group-hover:scale-110' : '' }`} 
                              src={item.image} 
                              alt={item.name}
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-4 right-4 bg-surface-bright/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
                              {!(item.isAvailable ?? true) && (
                                <span className="text-[10px] font-black uppercase tracking-widest bg-error-container text-error px-2 py-0.5 rounded-full">Agotado</span>
                              )}
                              <span className="text-primary font-bold">${item.price}</span>
                            </div>
                          </div>
                          <div className={`p-6 flex flex-col flex-grow`}>
                            <div className="flex justify-between items-start mb-2">
                              <h3 className={`font-headline font-bold text-on-surface text-xl`}>{item.name}</h3>
                            </div>
                            <p className={`text-on-surface-variant text-sm flex-grow mb-6`}>{item.description}</p>
                            <div className="flex items-center gap-4">
                              <button 
                                onClick={() => (item.isAvailable ?? true) && handleAddToCart(item)}
                                disabled={!(item.isAvailable ?? true)}
                                className={`flex-grow font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${ (item.isAvailable ?? true) ? 'bg-surface-container-low text-primary hover:bg-primary hover:text-on-primary' : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed' }`}
                              >
                                { (item.isAvailable ?? true) ? (
                                  <>
                                    <ShoppingCart size={18} />
                                    Añadir al Carrito
                                  </>
                                ) : (
                                  "No Disponible"
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Floating "View Cart" */}
      {totalItems > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-6">
          <motion.button 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onViewOrder}
            className="w-full bg-on-surface/90 backdrop-blur-2xl text-surface-bright py-4 px-8 rounded-full flex items-center justify-between shadow-[0_20px_50px_rgba(75,36,10,0.3)]"
          >
            <div className="flex items-center gap-3">
              <span className="bg-primary px-3 py-1 rounded-full text-xs font-black">{totalItems}</span>
              <span className="font-bold tracking-tight">VER PEDIDO</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-xl">${total.toFixed(2)}</span>
              <ShoppingBag size={24} />
            </div>
          </motion.button>
        </div>
      )}
    </div>
  );
}

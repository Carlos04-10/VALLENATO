import { motion } from "motion/react";
import { Search, Star, Heart, Clock, DollarSign, Plus, ArrowRight, Utensils, Coffee, Pizza, Soup, Salad, SlidersHorizontal, Loader2, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { getRestaurants, Restaurant, seedInitialData } from "../services/dataService";

interface ExploreViewProps {
  onRestaurantClick: (restaurantId: string) => void;
  onBack: () => void;
}

export default function ExploreView({ onRestaurantClick, onBack }: ExploreViewProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let result = restaurants;

    if (searchQuery) {
      result = result.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      result = result.filter(r => r.cuisine === selectedCategory || r.type === selectedCategory);
    }

    setFilteredRestaurants(result);
  }, [searchQuery, selectedCategory, restaurants]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      // First try to get existing restaurants
      let data = await getRestaurants();
      
      // If no restaurants exist, seed them (only for demo)
      if (data.length === 0) {
        await seedInitialData();
        data = await getRestaurants();
      }
      
      setRestaurants(data);
    } catch (err) {
      console.error("Error loading restaurants:", err);
      setError("No pudimos cargar los restaurantes. Por favor, revisa tu conexión.");
    } finally {
      setLoading(false);
    }
  }

  const categories = [
    { name: "Comida Rápida", icon: <Pizza size={24} />, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400" },
    { name: "Comida Típica", icon: <Soup size={24} />, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=400" },
    { name: "Bebidas", icon: <Coffee size={24} />, image: "https://images.unsplash.com/photo-1544145945-f904253d0c7b?auto=format&fit=crop&q=80&w=400" },
    { name: "Panadería", icon: <Utensils size={24} />, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400" },
    { name: "Saludable", icon: <Salad size={24} />, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
        <p className="text-on-surface-variant font-medium animate-pulse">Buscando joyas locales...</p>
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
          onClick={loadData}
          className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-all"
        >
          Intentar de Nuevo
        </button>
      </div>
    );
  }

  const nearbyRestaurants = [
    {
      name: "El Portal Del Sabor",
      type: "Traditional",
      rating: "4.9",
      reviews: "120+",
      time: "20-30 min",
      price: "$$",
      distance: "3.2 km",
      promo: "Free Delivery",
      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600",
      favorite: true
    },
    {
      name: "Carbon & Leña",
      type: "Grill",
      rating: "4.7",
      reviews: "80+",
      time: "35-45 min",
      price: "$$$",
      distance: "1.5 km",
      promo: "$2.500 COP Delivery",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600",
      favorite: false,
      offset: true
    },
    {
      name: "Vallenato Burger",
      type: "Fast Food",
      rating: "4.5",
      reviews: "210+",
      time: "15-25 min",
      price: "$$",
      distance: "2.1 km",
      promo: "Promo Active",
      image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=600",
      favorite: false
    },
    {
      name: "La Panera Artizana",
      type: "Bakery",
      rating: "4.8",
      reviews: "45+",
      time: "10-15 min",
      price: "$",
      distance: "0.8 km",
      promo: "Free Delivery",
      image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600",
      favorite: false,
      isNew: true,
      offset: true
    }
  ];

  return (
    <div className="bg-background min-h-screen pb-24 md:pb-0">
      <main className="max-w-screen-2xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8 group"
        >
          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all">
            <ArrowRight size={20} className="rotate-180" />
          </div>
          <span className="font-bold">Volver al Inicio</span>
        </button>
        
        {/* Hero Section: Editorial Style */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-8 relative rounded-xl overflow-hidden min-h-[400px] flex items-end p-8 md:p-12 group cursor-pointer"
          >
            <img 
              alt="Comida Deliciosa" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="relative z-10 max-w-lg">
              <span className="inline-block px-4 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold mb-4 uppercase tracking-widest">Recomendado</span>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4 font-headline">El Alma de Valledupar en Cada Bocado.</h1>
              <p className="text-white/80 text-lg font-body mb-6">Descubre los sabores locales más auténticos entregados en tu puerta.</p>
              <button className="bg-primary hover:bg-primary-dim text-on-primary px-8 py-4 rounded-full font-bold transition-all shadow-lg active:scale-95">Explorar Joyas Locales</button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-4 bg-surface-container-highest rounded-xl p-8 flex flex-col justify-center relative overflow-hidden"
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2 font-headline">¡Envío Gratis!</h3>
              <p className="text-on-surface-variant mb-6">En tus primeros 3 pedidos superiores a $20.000 COP.</p>
              <div className="flex -space-x-4 mb-8">
                {[1, 2, 3].map((i) => (
                  <img 
                    key={i}
                    alt="Usuario" 
                    className="w-12 h-12 rounded-full border-4 border-surface-container-highest object-cover" 
                    src={`https://picsum.photos/seed/promo${i}/100/100`}
                    referrerPolicy="no-referrer"
                  />
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-surface-container-highest bg-primary flex items-center justify-center text-white text-xs font-bold">+2k</div>
              </div>
              <button className="text-primary font-bold flex items-center gap-2 group">
                Reclama tu Bono
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <Utensils size={192} className="text-on-surface" />
            </div>
          </motion.div>
        </section>

        {/* Category Filters */}
        <section className="mb-16">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack} 
                className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors active:scale-90"
              >
                <ArrowRight size={20} className="rotate-180" />
              </button>
              <div>
                <h2 className="text-3xl font-bold tracking-tight font-headline">Explora por Sabores</h2>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
              <input 
                type="text"
                placeholder="Busca tu restaurante favorito..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-full pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2">
            <motion.button 
              whileHover={{ y: -4 }}
              onClick={() => setSelectedCategory(null)}
              className={`flex-none group relative w-48 h-64 rounded-xl overflow-hidden shadow-sm border-4 transition-all ${!selectedCategory ? 'border-primary' : 'border-transparent'}`}
            >
              <div className="absolute inset-0 bg-surface-container-highest flex flex-col items-center justify-center gap-4">
                <Utensils size={48} className="text-primary" />
                <span className="font-bold text-lg font-headline text-on-surface">Todos</span>
              </div>
            </motion.button>

            {categories.map((cat, i) => (
              <motion.button 
                key={i}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedCategory(cat.name === "Comida Rápida" ? "Fast Food" : cat.name === "Comida Típica" ? "Tradicional" : cat.name)}
                className={`flex-none group relative w-48 h-64 rounded-xl overflow-hidden shadow-sm border-4 transition-all ${selectedCategory === (cat.name === "Comida Rápida" ? "Fast Food" : cat.name === "Comida Típica" ? "Tradicional" : cat.name) ? 'border-primary' : 'border-transparent'}`}
              >
                <img 
                  alt={cat.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  src={cat.image}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                  <span className="text-white font-bold text-lg font-headline">{cat.name}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Recommended For You: Bento Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-8 font-headline">Recomendado para Ti</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Item Large */}
            <motion.div 
              whileHover={{ y: -4 }}
              onClick={onRestaurantClick}
              className="md:col-span-2 md:row-span-2 bg-surface-container-lowest rounded-xl p-2 shadow-sm group cursor-pointer"
            >
              <div className="relative h-96 w-full rounded-lg overflow-hidden">
                <img 
                  alt="Recomendado" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary flex items-center gap-1">
                  <Star size={14} fill="currentColor" />
                  Mejor Calificado
                </div>
              </div>
              <div className="p-6 flex justify-between items-end">
                <div>
                  <h3 className="text-2xl font-bold text-on-surface mb-1 font-headline">Parrilla La Estancia</h3>
                  <p className="text-on-surface-variant font-body">Premium Steaks • 25-35 min</p>
                </div>
                <button className="bg-primary-container text-on-primary-container w-12 h-12 rounded-full flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all active:scale-90">
                  <Plus size={24} />
                </button>
              </div>
            </motion.div>

            {/* Bento Item Small 1 */}
            <motion.div 
              whileHover={{ y: -4 }}
              onClick={onRestaurantClick}
              className="bg-surface-container-lowest rounded-xl p-2 shadow-sm group cursor-pointer"
            >
              <div className="relative h-48 w-full rounded-lg overflow-hidden">
                <img 
                  alt="Bowl" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4">
                <h4 className="font-bold text-lg mb-1 font-headline">Meso Healthy Bar</h4>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="flex items-center text-primary font-bold"><Star size={14} fill="currentColor" className="mr-1" /> 4.8</span>
                  <span>•</span>
                  <span>15-20 min</span>
                </div>
              </div>
            </motion.div>

            {/* Bento Item Small 2 */}
            <motion.div 
              whileHover={{ y: -4 }}
              onClick={onRestaurantClick}
              className="bg-surface-container-lowest rounded-xl p-2 shadow-sm group cursor-pointer"
            >
              <div className="relative h-48 w-full rounded-lg overflow-hidden">
                <img 
                  alt="Sushi" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=600"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4">
                <h4 className="font-bold text-lg mb-1 font-headline">Sushi Vallenato</h4>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="flex items-center text-primary font-bold"><Star size={14} fill="currentColor" className="mr-1" /> 4.6</span>
                  <span>•</span>
                  <span>40-50 min</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Nearby Restaurants: Asymmetric Grid */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight font-headline">Restaurantes Cercanos</h2>
              <p className="text-on-surface-variant font-body">Entrega rápida a tu ubicación actual</p>
            </div>
            <button className="bg-surface-container-high px-6 py-2 rounded-full text-on-surface-variant font-bold text-sm flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
              <SlidersHorizontal size={18} />
              Filtros
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredRestaurants.map((res, i) => (
              <motion.div 
                key={res.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => onRestaurantClick(res.id)}
                className={`flex flex-col group cursor-pointer`}
              >
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-4 shadow-sm cursor-pointer">
                  <img 
                    alt={res.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    src={res.image}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur shadow-sm p-2 rounded-full hover:scale-110 transition-transform">
                    <Heart size={20} className="text-on-surface-variant" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/70 backdrop-blur-md rounded-lg p-3 flex justify-between items-center text-xs font-bold uppercase tracking-tight">
                      <span className="text-primary">{res.promo || "Envío Gratis"}</span>
                      <span className="text-on-surface-variant">{res.distance || "2.0 km"}</span>
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors font-headline">{res.name}</h3>
                <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-2">
                  <span>{res.cuisine}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-primary font-bold">
                    <Star size={14} fill="currentColor" /> {res.rating}
                  </span>
                  <span>({res.reviews})</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-on-surface-variant">
                  <span className="flex items-center gap-1"><Clock size={14} /> {res.deliveryTime}</span>
                  <span className="flex items-center gap-1"><DollarSign size={14} /> {res.deliveryFee === 0 ? "Gratis" : `$${res.deliveryFee}`}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl shadow-[0_-12px_24px_rgba(75,36,10,0.06)] px-4 pb-6 pt-3 flex justify-around items-center">
        <button className="flex flex-col items-center gap-1 text-primary font-bold">
          <Utensils size={24} />
          <span className="text-[10px] uppercase tracking-tighter">Explorar</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-on-surface-variant">
          <Search size={24} />
          <span className="text-[10px] uppercase tracking-tighter">Buscar</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-on-surface-variant">
          <Star size={24} />
          <span className="text-[10px] uppercase tracking-tighter">Pedidos</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-on-surface-variant">
          <Heart size={24} />
          <span className="text-[10px] uppercase tracking-tighter">Perfil</span>
        </button>
      </nav>
    </div>
  );
}

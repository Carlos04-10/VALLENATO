import { motion, AnimatePresence } from "motion/react";
import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  Eye, 
  Bell, 
  Calendar, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  AlertTriangle, 
  CloudOff, 
  UserRoundSearch, 
  ArrowRight, 
  Star,
  Megaphone,
  Headset,
  DollarSign,
  Plus,
  X,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { 
  createRestaurant, 
  getRestaurants, 
  Restaurant, 
  createMenuItem, 
  getMenuItems, 
  MenuItem, 
  updateRestaurant, 
  deleteRestaurant, 
  updateMenuItem, 
  deleteMenuItem,
  updateOrder,
  Order
} from "../services/dataService";
import { useAuth } from "../context/AuthContext";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

interface AdminPanelProps {
  onViewLiveStore: () => void;
}

export default function AdminPanel({ onViewLiveStore }: AdminPanelProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Panel");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

  // Menu Management State
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isAddingMenuItem, setIsAddingMenuItem] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [isUpdatingOrderStatus, setIsUpdatingOrderStatus] = useState<string | null>(null);
  const [menuFormData, setMenuFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "Platos Principales",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400"
  });

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    cuisine: "",
    description: "",
    deliveryTime: "20-30 min",
    deliveryFee: 0,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600",
    rating: 5.0,
    reviews: "0",
    isOpen: true,
    promo: "Nuevo Restaurante"
  });

  useEffect(() => {
    loadRestaurants();
    
    // Subscribe to all orders for the admin
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
    });

    return () => unsubscribe();
  }, []);

  async function loadRestaurants() {
    setLoading(true);
    const data = await getRestaurants();
    setRestaurants(data);
    setLoading(false);
  }

  const handleOpenMenu = async (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsMenuModalOpen(true);
    const items = await getMenuItems(restaurant.id);
    setMenuItems(items);
  };

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) return;

    setIsAddingMenuItem(true);
    try {
      if (editingMenuItem) {
        await updateMenuItem(editingMenuItem.id, {
          ...menuFormData,
          price: Number(menuFormData.price)
        });
      } else {
        await createMenuItem({
          ...menuFormData,
          restaurantId: selectedRestaurant.id,
          price: Number(menuFormData.price)
        });
      }
      
      setEditingMenuItem(null);
      setMenuFormData({
        name: "",
        description: "",
        price: 0,
        category: "Platos Principales",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400"
      });
      const items = await getMenuItems(selectedRestaurant.id);
      setMenuItems(items);
    } catch (error) {
      console.error("Error saving menu item:", error);
    } finally {
      setIsAddingMenuItem(false);
    }
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item);
    setMenuFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image
    });
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!window.confirm("¿Eliminar este plato?")) return;
    try {
      await deleteMenuItem(id);
      setMenuItems(menuItems.filter(i => i.id !== id));
    } catch (error) {
      console.error("Error deleting menu item:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      if (editingRestaurant) {
        await updateRestaurant(editingRestaurant.id, {
          ...formData,
          rating: Number(formData.rating),
          deliveryFee: Number(formData.deliveryFee)
        });
      } else {
        await createRestaurant({
          ...formData,
          ownerUid: user.uid,
          rating: Number(formData.rating),
          deliveryFee: Number(formData.deliveryFee)
        });
      }
      
      setIsModalOpen(false);
      setEditingRestaurant(null);
      setFormData({
        name: "",
        cuisine: "",
        description: "",
        deliveryTime: "20-30 min",
        deliveryFee: 0,
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600",
        rating: 5.0,
        reviews: "0",
        isOpen: true,
        promo: "Nuevo Restaurante"
      });
      loadRestaurants();
    } catch (error) {
      console.error("Error saving restaurant:", error);
      alert("No se pudo guardar el restaurante.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRestaurant = (res: Restaurant) => {
    setEditingRestaurant(res);
    setFormData({
      name: res.name,
      cuisine: res.cuisine,
      description: res.description,
      deliveryTime: res.deliveryTime,
      deliveryFee: res.deliveryFee,
      image: res.image,
      rating: res.rating,
      reviews: res.reviews,
      isOpen: res.isOpen,
      promo: res.promo || ""
    });
    setIsModalOpen(true);
  };

  const handleDeleteRestaurant = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este restaurante?")) return;
    try {
      await deleteRestaurant(id);
      loadRestaurants();
    } catch (error) {
      console.error("Error deleting restaurant:", error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setIsUpdatingOrderStatus(orderId);
    try {
      await updateOrder(orderId, { status: newStatus });
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setIsUpdatingOrderStatus(null);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex relative overflow-hidden">
      {/* Back Button Floating */}
      <button 
        onClick={onViewLiveStore}
        className="fixed top-6 left-6 z-[60] w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all md:hidden"
      >
        <ArrowRight size={24} className="rotate-180" />
      </button>

      {/* Background Decorative Texture */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-primary-container/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] bg-surface-dim/30 rounded-full blur-[100px]"></div>
      </div>

      {/* Side Navigation */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col py-6 z-50 border-r border-outline-variant/10">
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
            <UtensilsCrossed size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-on-surface">Admin Vallenato</h2>
            <p className="text-xs text-on-surface-variant opacity-70">Gestión de Plataforma</p>
          </div>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1">
          {[
            { label: "Panel", icon: <LayoutDashboard size={20} /> },
            { label: "Restaurantes", icon: <UtensilsCrossed size={20} /> },
            { label: "Pedidos", icon: <ClipboardList size={20} /> },
            { label: "Análisis", icon: <BarChart3 size={20} /> },
            { label: "Ajustes", icon: <Settings size={20} /> }
          ].map((item, i) => (
            <button 
              key={i}
              onClick={() => setActiveTab(item.label)}
              className={`mx-2 px-4 py-3 flex items-center gap-3 font-medium transition-all duration-300 rounded-full ${activeTab === item.label ? "bg-surface-container-highest text-on-surface" : "text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1"}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 mt-auto space-y-2">
          <button 
            onClick={onViewLiveStore}
            className="w-full bg-surface-container-highest text-on-surface py-3 rounded-full font-bold hover:bg-surface-dim transition-colors active:scale-95 flex items-center justify-center gap-2"
          >
            <ArrowRight size={18} className="rotate-180" />
            Volver a la Tienda
          </button>
          <button 
            onClick={onViewLiveStore}
            className="w-full bg-primary text-on-primary py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary-dim transition-colors active:scale-95"
          >
            Ver Tienda en Vivo
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8 min-h-screen flex-1 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black font-headline text-on-surface tracking-tight mb-2">Admin Vallenato Eats</h1>
            <p className="text-on-surface-variant font-medium">Resumen de Rendimiento: <span className="text-tertiary">Sistema en Vivo</span></p>
          </div>
          <div className="flex gap-4">
            <div className="bg-surface-container-low px-6 py-3 rounded-2xl flex items-center gap-3 border border-surface-container-high">
              <Calendar size={20} className="text-primary" />
              <span className="font-semibold text-on-surface-variant">Oct 12 - Oct 19, 2023</span>
            </div>
            <button className="w-12 h-12 bg-surface-container-highest rounded-full flex items-center justify-center hover:bg-surface-dim transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Bento Grid Analytics */}
        {activeTab === "Panel" && (
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {/* Large Revenue Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="md:col-span-2 bg-primary rounded-2xl p-8 flex flex-col justify-between text-on-primary relative overflow-hidden shadow-xl shadow-primary/20"
            >
              <div className="relative z-10">
                <p className="text-sm font-medium opacity-80 mb-1">Ingresos Netos Totales</p>
                <h3 className="text-5xl font-black font-headline tracking-tighter">
                  ${orders.reduce((sum, o) => sum + o.total, 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </h3>
                <div className="mt-4 flex items-center gap-2 bg-on-primary/10 w-fit px-3 py-1 rounded-full text-xs">
                  <TrendingUp size={14} />
                  <span>{orders.length} pedidos procesados hasta ahora</span>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
                <DollarSign size={192} />
              </div>
            </motion.div>

            {/* Active Users / Restaurants */}
            <div className="bg-surface-container-highest rounded-2xl p-6 flex flex-col justify-center border border-surface-container-high">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                  <UtensilsCrossed size={20} />
                </div>
                <span className="font-bold text-on-surface">Restaurantes</span>
              </div>
              <h4 className="text-3xl font-black font-headline text-on-surface">{restaurants.length}</h4>
              <div className="h-2 w-full bg-surface-container mt-4 rounded-full overflow-hidden">
                <div className="h-full bg-secondary-fixed" style={{ width: `${Math.min(100, (restaurants.length / 20) * 100)}%` }}></div>
              </div>
              <p className="text-xs text-on-surface-variant mt-2">{restaurants.filter(r => r.isOpen).length} abiertos actualmente</p>
            </div>

            {/* Average Order Value */}
            <div className="bg-surface-container-low rounded-2xl p-6 flex flex-col justify-center border-2 border-primary-container/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <ShoppingBag size={20} />
                </div>
                <span className="font-bold text-on-surface">Pedido Promedio</span>
              </div>
              <h4 className="text-3xl font-black font-headline text-on-surface">
                ${orders.length > 0 ? (orders.reduce((sum, o) => sum + o.total, 0) / orders.length).toFixed(2) : "0.00"}
              </h4>
              <p className="text-xs text-on-surface-variant mt-2 flex items-center gap-1">
                <Users size={14} className="text-tertiary" />
                {new Set(orders.map(o => o.customerUid)).size} clientes únicos
              </p>
            </div>
          </section>
        )}

        {/* Dynamic Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* System Alerts */}
          {activeTab === "Panel" && (
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-surface-container-highest/50 backdrop-blur-md p-6 rounded-2xl border border-surface-container-high">
                <div className="flex justify-between items-center mb-6">
                  <h5 className="font-bold text-lg flex items-center gap-2">
                    <AlertTriangle size={20} className="text-error" />
                    Alertas Críticas
                  </h5>
                  <span className="bg-error-container text-on-error-container text-[10px] px-2 py-1 rounded-full font-bold">2 NUEVAS</span>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-surface-container-lowest rounded-xl flex items-start gap-3 border border-surface-container-high">
                    <div className="p-2 bg-error-container/20 rounded-lg text-error">
                      <CloudOff size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">Pico de Latencia API</p>
                      <p className="text-xs text-on-surface-variant">Retraso detectado en el endpoint de comercios en Valledupar Norte.</p>
                    </div>
                  </div>
                  <div className="p-4 bg-surface-container-lowest rounded-xl flex items-start gap-3 border border-surface-container-high">
                    <div className="p-2 bg-secondary-container/20 rounded-lg text-secondary">
                      <UserRoundSearch size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">Cola de Verificación</p>
                      <p className="text-xs text-on-surface-variant">12 nuevos restaurantes esperando aprobación de documentos.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-surface-container-low p-6 rounded-2xl border border-surface-container-high">
                <h5 className="font-bold text-lg mb-6">Actividad Reciente</h5>
                <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/30">
                  {[
                    { title: "Menú Actualizado", time: "hace 2 mins • Portal del Sabor", color: "bg-primary" },
                    { title: "Pago Procesado", time: "hace 1 hora • $1,240.00", color: "bg-tertiary" },
                    { title: "Nuevo Usuario", time: "hace 3 horas • Carlos M.", color: "bg-outline" }
                  ].map((act, i) => (
                    <div key={i} className="relative pl-8">
                      <div className={`absolute left-0 top-1 w-4 h-4 rounded-full ${act.color} ring-4 ring-background`}></div>
                      <p className="text-xs font-bold text-on-surface">{act.title}</p>
                      <p className="text-[10px] text-on-surface-variant mb-1">{act.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Management Table */}
          {(activeTab === "Panel" || activeTab === "Restaurantes") && (
            <div className={`${activeTab === "Panel" ? "lg:col-span-2" : "lg:col-span-3"} bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-surface-container-high`}>
            <div className="p-6 flex justify-between items-center bg-surface-container-low/50">
              <div>
                <h5 className="font-bold text-lg text-on-surface">Gestionar Restaurantes</h5>
                <p className="text-xs text-on-surface-variant">Gestión de base de datos en tiempo real</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-primary-dim transition-all active:scale-95"
              >
                <Plus size={18} />
                Añadir Restaurante
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/20 text-on-surface-variant text-[10px] uppercase tracking-widest font-black">
                    <th className="px-6 py-4">Restaurante</th>
                    <th className="px-6 py-4">Cocina</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Calificación</th>
                    <th className="px-6 py-4">Tarifa</th>
                    <th className="px-6 py-4">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="animate-spin text-primary" size={32} />
                          <p className="text-on-surface-variant">Cargando restaurantes...</p>
                        </div>
                      </td>
                    </tr>
                  ) : restaurants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                        No se encontraron restaurantes en la base de datos.
                      </td>
                    </tr>
                  ) : (
                    restaurants.map((res) => (
                      <tr key={res.id} className="group hover:bg-surface-container-low/30 transition-colors border-t border-surface-container-high">
                        <td className="px-6 py-5 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden shadow-sm">
                            <img className="w-full h-full object-cover" src={res.image} alt={res.name} referrerPolicy="no-referrer" />
                          </div>
                          <span className="text-on-surface font-bold">{res.name}</span>
                        </td>
                        <td className="px-6 py-5 text-on-surface-variant">{res.cuisine}</td>
                        <td className="px-6 py-5">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${res.isOpen ? "bg-tertiary/10 text-tertiary" : "bg-error-container/10 text-error-dim"}`}>
                            {res.isOpen ? "ABIERTO" : "CERRADO"}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1">
                            <Star size={14} fill="#ffb700" className="text-secondary-fixed-dim" />
                            <span>{res.rating}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-bold text-primary">${res.deliveryFee}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => handleOpenMenu(res)}
                              className="flex items-center gap-1 text-primary font-bold hover:underline text-xs"
                            >
                              <ClipboardList size={14} />
                              Menú
                            </button>
                            <button 
                              onClick={() => handleEditRestaurant(res)}
                              className="p-1.5 rounded-full bg-surface-container hover:bg-surface-container-highest transition-colors"
                            >
                              <Settings size={14} className="text-on-surface-variant" />
                            </button>
                            <button 
                              onClick={() => handleDeleteRestaurant(res.id)}
                              className="p-1.5 rounded-full bg-error-container/10 text-error hover:bg-error-container/20 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

        {/* Add Restaurant Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-surface-container-lowest rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
              >
                <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low">
                  <div>
                    <h2 className="text-2xl font-black font-headline text-on-surface">{editingRestaurant ? "Editar Restaurante" : "Añadir Nuevo Restaurante"}</h2>
                    <p className="text-sm text-on-surface-variant">{editingRestaurant ? "Actualiza la información del socio" : "Registra un nuevo socio en la plataforma"}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingRestaurant(null);
                    }}
                    className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface hover:bg-surface-dim transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Nombre del Restaurante</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all"
                        placeholder="ej. Sabor Vallenato"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Tipo de Cocina</label>
                      <input 
                        required
                        type="text" 
                        value={formData.cuisine}
                        onChange={(e) => setFormData({...formData, cuisine: e.target.value})}
                        className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all"
                        placeholder="ej. Tradicional, Parrilla, Comida Rápida"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Descripción</label>
                    <textarea 
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all min-h-[100px]"
                      placeholder="Cuéntanos sobre este restaurante..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Tiempo de Entrega</label>
                      <input 
                        type="text" 
                        value={formData.deliveryTime}
                        onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})}
                        className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all"
                        placeholder="20-30 min"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Tarifa de Entrega ($)</label>
                      <input 
                        type="number" 
                        value={formData.deliveryFee}
                        onChange={(e) => setFormData({...formData, deliveryFee: Number(e.target.value)})}
                        className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Calificación Inicial</label>
                      <input 
                        type="number" 
                        step="0.1"
                        max="5"
                        min="0"
                        value={formData.rating}
                        onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}
                        className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant">URL de Imagen</label>
                    <div className="flex gap-4">
                      <div className="flex-grow relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant">
                          <ImageIcon size={18} />
                        </div>
                        <input 
                          type="url" 
                          value={formData.image}
                          onChange={(e) => setFormData({...formData, image: e.target.value})}
                          className="w-full bg-surface-container-low border-none rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary transition-all"
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-surface-container-low overflow-hidden border border-outline-variant/10">
                        <img src={formData.image} className="w-full h-full object-cover" alt="Vista previa" referrerPolicy="no-referrer" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary text-on-primary py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={24} className="animate-spin" />
                          <span>{editingRestaurant ? "ACTUALIZANDO..." : "REGISTRANDO..."}</span>
                        </>
                      ) : (
                        <>
                          <UtensilsCrossed size={24} />
                          <span>{editingRestaurant ? "GUARDAR CAMBIOS" : "REGISTRAR RESTAURANTE"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Manage Menu Modal */}
        <AnimatePresence>
          {isMenuModalOpen && selectedRestaurant && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-surface-container-lowest rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              >
                <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low">
                  <div>
                    <h2 className="text-2xl font-black font-headline text-on-surface">Menú: {selectedRestaurant.name}</h2>
                    <p className="text-sm text-on-surface-variant">Gestionar platos y precios</p>
                  </div>
                  <button 
                    onClick={() => setIsMenuModalOpen(false)}
                    className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface hover:bg-surface-dim transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 no-scrollbar">
                  {/* Current Menu */}
                  <div>
                    <h3 className="text-lg font-bold mb-4">Platos Actuales</h3>
                    <div className="space-y-4">
                      {menuItems.length === 0 ? (
                        <p className="text-on-surface-variant italic">Aún no hay platos en el menú.</p>
                      ) : (
                        menuItems.map((item) => (
                          <div key={item.id} className="flex gap-4 p-3 bg-surface-container-low rounded-xl border border-outline-variant/10 group relative">
                            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                            <div className="flex-1">
                              <p className="font-bold">{item.name}</p>
                              <p className="text-xs text-on-surface-variant">${item.price} • {item.category}</p>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleEditMenuItem(item)}
                                className="p-1.5 rounded-full bg-surface-container hover:bg-surface-container-highest transition-colors"
                              >
                                <Settings size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteMenuItem(item.id)}
                                className="p-1.5 rounded-full bg-error-container/10 text-error hover:bg-error-container/20 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Add New Item Form */}
                  <div className="bg-surface-container-low/50 p-6 rounded-2xl border border-outline-variant/10">
                    <h3 className="text-lg font-bold mb-4">{editingMenuItem ? "Editar Plato" : "Añadir Nuevo Plato"}</h3>
                    <form onSubmit={handleAddMenuItem} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Nombre del Plato</label>
                        <input 
                          required
                          type="text" 
                          value={menuFormData.name}
                          onChange={(e) => setMenuFormData({...menuFormData, name: e.target.value})}
                          className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary"
                          placeholder="ej. Arroz de Lisa"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Precio ($)</label>
                        <input 
                          required
                          type="number" 
                          value={menuFormData.price}
                          onChange={(e) => setMenuFormData({...menuFormData, price: Number(e.target.value)})}
                          className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Categoría</label>
                        <select 
                          value={menuFormData.category}
                          onChange={(e) => setMenuFormData({...menuFormData, category: e.target.value})}
                          className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary"
                        >
                          <option>Platos Principales</option>
                          <option>Típico</option>
                          <option>Parrilla</option>
                          <option>Bebidas</option>
                          <option>Postres</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Descripción</label>
                        <textarea 
                          value={menuFormData.description}
                          onChange={(e) => setMenuFormData({...menuFormData, description: e.target.value})}
                          className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary min-h-[60px]"
                          placeholder="Breve descripción..."
                        />
                      </div>
                      <div className="flex gap-2">
                        {editingMenuItem && (
                          <button 
                            type="button"
                            onClick={() => {
                              setEditingMenuItem(null);
                              setMenuFormData({
                                name: "",
                                description: "",
                                price: 0,
                                category: "Platos Principales",
                                image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400"
                              });
                            }}
                            className="flex-1 bg-surface-container-highest text-on-surface py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                          >
                            Cancelar
                          </button>
                        )}
                        <button 
                          type="submit"
                          disabled={isAddingMenuItem}
                          className="flex-[2] bg-primary text-on-primary py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-primary-dim transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isAddingMenuItem ? <Loader2 size={18} className="animate-spin" /> : (editingMenuItem ? <Settings size={18} /> : <Plus size={18} />)}
                          {editingMenuItem ? "Guardar Cambios" : "Añadir al Menú"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Quick Settings Bar */}
        <section className="mt-12 flex gap-6 overflow-x-auto pb-4 no-scrollbar">
          {[
            { title: "Estado de la App", subtitle: "Versión Actual: 2.4.1", icon: <div className="w-3 h-3 bg-tertiary rounded-full animate-pulse"></div> },
            { title: "Promo Global", subtitle: "Activa: ALMUERZO-GRATIS", icon: <Megaphone size={20} className="text-primary" /> },
            { title: "Cola de Soporte", subtitle: "5 tickets pendientes", icon: <Headset size={20} className="text-primary" /> }
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -4 }}
              className="min-w-[280px] bg-surface-container-lowest p-6 rounded-2xl flex items-center justify-between border-b-4 border-primary shadow-sm"
            >
              <div className="flex items-center gap-4">
                {typeof item.icon !== 'string' && item.icon}
                <div>
                  <h6 className="font-bold text-on-surface">{item.title}</h6>
                  <p className="text-xs text-on-surface-variant">{item.subtitle}</p>
                </div>
              </div>
              {i === 0 && item.icon}
            </motion.div>
          ))}
        </section>
        {activeTab === "Pedidos" && (
          <section className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black font-headline text-on-surface">Gestión de Pedidos Global</h2>
              <span className="bg-primary-container text-on-primary-container px-4 py-1 rounded-full text-xs font-bold">
                {orders.length} Pedidos Totales
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/20 text-on-surface-variant text-[10px] uppercase tracking-widest font-black">
                    <th className="px-6 py-4">ID Pedido</th>
                    <th className="px-6 py-4">Restaurante</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t border-surface-container-high hover:bg-surface-container-lowest/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">#{order.id?.slice(-6)}</td>
                      <td className="px-6 py-4 font-bold">{order.restaurantName}</td>
                      <td className="px-6 py-4 text-primary font-black">${order.total.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          order.status === 'delivered' ? 'bg-tertiary/10 text-tertiary' : 
                          order.status === 'cancelled' ? 'bg-error-container/10 text-error' : 
                          'bg-primary-container/10 text-primary'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative group/status">
                          <button 
                            disabled={isUpdatingOrderStatus === order.id}
                            className="bg-surface-container-highest text-on-surface px-4 py-2 rounded-full text-xs font-bold hover:bg-surface-dim transition-all flex items-center gap-2"
                          >
                            {isUpdatingOrderStatus === order.id ? <Loader2 size={14} className="animate-spin" /> : "Cambiar Estado"}
                          </button>
                          <div className="absolute bottom-full right-0 mb-2 hidden group-hover/status:block bg-surface-container-highest rounded-xl shadow-xl border border-outline-variant/20 overflow-hidden z-20 min-w-[150px]">
                            {(['pending', 'preparing', 'on_the_way', 'delivered', 'cancelled'] as const).map((status) => (
                              <button
                                key={status}
                                onClick={() => handleUpdateOrderStatus(order.id!, status)}
                                className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-primary hover:text-on-primary transition-colors capitalize"
                              >
                                {status.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "Análisis" && (
          <section className="bg-surface-container-low rounded-[2rem] p-12 border border-outline-variant/10 text-center">
            <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center text-on-surface-variant/30 mx-auto mb-6">
              <BarChart3 size={40} />
            </div>
            <h2 className="text-2xl font-black font-headline text-on-surface mb-2">Análisis de Datos</h2>
            <p className="text-on-surface-variant max-w-md mx-auto">
              Visualiza el crecimiento de tu plataforma con gráficos detallados y reportes de ventas. Esta sección está en desarrollo.
            </p>
          </section>
        )}

        {activeTab === "Ajustes" && (
          <section className="bg-surface-container-low rounded-[2rem] p-12 border border-outline-variant/10 text-center">
            <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center text-on-surface-variant/30 mx-auto mb-6">
              <Settings size={40} />
            </div>
            <h2 className="text-2xl font-black font-headline text-on-surface mb-2">Configuración del Sistema</h2>
            <p className="text-on-surface-variant max-w-md mx-auto">
              Ajusta los parámetros globales de la plataforma, comisiones y roles de usuario. Esta sección está en desarrollo.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

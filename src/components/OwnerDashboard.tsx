import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  Eye, 
  Bell, 
  TrendingUp, 
  CheckCircle2, 
  UserPlus, 
  Zap, 
  Bike, 
  Plus, 
  Edit2,
  Headset,
  ArrowLeft,
  X,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  getRestaurantByOwner, 
  getMenuItems, 
  createMenuItem, 
  Restaurant, 
  MenuItem,
  updateRestaurant,
  subscribeToRestaurantOrders,
  Order,
  updateOrder,
  updateMenuItem,
  deleteMenuItem
} from "../services/dataService";

interface OwnerDashboardProps {
  onViewLiveStore: () => void;
}

export default function OwnerDashboard({ onViewLiveStore }: OwnerDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Panel");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [showNotificationToast, setShowNotificationToast] = useState<{show: boolean, orderId: string} | null>(null);
  const prevOrdersRef = useRef<string[]>([]);
  const isInitialLoad = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Menu Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "Platos Principales",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400"
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (restaurant) {
      const unsubscribe = subscribeToRestaurantOrders(restaurant.id, (newOrders) => {
        const newOrderIds = newOrders.map(o => o.id!).filter(id => id);
        
        if (!isInitialLoad.current) {
          // Find orders that are in newOrders but weren't in prevOrders
          const addedOrders = newOrders.filter(o => o.id && !prevOrdersRef.current.includes(o.id));
          
          if (addedOrders.length > 0) {
            handleNewOrderNotification(addedOrders[0]);
          }
        }
        
        setOrders(newOrders);
        prevOrdersRef.current = newOrderIds;
        isInitialLoad.current = false;
      });
      return () => unsubscribe();
    }
  }, [restaurant]);

  const handleNewOrderNotification = (order: Order) => {
    // 1. Play Sound
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play blocked:", e));
    }

    // 2. Browser Notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("¡Nuevo Pedido!", {
        body: `Pedido #${order.id?.slice(-4)} de $${order.total.toFixed(2)}`,
        icon: "/favicon.ico"
      });
    }

    // 3. In-app Toast
    setShowNotificationToast({ show: true, orderId: order.id! });
    setTimeout(() => setShowNotificationToast(null), 8000);
  };

  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          alert("¡Notificaciones activadas!");
        }
      });
    }
  };

  const simulateImageUpload = () => {
    setIsUploading(true);
    // Simulate a delay
    setTimeout(() => {
      const foodKeywords = ["pizza", "burger", "pasta", "salad", "steak", "sushi", "taco", "dessert", "coffee"];
      const randomKeyword = foodKeywords[Math.floor(Math.random() * foodKeywords.length)];
      const newImage = `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1546069901-ba9599a7e63c' : '1504674900247-0877df9cc836'}?auto=format&fit=crop&q=80&w=800&q=${randomKeyword}`;
      setFormData({ ...formData, image: newImage });
      setIsUploading(false);
    }, 1500);
  };

  async function loadData() {
    setLoading(true);
    try {
      const res = await getRestaurantByOwner(user!.uid);
      if (res) {
        setRestaurant(res);
        const items = await getMenuItems(res.id);
        setMenuItems(items);
      } else {
        console.log("No restaurant found for this owner UID:", user!.uid);
      }
    } catch (error) {
      console.error("Error loading owner dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleStatus = async () => {
    if (!restaurant) return;
    try {
      const newStatus = !restaurant.isOpen;
      await updateRestaurant(restaurant.id, { isOpen: newStatus });
      setRestaurant({ ...restaurant, isOpen: newStatus });
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("No se pudo actualizar el estado del restaurante. Revisa tus permisos.");
    }
  };

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) {
      alert("No se encontró el restaurante para añadir platos.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, {
          ...formData,
          price: Number(formData.price)
        });
      } else {
        await createMenuItem({
          ...formData,
          restaurantId: restaurant.id,
          price: Number(formData.price)
        });
      }
      
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        category: "Platos Principales",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400"
      });
      const items = await getMenuItems(restaurant.id);
      setMenuItems(items);
    } catch (error) {
      console.error("Error saving menu item:", error);
      alert("Error al guardar el plato: " + (error instanceof Error ? error.message : "Error desconocido"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image
    });
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Soft delete: Archive instead of permanent delete
      await updateMenuItem(id, { isArchived: true });
      setMenuItems(prev => prev.map(m => m.id === id ? { ...m, isArchived: true } : m));
    } catch (error) {
      console.error("Error archiving item:", error);
    }
  };

  const handleRestoreItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateMenuItem(id, { isArchived: false });
      setMenuItems(prev => prev.map(m => m.id === id ? { ...m, isArchived: false } : m));
    } catch (error) {
      console.error("Error restoring item:", error);
    }
  };

  const handleToggleItemAvailability = async (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const newStatus = !(item.isAvailable ?? true);
      // Optimistic update
      setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, isAvailable: newStatus } : m));
      
      await updateMenuItem(item.id, { isAvailable: newStatus });
    } catch (error) {
      console.error("Error toggling item availability:", error);
      // Revert on error
      setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, isAvailable: !(item.isAvailable ?? true) } : m));
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setIsUpdatingStatus(orderId);
    try {
      await updateOrder(orderId, { status: newStatus });
      // The subscription will update the UI automatically
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const stats = [
    { 
      label: "Ventas Totales", 
      value: `$${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}`, 
      change: "Ingresos en tiempo real", 
      icon: <TrendingUp size={20} />, 
      color: "text-tertiary" 
    },
    { 
      label: "Pedidos Totales", 
      value: orders.length.toString(), 
      change: `${orders.filter(o => o.status === 'delivered').length} Completados`, 
      icon: <CheckCircle2 size={20} />, 
      color: "text-tertiary" 
    },
    { 
      label: "Nuevos Clientes", 
      value: new Set(orders.map(o => o.customerUid)).size.toString(), 
      change: "Clientes únicos", 
      icon: <UserPlus size={20} />, 
      color: "text-primary" 
    }
  ];

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "Ahora mismo";
    const date = timestamp.toDate();
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffInMinutes < 1) return "Ahora mismo";
    if (diffInMinutes < 60) return `hace ${diffInMinutes} mins`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const liveOrders = [
    {
      id: "8842",
      time: "4 mins ago",
      priority: true,
      status: "Cooking",
      items: [
        { name: "2x Sancocho Trifásico", price: "$34.00" },
        { name: "1x Jugo de Corozo (L)", price: "$5.50" }
      ],
      customerImg: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100"
    },
    {
      id: "8841",
      time: "12 mins ago",
      priority: false,
      status: "Assigned",
      items: [
        { name: "1x Arroz de Lisa Familiar", price: "$22.00" }
      ],
      driver: "Carlos M."
    }
  ];

  return (
    <div className="bg-background text-on-surface min-h-screen flex">
      {/* Side Navigation */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col py-6 z-50 border-r border-outline-variant/10">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-container">
              <UtensilsCrossed size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">{restaurant?.name || "Mi Restaurante"}</h2>
              <p className="text-xs text-on-surface-variant font-medium">Panel de Propietario</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1">
          {[
            { label: "Panel", icon: <LayoutDashboard size={20} /> },
            { label: "Pedidos", icon: <UtensilsCrossed size={20} /> },
            { label: "Gestión de Menú", icon: <ClipboardList size={20} /> },
            { label: "Análisis", icon: <BarChart3 size={20} /> },
            { label: "Ajustes", icon: <Settings size={20} /> }
          ].map((item, i) => (
            <button 
              key={i}
              onClick={() => setActiveTab(item.label)}
              className={`w-[calc(100%-16px)] mx-2 px-4 py-3 flex items-center gap-3 font-medium transition-all duration-300 rounded-full ${activeTab === item.label ? "bg-surface-container-highest text-on-surface" : "text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1"}`}
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
            <ArrowLeft size={18} />
            Volver a la Tienda
          </button>
          <button 
            onClick={onViewLiveStore}
            className="w-full bg-primary text-on-primary py-3 px-4 rounded-full font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 duration-200 shadow-lg shadow-primary/20"
          >
            <Eye size={18} />
            Ver Tienda en Vivo
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8 flex-1">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">Resumen del Panel</h1>
            <p className="text-on-surface-variant font-medium">Bienvenido de nuevo, esto es lo que está pasando hoy.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={requestNotificationPermission}
              className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors text-primary"
              title="Activar Notificaciones"
            >
              <Bell size={20} />
            </button>
            <button 
              onClick={handleToggleStatus}
              className={`rounded-full px-4 py-2 flex items-center gap-2 transition-all active:scale-95 ${restaurant?.isOpen ? "bg-tertiary/10 text-tertiary" : "bg-error-container/10 text-error"}`}
            >
              <span className={`w-2 h-2 rounded-full ${restaurant?.isOpen ? "bg-tertiary animate-pulse" : "bg-error"}`}></span>
              <span className="text-sm font-bold">{restaurant?.isOpen ? "Tienda Abierta" : "Tienda Cerrada"}</span>
            </button>
            <button className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        {activeTab === "Panel" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm relative overflow-hidden group border border-surface-container-high"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-surface-container-low rounded-full transition-transform group-hover:scale-110 duration-500"></div>
                <p className="text-on-surface-variant font-bold text-xs uppercase tracking-widest mb-1 relative z-10">{stat.label}</p>
                <h3 className="text-4xl font-black text-on-surface mb-2 relative z-10">{stat.value}</h3>
                <div className={`flex items-center gap-1 font-bold text-sm relative z-10 ${stat.color}`}>
                  {stat.icon}
                  <span>{stat.change}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Management Table / Content */}
        {!restaurant && !loading ? (
          <div className="bg-surface-container-low p-12 rounded-3xl border-2 border-dashed border-outline-variant/30 text-center">
            <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center text-on-surface-variant/30 mx-auto mb-6">
              <UtensilsCrossed size={40} />
            </div>
            <h2 className="text-2xl font-black font-headline text-on-surface mb-2">No se encontró restaurante</h2>
            <p className="text-on-surface-variant max-w-md mx-auto mb-8">
              Tu cuenta no está vinculada actualmente a un restaurante. Por favor, contacta al administrador para asignar tu restaurante o crea uno en el Panel de Administración.
            </p>
            <button 
              onClick={onViewLiveStore}
              className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all"
            >
              Ir a la Tienda
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Live Orders */}
            {(activeTab === "Panel" || activeTab === "Pedidos") && (
              <section className={activeTab === "Panel" ? "lg:col-span-7" : "lg:col-span-12"}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black flex items-center gap-2 font-headline">
                    <Zap size={24} className="text-primary fill-primary" />
                    Pedidos Entrantes en Vivo
                  </h2>
                  <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold">
                    {orders.filter(o => o.status === 'pending' || o.status === 'preparing').length} Activos
                  </span>
                </div>
                
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="bg-surface-container-lowest p-12 rounded-xl border border-dashed border-outline-variant/30 text-center">
                      <p className="text-on-surface-variant italic">Aún no hay pedidos.</p>
                    </div>
                  ) : (
                    orders.map((order, i) => (
                      <motion.div 
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`bg-surface-container-lowest p-5 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-shadow ${order.status === 'pending' ? "border-primary" : "border-tertiary"}`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-lg">Pedido #{order.id?.slice(-4)}</h4>
                            <p className="text-sm text-on-surface-variant">
                              Realizado {formatTime(order.createdAt)} • <span className="font-bold text-primary capitalize">{order.status === 'pending' ? 'pendiente' : order.status === 'preparing' ? 'preparando' : order.status === 'delivered' ? 'entregado' : order.status}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2 bg-surface-container rounded-full p-1 px-3">
                            <span className="text-xs font-bold text-on-surface">Total:</span>
                            <span className="text-sm font-black text-primary">${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="bg-surface-container-low p-3 rounded-xl mb-4 text-sm space-y-1">
                          {order.items.map((item, j) => (
                            <p key={j} className="flex justify-between">
                              <span>{item.quantity}x {item.name}</span> 
                              <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                            </p>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container">
                              <UserPlus size={14} />
                            </div>
                            <span className="text-xs font-bold text-on-surface-variant">Cliente: {order.customerUid.slice(0, 8)}</span>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant text-sm font-bold hover:bg-surface-container transition-colors"
                            >
                              Detalles
                            </button>
                            <div className="relative group/status">
                              <button 
                                disabled={isUpdatingStatus === order.id}
                                className={`px-6 py-2 rounded-full text-sm font-bold shadow-lg transition-all active:scale-95 bg-primary text-on-primary shadow-primary/20 flex items-center gap-2`}
                              >
                                {isUpdatingStatus === order.id ? <Loader2 size={16} className="animate-spin" /> : "Actualizar Estado"}
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
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </section>
            )}

            {/* Menu Management */}
            {(activeTab === "Panel" || activeTab === "Gestión de Menú") && (
              <section className={activeTab === "Panel" ? "lg:col-span-5" : "lg:col-span-12"}>
                <div className="bg-surface-container-low rounded-2xl p-6 h-full border border-surface-container-high">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-black font-headline">Gestionar Menú</h2>
                      <button 
                        onClick={() => setShowArchived(!showArchived)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${showArchived ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}
                      >
                        {showArchived ? "Ver Activos" : "Ver Archivados"}
                      </button>
                    </div>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 duration-200"
                    >
                      <Plus size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {loading ? (
                      <div className="flex flex-col items-center py-12 gap-2">
                        <Loader2 className="animate-spin text-primary" size={32} />
                        <p className="text-sm text-on-surface-variant">Cargando menú...</p>
                      </div>
                    ) : menuItems.filter(item => showArchived ? item.isArchived : !item.isArchived).length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-on-surface-variant italic">
                          {showArchived ? "No hay platos archivados." : "Aún no hay platos en tu menú."}
                        </p>
                      </div>
                    ) : (
                      menuItems.filter(item => showArchived ? item.isArchived : !item.isArchived).map((item, i) => (
                        <div key={i} className="flex items-center gap-4 group cursor-pointer bg-surface-container-lowest/50 hover:bg-surface-container-lowest p-3 rounded-2xl transition-all border border-transparent hover:border-surface-container-high">
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
                            <img className="w-full h-full object-cover" src={item.image} alt={item.name} referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-bold text-on-surface">{item.name}</h5>
                            <p className="text-xs text-on-surface-variant font-medium">${item.price} • {item.category}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <button 
                                type="button"
                                onClick={(e) => handleToggleItemAvailability(item, e)}
                                className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-surface-container-highest rounded-xl transition-all group/toggle border border-transparent hover:border-outline-variant/20"
                              >
                                <span className="text-[10px] font-black uppercase text-on-surface-variant select-none tracking-widest">
                                  {(item.isAvailable ?? true) ? "Activo" : "Agotado"}
                                </span>
                                <div 
                                  className={`w-10 h-5 rounded-full relative transition-all duration-300 ${(item.isAvailable ?? true) ? "bg-tertiary shadow-inner shadow-black/10" : "bg-surface-container-highest shadow-inner"}`}
                                >
                                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${(item.isAvailable ?? true) ? "right-1" : "left-1"}`}></div>
                                </div>
                              </button>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!item.isArchived ? (
                                <>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditItem(item);
                                    }}
                                    className="p-1.5 rounded-full bg-surface-container hover:bg-surface-container-highest transition-colors"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button 
                                    onClick={(e) => handleDeleteItem(item.id, e)}
                                    className="p-1.5 rounded-full bg-error-container/20 text-error hover:bg-error-container/40 transition-colors"
                                    title="Archivar"
                                  >
                                    <X size={14} />
                                  </button>
                                </>
                              ) : (
                                <button 
                                  onClick={(e) => handleRestoreItem(item.id, e)}
                                  className="px-3 py-1 rounded-full bg-tertiary/10 text-tertiary font-bold text-[10px] uppercase tracking-widest hover:bg-tertiary hover:text-on-tertiary transition-all"
                                >
                                  Restaurar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <button className="w-full mt-8 border-2 border-dashed border-outline-variant rounded-2xl py-4 text-on-surface-variant font-bold text-sm hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
                    <Plus size={18} />
                    Añadir Nueva Categoría
                  </button>
                </div>
              </section>
            )}

            {activeTab === "Análisis" && (
              <section className="lg:col-span-12 bg-surface-container-low rounded-[2rem] p-12 border border-outline-variant/10 text-center">
                <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center text-on-surface-variant/30 mx-auto mb-6">
                  <BarChart3 size={40} />
                </div>
                <h2 className="text-2xl font-black font-headline text-on-surface mb-2">Análisis de Datos</h2>
                <p className="text-on-surface-variant max-w-md mx-auto">
                  Visualiza el crecimiento de tu restaurante con gráficos detallados y reportes de ventas. Esta sección está en desarrollo.
                </p>
              </section>
            )}

            {activeTab === "Ajustes" && (
              <section className="lg:col-span-12 bg-surface-container-low rounded-[2rem] p-12 border border-outline-variant/10 text-center">
                <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center text-on-surface-variant/30 mx-auto mb-6">
                  <Settings size={40} />
                </div>
                <h2 className="text-2xl font-black font-headline text-on-surface mb-2">Configuración del Restaurante</h2>
                <p className="text-on-surface-variant max-w-md mx-auto">
                  Ajusta los parámetros de tu restaurante, horarios y perfil. Esta sección está en desarrollo.
                </p>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Add Menu Item Modal */}
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
              className="relative bg-surface-container-lowest rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low">
                <div>
                  <h2 className="text-xl font-black font-headline text-on-surface">{editingItem ? "Editar Plato" : "Añadir Nuevo Plato"}</h2>
                  <p className="text-xs text-on-surface-variant">{editingItem ? "Modifica los detalles del plato" : "Añadir un nuevo plato a tu menú"}</p>
                </div>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface hover:bg-surface-dim transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddMenuItem} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Nombre del Plato</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary"
                    placeholder="ej. Arroz de Lisa"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Precio ($)</label>
                  <input 
                    required
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Categoría</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary"
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
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary min-h-[60px]"
                    placeholder="Breve descripción..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Imagen del Plato</label>
                  <div className="flex gap-3 items-center">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container-high shrink-0 border border-outline-variant/10 relative">
                      {isUploading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                          <Loader2 className="animate-spin text-primary" size={20} />
                        </div>
                      ) : null}
                      <img src={formData.image} className="w-full h-full object-cover" alt="Vista previa" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-grow space-y-2">
                      <input 
                        type="url" 
                        value={formData.image}
                        onChange={(e) => setFormData({...formData, image: e.target.value})}
                        className="w-full bg-surface-container-low border-none rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-primary"
                        placeholder="URL de la imagen"
                      />
                      <button 
                        type="button"
                        onClick={simulateImageUpload}
                        disabled={isUploading}
                        className="w-full py-2 rounded-xl bg-surface-container-highest text-on-surface font-bold text-[10px] uppercase tracking-widest hover:bg-surface-dim transition-all flex items-center justify-center gap-2"
                      >
                        <ImageIcon size={14} />
                        {isUploading ? "Subiendo..." : "Simular Subida"}
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-primary-dim transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (editingItem ? <Edit2 size={18} /> : <Plus size={18} />)}
                  {editingItem ? "Guardar Cambios" : "Añadir al Menú"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Support Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-primary-fixed text-on-primary-fixed h-16 px-6 rounded-full flex items-center gap-3 shadow-[0_12px_24px_rgba(75,36,10,0.2)] group"
        >
          <div className="relative">
            <Headset size={24} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-inverse-primary animate-pulse"></span>
          </div>
          <span className="font-bold">Soporte en Vivo</span>
        </motion.button>
      </div>

      {/* New Order Toast */}
      <AnimatePresence>
        {showNotificationToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-28 right-8 z-[100] bg-primary text-on-primary p-6 rounded-2xl shadow-2xl flex items-center gap-4 border border-on-primary/20"
          >
            <div className="w-12 h-12 bg-on-primary/20 rounded-full flex items-center justify-center animate-bounce">
              <Zap size={24} />
            </div>
            <div>
              <h4 className="font-black text-lg">¡NUEVO PEDIDO!</h4>
              <p className="text-sm opacity-90">Pedido #{showNotificationToast.orderId.slice(-4)} acaba de llegar.</p>
            </div>
            <button 
              onClick={() => setShowNotificationToast(null)}
              className="ml-4 p-2 hover:bg-on-primary/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-surface-container-lowest rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low">
                <div>
                  <h2 className="text-xl font-black font-headline text-on-surface">Detalles del Pedido #{selectedOrder.id?.slice(-4)}</h2>
                  <p className="text-xs text-on-surface-variant">Información detallada del pedido</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface hover:bg-surface-dim transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-3">Artículos</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{item.quantity}</span>
                          <span className="font-bold text-on-surface">{item.name}</span>
                        </div>
                        <span className="font-bold text-on-surface">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <span className="font-black text-on-surface">Total del Pedido</span>
                  <span className="text-2xl font-black text-primary">${selectedOrder.total.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-surface-container-low rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Estado</p>
                    <p className="font-bold text-on-surface capitalize">{selectedOrder.status}</p>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Fecha</p>
                    <p className="font-bold text-on-surface">{formatTime(selectedOrder.createdAt)}</p>
                  </div>
                </div>

                <div className="p-4 bg-surface-container-low rounded-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">ID del Cliente</p>
                  <p className="font-mono text-xs text-on-surface break-all">{selectedOrder.customerUid}</p>
                </div>
              </div>

              <div className="p-6 bg-surface-container-low border-t border-outline-variant/10">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-full bg-primary text-on-primary py-3 rounded-full font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Clock, MapPin, ChevronRight, Loader2, ArrowLeft, X, CheckCircle2, Package, Bike, Utensils, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserOrders, Order, addReview, updateOrder } from "../services/dataService";

interface OrdersViewProps {
  onBack: () => void;
}

export default function OrdersView({ onBack }: OrdersViewProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewModal, setReviewModal] = useState<{order: Order, rating: number, comment: string} | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [user]);

  async function loadOrders() {
    if (user) {
      setLoading(true);
      const data = await getUserOrders(user.uid);
      setOrders(data);
    }
    setLoading(false);
  }

  const handleReviewSubmit = async () => {
    if (!reviewModal || !user) return;
    
    setIsSubmittingReview(true);
    try {
      await addReview({
        restaurantId: reviewModal.order.restaurantId,
        customerUid: user.uid,
        customerName: user.displayName || "Usuario",
        rating: reviewModal.rating,
        comment: reviewModal.comment
      });
      
      // Mark order as reviewed
      await updateOrder(reviewModal.order.id!, {
        review: {
          rating: reviewModal.rating,
          comment: reviewModal.comment,
          createdAt: new Date()
        }
      });
      
      setReviewModal(null);
      loadOrders();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-tertiary/10 text-tertiary';
      case 'cancelled': return 'bg-error-container/10 text-error-dim';
      case 'pending': return 'bg-primary/10 text-primary';
      case 'preparing': return 'bg-amber-500/10 text-amber-600';
      case 'on_the_way': return 'bg-blue-500/10 text-blue-600';
      default: return 'bg-surface-container-high text-on-surface-variant';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmado';
      case 'preparing': return 'Preparando';
      case 'on_the_way': return 'En camino';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-on-surface-variant font-medium">Buscando tus pedidos...</p>
      </div>
    );
  }

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
            <h1 className="text-4xl font-headline font-black text-on-surface tracking-tight">Mis Pedidos</h1>
            <p className="text-on-surface-variant font-medium">Sigue el rastro de tus antojos</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-24 bg-surface-container-lowest rounded-3xl border-2 border-dashed border-outline-variant/30">
            <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center text-on-surface-variant/30 mx-auto mb-6">
              <ShoppingBag size={40} />
            </div>
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Aún no tienes pedidos</h2>
            <p className="text-on-surface-variant mb-8">Tu historial de pedidos aparecerá aquí cuando realices tu primera compra.</p>
            <button 
              onClick={onBack}
              className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all"
            >
              Empezar a Explorar
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, i) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 hover:shadow-md transition-all group"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <ShoppingBag size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-headline font-bold text-on-surface mb-1">{order.restaurantName}</h3>
                      <p className="text-sm text-on-surface-variant font-medium mb-2">
                        {order.items.length} productos • ${order.total.toFixed(2)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                          <Clock size={12} />
                          {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Recién hecho'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                    <div className="flex flex-col justify-between items-end">
                      <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium mb-4">
                        <MapPin size={16} />
                        <span className="max-w-[200px] truncate">{order.deliveryAddress}</span>
                      </div>
                      
                      <div className="flex gap-3">
                        {order.status === 'delivered' && !order.review && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setReviewModal({ order, rating: 5, comment: "" });
                            }}
                            className="px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs hover:bg-primary hover:text-on-primary transition-all"
                          >
                            Calificar
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all"
                        >
                          Ver Detalles
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Detalles del Pedido */}
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
                  <h2 className="text-xl font-black font-headline text-on-surface">Detalles del Pedido</h2>
                  <p className="text-xs text-on-surface-variant">ID: #{selectedOrder.id?.slice(-8).toUpperCase()}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface hover:bg-surface-dim transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-8">
                {/* Estado del Pedido */}
                <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(selectedOrder.status)}`}>
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Estado</p>
                      <p className="font-bold text-on-surface">{getStatusLabel(selectedOrder.status)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Fecha</p>
                    <p className="font-bold text-on-surface">
                      {selectedOrder.createdAt?.toDate ? selectedOrder.createdAt.toDate().toLocaleDateString() : 'Hoy'}
                    </p>
                  </div>
                </div>

                {/* Productos */}
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant mb-4">Productos</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-container-low overflow-hidden">
                            <img src={item.image} className="w-full h-full object-cover" alt={item.name} referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <p className="font-bold text-on-surface text-sm">{item.name}</p>
                            <p className="text-xs text-on-surface-variant">{item.quantity} unidad(es)</p>
                          </div>
                        </div>
                        <p className="font-bold text-on-surface">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resumen de Pago */}
                <div className="pt-6 border-t border-outline-variant/10 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Subtotal</span>
                    <span className="font-medium text-on-surface">${(selectedOrder.total - 3.70).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Envío</span>
                    <span className="font-medium text-on-surface">$2.50</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Tarifa de Servicio</span>
                    <span className="font-medium text-on-surface">$1.20</span>
                  </div>
                  <div className="flex justify-between text-lg font-black pt-2">
                    <span className="text-on-surface">Total</span>
                    <span className="text-primary">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Dirección */}
                <div className="bg-surface-container-low p-4 rounded-2xl flex gap-3">
                  <MapPin className="text-primary shrink-0" size={20} />
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Dirección de Entrega</p>
                    <p className="text-sm font-medium text-on-surface">{selectedOrder.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-surface-container-low">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Calificación */}
      <AnimatePresence>
        {reviewModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReviewModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-surface-container-lowest rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-8"
            >
              <h2 className="text-2xl font-black font-headline text-on-surface mb-2">Califica tu experiencia</h2>
              <p className="text-on-surface-variant mb-8 font-medium">¿Qué te pareció tu pedido en {reviewModal.order.restaurantName}?</p>
              
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star}
                    onClick={() => setReviewModal({...reviewModal, rating: star})}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${reviewModal.rating >= star ? 'bg-primary text-on-primary scale-110 shadow-lg shadow-primary/20' : 'bg-surface-container-high text-on-surface-variant'}`}
                  >
                    <Star size={24} fill={reviewModal.rating >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>

              <textarea 
                placeholder="Cuéntanos más (opcional)..."
                value={reviewModal.comment}
                onChange={(e) => setReviewModal({...reviewModal, comment: e.target.value})}
                className="w-full bg-surface-container-low border-none rounded-2xl p-4 text-on-surface font-body mb-8 focus:ring-2 focus:ring-primary min-h-[120px]"
              />

              <div className="flex gap-4">
                <button 
                  onClick={() => setReviewModal(null)}
                  className="flex-1 py-4 rounded-2xl font-bold text-on-surface-variant hover:bg-surface-container-low transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleReviewSubmit}
                  disabled={isSubmittingReview}
                  className="flex-1 bg-primary text-on-primary py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmittingReview ? <Loader2 size={20} className="animate-spin" /> : "Enviar Reseña"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

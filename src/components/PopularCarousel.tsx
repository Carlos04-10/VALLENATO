import { ArrowLeft, ArrowRight, Plus, Star } from "lucide-react";
import { motion } from "motion/react";

const popularItems = [
  {
    id: 1,
    name: "Pescado Frito Real",
    restaurant: "El Portal del Sabor",
    time: "25-35 min",
    price: "$32.000",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    name: "La Patrona Burger",
    restaurant: "Rock & Grill",
    time: "15-25 min",
    price: "$24.500",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    name: "Sushi Vallenato Roll",
    restaurant: "Nikkei Kitchen",
    time: "30-45 min",
    price: "$38.900",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 4,
    name: "Zen Healthy Bowl",
    restaurant: "Green Life",
    time: "20-30 min",
    price: "$21.000",
    rating: "4.6",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800"
  }
];

export default function PopularCarousel() {
  return (
    <section className="py-24 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-6 mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black font-headline mb-2">Lo más Popular Hoy</h2>
          <p className="text-on-surface-variant font-body">Lo que todos en Valledupar están pidiendo ahora mismo.</p>
        </div>
        <div className="flex gap-2">
          <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors">
            <ArrowLeft size={20} />
          </button>
          <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors">
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="flex gap-6 overflow-x-auto no-scrollbar px-6 lg:pl-[max(1.5rem,calc((100vw-1536px)/2+1.5rem))]">
        {popularItems.map((item) => (
          <motion.div 
            key={item.id}
            whileHover={{ y: -8 }}
            className="min-w-[320px] bg-surface-container-lowest rounded-lg p-3 shadow-sm group cursor-pointer"
          >
            <div className="rounded-lg overflow-hidden h-48 mb-4">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                src={item.image} 
                alt={item.name}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="px-2 pb-2">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-lg font-headline">{item.name}</h4>
                <span className="bg-surface-container-high px-2 py-1 rounded text-xs font-bold text-primary flex items-center gap-1">
                  {item.rating} <Star size={12} fill="currentColor" />
                </span>
              </div>
              <p className="text-sm text-on-surface-variant font-body mb-4">{item.restaurant} • {item.time}</p>
              <div className="flex justify-between items-center">
                <span className="font-black text-primary">{item.price}</span>
                <button className="p-2 bg-primary-container rounded-full text-on-primary-container hover:bg-primary transition-colors">
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

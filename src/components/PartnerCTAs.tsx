export default function PartnerCTAs() {
  return (
    <section className="py-24 px-6 bg-surface-container">
      <div className="max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Customers */}
          <div className="md:col-span-12 lg:col-span-6 bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col md:flex-row shadow-sm">
            <div className="p-10 flex-1 flex flex-col justify-center">
              <span className="text-primary font-bold text-sm tracking-widest uppercase mb-4">Para Comelones</span>
              <h3 className="text-3xl font-black font-headline mb-4 leading-tight">Pide de tus lugares favoritos.</h3>
              <p className="text-on-surface-variant font-body mb-8">Obtén ofertas exclusivas y las tarifas de envío más bajas de la ciudad.</p>
              <button className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold self-start active:scale-95 transition-all">Regístrate para Comer</button>
            </div>
            <div className="md:w-1/3 min-h-[300px]">
              <img 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1526367790999-0150786486a9?auto=format&fit=crop&q=80&w=800" 
                alt="Cliente feliz"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Restaurants */}
          <div className="md:col-span-6 lg:col-span-3 bg-secondary-container rounded-xl p-8 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-2xl font-black font-headline text-on-secondary-container mb-4">Haz crecer tu restaurante.</h3>
              <p className="text-on-secondary-container/80 font-body mb-6">Asóciate con nosotros y llega a miles de nuevos clientes cada día.</p>
            </div>
            <button className="bg-on-secondary-container text-secondary-container px-6 py-3 rounded-full font-bold active:scale-95 transition-all">Añadir Cocina</button>
          </div>

          {/* Couriers */}
          <div className="md:col-span-6 lg:col-span-3 bg-tertiary text-on-tertiary rounded-xl p-8 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-2xl font-black font-headline mb-4">Reparte con nosotros.</h3>
              <p className="text-on-tertiary/80 font-body mb-6">Sé tu propio jefe. Disfruta de horarios flexibles y ganancias competitivas por entrega.</p>
            </div>
            <button className="bg-tertiary-container text-on-tertiary-container px-6 py-3 rounded-full font-bold active:scale-95 transition-all">Empezar a Repartir</button>
          </div>
        </div>
      </div>
    </section>
  );
}

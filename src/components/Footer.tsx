import { Smartphone, Play, Globe, Share2, ThumbsUp } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-on-surface text-background pt-20 pb-10">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="md:col-span-1">
            <h2 className="text-2xl font-black font-headline mb-6 tracking-tight">Vallenato Eats</h2>
            <p className="text-background/60 font-body leading-relaxed">
              Llevando la riqueza culinaria de la región vallenata a cada puerta con rapidez y calidez.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 font-headline text-lg">Enlaces Rápidos</h4>
            <ul className="space-y-4 text-background/60 font-body">
              <li><a className="hover:text-primary-container transition-colors" href="#">Buscar Restaurantes</a></li>
              <li><a className="hover:text-primary-container transition-colors" href="#">Ofertas y Descuentos</a></li>
              <li><a className="hover:text-primary-container transition-colors" href="#">Categorías Principales</a></li>
              <li><a className="hover:text-primary-container transition-colors" href="#">Tarjetas de Regalo</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 font-headline text-lg">Soporte</h4>
            <ul className="space-y-4 text-background/60 font-body">
              <li><a className="hover:text-primary-container transition-colors" href="#">Centro de Ayuda</a></li>
              <li><a className="hover:text-primary-container transition-colors" href="#">Política de Reembolso</a></li>
              <li><a className="hover:text-primary-container transition-colors" href="#">Términos de Servicio</a></li>
              <li><a className="hover:text-primary-container transition-colors" href="#">Privacidad</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 font-headline text-lg">Descarga la App</h4>
            <div className="space-y-3">
              <button className="w-full bg-surface-container-lowest text-on-surface py-3 px-6 rounded-lg flex items-center gap-3 font-bold hover:bg-surface-container transition-colors">
                <Smartphone size={24} />
                <span>App Store</span>
              </button>
              <button className="w-full bg-surface-container-lowest text-on-surface py-3 px-6 rounded-lg flex items-center gap-3 font-bold hover:bg-surface-container transition-colors">
                <Play size={24} fill="currentColor" />
                <span>Google Play</span>
              </button>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-background/40 text-sm font-body">© 2024 Vallenato Eats. Hecho con pasión en Valledupar.</p>
          <div className="flex gap-6">
            <Globe className="text-background/60 cursor-pointer hover:text-primary-container" size={20} />
            <Share2 className="text-background/60 cursor-pointer hover:text-primary-container" size={20} />
            <ThumbsUp className="text-background/60 cursor-pointer hover:text-primary-container" size={20} />
          </div>
        </div>
      </div>
    </footer>
  );
}

import { motion } from "motion/react";
import { ShoppingCart, User, Search, LogOut, Moon, Sun } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";

interface NavbarProps {
  onLoginClick: () => void;
  onHomeClick: () => void;
  onRestaurantsClick: () => void;
  onDashboardClick: () => void;
  onAdminClick: () => void;
  onOrdersClick: () => void;
  onProfileClick: () => void;
  onCartClick: () => void;
  onThemeToggle: () => void;
  isDarkMode: boolean;
  showSearch?: boolean;
  currentView: string;
}

export default function Navbar({ 
  onLoginClick, 
  onHomeClick, 
  onRestaurantsClick, 
  onDashboardClick, 
  onAdminClick, 
  onOrdersClick, 
  onProfileClick,
  onCartClick, 
  onThemeToggle,
  isDarkMode,
  showSearch, 
  currentView 
}: NavbarProps) {
  const { totalItems } = useCart();
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    onHomeClick();
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-background/80 backdrop-blur-xl shadow-[0_12px_24px_rgba(75,36,10,0.06)]">
      <nav className="flex justify-between items-center px-6 py-4 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-8 flex-1">
          <span 
            onClick={onHomeClick}
            className="text-2xl font-black text-on-surface font-headline tracking-tight cursor-pointer"
          >
            Vallenato Eats
          </span>
          
          {/* Search Bar (Visible in Explore View) */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-xl relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant">
                <Search size={20} />
              </div>
              <input 
                className="w-full h-12 bg-surface-container-low border-none rounded-full pl-12 pr-4 focus:ring-2 focus:ring-primary focus:bg-surface-container-highest transition-all font-body text-on-surface placeholder:text-on-surface-variant/60" 
                placeholder="Search for your favorite cravings..." 
                type="text"
              />
            </div>
          )}

          {!showSearch && (
            <nav className="hidden md:flex gap-6 items-center">
              <button 
                onClick={onHomeClick}
                className={`${currentView === "landing" ? "text-primary font-bold border-b-2 border-primary" : "text-on-surface-variant"} font-body text-sm py-1`}
              >
                Inicio
              </button>
              <button 
                onClick={onRestaurantsClick}
                className={`${(currentView === "explore" || currentView === "restaurantDetail") ? "text-primary font-bold border-b-2 border-primary" : "text-on-surface-variant"} font-body text-sm py-1 hover:bg-surface-container transition-colors px-3 rounded-full`}
              >
                Restaurantes
              </button>
              {user && (
                <button 
                  onClick={onOrdersClick}
                  className={`${currentView === "orders" ? "text-primary font-bold border-b-2 border-primary" : "text-on-surface-variant"} font-body text-sm py-1 hover:bg-surface-container transition-colors px-3 rounded-full`}
                >
                  Mis Pedidos
                </button>
              )}
              <button 
                onClick={onDashboardClick}
                className="text-on-surface-variant font-body text-sm hover:bg-surface-container transition-colors px-3 py-1 rounded-full"
              >
                Panel Propietario
              </button>
              <button 
                onClick={onAdminClick}
                className="text-on-surface-variant font-body text-sm hover:bg-surface-container transition-colors px-3 py-1 rounded-full"
              >
                Admin
              </button>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onThemeToggle}
            className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-all"
            title={isDarkMode ? "Modo Claro" : "Modo Oscuro"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button 
            onClick={onCartClick}
            className="flex items-center justify-center w-12 h-12 rounded-full text-primary hover:bg-surface-container transition-colors active:scale-95 duration-200 relative"
          >
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 bg-primary text-on-primary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {totalItems}
              </span>
            )}
          </button>
          
          {user ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={onProfileClick}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary transition-all"
              >
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=a33700&color=fff`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 text-on-surface-variant hover:text-error transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="flex items-center justify-center w-12 h-12 rounded-full text-primary hover:bg-surface-container transition-colors active:scale-95 duration-200"
            >
              <User size={24} />
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}



/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, lazy, Suspense, useCallback, useMemo } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import PopularCarousel from "./components/PopularCarousel";
import PartnerCTAs from "./components/PartnerCTAs";
import Footer from "./components/Footer";
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";
import { auth } from "./lib/firebase";
import { signOut } from "firebase/auth";
import { usePrefetch } from "./hooks/usePrefetch";
import { getRestaurants } from "./services/dataService";

// Lazy load componentes pesados
const AuthScreen = lazy(() => import("./components/AuthScreen"));
const ExploreView = lazy(() => import("./components/ExploreView"));
const RestaurantDetail = lazy(() => import("./components/RestaurantDetail"));
const CheckoutView = lazy(() => import("./components/CheckoutView"));
const OwnerDashboard = lazy(() => import("./components/OwnerDashboard"));
const AdminPanel = lazy(() => import("./components/AdminPanel"));
const OrdersView = lazy(() => import("./components/OrdersView"));
const ProfileView = lazy(() => import("./components/ProfileView"));

// Loading component para Suspense
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  const [view, setView] = useState<"landing" | "auth" | "explore" | "restaurantDetail" | "checkout" | "ownerDashboard" | "adminPanel" | "orders" | "profile">("landing");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, loading } = useAuth();

  // Memoizar callbacks para evitar re-renders innecesarios
  const handleSetView = useCallback((newView: typeof view) => {
    setView(newView);
  }, []);

  const handleSelectRestaurant = useCallback((id: string) => {
    setSelectedRestaurantId(id);
    setView("restaurantDetail");
  }, []);

  const handleLogout = useCallback(async () => {
    await signOut(auth);
    setView("landing");
  }, []);

  const handleThemeToggle = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // Aplicar tema oscuro
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Prefetch de datos cuando se carga la app
  usePrefetch(async () => {
    try {
      await getRestaurants();
    } catch (err) {
      console.warn('Prefetch failed:', err);
    }
  }, []);

  // Memoizar los props del Navbar para evitar re-renders
  const navbarProps = useMemo(() => ({
    onLoginClick: () => handleSetView("auth"),
    onHomeClick: () => handleSetView("landing"),
    onRestaurantsClick: () => handleSetView("explore"),
    onDashboardClick: () => handleSetView("ownerDashboard"),
    onAdminClick: () => handleSetView("adminPanel"),
    onOrdersClick: () => handleSetView("orders"),
    onProfileClick: () => handleSetView("profile"),
    onCartClick: () => handleSetView("checkout"),
    onThemeToggle: handleThemeToggle,
    isDarkMode,
    showSearch: view === "explore" || view === "restaurantDetail",
    currentView: view,
  }), [view, isDarkMode, handleSetView, handleThemeToggle]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (view === "auth") {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AuthScreen 
          onBack={() => handleSetView("landing")} 
          onSuccess={() => handleSetView("landing")} 
        />
      </Suspense>
    );
  }

  if (view === "ownerDashboard") {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <OwnerDashboard onViewLiveStore={() => handleSetView("landing")} />
      </Suspense>
    );
  }

  if (view === "adminPanel") {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AdminPanel onViewLiveStore={() => handleSetView("landing")} />
      </Suspense>
    );
  }

  if (view === "orders") {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <OrdersView onBack={() => handleSetView("landing")} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar {...navbarProps} />
      <main className="flex-grow">
        {view === "landing" && (
          <>
            <Hero />
            <HowItWorks />
            <PopularCarousel />
            <PartnerCTAs />
          </>
        )}
        {view === "explore" && (
          <Suspense fallback={<LoadingSpinner />}>
            <ExploreView 
              onBack={() => handleSetView("landing")}
              onRestaurantClick={handleSelectRestaurant}
            />
          </Suspense>
        )}
        {view === "restaurantDetail" && selectedRestaurantId && (
          <Suspense fallback={<LoadingSpinner />}>
            <RestaurantDetail 
              restaurantId={selectedRestaurantId}
              onBack={() => handleSetView("explore")} 
              onViewOrder={() => handleSetView("checkout")}
            />
          </Suspense>
        )}
        {view === "checkout" && (
          <Suspense fallback={<LoadingSpinner />}>
            <CheckoutView 
              onBack={() => handleSetView("restaurantDetail")}
              onOrderPlaced={() => handleSetView("orders")}
            />
          </Suspense>
        )}
        {view === "profile" && (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfileView 
              onBack={() => handleSetView("landing")}
              onLogout={handleLogout}
            />
          </Suspense>
        )}
      </main>
      <Footer />
    </div>
  );
}










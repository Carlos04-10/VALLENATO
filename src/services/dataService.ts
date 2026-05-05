import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  setDoc,
  onSnapshot
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  rating: number;
  reviews: string;
  deliveryTime: string;
  deliveryFee: number;
  image: string;
  ownerUid: string;
  isOpen: boolean;
  promo?: string;
  distance?: string;
  type?: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable?: boolean;
  isArchived?: boolean;
}

export interface Order {
  id?: string;
  customerUid: string;
  restaurantId: string;
  restaurantName: string;
  items: any[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';
  createdAt: any;
  deliveryAddress: string;
  review?: {
    rating: number;
    comment: string;
    createdAt: any;
  };
  discount?: number;
  promoCode?: string;
}

export interface Review {
  id?: string;
  restaurantId: string;
  customerUid: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface PromoCode {
  code: string;
  discount: number; // Percentage (e.g., 0.1 for 10%)
  minOrder?: number;
}

// Restaurants
export async function getRestaurants(): Promise<Restaurant[]> {
  const path = "restaurants";
  try {
    const querySnapshot = await getDocs(collection(db, path));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function createRestaurant(restaurantData: Omit<Restaurant, "id">): Promise<string> {
  const path = "restaurants";
  try {
    const docRef = await addDoc(collection(db, path), restaurantData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return "";
  }
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  const path = `restaurants/${id}`;
  try {
    const docSnap = await getDoc(doc(db, "restaurants", id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Restaurant;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function getRestaurantByOwner(ownerUid: string): Promise<Restaurant | null> {
  const path = "restaurants";
  try {
    const q = query(collection(db, path), where("ownerUid", "==", ownerUid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Restaurant;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return null;
  }
}

export async function updateRestaurant(id: string, data: Partial<Restaurant>): Promise<void> {
  const path = `restaurants/${id}`;
  try {
    await setDoc(doc(db, "restaurants", id), data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteRestaurant(id: string): Promise<void> {
  const path = `restaurants/${id}`;
  try {
    // Note: In a real app, you might want to delete menu items too
    const { deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(db, "restaurants", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Menu Items
export async function getMenuItems(restaurantId: string): Promise<MenuItem[]> {
  const path = "menuItems";
  try {
    const q = query(collection(db, path), where("restaurantId", "==", restaurantId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function createMenuItem(itemData: Omit<MenuItem, "id">): Promise<string> {
  const path = "menuItems";
  try {
    const docRef = await addDoc(collection(db, path), {
      ...itemData,
      isAvailable: itemData.isAvailable ?? true
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return "";
  }
}

export async function updateMenuItem(id: string, data: Partial<MenuItem>): Promise<void> {
  const path = `menuItems/${id}`;
  try {
    const { updateDoc } = await import("firebase/firestore");
    await updateDoc(doc(db, "menuItems", id), data as any);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMenuItem(id: string): Promise<void> {
  const path = `menuItems/${id}`;
  try {
    const { deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(db, "menuItems", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Orders
export async function createOrder(orderData: Omit<Order, "id" | "createdAt">): Promise<string> {
  const path = "orders";
  try {
    const docRef = await addDoc(collection(db, path), {
      ...orderData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return "";
  }
}

export function subscribeToRestaurantOrders(restaurantId: string, callback: (orders: Order[]) => void) {
  const path = "orders";
  const q = query(
    collection(db, path),
    where("restaurantId", "==", restaurantId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    callback(orders);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const path = "orders";
  try {
    const q = query(
      collection(db, path), 
      where("customerUid", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function updateOrder(id: string, data: Partial<Order>): Promise<void> {
  const path = `orders/${id}`;
  try {
    await setDoc(doc(db, "orders", id), data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteOrder(id: string): Promise<void> {
  const path = `orders/${id}`;
  try {
    const { deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(db, "orders", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Reviews
export async function addReview(reviewData: Omit<Review, "id" | "createdAt">): Promise<string> {
  const path = "reviews";
  try {
    const docRef = await addDoc(collection(db, path), {
      ...reviewData,
      createdAt: serverTimestamp()
    });
    
    // Update restaurant rating (simplified logic)
    const restaurant = await getRestaurantById(reviewData.restaurantId);
    if (restaurant) {
      const currentRating = restaurant.rating || 0;
      const currentReviewsCount = parseInt(restaurant.reviews) || 0;
      const newRating = ((currentRating * currentReviewsCount) + reviewData.rating) / (currentReviewsCount + 1);
      await updateRestaurant(reviewData.restaurantId, {
        rating: parseFloat(newRating.toFixed(1)),
        reviews: (currentReviewsCount + 1).toString() + "+"
      });
    }
    
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return "";
  }
}

export async function getRestaurantReviews(restaurantId: string): Promise<Review[]> {
  const path = "reviews";
  try {
    const q = query(
      collection(db, path),
      where("restaurantId", "==", restaurantId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// Promo Codes (Static for now, could be in Firestore)
const VALID_PROMOS: PromoCode[] = [
  { code: "VALLEDUPAR", discount: 0.2, minOrder: 30000 },
  { code: "PRIMERAVEZ", discount: 0.15 },
  { code: "VALLENATO", discount: 0.1 }
];

export async function validatePromoCode(code: string): Promise<PromoCode | null> {
  const promo = VALID_PROMOS.find(p => p.code.toUpperCase() === code.toUpperCase());
  return promo || null;
}

// Seeding Data (Helper)
export async function seedInitialData() {
  try {
    const restaurants = [
      {
        name: "El Portal Del Sabor",
        description: "Sabores tradicionales vallenatos con un toque moderno.",
        cuisine: "Tradicional",
        rating: 4.9,
        reviews: "120+",
        deliveryTime: "20-30 min",
        deliveryFee: 0,
        image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600",
        ownerUid: "system",
        isOpen: true,
        promo: "Envío Gratis",
        distance: "3.2 km",
        type: "Tradicional"
      },
      {
        name: "Carbón & Leña",
        description: "La mejor parrilla de la ciudad.",
        cuisine: "Parrilla",
        rating: 4.7,
        reviews: "80+",
        deliveryTime: "35-45 min",
        deliveryFee: 2500,
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600",
        ownerUid: "system",
        isOpen: true,
        promo: "$2.500 COP Envío",
        distance: "1.5 km",
        type: "Parrilla"
      }
    ];

    for (const res of restaurants) {
      const q = query(collection(db, "restaurants"), where("name", "==", res.name));
      const snap = await getDocs(q);
      
      let restaurantId = "";
      if (snap.empty) {
        const docRef = await addDoc(collection(db, "restaurants"), res);
        restaurantId = docRef.id;
      } else {
        restaurantId = snap.docs[0].id;
      }

      // Check if this restaurant has menu items
      const menuQ = query(collection(db, "menuItems"), where("restaurantId", "==", restaurantId));
      const menuSnap = await getDocs(menuQ);

      if (menuSnap.empty) {
        // Add some menu items for each restaurant
        const menuItems = [
          {
            restaurantId: restaurantId,
            name: "Sancocho Trifásico",
            description: "Sopa tradicional con tres tipos de carne.",
            price: 25000,
            image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=400",
            category: "Típico"
          },
          {
            restaurantId: restaurantId,
            name: "Carne Asada",
            description: "Carne de res a la parrilla servida con yuca y ensalada.",
            price: 32000,
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
            category: "Parrilla"
          }
        ];
        
        for (const item of menuItems) {
          await addDoc(collection(db, "menuItems"), item);
        }
      }
    }
  } catch (error) {
    console.warn("Seeding failed (likely permission issue), skipping...", error);
  }
}

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  fetchSupabaseProducts,
  upsertSupabaseProduct,
  deleteSupabaseProduct,
  subscribeToSupabaseProducts,
} from "./supabaseClient.js";

// Image Imports matching the initial shop catalog
import springRollSamosaImg from "./IMG/spring roll & samosa.jpg";
import puffPuffImg from "./IMG/puff puff.jpg";
import chickenSkewersImg from "./IMG/chicken skiwer platter.jpg";
import smallChops100Img from "./IMG/small chops assorted.jpg";
import sc2Img from "./IMG/SC2.jpg";
import meatPieImg from "./IMG/meat pie.jpg";
import chinChinImg from "./IMG/chin chin.jpg";
import birthdayCakeImg from "./IMG/birthday cake.jpg";

export const INITIAL_PRODUCTS = [
  {
    id: "item-1",
    name: "Spring Roll & Samosa Mix (40pc)",
    category: "Small Chops",
    price: 22000,
    image: springRollSamosaImg,
    description: "Golden crispy spring rolls and spicy beef samosas served with sweet chili dip.",
    inStock: true,
  },
  {
    id: "item-2",
    name: "Puff-Puff Platter",
    category: "Small Chops",
    price: 18000,
    image: puffPuffImg,
    description: "Fluffy, golden-brown sweet yeast dough bites fried to perfection.",
    inStock: true,
  },
  {
    id: "item-3",
    name: "Chicken Skewer Platter (30pc)",
    category: "Small Chops",
    price: 26000,
    image: chickenSkewersImg,
    description: "Suya-spiced tender chicken breast cubes grilled with bell peppers and onions.",
    inStock: true,
  },
  {
    id: "item-4",
    name: "Assorted Small Chops (100pc)",
    category: "Small Chops",
    price: 45000,
    image: smallChops100Img,
    description: "Party crowd-pleaser with puff-puff, spring rolls, samosas, and peppered gizzard.",
    inStock: true,
  },
  {
    id: "item-5",
    name: "Jollof Rice Party Tray",
    category: "Platters & Trays",
    price: 35000,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    description: "Signature smoky firewood party jollof rice made with rich tomato-pepper reduction.",
    inStock: true,
  },
  {
    id: "item-6",
    name: "Small Chops Platter (50pc)",
    category: "Platters & Trays",
    price: 42000,
    image: sc2Img,
    description: "Deluxe medium platter packed with assorted Nigerian small chops delicacies.",
    inStock: true,
  },
  {
    id: "item-7",
    name: "Swallow & Soup Combo Tray",
    category: "Platters & Trays",
    price: 38000,
    image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80",
    description: "Rich Egusi or Efo Riro soup loaded with assorted beef, tripe, and dried fish with pounded yam or semo.",
    inStock: true,
  },
  {
    id: "item-8",
    name: "Grilled Fish & Peppered Sauce Tray",
    category: "Platters & Trays",
    price: 48000,
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
    description: "Whole spiced Croaker fish slow-roasted with fiery Lagos pepper sauce and plantain cubes.",
    inStock: true,
  },
  {
    id: "item-9",
    name: "Meat Pie Box (24pc)",
    category: "Pastries & Desserts",
    price: 16000,
    image: meatPieImg,
    description: "Buttery, flaky shortcrust pastry filled with minced beef, potatoes, and savory gravy.",
    inStock: true,
  },
  {
    id: "item-10",
    name: "Chin Chin, Family Pack",
    category: "Pastries & Desserts",
    price: 9000,
    image: chinChinImg,
    description: "Ultra-crunchy sweet artisan chin-chin infused with real nutmeg and condensed milk.",
    inStock: true,
  },
  {
    id: "item-11",
    name: "Birthday Celebration Cake",
    category: "Pastries & Desserts",
    price: 55000,
    image: birthdayCakeImg,
    description: "Whipped buttercream celebration cake custom decorated for birthdays and anniversaries.",
    inStock: true,
  },
  {
    id: "item-12",
    name: "Wedding Cake, 3-Tier",
    category: "Pastries & Desserts",
    price: 120000,
    image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=800&q=80",
    description: "3-tier grand luxury fruit and red velvet wedding cake with edible gold accents.",
    inStock: true,
  },
  {
    id: "item-13",
    name: "Intimate Gathering Package (20 guests)",
    category: "Event Packages",
    price: 180000,
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
    description: "Complete finger food and drinks package tailored for birthdays, bridal showers, or intimate dinners.",
    inStock: true,
  },
  {
    id: "item-14",
    name: "Classic Wedding Package (100 guests)",
    category: "Event Packages",
    price: 850000,
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
    description: "Full cocktail hour small chops, party trays, beverage station, and uniform catering service staff.",
    inStock: true,
  },
  {
    id: "item-15",
    name: "Corporate Lunch Package (50 guests)",
    category: "Event Packages",
    price: 320000,
    image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80",
    description: "Individually packed executive lunch boxes with assorted small chops and fresh fruit salad.",
    inStock: true,
  },
];

const MenuContext = createContext();

export function MenuProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const stored = localStorage.getItem("tph_menu_items");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load menu from localStorage", e);
    }
    return INITIAL_PRODUCTS;
  });

  // Initial load from Supabase & Realtime subscription
  useEffect(() => {
    let isMounted = true;

    fetchSupabaseProducts()
      .then((cloudProducts) => {
        if (!isMounted) return;
        if (cloudProducts && cloudProducts.length > 0) {
          setProducts(cloudProducts);
        } else if (cloudProducts && cloudProducts.length === 0) {
          // Cloud table is fresh and empty: seed initial starter products to Supabase!
          INITIAL_PRODUCTS.forEach((prod) => {
            upsertSupabaseProduct(prod).catch(() => {});
          });
        }
      })
      .catch((err) => console.warn("Supabase products fetch:", err));

    const unsubscribe = subscribeToSupabaseProducts(({ eventType, product, deletedId }) => {
      if (!isMounted) return;
      if (eventType === "INSERT" && product) {
        setProducts((prev) => [product, ...prev.filter((p) => p.id !== product.id)]);
      } else if (eventType === "UPDATE" && product) {
        setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, ...product } : p)));
      } else if (eventType === "DELETE" && deletedId) {
        setProducts((prev) => prev.filter((p) => p.id !== deletedId));
      }
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // Sync products to localStorage on any modification
  useEffect(() => {
    try {
      localStorage.setItem("tph_menu_items", JSON.stringify(products));
    } catch (e) {
      console.error("Failed to save menu to localStorage", e);
    }
  }, [products]);

  // Toggle in-stock status (instantly updates customer store)
  const toggleStock = (productId) => {
    setProducts((prev) => {
      const next = prev.map((item) =>
        item.id === productId ? { ...item, inStock: !item.inStock } : item
      );
      const updated = next.find((p) => p.id === productId);
      if (updated) {
        upsertSupabaseProduct(updated).catch(() => {});
      }
      return next;
    });
  };

  // Edit existing product (price, name, category, description, image)
  const updateProduct = (productId, updatedFields) => {
    setProducts((prev) => {
      const next = prev.map((item) =>
        item.id === productId ? { ...item, ...updatedFields } : item
      );
      const updated = next.find((p) => p.id === productId);
      if (updated) {
        upsertSupabaseProduct(updated).catch(() => {});
      }
      return next;
    });
  };

  // Add brand new platter/dish to catalog
  const addProduct = (newProduct) => {
    const itemToAdd = {
      id: `custom-${Date.now()}`,
      inStock: true,
      category: "Small Chops",
      ...newProduct,
      price: Number(newProduct.price) || 0,
    };
    setProducts((prev) => [itemToAdd, ...prev]);
    upsertSupabaseProduct(itemToAdd).catch(() => {});
    return itemToAdd;
  };

  // Delete product permanently from catalog
  const deleteProduct = (productId) => {
    setProducts((prev) => prev.filter((item) => item.id !== productId));
    deleteSupabaseProduct(productId).catch(() => {});
  };

  // Reset to original default factory catalog
  const resetMenuToDefault = () => {
    setProducts(INITIAL_PRODUCTS);
    try {
      localStorage.setItem("tph_menu_items", JSON.stringify(INITIAL_PRODUCTS));
    } catch {}
    INITIAL_PRODUCTS.forEach((prod) => {
      upsertSupabaseProduct(prod).catch(() => {});
    });
  };

  // Available categories list
  const categories = useMemo(() => {
    const unique = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(unique)];
  }, [products]);

  return (
    <MenuContext.Provider
      value={{
        products,
        categories,
        toggleStock,
        updateProduct,
        addProduct,
        deleteProduct,
        resetMenuToDefault,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
}

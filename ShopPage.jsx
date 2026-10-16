import { useState, useMemo } from "react";
import { useCart } from "./CartContext.jsx";
import assortedSmallChopsImg from "./IMG/assorted small chops.jpg";
import smallChops100Img from "./IMG/small chops assorted.jpg";
import sc2Img from "./IMG/SC2.jpg";
import chickenSkewersImg from "./IMG/chicken skiwer platter.jpg";
import puffPuffImg from "./IMG/puff puff.jpg";
import springRollSamosaImg from "./IMG/spring roll & samosa.jpg";
import meatPieImg from "./IMG/meat pie.jpg";
import chinChinImg from "./IMG/chin chin.jpg";
import birthdayCakeImg from "./IMG/birthday cake.jpg";
import brandLogo from "./IMG/the_platter_house_hq.jpg";

const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Work+Sans:wght@400;500;600&display=swap');
  .font-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
  .font-body { font-family: 'Work Sans', sans-serif; }
`;

const NAV_LINKS = [
  { label: "Shop", href: "#shop" },
  { label: "Collections", href: "#collections" },
  { label: "Events & Catering", href: "#events" },
  { label: "Track Order", href: "#track" },
];

const CATEGORIES = ["All", "Small Chops", "Platters & Trays", "Pastries & Desserts", "Event Packages"];

const PRODUCTS = [
  {
    name: "Spring Roll & Samosa Mix (40pc)",
    category: "Small Chops",
    price: 22000,
    image: springRollSamosaImg,
  },
  {
    name: "Puff-Puff",
    category: "Small Chops",
    price: 18000,
    image: puffPuffImg,
  },
  {
    name: "Chicken Skewer Platter (30pc)",
    category: "Small Chops",
    price: 26000,
    image: chickenSkewersImg,
  },
  {
    name: "Assorted Small Chops (100pc)",
    category: "Small Chops",
    price: 45000,
    image: smallChops100Img,
  },
  {
    name: "Jollof Rice Party Tray",
    category: "Platters & Trays",
    price: 35000,
  image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Small Chops Platter (50pc)",
    category: "Platters & Trays",
    price: 42000,
    image: sc2Img,
  },
  {
    name: "Swallow & Soup Combo Tray",
    category: "Platters & Trays",
    price: 38000,
   
    image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Grilled Fish & Peppered Sauce Tray",
    category: "Platters & Trays",
    price: 48000,
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Meat Pie Box (24pc)",
    category: "Pastries & Desserts",
    price: 16000,
    image: meatPieImg,
  },
  {
    name: "Chin Chin, Family Pack",
    category: "Pastries & Desserts",
    price: 9000,
    image: chinChinImg,
  },
  {
    name: "Birthday Cake",
    category: "Pastries & Desserts",
    price: 55000,
    image: birthdayCakeImg,
  },
  {
    name: "Wedding Cake, 3-Tier",
    category: "Pastries & Desserts",
    price: 120000,
    image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Intimate Gathering Package (20 guests)",
    category: "Event Packages",
    price: 180000,
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Classic Wedding Package (100 guests)",
    category: "Event Packages",
    price: 850000,
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Corporate Lunch Package (50 guests)",
    category: "Event Packages",
    price: 320000,
    image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80",
  },
];

function formatNaira(amount) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export default function ShopPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const { cartCount, addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return PRODUCTS;
    return PRODUCTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  function handleAddToCart(product) {
    addToCart(product);
    setJustAdded(product.name);
    window.clearTimeout(handleAddToCart._t);
    handleAddToCart._t = window.setTimeout(() => setJustAdded(null), 1400);

    setShowToast(true);
    window.clearTimeout(handleAddToCart._toastT);
    handleAddToCart._toastT = window.setTimeout(() => setShowToast(false), 2000);
  }

  return (
    <div className="font-body min-h-screen" style={{ backgroundColor: "#F6F2EB", color: "#201D1B" }}>
      <style>{FONT_IMPORT}</style>

      {/* Nav */}
      <header className="border-b sticky top-0 z-50" style={{ borderColor: "#E4DED2", backgroundColor: "#F6F2EB" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 flex items-center justify-between h-20">
          <a className="font-display text-xl tracking-tight hover:opacity-80 transition-opacity flex items-center gap-2.5" href="#">
            <img
              src={brandLogo}
              alt="The Platter House"
              className="w-10 h-10 object-contain rounded-full bg-white p-0.5 border border-[#E4DED2] shadow-sm"
            />
            <span>The Platter House</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="text-sm hover:opacity-70 transition-opacity">
                {link.label}
              </a>
            ))}
            <div className="relative">
              <a
                href="#cart"
                className="text-sm px-4 py-2 rounded-sm text-white inline-block"
                style={{ backgroundColor: "#6E1E2B" }}
              >
                Cart ({cartCount})
              </a>
              {showToast && (
                <div
                  role="status"
                  className="absolute top-full right-0 mt-2 whitespace-nowrap text-xs px-3 py-2 rounded-sm shadow-sm"
                  style={{ backgroundColor: "#201D1B", color: "#F6F2EB" }}
                >
                  Product added to cart
                </div>
              )}
            </div>
          </nav>

          <button
            className="md:hidden text-sm"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden px-6 pb-6 flex flex-col gap-4" style={{ borderTop: "1px solid #E4DED2" }}>
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="text-sm pt-4">
                {link.label}
              </a>
            ))}
            <a href="#cart" className="text-sm pt-2">Cart ({cartCount})</a>
          </div>
        )}
      </header>

      {/* Page heading */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pt-14 pb-8">
        <h1 className="font-display text-3xl md:text-4xl mb-3">Shop</h1>
        <p className="text-sm md:text-base max-w-md" style={{ color: "#4A4642" }}>
          Browse small chops, platters, pastries and full event packages,
          priced and ready to order.
        </p>
      </section>

      {/* Category filter */}
      <section className="max-w-6xl mx-auto px-6 md:px-10">
        <div
          className="flex gap-2 overflow-x-auto pb-4 mb-8"
          style={{ borderBottom: "1px solid #E4DED2" }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="text-sm px-4 py-2 whitespace-nowrap transition-colors"
              style={
                activeCategory === cat
                  ? { backgroundColor: "#6E1E2B", color: "#F6F2EB" }
                  : { backgroundColor: "transparent", color: "#201D1B", border: "1px solid #E4DED2" }
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Product grid */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {filteredProducts.map((product) => (
            <div key={product.name} className="flex flex-col group">
              <div
                className="w-full aspect-square overflow-hidden mb-4 rounded-sm relative bg-[#E4DED2] shadow-sm"
                style={{ border: "1px solid #E4DED2" }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="text-xs mb-1 font-medium tracking-wide uppercase" style={{ color: "#A9824F" }}>
                {product.category}
              </p>
              <h3 className="font-display text-base md:text-lg mb-2 leading-snug">{product.name}</h3>
              <span className="text-sm font-semibold mb-3">{formatNaira(product.price)}</span>
              <button
                onClick={() => handleAddToCart(product)}
                className="mt-auto w-full text-sm px-4 py-2.5 rounded-sm font-medium transition-all"
                style={
                  justAdded === product.name
                    ? { backgroundColor: "#A9824F", color: "#F6F2EB" }
                    : { border: "1px solid #201D1B", color: "#201D1B" }
                }
              >
                {justAdded === product.name ? "✓ Added to cart" : "Add to cart"}
              </button>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <p className="text-sm text-center py-16" style={{ color: "#4A4642" }}>
            No products in this category yet.
          </p>
        )}
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: "#201D1B", color: "#F6F2EB" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <span className="font-display text-lg">The Platter House</span>
            <p className="text-sm mt-3 max-w-xs" style={{ color: "#C9C3BA" }}>
              Small chops, platters and full event catering for weddings,
              birthdays and corporate gatherings across the city.
            </p>
          </div>

          <div>
            <p className="text-sm mb-4" style={{ color: "#A9824F" }}>
              Explore
            </p>
            <ul className="flex flex-col gap-3 text-sm">
              <li><a href="#shop" className="hover:opacity-70 transition-opacity">Shop</a></li>
              <li><a href="#collections" className="hover:opacity-70 transition-opacity">Collections</a></li>
              <li><a href="#events" className="hover:opacity-70 transition-opacity">Events & Catering</a></li>
              <li><a href="#track" className="hover:opacity-70 transition-opacity">Track Order</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm mb-4" style={{ color: "#A9824F" }}>
              Get in touch
            </p>
            <ul className="flex flex-col gap-3 text-sm" style={{ color: "#C9C3BA" }}>
              <li>hello@theplatterhouse.com</li>
              <li>+234 800 000 0000</li>
              <li>Lekki Phase 1, Lagos</li>
              <li>Orders close daily at 4pm for next-day delivery.</li>
            </ul>
          </div>
        </div>

        <div
          className="max-w-6xl mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row justify-between gap-3 text-sm"
          style={{ borderTop: "1px solid #3A3632", color: "#8A857D" }}
        >
          <span>© {new Date().getFullYear()} The Platter House. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:opacity-70 transition-opacity">Privacy Policy</a>
            <a href="#terms" className="hover:opacity-70 transition-opacity">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

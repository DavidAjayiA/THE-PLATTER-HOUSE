import { useState } from "react";
import { useCart } from "./CartContext.jsx";
import platter1Img from "./IMG/platter1.jpg";
import platter2Img from "./IMG/platter2.jpg";
import platter3Img from "./IMG/platter3.jpg";
import birthdayCakeImg from "./IMG/birthday cake.jpg";
import sc2Img from "./IMG/SC2.jpg";
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

import {
  BUSINESS_WHATSAPP_PHONE,
  BUSINESS_EMAIL,
  BUSINESS_PHONE_DISPLAY,
} from "./config.js";

const PAST_EVENTS = [
  {
    title: "Weddings & Galas",
    tag: "Full Reception Menus",
    description: "Full-service banquet menus for wedding receptions, cocktail hours, and luxury table setups.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Corporate Events",
    tag: "Meetings & Launches",
    description: "Executive lunch packages, grazing tables, and boxed catering for corporate gatherings and office parties.",
    image: platter3Img,
  },
  {
    title: "Birthdays & Milestones",
    tag: "Cakes & Platters",
    description: "Custom celebration cakes, signature small chops platters, and desserts dressed for the milestone.",
    image: birthdayCakeImg,
  },
];

export default function EventsAndCateringPage() {
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  /* ==============================================================================
   * 🟢 CONCIERGE LINKS (Option 1: Direct WhatsApp & Email Inquiries)
   * ============================================================================== */
  const cleanPhone = BUSINESS_WHATSAPP_PHONE ? BUSINESS_WHATSAPP_PHONE.replace(/[^0-9]/g, "") : "";
  const whatsappTargetUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : "https://wa.me/";

  const whatsappConciergeUrl = `${whatsappTargetUrl}?text=${encodeURIComponent(
    `Hello The Platter House Team! 👋\n\n` +
    `I am planning an upcoming event and would like to check date availability and inquire about catering options.\n\n` +
    `• Event Type:\n` +
    `• Estimated Date:\n` +
    `• Guest Count:\n` +
    `• Venue / Area:\n` +
    `• Menu Interests (e.g. Small chops, Jollof trays, desserts):\n\n` +
    `Please let me know your package details. Thank you!`
  )}`;

  const emailConciergeUrl = `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(
    "Event Catering Inquiry - The Platter House"
  )}&body=${encodeURIComponent(
    `Dear The Platter House Events Team,\n\n` +
    `I am planning an event and would like to request a catering quote and menu package.\n\n` +
    `• Contact Name:\n` +
    `• Phone Number / WhatsApp:\n` +
    `• Event Type (Wedding, Birthday, Corporate, Gala):\n` +
    `• Event Date:\n` +
    `• Estimated Guests:\n` +
    `• Venue / Location:\n` +
    `• Preferred Menu & Dishes:\n` +
    `• Any specific dietary requirements or setup requests:\n\n` +
    `Looking forward to hearing from you.\n\n` +
    `Kind regards,`
  )}`;

  function handleCopyEmail() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(BUSINESS_EMAIL);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
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
            <a href="#cart" className="text-sm px-4 py-2 rounded-sm text-white" style={{ backgroundColor: "#6E1E2B" }}>
              Cart ({cartCount})
            </a>
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

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pt-16 pb-12 grid md:grid-cols-5 gap-12 items-center">
        <div className="md:col-span-3">
          <h1 className="font-display text-3xl md:text-5xl leading-tight mb-5">
            Catering built around
            <br />
            your event.
          </h1>
          <p className="text-sm md:text-base max-w-md" style={{ color: "#4A4642" }}>
            Weddings, birthdays and corporate gatherings each need their own
            menu and logistics. Tell us the details below and we'll put
            together a quote built specifically for your day.
          </p>
        </div>
        <div className="md:col-span-2">
          <div
            className="w-full aspect-[4/3] rounded-sm overflow-hidden relative shadow-md group bg-[#E4DED2]"
            style={{ border: "1px solid #E4DED2" }}
          >
            <img
              src={platter2Img}
              alt="Luxury event catering setup"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
              <span className="text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded bg-[#6E1E2B] text-white shadow-sm">
                Full-Service Catering
              </span>
              <span className="text-xs text-white/90">20 to 500+ Guests</span>
            </div>
          </div>
        </div>
      </section>

      {/* What we cater */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pb-20">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#A9824F" }}>
            Tailored Offerings
          </p>
          <h2 className="font-display text-2xl md:text-3xl text-[#201D1B]">What We Cater</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {PAST_EVENTS.map((e) => (
            <div
              key={e.title}
              className="overflow-hidden rounded-sm bg-[#FBF9F5] border border-[#E4DED2] group shadow-sm flex flex-col hover:border-[#6E1E2B]/40 transition-colors"
            >
              <div className="w-full h-52 overflow-hidden relative bg-[#E4DED2]">
                <img
                  src={e.image}
                  alt={e.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded bg-[#201D1B]/80 text-[#F6F2EB] backdrop-blur-sm">
                  {e.tag}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-xl mb-2 text-[#201D1B]">{e.title}</h3>
                  <p className="text-sm text-[#4A4642] leading-relaxed">{e.description}</p>
                </div>
                <a
                  href="#quote-form"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("quote-form")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="mt-6 text-xs font-semibold uppercase tracking-wider text-[#6E1E2B] inline-flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Request {e.title} Quote →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Event Concierge & Direct Booking (Option 1: Clean, zero-form, high conversion) */}
      <section id="quote-form" className="border-t" style={{ borderColor: "#E4DED2" }}>
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-16 md:py-24">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded bg-[#6E1E2B]/10 text-[#6E1E2B] inline-block mb-3">
              Event Inquiries & Bookings
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-[#201D1B] mb-4">
              Planning an upcoming celebration?
            </h2>
            <p className="text-sm md:text-base text-[#4A4642] leading-relaxed">
              No long forms or waiting. Connect directly with our events team for custom menus,
              date availability, and tailored catering quotes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Card 1: WhatsApp Concierge */}
            <div
              className="p-8 rounded-sm flex flex-col justify-between border shadow-sm relative overflow-hidden group hover:border-[#25D366]/60 transition-all"
              style={{ backgroundColor: "#FBF9F5", borderColor: "#E4DED2" }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#25D366]/5 rounded-bl-full pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#25D366]/15 text-[#1B5E20]">
                    Fastest Response
                  </span>
                </div>
                <h3 className="font-display text-2xl text-[#201D1B] mb-2">Chat on WhatsApp</h3>
                <p className="text-sm text-[#4A4642] leading-relaxed mb-6">
                  Chat directly with our catering managers for real-time menu recommendations, guest-count pricing, and instant date reservations.
                </p>
              </div>

              <div>
                <a
                  href={whatsappConciergeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-sm text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 flex items-center justify-center gap-2.5"
                  style={{ backgroundColor: "#25D366" }}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span>Open WhatsApp Chat</span>
                  <span>→</span>
                </a>
                <p className="text-center text-xs text-[#7A746B] mt-2.5">
                  Typical reply time: Under 30 minutes
                </p>
              </div>
            </div>

            {/* Card 2: Direct Email Desk */}
            <div
              className="p-8 rounded-sm flex flex-col justify-between border shadow-sm relative overflow-hidden group hover:border-[#6E1E2B]/50 transition-all"
              style={{ backgroundColor: "#FBF9F5", borderColor: "#E4DED2" }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#6E1E2B]/5 rounded-bl-full pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#6E1E2B]/10 text-[#6E1E2B] flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#6E1E2B]/10 text-[#6E1E2B]">
                    Formal Proposals & RFPs
                  </span>
                </div>
                <h3 className="font-display text-2xl text-[#201D1B] mb-2">Email Our Events Desk</h3>
                <p className="text-sm text-[#4A4642] leading-relaxed mb-6">
                  Prefer a written proposal? Send us your event date, estimated guests, and venue location. We'll reply with a comprehensive quote.
                </p>
              </div>

              <div>
                <a
                  href={`mailto:${BUSINESS_EMAIL}`}
                  className="w-full py-3.5 px-6 rounded-sm text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 flex items-center justify-center gap-2.5 mb-2"
                  style={{ backgroundColor: "#6E1E2B" }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <span>Send Us an Email</span>
                  <span>→</span>
                </a>
                <div className="flex items-center justify-center gap-2 text-xs text-[#7A746B] mt-2">
                  <span>Direct:</span> 
                  <code className="text-[#201D1B] font-mono select-all bg-[#E4DED2]/50 px-1.5 py-0.5 rounded">
                    {BUSINESS_EMAIL}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="text-[#6E1E2B] hover:underline font-medium ml-1 cursor-pointer"
                  >
                    {copiedEmail ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Call & Operating Hours Strip */}
          <div
            className="mt-8 p-5 rounded-sm border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
            style={{ backgroundColor: "#F6F2EB", borderColor: "#E4DED2" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#6E1E2B]/10 text-[#6E1E2B] flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <div>
                <span className="font-semibold text-[#201D1B]">Prefer to speak over a quick call?</span>
                <p className="text-[#4A4642] mt-0.5">Kitchen & Catering line: <a href={`tel:${cleanPhone}`} className="text-[#6E1E2B] font-semibold hover:underline">{BUSINESS_PHONE_DISPLAY}</a></p>
              </div>
            </div>
            <div className="text-right text-[#7A746B]">
              <span className="block font-medium text-[#201D1B]">Inquiry Desk Hours</span>
              <span>Monday – Friday: 8:00 AM – 5:00 PM</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: "#201D1B", color: "#F6F2EB" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
           <a className="font-display text-xl tracking-tight" href="#CateringHome">The Platter House</a>
            <p className="text-sm mt-3 max-w-xs" style={{ color: "#C9C3BA" }}>
              Small chops, platters and full event catering for weddings,
              birthdays and corporate gatherings across the city.
            </p>
          </div>

          <div>
            <p className="text-sm mb-4" style={{ color: "#A9824F" }}>Explore</p>
            <ul className="flex flex-col gap-3 text-sm">
              <li><a href="#shop" className="hover:opacity-70 transition-opacity">Shop</a></li>
              <li><a href="#collections" className="hover:opacity-70 transition-opacity">Collections</a></li>
              <li><a href="#events" className="hover:opacity-70 transition-opacity">Events & Catering</a></li>
              <li><a href="#track" className="hover:opacity-70 transition-opacity">Track Order</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm mb-4" style={{ color: "#A9824F" }}>Get in touch</p>
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

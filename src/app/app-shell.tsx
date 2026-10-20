"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";

type Language = "ar" | "tr" | "en";
type FlavorChoice = "spicy" | "cool" | "veryhot";
type FlavorValue = FlavorChoice | string;
type User = { id: string; name: string; email: string; phone: string; role: string; offerNotifications?: boolean };
type Product = {
  id: string;
  slug?: string;
  name: string;
  nameAr?: string;
  nameTr?: string;
  descriptionAr?: string;
  descriptionTr?: string;
  productType?: "cheese" | "sandwich";
  price300: number;
  price600: number;
  priceSingle?: number;
  image: string;
  images?: string[];
  images300g?: string[];
  images600g?: string[];
  description: string;
  category: string;
  tags: string[];
  featured?: boolean;
  stockStatus?: string;
  createdAt?: string;
};

type CartItem = Product & { size: "300g" | "600g" | "single"; quantity: number; linePrice: number; flavorChoice: string };

type ThemeName = "light" | "dark" | "brand";
const copy: Record<Language, Record<string, string>> = {
  ar: { home: "الرئيسية", shop: "تسوق", orders: "طلباتي", settings: "الإعدادات", cart: "السلة", login: "تسجيل الدخول", register: "إنشاء حساب", hero: "Gebna-A", subtitle: "أجود الجبن المصري الأصيل في تركيا", shopNow: "تسوق الآن", newProducts: "جديد في المتجر", varieties: "الأصناف", all: "الكل", add: "أضف للسلة", choose: "اختر النكهة", spicy: "حار 🌶", cool: "بارد ❄️", veryHot: "حار جداً 🔥", size: "الحجم", back: "العودة للمتجر", cartTitle: "سلة التسوق", emptyCart: "سلتك فارغة", checkout: "إتمام الطلب", complete: "إتمام الطلب", fullName: "الاسم الكامل", phone: "رقم الهاتف", address: "العنوان", city: "المدينة", district: "الحي / المنطقة", building: "المبنى", floor: "الطابق", door: "الباب", notes: "ملاحظات", place: "تأكيد الطلب", orderPlaced: "تم الطلب بنجاح!", track: "تتبع طلبك", code: "رمز الطلب", searchOrder: "بحث عن الطلب", noOrders: "لا توجد طلبات", accountRequired: "يجب تسجيل الدخول لإتمام الطلب", admin: "لوحة التحكم", products: "المنتجات", save: "حفظ", cancel: "إلغاء", language: "اللغة", theme: "المظهر", darkMode: "الوضع الداكن", brandTheme: "مظهر Gebna-A", lightTheme: "فاتح", darkTheme: "داكن", brandThemeName: "Gebna-A", rememberMe: "تذكرني", logout: "خروج", viewAll: "عرض الكل", new: "جديد", description: "الوصف", relatedProducts: "منتجات مشابهة", shareLocation: "مشاركة الموقع", saveLocation: "حفظ الموقع", flavor: "النكهة", required: "مطلوب", flavors: "النكهات", flavorsNote: "اختر نكهة واحدة على الأقل", adminFlavors: "إدارة النكهات", flavorsDesc: "أضف أو احذف النكهات المتاحة", addFlavor: "إضافة نكهة", remove: "حذف", confirmDelete: "هل أنت متأكد؟", smallBatch: "دفعات صغيرة", madeWithPatience: "مصنوعة بصبر", pureIngredients: "مكونات نقية", nothingUnnecessary: "بدون إضافات غير ضرورية", freshDelivery: "توصيل طازج", atYourDoorstep: "إلى باب منزلك", tasteOfHome: "مذاق البيت", collection: "مجموعة Gebna-A", craftedForTable: "صُنعت لمائدتك.", handcraftedStory: "نكهات مصرية فريدة مصنوعة يدوياً على دفعات صغيرة. من الأصناف الكلاسيكية إلى الفلفل والأعشاب الجريئة، كل لقمة تحكي قصة.", uniqueFlavors: "نكهات مصرية فريدة، صُنعت بعناية.", handcraftedEgyptian: "أجود الجبن المصري الأصيل في تركيا" },
  tr: { home: "Ana Sayfa", shop: "Mağaza", orders: "Siparişlerim", settings: "Ayarlar", cart: "Sepet", login: "Giriş yap", register: "Kayıt ol", hero: "Gebna-A", subtitle: "Türkiye'deki en özel Mısır peynirleri", shopNow: "Şimdi al", newProducts: "Yeni ürünler", varieties: "Çeşitler", all: "Tümü", add: "Sepete ekle", choose: "Lezzet seç", spicy: "Acı 🌶", cool: "Sade ❄️", veryHot: "Çok acı 🔥", size: "Boyut", back: "Mağazaya dön", cartTitle: "Alışveriş sepeti", emptyCart: "Sepetiniz boş", checkout: "Siparişi tamamla", complete: "Siparişi tamamla", fullName: "Ad soyad", phone: "Telefon numarası", address: "Adres", city: "Şehir", district: "İlçe", building: "Bina", floor: "Kat", door: "Kapı", notes: "Notlar", place: "Siparişi onayla", orderPlaced: "Sipariş alındı!", track: "Siparişini takip et", code: "Sipariş kodu", searchOrder: "Sipariş ara", noOrders: "Sipariş yok", accountRequired: "Sipariş vermek için giriş yapmalısınız", admin: "Yönetim paneli", products: "Ürünler", save: "Kaydet", cancel: "İptal", language: "Dil", theme: "Tema", darkMode: "Karanlık mod", brandTheme: "Gebna-A teması", lightTheme: "Açık", darkTheme: "Koyu", brandThemeName: "Gebna-A", rememberMe: "Beni hatırla", logout: "Çıkış", viewAll: "Tümünü gör", new: "Yeni", description: "Açıklama", relatedProducts: "Benzer ürünler", shareLocation: "Konum paylaş", saveLocation: "Konumu kaydet", flavor: "Lezzet", required: "Gerekli", flavors: "Lezzetler", flavorsNote: "En az bir lezzet seçin", adminFlavors: "Lezzetleri yönet", flavorsDesc: "Mevcut lezzetleri ekle veya sil", addFlavor: "Lezzet ekle", remove: "Sil", confirmDelete: "Emin misiniz?", smallBatch: "Küçük parti", madeWithPatience: "Sabırla yapılmış", pureIngredients: "Saf malzemeler", nothingUnnecessary: "Gereksiz ekleme yok", freshDelivery: "Taze teslimat", atYourDoorstep: "Kapınıza kadar", tasteOfHome: "Ev tadı", collection: "Gebna-A Koleksiyonu", craftedForTable: "Masanız için hazırlandı.", handcraftedStory: "El yapımı özel Mısır lezzetleri. Klasik çeşitlerden cesur biber ve otlara, her lokma bir hikaye anlatır.", uniqueFlavors: "Özel Mısır lezzetleri, özenle yapılmış.", handcraftedEgyptian: "Türkiye'deki en özel Mısır peynirleri" },
  en: { home: "Home", shop: "Shop", orders: "My Orders", settings: "Settings", cart: "Cart", login: "Log in", register: "Register", hero: "Gebna-A", subtitle: "Finest Egyptian artisan cheese in Turkey", shopNow: "Shop Now", newProducts: "New in store", varieties: "Varieties", all: "All", add: "Add to cart", choose: "Choose your flavor", spicy: "Spicy 🌶", cool: "Cool ❄️", veryHot: "Very hot 🔥", size: "Size", back: "Back to shop", cartTitle: "Shopping Cart", emptyCart: "Your cart is empty", checkout: "Checkout", complete: "Complete Order", fullName: "Full Name", phone: "Phone Number", address: "Street Address", city: "City", district: "District", building: "Building", floor: "Floor", door: "Door", notes: "Notes", place: "Place Order", orderPlaced: "Order placed!", track: "Track your order", code: "Order code", searchOrder: "Find order", noOrders: "No orders found", accountRequired: "Please log in to complete your order", admin: "Admin Dashboard", products: "Products", save: "Save", cancel: "Cancel", language: "Language", theme: "Theme", darkMode: "Dark mode", brandTheme: "Gebna-A theme", lightTheme: "Light", darkTheme: "Dark", brandThemeName: "Gebna-A", rememberMe: "Remember me", logout: "Log out", viewAll: "View all", new: "New", description: "Description", relatedProducts: "You may also like", shareLocation: "Share my location", saveLocation: "Save this address", flavor: "Flavor", required: "Required", flavors: "Flavors", flavorsNote: "Choose at least one flavor", adminFlavors: "Manage flavors", flavorsDesc: "Add or remove available flavors", addFlavor: "Add flavor", remove: "Remove", confirmDelete: "Are you sure?", smallBatch: "Small batch", madeWithPatience: "Made with patience", pureIngredients: "Pure ingredients", nothingUnnecessary: "Nothing unnecessary", freshDelivery: "Fresh delivery", atYourDoorstep: "At your doorstep", tasteOfHome: "A taste of home", collection: "THE Gebna-A COLLECTION", craftedForTable: "Crafted for your table.", handcraftedStory: "Unique, hand-crafted Egyptian flavors made in small batches. From familiar classics to bold pepper and herb varieties, every bite tells a story.", uniqueFlavors: "Unique Egyptian flavors, made with care.", handcraftedEgyptian: "Finest Egyptian artisan cheese in Turkey" },
};

const LanguageContext = createContext<{ lang: Language; setLang: (lang: Language) => void; t: (key: string) => string }>({ lang: "ar", setLang: () => undefined, t: (key) => key });
function useI18n() { return useContext(LanguageContext); }
const ThemeContext = createContext<{ theme: ThemeName; setTheme: (t: ThemeName) => void }>({ theme: "light", setTheme: () => {} });
function useTheme() { return useContext(ThemeContext); }

// Orders are accepted only on Saturday & Sunday (Turkey time). Browsing/cart is always open.
function isOrderingDay(now: Date = new Date()) {
  try { const wd = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Istanbul", weekday: "short" }).format(now); return wd === "Sat" || wd === "Sun"; }
  catch { const d = now.getDay(); return d === 0 || d === 6; }
}

type IconName =
  | "arrow"
  | "bag"
  | "cart"
  | "chevron"
  | "clock"
  | "close"
  | "dashboard"
  | "edit"
  | "email"
  | "globe"
  | "heart"
  | "home"
  | "image"
  | "lock"
  | "logout"
  | "menu"
  | "orders"
  | "phone"
  | "plus"
  | "search"
  | "settings"
  | "spark"
  | "trash"
  | "user"
  | "users";

const LOGO = "/logo.png";
const HERO_IMAGE = "/images/hero-artisan-cheese.jpeg";

const products: Product[] = [
  {
    id: "classic",
    name: "Classic",
    price300: 139,
    price600: 239,
    image: "/images/products/8cca3ef6d_SAVE_20260625_024331.jpg",
    description: "Simplicity when crafted with perfection. A rich, creamy cheese with an authentic everyday taste.",
    category: "Classic",
    tags: ["Artisan", "Mild"],
    featured: true,
  },
  {
    id: "shamar",
    name: "Shamar",
    price300: 139,
    price600: 239,
    image: "/images/products/1b2285eb8_5924799521483328933.jpg",
    description: "Creamy cheese with fennel seeds, a light aromatic scent, and a unique flavor for those who love distinction.",
    category: "Special",
    tags: ["Artisan", "Aromatic"],
    featured: true,
  },
  {
    id: "barakota",
    name: "Barakota",
    price300: 139,
    price600: 239,
    image: "/images/products/138e8f564_5924799521483328938.jpg",
    description: "The authentic Eastern flavor of creamy cheese with nigella seeds and a beloved traditional touch.",
    category: "Special",
    tags: ["Artisan", "Classic"],
    featured: true,
  },
  {
    id: "mexicano",
    name: "Mexicano",
    price300: 135,
    price600: 239,
    image: "/images/products/7a88cc1c7_SAVE_20260625_023316.jpg",
    description: "A rich flavor and attractive color with a light touch of the natural sweetness of red peppers.",
    category: "Pepper",
    tags: ["Spicy", "Red Pepper"],
    featured: true,
  },
  {
    id: "kalamata",
    name: "Kalamata",
    price300: 164,
    price600: 264,
    image: "/images/products/3ffd0abec_SAVE_20260625_245249.jpg",
    description: "Creamy handcrafted cheese folded with the deep, savory notes of black olive.",
    category: "Special",
    tags: ["Artisan", "Mild"],
  },
  {
    id: "alasly",
    name: "Alasly",
    price300: 164,
    price600: 264,
    image: "/images/products/c55de3d15_SAVE_20260625_023402.jpg",
    description: "A bright, fresh cheese with a gentle herb finish and a smooth, luxurious texture.",
    category: "Classic",
    tags: ["Mild", "Artisan"],
  },
  {
    id: "zatalona",
    name: "Zatalona",
    price300: 164,
    price600: 264,
    image: "/images/products/98cabc55c_59247995214833289361.jpg",
    description: "A fragrant dill-inspired variety, made for a fresh and memorable cheese board.",
    category: "Special",
    tags: ["Artisan", "Aromatic"],
  },
  {
    id: "halapeno",
    name: "Halapeno",
    price300: 170,
    price600: 270,
    image: "/images/products/8685eecb2_6050981949788065377.jpg",
    description: "Creamy Egyptian cheese with a warm jalapeño kick for an adventurous bite.",
    category: "Pepper",
    tags: ["Spicy", "Pepper"],
  },
];

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    bag: <><path d="M6 8h12l1 12H5L6 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></>,
    cart: <><path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L20 8H6" /><circle cx="10" cy="20" r="1" /><circle cx="17" cy="20" r="1" /></>,
    chevron: <path d="m6 9 6 6 6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    close: <><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>,
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    email: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
    heart: <path d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.6Z" />,
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9" /><path d="M9 20v-6h6v6" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 15-5-5L5 20" /></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    logout: <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-6" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    orders: <><path d="M6 3h12v18H6z" /><path d="M9 7h6M9 11h6M9 15h4" /></>,
    phone: <><path d="M6.5 3.5 9 3l2 5-2.2 1.7a14 14 0 0 0 5 5L15.5 12l5 2 .5 2.5a3 3 0 0 1-3.2 3.5C10.7 19.5 4.5 13.3 4 6.2A3 3 0 0 1 6.5 3.5Z" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    settings: <><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.5v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6.4v-2.5h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.1h2.5v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1V14h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>,
    spark: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7Z" /></>,
    trash: <><path d="M4 7h16M10 11v6M14 11v6" /><path d="m6 7 1 13h10l1-13M9 7V4h6v3" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M2.5 19a6.5 6.5 0 0 1 13 0" /><path d="M16 5.5a3 3 0 0 1 0 5.8M18 14a5.2 5.2 0 0 1 3.5 5" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function Brand({ light = false }: { light?: boolean }) {
  return <span className={`brand ${light ? "brand-light" : ""}`}><img src={LOGO} alt="Gebna-A" /><span>Gebna-<b>A</b></span></span>;
}

function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const labels: Record<Language, string> = { ar: "العربية", tr: "Türkçe", en: "English" };
  const codes: Record<Language, string> = { ar: "AR", tr: "TR", en: "EN" };
  return <div className="language-switcher"><motion.button whileTap={{ scale: .96 }} className={`language-trigger ${open ? "is-open" : ""}`} onClick={() => setOpen(!open)} aria-expanded={open}><span className="language-orb"><Icon name="globe" size={14} /></span><span className="language-current"><b>{codes[lang]}</b><small>{labels[lang]}</small></span><Icon name="chevron" size={14} /></motion.button><AnimatePresence>{open && <motion.div className="language-menu" initial={{ opacity: 0, y: -8, scale: .94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: .96 }} transition={{ type: "spring", damping: 22, stiffness: 380 }}>{(Object.keys(labels) as Language[]).map((key, index) => <motion.button key={key} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .035 }} className={lang === key ? "active" : ""} onClick={() => { setLang(key); setOpen(false); }}><span className="language-code">{codes[key]}</span><span>{labels[key]}</span>{lang === key && <span className="language-check">✓</span>}</motion.button>)}</motion.div>}</AnimatePresence></div>;
}

function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [promptEvent, setPromptEvent] = useState<Event & { prompt?: () => Promise<void> } | null>(null);
  useEffect(() => {
    // Hide install prompt if running in standalone mode (PWA) or Android APK
    if (window.matchMedia?.("(display-mode: standalone)")?.matches) return;
    if (navigator.userAgent.includes("GebnaA-Android")) return;
    const dismissed = window.localStorage.getItem("gebna-install-dismissed");
    const handler = (event: Event) => { event.preventDefault(); setPromptEvent(event as Event & { prompt?: () => Promise<void> }); setVisible(!dismissed); };
    window.addEventListener("beforeinstallprompt", handler);
    const timer = window.setTimeout(() => { if (!dismissed) setVisible(true); }, 1800);
    return () => { window.removeEventListener("beforeinstallprompt", handler); window.clearTimeout(timer); };
  }, []);
  if (!visible) return null;
  return <div className="install-prompt"><img src={LOGO} alt="" /><div><b>Add Gebna-A to your home screen</b><span>Shop faster like an app</span></div><button onClick={async () => { if (promptEvent?.prompt) await promptEvent.prompt(); setVisible(false); window.localStorage.setItem("gebna-install-dismissed", "1"); }}>Install</button><button className="install-close" onClick={() => { setVisible(false); window.localStorage.setItem("gebna-install-dismissed", "1"); }}>×</button></div>;
}

function WhatsAppFab() {
  return <a className="whatsapp-fab" href="https://wa.me/905510668289" target="_blank" rel="noreferrer"><span>◔</span><b>+90 551 066 82 89</b></a>;
}

const fadeUp = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: .55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: .07 } } };

function Button({ children, onClick, variant = "primary", type = "button", className = "", disabled = false }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "outline" | "ghost" | "yellow"; type?: "button" | "submit"; className?: string; disabled?: boolean }) {
  return <motion.button type={type} onClick={onClick} disabled={disabled} whileHover={disabled ? undefined : { y: -2, scale: 1.01 }} whileTap={disabled ? undefined : { scale: .97 }} transition={{ type: "spring", damping: 18, stiffness: 400 }} className={`btn btn-${variant} ${className} ${disabled ? "is-disabled" : ""}`}>{children}</motion.button>;
}

function StoreHeader({ go, cartCount }: { go: (path: string) => void; cartCount: number }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, lang } = useI18n();
  const open = isOrderingDay();
  return <header className="store-header">
    <button className="mobile-menu" aria-label="Menu" onClick={() => setMenuOpen(!menuOpen)}><Icon name="menu" /></button>
    <button className="brand-button" onClick={() => go("/home")}><Brand /></button>
    <nav className={`store-nav ${menuOpen ? "open" : ""}`}>
      <button onClick={() => { go("/home"); setMenuOpen(false); }}>{t("home")}</button>
      <button onClick={() => { go("/home#products"); setMenuOpen(false); }}>{t("shop")}</button>
      <button onClick={() => { go("/orders"); setMenuOpen(false); }}>{t("orders")}</button>
      <button onClick={() => { go("/download"); setMenuOpen(false); }}>{lang === "ar" ? "التطبيق" : lang === "tr" ? "Uygulama" : "App"}</button>
      <button onClick={() => { go("/settings"); setMenuOpen(false); }}>{t("settings")}</button>
    </nav>
    <div className="header-actions">
      <span className={`hours-chip hide-mobile ${open ? "open" : "closed"}`} title={open ? "Open now · Sat & Sun" : "Closed · orders Sat & Sun"}><i />{open ? (lang === "ar" ? "مفتوح" : lang === "tr" ? "Açık" : "Open") : (lang === "ar" ? "مغلق" : lang === "tr" ? "Kapalı" : "Closed")}<b>Sat·Sun</b></span>
      <LanguageSwitcher />
      <button className="icon-button hide-mobile" aria-label="Search"><Icon name="search" size={19} /></button>
      <motion.button whileTap={{ scale: .9 }} className="icon-button cart-button" aria-label={t("cart")} onClick={() => go("/cart")}><Icon name="bag" size={20} /><AnimatePresence>{cartCount > 0 && <motion.span key={cartCount} className="cart-count" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", damping: 12, stiffness: 500 }}>{cartCount}</motion.span>}</AnimatePresence></motion.button>
      <button className="avatar-button" aria-label={t("login")} onClick={() => go("/login")}><Icon name="user" size={18} /></button>
    </div>
  </header>;
}

function PageTitle({ eyebrow, title, copy, align = "left" }: { eyebrow?: string; title: string; copy?: string; align?: "left" | "center" }) {
  return <div className={`page-title align-${align}`}>
    {eyebrow && <span className="eyebrow">{eyebrow}</span>}
    <h1>{title}</h1>
    {copy && <p>{copy}</p>}
  </div>;
}

function productText(product: Product, lang: Language) {
  return { name: lang === "ar" ? product.nameAr || product.name : lang === "tr" ? product.nameTr || product.name : product.name, description: lang === "ar" ? product.descriptionAr || product.description : lang === "tr" ? product.descriptionTr || product.description : product.description };
}

function ProductCard({ product, onOpen, onAdd }: { product: Product; onOpen: () => void; onAdd: () => void }) {
  const { t, lang } = useI18n();
  const display = productText(product, lang);
  return <article className="product-card">
    <button className="product-image" onClick={onOpen} aria-label={`View ${display.name}`}>
      <img src={product.image} alt={display.name} />
      {product.featured && <span className="product-badge">{t("featured")}</span>}
      <span className="heart"><Icon name="heart" size={16} /></span>
    </button>
    <div className="product-info">
      <div className="product-name-row"><button onClick={onOpen} className="product-name">{display.name}</button><span className="product-price">₺{product.productType === "sandwich" ? product.priceSingle : product.price600}</span></div>
      <p className="product-description">{display.description}</p>
      <div className="product-bottom"><span className="product-tag">{product.tags[0]}</span><button className="add-button" onClick={() => { onAdd(); onOpen(); }}><Icon name="plus" size={14} /> {t("choose")}</button></div>
    </div>
  </article>;
}

function WeekendNotice() {
  const { lang } = useI18n();
  const [dismissed, setDismissed] = useState(false);
  if (isOrderingDay() || dismissed) return null;
  return <motion.div className="weekend-strip" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}><div className="weekend-strip-inner"><span className="weekend-dot closed" /><p>{lang === "ar" ? "نستقبل الطلبات أيام السبت والأحد فقط — تصفّح وأضف لسلتك في أي وقت." : lang === "tr" ? "Siparişleri yalnızca Cumartesi ve Pazar alıyoruz — istediğiniz zaman göz atıp sepete ekleyin." : "We take orders on Saturday & Sunday only — browse and fill your cart anytime."}</p><span className="weekend-tag">Sat · Sun</span><button className="weekend-close" onClick={() => setDismissed(true)} aria-label="Dismiss">×</button></div></motion.div>;
}

type PublicOffer = { id: string; titleEn: string; titleAr: string; titleTr: string; descriptionEn: string; descriptionAr: string; descriptionTr: string; imageUrl: string | null; type: string; discountPercent: number; buyQuantity: number | null; buySize: string | null; buyProductName: string | null; giftKind: string | null; giftQuantity: number | null; giftSize: string | null; giftProductName: string | null; giftCustomName: string | null; limitedCount: number | null; endsAt: string | null };

function OffersBanner() {
  const { lang } = useI18n();
  const [offers, setOffers] = useState<PublicOffer[]>([]);
  useEffect(() => { fetch("/api/offers").then((r) => r.ok ? r.json() : null).then((d) => setOffers(d?.offers || [])).catch(() => undefined); }, []);
  if (!offers.length) return null;
  const line = (o: PublicOffer) => {
    if (o.type === "simple") return (lang === "ar" ? o.descriptionAr : lang === "tr" ? o.descriptionTr : o.descriptionEn) || "";
    if (o.type !== "bogo") return o.discountPercent > 0 ? `${o.discountPercent}% ${lang === "ar" ? "خصم" : lang === "tr" ? "indirim" : "off"}` : (lang === "ar" ? o.descriptionAr : lang === "tr" ? o.descriptionTr : o.descriptionEn);
    const buy = `${o.buyQuantity || 2} × ${o.buySize && o.buySize !== "any" ? o.buySize + " " : ""}${o.buyProductName || (lang === "ar" ? "أي منتج" : lang === "tr" ? "herhangi ürün" : "any product")}`;
    const gift = o.giftKind === "custom" ? `${(o.giftQuantity || 1) > 1 ? o.giftQuantity + " × " : ""}${o.giftCustomName || (lang === "ar" ? "جائزة" : "a prize")}` : `${o.giftQuantity || 1} × ${o.giftSize ? o.giftSize + " " : ""}${o.giftProductName || (lang === "ar" ? "هدية" : "gift")}`;
    return lang === "ar" ? `اشترِ ${buy} واحصل على ${gift} مجاناً` : lang === "tr" ? `${buy} al, ${gift} bedava kazan` : `Buy ${buy} → get ${gift} free`;
  };
  return <section className="offers-strip"><div className="offers-strip-head"><span className="eyebrow">{lang === "ar" ? "عروض خاصة" : lang === "tr" ? "Özel teklifler" : "SPECIAL OFFERS"}</span></div><div className="offers-row">{offers.map((o, i) => <motion.div key={o.id} className={`offer-banner ${o.type === "bogo" ? "is-bogo" : ""}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .07 }}>{o.imageUrl && <div className="offer-banner-img"><img src={o.imageUrl} alt="" /></div>}<div className="offer-banner-body"><div className="offer-banner-badges">{o.type === "bogo" ? <span className="ob-badge gift">🎁 {lang === "ar" ? "هدية" : lang === "tr" ? "hediye" : "GIFT"}</span> : o.type === "simple" ? null : <span className="ob-badge pct">%</span>}{o.giftKind === "custom" && <span className="ob-badge prize">{lang === "ar" ? "جائزة" : "PRIZE"}</span>}{o.limitedCount && o.limitedCount > 0 ? <span className="ob-badge limit">🏆 {lang === "ar" ? `أول ${o.limitedCount}` : lang === "tr" ? `ilk ${o.limitedCount}` : `First ${o.limitedCount}`}</span> : null}</div><h3>{lang === "ar" ? o.titleAr : lang === "tr" ? o.titleTr : o.titleEn}</h3><p>{line(o)}</p>{o.endsAt && <OfferCountdown endsAt={o.endsAt} big />}</div></motion.div>)}</div></section>;
}

function isProductNew(p: Product): boolean {
  if (!p.createdAt) return false;
  const createdDate = new Date(p.createdAt);
  const diffTime = Math.abs(Date.now() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 30;
}

function HomePage({ go, addToCart, cartCount, catalog }: { go: (path: string) => void; addToCart: (product: Product, size?: "300g" | "600g", flavor?: string) => void; cartCount: number; catalog: Product[] }) {
  const { t, lang } = useI18n();
  const [category, setCategory] = useState("All");
  const categories = ["All", "Classic", "Pepper", "Special", "Sandwich"];
  const visible = category === "All" ? catalog : catalog.filter((product) => product.category === category);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 620], [0, 90]);
  const heroScale = useTransform(scrollY, [0, 620], [1, 1.12]);
  const markY = useTransform(scrollY, [0, 620], [0, 130]);
  const copyOpacity = useTransform(scrollY, [0, 360], [1, 0]);

  // Dynamically filter new products (added within 30 days)
  const newProducts = catalog.filter(isProductNew);

  return <div className="store-page"><WeekendNotice /><StoreHeader go={go} cartCount={cartCount} />
    <main>
      <section className="hero-section">
        <motion.img className="hero-photo" src={HERO_IMAGE} alt="Gebna-A artisan cheese" style={{ y: heroY, scale: heroScale }} />
        <div className="hero-overlay" />
        <motion.div className="hero-copy" style={{ opacity: copyOpacity }}><motion.span className="hero-kicker" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25 }}>Handcrafted in Egypt · Delivered in Turkey</motion.span><motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .38, duration: .6 }}>{t("hero")}</motion.h1><motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .55 }}>{t("subtitle")}</motion.p><motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .72 }}><Button variant="yellow" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}>{t("shopNow")} <Icon name="arrow" size={17} /></Button></motion.div></motion.div>
        <motion.div className="hero-mark" style={{ y: markY }}><motion.img src={LOGO} alt="" animate={{ rotate: [0, 4, -4, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} /></motion.div>
      </section>
      <OffersBanner />
      <section className="intro-strip"><div><span className="eyebrow">{lang === "ar" ? "مجموعة Gebna-A" : "THE Gebna-A COLLECTION"}</span><h2>{lang === "ar" ? "صُنعت لمائدتك." : "Crafted for your table."}</h2></div><p>{lang === "ar" ? "نكهات مصرية فريدة مصنوعة يدوياً على دفعات صغيرة. من الأصناف الكلاسيكية إلى الفلفل والأعشاب الجريئة، كل لقمة تحكي قصة." : "Unique, hand-crafted Egyptian flavors made in small batches. From familiar classics to bold pepper and herb varieties, every bite tells a story."}</p></section>
      
      {/* Dynamic "New Products" bar/section: Only visible if a product was added within last 30 days! */}
      {newProducts.length > 0 && (
        <section className="catalog-section new-products-section">
          <div className="section-heading">
            <div>
              <span className="theme-emoji">🔥</span> <span className="eyebrow">{t("new").toUpperCase()}</span>
              <h2>{t("newProducts")}</h2>
            </div>
          </div>
          <motion.div className="product-grid" layout>
            <AnimatePresence mode="popLayout">
              {newProducts.map((product, index) => (
                <motion.div key={product.id} layout initial={{ opacity: 0, scale: .9, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0, transition: { delay: index * .05, duration: .4, ease: [0.22, 1, 0.36, 1] } }} exit={{ opacity: 0, scale: .9, transition: { duration: .2 } }}>
                  <div style={{ position: "relative" }}>
                    <ProductCard product={product} onOpen={() => go(`/product/${product.slug || product.id}`)} onAdd={() => undefined} />
                    <span className="product-new">{t("new")}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </section>
      )}

      <section className="catalog-section" id="products"><div className="section-heading"><div><span className="eyebrow">{t("varieties")}</span><h2>{lang === "ar" ? "تشكيلتنا الكاملة" : lang === "tr" ? "Koleksiyonumuz" : "Our Collection"}</h2></div><button className="text-link" onClick={() => setCategory("All")}>{t("all")} <Icon name="arrow" size={15} /></button></div>
        <div className="category-tabs">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={category === item ? "active" : ""} style={{ position: "relative" }}>{category === item && <motion.span layoutId="cat-pill" className="category-pill-bg" transition={{ type: "spring", damping: 26, stiffness: 380 }} />}<span style={{ position: "relative", zIndex: 1 }}>{item === "All" ? t("all") : item}</span></button>)}</div>
        <motion.div className="product-grid" layout><AnimatePresence mode="popLayout">{visible.map((product, index) => <motion.div key={product.id} layout initial={{ opacity: 0, scale: .9, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0, transition: { delay: index * .05, duration: .4, ease: [0.22, 1, 0.36, 1] } }} exit={{ opacity: 0, scale: .9, transition: { duration: .2 } }}><ProductCard product={product} onOpen={() => go(`/product/${product.slug || product.id}`)} onAdd={() => undefined} /></motion.div>)}</AnimatePresence></motion.div>
      </section>
      <section className="values-section"><div className="value-item"><span className="value-icon">✦</span><strong>{lang === "ar" ? "دفعات صغيرة" : "Small batch"}</strong><span>{lang === "ar" ? "مصنوعة بصبر" : "Made with patience"}</span></div><div className="value-item"><span className="value-icon">❋</span><strong>{lang === "ar" ? "مكونات نقية" : "Pure ingredients"}</strong><span>{lang === "ar" ? "بدون إضافات غير ضرورية" : "Nothing unnecessary"}</span></div><div className="value-item"><span className="value-icon">◌</span><strong>{lang === "ar" ? "توصيل طازج" : "Fresh delivery"}</strong><span>{lang === "ar" ? "إلى باب منزلك" : "At your doorstep"}</span></div></section>
    </main>
    <footer className="store-footer"><Brand /><p>Unique Egyptian flavors, made with care.</p><span className="brand-domain">gebna-a.app</span><span>© 2026 Gebna-A</span></footer><WhatsAppFab />
  </div>;
}

function SplashPage({ go }: { go: (path: string) => void }) {
  return <main className="splash-page"><motion.div className="splash-orb splash-orb-one" animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.75, 0.5] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} /><motion.div className="splash-orb splash-orb-two" animate={{ scale: [1, 1.16, 1], opacity: [0.35, 0.6, 0.35] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.2 }} /><div className="splash-content"><motion.div className="splash-logo" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 11, stiffness: 140, delay: .15 }}><motion.img src={LOGO} alt="Gebna-A" animate={{ y: [0, -7, 0] }} transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: .8 }} /></motion.div><motion.p className="splash-overline" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .65 }}>A TASTE OF HOME</motion.p><motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .8, duration: .65, ease: [0.22, 1, 0.36, 1] }}>GEBNA <span>A</span></motion.h1><motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.15 }}>Finest Egyptian artisan cheese in Turkey</motion.p><motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}><Button variant="yellow" onClick={() => go("/home")}>Enter the collection <Icon name="arrow" size={18} /></Button></motion.div><motion.button type="button" className="splash-domain" onClick={() => go("/home")} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}><span className="splash-domain-dot" />gebna-a.app</motion.button></div><motion.div className="splash-footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}><span>Handcrafted · Authentic · Delicious</span><span>Est. 2024</span></motion.div></main>;
}

function StarRow({ value, className = "" }: { value: number; className?: string }) {
  const percent = Math.max(0, Math.min(100, (value / 5) * 100));
  return <span className={`star-row ${className}`} role="img" aria-label={`${value.toFixed(1)} out of 5`}><span className="star-row-base">★★★★★</span><span className="star-row-fill" style={{ width: `${percent}%` }}>★★★★★</span></span>;
}

function ProductDetailPage({ product, go, addToCart, cartCount, user }: { product: Product; go: (path: string) => void; addToCart: (product: Product, size?: "300g" | "600g" | "single", flavor?: string) => void; cartCount: number; user: User | null }) {
  const { t, lang } = useI18n();
  const display = productText(product, lang);
  const isSandwich = product.productType === "sandwich";
  const [size, setSize] = useState<"300g" | "600g" | "single">(isSandwich ? "single" : "600g");
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [flavor, setFlavor] = useState<FlavorChoice | "">("");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [autoSwipe, setAutoSwipe] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [loadedFlavors, setLoadedFlavors] = useState<string[]>(["Spicy 🌶", "Cool ❄️", "Herb 🌿", "Smoked 🔥", "Classic"]);
  const [reviews, setReviews] = useState<Array<{ id: string; customerName: string; rating: number | string; comment: string; createdAt: string }>>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState("");
  useEffect(() => {
    try {
      const savedFlavors = window.localStorage.getItem("gebna-flavors-list");
      if (savedFlavors) setLoadedFlavors(JSON.parse(savedFlavors));
    } catch { /* fallback to defaults */ }
  }, []);
  useEffect(() => {
    fetch(`/api/reviews?productId=${product.id}`).then((r) => r.ok ? r.json() : []).then((data) => setReviews(data)).catch(() => undefined);
  }, [product.id]);
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 600], [0, 58]);
  const gallery = isSandwich ? (product.images?.length ? product.images : [product.image]) : size === "300g" ? (product.images300g?.length ? product.images300g : [product.image]) : (product.images600g?.length ? product.images600g : [product.image]);
  const selectedImage = gallery[galleryIndex % gallery.length] || product.image;
  const currentPrice = isSandwich ? (product.priceSingle || 0) : size === "300g" ? product.price300 : product.price600;
  const touchRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef(0);
  useEffect(() => { if (gallery.length <= 1) return; if (!autoSwipe) return; const id = window.setInterval(() => setGalleryIndex((i) => (i + 1) % gallery.length), 3000); return () => window.clearInterval(id); }, [gallery.length, autoSwipe]);
  const swipeStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; setAutoSwipe(false); };
  const swipeEnd = (e: React.TouchEvent) => { const diff = e.changedTouches[0].clientX - touchStart.current; if (diff < -40 && galleryIndex < gallery.length - 1) setGalleryIndex((i) => i + 1); else if (diff > 40 && galleryIndex > 0) setGalleryIndex((i) => i - 1); else setAutoSwipe(true); };
  const toggleFlavor = (f: string) => setSelectedFlavors((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  const handleAdd = () => { if (isSandwich && selectedFlavors.length === 0) { setError(lang === "ar" ? "اختر نكهة واحدة على الأقل" : lang === "tr" ? "En az bir lezzet seçin" : "Choose at least one flavor"); return; } if (!isSandwich && !flavor) { setError(lang === "ar" ? "اختر النكهة" : lang === "tr" ? "Lezzet seçin" : "Choose your flavor"); return; } setError(""); addToCart(product, isSandwich ? "single" : size, isSandwich ? selectedFlavors.join(",") : flavor); setAdded(true); window.setTimeout(() => setAdded(false), 1300); };
  const reviewCount = reviews.length;
  const averageRating = reviewCount ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviewCount : 0;
  const handleReviewSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      setReviewError(lang === "ar" ? "سجّل الدخول لإضافة تعليق" : lang === "tr" ? "Yorum eklemek için giriş yapın" : "Sign in to add a review");
      return;
    }
    if (!reviewForm.rating) {
      setReviewError(lang === "ar" ? "اختر عدد النجوم" : lang === "tr" ? "Yıldız sayısını seçin" : "Please choose a star rating");
      return;
    }
    if (!reviewForm.comment.trim()) {
      setReviewError(lang === "ar" ? "الرجاء كتابة تعليقك" : lang === "tr" ? "Lütfen yorumunuzu yazın" : "Please write your comment");
      return;
    }
    setReviewError("");
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: reviewForm.rating, comment: reviewForm.comment, productId: product.id, userId: user.id, customerName: user.name }),
    });
    const data = await response.json();
    if (!response.ok) {
      setReviewError(data.error || "Failed to submit review");
      return;
    }
    setReviewSubmitted(true);
    setReviewForm({ rating: 0, comment: "" });
    setHoverRating(0);
    window.setTimeout(() => setReviewSubmitted(false), 3000);
    fetch(`/api/reviews?productId=${product.id}`).then((r) => r.ok ? r.json() : []).then((data) => setReviews(data)).catch(() => undefined);
  };
  return <div className="store-page"><StoreHeader go={go} cartCount={cartCount} /><main className="detail-main"><button className="back-link" onClick={() => go("/home")}><Icon name="arrow" size={16} /> {t("back")}</button><div className="detail-layout"><div className="detail-image-wrap" ref={touchRef} onTouchStart={swipeStart} onTouchEnd={swipeEnd}><motion.img src={selectedImage} alt={display.name} style={{ y: imageY }} /><span className="detail-stamp"><img src={LOGO} alt="Gebna-A" /></span>{gallery.length > 1 && <div className="detail-dots">{gallery.map((image, index) => { const distance = Math.min(2, Math.abs(index - galleryIndex)); return <button key={`${image}-${index}`} className={`detail-dot dist-${distance} ${index === galleryIndex ? "is-active" : ""}`} aria-label={`View photo ${index + 1}`} onClick={() => { setGalleryIndex(index); setAutoSwipe(false); }} />; })}</div>}</div><div className="detail-copy"><span className="eyebrow">{product.category.toUpperCase()} {isSandwich ? "SANDWICH" : "CHEESE"}</span><h1>{display.name}</h1><div className="detail-rating"><StarRow value={reviewCount ? averageRating : 5} /> <span>{reviewCount ? `${averageRating.toFixed(1)} · ${reviewCount} ${lang === "ar" ? "تقييم" : lang === "tr" ? "değerlendirme" : reviewCount === 1 ? "review" : "reviews"}` : lang === "ar" ? "مصنوعة بعناية" : "Handcrafted with care"}</span></div><p className="detail-description">{display.description} {lang === "ar" ? "محضّرة بمكونات مختارة بعناية وروح المطبخ المصري." : "Prepared with carefully selected ingredients and the spirit of an Egyptian kitchen."}</p>{!isSandwich && <><div className="option-label"><span>{t("size")}</span><span className="option-hint">{lang === "ar" ? "اختر الحجم" : "Select one"}</span></div><div className="size-options">{(["300g", "600g"] as const).map((item) => <button key={item} className={size === item ? "selected" : ""} onClick={() => { setSize(item); setGalleryIndex(0); }}><span>{item}</span><b>₺{item === "300g" ? product.price300 : product.price600}</b></button>)}</div></>}{isSandwich && <><div className="option-label"><span>{t("flavors")}</span><span className="option-hint">{t("flavorsNote")}</span></div><div className="flavor-grid">{loadedFlavors.map((f) => <button key={f} className={`flavor-chip ${selectedFlavors.includes(f) ? "selected" : ""}`} onClick={() => toggleFlavor(f)}>{f}</button>)}</div></>}{!isSandwich && <><div className="option-label flavor-label"><span>{t("flavor")}</span><span className="option-hint">{t("required")}</span></div><div className="flavor-options"><button className={flavor === "cool" ? "selected cool" : ""} onClick={() => { setFlavor("cool"); setError(""); }}>{t("cool")}</button><button className={flavor === "spicy" ? "selected spicy" : ""} onClick={() => { setFlavor("spicy"); setError(""); }}>{t("spicy")}</button><button className={flavor === "veryhot" ? "selected veryhot" : ""} onClick={() => { setFlavor("veryhot"); setError(""); }}>{t("veryHot")}</button></div></>}{error && <p className="form-error">{error}</p>}<div className="detail-actions"><span className="big-price">₺{currentPrice}</span><Button onClick={handleAdd}>{added ? "✓ Added to cart" : <><Icon name="bag" size={17} /> {t("add")}</>}</Button></div><div className="detail-note"><img src={LOGO} alt="Gebna-A" /><p>{lang === "ar" ? "تعبأ طازجة لك. الطلبات متاحة السبت والأحد." : "Freshly packed for you. Orders are accepted every Saturday and Sunday."}</p></div></div></div><section className="reviews-section"><h2>{lang === "ar" ? "التعليقات والتقييمات" : lang === "tr" ? "Yorumlar ve Değerlendirmeler" : "Reviews & Ratings"}</h2>{reviews.length === 0 ? <p className="no-reviews">{lang === "ar" ? "لا توجد تعليقات بعد. كن أول من يعلق!" : lang === "tr" ? "Henüz yorum yok. İlk yorumu sen yap!" : "No reviews yet. Be the first to review!"}</p> : <div className="reviews-list">{reviews.map((review) => <div key={review.id} className="review-card"><div className="review-header"><StarRow value={Number(review.rating)} className="review-stars" /><span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span></div><h4>{review.customerName}</h4><p>{review.comment}</p></div>)}</div>}{user ? <form className="review-form" onSubmit={handleReviewSubmit}><h3>{lang === "ar" ? "أضف تعليقك" : lang === "tr" ? "Yorumunuzu ekleyin" : "Add your review"}</h3>{reviewSubmitted && <p className="success-message">{lang === "ar" ? "✓ شكراً! تم نشر تعليقك" : lang === "tr" ? "✓ Teşekkürler! Yorumunuz yayınlandı" : "✓ Thank you! Your review has been published"}</p>}{reviewError && <p className="form-error">{reviewError}</p>}<div className="review-author"><span className="review-avatar">{user.name.slice(0, 2).toUpperCase()}</span><div><b>{user.name}</b><span>{lang === "ar" ? "سيُنشر باسم حسابك" : lang === "tr" ? "Hesap adınızla yayınlanacak" : "Posted with your account name"}</span></div></div><div className="field"><span>{lang === "ar" ? "التقييم" : lang === "tr" ? "Değerlendirme" : "Rating"} *</span><div className="star-rating" onMouseLeave={() => setHoverRating(0)}>{[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" aria-label={`${star} ${star === 1 ? "star" : "stars"}`} className={star <= (hoverRating || reviewForm.rating) ? "active" : ""} onMouseEnter={() => setHoverRating(star)} onFocus={() => setHoverRating(star)} onClick={() => { setHoverRating(star); setReviewForm({ ...reviewForm, rating: star }); setReviewError(""); }}>★</button>)}<b className="star-rating-value">{(hoverRating || reviewForm.rating) ? `${hoverRating || reviewForm.rating}/5` : ""}</b></div></div><label className="field"><span>{lang === "ar" ? "التعليق" : lang === "tr" ? "Yorum" : "Comment"} *</span><textarea rows={3} value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} required /></label><Button type="submit" variant="yellow">{lang === "ar" ? "إرسال التعليق" : lang === "tr" ? "Gönder" : "Submit review"}</Button></form> : <div className="review-login-card"><div className="empty-icon"><Icon name="lock" size={24} /></div><h3>{lang === "ar" ? "سجّل الدخول للتقييم" : lang === "tr" ? "Değerlendirmek için giriş yapın" : "Sign in to leave a review"}</h3><p>{lang === "ar" ? "يُنشر التعليق باسم حسابك تلقائياً." : lang === "tr" ? "Yorumunuz hesap adınızla yayınlanır." : "Your review is published with your account name."}</p><Button variant="yellow" onClick={() => go("/login")}>{t("login")} <Icon name="arrow" size={16} /></Button></div>}</section></main></div>;
}

function CartPage({ cart, go, updateQuantity, removeItem, updateFlavor }: { cart: CartItem[]; go: (path: string) => void; updateQuantity: (key: string, amount: number) => void; removeItem: (key: string) => void; updateFlavor: (key: string, flavor: FlavorChoice) => void }) {
  const { t, lang } = useI18n();
  const total = cart.reduce((sum, item) => sum + item.linePrice * item.quantity, 0);
  return <div className="store-page"><StoreHeader go={go} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} /><main className="simple-main"><PageTitle eyebrow={lang === "ar" ? "اختياراتك" : "YOUR SELECTION"} title={t("cartTitle")} copy={cart.length ? `${cart.length} ${lang === "ar" ? "منتج مختار" : "carefully chosen item(s)"}` : undefined} />{cart.length === 0 ? <EmptyState icon="bag" title={t("emptyCart")} copy={lang === "ar" ? "اكتشف أصناف الجبن وأضف المفضلة لديك." : "Explore our cheeses and add your favorites."} button={t("shopNow")} onClick={() => go("/home")} /> : <div className="cart-layout"><div className="cart-list">{cart.map((item) => { const key = `${item.id}-${item.size}-${item.flavorChoice}`; return <div className="cart-item" key={key}><img src={item.image} alt={item.name} /><div className="cart-item-copy"><h3>{item.name}</h3><span>{item.size === "single" ? "Sandwich" : item.size} · ₺{item.linePrice} each</span><div className="cart-flavor"><button className={item.flavorChoice === "cool" ? "selected cool" : ""} onClick={() => updateFlavor(key, "cool")}>{t("cool")}</button><button className={item.flavorChoice === "spicy" ? "selected spicy" : ""} onClick={() => updateFlavor(key, "spicy")}>{t("spicy")}</button><button className={item.flavorChoice === "veryhot" ? "selected veryhot" : ""} onClick={() => updateFlavor(key, "veryhot")}>{t("veryHot")}</button></div><div className="quantity-control"><button onClick={() => updateQuantity(key, -1)}>−</button><b>{item.quantity}</b><button onClick={() => updateQuantity(key, 1)}>+</button></div></div><div className="cart-item-right"><b>₺{item.linePrice * item.quantity}</b><button onClick={() => removeItem(key)} aria-label="Remove"><Icon name="trash" size={16} /></button></div></div>; })}</div><aside className="summary-card"><h2>{lang === "ar" ? "ملخص الطلب" : "Order Summary"}</h2><div className="summary-line"><span>Subtotal</span><b>₺{total}</b></div><div className="summary-line"><span>Delivery</span><span>Calculated at checkout</span></div><div className="summary-total"><span>Total</span><b>₺{total}</b></div><Button className="full-width" onClick={() => go("/checkout")}>{t("checkout")} <Icon name="arrow" size={16} /></Button><button className="continue-link" onClick={() => go("/home")}>{t("back")}</button></aside></div>}</main></div>;
}

function EmptyState({ icon, title, copy, button, onClick }: { icon: IconName; title: string; copy: string; button: string; onClick: () => void }) {
  return <div className="empty-state"><div className="empty-icon"><Icon name={icon} size={28} /></div><h2>{title}</h2><p>{copy}</p><Button onClick={onClick}>{button} <Icon name="arrow" size={16} /></Button></div>;
}

function CheckoutPage({ cart, go, clearCart, user }: { cart: CartItem[]; go: (path: string) => void; clearCart: () => void; user: User | null }) {
  const { t, lang } = useI18n();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const total = cart.reduce((sum, item) => sum + item.linePrice * item.quantity, 0);
  const shareLocation = () => { if (!navigator.geolocation) { setError("Location sharing is not supported on this device."); return; } navigator.geolocation.getCurrentPosition((position) => setCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude }), () => setError("Please allow location access or enter your address manually.")); };
  if (!user) return <div className="store-page"><StoreHeader go={go} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} /><main className="simple-main"><div className="auth-required-card"><div className="empty-icon"><Icon name="lock" size={28} /></div><h1>{t("accountRequired")}</h1><p>{lang === "ar" ? "يمكنك تصفح المتجر بحرية، لكن يلزم تسجيل الدخول لحماية بيانات الطلب." : "Browse freely, but sign in to securely place and track your order."}</p><Button onClick={() => go("/login")}>{t("login")} <Icon name="arrow" size={16} /></Button></div></main></div>;
  if (submitted) return <div className="store-page"><StoreHeader go={go} cartCount={0} /><main className="success-main"><div className="success-mark">✓</div><span className="eyebrow">{lang === "ar" ? "شكراً لطلبك" : "THANK YOU FOR YOUR ORDER"}</span><h1>{t("orderPlaced")}</h1><p>{lang === "ar" ? `تم حفظ طلبك برمز ${orderCode}. سنتواصل معك قريباً للتأكيد.` : `Your order ${orderCode} is saved. We will contact you shortly to confirm the details.`}</p><div className="success-actions">{whatsappUrl && <a className="btn btn-primary" href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp handoff <Icon name="arrow" size={16} /></a>}<Button variant="outline" onClick={() => go("/orders")}>{t("track")} <Icon name="arrow" size={16} /></Button></div></main></div>;
  return <div className="store-page"><StoreHeader go={go} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} /><main className="simple-main"><button className="back-link" onClick={() => go("/cart")}><Icon name="arrow" size={16} /> {t("back")}</button><div className="checkout-layout"><section><PageTitle eyebrow={lang === "ar" ? "تقريباً انتهينا" : "ALMOST THERE"} title={t("complete")} copy={lang === "ar" ? "أخبرنا أين نرسل اختياراتك." : "Tell us where to deliver your favorites."} /><form className="checkout-form" onSubmit={async (event) => { event.preventDefault(); if (!isOrderingDay()) { setError(lang === "ar" ? "نستقبل الطلبات السبت والأحد فقط." : lang === "tr" ? "Siparişleri yalnızca Cumartesi ve Pazar alıyoruz." : "Orders are accepted Saturday & Sunday only."); return; } setLoading(true); setError(""); const form = new FormData(event.currentTarget); const payload = { customerName: String(form.get("fullName") || ""), customerPhone: String(form.get("phone") || ""), customerEmail: user.email, deliveryAddress: String(form.get("address") || ""), deliveryCity: String(form.get("city") || ""), deliveryDistrict: String(form.get("district") || ""), building: String(form.get("building") || ""), floor: String(form.get("floor") || ""), door: String(form.get("door") || ""), notes: String(form.get("notes") || ""), locationLat: coordinates?.lat, locationLng: coordinates?.lng, items: cart.map((item) => ({ productId: item.id, size: item.size, quantity: item.quantity, flavorChoice: item.flavorChoice })) }; const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); const data = await response.json(); setLoading(false); if (!response.ok) { setError(data.error || "Could not place order."); return; } if (form.get("saveLocation") === "on") await fetch("/api/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ city: payload.deliveryCity, district: payload.deliveryDistrict, address: payload.deliveryAddress, building: payload.building, floor: payload.floor, door: payload.door, locationLat: payload.locationLat, locationLng: payload.locationLng }) }); setOrderCode(data.order.orderCode); setWhatsappUrl(data.whatsappUrl || ""); clearCart(); setSubmitted(true); }}>{!isOrderingDay() && <div className="checkout-closed-banner"><span className="weekend-dot closed" /><div><b>{lang === "ar" ? "الطلبات مغلقة الآن" : lang === "tr" ? "Siparişler şu an kapalı" : "Orders are closed right now"}</b><p>{lang === "ar" ? "جهّز سلتك الآن وسنستقبل طلبك السبت أو الأحد." : lang === "tr" ? "Sepetinizi şimdi hazırlayın; siparişinizi Cumartesi veya Pazar alacağız." : "Prepare your cart now — we'll accept your order on Saturday or Sunday."}</p></div></div>}<div className="form-grid"><Field label={t("fullName")} name="fullName" placeholder={user.name} required /><Field label={t("phone")} name="phone" placeholder={user.phone} required /></div><Field label={t("address")} name="address" placeholder="Street, building, apartment" required /><div className="form-grid"><Field label={t("city")} name="city" placeholder="Istanbul" required /><Field label={t("district")} name="district" placeholder="Your district" /></div><div className="form-grid"><Field label={t("building")} name="building" placeholder="Building" /><Field label={t("floor")} name="floor" placeholder="Floor" /><Field label={t("door")} name="door" placeholder="Door" /></div><button type="button" className={`location-button ${coordinates ? "active" : ""}`} onClick={shareLocation}><Icon name="globe" size={16} /> {coordinates ? `Location shared · ${coordinates.lat.toFixed(3)}, ${coordinates.lng.toFixed(3)}` : "Share my location"}</button><label className="save-location"><input type="checkbox" name="saveLocation" /> Save this address to my account</label><Field label={t("notes")} name="notes" placeholder="Anything we should know?" textarea />{error && <p className="form-error">{error}</p>}<Button type="submit" className="full-width" disabled={!isOrderingDay()}><span className={`btn-open-dot ${isOrderingDay() ? "open" : "closed"}`} />{!isOrderingDay() ? (lang === "ar" ? "مفتوح السبت والأحد" : lang === "tr" ? "Cumartesi ve Pazar açık" : "Open Sat & Sun") : loading ? "Saving..." : t("place")} <Icon name="arrow" size={16} /></Button></form></section><aside className="summary-card checkout-summary"><h2>{lang === "ar" ? "طلبك" : "Your order"}</h2>{cart.length === 0 ? <p className="muted">{t("emptyCart")}</p> : <>{cart.map((item) => <div className="mini-line" key={`${item.id}-${item.size}-${item.flavorChoice}`}><span>{item.name} <small>{item.size === "single" ? "Sandwich" : item.size} · {item.flavorChoice === "spicy" ? t("spicy") : item.flavorChoice === "veryhot" ? t("veryHot") : t("cool")} × {item.quantity}</small></span><b>₺{item.linePrice * item.quantity}</b></div>)}<div className="summary-total"><span>Total</span><b>₺{total}</b></div></>}</aside></div></main></div>;
}

function Field({ label, name, placeholder = "", required = false, textarea = false, value, onChange }: { label: string; name?: string; placeholder?: string; required?: boolean; textarea?: boolean; value?: string; onChange?: (value: string) => void }) {
  const controlled = value !== undefined && onChange;
  return <label className="field"><span>{label}{required && <i> *</i>}</span>{textarea ? <textarea name={name} placeholder={placeholder} rows={3} value={value} onChange={controlled ? (event) => onChange(event.target.value) : undefined} /> : <input name={name} placeholder={placeholder} required={required} value={value} onChange={controlled ? (event) => onChange(event.target.value) : undefined} />}</label>;
}

function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode }) {
  return <main className="auth-page"><div className="auth-logo"><Brand /></div><div className="auth-card"><div className="auth-icon"><span>🧀</span></div><h1>{title}</h1><p className="auth-subtitle">{subtitle}</p>{children}</div><p className="auth-footer">{footer}</p></main>;
}

function LoginPage({ go, onAuth }: { go: (path: string) => void; onAuth: (user: User) => void }) {
  const { t, lang } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => { const saved = window.localStorage.getItem("gebna-remember-email"); if (saved) setRemember(true); }, []);
  return <AuthLayout title={t("login")} subtitle={lang === "ar" ? "سجّل الدخول إلى حسابك" : "Log in to your account"} footer={<>{lang === "ar" ? "ليس لديك حساب؟" : "Don't have an account?"} <button onClick={() => go("/register")}>{t("register")}</button></>}><div className="auth-phone-note"><Icon name="phone" size={14} /> Phone verification is required for every login.</div><div className="or-divider"><span>or</span></div>{error && <p className="form-error">{error}</p>}<form className="auth-form" onSubmit={async (event) => { event.preventDefault(); setLoading(true); setError(""); const form = new FormData(event.currentTarget); const email = form.get("email") as string; const phone = form.get("phone") as string; const password = form.get("password") as string; if (remember) { window.localStorage.setItem("gebna-remember-email", email); window.localStorage.setItem("gebna-remember-phone", phone); } else { window.localStorage.removeItem("gebna-remember-email"); window.localStorage.removeItem("gebna-remember-phone"); } const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, phone, password, remember }) }); const data = await response.json(); setLoading(false); if (!response.ok) { setError(data.error || "Unable to log in."); return; } onAuth(data.user); go(data.user.role === "admin" || data.user.role === "owner" ? "/admin" : "/home"); }}><Field label="Email" name="email" placeholder="you@example.com" required /><Field label={t("phone")} name="phone" placeholder="+90 551 066 82 89" required /><label className="field"><div className="field-label-row"><span>Password *</span><button type="button" onClick={() => go("/forgot-password")}>Forgot password?</button></div><div className="password-wrap"><input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button></div></label><label className="remember-row"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> <span>{t("rememberMe")}</span></label><Button type="submit" className="full-width">{loading ? "Signing in..." : t("login")}</Button></form></AuthLayout>;
}

function RegisterPage({ go, onAuth }: { go: (path: string) => void; onAuth: (user: User) => void }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  return <AuthLayout title="Create an account" subtitle="Join the Gebna-A family" footer={<>Already have an account? <button onClick={() => go("/login")}>Log in</button></>}><form className="auth-form" onSubmit={async (event) => { event.preventDefault(); setLoading(true); setError(""); const form = new FormData(event.currentTarget); const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email: form.get("email"), phone: form.get("phone"), password: form.get("password") }) }); const data = await response.json(); setLoading(false); if (!response.ok) { setError(data.error || "Unable to create account."); return; } onAuth(data.user); go("/home"); }}><Field label="Full Name" name="name" placeholder="Your name" required /><Field label="Email" name="email" placeholder="you@example.com" required /><Field label="Phone Number" name="phone" placeholder="+90 551 066 82 89" required /><Field label="Password" name="password" placeholder="••••••••" required />{error && <p className="form-error">{error}</p>}<Button type="submit" className="full-width">{loading ? "Creating..." : "Create account"}</Button></form></AuthLayout>;
}

function PasswordPage({ go, reset = false }: { go: (path: string) => void; reset?: boolean }) {
  const [sent, setSent] = useState(false);
  return <AuthLayout title={reset ? "Set a new password" : "Reset password"} subtitle={reset ? "Choose a strong password for your account" : "We&apos;ll send you a link to reset it"} footer={<button onClick={() => go("/login")} className="back-auth">← Back to log in</button>}>{sent ? <div className="sent-message"><span>✓</span><p>If an account exists with that email, you&apos;ll receive a password reset link shortly.</p></div> : <form className="auth-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>{!reset && <Field label="Email" placeholder="you@example.com" required />}{reset && <><Field label="New password" placeholder="••••••••" required /><Field label="Confirm password" placeholder="••••••••" required /></>}<Button type="submit" className="full-width">{reset ? "Update password" : "Send reset link"}</Button></form>}</AuthLayout>;
}

function OrdersPage({ go }: { go: (path: string) => void }) {
  const { t, lang } = useI18n();
  const [orders, setOrders] = useState<Array<{ orderCode: string; status: string; total: number; customerName: string; createdAt: string; items: Array<{ productName: string; size: string; flavorChoice: string; quantity: number }> }>>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  return <div className="store-page"><StoreHeader go={go} cartCount={0} /><main className="simple-main"><PageTitle eyebrow={lang === "ar" ? "حسابك" : "YOUR ACCOUNT"} title={t("track")} copy={lang === "ar" ? "ابحث عن طلبك باستخدام الرمز ورقم الهاتف." : "Find an order using its code and the customer phone number."} /><form className="tracking-form" onSubmit={async (event) => { event.preventDefault(); setLoading(true); setError(""); const form = new FormData(event.currentTarget); const response = await fetch(`/api/orders?code=${encodeURIComponent(String(form.get("code")))}&phone=${encodeURIComponent(String(form.get("phone")))}`); const data = await response.json(); setLoading(false); if (!response.ok || !data.orders?.length) { setOrders([]); setError(data.error || t("noOrders")); return; } setOrders(data.orders); }}><Field label={t("code")} name="code" placeholder="GA-ABC123" required /><Field label={t("phone")} name="phone" placeholder="+90 551 066 82 89" required /><Button type="submit">{loading ? "Searching..." : t("searchOrder")} <Icon name="search" size={15} /></Button></form>{error && <p className="form-error tracking-error">{error}</p>}{orders.length ? <div className="tracking-results">{orders.map((order) => <article className="tracking-card" key={order.orderCode}><div><span className="eyebrow">{order.orderCode}</span><h2>{order.customerName}</h2><p>{new Date(order.createdAt).toLocaleString()} · {order.items.length} item(s)</p></div><div className={`tracking-status status-${order.status}`}><span>{order.status}</span><b>₺{order.total}</b></div><div className="tracking-items">{order.items.map((item, index) => <span key={`${item.productName}-${index}`}>{item.productName} · {item.size} · {item.flavorChoice} × {item.quantity}</span>)}</div></article>)}</div> : <div className="orders-empty"><div className="orders-icon"><Icon name="orders" size={30} /></div><h2>{t("noOrders")}</h2><p>{lang === "ar" ? "ستظهر طلباتك هنا بعد إتمام الشراء." : "Your order status will appear here after checkout."}</p><Button onClick={() => go("/home")}>{t("shopNow")} <Icon name="arrow" size={16} /></Button></div>}</main></div>;
}

function StatCard({ icon, label, value, detail, accent = "green" }: { icon: IconName; label: string; value: string; detail: string; accent?: "green" | "yellow" | "purple" | "blue" }) {
  return <motion.div className={`stat-card accent-${accent}`} variants={fadeUp} whileHover={{ y: -4 }} transition={{ type: "spring", damping: 16, stiffness: 300 }}><div className="stat-icon"><Icon name={icon} size={19} /></div><span>{label}</span><strong>{value}</strong><small>{detail}</small></motion.div>;
}

type AdminProduct = { id: string; nameEn: string; nameTr: string; nameAr: string; descriptionEn: string; descriptionTr: string; descriptionAr: string; productType: string; price300g: string; price600g: string; priceSingle: string | null; mainImage: string | null; images: string[]; images300g: string[]; images600g: string[]; tags: string[]; stockStatus: string; featured: boolean; active: boolean; };

function AdminPage({ go, user, catalog }: { go: (path: string) => void; user: User | null; catalog: Product[] }) {
  const [tab, setTab] = useState("Overview");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState("");
  const tabs = [["Overview", "dashboard"], ["Products", "bag"], ["Orders", "orders"], ["Offers", "spark"], ["Varieties (الأصناف)", "spark"], ["Flavors (النكهات)", "spark"], ["Database", "users"], ["Sales Report", "orders"], ["Settings / Themes", "settings"], ["AI Assistant", "spark"]] as const;
  const openAdd = () => { setEditing(null); setShowForm(true); };
  const openEdit = (product: AdminProduct) => { setEditing(product); setShowForm(true); };
  const onSaved = (msg: string) => { setShowForm(false); setToast(msg); setRefreshKey((key) => key + 1); window.setTimeout(() => setToast(""), 2600); };
  if (!user || !["admin", "owner"].includes(user.role)) return <div className="admin-gate"><Brand /><div className="admin-gate-icon"><Icon name="lock" size={30} /></div><h1>Admin access only</h1><p>This dashboard is protected. Sign in with an owner or admin account to continue.</p><Button onClick={() => go("/login")}>Admin login <Icon name="arrow" size={16} /></Button></div>;
  return <div className="admin-page"><aside className="admin-sidebar"><button className="admin-brand" onClick={() => go("/home")}><Brand /><span className="admin-label">Admin Dashboard</span></button><div className="admin-nav">{tabs.map(([name, icon]) => <button key={name} onClick={() => setTab(name)} className={tab === name ? "active" : ""}><Icon name={icon} size={18} />{name}</button>)}</div><div className="admin-sidebar-bottom"><button onClick={() => go("/settings")}><Icon name="settings" size={17} /> Settings</button><button onClick={() => go("/home")}><Icon name="logout" size={17} /> Back to store</button><div className="admin-user"><div className="admin-avatar">{user.name.slice(0, 2).toUpperCase()}</div><div><b>{user.name}</b><span>{user.role}</span></div><Icon name="chevron" size={14} /></div></div></aside><main className="admin-content"><header className="admin-topbar"><button className="mobile-admin-brand" onClick={() => go("/home")}><Brand /></button><div><span className="admin-kicker">Gebna-A · ADMIN</span><h1>{tab}</h1></div><div className="admin-top-actions"><button className="admin-notification">●<span /></button><button className="admin-profile">{user.name.slice(0, 2).toUpperCase()} <Icon name="chevron" size={14} /></button></div></header>{tab === "Overview" && <AdminOverview go={go} />}{tab === "Products" && <AdminProducts key={refreshKey} onAdd={openAdd} onEdit={openEdit} />}{tab === "Orders" && <AdminOrders />}{tab === "Offers" && <AdminOffers />}{["Varieties (الأصناف)", "Flavors (النكهات)", "Database", "Sales Report", "Settings / Themes"].includes(tab) && <AdminToolsPanel tab={tab} catalog={catalog} />}{tab === "AI Assistant" && <AdminAI />}<AnimatePresence>{showForm && <ProductFormModal key={editing?.id || "new"} product={editing} onClose={() => setShowForm(false)} onSaved={onSaved} />}</AnimatePresence><AnimatePresence>{toast && <motion.div className="toast" initial={{ opacity: 0, y: 24, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: 20, x: 20 }} transition={{ type: "spring", damping: 18, stiffness: 320 }}>{toast}</motion.div>}</AnimatePresence></main></div>;
}

type OverviewData = {
  metrics: { totalOrders: number; totalRevenue: number; pendingOrders: number; confirmedOrders: number; deliveredOrders: number; customers: number; products: number; averageOrder: number };
  monthly: { label: string; revenue: number }[];
  maxRevenue: number;
  recent: { orderCode: string; customerName: string; total: number; status: string; createdAt: string }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
};

function AdminOverview({ go }: { go: (path: string) => void }) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/admin/overview").then((response) => response.ok ? response.json() : null).then((payload) => setData(payload || null)).finally(() => setLoading(false)).catch(() => setLoading(false)); }, []);
  const today = new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  if (loading) return <div className="admin-body"><div className="overview-skeleton" /></div>;
  const m = data?.metrics;
  const monthly = data?.monthly || [];
  const maxRevenue = data?.maxRevenue || 1;
  const chartW = 600, chartH = 190, pad = 6;
  const points = monthly.length ? monthly.map((entry, index) => { const x = pad + (index / (monthly.length - 1)) * (chartW - pad * 2); const y = chartH - 14 - (entry.revenue / maxRevenue) * (chartH - 40); return { x, y, ...entry }; }) : [];
  const linePath = points.length ? points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ") : "";
  const areaPath = points.length ? `${linePath} L${points[points.length - 1].x.toFixed(1)} ${chartH - 14} L${points[0].x.toFixed(1)} ${chartH - 14} Z` : "";
  const topScale = maxRevenue || 1;
  const yLabels = [topScale, Math.round(topScale * 0.66), Math.round(topScale * 0.33), 0];
  return <div className="admin-body">
    <div className="admin-welcome"><div><span className="eyebrow">{today.toUpperCase()}</span><h2>{greeting()}, Nedal <span>✦</span></h2><p>{m && m.totalOrders === 0 ? "Your store is live and ready for its first order." : "Here&apos;s what&apos;s happening with your store today."}</p></div><Button variant="outline" onClick={() => go("/home")}>View storefront <Icon name="arrow" size={15} /></Button></div>
    <motion.div className="stat-grid" initial="hidden" animate="show" variants={stagger}>
      <StatCard icon="orders" label="Total Orders" value={String(m?.totalOrders ?? 0)} detail={`${m?.deliveredOrders ?? 0} delivered`} accent="green" />
      <StatCard icon="bag" label="Total Revenue" value={`₺${(m?.totalRevenue ?? 0).toLocaleString()}`} detail={`Avg ₺${(m?.averageOrder ?? 0).toFixed(0)} per order`} accent="yellow" />
      <StatCard icon="clock" label="Pending Orders" value={String(m?.pendingOrders ?? 0)} detail={m && m.pendingOrders > 0 ? "Needs your attention" : "All caught up"} accent="purple" />
      <StatCard icon="users" label="Total Customers" value={String(m?.customers ?? 0)} detail={`${m?.products ?? 0} active products`} accent="blue" />
    </motion.div>
    <div className="dashboard-grid">
      <section className="admin-panel chart-panel">
        <div className="panel-header"><div><h3>Revenue overview</h3><p>Monthly sales performance</p></div><button className="period-button">Last 7 months <Icon name="chevron" size={14} /></button></div>
        <div className="chart-area"><div className="chart-y">{yLabels.map((value) => <span key={value}>₺{value >= 1000 ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k` : value}</span>)}</div>
          <div className="chart"><div className="grid-lines" />
            <svg viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none">
              <defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#309e2b" stopOpacity=".25" /><stop offset="1" stopColor="#309e2b" stopOpacity="0" /></linearGradient></defs>
              {areaPath && <path d={areaPath} fill="url(#chartFill)" />}
              {linePath && <path d={linePath} fill="none" stroke="#309e2b" strokeWidth="3" />}
              {points.map((point) => <circle key={point.label} cx={point.x} cy={point.y} r="3.5" fill="#fff" stroke="#309e2b" strokeWidth="2" />)}
            </svg>
            <div className="chart-x">{monthly.map((entry) => <span key={entry.label}>{entry.label}</span>)}</div>
          </div>
        </div>
      </section>
      <section className="admin-panel recent-panel">
        <div className="panel-header"><div><h3>Recent orders</h3><p>Your latest customer orders</p></div></div>
        <div className="recent-orders">{data?.recent.length ? data.recent.map((order) => <RecentOrder key={order.orderCode} name={order.customerName} id={order.orderCode} amount={`₺${order.total}`} status={order.status} date={order.createdAt} />) : <p className="admin-empty">No orders yet. They&apos;ll appear here as they come in.</p>}</div>
      </section>
    </div>
    {(data?.topProducts.length ?? 0) > 0 && <section className="admin-panel top-products"><div className="panel-header"><div><h3>🏆 Top selling products</h3><p>Best performers by quantity sold</p></div></div><div className="top-product-list">{data?.topProducts.map((product, index) => <div className="top-product-row" key={product.name}><span className={`top-rank rank-${index + 1}`}>{index + 1}</span><b>{product.name}</b><div className="top-bar"><div style={{ width: `${Math.max(8, (product.quantity / (data.topProducts[0]?.quantity || 1)) * 100)}%` }} /></div><span className="top-units">{product.quantity} sold</span><strong>₺{product.revenue.toLocaleString()}</strong></div>)}</div></section>}
    <div className="admin-note"><span>✦</span><div><b>Admin Note</b><p>{m && m.totalOrders > 0 ? `You've processed ${m.totalOrders} order(s) and earned ₺${m.totalRevenue.toLocaleString()} in revenue. Keep your catalog fresh!` : "Your store is set up and ready. Share your storefront link to start receiving orders."}</p></div></div>
  </div>;
}

function greeting() { const hour = new Date().getHours(); return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"; }

function RecentOrder({ name, id, amount, status, date }: { name: string; id: string; amount: string; status: string; date?: string }) {
  const relative = date ? relativeDate(date) : "Today";
  return <div className="recent-order"><div className="customer-avatar">{name.split(" ").map((part) => part[0]).join("")}</div><div className="recent-copy"><b>{name}</b><span>{id} · {relative}</span></div><strong>{amount}</strong><span className={`status-pill status-${status.toLowerCase()}`}>{status}</span></div>;
}

function relativeDate(iso: string) {
  const then = new Date(iso); const diff = Date.now() - then.getTime(); const day = 86400000;
  if (diff < day) { const hours = Math.floor(diff / 3600000); return hours < 1 ? "Just now" : `${hours}h ago`; }
  if (diff < day * 2) return "Yesterday";
  return then.toLocaleDateString("en", { month: "short", day: "numeric" });
}

function AdminProducts({ onAdd, onEdit }: { onAdd: () => void; onEdit: (product: AdminProduct) => void }) {
  const [rows, setRows] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const reload = () => fetch("/api/admin/products").then((response) => response.ok ? response.json() : null).then((data) => setRows(data?.products || [])).finally(() => setLoading(false)).catch(() => setLoading(false));
  useEffect(() => { reload(); }, []);
  const filtered = rows.filter((product) => product.nameEn.toLowerCase().includes(query.toLowerCase()));
  const toggleAvailability = async (product: AdminProduct) => { setRows((current) => current.map((item) => item.id === product.id ? { ...item, active: !item.active } : item)); await fetch(`/api/admin/products/${product.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !product.active }) }); };
  const remove = async (product: AdminProduct) => { if (!confirm(`Delete "${product.nameEn}"? This cannot be undone.`)) return; setRows((current) => current.filter((item) => item.id !== product.id)); await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" }); };
  return <div className="admin-body"><div className="admin-section-head"><div><h2>Products <span className="count-badge">{rows.length}</span></h2><p>Manage your cheese collection, images, and availability.</p></div><Button onClick={onAdd}><Icon name="plus" size={16} /> Add Product</Button></div><div className="filter-row"><div className="admin-search"><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." /></div></div>
    <div className="admin-product-table"><div className="table-head"><span>Product</span><span>Prices</span><span>Images</span><span>Available</span><span /></div>
      {loading ? <p className="admin-empty">Loading products…</p> : filtered.length === 0 ? <p className="admin-empty">No products found.</p> : filtered.map((product) => {
        const isSW = product.productType === "sandwich";
        const allImages = isSW ? (product.images || []) : [...(product.images600g || []), ...(product.images300g || [])];
        return <div className="table-row" key={product.id}>
          <div className="table-product"><img src={product.mainImage || allImages[0] || ""} alt="" /><div><b>{product.nameEn}</b><span>{product.nameAr} {isSW ? "🥪" : ""}</span></div></div>
          <strong className="admin-prices">{isSW ? <span>₺{product.priceSingle}</span> : <><span>300g ₺{product.price300g}</span><span>600g ₺{product.price600g}</span></>}</strong>
          <span className="img-count"><Icon name="image" size={14} /> {allImages.length} photo(s)</span>
          <button className={`stock-toggle ${product.active ? "on" : "off"}`} onClick={() => toggleAvailability(product)} title="Toggle availability"><span />{product.active ? "Available" : "Hidden"}</button>
          <div className="row-actions"><button onClick={() => onEdit(product)} title="Edit images & details"><Icon name="edit" size={16} /></button><button onClick={() => remove(product)} title="Delete"><Icon name="trash" size={16} /></button></div>
        </div>;
      })}
    </div>
  </div>;
}

type AdminOrder = { id: string; orderCode: string; customerName: string; customerPhone: string; total: number; status: string; createdAt: string; items: Array<{ productName: string; size: string; flavorChoice: string; quantity: number; unitPrice: number }> };
const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const reload = () => fetch("/api/admin/orders").then((response) => response.ok ? response.json() : null).then((data) => setOrders(data?.orders || [])).finally(() => setLoading(false)).catch(() => setLoading(false));
  useEffect(() => { reload(); }, []);
  const counts = { all: orders.length, pending: orders.filter((order) => order.status === "pending").length, confirmed: orders.filter((order) => order.status === "confirmed").length, shipped: orders.filter((order) => order.status === "shipped").length, delivered: orders.filter((order) => order.status === "delivered").length };
  const visible = filter === "all" ? orders : orders.filter((order) => order.status === filter);
  const setStatus = async (id: string, status: string) => { setBusyId(id); setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order)); await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }); setBusyId(null); };
  return <div className="admin-body"><div className="admin-section-head"><div><h2>Orders <span className="count-badge">{orders.length}</span></h2><p>Live customer orders from your store.</p></div><Button variant="outline" onClick={reload}>Refresh <Icon name="spark" size={15} /></Button></div>
    <div className="order-filters">{(["all", "pending", "confirmed", "shipped", "delivered"] as const).map((key) => <button key={key} className={filter === key ? "active" : ""} onClick={() => setFilter(key)}>{key === "all" ? "All orders" : key[0].toUpperCase() + key.slice(1)} <b>{counts[key]}</b></button>)}</div>
    <div className="admin-panel orders-table"><div className="table-head"><span>Order</span><span>Customer</span><span>Items</span><span>Total</span><span>Status</span></div>
      {loading ? <p className="admin-empty">Loading orders…</p> : visible.length === 0 ? <p className="admin-empty">No {filter === "all" ? "" : filter} orders yet. New orders appear here the moment a customer checks out.</p> : visible.map((order) => <div className="table-row" key={order.id}>
        <div><b>#{order.orderCode}</b><span className="order-time">{new Date(order.createdAt).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span></div>
        <div className="order-customer"><b>{order.customerName}</b><span>{order.customerPhone}</span></div>
        <div className="order-items-cell">{order.items.length ? order.items.map((item, index) => <span key={index}>{item.productName} {item.size === "single" ? "" : item.size}×{item.quantity}{index < order.items.length - 1 ? ", " : ""}</span>) : <span>—</span>}</div>
        <strong className="order-total">₺{order.total}</strong>
        <label className="status-select-wrap"><select className={`status-select status-${order.status}`} value={order.status} disabled={busyId === order.id} onChange={(event) => setStatus(order.id, event.target.value)}>{ORDER_STATUSES.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select>{busyId === order.id && <span className="status-saving">…</span>}</label>
      </div>)}
    </div>
  </div>;
}

type AdminOffer = { id: string; titleEn: string; titleTr: string; titleAr: string; descriptionEn: string; descriptionTr: string; descriptionAr: string; imageUrl: string | null; type: string; discountPercent: string; buyProductId: string | null; buySize: string | null; buyQuantity: string | null; giftKind: string | null; giftProductId: string | null; giftSize: string | null; giftQuantity: string | null; giftCustomName: string | null; giftCustomImage: string | null; limitedCount: string | null; endsAt: string | null; active: boolean };

function countdownText(iso: string | null): { text: string; expired: boolean } | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return { text: "Expired", expired: true };
  const d = Math.floor(diff / 86400000); const h = Math.floor((diff % 86400000) / 3600000); const m = Math.floor((diff % 3600000) / 60000); const s = Math.floor((diff % 60000) / 1000);
  const text = d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
  return { text, expired: false };
}

function OfferCountdown({ endsAt, big = false }: { endsAt: string | null; big?: boolean }) {
  const [, setTick] = useState(0);
  useEffect(() => { if (!endsAt) return; const id = window.setInterval(() => setTick((t) => t + 1), 1000); return () => window.clearInterval(id); }, [endsAt]);
  const cd = countdownText(endsAt);
  if (!cd) return null;
  return <span className={`offer-timer ${cd.expired ? "expired" : ""} ${big ? "big" : ""}`}>⏱ {cd.expired ? "Expired" : cd.text}</span>;
}
type MiniProduct = { id: string; nameEn: string; productType: string };

function sizeOptions(productType: string, allowAny: boolean): string[] {
  const base = productType === "sandwich" ? ["single"] : productType === "any" ? ["300g", "600g", "single"] : ["300g", "600g"];
  return allowAny ? ["any", ...base] : base;
}

function describeOffer(offer: AdminOffer, products: MiniProduct[]): string {
  const buyName = offer.buyProductId ? (products.find((p) => p.id === offer.buyProductId)?.nameEn || "product") : "any product";
  const buySize = offer.buySize && offer.buySize !== "any" ? `${offer.buySize} ` : "";
  let gift: string;
  if (offer.giftKind === "custom") gift = `${offer.giftQuantity && Number(offer.giftQuantity) > 1 ? offer.giftQuantity + " × " : ""}${offer.giftCustomName || "a prize"}`;
  else { const giftName = offer.giftProductId ? (products.find((p) => p.id === offer.giftProductId)?.nameEn || "gift") : "a gift"; const giftSize = offer.giftSize ? `${offer.giftSize} ` : ""; gift = `${offer.giftQuantity || "1"} × ${giftSize}${giftName}`; }
  const base = `Buy ${offer.buyQuantity || "2"} × ${buySize}${buyName} → get ${gift} free`;
  return offer.limitedCount && Number(offer.limitedCount) > 0 ? `${base} · first ${offer.limitedCount} buyers` : base;
}

function AdminOffers() {
  const { lang } = useI18n();
  const [offers, setOffers] = useState<AdminOffer[]>([]);
  const [products, setProducts] = useState<MiniProduct[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<AdminOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const reload = () => Promise.all([fetch("/api/admin/offers").then((r) => r.ok ? r.json() : null), fetch("/api/admin/products").then((r) => r.ok ? r.json() : null)]).then(([od, pd]) => { setOffers(od?.offers || []); setProducts((pd?.products || []).map((p: AdminProduct) => ({ id: p.id, nameEn: p.nameEn, productType: p.productType || "cheese" }))); }).finally(() => setLoading(false)).catch(() => setLoading(false));
  useEffect(() => { reload(); }, []);
  const toggle = async (offer: AdminOffer) => { setOffers((current) => current.map((item) => item.id === offer.id ? { ...item, active: !item.active } : item)); await fetch("/api/admin/offers", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: offer.id, active: !offer.active }) }); };
  const remove = async (offer: AdminOffer) => { if (!confirm(`Delete offer "${offer.titleEn}"?`)) return; setOffers((current) => current.filter((item) => item.id !== offer.id)); await fetch("/api/admin/offers", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: offer.id }) }); };
  const openEdit = (offer: AdminOffer) => { setEditingOffer(offer); setShowModal(true); };
  const onSaved = (msg: string) => { setShowModal(false); setEditingOffer(null); setToast(msg); reload(); window.setTimeout(() => setToast(""), 2400); };
  const offerTitle = (offer: AdminOffer) => lang === "ar" ? offer.titleAr : lang === "tr" ? offer.titleTr : offer.titleEn;
  const offerDesc = (offer: AdminOffer) => lang === "ar" ? offer.descriptionAr : lang === "tr" ? offer.descriptionTr : offer.descriptionEn;
  return <div className="admin-body"><div className="admin-section-head"><div><h2>Offers <span className="count-badge">{offers.length}</span></h2><p>Discounts, bundles &amp; giveaways managed from your store.</p></div><Button onClick={() => { setEditingOffer(null); setShowModal(true); }}><Icon name="plus" size={16} /> Add Offer</Button></div>
    {loading ? <p className="admin-empty">Loading offers…</p> : offers.length === 0 ? <p className="admin-empty">No offers yet. Create your first discount or bundle deal.</p> : offers.map((offer) => <div className={`offer-card ${offer.active ? "" : "muted-offer"}`} key={offer.id}>
      <div className="offer-icon">{offer.giftCustomImage ? <img src={offer.giftCustomImage} alt="" className="offer-img" /> : offer.imageUrl ? <img src={offer.imageUrl} alt="" className="offer-img" /> : (offer.type === "bogo" ? "🎁" : offer.active ? "✦" : "◇")}</div>
      <div><span className={`offer-kind ${offer.type === "bogo" ? "kind-bogo" : offer.type === "simple" ? "kind-simple" : "kind-pct"}`}>{offer.type === "bogo" ? "BUY X GET Y" : offer.type === "simple" ? "CUSTOM" : "DISCOUNT"}</span> {offer.giftKind === "custom" && <span className="offer-kind kind-prize">PRIZE</span>} {offer.limitedCount && Number(offer.limitedCount) > 0 && <span className="offer-kind kind-limit">FIRST {offer.limitedCount}</span>} <span className={offer.active ? "offer-active" : "offer-draft"}>{offer.active ? "ACTIVE" : "DRAFT"}</span> <OfferCountdown endsAt={offer.endsAt} /><h3>{offerTitle(offer)}</h3><p>{offer.type === "bogo" ? describeOffer(offer, products) : offerDesc(offer)}{offer.type === "percentage" && Number(offer.discountPercent) > 0 && <> · {offer.discountPercent}% off</>}</p></div>
      <div className="offer-row-actions"><button className={`toggle ${offer.active ? "on" : ""}`} onClick={() => toggle(offer)} aria-label="Toggle active"><span /></button><button className="offer-edit" onClick={() => openEdit(offer)} aria-label="Edit"><Icon name="edit" size={14} /></button><button className="offer-del" onClick={() => remove(offer)} aria-label="Delete"><Icon name="trash" size={14} /></button></div>
    </div>)}
    <AnimatePresence>{showModal && <AddOfferModal key={editingOffer?.id || "new"} products={products} editingOffer={editingOffer} onClose={() => { setShowModal(false); setEditingOffer(null); }} onSaved={onSaved} />}</AnimatePresence>
    <AnimatePresence>{toast && <motion.div className="toast" initial={{ opacity: 0, y: 24, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: 20, x: 20 }}>{toast}</motion.div>}</AnimatePresence>
  </div>;
}

function AddOfferModal({ products, editingOffer, onClose, onSaved }: { products: MiniProduct[]; editingOffer: AdminOffer | null; onClose: () => void; onSaved: (msg: string) => void }) {
  const isEdit = Boolean(editingOffer);
  const [titleEn, setTitleEn] = useState(editingOffer?.titleEn || ""); const [titleTr, setTitleTr] = useState(editingOffer?.titleTr || ""); const [titleAr, setTitleAr] = useState(editingOffer?.titleAr || "");
  const [descEn, setDescEn] = useState(editingOffer?.descriptionEn || ""); const [descTr, setDescTr] = useState(editingOffer?.descriptionTr || ""); const [descAr, setDescAr] = useState(editingOffer?.descriptionAr || "");
  const [imageUrl, setImageUrl] = useState(editingOffer?.imageUrl || "");
  const [offerType, setOfferType] = useState<"percentage" | "bogo" | "simple">((editingOffer?.type as "percentage" | "bogo" | "simple") || "percentage");
  const [expiresAt, setExpiresAt] = useState(editingOffer?.endsAt ? new Date(editingOffer.endsAt).toISOString().slice(0, 16) : "");
  const [discount, setDiscount] = useState(editingOffer?.discountPercent || "10");
  const [buyProductId, setBuyProductId] = useState(editingOffer?.buyProductId || ""); const [buySize, setBuySize] = useState(editingOffer?.buySize || "any"); const [buyQuantity, setBuyQuantity] = useState(editingOffer?.buyQuantity || "2");
  const [giftKind, setGiftKind] = useState<"product" | "custom">((editingOffer?.giftKind as "product" | "custom") || "product");
  const [giftProductId, setGiftProductId] = useState(editingOffer?.giftProductId || ""); const [giftSize, setGiftSize] = useState(editingOffer?.giftSize || ""); const [giftQuantity, setGiftQuantity] = useState(editingOffer?.giftQuantity || "1");
  const [giftCustomName, setGiftCustomName] = useState(editingOffer?.giftCustomName || ""); const [giftCustomImage, setGiftCustomImage] = useState(editingOffer?.giftCustomImage || "");
  const [limitedCount, setLimitedCount] = useState(editingOffer?.limitedCount || "");
  const [active, setActive] = useState(editingOffer?.active !== false);
  const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const buyPtype = buyProductId ? (products.find((p) => p.id === buyProductId)?.productType || "cheese") : "any";
  const giftPtype = giftProductId ? (products.find((p) => p.id === giftProductId)?.productType || "cheese") : "cheese";
  const buyOpts = sizeOptions(buyPtype, true);
  const giftOpts = sizeOptions(giftPtype, false);
  const submit = async () => {
    setError("");
    if (offerType === "simple") { if (!titleEn.trim()) { setError("Write your offer text."); return; } }
    else if (!titleEn.trim() || !titleTr.trim() || !titleAr.trim()) { setError("All three titles are required."); return; }
    if (offerType === "percentage" && !descEn.trim()) { setError("Add a description for the discount offer."); return; }
    if (offerType === "bogo") {
      if (!buyQuantity || Number(buyQuantity) < 1) { setError("Enter how many the customer must buy."); return; }
      if (giftKind === "product") { if (!giftProductId) { setError("Choose the gift product."); return; } if (!giftSize) { setError("Choose the gift size."); return; } }
      else if (!giftCustomName.trim()) { setError("Enter the name of the custom gift/prize."); return; }
      if (!giftQuantity || Number(giftQuantity) < 1) { setError("Enter how many of the gift to give."); return; }
    }
    setSaving(true);
    const payload: Record<string, unknown> = {
      id: editingOffer?.id,
      titleEn: titleEn.trim(), titleTr: titleTr.trim() || titleEn.trim(), titleAr: titleAr.trim() || titleEn.trim(),
      descriptionEn: descEn.trim() || (offerType === "bogo" ? describeOfferLike() : ""),
      descriptionTr: descTr.trim() || descEn.trim() || titleTr.trim() || titleEn.trim(),
      descriptionAr: descAr.trim() || descEn.trim() || titleAr.trim() || titleEn.trim(),
      imageUrl: imageUrl.trim() || null, type: offerType, active,
      endsAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    };
    if (offerType === "simple") { payload.discountPercent = "0"; payload.buyProductId = null; payload.buySize = null; payload.buyQuantity = null; payload.giftKind = "product"; payload.giftProductId = null; payload.giftSize = null; payload.giftQuantity = null; payload.giftCustomName = null; payload.giftCustomImage = null; payload.limitedCount = null; }
    else if (offerType === "percentage") { payload.discountPercent = discount || "0"; payload.buyProductId = null; payload.buySize = null; payload.buyQuantity = null; payload.giftKind = "product"; payload.giftProductId = null; payload.giftSize = null; payload.giftQuantity = null; payload.giftCustomName = null; payload.giftCustomImage = null; payload.limitedCount = null; }
    else { payload.discountPercent = "0"; payload.buyProductId = buyProductId || null; payload.buySize = buySize; payload.buyQuantity = buyQuantity; payload.giftKind = giftKind; payload.giftQuantity = giftQuantity; payload.limitedCount = limitedCount.trim() || null; if (giftKind === "product") { payload.giftProductId = giftProductId; payload.giftSize = giftSize; payload.giftCustomName = null; payload.giftCustomImage = null; } else { payload.giftProductId = null; payload.giftSize = null; payload.giftCustomName = giftCustomName.trim(); payload.giftCustomImage = giftCustomImage.trim() || null; } }
    const url = isEdit ? "/api/admin/offers" : "/api/admin/offers";
    const method = isEdit ? "PATCH" : "POST";
    const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (!response.ok) { const data = await response.json().catch(() => ({})); setError(data.error || "Could not save offer."); return; }
    onSaved(`✓ ${isEdit ? "Updated" : "Created"} offer ${titleEn}`);
  };
  const describeOfferLike = () => { const giftText = giftKind === "custom" ? `${Number(giftQuantity) > 1 ? giftQuantity + " × " : ""}${giftCustomName.trim() || "a prize"}` : `${giftQuantity} × ${giftSize ? giftSize + " " : ""}${giftProductId ? (products.find((p) => p.id === giftProductId)?.nameEn || "gift") : "gift"}`; const base = `Buy ${buyQuantity} × ${buySize !== "any" ? buySize + " " : ""}${buyProductId ? (products.find((p) => p.id === buyProductId)?.nameEn || "product") : "any product"} → get ${giftText} free`; return limitedCount.trim() && Number(limitedCount) > 0 ? `${base} · first ${limitedCount} buyers only` : base; };
  return <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><motion.div className="modal-card product-modal" initial={{ opacity: 0, scale: .92, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .95, y: 10 }} transition={{ type: "spring", damping: 22, stiffness: 300 }}>
    <div className="modal-header"><div><span className="eyebrow">{isEdit ? "EDIT OFFER" : "NEW OFFER"}</span><h2>{isEdit ? "Edit offer" : "Add offer"}</h2></div><button onClick={onClose}><Icon name="close" /></button></div>
    <div className="modal-form">
      <div className="product-type-switch"><button className={offerType === "percentage" ? "active" : ""} onClick={() => setOfferType("percentage")}>% Discount</button><button className={offerType === "bogo" ? "active" : ""} onClick={() => setOfferType("bogo")}>🎁 Buy X Get Y Free</button><button className={offerType === "simple" ? "active" : ""} onClick={() => setOfferType("simple")}>✍️ Write my own</button></div>
      {offerType === "simple" ? (
        <><Field label="Offer title" placeholder="e.g. Ramadan special — free delivery today!" value={titleEn} onChange={setTitleEn} required /><Field label="Offer details (optional)" placeholder="Write the offer exactly the way you want it to appear…" value={descEn} onChange={setDescEn} textarea /></>
      ) : (
        <><div className="form-grid form-grid-3"><Field label="Title (EN)" placeholder={offerType === "bogo" ? "Weekend bundle" : "Weekend deal"} value={titleEn} onChange={setTitleEn} required /><Field label="Title (TR)" placeholder={offerType === "bogo" ? "Hafta sonu paketi" : "Hafta sonu fırsatı"} value={titleTr} onChange={setTitleTr} required /><Field label="Title (AR)" placeholder={offerType === "bogo" ? "باقة نهاية الأسبوع" : "عرض نهاية الأسبوع"} value={titleAr} onChange={setTitleAr} required /></div>
        {offerType === "percentage" && <div className="form-grid form-grid-3"><Field label="Description (EN)" placeholder="Get 10% off" value={descEn} onChange={setDescEn} textarea required /><Field label="Description (TR)" placeholder="İndirim kazanın" value={descTr} onChange={setDescTr} textarea /><Field label="Description (AR)" placeholder="احصل على خصم" value={descAr} onChange={setDescAr} textarea /></div>}</>
      )}
      <label className="field"><span>Offer image</span><div className="offer-image-input"><input placeholder="Paste image URL…" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} /><label className="upload-btn"><Icon name="image" size={14} /> Upload<input type="file" accept="image/*" hidden onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; if (!file.type.startsWith("image/")) { window.alert("Please choose an image file."); return; } if (file.size > 5 * 1024 * 1024) { window.alert("Image must be under 5 MB."); return; } setImageUrl(await readFileAsDataUrl(file)); event.target.value = ""; }} /></label></div></label>
      {imageUrl && <div className="offer-image-preview"><img src={imageUrl} alt="Preview" /></div>}
      <label className="field"><span>⏱ Expiry / timer <small>(optional — offer disappears after this)</small></span><input type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />{expiresAt && <button type="button" className="clear-expiry" onClick={() => setExpiresAt("")}>Clear</button>}</label>
      {offerType === "simple" ? (
        <label className="mini-toggle"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /> Active now</label>
      ) : offerType === "percentage" ? (
        <div className="form-grid form-grid-2"><Field label="Discount %" placeholder="10" value={discount} onChange={setDiscount} /><label className="mini-toggle" style={{ alignSelf: "center" }}><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /> Active now</label></div>
      ) : (
        <>
          <div className="offer-side"><div className="offer-side-head"><span className="side-tag buy">BUY</span><span>What the customer must buy</span></div>
            <div className="form-grid form-grid-3">
              <label className="field"><span>Product</span><select value={buyProductId} onChange={(e) => { setBuyProductId(e.target.value); setBuySize(sizeOptions(e.target.value ? (products.find((p) => p.id === e.target.value)?.productType || "cheese") : "any", true)[0]); }}><option value="">Any product</option>{products.map((p) => <option key={p.id} value={p.id}>{p.nameEn}{p.productType === "sandwich" ? " 🥪" : ""}</option>)}</select></label>
              <label className="field"><span>Size</span><select value={buySize} onChange={(e) => setBuySize(e.target.value)}>{buyOpts.map((s) => <option key={s} value={s}>{s === "any" ? "Any size" : s}</option>)}</select></label>
              <label className="field"><span>Quantity</span><input type="number" min={1} value={buyQuantity} onChange={(e) => setBuyQuantity(e.target.value)} /></label>
            </div>
          </div>
          <div className="offer-side"><div className="offer-side-head"><span className="side-tag gift">GIFT</span><span>What they get for free</span></div>
            <div className="gift-kind-switch"><button type="button" className={giftKind === "product" ? "active" : ""} onClick={() => setGiftKind("product")}>🧀 A product from the store</button><button type="button" className={giftKind === "custom" ? "active" : ""} onClick={() => setGiftKind("custom")}>🎁 Any other prize</button></div>
            {giftKind === "product" ? (
              <div className="form-grid form-grid-3">
                <label className="field"><span>Product</span><select value={giftProductId} onChange={(e) => { setGiftProductId(e.target.value); const pt = e.target.value ? (products.find((p) => p.id === e.target.value)?.productType || "cheese") : "cheese"; const opts = sizeOptions(pt, false); setGiftSize(opts.includes(giftSize) ? giftSize : opts[0]); }}><option value="">— choose product —</option>{products.map((p) => <option key={p.id} value={p.id}>{p.nameEn}{p.productType === "sandwich" ? " 🥪" : ""}</option>)}</select></label>
                <label className="field"><span>Size</span><select value={giftSize} onChange={(e) => setGiftSize(e.target.value)} disabled={!giftProductId}><option value="">{giftProductId ? "Select size" : "—"}</option>{giftProductId && giftOpts.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
                <label className="field"><span>Quantity</span><input type="number" min={1} value={giftQuantity} onChange={(e) => setGiftQuantity(e.target.value)} /></label>
              </div>
            ) : (
              <>
                <div className="form-grid form-grid-2">
                  <Field label="Prize name" placeholder="e.g. Wireless mouse, PlayStation 5, Keyboard…" value={giftCustomName} onChange={setGiftCustomName} required />
                  <label className="field"><span>Quantity</span><input type="number" min={1} value={giftQuantity} onChange={(e) => setGiftQuantity(e.target.value)} /></label>
                </div>
                <label className="field"><span>Prize image (optional)</span><div className="offer-image-input"><input placeholder="Paste image URL…" value={giftCustomImage} onChange={(e) => setGiftCustomImage(e.target.value)} /><label className="upload-btn"><Icon name="image" size={14} /> Upload<input type="file" accept="image/*" hidden onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; if (!file.type.startsWith("image/")) { window.alert("Please choose an image file."); return; } if (file.size > 5 * 1024 * 1024) { window.alert("Image must be under 5 MB."); return; } setGiftCustomImage(await readFileAsDataUrl(file)); event.target.value = ""; }} /></label></div></label>
                {giftCustomImage && <div className="offer-image-preview"><img src={giftCustomImage} alt="Prize preview" /></div>}
              </>
            )}
          </div>
          <div className="offer-side"><div className="offer-side-head"><span className="side-tag limit">GIVEAWAY</span><span>Limit to the first N buyers (optional)</span></div>
            <div className="form-grid form-grid-2">
              <label className="field"><span>First how many buyers?</span><input type="number" min={0} placeholder="Leave empty = unlimited" value={limitedCount} onChange={(e) => setLimitedCount(e.target.value)} /></label>
              <div className="giveaway-hint">{limitedCount.trim() && Number(limitedCount) > 0 ? `🏆 Only the first ${limitedCount} customers who qualify win this — great for a PS5-style giveaway.` : "Unlimited — every qualifying order gets the gift."}</div>
            </div>
          </div>
          <div className="bogo-preview">🎁 {describeOfferLike()}</div>
          <label className="mini-toggle" style={{ marginTop: 8 }}><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /> Active now</label>
        </>
      )}
      {error && <p className="form-error">{error}</p>}
    </div>
    <div className="modal-footer"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={submit}>{saving ? "Saving…" : "Save Offer"}</Button></div>
  </motion.div></motion.div>;
}

function AdminToolsPanel({ tab, catalog }: { tab: string; catalog: Product[] }) {
  const [usersData, setUsersData] = useState<Array<{ id: string; name: string; email: string; phone: string; role: string }>>([]);
  const [categoriesData, setCategoriesData] = useState<Array<{ id: string; nameEn: string; nameTr: string; nameAr: string; active: boolean }>>([]);
  const [flavorsList, setFlavorsList] = useState<string[]>([]);
  const [newFlavorText, setNewFlavorText] = useState("");
  const [saved, setSaved] = useState("");
  useEffect(() => {
    if (tab === "Database") fetch("/api/admin/users").then((response) => response.ok ? response.json() : null).then((data) => setUsersData(data?.users || [])).catch(() => undefined);
    if (tab === "Varieties (الأصناف)") fetch("/api/admin/categories").then((response) => response.ok ? response.json() : null).then((data) => setCategoriesData(data?.categories || [])).catch(() => undefined);
    if (tab === "Flavors (النكهات)") {
      const savedFlavors = window.localStorage.getItem("gebna-flavors-list");
      if (savedFlavors) setFlavorsList(JSON.parse(savedFlavors));
      else {
        const defaults = ["Spicy 🌶", "Cool ❄️", "Herb 🌿", "Smoked 🔥", "Classic"];
        setFlavorsList(defaults);
        window.localStorage.setItem("gebna-flavors-list", JSON.stringify(defaults));
      }
    }
  }, [tab]);

  const addFlavorItem = () => {
    if (!newFlavorText.trim()) return;
    const updated = [...flavorsList, newFlavorText.trim()];
    setFlavorsList(updated);
    window.localStorage.setItem("gebna-flavors-list", JSON.stringify(updated));
    setNewFlavorText("");
  };

  const removeFlavorItem = (val: string) => {
    const updated = flavorsList.filter((x) => x !== val);
    setFlavorsList(updated);
    window.localStorage.setItem("gebna-flavors-list", JSON.stringify(updated));
  };

  if (tab === "Database") { const customerCount = usersData.filter((u) => u.role === "customer").length; return <div className="admin-body"><div className="admin-section-head"><div><h2>Customer database</h2><p>All registered accounts. Customer phone numbers are visible to the owner only.</p></div><span className="count-badge">{customerCount} customer{customerCount === 1 ? "" : "s"} · {usersData.length} total</span></div><div className="admin-panel data-table"><div className="table-head"><span>Name</span><span>Email</span><span>Phone</span><span>Role</span></div>{usersData.length ? usersData.map((account) => <div className="table-row" key={account.id}><b>{account.name}</b><span>{account.email}</span><strong>{account.phone}</strong><span className={`role-pill role-${account.role}`}>{account.role === "owner" ? "Owner (you)" : account.role}</span></div>) : <p className="admin-empty">No accounts yet. They appear here the moment someone registers.</p>}</div></div>; }
  if (tab === "Varieties (الأصناف)") return <div className="admin-body"><div className="admin-section-head"><div><h2>Varieties (الأصناف)</h2><p>Manage the home-page الأصناف categories in Arabic, Turkish, and English.</p></div><Button onClick={() => setSaved("Category editor is connected to the admin API.")}>Add variety <Icon name="plus" size={15} /></Button></div><div className="admin-panel category-manager">{categoriesData.map((category) => <div className="category-row" key={category.id}><div className="variety-dot" /><div><b>{category.nameEn}</b><span>{category.nameTr} · {category.nameAr}</span></div><button className={`toggle ${category.active ? "on" : ""}`} onClick={async () => { await fetch("/api/admin/categories", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...category, active: !category.active }) }); setCategoriesData((current) => current.map((item) => item.id === category.id ? { ...item, active: !item.active } : item)); }}><span /></button></div>)}</div>{saved && <p className="admin-inline-note">{saved}</p>}</div>;
  if (tab === "Flavors (النكهات)") return <div className="admin-body"><div className="admin-section-head"><div><h2>Flavors (النكهات)</h2><p>Manage the list of flavors customers can choose from for sandwiches and cheese.</p></div></div>
    <div className="admin-panel flavor-manager-block" style={{ padding: "20px" }}>
      <div className="gallery-add" style={{ marginBottom: "20px" }}><input value={newFlavorText} onChange={(e) => setNewFlavorText(e.target.value)} placeholder="e.g. Garlic & Dill 🧄" style={{ padding: "10px", borderRadius: "8px", border: "1px solid #dfe5dc", fontSize: "13px" }} /><button type="button" onClick={addFlavorItem} style={{ background: "var(--green)", color: "white", padding: "0 20px", borderRadius: "8px", fontWeight: "700" }}>Add Flavor</button></div>
      <div className="sandwich-flavors" style={{ margin: 0 }}>{flavorsList.map((f) => <div key={f} className="sandwich-flavor-chip selected" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}><span>{f}</span><button type="button" onClick={() => removeFlavorItem(f)} style={{ background: "none", border: "none", color: "red", cursor: "pointer", fontWeight: "bold" }}>×</button></div>)}</div>
    </div></div>;
  if (tab === "Sales Report") { const average = catalog.length ? Math.round(catalog.reduce((sum, product) => sum + product.price600, 0) / catalog.length) : 0; return <div className="admin-body"><div className="admin-section-head"><div><h2>Sales report</h2><p>Live catalog performance and revenue-ready reporting.</p></div><Button variant="outline">Export CSV <Icon name="arrow" size={15} /></Button></div><div className="stat-grid"><StatCard icon="bag" label="Active products" value={String(catalog.length)} detail="Available in catalog" /><StatCard icon="orders" label="Average 600g price" value={`₺${average}`} detail="Based on current catalog" accent="yellow" /><StatCard icon="spark" label="Top variety" value={catalog[0]?.name || "—"} detail="Featured collection" accent="purple" /><StatCard icon="users" label="Sales channel" value="App + WhatsApp" detail="Owner notified by Gmail" accent="blue" /></div></div>; }
  return <div className="admin-body"><div className="admin-section-head"><div><h2>Theme settings</h2><p>Global theme controls start in light mode for every new shopper.</p></div></div><div className="admin-panel theme-manager"><div><span className="theme-swatch theme-green" /><b>Brand green</b><small>#309e2b</small></div><div><span className="theme-swatch theme-yellow" /><b>Brand yellow</b><small>#f3d525</small></div><div><span className="theme-swatch theme-paper" /><b>Light surface</b><small>#f2f2f2</small></div><p>Use the user Settings page to switch between light and dark appearance. The light theme remains the default for new visitors.</p></div></div>;
}

function AdminAI() {
  const [message, setMessage] = useState("");
  const suggestions = ["Add a new pepper cheese product priced at ₺250", "Show me all pending orders", "Create a weekend offer"];
  return <div className="admin-body ai-body"><div className="ai-hero"><div className="ai-orb"><Icon name="spark" size={26} /></div><span className="eyebrow">YOUR STORE COPILOT</span><h2>How can I help today?</h2><p>Ask anything about products, orders, or growing Gebna-A.</p></div><div className="suggestion-grid">{suggestions.map((item) => <button key={item} onClick={() => setMessage(item)}>{item}<Icon name="arrow" size={15} /></button>)}</div><form className="ai-input" onSubmit={(event) => { event.preventDefault(); setMessage(""); }}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask your admin assistant..." /><button type="submit"><Icon name="arrow" size={18} /></button></form></div>;
}

function readFileAsDataUrl(file: File): Promise<string> { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result || "")); reader.onerror = () => reject(new Error("Failed to read file")); reader.readAsDataURL(file); }); }

function ImageGalleryEditor({ title, images, setImages, mainImage, setMainImage }: { title: string; images: string[]; setImages: (next: string[]) => void; mainImage: string; setMainImage: (url: string) => void }) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const addUrl = () => { const url = draft.trim(); if (!url) return; setImages([...images, url]); if (!mainImage) setMainImage(url); setDraft(""); };
  const addFiles = async (fileList: FileList | null) => {
    if (!fileList || !fileList.length) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(fileList)) { if (!file.type.startsWith("image/")) continue; if (file.size > 5 * 1024 * 1024) { window.alert(`${file.name} is larger than 5 MB and was skipped.`); continue; } urls.push(await readFileAsDataUrl(file)); }
      if (urls.length) { setImages([...images, ...urls]); if (!mainImage) setMainImage(urls[0]); }
    } finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  };
  return <div className="gallery-editor"><div className="gallery-head"><span>{title}</span><div className="gallery-add"><input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addUrl(); } }} placeholder="Paste image URL and press Enter" /><button type="button" onClick={addUrl} disabled={busy}><Icon name="plus" size={14} /> Add URL</button><label className={`upload-btn ${busy ? "busy" : ""}`}><Icon name="image" size={14} /> {busy ? "Uploading…" : "Upload"}<input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(event) => { addFiles(event.target.files); }} /></label></div></div>
    <div className="gallery-thumbs">{images.length === 0 && <p className="gallery-empty">No images yet. Paste a URL or upload from your device.</p>}{images.map((url, index) => <div className={`gallery-thumb ${mainImage === url ? "is-main" : ""}`} key={`${url.slice(0, 24)}-${index}`}><img src={url} alt="" onError={(event) => { (event.target as HTMLImageElement).style.opacity = "0.2"; }} /><div className="thumb-controls"><button type="button" className="thumb-star" title="Set as main (home page)" onClick={() => setMainImage(url)}>★</button>{index > 0 && <button type="button" title="Move left" onClick={() => { const next = [...images]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; setImages(next); }}>←</button>}{index < images.length - 1 && <button type="button" title="Move right" onClick={() => { const next = [...images]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; setImages(next); }}>→</button>}<button type="button" className="thumb-remove" title="Remove" onClick={() => { const next = images.filter((_, i) => i !== index); setImages(next); if (mainImage === url) setMainImage(next[0] || ""); }}><Icon name="trash" size={12} /></button></div>{mainImage === url && <span className="main-flag">MAIN</span>}</div>)}</div>
  </div>;
}

function ProductFormModal({ product, onClose, onSaved }: { product: AdminProduct | null; onClose: () => void; onSaved: (msg: string) => void }) {
  const isEdit = Boolean(product);
  const [pType, setPType] = useState<"cheese" | "sandwich">((product?.productType as "cheese" | "sandwich") || "cheese");
  const isSandwich = pType === "sandwich";
  const [nameEn, setNameEn] = useState(product?.nameEn || "");
  const [nameTr, setNameTr] = useState(product?.nameTr || "");
  const [nameAr, setNameAr] = useState(product?.nameAr || "");
  const [descEn, setDescEn] = useState(product?.descriptionEn || "");
  const [descTr, setDescTr] = useState(product?.descriptionTr || "");
  const [descAr, setDescAr] = useState(product?.descriptionAr || "");
  const [price300, setPrice300] = useState(product?.price300g || "");
  const [price600, setPrice600] = useState(product?.price600g || "");
  const [priceSingle, setPriceSingle] = useState(product?.priceSingle || "");
  const [images300, setImages300] = useState<string[]>(product?.images300g || []);
  const [images600, setImages600] = useState<string[]>(product?.images600g || []);
  const [imagesSingle, setImagesSingle] = useState<string[]>(product?.images || []);
  const allImages = isSandwich ? imagesSingle : [...images600, ...images300];
  const [mainImage, setMainImage] = useState<string>(product?.mainImage || allImages[0] || "");
  const [featured, setFeatured] = useState(Boolean(product?.featured));
  const [active, setActive] = useState(product?.active !== false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submit = async () => {
    setError("");
    if (!nameEn.trim() || !nameTr.trim() || !nameAr.trim()) { setError("All three names are required."); return; }
    if (!descEn.trim() && !descTr.trim() && !descAr.trim()) { setError("Add at least one description (English, Turkish, or Arabic)."); return; }
    if (isSandwich && !priceSingle) { setError("Enter a price for the sandwich."); return; }
    if (!isSandwich && (!price300 || !price600)) { setError("Both 300g and 600g prices are required."); return; }
    const currentAll = isSandwich ? imagesSingle : [...images600, ...images300];
    if (!currentAll.length) { setError("Add at least one image."); return; }
    setSaving(true);
    const payload: Record<string, unknown> = { productType: pType, nameEn: nameEn.trim(), nameTr: nameTr.trim(), nameAr: nameAr.trim(), descriptionEn: descEn.trim(), descriptionTr: descTr.trim(), descriptionAr: descAr.trim(), mainImage: mainImage || currentAll[0], featured, active };
    if (isSandwich) { payload.priceSingle = priceSingle; payload.price300g = "0"; payload.price600g = "0"; payload.images = imagesSingle; payload.images300g = []; payload.images600g = []; }
    else { payload.price300g = price300; payload.price600g = price600; payload.priceSingle = null; payload.images300g = images300; payload.images600g = images600; payload.images = []; }
    const url = isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products";
    const method = isEdit ? "PATCH" : "POST";
    const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (!response.ok) { const data = await response.json().catch(() => ({})); setError(data.error || "Could not save product."); return; }
    onSaved(`✓ ${isEdit ? "Updated" : "Created"} ${nameEn}`);
  };
  return <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><motion.div className="modal-card product-modal" initial={{ opacity: 0, scale: .92, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .95, y: 10 }} transition={{ type: "spring", damping: 22, stiffness: 300 }}>
    <div className="modal-header"><div><span className="eyebrow">{isEdit ? "EDIT PRODUCT" : "NEW PRODUCT"}</span><h2>{isEdit ? "Edit " + (product?.nameEn || "Product") : "Add Product"}</h2></div><button onClick={onClose}><Icon name="close" /></button></div>
    <div className="modal-form">
      <div className="product-type-switch"><button className={pType === "cheese" ? "active" : ""} onClick={() => setPType("cheese")}>🧀 Cheese</button><button className={pType === "sandwich" ? "active" : ""} onClick={() => setPType("sandwich")}>🥪 Sandwich</button></div>
      <div className="form-grid form-grid-3"><Field label="Name (English)" name="nameEn" placeholder={isSandwich ? "Classic Sandwich" : "Classic"} value={nameEn} onChange={setNameEn} required /><Field label="Name (Turkish)" name="nameTr" placeholder={isSandwich ? "Klasik Sandviç" : "Klasik"} value={nameTr} onChange={setNameTr} required /><Field label="Name (Arabic)" name="nameAr" placeholder={isSandwich ? "ساندوتش كلاسيك" : "سادة"} value={nameAr} onChange={setNameAr} required /></div>
      <div className="form-grid form-grid-3">
        <Field label="Description (English)" name="descEn" placeholder="Describe this variety" value={descEn} onChange={setDescEn} textarea />
        <Field label="Description (Turkish)" name="descTr" placeholder="Bu çeşidi açıklayın" value={descTr} onChange={setDescTr} textarea />
        <Field label="Description (Arabic)" name="descAr" placeholder="صف هذا المنتج" value={descAr} onChange={setDescAr} textarea />
      </div>
      {isSandwich ? <Field label="Price (₺)" name="priceSingle" placeholder="85" value={priceSingle} onChange={setPriceSingle} required /> : <div className="form-grid form-grid-2"><Field label="Price 300g (₺)" name="price300" placeholder="139" value={price300} onChange={setPrice300} required /><Field label="Price 600g (₺)" name="price600" placeholder="239" value={price600} onChange={setPrice600} required /></div>}
      {isSandwich ? <ImageGalleryEditor title="🖼️ Sandwich photos" images={imagesSingle} setImages={setImagesSingle} mainImage={mainImage} setMainImage={setMainImage} /> : <><ImageGalleryEditor title="🖼️ Photos — 600g size" images={images600} setImages={setImages600} mainImage={mainImage} setMainImage={setMainImage} /><ImageGalleryEditor title="🖼️ Photos — 300g size" images={images300} setImages={setImages300} mainImage={mainImage} setMainImage={setMainImage} /></>}
      <div className="main-image-preview">{mainImage ? <><img src={mainImage} alt="" /><span>This is the <b>main photo</b> shown on the home page.</span></> : <span className="gallery-empty">Tap ★ on any photo to choose the main home-page image.</span>}</div>
      <div className="form-toggles"><label className="mini-toggle"><input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} /> Featured on home</label><label className="mini-toggle"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /> Available in store</label></div>
      {error && <p className="form-error">{error}</p>}
    </div>
    <div className="modal-footer"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={submit}>{saving ? "Saving…" : `Save Product`}</Button></div>
  </motion.div></motion.div>;
}

function SettingsPage({ go, theme, setTheme, user, onUserUpdate }: { go: (path: string) => void; theme: ThemeName; setTheme: (t: ThemeName) => void; user: User | null; onUserUpdate: (u: User | null) => void }) {
  const { t, lang } = useI18n();
  const isAdmin = Boolean(user && ["admin", "owner"].includes(user.role));
  const [updating, setUpdating] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "" });
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);

  const themeOptions: Array<{ key: ThemeName; label: string; emoji: string }> = [
    { key: "light", label: t("lightTheme"), emoji: "☀️" },
    { key: "dark", label: t("darkTheme"), emoji: "🌙" },
    { key: "brand", label: t("brandTheme"), emoji: "💚" },
  ];

  const toggleNotifications = async () => {
    if (!user || updating) return;
    const previous = !!user.offerNotifications;
    const nextVal = !previous;
    // optimistic update — instant visual feedback
    onUserUpdate({ ...user, offerNotifications: nextVal });
    setUpdating(true);
    try {
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerNotifications: nextVal }),
      });
      if (response.ok) {
        const data = await response.json();
        onUserUpdate(data.user);
      } else {
        // rollback
        onUserUpdate({ ...user, offerNotifications: previous });
      }
    } catch (err) {
      console.error(err);
      onUserUpdate({ ...user, offerNotifications: previous });
    } finally {
      setUpdating(false);
    }
  };

  const handleProfileUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setUpdating(true);
    setProfileError("");
    setProfileSuccess(false);
    try {
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileForm.name, email: profileForm.email, phone: profileForm.phone }),
      });
      const data = await response.json();
      if (response.ok) {
        onUserUpdate(data.user);
        setProfileSuccess(true);
        setEditingProfile(false);
        window.setTimeout(() => setProfileSuccess(false), 3000);
      } else {
        setProfileError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setProfileError("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const startEditingProfile = () => {
    if (user) {
      setProfileForm({ name: user.name, email: user.email, phone: user.phone });
      setEditingProfile(true);
    }
  };

  return <div className={`settings-page theme-${theme}`}><header className="settings-header"><button onClick={() => go("/home")}><Icon name="arrow" size={18} /> <Brand /></button><span>{t("settings")}</span><button className="icon-button" onClick={() => go("/home")}><Icon name="close" size={19} /></button></header><main className="settings-main"><PageTitle eyebrow="PREFERENCES" title={t("settings")} copy="Make Gebna-A feel like yours." />
  
  <div className="settings-card"><h2>{t("theme")}</h2>
    <div className="theme-picker">{themeOptions.map((opt) => <button key={opt.key} className={`theme-btn ${theme === opt.key ? "active" : ""}`} onClick={() => setTheme(opt.key)}><span className="theme-emoji">{opt.emoji}</span><span>{opt.label}</span>{theme === opt.key && <span className="theme-check">✓</span>}</button>)}</div>
  </div>

  {user && (
    <div className="settings-card"><h2>{lang === "ar" ? "الإشعارات" : lang === "tr" ? "Bildirimler" : "Notifications"}</h2>
      <div className="setting-row">
        <div className="setting-icon"><Icon name="email" size={18} /></div>
        <div className="setting-copy">
          <b>{lang === "ar" ? "تنبيهات العروض" : lang === "tr" ? "Kampanya bildirimleri" : "Offer alerts"}</b>
          <span>{lang === "ar" ? "سيتم إرسال إشعار إلى بريدك الإلكتروني عندما نطلق عرضًا جديدًا." : lang === "tr" ? "Yeni bir kampanya yayınlandığında e-posta ile bilgilendirilirsiniz." : "Get notified when new offers are published."}</span>
        </div>
        <button
          type="button"
          className={`toggle ${user.offerNotifications ? "on" : ""}`}
          onClick={toggleNotifications}
          disabled={updating}
          aria-pressed={!!user.offerNotifications}
          aria-label={lang === "ar" ? "تبديل تنبيهات العروض" : lang === "tr" ? "Kampanya bildirimlerini aç/kapat" : "Toggle offer notifications"}
        >
          <span />
        </button>
      </div>
    </div>
  )}

  <div className="settings-card"><h2>Account</h2>
    {editingProfile ? (
      <form className="profile-edit-form" onSubmit={handleProfileUpdate}>
        {profileSuccess && <p className="success-message">{lang === "ar" ? "✓ تم تحديث الملف الشخصي" : lang === "tr" ? "✓ Profil güncellendi" : "✓ Profile updated"}</p>}
        {profileError && <p className="form-error">{profileError}</p>}
        <Field label={lang === "ar" ? "الاسم" : lang === "tr" ? "İsim" : "Name"} value={profileForm.name} onChange={(v) => setProfileForm({ ...profileForm, name: v })} required />
        <Field label="Email" value={profileForm.email} onChange={(v) => setProfileForm({ ...profileForm, email: v })} required />
        <Field label={lang === "ar" ? "رقم الهاتف" : lang === "tr" ? "Telefon numarası" : "Phone"} value={profileForm.phone} onChange={(v) => setProfileForm({ ...profileForm, phone: v })} required />
        <div className="profile-edit-actions">
          <Button variant="ghost" onClick={() => setEditingProfile(false)}>{lang === "ar" ? "إلغاء" : lang === "tr" ? "İptal" : "Cancel"}</Button>
          <Button type="submit" disabled={updating}>{updating ? (lang === "ar" ? "جاري الحفظ..." : lang === "tr" ? "Kaydediliyor..." : "Saving...") : (lang === "ar" ? "حفظ" : lang === "tr" ? "Kaydet" : "Save")}</Button>
        </div>
      </form>
    ) : (
      <>
        <button className="setting-row setting-clickable" onClick={startEditingProfile}><div className="setting-icon"><Icon name="user" size={18} /></div><div className="setting-copy"><b>{lang === "ar" ? "الملف الشخصي" : lang === "tr" ? "Profil" : "Profile"}</b><span>{user?.name || "Guest"}</span></div><div className="setting-chev"><Icon name="chevron" size={16} /></div></button>
        <button className="setting-row setting-clickable" onClick={() => go("/reset-password")}><div className="setting-icon"><Icon name="lock" size={18} /></div><div className="setting-copy"><b>{lang === "ar" ? "كلمة المرور" : lang === "tr" ? "Şifre" : "Password"}</b><span>{lang === "ar" ? "حافظ على حسابك آمناً" : lang === "tr" ? "Hesabınızı güvende tutun" : "Keep your account secure"}</span></div><div className="setting-chev"><Icon name="chevron" size={16} /></div></button>
      </>
    )}
  </div>
  {isAdmin && <div className="settings-card admin-card">
    <div className="admin-card-copy"><div className="admin-card-icon"><Icon name="dashboard" size={18} /></div><div><b>Admin access</b><p>Manage products, orders, and offers from your dashboard.</p></div></div>
    <Button variant="outline" onClick={() => go("/admin")}>Open admin <Icon name="arrow" size={15} /></Button>
  </div>}
  </main></div>;
}

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

function DownloadPage({ go }: { go: (path: string) => void }) {
  const { lang } = useI18n();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (window.matchMedia?.("(display-mode: standalone)")?.matches) { go("/home"); return; }
    const onPrompt = (event: Event) => { event.preventDefault(); setDeferred(event as BeforeInstallPromptEvent); };
    const onInstalled = () => { setInstalled(true); setDeferred(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const hasWindow = typeof window !== "undefined";
  const isIOS = hasWindow && /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
  const isAndroid = /Android/.test(ua);
  const install = async () => { if (installed) return; if (deferred) { setBusy(true); await deferred.prompt(); await deferred.userChoice; setBusy(false); setDeferred(null); return; } if (isIOS) { window.location.href = "/api/download/ios"; return; } window.alert(lang === "ar" ? "افتح القائمة واختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»." : "Open the browser menu and choose Install app / Add to Home Screen."); };
  const L = {
    eyebrow: { ar: "تطبيق Gebna-A", tr: "Gebna-A uygulaması", en: "THE Gebna-A APP" }[lang],
    title: { ar: "احمل متجرك في جيبك", tr: "Mağazanı cebine indir", en: "Carry your cheese shop in your pocket" }[lang],
    lead: { ar: "ثبّت Gebna-A كتطبيق حقيقي على هاتفك: شاشة كاملة، أيقونة على الرئيسية، وتعمل حتى بدون إنترنت.", tr: "Gebna-A'yı telefonuna gerçek bir uygulama olarak kur: tam ekran, ana ekran simgesi ve çevrimdışı bile çalışır.", en: "Install Gebna-A as a real app on your phone — full screen, a home-screen icon, and it keeps working even offline." }[lang],
    installBtn: installed ? { ar: "✓ تم التثبيت", tr: "✓ Yüklendi", en: "✓ Installed" }[lang] : busy ? "…" : deferred ? { ar: "تثبيت التطبيق الآن", tr: "Uygulamayı yükle", en: "Install the app now" }[lang] : isIOS ? { ar: "تنزيل ملف تثبيت iOS", tr: "iOS yükleme dosyasını indir", en: "Download iOS install file" }[lang] : { ar: "تثبيت Gebna-A", tr: "Gebna-A'yı yükle", en: "Install Gebna-A" }[lang],
    installHint: { ar: "مجاني · بدون متجر تطبيقات", tr: "Ücretsiz · Mağaza gerektirmez", en: "Free · No app store needed" }[lang],
    features: [
      { t: { ar: "شاشة كاملة", tr: "Tam ekran", en: "Full-screen app" }[lang], d: { ar: "تجربة تطبيق حقيقية بلا شريط المتصفح.", tr: "Tarayıcı çubuğu olmadan gerçek uygulama deneyimi.", en: "A true app experience with no browser bar." }[lang] },
      { t: { ar: "يعمل بدون إنترنت", tr: "Çevrimdışı çalışır", en: "Works offline" }[lang], d: { ar: "تصفّح الأصناف حتى لو انقطع الاتصال.", tr: "Bağlantı kesilse bile çeşitlere göz atın.", en: "Browse the collection even when the connection drops." }[lang] },
      { t: { ar: "أيقونة على الرئيسية", tr: "Ana ekranda simge", en: "Home-screen icon" }[lang], d: { ar: "افتح المتجر بضغطة واحدة مثل أي تطبيق.", tr: "Herhangi bir uygulama gibi tek dokunuşla açın.", en: "Open the store in one tap, like any app." }[lang] },
      { t: { ar: "خفيف وسريع", tr: "Hafif ve hızlı", en: "Light & fast" }[lang], d: { ar: "أقل من 1 ميجابايت ويحدّث نفسه تلقائياً.", tr: "1 MB'dan az ve kendini otomatik günceller.", en: "Under 1 MB and updates itself automatically." }[lang] },
    ],
    androidTitle: { ar: "أندرويد", tr: "Android", en: "Android" }[lang],
    androidSteps: lang === "ar" ? ["اضغط زر «تثبيت التطبيق».", "وافق على التثبيت في النافذة المنبثقة.", "ستظهر أيقونة Gebna-A على شاشتك الرئيسية."] : lang === "tr" ? ["\"Uygulamayı yükle\" düğmesine dokunun.", "Açılan pencerede yüklemeyi onaylayın.", "Gebna-A simgesi ana ekranınızda görünür."] : ["Tap the Install the app button.", "Confirm the install in the popup.", "The Gebna-A icon appears on your home screen."],
    androidDownload: { ar: "تنزيل تطبيق Android (.apk)", tr: "Android uygulamasını indir (.apk)", en: "Download Android app (.apk)" }[lang],
    iosTitle: { ar: "آيفون (iOS)", tr: "iPhone (iOS)", en: "iPhone (iOS)" }[lang],
    iosSteps: lang === "ar" ? ["افتح الموقع في متصفح Safari.", "اضغط زر المشاركة ⬆ في الأسفل.", "اختر «إضافة إلى الشاشة الرئيسية» ثم «إضافة»."] : lang === "tr" ? ["Siteyi Safari'de açın.", "Alt kısımdaki Paylaş ⬆ düğmesine dokunun.", "\"Ana Ekrana Ekle\" sonra \"Ekle\" seçin."] : ["Open the site in Safari.", "Tap the Share button ⬆ at the bottom.", "Choose Add to Home Screen, then Add."],
    desktopTitle: { ar: "سطح المكتب", tr: "Masaüstü", en: "Desktop" }[lang],
    desktopSteps: lang === "ar" ? ["افتح الموقع في Chrome أو Edge.", "اضغط أيقونة التثبيت في شريط العنوان.", "أو من القائمة ⋮ اختر «تثبيت Gebna-A»."] : lang === "tr" ? ["Siteyi Chrome veya Edge'de açın.", "Adres çubuğundaki yükleme simgesine tıklayın.", "Veya ⋮ menüsünden \"Gebna-A'yı yükle\" seçin."] : ["Open the site in Chrome or Edge.", "Click the install icon in the address bar.", "Or pick Install Gebna-A from the ⋮ menu."],
  };
  return <div className="store-page"><StoreHeader go={go} cartCount={0} /><main className="download-main">
    <section className="download-hero">
      <div className="download-copy"><span className="eyebrow">{L.eyebrow}</span><h1>{L.title}</h1><p className="download-lead">{L.lead}</p>
        <motion.button whileTap={{ scale: .97 }} whileHover={{ y: -2 }} className="install-button" onClick={install} disabled={installed}><span className="install-glow" /><Icon name="bag" size={19} />{L.installBtn}</motion.button>
        <p className="install-hint">{L.installHint}</p><button type="button" className="brand-domain-link" onClick={() => go("/home")}><span className="brand-domain-dot" />gebna-a.app</button>
        <div className="download-trust"><span><b>4.9</b>★</span><span>·</span><span>{lang === "ar" ? "+500 عميل سعيد" : lang === "tr" ? "+500 mutlu müşteri" : "500+ happy customers"}</span><span>·</span><span>{lang === "ar" ? "مجاني للأبد" : lang === "tr" ? "Sonsuza kadar ücretsiz" : "Free forever"}</span></div>
      </div>
      <div className="phone-stage"><motion.div className="phone-mock" animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}><div className="phone-notch" /><div className="phone-screen"><div className="phone-status"><span>9:41</span><span>● ● ●</span></div><div className="phone-app-head"><img src={LOGO} alt="Gebna-A" /><div><b>Gebna-A</b><small>{lang === "ar" ? "متجر مفتوح" : lang === "tr" ? "Mağaza açık" : "Store open"}</small></div></div><div className="phone-banner"><img src={HERO_IMAGE} alt="" /><span>{lang === "ar" ? "جبنة طازجة اليوم" : lang === "tr" ? "Bugün taze peynir" : "Fresh cheese today"}</span></div><div className="phone-grid"><div className="phone-tile"><img src="/images/phone-tile-1.jpg" alt="" /><span>₺239</span></div><div className="phone-tile"><img src="/images/phone-tile-2.jpg" alt="" /><span>₺239</span></div></div><div className="phone-dots"><i /><i className="on" /><i /></div></div></motion.div><div className="phone-shadow" /></div>
    </section>
    <section className="download-features"><div className="section-heading"><div><span className="eyebrow">{lang === "ar" ? "لماذا التطبيق؟" : lang === "tr" ? "Neden uygulama?" : "WHY THE APP"}</span><h2>{lang === "ar" ? "صُمّم ليعيش على هاتفك" : lang === "tr" ? "Telefonunuzda yaşamak için tasarlandı" : "Built to live on your phone"}</h2></div></div><div className="feature-cards">{L.features.map((feature, index) => <motion.div key={feature.t} className="feature-card" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: index * .08 }}><div className="feature-no">0{index + 1}</div><h3>{feature.t}</h3><p>{feature.d}</p></motion.div>)}</div></section>
    <section className="download-steps"><div className="section-heading"><div><span className="eyebrow">{lang === "ar" ? "طريقة التثبيت" : lang === "tr" ? "Nasıl yüklenir" : "HOW TO INSTALL"}</span><h2>{lang === "ar" ? "ثلاث طرق، دقيقة واحدة" : lang === "tr" ? "Üç yol, bir dakika" : "Three ways, one minute"}</h2></div></div>
      <div className="steps-grid">
        {([{ icon: "spark", title: L.androidTitle, steps: L.androidSteps, highlight: isAndroid, profile: false, apk: true }, { icon: "home", title: L.iosTitle, steps: L.iosSteps, highlight: isIOS, profile: true, apk: false }, { icon: "dashboard", title: L.desktopTitle, steps: L.desktopSteps, highlight: !isAndroid && !isIOS, profile: false, apk: false }] as Array<{ icon: string; title: string; steps: string[]; highlight: boolean; profile?: boolean; apk?: boolean }>).map((platform) => <div className={`step-card ${platform.highlight ? "detected" : ""}`} key={platform.title}><div className="step-head"><div className="step-icon"><Icon name={platform.icon as IconName} size={18} /></div><h3>{platform.title}</h3>{platform.highlight && <span className="step-tag">{lang === "ar" ? "جهازك" : lang === "tr" ? "Cihazınız" : "Your device"}</span>}</div><ol>{platform.steps.map((step, index) => <li key={index}><span>{index + 1}</span>{step}</li>)}</ol>{platform.profile && <a className="ios-profile-btn" href="/api/download/ios" download><Icon name="home" size={15} />{lang === "ar" ? "تنزيل ملف iOS (.mobileconfig)" : lang === "tr" ? "iOS dosyasını indir (.mobileconfig)" : "Download iOS file (.mobileconfig)"}</a>}{platform.apk && <a className="android-apk-btn" href="/gebna-a.apk" download target="_blank" rel="noreferrer"><Icon name="spark" size={15} />{L.androidDownload}</a>}</div>)}
      </div>
    </section>
    <section className="download-final"><div><span className="eyebrow">Gebna-A</span><h2>{lang === "ar" ? "جاهز للتثبيت؟" : lang === "tr" ? "Yüklemeye hazır mısınız?" : "Ready to install?"}</h2><p>{lang === "ar" ? "احصل على التطبيق مجاناً الآن وابدأ الطلب بضغطة." : lang === "tr" ? "Uygulamayı şimdi ücretsiz alın ve tek dokunuşla sipariş verin." : "Get the free app now and start ordering in a tap."}</p></div><Button variant="yellow" onClick={install}>{L.installBtn} <Icon name="arrow" size={17} /></Button></section>
  </main><footer className="store-footer"><Brand /><p>Unique Egyptian flavors, made with care.</p><span className="brand-domain">gebna-a.app</span><span>© 2026 Gebna-A</span></footer></div>;
}

export default function AppShell({ initialPath = "/" }: { initialPath?: string }) {
  const [path, setPath] = useState(initialPath);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [catalog, setCatalog] = useState<Product[]>(products);
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<ThemeName>("light");
  const [lang, setLang] = useState<Language>("ar");
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("gebna-cart"); if (saved) setCart((JSON.parse(saved) as CartItem[]).filter((item) => item.id).map((item) => ({ ...item, flavorChoice: item.flavorChoice || "cool" })));
      const savedLang = window.localStorage.getItem("gebna-lang") as Language | null; if (savedLang && ["ar", "tr", "en"].includes(savedLang)) setLang(savedLang);
      const savedTheme = window.localStorage.getItem("gebna-theme") as ThemeName | null; if (savedTheme && ["light", "dark", "brand"].includes(savedTheme)) setTheme(savedTheme);
    } catch { /* local storage is optional */ }
    const onPop = () => setPath(window.location.pathname + window.location.hash);
    window.addEventListener("popstate", onPop);
    if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => undefined));
    fetch("/api/auth/me").then((response) => response.json()).then((data) => setUser(data.user || null)).catch(() => undefined);
    fetch("/api/catalog").then((response) => response.ok ? response.json() : null).then((data) => { if (!data?.products?.length) return; const next = data.products.map((item: Record<string, unknown>) => { const category = data.categories?.find((cat: Record<string, unknown>) => cat.id === item.categoryId); const image = String(item.mainImage || item.image600g || item.image300g || item.image || ""); const pType = String(item.productType || "cheese") as "cheese" | "sandwich"; return { id: String(item.id), slug: String(item.nameEn).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"), name: String(item.nameEn), nameAr: String(item.nameAr), nameTr: String(item.nameTr), descriptionAr: String(item.descriptionAr), descriptionTr: String(item.descriptionTr), productType: pType, price300: Number(item.price300g), price600: Number(item.price600g), priceSingle: item.priceSingle ? Number(item.priceSingle) : undefined, image, images: Array.isArray(item.images) ? item.images as string[] : [], images300g: Array.isArray(item.images300g) ? item.images300g as string[] : [String(item.image300g || image)], images600g: Array.isArray(item.images600g) ? item.images600g as string[] : [String(item.image600g || image)], description: String(item.descriptionEn), category: String(category?.nameEn || "Special"), tags: Array.isArray(item.tags) ? item.tags as string[] : [], featured: Boolean(item.featured), stockStatus: String(item.stockStatus) } as Product; }); setCatalog(next); }).catch(() => undefined);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => { try { window.localStorage.setItem("gebna-cart", JSON.stringify(cart)); window.localStorage.setItem("gebna-lang", lang); window.localStorage.setItem("gebna-theme", theme); } catch { /* local storage is optional */ } }, [cart, lang, theme]);
  const setLanguage = (next: Language) => setLang(next);
  const setThemeVal = (next: ThemeName) => setTheme(next);
  const go = (nextPath: string) => {
    const [pathname, hash] = nextPath.split("#");
    if (pathname === path.split("#")[0] && hash) { document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }); return; }
    window.history.pushState({}, "", nextPath); setPath(nextPath); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const addToCart = (product: Product, size: "300g" | "600g" | "single" = "600g", flavor: string = "cool") => setCart((current) => { const key = `${product.id}-${size}-${flavor}`; const existing = current.find((item) => `${item.id}-${item.size}-${item.flavorChoice}` === key); const linePrice = size === "single" ? (product.priceSingle || product.price600) : size === "300g" ? product.price300 : product.price600; return existing ? current.map((item) => `${item.id}-${item.size}-${item.flavorChoice}` === key ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, size, flavorChoice: flavor, quantity: 1, linePrice }]; });
  const updateQuantity = (key: string, amount: number) => setCart((current) => current.map((item) => `${item.id}-${item.size}-${item.flavorChoice}` === key ? { ...item, quantity: item.quantity + amount } : item).filter((item) => item.quantity > 0));
  const updateFlavor = (key: string, flavor: FlavorChoice) => setCart((current) => { const item = current.find((entry) => `${entry.id}-${entry.size}-${entry.flavorChoice}` === key); if (!item) return current; const newKey = `${item.id}-${item.size}-${flavor}`; const existing = current.find((entry) => `${entry.id}-${entry.size}-${entry.flavorChoice}` === newKey); return existing ? current.filter((entry) => `${entry.id}-${entry.size}-${entry.flavorChoice}` !== key).map((entry) => `${entry.id}-${entry.size}-${entry.flavorChoice}` === newKey ? { ...entry, quantity: entry.quantity + item.quantity } : entry) : current.map((entry) => `${entry.id}-${entry.size}-${entry.flavorChoice}` === key ? { ...entry, flavorChoice: flavor } : entry); });
  const removeItem = (key: string) => setCart((current) => current.filter((item) => `${item.id}-${item.size}-${item.flavorChoice}` !== key));
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const { scrollYProgress } = useScroll();
  const currentProduct = useMemo(() => { const slug = path.split("/").pop()?.toLowerCase(); return catalog.find((product) => product.slug === slug || product.id === slug) || catalog[0]; }, [catalog, path]);
  const pathKey = path.split("#")[0];
  let content: React.ReactNode;
  if (path === "/" || path === "") content = <SplashPage go={go} />;
  else if (path === "/home" || path === "/home#products") content = <HomePage go={go} addToCart={addToCart} cartCount={cartCount} catalog={catalog} />;
  else if (path === "/cart") content = <CartPage cart={cart} go={go} updateQuantity={updateQuantity} removeItem={removeItem} updateFlavor={updateFlavor} />;
  else if (path === "/checkout") content = <CheckoutPage cart={cart} go={go} clearCart={() => setCart([])} user={user} />;
  else if (path === "/orders") content = <OrdersPage go={go} />;
  else if (path === "/login") content = <LoginPage go={go} onAuth={setUser} />;
  else if (path === "/register") content = <RegisterPage go={go} onAuth={setUser} />;
  else if (path === "/forgot-password") content = <PasswordPage go={go} />;
  else if (path === "/reset-password") content = <PasswordPage go={go} reset />;
  else if (path === "/settings") content = <SettingsPage go={go} theme={theme} setTheme={setThemeVal} user={user} onUserUpdate={setUser} />;
  else if (path === "/download") content = <DownloadPage go={go} />;
  else if (path === "/admin") content = <AdminPage go={go} user={user} catalog={catalog} />;
  else if (path === "/ProductDetail" || path.startsWith("/product/")) content = <ProductDetailPage product={currentProduct} go={go} addToCart={addToCart} cartCount={cartCount} user={user} />;
  else content = <HomePage go={go} addToCart={addToCart} cartCount={cartCount} catalog={catalog} />;
  return <ThemeContext.Provider value={{ theme, setTheme: setThemeVal }}><LanguageContext.Provider value={{ lang, setLang: setLanguage, t: (key) => copy[lang][key] || copy.en[key] || key }}><div className={`app-root lang-${lang} theme-${theme}`} dir={lang === "ar" ? "rtl" : "ltr"}><motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} /><AnimatePresence mode="wait"><motion.div key={pathKey} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .22, ease: [0.22, 1, 0.36, 1] }}>{content}</motion.div></AnimatePresence><InstallPrompt /></div></LanguageContext.Provider></ThemeContext.Provider>;
}

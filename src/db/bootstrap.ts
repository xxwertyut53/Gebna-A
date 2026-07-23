import bcrypt from "bcryptjs";
import { execSync } from "child_process";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, offers, orderItems, orders, products, users } from "@/db/schema";
import { normalizePhone } from "@/lib/phone";

const B = "https://base44.app/api/apps/6a3067563c27b191946c5e4f/files/mp/public/6a3067563c27b191946c5e4f/";

const CATEGORY_MAP: Record<string, { en: string; tr: string; ar: string }> = {
  classic: { en: "Classic", tr: "Klasik", ar: "كلاسيك" },
  pepper: { en: "Pepper", tr: "Biberli", ar: "فلفل" },
  special: { en: "Special", tr: "Özel", ar: "مميز" },
  sandwich: { en: "Sandwich", tr: "Sandviç", ar: "ساندوتش" },
};

interface SeedProduct {
  nameEn: string; category: string; p300: number; p600: number;
  descriptionEn: string; descriptionAr: string; descriptionTr: string;
  tags: string[]; featured: boolean;
  mainImage: string; image600g: string; image300g: string;
  images600g: string[]; images300g: string[];
}

const PRODUCTS: SeedProduct[] = [
  { nameEn: "Classic", category: "classic", p300: 139, p600: 239, featured: true,
    descriptionEn: "Simplicity when crafted with perfection. Gebna-A plain cheese combines rich flavor and creamy texture in every bite, so you can enjoy an authentic taste and quality worth having every day.",
    descriptionAr: "البساطة عندما تُصنع بإتقان. جبنة Gebna-A السادة تجمع بين المذاق الغني والقوام الكريمي في كل لقمة، لتستمتع بطعم أصيل وجودة تستحق أن تتكرر كل يوم.",
    descriptionTr: "Basitlik, ustalıkla yapıldığında güzeldir. Gebna-A sade peyniri, her lokmada zengin tadı ve kremamsı dokusunu bir araya getirerek, her gün tekrar yaşamak isteyeceğiniz özgün bir lezzet ve kalite sunar.",
    tags: ["سادة", "Artisan", "Mild"], mainImage: `${B}8cca3ef6d_SAVE_20260625_024331.jpg`, image600g: `${B}8cca3ef6d_SAVE_20260625_024331.jpg`, image300g: "https://img.freepik.com/premium-photo/farm-fresh-milk-professional-captures-milk-being-collected-from-dairy-cows-farm-emphasizing-freshness-qu-ai-generated-illustration_866663-25099.jpg?w=1480",
    images600g: [`${B}8cca3ef6d_SAVE_20260625_024331.jpg`, `${B}a3fe0d535_SAVE_20260625_024505.jpg`], images300g: ["https://img.freepik.com/premium-photo/farm-fresh-milk-professional-captures-milk-being-collected-from-dairy-cows-farm-emphasizing-freshness-qu-ai-generated-illustration_866663-25099.jpg?w=1480"] },
  { nameEn: "Shamar", category: "special", p300: 139, p600: 239, featured: true,
    descriptionEn: "A mix of creamy cheese and fennel seeds with a light aromatic scent and a unique flavor that gives a different experience for those who love distinction.",
    descriptionAr: "مزيج بين الجبنة الكريمي و حبيبات الشمر برائحة عطرية خفيفة ونكهة فريدة تمنح تجربة مختلفة لمحبي التميز.",
    descriptionTr: "Krem peynir ile rezene tanelerinin hafif aromalı ve eşsiz lezzeti, farklı bir deneyim sunuyor ve özgün tatları sevenler için ideal.",
    tags: ["شمر", "Artisan", "Aromatic"], mainImage: `${B}1b2285eb8_5924799521483328933.jpg`, image600g: `${B}1b2285eb8_5924799521483328933.jpg`, image300g: `${B}1b2285eb8_5924799521483328933.jpg`,
    images600g: [`${B}1b2285eb8_5924799521483328933.jpg`], images300g: [`${B}1b2285eb8_5924799521483328933.jpg`] },
  { nameEn: "Barakota", category: "special", p300: 139, p600: 239, featured: true,
    descriptionEn: "The authentic Eastern flavor of a mix of creamy cheese with nigella seeds that add depth and a beloved traditional touch.",
    descriptionAr: "النكهة الشرقية الأصيلة لمزيج من الجبنة الكريمي مع حبة البركة التي تضيف عمقًا وطابعًا تقليديًا محببًا.",
    descriptionTr: "Krem peynir ile çörek otu karışımının özgün doğu lezzeti, derinlik ve sevilen geleneksel bir tat katıyor.",
    tags: ["حبة البركة", "Artisan", "Classic"], mainImage: `${B}138e8f564_5924799521483328938.jpg`, image600g: `${B}5245a4149_59247995214833289381.jpg`, image300g: `${B}ba62ff9aa_59247995214833289381.jpg`,
    images600g: [`${B}5245a4149_59247995214833289381.jpg`], images300g: [`${B}ba62ff9aa_59247995214833289381.jpg`] },
  { nameEn: "Mexicano", category: "pepper", p300: 135, p600: 239, featured: true,
    descriptionEn: "A rich flavor and an attractive color with a light touch of the natural sweetness of red peppers.",
    descriptionAr: "نكهة غنية ولون جذاب مع لمسة خفيفة من الحلاوة الطبيعية للفلفل الأحمر.",
    descriptionTr: "Kırmızı biberin doğal tatlılığıyla hafif bir dokunuşla zengin bir aroma ve çekici bir renk.",
    tags: ["فلفل احمر", "Spicy", "Red Pepper"], mainImage: `${B}7a88cc1c7_SAVE_20260625_023316.jpg`, image600g: `${B}4a4a0159c_SAVE_20260625_025037.jpg`, image300g: `${B}03919bad0_5924799521483328937.jpg`,
    images600g: [`${B}4a4a0159c_SAVE_20260625_025037.jpg`, `${B}7a88cc1c7_SAVE_20260625_023316.jpg`, `${B}88c8f0568_SAVE_20260625_024628.jpg`, `${B}40839cbbf_5924799521483328937.jpg`], images300g: [`${B}03919bad0_5924799521483328937.jpg`, `${B}fe25d50a0_WhatsAppImage2026-07-02at30347AM.jpeg`] },
  { nameEn: "Kalamata", category: "special", p300: 164, p600: 264, featured: false,
    descriptionEn: "A genuine Mediterranean taste that combines the saltiness of black olives with the creaminess of cheese.",
    descriptionAr: "مذاق متوسطي أصيل يجمع بين ملوحة الزيتون الأسود ونعومة الجبنة.",
    descriptionTr: "Gerçek Akdeniz tadı, siyah zeytinin tuzluluğu ile peynirin yumuşaklığını bir araya getiriyor.",
    tags: ["زيتون اسود", "Artisan", "Mild"], mainImage: `${B}3ffd0abec_SAVE_20260625_245249.jpg`, image600g: `${B}465dcb714_5924799521483328934.jpg`, image300g: `${B}8f1b07e3b_5924799521483328934.jpg`,
    images600g: [`${B}465dcb714_5924799521483328934.jpg`, `${B}3ffd0abec_SAVE_20260625_245249.jpg`, `${B}9a0905db4_SAVE_20260625_024425.jpg`], images300g: [`${B}8f1b07e3b_5924799521483328934.jpg`] },
  { nameEn: "Alasly", category: "classic", p300: 164, p600: 264, featured: false,
    descriptionEn: "A refreshing taste and a light herbal touch give the cheese a balanced and distinctive flavor.",
    descriptionAr: "مذاق منعش ولمسة عشبية خفيفة تمنح الجبنة طعمًا متوازنًا ومميزًا.",
    descriptionTr: "Ferahlatıcı bir tat ve hafif bitkisel dokunuş, peynire dengeli ve özel bir lezzet kazandırıyor.",
    tags: ["شبت", "Mild", "Artisan"], mainImage: `${B}c55de3d15_SAVE_20260625_023402.jpg`, image600g: `${B}e71c15394_5924799521483328935.jpg`, image300g: `${B}1a942a043_WhatsAppImage2026-07-02at30346AM.jpeg`,
    images600g: [`${B}e71c15394_5924799521483328935.jpg`, `${B}c55de3d15_SAVE_20260625_023402.jpg`], images300g: [`${B}1a942a043_WhatsAppImage2026-07-02at30346AM.jpeg`, `${B}06c35d115_SAVE_20260625_024921.jpg`] },
  { nameEn: "Zatalona", category: "special", p300: 164, p600: 264, featured: false,
    descriptionEn: "A refreshing and unique flavor that adds a lively and appealing touch to the cheese.",
    descriptionAr: "نكهة منعشة ومميزة تضيف طابعًا حيويًا ومحببًا للجبنة.",
    descriptionTr: "Ferah ve özel bir tat, peynire canlı ve sevimli bir hava katıyor.",
    tags: ["زيتون اخضر", "Artisan", "Aromatic"], mainImage: `${B}98cabc55c_59247995214833289361.jpg`, image600g: `${B}98cabc55c_59247995214833289361.jpg`, image300g: `${B}339364cc6_59247995214833289361.jpg`,
    images600g: [`${B}98cabc55c_59247995214833289361.jpg`], images300g: [`${B}339364cc6_59247995214833289361.jpg`] },
  { nameEn: "Halapeno", category: "pepper", p300: 170, p600: 270, featured: false,
    descriptionEn: "For lovers of bold flavors, a balanced kick that adds excitement to every bite.",
    descriptionAr: "لعشاق النكهات الجريئة، حدة متوازنة تضيف إثارة لكل لقمة.",
    descriptionTr: "Cesur lezzet tutkunları için, her lokmaya heyecan katan dengeli bir keskinlik.",
    tags: ["هالبينو", "Spicy", "Pepper"], mainImage: `${B}8685eecb2_6050981949788065377.jpg`, image600g: `${B}41130db4f_60509819497880653771.jpg`, image300g: `${B}0b3a07262_60509819497880653771.jpg`,
    images600g: [`${B}41130db4f_60509819497880653771.jpg`], images300g: [`${B}0b3a07262_60509819497880653771.jpg`] },
];

function ensureSchema() {
  try {
    const cmd = process.platform === "win32" ? "npx.cmd drizzle-kit push" : "npx drizzle-kit push";
    execSync(cmd, { stdio: "pipe", timeout: 60000 });
    console.info("[bootstrap] schema ready");
  } catch (error) {
    console.error("[bootstrap] schema push failed", error instanceof Error ? error.message : error);
  }
}

async function seedCategories() {
  const ids: Record<string, string> = {};
  for (const slug of Object.keys(CATEGORY_MAP)) {
    const names = CATEGORY_MAP[slug];
    let [row] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    if (!row) [row] = await db.insert(categories).values({ slug, nameEn: names.en, nameTr: names.tr, nameAr: names.ar }).returning();
    ids[slug] = row.id;
  }
  return ids;
}

async function seedProducts(categoryIds: Record<string, string>) {
  let created = 0, updated = 0;
  for (const p of PRODUCTS) {
    const value = {
      categoryId: categoryIds[p.category] || null,
      nameEn: p.nameEn, nameTr: p.nameEn, nameAr: p.nameEn,
      descriptionEn: p.descriptionEn, descriptionAr: p.descriptionAr, descriptionTr: p.descriptionTr,
      price300g: p.p300.toFixed(2), price600g: p.p600.toFixed(2),
      mainImage: p.mainImage, image600g: p.image600g, image300g: p.image300g,
      images600g: p.images600g, images300g: p.images300g, tags: p.tags,
      featured: p.featured, active: true, stockStatus: "in_stock",
      createdAt: new Date(),
    };
    const [existing] = await db.select({ id: products.id }).from(products).where(eq(products.nameEn, p.nameEn)).limit(1);
    if (existing) { await db.update(products).set({ ...value, updatedAt: new Date() }).where(eq(products.id, existing.id)); updated++; }
    else { await db.insert(products).values(value); created++; }
  }
  return { created, updated };
}

async function seedOwner() {
  const email = process.env.ADMIN_EMAIL || "nedal2turk@gmail.com";
  const phone = normalizePhone(process.env.ADMIN_PHONE || "05510669847");
  const password = process.env.ADMIN_PASSWORD || "01007171670Nn";
  const hash = await bcrypt.hash(password, 12);
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) await db.update(users).set({ name: "Gebna-A Owner", phone, passwordHash: hash, role: "owner" }).where(eq(users.id, existing.id));
  else await db.insert(users).values({ name: "Gebna-A Owner", email, phone, passwordHash: hash, role: "owner" });
}

async function seedDemo() {
  const email = "mariam.demo@gebna-a.app";
  let [customer] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!customer) [customer] = await db.insert(users).values({ name: "Mariam Hassan", email, phone: "5551234567", passwordHash: await bcrypt.hash("demo-pass-123", 12), role: "customer" }).returning();
  const [classic] = await db.select().from(products).where(eq(products.nameEn, "Classic")).limit(1);
  const [mexicano] = await db.select().from(products).where(eq(products.nameEn, "Mexicano")).limit(1);
  if (classic && mexicano) {
    const [pending] = await db.select().from(orders).where(eq(orders.orderCode, "GA-DEMO01")).limit(1);
    if (!pending) {
      const [order] = await db.insert(orders).values({ orderCode: "GA-DEMO01", userId: customer.id, customerName: customer.name, customerEmail: customer.email, customerPhone: customer.phone, deliveryAddress: "Bağdat Cd. 120", deliveryCity: "Istanbul", deliveryDistrict: "Kadıköy", total: (Number(classic.price600g) + Number(mexicano.price600g)).toFixed(2), status: "pending", orderSource: "in_app" }).returning();
      await db.insert(orderItems).values([
        { orderId: order.id, productId: classic.id, productName: classic.nameEn, size: "600g", flavorChoice: "cool", quantity: "1", unitPrice: classic.price600g },
        { orderId: order.id, productId: mexicano.id, productName: mexicano.nameEn, size: "600g", flavorChoice: "spicy", quantity: "1", unitPrice: mexicano.price600g },
      ]);
    }
    const [delivered] = await db.select().from(orders).where(eq(orders.orderCode, "GA-DEMO02")).limit(1);
    if (!delivered) {
      const [order] = await db.insert(orders).values({ orderCode: "GA-DEMO02", userId: customer.id, customerName: customer.name, customerEmail: customer.email, customerPhone: customer.phone, deliveryAddress: "İstiklal Cd. 45", deliveryCity: "Istanbul", deliveryDistrict: "Beyoğlu", total: classic.price600g, status: "delivered", orderSource: "in_app" }).returning();
      await db.insert(orderItems).values([{ orderId: order.id, productId: classic.id, productName: classic.nameEn, size: "600g", flavorChoice: "cool", quantity: "1", unitPrice: classic.price600g }]);
    }
  }
  const [offer] = await db.select().from(offers).where(eq(offers.titleEn, "Weekend cheese lovers")).limit(1);
  if (!offer) await db.insert(offers).values({ titleEn: "Weekend cheese lovers", titleTr: "Hafta sonu peynir severler", titleAr: "عشاق الجبن في نهاية الأسبوع", descriptionEn: "10% off the whole cart every Saturday & Sunday.", descriptionTr: "Her Cumartesi ve Pazar sepette %10 indirim.", descriptionAr: "خصم ١٠٪ على السلة كل سبت وأحد.", type: "percentage", discountPercent: "10", active: true });
}

let bootstrapping: Promise<void> | null = null;

export function bootstrapDb(): Promise<void> {
  if (bootstrapping) return bootstrapping;
  bootstrapping = (async () => {
    try {
      // ensureSchema();  // Skip for now, we pushed schema manually!
      const categoryIds = await seedCategories();
      const p = await seedProducts(categoryIds);
      await seedOwner();
      await seedDemo();
      console.info(`[bootstrap] products created=${p.created} updated=${p.updated}; demo + owner ready`);
    } catch (error) {
      console.error("[bootstrap] seed failed", error);
    }
  })();
  return bootstrapping;
}

import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, pool } from "@/db";
import { categories, productImages, products, users } from "@/db/schema";
import { normalizePhone } from "@/lib/phone";

const imageBase = "https://base44.app/api/apps/6a3067563c27b191946c5e4f/files/mp/public/6a3067563c27b191946c5e4f/";
const catalog = [
  { slug: "classic", en: "Classic", tr: "Klasik", ar: "سادة", desc: "Simplicity when crafted with perfection. A rich, creamy cheese with an authentic everyday taste.", category: "classic", p300: 139, p600: 239, image: `${imageBase}8cca3ef6d_SAVE_20260625_024331.jpg`, tags: ["Artisan", "Mild"], featured: true },
  { slug: "shamar", en: "Shamar", tr: "Şamar", ar: "شمر", desc: "Creamy cheese with fennel seeds, a light aromatic scent, and a unique flavor for those who love distinction.", category: "special", p300: 139, p600: 239, image: `${imageBase}1b2285eb8_5924799521483328933.jpg`, tags: ["Artisan", "Aromatic"], featured: true },
  { slug: "barakota", en: "Barakota", tr: "Barakota", ar: "حبة البركة", desc: "The authentic Eastern flavor of creamy cheese with nigella seeds and a beloved traditional touch.", category: "special", p300: 139, p600: 239, image: `${imageBase}138e8f564_5924799521483328938.jpg`, tags: ["Artisan", "Classic"], featured: true },
  { slug: "mexicano", en: "Mexicano", tr: "Meksika", ar: "مكسيكانو", desc: "A rich flavor and attractive color with a light touch of the natural sweetness of red peppers.", category: "pepper", p300: 135, p600: 239, image: `${imageBase}7a88cc1c7_SAVE_20260625_023316.jpg`, tags: ["Spicy", "Red Pepper"], featured: true },
  { slug: "kalamata", en: "Kalamata", tr: "Kalamata", ar: "كالاماتا", desc: "Creamy handcrafted cheese folded with the deep, savory notes of black olive.", category: "special", p300: 164, p600: 264, image: `${imageBase}3ffd0abec_SAVE_20260625_245249.jpg`, tags: ["Artisan", "Mild"], featured: false },
  { slug: "alasly", en: "Alasly", tr: "Alasly", ar: "العسلي", desc: "A bright, fresh cheese with a gentle herb finish and a smooth, luxurious texture.", category: "classic", p300: 164, p600: 264, image: `${imageBase}c55de3d15_SAVE_20260625_023402.jpg`, tags: ["Mild", "Artisan"], featured: false },
  { slug: "zatalona", en: "Zatalona", tr: "Zatalona", ar: "زيتونة", desc: "A fragrant dill-inspired variety, made for a fresh and memorable cheese board.", category: "special", p300: 164, p600: 264, image: `${imageBase}98cabc55c_59247995214833289361.jpg`, tags: ["Artisan", "Aromatic"], featured: false },
  { slug: "halapeno", en: "Halapeno", tr: "Jalapeno", ar: "هالبينو", desc: "Creamy Egyptian cheese with a warm jalapeño kick for an adventurous bite.", category: "pepper", p300: 170, p600: 270, image: `${imageBase}8685eecb2_6050981949788065377.jpg`, tags: ["Spicy", "Pepper"], featured: false },
];

async function getOrCreateCategory(category: typeof catalog[number]["category"], names: { en: string; tr: string; ar: string }) {
  const [existing] = await db.select().from(categories).where(eq(categories.slug, category)).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(categories).values({ slug: category, nameEn: names.en, nameTr: names.tr, nameAr: names.ar }).returning();
  return created;
}

async function seed() {
  const categoryNames = {
    classic: { en: "Classic", tr: "Klasik", ar: "كلاسيك" },
    pepper: { en: "Pepper", tr: "Biberli", ar: "فلفل" },
    special: { en: "Special", tr: "Özel", ar: "مميز" },
    sandwich: { en: "Sandwich", tr: "Sandviç", ar: "ساندوتش" },
  } as const;
  const categoryMap = new Map<string, string>();
  for (const category of Object.keys(categoryNames) as Array<keyof typeof categoryNames>) categoryMap.set(category, (await getOrCreateCategory(category, categoryNames[category])).id);
  for (const item of catalog) {
    const [existing] = await db.select().from(products).where(eq(products.nameEn, item.en)).limit(1);
    if (existing) continue;
    const [product] = await db.insert(products).values({ categoryId: categoryMap.get(item.category), nameEn: item.en, nameTr: item.tr, nameAr: item.ar, descriptionEn: item.desc, descriptionTr: item.desc, descriptionAr: item.desc, price300g: item.p300.toFixed(2), price600g: item.p600.toFixed(2), image300g: item.image, image600g: item.image, images300g: [item.image], images600g: [item.image], tags: item.tags, featured: item.featured, active: true, stockStatus: "in_stock" }).returning();
    await db.insert(productImages).values([{ productId: product.id, size: "300g", imageUrl: item.image, isMain: true, sortOrder: "0" }, { productId: product.id, size: "600g", imageUrl: item.image, isMain: true, sortOrder: "0" }]);
  }
  const adminEmail = process.env.ADMIN_EMAIL || "nedal2turk@gmail.com";
  const adminPhone = normalizePhone(process.env.ADMIN_PHONE || "05510669847");
  const adminPassword = process.env.ADMIN_PASSWORD || "01007171670Nn";
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const [admin] = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
  if (admin) await db.update(users).set({ name: "Gebna-A Owner", phone: adminPhone, passwordHash, role: "owner", updatedAt: new Date() }).where(eq(users.id, admin.id));
  else await db.insert(users).values({ name: "Gebna-A Owner", email: adminEmail, phone: adminPhone, passwordHash, role: "owner" });
  console.log(`Seeded ${catalog.length} artisan cheeses and owner ${adminEmail} (${adminPhone}).`);
}

seed().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await pool.end(); });

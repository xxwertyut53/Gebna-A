import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, pool } from "@/db";
import { products } from "@/db/schema";

const B = "https://base44.app/api/apps/6a3067563c27b191946c5e4f/files/mp/public/6a3067563c27b191946c5e4f/";

const realData: Array<{
  nameEn: string;
  descriptionEn: string;
  descriptionAr: string;
  descriptionTr: string;
  tags: string[];
  mainImage: string;
  images600g: string[];
  images300g: string[];
  image600g: string;
  image300g: string;
}> = [
  {
    nameEn: "Classic",
    descriptionEn: "Simplicity when crafted with perfection. Gebna-A plain cheese combines rich flavor and creamy texture in every bite, so you can enjoy an authentic taste and quality worth having every day.",
    descriptionAr: "البساطة عندما تُصنع بإتقان. جبنة Gebna-A السادة تجمع بين المذاق الغني والقوام الكريمي في كل لقمة، لتستمتع بطعم أصيل وجودة تستحق أن تتكرر كل يوم.",
    descriptionTr: "Basitlik, ustalıkla yapıldığında güzeldir. Gebna-A sade peyniri, her lokmada zengin tadı ve kremamsı dokusunu bir araya getirerek, her gün tekrar yaşamak isteyeceğiniz özgün bir lezzet ve kalite sunar.",
    tags: ["سادة", "Artisan", "Mild"],
    mainImage: `${B}8cca3ef6d_SAVE_20260625_024331.jpg`,
    images600g: [
      `${B}8cca3ef6d_SAVE_20260625_024331.jpg`,
      `${B}a3fe0d535_SAVE_20260625_024505.jpg`,
    ],
    images300g: [
      "https://img.freepik.com/premium-photo/farm-fresh-milk-professional-captures-milk-being-collected-from-dairy-cows-farm-emphasizing-freshness-qu-ai-generated-illustration_866663-25099.jpg?w=1480",
    ],
    image600g: `${B}8cca3ef6d_SAVE_20260625_024331.jpg`,
    image300g: "https://img.freepik.com/premium-photo/farm-fresh-milk-professional-captures-milk-being-collected-from-dairy-cows-farm-emphasizing-freshness-qu-ai-generated-illustration_866663-25099.jpg?w=1480",
  },
  {
    nameEn: "Shamar",
    descriptionEn: "A mix of creamy cheese and fennel seeds with a light aromatic scent and a unique flavor that gives a different experience for those who love distinction.",
    descriptionAr: "مزيج بين الجبنة الكريمي و حبيبات الشمر برائحة عطرية خفيفة ونكهة فريدة تمنح تجربة مختلفة لمحبي التميز.",
    descriptionTr: "Krem peynir ile rezene tanelerinin hafif aromalı ve eşsiz lezzeti, farklı bir deneyim sunuyor ve özgün tatları sevenler için ideal.",
    tags: ["شمر", "Artisan", "Aromatic"],
    mainImage: `${B}1b2285eb8_5924799521483328933.jpg`,
    images600g: [`${B}1b2285eb8_5924799521483328933.jpg`],
    images300g: [`${B}1b2285eb8_5924799521483328933.jpg`],
    image600g: `${B}1b2285eb8_5924799521483328933.jpg`,
    image300g: `${B}1b2285eb8_5924799521483328933.jpg`,
  },
  {
    nameEn: "Barakota",
    descriptionEn: "The authentic Eastern flavor of a mix of creamy cheese with nigella seeds that add depth and a beloved traditional touch.",
    descriptionAr: "النكهة الشرقية الأصيلة لمزيج من الجبنة الكريمي مع حبة البركة التي تضيف عمقًا وطابعًا تقليديًا محببًا.",
    descriptionTr: "Krem peynir ile çörek otu karışımının özgün doğu lezzeti, derinlik ve sevilen geleneksel bir tat katıyor.",
    tags: ["حبة البركة", "Artisan", "Classic"],
    mainImage: `${B}138e8f564_5924799521483328938.jpg`,
    images600g: [`${B}5245a4149_59247995214833289381.jpg`],
    images300g: [`${B}ba62ff9aa_59247995214833289381.jpg`],
    image600g: `${B}5245a4149_59247995214833289381.jpg`,
    image300g: `${B}ba62ff9aa_59247995214833289381.jpg`,
  },
  {
    nameEn: "Mexicano",
    descriptionEn: "A rich flavor and an attractive color with a light touch of the natural sweetness of red peppers.",
    descriptionAr: "نكهة غنية ولون جذاب مع لمسة خفيفة من الحلاوة الطبيعية للفلفل الأحمر.",
    descriptionTr: "Kırmızı biberin doğal tatlılığıyla hafif bir dokunuşla zengin bir aroma ve çekici bir renk.",
    tags: ["فلفل احمر", "Spicy", "Red Pepper"],
    mainImage: `${B}7a88cc1c7_SAVE_20260625_023316.jpg`,
    images600g: [
      `${B}4a4a0159c_SAVE_20260625_025037.jpg`,
      `${B}7a88cc1c7_SAVE_20260625_023316.jpg`,
      `${B}88c8f0568_SAVE_20260625_024628.jpg`,
      `${B}40839cbbf_5924799521483328937.jpg`,
    ],
    images300g: [
      `${B}03919bad0_5924799521483328937.jpg`,
      `${B}fe25d50a0_WhatsAppImage2026-07-02at30347AM.jpeg`,
    ],
    image600g: `${B}4a4a0159c_SAVE_20260625_025037.jpg`,
    image300g: `${B}03919bad0_5924799521483328937.jpg`,
  },
  {
    nameEn: "Kalamata",
    descriptionEn: "A genuine Mediterranean taste that combines the saltiness of black olives with the creaminess of cheese.",
    descriptionAr: "مذاق متوسطي أصيل يجمع بين ملوحة الزيتون الأسود ونعومة الجبنة.",
    descriptionTr: "Gerçek Akdeniz tadı, siyah zeytinin tuzluluğu ile peynirin yumuşaklığını bir araya getiriyor.",
    tags: ["زيتون اسود", "Artisan", "Mild"],
    mainImage: `${B}3ffd0abec_SAVE_20260625_245249.jpg`,
    images600g: [
      `${B}465dcb714_5924799521483328934.jpg`,
      `${B}3ffd0abec_SAVE_20260625_245249.jpg`,
      `${B}9a0905db4_SAVE_20260625_024425.jpg`,
    ],
    images300g: [
      `${B}8f1b07e3b_5924799521483328934.jpg`,
    ],
    image600g: `${B}465dcb714_5924799521483328934.jpg`,
    image300g: `${B}8f1b07e3b_5924799521483328934.jpg`,
  },
  {
    nameEn: "Alasly",
    descriptionEn: "A refreshing taste and a light herbal touch give the cheese a balanced and distinctive flavor.",
    descriptionAr: "مذاق منعش ولمسة عشبية خفيفة تمنح الجبنة طعمًا متوازنًا ومميزًا.",
    descriptionTr: "Ferahlatıcı bir tat ve hafif bitkisel dokunuş, peynire dengeli ve özel bir lezzet kazandırıyor.",
    tags: ["شبت", "Mild", "Artisan"],
    mainImage: `${B}c55de3d15_SAVE_20260625_023402.jpg`,
    images600g: [
      `${B}e71c15394_5924799521483328935.jpg`,
      `${B}c55de3d15_SAVE_20260625_023402.jpg`,
    ],
    images300g: [
      `${B}1a942a043_WhatsAppImage2026-07-02at30346AM.jpeg`,
      `${B}06c35d115_SAVE_20260625_024921.jpg`,
    ],
    image600g: `${B}e71c15394_5924799521483328935.jpg`,
    image300g: `${B}1a942a043_WhatsAppImage2026-07-02at30346AM.jpeg`,
  },
  {
    nameEn: "Zatalona",
    descriptionEn: "A refreshing and unique flavor that adds a lively and appealing touch to the cheese.",
    descriptionAr: "نكهة منعشة ومميزة تضيف طابعًا حيويًا ومحببًا للجبنة.",
    descriptionTr: "Ferah ve özel bir tat, peynire canlı ve sevimli bir hava katıyor.",
    tags: ["زيتون اخضر", "Artisan", "Aromatic"],
    mainImage: `${B}98cabc55c_59247995214833289361.jpg`,
    images600g: [`${B}98cabc55c_59247995214833289361.jpg`],
    images300g: [`${B}339364cc6_59247995214833289361.jpg`],
    image600g: `${B}98cabc55c_59247995214833289361.jpg`,
    image300g: `${B}339364cc6_59247995214833289361.jpg`,
  },
  {
    nameEn: "Halapeno",
    descriptionEn: "For lovers of bold flavors, a balanced kick that adds excitement to every bite.",
    descriptionAr: "لعشاق النكهات الجريئة، حدة متوازنة تضيف إثارة لكل لقمة.",
    descriptionTr: "Cesur lezzet tutkunları için, her lokmaya heyecan katan dengeli bir keskinlik.",
    tags: ["هالبينو", "Spicy", "Pepper"],
    mainImage: `${B}8685eecb2_6050981949788065377.jpg`,
    images600g: [`${B}41130db4f_60509819497880653771.jpg`],
    images300g: [`${B}0b3a07262_60509819497880653771.jpg`],
    image600g: `${B}41130db4f_60509819497880653771.jpg`,
    image300g: `${B}0b3a07262_60509819497880653771.jpg`,
  },
];

async function sync() {
  let updated = 0;
  for (const data of realData) {
    const [existing] = await db.select().from(products).where(eq(products.nameEn, data.nameEn)).limit(1);
    if (!existing) { console.log(`⚠ Product "${data.nameEn}" not found, skipping.`); continue; }
    await db.update(products).set({
      descriptionEn: data.descriptionEn,
      descriptionAr: data.descriptionAr,
      descriptionTr: data.descriptionTr,
      tags: data.tags,
      mainImage: data.mainImage,
      images600g: data.images600g,
      images300g: data.images300g,
      image600g: data.image600g,
      image300g: data.image300g,
      updatedAt: new Date(),
    }).where(eq(products.id, existing.id));
    updated++;
    console.log(`✓ ${data.nameEn}: ${data.images600g.length} 600g + ${data.images300g.length} 300g photos, AR/TR descriptions, tags=[${data.tags.join(",")}]`);
  }
  console.log(`\nSynced ${updated} products with real store data.`);
}

sync().catch((e) => { console.error(e); process.exitCode = 1; }).finally(async () => { await pool.end(); });

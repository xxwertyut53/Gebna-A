import { relations } from "drizzle-orm";
import { boolean, jsonb, numeric, pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  passwordHash: text("password_hash"),
  role: text("role").notNull().default("customer"),
  offerNotifications: boolean("offer_notifications").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailUnique: uniqueIndex("users_email_unique").on(table.email),
  phoneUnique: uniqueIndex("users_phone_unique").on(table.phone),
}));

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull(),
  nameEn: text("name_en").notNull(),
  nameTr: text("name_tr").notNull(),
  nameAr: text("name_ar").notNull(),
  descriptionEn: text("description_en"),
  descriptionTr: text("description_tr"),
  descriptionAr: text("description_ar"),
  sortOrder: numeric("sort_order", { precision: 10, scale: 0 }).default("0").notNull(),
  active: boolean("active").default(true).notNull(),
}, (table) => ({
  slugUnique: uniqueIndex("categories_slug_unique").on(table.slug),
}));

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  nameEn: text("name_en").notNull(),
  nameTr: text("name_tr").notNull(),
  nameAr: text("name_ar").notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionTr: text("description_tr").notNull(),
  descriptionAr: text("description_ar").notNull(),
  productType: text("product_type").notNull().default("cheese"),
  flavors: jsonb("flavors").$type<string[]>().default(["cool", "spicy", "veryhot"]).notNull(),
  price300g: numeric("price_300g", { precision: 10, scale: 2 }).notNull(),
  price600g: numeric("price_600g", { precision: 10, scale: 2 }).notNull(),
  priceSingle: numeric("price_single", { precision: 10, scale: 2 }),
  image300g: text("image_300g"),
  image600g: text("image_600g"),
  mainImage: text("main_image"),
  images: jsonb("images").$type<string[]>().default([]).notNull(),
  images300g: jsonb("images_300g").$type<string[]>().default([]).notNull(),
  images600g: jsonb("images_600g").$type<string[]>().default([]).notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  stockStatus: text("stock_status").notNull().default("in_stock"),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const productImages = pgTable("product_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  size: text("size").notNull(),
  imageUrl: text("image_url").notNull(),
  isMain: boolean("is_main").notNull().default(false),
  sortOrder: numeric("sort_order", { precision: 10, scale: 0 }).default("0").notNull(),
});

export const offers = pgTable("offers", {
  id: uuid("id").defaultRandom().primaryKey(),
  titleEn: text("title_en").notNull(),
  titleTr: text("title_tr").notNull(),
  titleAr: text("title_ar").notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionTr: text("description_tr").notNull(),
  descriptionAr: text("description_ar").notNull(),
  imageUrl: text("image_url"),
  type: text("type").notNull().default("percentage"),
  discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }).default("0").notNull(),
  buyProductId: uuid("buy_product_id").references(() => products.id, { onDelete: "set null" }),
  buySize: text("buy_size"),
  buyQuantity: numeric("buy_quantity", { precision: 10, scale: 0 }),
  giftKind: text("gift_kind").default("product"),
  giftProductId: uuid("gift_product_id").references(() => products.id, { onDelete: "set null" }),
  giftSize: text("gift_size"),
  giftQuantity: numeric("gift_quantity", { precision: 10, scale: 0 }),
  giftCustomName: text("gift_custom_name"),
  giftCustomImage: text("gift_custom_image"),
  limitedCount: numeric("limited_count", { precision: 10, scale: 0 }),
  active: boolean("active").default(true).notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderCode: text("order_code").notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryCity: text("delivery_city").notNull(),
  deliveryDistrict: text("delivery_district"),
  building: text("building"),
  floor: text("floor"),
  door: text("door"),
  locationLat: numeric("location_lat", { precision: 10, scale: 7 }),
  locationLng: numeric("location_lng", { precision: 10, scale: 7 }),
  notes: text("notes"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  orderSource: text("order_source").notNull().default("in_app"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  orderCodeUnique: uniqueIndex("orders_order_code_unique").on(table.orderCode),
}));

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  productName: text("product_name").notNull(),
  size: text("size").notNull(),
  flavorChoice: text("flavor_choice").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 0 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
});

export const savedAddresses = pgTable("saved_addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  label: text("label").notNull().default("Home"),
  city: text("city").notNull(),
  district: text("district"),
  address: text("address").notNull(),
  building: text("building"),
  floor: text("floor"),
  door: text("door"),
  locationLat: numeric("location_lat", { precision: 10, scale: 7 }),
  locationLng: numeric("location_lng", { precision: 10, scale: 7 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<unknown>(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  customerName: text("customer_name").notNull(),
  rating: numeric("rating", { precision: 2, scale: 1 }).notNull(),
  comment: text("comment").notNull(),
  approved: boolean("approved").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({ products: many(products) }));
export const productsRelations = relations(products, ({ one, many }) => ({ category: one(categories, { fields: [products.categoryId], references: [categories.id] }), images: many(productImages), orderItems: many(orderItems), reviews: many(reviews) }));
export const productImagesRelations = relations(productImages, ({ one }) => ({ product: one(products, { fields: [productImages.productId], references: [products.id] }) }));
export const usersRelations = relations(users, ({ many }) => ({ sessions: many(sessions), orders: many(orders), savedAddresses: many(savedAddresses), reviews: many(reviews) }));
export const sessionsRelations = relations(sessions, ({ one }) => ({ user: one(users, { fields: [sessions.userId], references: [users.id] }) }));
export const ordersRelations = relations(orders, ({ one, many }) => ({ user: one(users, { fields: [orders.userId], references: [users.id] }), items: many(orderItems) }));
export const orderItemsRelations = relations(orderItems, ({ one }) => ({ order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }), product: one(products, { fields: [orderItems.productId], references: [products.id] }) }));
export const savedAddressesRelations = relations(savedAddresses, ({ one }) => ({ user: one(users, { fields: [savedAddresses.userId], references: [users.id] }) }));
export const reviewsRelations = relations(reviews, ({ one }) => ({ product: one(products, { fields: [reviews.productId], references: [products.id] }), user: one(users, { fields: [reviews.userId], references: [users.id] }) }));

export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;

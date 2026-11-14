import { db } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { products, reviews } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const latest = searchParams.get("latest");

  try {
    // Public "latest reviews" feed used by the storefront reviews section.
    if (latest) {
      const limit = Math.min(24, Math.max(1, Number(latest) || 6));
      const rows = await db
        .select({
          id: reviews.id,
          productId: reviews.productId,
          customerName: reviews.customerName,
          rating: reviews.rating,
          comment: reviews.comment,
          imageUrl: reviews.imageUrl,
          imageApproved: reviews.imageApproved,
          createdAt: reviews.createdAt,
          productName: products.nameEn,
          productNameAr: products.nameAr,
          productNameTr: products.nameTr,
        })
        .from(reviews)
        .innerJoin(products, eq(reviews.productId, products.id))
        .where(eq(reviews.approved, true))
        .orderBy(desc(reviews.createdAt))
        .limit(limit);
      return NextResponse.json(rows);
    }

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const productReviews = await db.query.reviews.findMany({
      where: eq(reviews.productId, productId),
      orderBy: [desc(reviews.createdAt)],
    });

    return NextResponse.json(productReviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const { productId, rating, comment, imageUrl } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // A page opened while the catalog was unavailable can hold a placeholder id (e.g. "classic"),
    // which Postgres rejects as a UUID. Match it to the real product by name instead of failing.
    let resolvedProductId = String(productId);
    if (!UUID_PATTERN.test(resolvedProductId)) {
      const slug = resolvedProductId.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const match = (await db.select().from(products)).find((product) => product.nameEn.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug);
      if (!match) {
        return NextResponse.json({ error: "This product is no longer available. Please refresh the shop page and try again." }, { status: 400 });
      }
      resolvedProductId = match.id;
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const photo = typeof imageUrl === "string" && imageUrl.startsWith("data:image") ? imageUrl : null;

    const newReview = await db.insert(reviews).values({
      productId: resolvedProductId,
      userId: user.id,
      customerName: user.name,
      rating: String(rating),
      comment,
      imageUrl: photo,
      imageApproved: false, // customer photos wait for admin approval
      approved: true, // text reviews are auto-approved
    }).returning();

    return NextResponse.json(newReview[0], { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

/**
 * Decrease stock after a successful order
 * Accepts: { items: [{ id, qty, color? }] }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!items || !Array.isArray(items))
      return NextResponse.json({ ok: false, error: "Invalid items data" });

    // Process all product stock updates
    const updates = items.map(async (item) => {
      const productRef = doc(db, "products", item.id);
      const snap = await getDoc(productRef);

      if (!snap.exists()) return;

      const data = snap.data();
      const { variants, stock } = data;

      if (item.color && variants && variants[item.color]) {
        // Decrease stock for that color variant
        const currentStock = variants[item.color].stock ?? 0;
        const newStock = Math.max(currentStock - item.qty, 0);

        await updateDoc(productRef, {
          [`variants.${item.color}.stock`]: newStock,
        });
      } else {
        // Decrease top-level stock (non-color product)
        const currentStock = stock ?? 0;
        const newStock = Math.max(currentStock - item.qty, 0);

        await updateDoc(productRef, { stock: newStock });
      }
    });

    await Promise.all(updates);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("❌ Stock update failed:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}

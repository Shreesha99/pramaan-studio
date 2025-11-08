import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, paymentId, amount, currency, items, shipping, status } =
      body;

    // 🔹 userId can come from your AuthContext (client sends it via request)
    // e.g. shipping.phone or user.uid if logged in
    const userId = body.userId || shipping.phone || "guest";

    // 🔹 Create a Firestore reference: users/{userId}/orders/{orderId}
    const docRef = doc(db, "users", userId, "orders", orderId);

    // 🔹 Store order details
    await setDoc(docRef, {
      orderId,
      paymentId,
      amount,
      currency,
      items,
      shipping,
      status,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Order save failed:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}

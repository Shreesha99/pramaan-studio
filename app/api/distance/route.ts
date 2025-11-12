import { NextResponse } from "next/server";

// 🔹 POST /api/distance
export async function POST(req: Request) {
  try {
    const { pincode } = await req.json();

    if (!pincode) {
      return NextResponse.json(
        { ok: false, error: "Missing pincode" },
        { status: 400 }
      );
    }

    const base = "560062"; // Your base pincode (Bangalore)
    const apiKey = process.env.GOOGLE_MAPS_API;

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing Google API key" },
        { status: 500 }
      );
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${base}&destinations=${pincode}&units=metric&key=${apiKey}`;

    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    if (!data.rows || data.rows[0].elements[0].status !== "OK") {
      return NextResponse.json(
        { ok: false, error: "Invalid destination pincode" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("Distance API error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}

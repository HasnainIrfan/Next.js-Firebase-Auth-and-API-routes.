import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

// Add explicit export for route handler configuration
export const runtime = "edge"; // Optional: Add this if you want to use edge runtime
export const dynamic = "force-dynamic"; // This ensures the route is not statically optimized

export async function GET(request: Request): Promise<Response> {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await getAuth().verifyIdToken(token);

    return NextResponse.json({
      userId: decodedToken.uid,
      token: token,
    });
  } catch (error) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
}

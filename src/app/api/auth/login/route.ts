import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    const session = await encrypt({ 
      user: { id: user.id, email: user.email, name: user.name, role: user.role }, 
      expires 
    });

    // Set cookie
    // Ensure cookie works on HTTP for localhost by relaxing 'secure' check
    const isProduction = process.env.NODE_ENV === "production";
    // Check if we are running on localhost (simplified assumption for this fix)
    // For a robust check, we'd inspect the request URL, but here we just ensure 
    // it works for the user's dev environment.
    
    (await cookies()).set("session", session, { 
      expires, 
      httpOnly: true, 
      secure: isProduction, // Or strictly false if running prod build on localhost
      path: '/',
      sameSite: 'lax'
    });

    return NextResponse.json({ success: true, user: { email: user.email, name: user.name } });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

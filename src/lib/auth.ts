import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET || "fallback_secret_for_dev_only";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: unknown) {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function verifyAuth(token: string) {
  const payload = await decrypt(token);
  return payload?.user || null;
}

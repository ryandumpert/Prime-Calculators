import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE = "prime_admin_session";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Simple HMAC-based session token
function getAdminPassword(): string {
    return process.env.ADMIN_PASSWORD || "PrimeAdmin2026!";
}

function getSessionSecret(): string {
    return process.env.SESSION_SECRET || "prime-calc-session-secret-key-dev";
}

/**
 * Create a simple session token by base64-encoding user + expiry + signature.
 * In production, use a proper JWT library.
 */
function createToken(user: string): string {
    const expiry = Date.now() + SESSION_DURATION_MS;
    const payload = `${user}:${expiry}`;
    // Simple approach: base64 the payload with a secret suffix
    const signed = Buffer.from(`${payload}:${getSessionSecret()}`).toString(
        "base64"
    );
    return signed;
}

function verifyToken(token: string): { valid: boolean; user: string } {
    try {
        const decoded = Buffer.from(token, "base64").toString("utf-8");
        const parts = decoded.split(":");
        if (parts.length < 3) return { valid: false, user: "" };

        const user = parts[0];
        const expiry = parseInt(parts[1], 10);
        const secret = parts.slice(2).join(":");

        if (secret !== getSessionSecret()) return { valid: false, user: "" };
        if (Date.now() > expiry) return { valid: false, user: "" };

        return { valid: true, user };
    } catch {
        return { valid: false, user: "" };
    }
}

export function validatePassword(password: string): boolean {
    return password === getAdminPassword();
}

export function createSessionCookie(user: string): {
    name: string;
    value: string;
    options: {
        httpOnly: boolean;
        secure: boolean;
        sameSite: "lax";
        path: string;
        maxAge: number;
    };
} {
    const token = createToken(user);
    return {
        name: ADMIN_COOKIE,
        value: token,
        options: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            path: "/",
            maxAge: SESSION_DURATION_MS / 1000,
        },
    };
}

export async function getAuthenticatedUser(): Promise<string | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE);

    if (!sessionCookie) return null;

    const { valid, user } = verifyToken(sessionCookie.value);
    return valid ? user : null;
}

export function requireAuth(request: NextRequest): {
    authenticated: boolean;
    user: string;
} {
    const cookieValue = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!cookieValue) return { authenticated: false, user: "" };

    const { valid, user } = verifyToken(cookieValue);
    return { authenticated: valid, user };
}

export function unauthorizedResponse(): NextResponse {
    return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
    );
}

import { NextRequest, NextResponse } from "next/server";
import { validatePassword, createSessionCookie } from "@/lib/admin/auth";

// Rate limiting: simple in-memory store
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = loginAttempts.get(ip);

    if (!entry) return false;

    // Reset if more than 15 minutes since last attempt
    if (now - entry.lastAttempt > 15 * 60 * 1000) {
        loginAttempts.delete(ip);
        return false;
    }

    return entry.count >= 5; // Max 5 attempts per 15 min
}

function recordAttempt(ip: string): void {
    const now = Date.now();
    const entry = loginAttempts.get(ip);

    if (!entry || now - entry.lastAttempt > 15 * 60 * 1000) {
        loginAttempts.set(ip, { count: 1, lastAttempt: now });
    } else {
        entry.count++;
        entry.lastAttempt = now;
    }
}

export async function POST(request: NextRequest) {
    const ip =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown";

    // Rate limit check
    if (isRateLimited(ip)) {
        return NextResponse.json(
            { error: "Too many login attempts. Please try again later." },
            { status: 429 }
        );
    }

    try {
        const body = await request.json();
        const { password } = body;

        if (!password || typeof password !== "string") {
            return NextResponse.json(
                { error: "Password is required." },
                { status: 400 }
            );
        }

        recordAttempt(ip);

        if (!validatePassword(password)) {
            return NextResponse.json(
                { error: "Invalid password." },
                { status: 401 }
            );
        }

        // Clear attempts on success
        loginAttempts.delete(ip);

        // Create session
        const cookie = createSessionCookie("admin");
        const response = NextResponse.json({ success: true, user: "admin" });

        response.cookies.set(cookie.name, cookie.value, cookie.options);

        return response;
    } catch {
        return NextResponse.json(
            { error: "Invalid request body." },
            { status: 400 }
        );
    }
}

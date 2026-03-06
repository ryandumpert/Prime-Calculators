import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorizedResponse } from "@/lib/admin/auth";
import {
    getDefaults,
    saveDefaults,
    resetDefaults,
} from "@/lib/admin/defaults-store";
import { type AllDefaults } from "@/lib/admin/defaults-schema";

export async function GET(request: NextRequest) {
    const { authenticated } = requireAuth(request);
    if (!authenticated) return unauthorizedResponse();

    try {
        const record = await getDefaults();
        return NextResponse.json(record);
    } catch (error) {
        console.error("Failed to get defaults:", error);
        return NextResponse.json(
            { error: "Failed to load defaults." },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    const { authenticated, user } = requireAuth(request);
    if (!authenticated) return unauthorizedResponse();

    try {
        const body = await request.json();
        const { defaults, calculator, changes } = body as {
            defaults: AllDefaults;
            calculator: string;
            changes: Record<string, { old: unknown; new: unknown }>;
        };

        if (!defaults) {
            return NextResponse.json(
                { error: "Defaults payload is required." },
                { status: 400 }
            );
        }

        const record = await saveDefaults(
            defaults,
            user,
            calculator || "unknown",
            changes || {}
        );

        return NextResponse.json(record);
    } catch (error) {
        console.error("Failed to save defaults:", error);
        return NextResponse.json(
            { error: "Failed to save defaults." },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    const { authenticated, user } = requireAuth(request);
    if (!authenticated) return unauthorizedResponse();

    try {
        const record = await resetDefaults(user);
        return NextResponse.json(record);
    } catch (error) {
        console.error("Failed to reset defaults:", error);
        return NextResponse.json(
            { error: "Failed to reset defaults." },
            { status: 500 }
        );
    }
}

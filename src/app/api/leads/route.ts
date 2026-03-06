import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

export interface LeadRecord {
    id: string;
    name: string;
    email: string;
    phone: string;
    creditBand: string;
    emailTermSheet: boolean;
    calculatorType: string;
    inputs: Record<string, unknown>;
    outputs: Record<string, unknown>;
    dealHealthScore?: number;
    dealHealthLabel?: string;
    timestamp: string;
    source: string;
}

async function ensureDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch {
        // dir exists
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { name, email, phone, creditBand, emailTermSheet, calculatorType, inputs, outputs, dealHealthScore, dealHealthLabel, timestamp } = body;

        // Validate required fields
        if (!name || !email || !calculatorType) {
            return NextResponse.json(
                { error: "Name, email, and calculator type are required." },
                { status: 400 }
            );
        }

        // Simple email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: "Invalid email address." },
                { status: 400 }
            );
        }

        const lead: LeadRecord = {
            id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name,
            email,
            phone: phone || "",
            creditBand: creditBand || "",
            emailTermSheet: !!emailTermSheet,
            calculatorType,
            inputs: inputs || {},
            outputs: outputs || {},
            dealHealthScore,
            dealHealthLabel,
            timestamp: timestamp || new Date().toISOString(),
            source: request.headers.get("referer") || "direct",
        };

        // Store lead
        await ensureDataDir();
        let leads: LeadRecord[] = [];
        try {
            const existing = await fs.readFile(LEADS_FILE, "utf-8");
            leads = JSON.parse(existing);
        } catch {
            // No existing leads file
        }

        leads.push(lead);
        await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");

        console.log(`[LEAD] New ${calculatorType} lead from ${name} (${email})`);

        // If emailTermSheet is true, generate term sheet content
        let termSheet = null;
        if (emailTermSheet) {
            termSheet = generateTermSheet(lead);
            console.log("[TERM SHEET] Generated for", email);
            // In production, this would send via Resend/SendGrid/etc.
            // For now, we log it and return it in the response.
        }

        return NextResponse.json({
            success: true,
            leadId: lead.id,
            termSheet: termSheet ? true : false,
            message: emailTermSheet
                ? "Lead captured and term sheet will be emailed shortly."
                : "Lead captured successfully.",
        });
    } catch (error) {
        console.error("Failed to process lead:", error);
        return NextResponse.json(
            { error: "Failed to process lead submission." },
            { status: 500 }
        );
    }
}

export async function GET() {
    // Simple GET to retrieve leads count (for admin reference)
    try {
        await ensureDataDir();
        const data = await fs.readFile(LEADS_FILE, "utf-8");
        const leads = JSON.parse(data) as LeadRecord[];
        return NextResponse.json({
            count: leads.length,
            recent: leads.slice(-5).map((l) => ({
                id: l.id,
                name: l.name,
                calculatorType: l.calculatorType,
                timestamp: l.timestamp,
            })),
        });
    } catch {
        return NextResponse.json({ count: 0, recent: [] });
    }
}

// Term sheet generator
function generateTermSheet(lead: LeadRecord): string {
    const lines = [
        `═══════════════════════════════════════════`,
        `  PRIME LOAN ADVISORS — TERM SHEET ESTIMATE`,
        `═══════════════════════════════════════════`,
        ``,
        `Prepared for: ${lead.name}`,
        `Calculator: ${lead.calculatorType}`,
        `Credit Score Band: ${lead.creditBand}`,
        `Date: ${new Date(lead.timestamp).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
        ``,
        `──── KEY INPUTS ────`,
    ];

    // Add key inputs
    for (const [key, value] of Object.entries(lead.inputs)) {
        if (typeof value === "number" || typeof value === "string") {
            const label = key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (s) => s.toUpperCase());
            lines.push(`  ${label}: ${value}`);
        }
    }

    lines.push(``, `──── KEY OUTPUTS ────`);

    // Add key outputs
    for (const [key, value] of Object.entries(lead.outputs)) {
        if (typeof value === "number") {
            const label = key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (s) => s.toUpperCase());
            lines.push(`  ${label}: ${formatValue(key, value)}`);
        }
    }

    if (lead.dealHealthScore !== undefined) {
        lines.push(
            ``,
            `──── DEAL HEALTH ────`,
            `  Score: ${lead.dealHealthScore}/100`,
            `  Status: ${lead.dealHealthLabel || "N/A"}`
        );
    }

    lines.push(
        ``,
        `═══════════════════════════════════════════`,
        `DISCLAIMER: This is an estimate only and does`,
        `not constitute a commitment to lend. Rates shown`,
        `are illustrative. Actual terms may vary. Contact`,
        `Prime Loan Advisors for a personalized quote.`,
        `═══════════════════════════════════════════`
    );

    return lines.join("\n");
}

function formatValue(key: string, value: number): string {
    const lk = key.toLowerCase();
    if (lk.includes("rate") || lk.includes("percent") || lk.includes("roi") || lk.includes("ltv") || lk.includes("dscr") === false && lk.includes("vacancy")) {
        return `${value.toFixed(2)}%`;
    }
    if (lk.includes("dscr")) {
        return `${value.toFixed(2)}x`;
    }
    if (lk.includes("months") || lk.includes("term") || lk.includes("period")) {
        return `${value}`;
    }
    // Default: currency
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

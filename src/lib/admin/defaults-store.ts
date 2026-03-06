import fs from "fs/promises";
import path from "path";
import { type AllDefaults, SYSTEM_DEFAULTS } from "./defaults-schema";

const DATA_DIR = path.join(process.cwd(), "data");
const DEFAULTS_FILE = path.join(DATA_DIR, "defaults.json");
const AUDIT_FILE = path.join(DATA_DIR, "audit-log.json");

export interface DefaultsRecord {
    defaults: AllDefaults;
    updatedAt: string;
    updatedBy: string;
    version: number;
}

export interface AuditEntry {
    timestamp: string;
    user: string;
    action: string;
    calculator: string;
    changes: Record<string, { old: unknown; new: unknown }>;
}

async function ensureDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch {
        // dir exists
    }
}

export async function getDefaults(): Promise<DefaultsRecord> {
    try {
        await ensureDataDir();
        const data = await fs.readFile(DEFAULTS_FILE, "utf-8");
        return JSON.parse(data) as DefaultsRecord;
    } catch {
        // File doesn't exist or is corrupted — return system defaults
        return {
            defaults: structuredClone(SYSTEM_DEFAULTS),
            updatedAt: new Date().toISOString(),
            updatedBy: "system",
            version: 0,
        };
    }
}

export async function saveDefaults(
    defaults: AllDefaults,
    updatedBy: string,
    changedCalculator: string,
    changes: Record<string, { old: unknown; new: unknown }>
): Promise<DefaultsRecord> {
    await ensureDataDir();

    const current = await getDefaults();
    const record: DefaultsRecord = {
        defaults,
        updatedAt: new Date().toISOString(),
        updatedBy,
        version: current.version + 1,
    };

    // Save defaults
    await fs.writeFile(DEFAULTS_FILE, JSON.stringify(record, null, 2), "utf-8");

    // Append audit log
    const auditEntry: AuditEntry = {
        timestamp: record.updatedAt,
        user: updatedBy,
        action: "update_defaults",
        calculator: changedCalculator,
        changes,
    };

    let auditLog: AuditEntry[] = [];
    try {
        const existing = await fs.readFile(AUDIT_FILE, "utf-8");
        auditLog = JSON.parse(existing);
    } catch {
        // No existing audit log
    }

    auditLog.push(auditEntry);

    // Keep last 500 entries
    if (auditLog.length > 500) {
        auditLog = auditLog.slice(-500);
    }

    await fs.writeFile(AUDIT_FILE, JSON.stringify(auditLog, null, 2), "utf-8");

    return record;
}

export async function resetDefaults(updatedBy: string): Promise<DefaultsRecord> {
    await ensureDataDir();

    const record: DefaultsRecord = {
        defaults: structuredClone(SYSTEM_DEFAULTS),
        updatedAt: new Date().toISOString(),
        updatedBy,
        version: 0,
    };

    await fs.writeFile(DEFAULTS_FILE, JSON.stringify(record, null, 2), "utf-8");

    // Log the reset
    const auditEntry: AuditEntry = {
        timestamp: record.updatedAt,
        user: updatedBy,
        action: "reset_defaults",
        calculator: "all",
        changes: {},
    };

    let auditLog: AuditEntry[] = [];
    try {
        const existing = await fs.readFile(AUDIT_FILE, "utf-8");
        auditLog = JSON.parse(existing);
    } catch {
        // No existing audit log
    }

    auditLog.push(auditEntry);
    await fs.writeFile(AUDIT_FILE, JSON.stringify(auditLog, null, 2), "utf-8");

    return record;
}

export async function getAuditLog(): Promise<AuditEntry[]> {
    try {
        await ensureDataDir();
        const data = await fs.readFile(AUDIT_FILE, "utf-8");
        return JSON.parse(data) as AuditEntry[];
    } catch {
        return [];
    }
}

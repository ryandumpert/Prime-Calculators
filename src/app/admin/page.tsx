"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Shield,
    Lock,
    Save,
    RotateCcw,
    Check,
    AlertTriangle,
    LogOut,
    Settings,
    Calculator,
    Globe,
    Clock,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    type AllDefaults,
    SYSTEM_DEFAULTS,
    FIELD_LABELS,
    CALCULATOR_NAMES,
} from "@/lib/admin/defaults-schema";

type SectionKey = keyof AllDefaults;

export default function AdminPage() {
    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [authError, setAuthError] = useState("");
    const [authLoading, setAuthLoading] = useState(false);

    const [defaults, setDefaults] = useState<AllDefaults>(
        structuredClone(SYSTEM_DEFAULTS)
    );
    const [originalDefaults, setOriginalDefaults] = useState<AllDefaults>(
        structuredClone(SYSTEM_DEFAULTS)
    );
    const [activeSection, setActiveSection] = useState<SectionKey>("global");
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<
        "idle" | "saved" | "error"
    >("idle");
    const [loading, setLoading] = useState(false);

    // Check if we have pending changes
    const hasChanges =
        JSON.stringify(defaults) !== JSON.stringify(originalDefaults);

    // Login handler
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError("");
        setAuthLoading(true);

        try {
            const resp = await fetch("/api/admin/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (resp.ok) {
                setAuthenticated(true);
                setPassword("");
                loadDefaults();
            } else {
                const data = await resp.json();
                setAuthError(data.error || "Invalid password.");
            }
        } catch {
            setAuthError("Connection error. Please try again.");
        } finally {
            setAuthLoading(false);
        }
    };

    // Load defaults from API
    const loadDefaults = useCallback(async () => {
        setLoading(true);
        try {
            const resp = await fetch("/api/admin/defaults");
            if (resp.ok) {
                const data = await resp.json();
                setDefaults(data.defaults);
                setOriginalDefaults(structuredClone(data.defaults));
                setLastUpdated(data.updatedAt);
            }
        } catch (err) {
            console.error("Failed to load defaults:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Save defaults
    const handleSave = async () => {
        setSaving(true);
        setSaveStatus("idle");

        // Calculate changes for audit
        const changes: Record<string, { old: unknown; new: unknown }> = {};
        const section = defaults[activeSection];
        const origSection = originalDefaults[activeSection];
        if (typeof section === "object" && typeof origSection === "object") {
            for (const [key, val] of Object.entries(
                section as unknown as Record<string, unknown>
            )) {
                const origVal = (origSection as unknown as Record<string, unknown>)[key];
                if (JSON.stringify(val) !== JSON.stringify(origVal)) {
                    changes[key] = { old: origVal, new: val };
                }
            }
        }

        try {
            const resp = await fetch("/api/admin/defaults", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    defaults,
                    calculator: activeSection,
                    changes,
                }),
            });

            if (resp.ok) {
                const data = await resp.json();
                setOriginalDefaults(structuredClone(data.defaults));
                setLastUpdated(data.updatedAt);
                setSaveStatus("saved");
                setTimeout(() => setSaveStatus("idle"), 3000);
            } else {
                setSaveStatus("error");
            }
        } catch {
            setSaveStatus("error");
        } finally {
            setSaving(false);
        }
    };

    // Reset to system defaults
    const handleReset = async () => {
        if (
            !confirm(
                "Reset ALL calculator defaults to system defaults? This cannot be undone."
            )
        )
            return;

        try {
            const resp = await fetch("/api/admin/defaults", {
                method: "DELETE",
            });

            if (resp.ok) {
                const data = await resp.json();
                setDefaults(data.defaults);
                setOriginalDefaults(structuredClone(data.defaults));
                setLastUpdated(data.updatedAt);
                setSaveStatus("saved");
                setTimeout(() => setSaveStatus("idle"), 3000);
            }
        } catch {
            setSaveStatus("error");
        }
    };

    // Logout
    const handleLogout = () => {
        setAuthenticated(false);
        setPassword("");
        document.cookie =
            "prime_admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    };

    // Try to auto-authenticate on mount (check existing session)
    useEffect(() => {
        const checkSession = async () => {
            try {
                const resp = await fetch("/api/admin/defaults");
                if (resp.ok) {
                    setAuthenticated(true);
                    const data = await resp.json();
                    setDefaults(data.defaults);
                    setOriginalDefaults(structuredClone(data.defaults));
                    setLastUpdated(data.updatedAt);
                }
            } catch {
                // Not authenticated
            }
        };
        checkSession();
    }, []);

    // ---------- LOGIN SCREEN ----------
    if (!authenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="mx-auto mb-4">
                            <Image
                                src="/logo-white.png"
                                alt="Prime Loan Advisors"
                                width={160}
                                height={46}
                                className="h-12 w-auto mx-auto"
                                priority
                            />
                        </div>
                        <h1 className="text-2xl font-bold">Admin Access</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Calculator Defaults Editor
                        </p>
                    </div>

                    <form
                        onSubmit={handleLogin}
                        className="rounded-xl border bg-card p-6 shadow-sm space-y-4"
                    >
                        <div className="space-y-1.5">
                            <Label htmlFor="admin-password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="admin-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter admin password"
                                    className="pl-10"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        {authError && (
                            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg p-3">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                {authError}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={authLoading || !password}
                        >
                            {authLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    // ---------- ADMIN DASHBOARD ----------
    const sections: SectionKey[] = [
        "global",
        "dscr",
        "fix-and-flip",
        "rate-term-refi",
        "cash-out-refi",
        "bridge",
        "brrr",
    ];

    const sectionIcons: Record<SectionKey, React.ElementType> = {
        global: Globe,
        dscr: Calculator,
        "fix-and-flip": Calculator,
        "rate-term-refi": Calculator,
        "cash-out-refi": Calculator,
        bridge: Calculator,
        brrr: Calculator,
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Top bar */}
            <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/logo-white.png"
                            alt="Prime Loan Advisors"
                            width={100}
                            height={28}
                            className="h-7 w-auto"
                        />
                        <span className="text-xs text-muted-foreground font-medium">Admin</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {lastUpdated && (
                            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="w-3.5 h-3.5" />
                                Last updated:{" "}
                                {new Date(lastUpdated).toLocaleString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                })}
                            </div>
                        )}

                        {saveStatus === "saved" && (
                            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                <Check className="w-3.5 h-3.5" />
                                Saved
                            </div>
                        )}

                        {saveStatus === "error" && (
                            <div className="flex items-center gap-1 text-xs text-red-500 font-medium">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Error saving
                            </div>
                        )}

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleReset}
                            className="gap-1.5"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Reset All</span>
                        </Button>

                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={saving || !hasChanges}
                            className="gap-1.5"
                        >
                            {saving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Save className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden sm:inline">
                                {saving ? "Saving..." : "Publish Changes"}
                            </span>
                        </Button>

                        <Button size="sm" variant="ghost" onClick={handleLogout}>
                            <LogOut className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-12 gap-6">
                    {/* Sidebar */}
                    <div className="col-span-12 md:col-span-3">
                        <nav className="space-y-1">
                            {sections.map((section) => {
                                const Icon = sectionIcons[section];
                                return (
                                    <button
                                        key={section}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                                            activeSection === section
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                        onClick={() => setActiveSection(section)}
                                    >
                                        <Icon className="w-4 h-4 shrink-0" />
                                        {CALCULATOR_NAMES[section] || section}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Main panel */}
                    <div className="col-span-12 md:col-span-9">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="rounded-xl border bg-card p-6 shadow-sm">
                                <h2 className="text-xl font-bold mb-1">
                                    {CALCULATOR_NAMES[activeSection]}
                                </h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    {activeSection === "global"
                                        ? "Credit score band adjustments applied across all calculators."
                                        : "Default values used when users first open this calculator."}
                                </p>

                                <DefaultsForm
                                    section={activeSection}
                                    values={defaults[activeSection]}
                                    onChange={(newValues) => {
                                        setDefaults((prev) => ({
                                            ...prev,
                                            [activeSection]: newValues,
                                        }));
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Dynamic form for editing defaults
function DefaultsForm({
    section,
    values,
    onChange,
}: {
    section: SectionKey;
    values: AllDefaults[SectionKey];
    onChange: (values: AllDefaults[SectionKey]) => void;
}) {
    const labels = FIELD_LABELS[section] || {};

    if (section === "global") {
        // Global credit band adjustments — special nested structure
        const globalValues = values as AllDefaults["global"];
        const adjustments = globalValues.creditBandAdjustments;

        return (
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Credit Score Band Rate Adjustments
                </h3>
                <p className="text-xs text-muted-foreground">
                    These values are added to each calculator&apos;s base rate. Negative values
                    reduce the rate (discount for excellent credit).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(adjustments).map(([band, value]) => {
                        const fieldKey = `creditBandAdjustments.${band}`;
                        const label = labels[fieldKey] || band;
                        return (
                            <div key={band} className="space-y-1.5">
                                <Label className="text-sm">{label}</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        step="0.05"
                                        value={value}
                                        onChange={(e) => {
                                            const newAdj = {
                                                ...adjustments,
                                                [band]: parseFloat(e.target.value) || 0,
                                            };
                                            onChange({
                                                ...globalValues,
                                                creditBandAdjustments: newAdj,
                                            } as AllDefaults[SectionKey]);
                                        }}
                                        className="pr-6 tabular-nums"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                        %
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Regular flat defaults for per-calculator sections
    const flatValues = values as unknown as Record<string, number>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(flatValues).map(([key, value]) => {
                const label = labels[key] || key;
                const isDollar = label.includes("($)");
                const isPercent = label.includes("(%)");
                const unit = isDollar ? "$" : isPercent ? "%" : "";

                return (
                    <div key={key} className="space-y-1.5">
                        <Label className="text-sm">{label}</Label>
                        <div className="relative">
                            {isDollar && (
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    $
                                </span>
                            )}
                            <Input
                                type="number"
                                step={isPercent ? "0.25" : isDollar ? "100" : "1"}
                                value={value}
                                onChange={(e) => {
                                    onChange({
                                        ...flatValues,
                                        [key]: parseFloat(e.target.value) || 0,
                                    } as unknown as AllDefaults[SectionKey]);
                                }}
                                className={cn(
                                    "tabular-nums",
                                    isDollar && "pl-7",
                                    isPercent && "pr-8"
                                )}
                            />
                            {isPercent && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    %
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

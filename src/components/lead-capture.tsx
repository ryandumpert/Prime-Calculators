"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CREDIT_BANDS, type CreditBandValue } from "@/lib/constants";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadCaptureProps {
    calculatorType: string;
    creditBand: CreditBandValue;
    onCreditBandChange: (band: CreditBandValue) => void;
    inputsSnapshot?: Record<string, unknown>;
    outputsSnapshot?: Record<string, unknown>;
    dealHealthScore?: number;
    dealHealthLabel?: string;
}

export function LeadCapture({
    calculatorType,
    creditBand,
    onCreditBandChange,
    inputsSnapshot,
    outputsSnapshot,
    dealHealthScore,
    dealHealthLabel,
}: LeadCaptureProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [emailTermSheet, setEmailTermSheet] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email) return;

        setSubmitting(true);

        const payload = {
            name,
            email,
            phone,
            creditBand,
            emailTermSheet,
            calculatorType,
            inputs: inputsSnapshot,
            outputs: outputsSnapshot,
            dealHealthScore,
            dealHealthLabel,
            timestamp: new Date().toISOString(),
        };

        try {
            const resp = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!resp.ok) {
                const err = await resp.json();
                console.error("Lead submission failed:", err);
            }
        } catch (err) {
            console.error("Lead submission error:", err);
        }

        setSubmitted(true);
        setSubmitting(false);
    };

    if (submitted) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">You&apos;re All Set!</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                    {emailTermSheet
                        ? "We'll send your personalized term sheet to your email shortly."
                        : "A Prime Loan Advisors specialist will be in touch soon."}
                </p>
                <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => {
                        setSubmitted(false);
                        setName("");
                        setEmail("");
                        setPhone("");
                    }}
                >
                    Submit Another
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Get Your Term Sheet</h3>
                    <p className="text-sm text-muted-foreground">
                        Free, no-obligation estimate based on your scenario
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="lead-name">
                        Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="lead-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Smith"
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="lead-email">
                        Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="lead-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="lead-phone">Phone (optional)</Label>
                    <Input
                        id="lead-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="lead-credit">
                        Credit Score <span className="text-red-500">*</span>
                    </Label>
                    <Select value={creditBand} onValueChange={(v) => onCreditBandChange(v as CreditBandValue)}>
                        <SelectTrigger id="lead-credit">
                            <SelectValue placeholder="Select range..." />
                        </SelectTrigger>
                        <SelectContent>
                            {CREDIT_BANDS.map((band) => (
                                <SelectItem key={band.value} value={band.value}>
                                    {band.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Email term sheet toggle */}
            <label
                htmlFor="email-term-sheet"
                className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    emailTermSheet
                        ? "bg-primary/5 border-primary/30"
                        : "bg-muted/50 border-border"
                )}
            >
                <input
                    type="checkbox"
                    id="email-term-sheet"
                    checked={emailTermSheet}
                    onChange={(e) => setEmailTermSheet(e.target.checked)}
                    className="w-4 h-4 rounded text-primary accent-primary"
                />
                <div>
                    <p className="text-sm font-medium">Email me a term sheet</p>
                    <p className="text-xs text-muted-foreground">
                        Get a personalized estimate delivered to your inbox
                    </p>
                </div>
            </label>

            <Button
                type="submit"
                size="lg"
                className="w-full gap-2 text-base"
                disabled={submitting || !name || !email}
            >
                {submitting ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                    </>
                ) : (
                    <>
                        <Send className="w-4 h-4" />
                        Get My Term Sheet
                    </>
                )}
            </Button>
        </form>
    );
}

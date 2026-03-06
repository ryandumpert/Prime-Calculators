"use client";

import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface CalculatorLayoutProps {
    title: string;
    description: string;
    inputs: ReactNode;
    outputs: ReactNode;
    dealHealth: ReactNode;
    leadCapture: ReactNode;
    assumptions?: string[];
}

export function CalculatorLayout({
    title,
    description,
    inputs,
    outputs,
    dealHealth,
    leadCapture,
    assumptions,
}: CalculatorLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                All Calculators
                            </Button>
                        </Link>
                    </div>
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm font-semibold"
                    >
                        <Image
                            src="/logo-white.png"
                            alt="Prime Loan Advisors"
                            width={120}
                            height={34}
                            className="h-8 w-auto"
                        />
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    <p className="text-muted-foreground mt-1">{description}</p>
                </div>

                {/* Calculator Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Inputs */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-6">Inputs</h2>
                            {inputs}
                        </div>

                        {/* Assumptions */}
                        {assumptions && assumptions.length > 0 && (
                            <Accordion type="single" collapsible>
                                <AccordionItem value="assumptions" className="border rounded-xl px-6">
                                    <AccordionTrigger className="text-sm text-muted-foreground hover:no-underline">
                                        Assumptions & Defaults
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <ul className="space-y-1.5 text-sm text-muted-foreground">
                                            {assumptions.map((a, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                                                    {a}
                                                </li>
                                            ))}
                                            <li className="flex items-start gap-2 pt-2 text-xs italic">
                                                <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                                                All results are estimates and do not constitute a
                                                commitment to lend.
                                            </li>
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        )}
                    </div>

                    {/* Right: Results + Deal Health */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Deal Health */}
                        {dealHealth}

                        {/* KPI Results */}
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-6">Results</h2>
                            {outputs}
                        </div>

                        {/* Lead Capture */}
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            {leadCapture}
                        </div>

                        {/* Disclaimer */}
                        <div className="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground space-y-1">
                            <p>⚠️ Estimates only. Not a commitment to lend.</p>
                            <p>Rates shown are illustrative. Actual terms may vary.</p>
                            <p>
                                Contact Prime Loan Advisors for a personalized quote and
                                pre-approval.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

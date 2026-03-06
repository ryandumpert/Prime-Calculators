import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Disclaimer | Prime Loan Advisors Calculator Suite",
    description: "Important disclaimers regarding our Non-QM calculator estimates.",
};

export default function DisclaimerPage() {
    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Button>
                    </Link>
                    <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
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

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold mb-8">Disclaimer</h1>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground">Estimates Only</h2>
                        <p>
                            All calculations, rates, payments, and projections shown on this
                            website are <strong>estimates only</strong> and do not constitute a
                            commitment to lend, an offer of credit, or a guarantee of any specific
                            terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">Illustrative Rates</h2>
                        <p>
                            Interest rates shown are illustrative and based on generalized
                            assumptions. Actual rates depend on many factors including credit
                            history, property type, loan amount, occupancy, and current market
                            conditions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">Not Financial Advice</h2>
                        <p>
                            The information provided by these calculators is for educational and
                            informational purposes only. It should not be construed as financial,
                            legal, or tax advice. Consult with qualified professionals before
                            making any financial decisions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">Terms May Vary</h2>
                        <p>
                            Actual loan terms, including rates, fees, closing costs, and
                            qualification requirements, may vary significantly from the estimates
                            shown. All loans are subject to credit approval and underwriting
                            guidelines.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">Deal Health Indicator</h2>
                        <p>
                            The &ldquo;Deal Health&rdquo; scoring feature uses simplified heuristics for
                            educational purposes. It does not constitute an appraisal, valuation,
                            or professional assessment of any real estate transaction.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}

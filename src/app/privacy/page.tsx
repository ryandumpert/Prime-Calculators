import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Prime Loan Advisors Calculator Suite",
    description: "Privacy policy for the Prime Loan Advisors Non-QM calculator suite.",
};

export default function PrivacyPage() {
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
                <h1 className="text-3xl font-bold mb-8">Privacy Notice</h1>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground">Information We Collect</h2>
                        <p>
                            When you submit a lead form (&ldquo;Get My Term Sheet&rdquo;), we collect your
                            name, email address, phone number (if provided), and estimated credit
                            score band. We also capture the calculator inputs and outputs at the
                            time of submission.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">How We Use Your Information</h2>
                        <p>
                            Your information is used solely to:
                        </p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Provide you with a personalized term sheet estimate</li>
                            <li>Follow up regarding your financing inquiry</li>
                            <li>Improve our calculator tools and services</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">Data Security</h2>
                        <p>
                            We do not sell or share your personal information with third parties
                            for marketing purposes. Your data is transmitted securely and stored
                            in compliance with applicable data protection regulations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">Calculator Data</h2>
                        <p>
                            Calculator inputs and results entered without submitting a lead form
                            are not stored on our servers. All calculations are performed locally
                            in your browser.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">Contact</h2>
                        <p>
                            If you have questions about this privacy policy or wish to request
                            deletion of your data, please contact Prime Loan Advisors directly.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}

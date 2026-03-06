import Link from "next/link";
import Image from "next/image";
import { CALCULATORS } from "@/lib/constants";
import {
  Building2,
  Hammer,
  ArrowDownCircle,
  Banknote,
  GitBranch,
  Repeat,
  Calculator,
  ChevronRight,
  Sparkles,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, React.ElementType> = {
  "building-2": Building2,
  hammer: Hammer,
  "arrow-down-circle": ArrowDownCircle,
  banknote: Banknote,
  "git-branch": GitBranch,
  repeat: Repeat,
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo-white.png"
              alt="Prime Loan Advisors"
              width={140}
              height={40}
              className="h-9 w-auto"
              priority
            />
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            <Link
              href="/disclaimer"
              className="hover:text-foreground transition-colors"
            >
              Disclaimer
            </Link>
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 hero-gradient opacity-90" />
        <div className="absolute inset-0 grid-pattern opacity-30" />

        {/* Floating orbs */}
        <div className="absolute top-20 left-[15%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-[10%] w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 backdrop-blur-sm border border-white/10">
            <Sparkles className="w-4 h-4" />
            Instant Results · No Sign-up Required
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Non-QM Deal
            <br />
            <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
              Calculators
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Instant cashflow and profit insights for DSCR, Fix &amp; Flip,
            refinance scenarios, and more. See your deal health in real-time.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Shield className="w-4 h-4" />
              <span>Free &amp; No Credit Pull</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Calculator className="w-4 h-4" />
              <span>6 Specialized Calculators</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Real-Time Deal Health</span>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CALCULATORS.map((calc) => {
            const Icon = iconMap[calc.icon] || Calculator;
            return (
              <Link key={calc.slug} href={calc.route} className="group">
                <div className="calc-card h-full rounded-2xl border bg-card p-6 shadow-sm hover:shadow-xl">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${calc.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {calc.title}
                  </h2>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {calc.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {calc.bestFor.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs font-medium"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                    Open Calculator
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo-white.png"
                alt="Prime Loan Advisors"
                width={120}
                height={34}
                className="h-7 w-auto"
              />
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link
                href="/disclaimer"
                className="hover:text-foreground transition-colors"
              >
                Disclaimer
              </Link>
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Prime Loan Advisors. Estimates only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CALCULATORS } from "@/lib/constants";
import {
  Building2,
  Hammer,
  ArrowDownCircle,
  Banknote,
  Home,
  Repeat,
  Calculator,
  ArrowRight,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  "building-2": Building2,
  hammer: Hammer,
  "arrow-down-circle": ArrowDownCircle,
  banknote: Banknote,
  home: Home,
  repeat: Repeat,
};

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background flex flex-col font-sans transition-colors duration-300">
      {/* Absolute Header - Clean & Minimal */}
      <header className="absolute top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.png"
              alt="Prime Loan Advisors"
              width={160}
              height={45}
              className="h-9 sm:h-10 w-auto transition-transform duration-300 group-hover:scale-105 block dark:hidden"
              priority
            />
            <Image
              src="/logo-white.png"
              alt="Prime Loan Advisors"
              width={160}
              height={45}
              className="h-9 sm:h-10 w-auto transition-transform duration-300 group-hover:scale-105 hidden dark:block"
              priority
            />
          </Link>
          <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <Link
              href="/disclaimer"
              className="hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
            >
              Disclaimer
            </Link>
            <Link
              href="/privacy"
              className="hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center relative pt-24 pb-16 sm:pt-32 sm:pb-24">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 dark:bg-blue-900/10 blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-100/50 dark:bg-emerald-900/10 blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Deal Analysis for
              <br />
              <span className="text-blue-600 dark:text-blue-400">
                Real Estate Investors
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Instant cashflow and profit insights. Select a scenario below to run your numbers with our free, professional-grade calculators.
            </p>
          </div>

          {/* Calculator Grid ("App-Grid" Concept) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {CALCULATORS.map((calc, idx) => {
              const Icon = iconMap[calc.icon] || Calculator;
              // Extract colors from the gradient string just for a solid icon background aesthetic
              const bgClass = calc.color.split(" ")[0].replace("from-", "bg-");
              const textClass = calc.color.split(" ")[0].replace("from-", "text-");

              return (
                <button
                  key={calc.slug}
                  onClick={() => router.push(calc.route)}
                  className="group relative flex flex-col items-start bg-white dark:bg-slate-900 rounded-[24px] p-6 sm:p-8 
                             border border-slate-200/60 dark:border-slate-800 
                             shadow-sm hover:shadow-xl dark:shadow-none dark:hover:bg-slate-800/50
                             transition-all duration-300 hover:-translate-y-1 text-left overflow-hidden cursor-pointer"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Subtle Gradient Hover Overlay */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br ${calc.color}`} />

                  {/* Icon */}
                  <div
                    className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 
                               bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700
                               transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className={`w-7 h-7 ${textClass}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                    {calc.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-6 flex-1">
                    {calc.description}
                  </p>

                  {/* Actions / Footer of Card */}
                  <div className="mt-auto w-full flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 uppercase tracking-wider">
                        {calc.bestFor[0]}
                      </span>
                    </div>

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800
                                   text-slate-400 group-hover:text-white group-hover:bg-slate-900 dark:group-hover:bg-slate-100 dark:group-hover:text-slate-900 
                                   transition-all duration-300`}>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} Prime Loan Advisors. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span>
                Calculators Online
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

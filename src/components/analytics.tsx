"use client";

import Script from "next/script";

/**
 * Google Analytics 4 component.
 * Set NEXT_PUBLIC_GA_ID in .env to enable.
 * Example: NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
 */
export function Analytics() {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;

    if (!gaId) return null;

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
          });
        `}
            </Script>
        </>
    );
}

/**
 * Track a custom event in GA4.
 * Call this from calculator pages to track calculator usage, lead submissions, etc.
 */
export function trackEvent(
    eventName: string,
    params?: Record<string, string | number | boolean>
) {
    if (typeof window !== "undefined" && "gtag" in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).gtag("event", eventName, params);
    }
}

// Pre-defined event helpers
export function trackCalculatorView(calculatorType: string) {
    trackEvent("calculator_view", { calculator_type: calculatorType });
}

export function trackCalculatorInteraction(
    calculatorType: string,
    field: string
) {
    trackEvent("calculator_input_change", {
        calculator_type: calculatorType,
        field_name: field,
    });
}

export function trackLeadSubmission(
    calculatorType: string,
    creditBand: string,
    emailTermSheet: boolean
) {
    trackEvent("lead_submission", {
        calculator_type: calculatorType,
        credit_band: creditBand,
        email_term_sheet: emailTermSheet,
    });
}

export function trackDealHealth(
    calculatorType: string,
    score: number,
    level: string
) {
    trackEvent("deal_health_assessment", {
        calculator_type: calculatorType,
        health_score: score,
        health_level: level,
    });
}

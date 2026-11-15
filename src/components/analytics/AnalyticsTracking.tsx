import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useLocalizedChannelContent } from "@/i18n/channelI18n";
import "./analytics.css";

const CONSENT_KEY = "shiva-agri-analytics-consent-v1";
type Consent = "accepted" | "rejected" | null;
type AnalyticsSettings = {
  ga4MeasurementId: string;
  clarityProjectId: string;
  consentTitle: string;
  consentDescription: string;
  acceptLabel: string;
  rejectLabel: string;
  settingsLabel: string;
};

type TrackingWindow = Window & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
  clarity?: (...args: unknown[]) => void;
};

function readConsent(): Consent {
  try {
    const stored = window.localStorage.getItem(CONSENT_KEY);
    return stored === "accepted" || stored === "rejected" ? stored : null;
  } catch {
    return null;
  }
}

function writeConsent(value: Exclude<Consent, null>) {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // The current page still honors the visitor's choice when storage is blocked.
  }
}

function validGa4Id(value: string): string {
  const id = value.trim().toUpperCase();
  return /^G-[A-Z0-9]{4,20}$/.test(id) ? id : "";
}

function validClarityId(value: string): string {
  const id = value.trim();
  return /^[a-z0-9]{4,32}$/.test(id) ? id : "";
}

function loadGa4(id: string) {
  const trackingWindow = window as TrackingWindow;
  trackingWindow.dataLayer ??= [];
  trackingWindow.gtag ??= (...args: unknown[]) => {
    trackingWindow.dataLayer?.push(args);
  };

  const scriptId = `shiva-ga4-${id}`;
  if (document.getElementById(scriptId)) return;

  trackingWindow.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  trackingWindow.gtag("js", new Date());
  trackingWindow.gtag("config", id, { send_page_view: false });

  const script = document.createElement("script");
  script.id = scriptId;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);
}

function loadClarity(id: string) {
  const scriptId = `shiva-clarity-${id}`;
  if (document.getElementById(scriptId)) return;

  const trackingWindow = window as TrackingWindow;
  trackingWindow.clarity ??= (...args: unknown[]) => {
    const queuedClarity = trackingWindow.clarity as ((...queuedArgs: unknown[]) => void) & { q?: unknown[][] };
    (queuedClarity.q ??= []).push(args);
  };
  trackingWindow.clarity("consentv2", {
    ad_Storage: "denied",
    analytics_Storage: "granted",
  });

  const script = document.createElement("script");
  script.id = scriptId;
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${id}`;
  document.head.appendChild(script);
}

export default function AnalyticsTracking() {
  const content = useLocalizedChannelContent();
  // Older cached CMS documents may not contain this newer settings group yet.
  const analytics = (content as typeof content & { analytics?: AnalyticsSettings }).analytics;
  const location = useLocation();
  const [consent, setConsent] = useState<Consent>(readConsent);
  const [showChoice, setShowChoice] = useState(false);
  const lastPageView = useRef("");
  const ga4Id = validGa4Id(analytics?.ga4MeasurementId ?? "");
  const clarityId = validClarityId(analytics?.clarityProjectId ?? "");
  const configured = Boolean(ga4Id || clarityId);
  const accepted = configured && consent === "accepted";
  const isAdmin = location.pathname === "/admin" || location.pathname.startsWith("/admin/");

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== CONSENT_KEY) return;
      const next = readConsent();
      if (consent === "accepted" && next !== "accepted") {
        window.location.reload();
      } else {
        setConsent(next);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [consent]);

  useEffect(() => {
    if (!accepted || isAdmin) return;
    if (ga4Id) loadGa4(ga4Id);
    if (clarityId) loadClarity(clarityId);
  }, [accepted, ga4Id, clarityId, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      lastPageView.current = "";
      return;
    }
    if (!accepted || !ga4Id) return;
    const pagePath = `${location.pathname}${location.search}`;
    const pageKey = `${ga4Id}:${pagePath}`;
    if (lastPageView.current === pageKey) return;
    const frame = window.requestAnimationFrame(() => {
      if (lastPageView.current === pageKey) return;
      lastPageView.current = pageKey;
      (window as TrackingWindow).gtag?.("event", "page_view", {
        send_to: ga4Id,
        page_location: `${window.location.origin}${pagePath}`,
        page_path: pagePath,
        page_title: document.title,
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [accepted, ga4Id, isAdmin, location.pathname, location.search]);

  if (!configured || isAdmin || !analytics) return null;

  const choose = (value: Exclude<Consent, null>) => {
    const wasAccepted = consent === "accepted";
    writeConsent(value);
    setConsent(value);
    setShowChoice(false);
    if (wasAccepted && value === "rejected") {
      (window as TrackingWindow).gtag?.("consent", "update", { analytics_storage: "denied" });
      (window as TrackingWindow).clarity?.("consentv2", {
        ad_Storage: "denied",
        analytics_Storage: "denied",
      });
      window.location.reload();
    }
  };

  return (
    <>
      {(consent === null || showChoice) && (
        <section className="analytics-consent" role="region" aria-label={analytics.consentTitle}>
          <div className="analytics-consent-copy">
            <strong>{analytics.consentTitle}</strong>
            <p>{analytics.consentDescription}</p>
          </div>
          <div className="analytics-consent-actions">
            <button type="button" onClick={() => choose("rejected")}>{analytics.rejectLabel}</button>
            <button type="button" onClick={() => choose("accepted")}>{analytics.acceptLabel}</button>
          </div>
        </section>
      )}
      {consent !== null && !showChoice && (
        <button
          type="button"
          className="analytics-settings"
          onClick={() => setShowChoice(true)}
          aria-label={analytics.settingsLabel}
        >
          {analytics.settingsLabel}
        </button>
      )}
    </>
  );
}

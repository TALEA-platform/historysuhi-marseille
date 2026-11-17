import { useEffect, useState } from "react";
import { getLanguageCopy } from "../../i18n/config.js";
import { useI18n } from "../../i18n/useI18n.js";

const STORAGE_KEY = "talea_historysuhi_marseille_cookie_consent";

export function CookieBanner() {
  const { language } = useI18n();
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    try {
      setAccepted(localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      setAccepted(true);
    }
  }, []);

  if (accepted) return null;

  const copy = getLanguageCopy(language, {
    fr: {
      ariaLabel: "Information sur les cookies et le stockage local",
      message:
        "Ce site utilise le stockage local du navigateur uniquement pour mémoriser la langue choisie et les avis déjà consultés. Aucun cookie de suivi ni outil d'analyse tiers n'est utilisé. Les fonds de carte sont fournis par OpenFreeMap et par la Géoplateforme de l'IGN (data.geopf.fr), qui peuvent enregistrer les données standard des requêtes.",
      accept: "J'ai compris",
    },
    it: {
      ariaLabel: "Informativa cookie e archiviazione locale",
      message:
        "Questo sito utilizza l'archiviazione locale del browser solo per ricordare la lingua scelta e quali avvisi hai già visto. Non vengono usati cookie di tracciamento né analisi di terze parti. Le mappe di base sono fornite da OpenFreeMap e dalla Géoplateforme dell'IGN (data.geopf.fr), che possono registrare i dati standard delle richieste.",
      accept: "Ho capito",
    },
    en: {
      ariaLabel: "Cookie and storage notice",
      message:
        "This site uses local storage only to remember your chosen language and which notices you have already seen. No tracking cookies or third-party analytics are used. Map tiles are served by OpenFreeMap and IGN's Géoplateforme (data.geopf.fr), which may log standard request data.",
      accept: "Got it",
    },
  });

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore storage failures
    }
    setAccepted(true);
  };

  return (
    <div className="cookie-banner" role="region" aria-label={copy.ariaLabel}>
      <div className="cookie-banner-content">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4" />
          <circle cx="12" cy="16" r="0.5" fill="currentColor" />
        </svg>
        <p>{copy.message}</p>
        <button type="button" className="cookie-accept-btn" onClick={handleAccept}>
          {copy.accept}
        </button>
      </div>
    </div>
  );
}

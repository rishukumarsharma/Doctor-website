/* ==========================================================================
   STRUCTURED DATA (JSON-LD)
   Builds schema.org markup from SITE_DATA and the current page's
   `data-page` attribute on <body>. Keeps structured data in sync with the
   same single source of truth used for on-page content — edit data.js,
   not this file, to change names, contact details, services or FAQs.
   ========================================================================== */

(function () {
  const DATA = window.SITE_DATA;
  if (!DATA) return;

  const SITE_URL = "https://nourishandtone.com";
  const BUSINESS_ID = SITE_URL + "/#business";
  const page = document.body.dataset.page;

  function inject(schema) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({ "@context": "https://schema.org", ...schema });
    document.head.appendChild(script);
  }

  function absolute(path) {
    return SITE_URL + "/" + String(path).replace(/^\/+/, "");
  }

  // Core business entity — included on every page so each one is a valid,
  // self-contained document for crawlers that fetch it directly.
  inject({
    "@type": "MedicalBusiness",
    "@id": BUSINESS_ID,
    name: DATA.doctor.name,
    description: DATA.doctor.philosophy,
    url: SITE_URL + "/",
    telephone: DATA.contact.phone,
    email: DATA.contact.email,
    image: absolute(DATA.doctor.image),
    openingHours: DATA.contact.openingHoursSchema,
    availableService: DATA.specializations.map((s) => ({
      "@type": "Service",
      "@id": absolute(s.href) + "#service",
      name: s.title,
      url: absolute(s.href),
    })),
  });

  if (page === "faq" && Array.isArray(DATA.faqs)) {
    inject({
      "@type": "FAQPage",
      mainEntity: DATA.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  if (page === "about") {
    inject({
      "@type": "Person",
      name: DATA.doctor.name,
      jobTitle: DATA.doctor.title,
      description: DATA.doctor.philosophy,
      image: absolute(DATA.doctor.image),
      worksFor: { "@id": BUSINESS_ID },
    });
  }

  const specialization = DATA.specializations.find((s) => s.id === page);
  if (specialization) {
    inject({
      "@type": "Service",
      "@id": absolute(specialization.href) + "#service",
      name: specialization.title,
      description: specialization.description,
      url: absolute(specialization.href),
      provider: { "@id": BUSINESS_ID },
    });
  }
})();

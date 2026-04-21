// OtoSonar Chrome extension — content script
// Sahibinden.com ve arabam.com ilan sayfalarına "OtoSonar ile analiz et" butonu enjekte eder.
(() => {
  "use strict";

  const OTO_HOST = "https://otosonar.com";

  function extractListing() {
    const url = location.href;
    const host = location.hostname;
    const title = document.querySelector("h1")?.innerText?.trim() ?? document.title;

    const priceRaw =
      document.querySelector(".classified-price-wrapper, .product-price, [class*='price']")
        ?.textContent ?? "";
    const price = parseInt(priceRaw.replace(/[^\d]/g, ""), 10) || null;

    const descEl = document.querySelector(
      "#classifiedDescription, .description-text, .content-text, [class*='description']",
    );
    const description = descEl?.innerText?.trim().slice(0, 4000) ?? null;

    return {
      source: host.includes("sahibinden") ? "SAHIBINDEN" : "ARABAM",
      url,
      title,
      priceTry: price,
      description,
    };
  }

  function createButton() {
    if (document.getElementById("otosonar-analyze-btn")) return;

    const btn = document.createElement("button");
    btn.id = "otosonar-analyze-btn";
    btn.textContent = "🔍 OtoSonar ile analiz et";
    Object.assign(btn.style, {
      position: "fixed",
      right: "16px",
      bottom: "16px",
      zIndex: "999999",
      padding: "12px 18px",
      background: "#10b981",
      color: "#000",
      fontWeight: "600",
      border: "none",
      borderRadius: "12px",
      boxShadow: "0 4px 14px rgba(16,185,129,0.4)",
      cursor: "pointer",
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: "14px",
    });

    btn.onclick = () => {
      const data = extractListing();
      const target = `${OTO_HOST}/analiz?url=${encodeURIComponent(data.url)}&source=${data.source}`;
      window.open(target, "_blank", "noopener");
    };

    document.body.appendChild(btn);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createButton);
  } else {
    createButton();
  }
})();

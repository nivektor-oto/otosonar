// OtoSonar embed loader — 3. taraf siteler <script src="https://otosonar.com/embed.js"></script>
// yapıp <div data-otosonar theme="dark" partner="xyz"></div> koyarak kullanır.
(() => {
  "use strict";
  const HOST = "https://otosonar.com";

  function mount(el) {
    if (el.dataset.otosonarMounted === "1") return;
    el.dataset.otosonarMounted = "1";

    const theme = el.getAttribute("theme") || "dark";
    const partner = el.getAttribute("partner") || "";
    const iframe = document.createElement("iframe");
    iframe.src =
      HOST +
      "/gomulu?theme=" +
      encodeURIComponent(theme) +
      (partner ? "&partner=" + encodeURIComponent(partner) : "");
    iframe.setAttribute("loading", "lazy");
    iframe.style.cssText =
      "width:100%;min-height:300px;border:0;border-radius:16px;display:block;background:transparent";
    iframe.allow = "clipboard-read; clipboard-write";
    iframe.title = "OtoSonar analiz";

    el.innerHTML = "";
    el.appendChild(iframe);
  }

  function init() {
    document.querySelectorAll("[data-otosonar]").forEach(mount);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

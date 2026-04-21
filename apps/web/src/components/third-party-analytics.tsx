import Script from "next/script";

/**
 * GA4 + Hotjar loader.
 * Only renders if env vars are provided — stays zero-cost when unset.
 * Set NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXX and/or NEXT_PUBLIC_HOTJAR_ID=1234567 to activate.
 */
export function ThirdPartyAnalytics() {
  const ga = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const hotjar = process.env.NEXT_PUBLIC_HOTJAR_ID;

  if (!ga && !hotjar) return null;

  return (
    <>
      {ga && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga}', { anonymize_ip: true, send_page_view: true });
            `}
          </Script>
        </>
      )}
      {hotjar && (
        <Script id="hotjar-init" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:${hotjar},hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      )}
    </>
  );
}

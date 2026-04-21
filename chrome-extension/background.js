// Minimal background worker — opens the analyze page when popup/action is invoked
// without a tab URL match (fallback).
chrome.action.onClicked.addListener((tab) => {
  const url = tab?.url ?? "";
  chrome.tabs.create({
    url: url.includes("sahibinden.com") || url.includes("arabam.com")
      ? `https://otosonar.com/analiz?url=${encodeURIComponent(url)}`
      : "https://otosonar.com",
  });
});

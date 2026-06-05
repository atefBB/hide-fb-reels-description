/**
 * Hide Facebook Reels Description — Content Script
 *
 * Facebook uses dynamically generated class names, so we rely on:
 *  - aria-labels, data-testid attributes
 *  - structural patterns within the Reels viewer
 *  - a MutationObserver to catch re-renders (SPA)
 */

// ── Selector strategies ────────────────────────────────────────────────
// Ordered from most to least specific. The script tries all of them.

const SELECTOR_STRATEGIES = [
  // Common aria-label patterns for description sections
  'div[aria-label="Description"]',
  'span[aria-label="Description"]',
  'div[aria-label*="description" i]',
  'span[aria-label*="description" i]',

  // Reel caption/description containers (observed on recent Facebook builds)
  '[data-pagelet="ReelsViewer"] [role="complementary"]',
  '[data-pagelet="ReelsViewer"] [role="contentinfo"]',

  // Target elements with text that are absolutely positioned overlays
  // inside the reel viewer (common pattern for caption overlays)
  '[data-pagelet="ReelsViewer"] div[style*="position: absolute"][style*="bottom"]',
  '[data-pagelet="ReelsViewer"] div[style*="position:absolute"][style*="bottom"]',

  // Fallback: any visible text block inside the reel viewer that is at the bottom
  '[data-pagelet="ReelsViewer"] > div > div > div > div[style*="flex"] div[style*="absolute"]',

  // Broad catch: hide the bottom gradient overlay container in reels
  // (often holds the description + action buttons)
  '[data-pagelet="ReelsViewer"] div[style*="linear-gradient"][style*="bottom"]',
];

// ── State ──────────────────────────────────────────────────────────────

let enabled = true;
let observer = null;
let styleElement = null;

// ── Dynamic CSS injection (replaces static styles.css) ────────────────

const CSS_RULES = `
/* Hide description elements by common attributes */
div[aria-label="Description"],
span[aria-label="Description"],
div[aria-label*="description" i],
span[aria-label*="description" i] {
  display: none !important;
}

/* Hide the description container within the Reels viewer */
[data-pagelet="ReelsViewer"] [role="complementary"],
[data-pagelet="ReelsViewer"] [role="contentinfo"] {
  display: none !important;
}

/* Hide bottom positioned overlays in the reel viewer */
[data-pagelet="ReelsViewer"] div[style*="position: absolute"][style*="bottom"],
[data-pagelet="ReelsViewer"] div[style*="position:absolute"][style*="bottom"] {
  display: none !important;
}

/* Hide gradient overlays at the bottom (often holds description) */
[data-pagelet="ReelsViewer"] div[style*="linear-gradient"][style*="bottom"] {
  display: none !important;
}
`;

function injectCSS() {
  if (styleElement) return;
  styleElement = document.createElement('style');
  styleElement.id = 'hfrd-styles';
  styleElement.textContent = CSS_RULES;
  document.documentElement.appendChild(styleElement);
}

function removeCSS() {
  if (styleElement) {
    styleElement.remove();
    styleElement = null;
  }
}

// ── Core logic ─────────────────────────────────────────────────────────

function hideDescriptions() {
  if (!enabled) return;

  for (const selector of SELECTOR_STRATEGIES) {
    try {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        if (el instanceof HTMLElement && el.style.display !== 'none') {
          el.style.setProperty('display', 'none', 'important');
          el.dataset.hfrdHidden = 'true';
        }
      }
    } catch {
      // Malformed selector — ignore and continue
    }
  }
}

function showDescriptions() {
  for (const selector of SELECTOR_STRATEGIES) {
    try {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        if (el instanceof HTMLElement && el.dataset.hfrdHidden === 'true') {
          el.style.display = '';
          delete el.dataset.hfrdHidden;
        }
      }
    } catch {
      // Malformed selector — ignore and continue
    }
  }
}

// ── MutationObserver ───────────────────────────────────────────────────

function startObserver() {
  if (observer) observer.disconnect();

  observer = new MutationObserver((mutations) => {
    // Only run if new nodes were added (SPA re-renders)
    const hasAddedNodes = mutations.some((m) => m.addedNodes.length > 0);
    if (hasAddedNodes) {
      // Small debounce to avoid excessive DOM scanning
      clearTimeout(observer._debounce);
      observer._debounce = setTimeout(hideDescriptions, 100);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function stopObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

// ── Initialization ─────────────────────────────────────────────────────

// Load persisted state
chrome.storage.sync.get({ enabled: true }, (result) => {
  enabled = result.enabled;
  if (enabled) {
    injectCSS();
    hideDescriptions();
    startObserver();
  }
});

// Listen for toggle messages from the popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'toggleReelDescription') {
    enabled = message.enabled;

    if (enabled) {
      injectCSS();
      hideDescriptions();
      startObserver();
    } else {
      showDescriptions();
      removeCSS();
      stopObserver();
    }
  }
});

// Re-apply on dynamic page navigations (SPA)
window.addEventListener('popstate', () => {
  if (enabled) {
    setTimeout(hideDescriptions, 300);
  }
});

console.log('[HF Reels Description] Extension loaded. Enabled:', enabled);

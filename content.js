/**
 * Hide Facebook Reels Description — Content Script
 *
 * Facebook uses dynamically generated class names, so we rely on:
 *  - The "Show more" button (role="button", tabindex="0") inside the description
 *  - Observed class name patterns as fallback
 *  - MutationObserver to catch SPA re-renders
 */

// ── "Show more" text in different languages (case-insensitive match) ──
// The description container always has a "Show more" / "عرض المزيد" button.
// We find it by text and hide its parent element.

const SHOW_MORE_TEXTS = [
  'show more',
  'عرض المزيد',     // Arabic
  'afficher plus',   // French
  'ver mais',        // Portuguese
  'mostrar más',     // Spanish
  'mehr anzeigen',   // German
  'visualizza altro',// Italian
  'selengkapnya',    // Indonesian
  'xem thêm',        // Vietnamese
  'ดูเพิ่มเติม',      // Thai
  'さらに表示',       // Japanese
  '查看更多',         // Chinese (Simplified)
  '了解更多',         // Chinese (Simplified, alt)
  '顯示更多',         // Chinese (Traditional)
];

// ── Observed class names on the description container ─────────────────
// These may change over time but serve as a fast secondary strategy.

const DESCRIPTION_CLASSES = [
  'xdj266r', 'x14z9mp', 'xat24cr', 'x1lziwak', 'x1vvkbs', 'x126k92a',
];

// ── State ──────────────────────────────────────────────────────────────

let enabled = true;
let observer = null;

// ── Core logic ─────────────────────────────────────────────────────────

function hideDescriptions() {
  if (!enabled) return;

  let hiddenCount = 0;

  // Strategy 1 (fastest): Use the obfuscated class name combination.
  // Warning: Facebook's classes change frequently — update these periodically.
  const classSelector = DESCRIPTION_CLASSES.map(c => '.' + c).join('');
  try {
    const byClass = document.querySelectorAll(classSelector);
    for (const el of byClass) {
      if (!el.dataset.hfrdHidden && el.style.display !== 'none') {
        el.style.setProperty('display', 'none', 'important');
        el.dataset.hfrdHidden = 'true';
        hiddenCount++;
      }
    }
  } catch {
    // class selector might be invalid if classes have changed — ignore
  }

  // Strategy 2 (reliable): Find "Show more" button, hide its parent.
  // The description container always has this button. We verify the parent
  // actually contains description text to avoid false positives from other
  // "Show more" buttons on the page (e.g. in post previews).
  const buttons = document.querySelectorAll('[role="button"][tabindex="0"]');
  for (const btn of buttons) {
    try {
      const text = (btn.textContent || '').trim().toLowerCase();
      if (SHOW_MORE_TEXTS.includes(text)) {
        const descContainer = btn.parentElement;
        if (!descContainer || descContainer.dataset.hfrdHidden || descContainer.style.display === 'none') {
          continue;
        }
        // Ensure parent has real description text (not just the button label)
        const totalText = (descContainer.textContent || '').trim();
        const buttonText = (btn.textContent || '').trim();
        if (totalText.length > buttonText.length + 15) {
          descContainer.style.setProperty('display', 'none', 'important');
          descContainer.dataset.hfrdHidden = 'true';
          hiddenCount++;
        }
      }
    } catch {
      // Ignore and continue
    }
  }

  if (hiddenCount > 0) {
    console.log(`[HF Reels] Hidden ${hiddenCount} description element(s)`);
  }
}

function showDescriptions() {
  // Unhide only elements that were hidden by this extension
  const hidden = document.querySelectorAll('[data-hfrd-hidden="true"]');
  for (const el of hidden) {
    if (el instanceof HTMLElement) {
      el.style.display = '';
      delete el.dataset.hfrdHidden;
    }
  }
}

// ── MutationObserver ───────────────────────────────────────────────────

function startObserver() {
  if (observer) observer.disconnect();

  observer = new MutationObserver((mutations) => {
    const hasAddedNodes = mutations.some((m) => m.addedNodes.length > 0);
    if (hasAddedNodes) {
      clearTimeout(observer._debounce);
      observer._debounce = setTimeout(hideDescriptions, 150);
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
    hideDescriptions();
    startObserver();
  }
  console.log('[HF Reels] Extension loaded. Enabled:', enabled);
});

// Listen for toggle messages from the popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'toggleReelDescription') {
    enabled = message.enabled;
    if (enabled) {
      hideDescriptions();
      startObserver();
    } else {
      showDescriptions();
      stopObserver();
    }
  }
});

// Handle SPA navigation
window.addEventListener('popstate', () => {
  if (enabled) {
    setTimeout(hideDescriptions, 300);
  }
});

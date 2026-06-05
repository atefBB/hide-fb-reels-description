// ── Popup Script ──────────────────────────────────────────────────────
// Handles the toggle switch and communicates state to the content script.

const toggle = document.getElementById('toggle');
const status = document.getElementById('status');

// Load current state
chrome.storage.sync.get({ enabled: true }, (result) => {
  toggle.checked = result.enabled;
  updateStatus(result.enabled);
});

// Handle toggle changes
toggle.addEventListener('change', () => {
  const enabled = toggle.checked;

  // Persist state
  chrome.storage.sync.set({ enabled });

  // Notify the content script
  chrome.tabs.query({ url: '*://*.facebook.com/*' }, (tabs) => {
    for (const tab of tabs) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'toggleReelDescription',
        enabled,
      }).catch(() => {
        // Tab may not have the content script loaded yet — that's fine
      });
    }
  });

  updateStatus(enabled);
});

function updateStatus(enabled) {
  status.textContent = enabled
    ? '✅ Description will be hidden on Facebook Reels.'
    : '⏸️ Description will be visible on Facebook Reels.';
  status.className = enabled ? 'status enabled' : 'status disabled';
}

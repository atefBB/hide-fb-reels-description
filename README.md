# Hide Facebook Reels Description

A Chromium-based browser extension that hides the caption/description overlay on Facebook Reels videos, giving you an unobstructed view of the video.

## The Problem

When watching Facebook Reels, the description text often covers the bottom half of the video, blocking the content you're trying to watch. This extension removes that overlay.

## How It Works

The extension uses multiple strategies to find and hide the description element:

- **Attribute selectors** — targets `aria-label` and `role` attributes that Facebook assigns to the description container
- **Structural selectors** — finds the Reels viewer container (`data-pagelet="ReelsViewer"`) and identifies overlays within it
- **Position-based selectors** — detects absolutely-positioned elements at the bottom of the reel viewer
- **Gradient detection** — catches the gradient overlay that often accompanies the description

Facebook is a single-page application (SPA), so swiping to a new reel doesn't reload the page. The extension uses a `MutationObserver` with debouncing to detect when new reels are loaded and automatically re-hides the description.

## Features

- ✅ Hides the description overlay on any Facebook Reel
- ✅ Works on dynamic page transitions (swipe between reels)
- ✅ Toggle on/off via the extension popup
- ✅ State is persisted across browser sessions
- ✅ Lightweight — no unnecessary permissions

## Installation

### From source (developer mode)

1. Clone or download this repository
2. Open your Chromium-based browser (Chrome, Edge, Brave, Opera, etc.)
3. Navigate to `chrome://extensions`
4. Enable **Developer mode** (toggle in the top-right corner)
5. Click **Load unpacked**
6. Select the project folder

The extension should now appear in your toolbar. Click it to see the toggle.

### From the Chrome Web Store

*Coming soon.*

## Usage

1. Visit `facebook.com` and open any Reel
2. The description will be hidden automatically
3. Click the extension icon in the toolbar to open the popup
4. Toggle **Hide description** on or off

The setting persists across browser sessions via `chrome.storage.sync`.

## Project Structure

```
├── manifest.json          # Extension manifest (Manifest V3)
├── content.js             # Content script — finds and hides description elements
├── styles.css             # Reference copy — CSS rules are embedded in content.js
├── popup.html             # Popup UI
├── popup.css              # Popup styles
├── popup.js               # Popup logic — toggle, state management
├── icons/
│   ├── icon16.png         # 16×16 toolbar icon
│   ├── icon48.png         # 48×48 extensions page icon
│   └── icon128.png        # 128×128 store icon
├── .gitignore
└── README.md
```

## Browser Support

Works on any Chromium-based browser (Chrome 88+):

| Browser | Status |
|---------|--------|
| Google Chrome | ✅ |
| Microsoft Edge | ✅ |
| Brave | ✅ |
| Opera | ✅ |
| Vivaldi | ✅ |

## Troubleshooting

**The description is still showing.**

Facebook frequently updates its DOM structure, which can break the selectors. To fix this:

1. Right-click the description text on a Reel and select **Inspect**
2. Look for a stable attribute on the container element (e.g., `aria-label`, `role`, `data-pagelet`)
3. Open an issue with the selector that worked for you

**The toggle doesn't seem to do anything.**

Try refreshing the Facebook tab after toggling. The CSS rules apply immediately, but Facebook caches some DOM elements aggressively.

## License

MIT

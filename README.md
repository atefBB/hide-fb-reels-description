# Hide Facebook Reels Description

A Chromium-based browser extension that hides the caption/description overlay on Facebook Reels videos, giving you an unobstructed view of the video.

## The Problem

When watching Facebook Reels, the description text often covers the bottom half of the video, blocking the content you're trying to watch. This extension removes that overlay.

## How It Works

The extension uses two strategies to find and hide the description element:

1. **Class name pattern (fast)** — Targets the specific CSS class combination used by Facebook's description container. This is the fastest strategy and runs first.

2. **"Show more" button text matching (reliable)** — Finds the "Show more" button (with `role="button"`) inside the description by its text content, then hides its parent element. This works across languages (Arabic, English, French, Spanish, German, Italian, Portuguese, Indonesian, Vietnamese, Thai, Japanese, Chinese, and more).

Facebook is a single-page application (SPA), so swiping to a new reel doesn't reload the page. The extension uses a `MutationObserver` with debouncing to detect when new reels are loaded and automatically re-hides the description.

## Features

- ✅ Hides the description overlay on any Facebook Reel
- ✅ Works on dynamic page transitions (swipe between reels)
- ✅ Multi-language support (14 languages)
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

Facebook frequently updates its DOM structure, which can break the selectors. If the extension stops working:

1. Right-click the description text on a Reel and select **Inspect**
2. Note the CSS class names on the description container element
3. Open an issue with the updated class names and the "Show more" button text

**The toggle doesn't seem to do anything.**

Refresh the Facebook tab after toggling. The extension hides elements that are already in the DOM — some reels may need a refresh for the change to take effect.

## License

MIT

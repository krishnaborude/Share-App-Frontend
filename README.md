
# QuickShare — Frontend

A small React + Vite frontend for QuickShare, a lightweight file-sharing application that lets users upload files and share short, tokenized download links (with QR codes) for recipients to download.

This README documents setup, development, testing, and the backend API contract the frontend expects.

---

## Table of contents

- Features
- Tech stack
- Quick start (Windows PowerShell)
- Project structure
- Development workflow
- Build & preview
- Testing
- Configuration & environment variables
- Backend API (expected endpoints)
- Behavior and fallbacks
- Troubleshooting
- Contributing
- License

---

## Features

- Upload a single file or multiple files (drag-and-drop or file selector).
- Receive/download a file using a short token.
- QR code generation for mobile downloads.
- Clipboard fallback when popup windows are blocked.
- Responsive, accessible UI.

## Tech stack

- React 18
- Vite
- Vitest + Testing Library
- Plain CSS

## Quick start (Windows PowerShell)

1. Install dependencies:

```powershell
cd "c:\Users\borud\OneDrive\Desktop\QuickShare App\quickshare-frontend"
npm install
```

2. Start the dev server:

```powershell
npm run dev
```

Open the URL shown by Vite (for example `http://localhost:5173`).

## Project structure (key files)

- `index.html`, `src/main.jsx` — app bootstrap
- `src/App.jsx` — routing and home page
- `src/components/SendOptions.jsx` — Send flow selector
- `src/components/SendForm.jsx` — upload logic
- `src/components/ReceiveForm.jsx` — token input + download logic
- `src/components/ToastContext.jsx` — notifications
- `src/utils/*` — helper utilities
- `src/styles.css` — global styles
- `package.json` — scripts & deps

## Development workflow

- Run `npm run dev` to preview locally.
- Create feature branches for changes and add tests for logic.
- Use `vitest --watch` for iterative test development.

## Build & preview

Build for production:

```powershell
npm run build
```

Preview production build:

```powershell
npm run preview
```

## Testing

Run unit tests:

```powershell
npm test
```

The project includes tests for utilities and components using Vitest and Testing Library.

## Configuration & environment variables

Currently the frontend hard-codes the backend base URL. To make it configurable, create a `.env.local` with:

```
VITE_API_BASE=https://download-app-backend-1.onrender.com/api
```

Then read it in components:

```js
const API_BASE = import.meta.env.VITE_API_BASE || 'https://download-app-backend-1.onrender.com/api'
```

## Backend API (expected endpoints)

The frontend expects the backend to expose:

- `POST /api/upload/` — upload single file (multipart field `file`) — returns JSON with `token`, optionally `download_url`, `files`.
- `POST /api/upload-multiple/` — upload multiple files (multipart field `files`).
- `HEAD /api/download/:token` — lightweight validity check and header inspection.
- `GET /api/download/:token` — direct download URL.
- `GET /api/qr-code/:token` — QR image for the token.

Notes:
- Frontend prefers `HEAD` to avoid downloading full file body; on 405 it falls back to opening `GET`.

## Behavior and fallbacks

- The app tries `window.open(url, '_blank')` first, then a programmatic `<a>` click, then copies URL to clipboard if all else fails.
- Token inputs are auto-trimmed.
- The app surfaces backend messages when possible; HEAD responses often don't include bodies.

## Troubleshooting

- Token not found / 500:
	- Confirm you used the exact token returned by the Send flow.
	- Tokens may be ephemeral or removed by backend cleanup; re-upload to generate a new token.

- Popup blocked:
	- The app will copy the link to clipboard and show a toast. Paste into the address bar to download.

- CORS / network errors:
	- Ensure backend allows frontend origin.
	- Check browser DevTools for details.

## Contributing

Contributions welcome — fork, branch, add tests, open PR.

## License

No license is included by default. If you plan to publish this repo, consider adding an open-source license such as MIT.

---

If you'd like, I can:

- Wire `VITE_API_BASE` through the code.
- Add a small debug panel to `ReceiveForm` that shows the constructed download URL and a copy button.
- Replace emoji icons with inline SVG icons and add keyboard focus styles to the home choice tiles.

Tell me which follow-up you'd like and I'll implement it.

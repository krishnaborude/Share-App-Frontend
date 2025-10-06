# QuickShare Frontend

Simple React + Vite frontend for the QuickShare file-sharing app.

Features:
- Send single or multiple files (drag-and-drop or file selector)
- Receive page where you enter a token to open the download
- Shows download link, QR code, token, filenames
- Copy link button, loading states, basic error/success notifications

Run locally:

1. Install dependencies

```powershell
cd "c:\Users\borud\OneDrive\Desktop\QuickShare App\quickshare-frontend"
npm install
```

2. Start dev server

```powershell
npm run dev
```

Notes:
- The frontend calls the backend at https://share-app-backend.onrender.com/api
- If CORS errors occur, enable CORS on the backend or run a local proxy.

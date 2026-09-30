# QR Video Player

A lightweight, mobile-first static web app that lets users scan a QR code and immediately watch a video — no ads, no iframes, no tracking.

**Pages:**
- `video.html` — the video playback page users land on after scanning
- `qr-generator.html` — admin page to generate and download a QR code for any URL

---

## Local Setup

This is a plain static site with no build step, no npm install, and no bundler.

**Option 1 — Open directly in a browser:**

Just double-click `index.html` (or `video.html`) in your file explorer. Most functionality works fine this way, though some browsers restrict certain features on `file://` URLs.

**Option 2 — Use a local HTTP server (recommended):**

```bash
npx serve .
```

Then open `http://localhost:3000` in your browser.

**Option 3 — VS Code Live Server:**

Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer), right-click `index.html`, and select **Open with Live Server**.

---

## Deployment to Cloudflare Pages

1. Push the project to a GitHub or GitLab repository.
2. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com) and go to **Workers & Pages → Create application → Pages**.
3. Connect your repository.
4. In the build settings:
   - **Build command:** leave blank (no build step needed)
   - **Build output directory:** `/` or `.`
5. Click **Save and Deploy**.

Cloudflare Pages will serve the static files directly. Every push to your main branch triggers an automatic redeploy.

> The project is equally deployable to GitHub Pages, Netlify, and Vercel using the same approach — no build command, root output directory.

---

## Video URL Replacement

Open `script.js` and edit the `CONFIG` object at the top of the file:

```js
const CONFIG = {
  videoUrl: "https://your-cdn.example.com/your-video.mp4",
  title: "My Event Video",
  // ...
};
```

**Requirements for `CONFIG.videoUrl`:**

- Must be a **direct HTTPS URL** pointing to a video file (`.mp4`, `.webm`, or `.ogg`).
- Must **not** be a YouTube, Vimeo, Google Drive, or any other platform URL — those are iframes, not direct files.
- Must be served over **HTTPS** to avoid mixed-content browser warnings.

Example of a valid URL:
```
https://pub-abc123.r2.dev/events/my-video.mp4
```

Example of an invalid URL (do not use):
```
https://www.youtube.com/watch?v=abc123   ← NOT a direct file
https://drive.google.com/file/d/...      ← NOT a direct file
```

---

## Video Hosting Recommendations

The video file must be hosted somewhere that provides a direct file URL, CORS headers, and HTTPS. Good options:

| Provider | Notes |
|---|---|
| **Cloudflare R2** | Free egress, S3-compatible API, pairs naturally with Cloudflare Pages. Enable public access on the bucket. |
| **Backblaze B2** | Low-cost object storage with a Cloudflare-partnered free egress tier when using B2 + Cloudflare. |
| **Bunny.net** | CDN built for video/media. Simple upload, global edge delivery, per-GB pricing. |
| **AWS S3 + CloudFront** | Reliable and scalable. Use CloudFront for HTTPS delivery and configure S3 bucket CORS policy. |
| **Self-hosted** | Any web server (nginx, Apache, Caddy) serving files over HTTPS works fine. |

**Important requirements for all providers:**

- Enable **CORS** headers so the browser can fetch the video from a different origin. The minimum required header is:
  ```
  Access-Control-Allow-Origin: *
  ```
- Serve files over **HTTPS** only.
- Provide a **direct file URL** (the URL must end in `.mp4`, `.webm`, or `.ogg`, or the server must return the correct `Content-Type` header).

---

## QR Code Generation

1. Open `qr-generator.html` in your browser (locally or at your deployed URL).
2. Enter the full URL of your `video.html` page into the **Enter URL** field, for example:
   ```
   https://your-project.pages.dev/video.html
   ```
3. Click **Generate QR**.
4. A scannable QR code will appear on the page.
5. Click **Download PNG** to save the QR code image to your device.

Print or display the downloaded PNG at your event. When attendees scan it with their phone camera, they will be taken directly to the video page.

> The QR code is generated entirely in the browser — the URL is never sent to any external server.

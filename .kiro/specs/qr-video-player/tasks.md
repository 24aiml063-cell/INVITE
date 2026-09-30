# Tasks

## Task List

- [x] 1. Project structure and HTML scaffolding
  - [x] 1.1 Create `index.html` with a meta-refresh redirect to `video.html`
  - [x] 1.2 Create `video.html` with semantic HTML structure: `<video id="player">`, `#loading-screen`, `#play-overlay`, `#error-state`, `#branding` elements
  - [x] 1.3 Create `qr-generator.html` with URL input, Generate button, QR container, validation message, and Download button
  - [x] 1.4 Create empty `assets/` directory placeholder

- [x] 2. Shared styles (`style.css`)
  - [x] 2.1 Implement dark/black full-viewport background and base reset
  - [x] 2.2 Style the Player: `width: 100%`, `height: auto`, rounded corners, centered horizontally
  - [x] 2.3 Style Loading_Screen: full-viewport overlay with "Loading video..." text and pure CSS spinner animation
  - [x] 2.4 Style Play_Overlay: centered, full-viewport backdrop with prominent tap button
  - [x] 2.5 Style Error_State: centered error message, sub-message, and Retry button
  - [x] 2.6 Style Branding_Block: minimal layout, logo + org name, does not dominate the viewport
  - [x] 2.7 Add responsive CSS breakpoints for 320px, 768px, and 1024px+ viewports
  - [x] 2.8 Add `:focus-visible` styles for all interactive elements (Play_Overlay button, Retry button)

- [x] 3. Video page logic (`script.js`)
  - [x] 3.1 Define the `CONFIG` object at the top of `script.js` with all required properties: `videoUrl`, `title`, `autoplay`, `muted`, `loop`, `showBranding`, `organizationName`, `logoUrl`
  - [x] 3.2 Implement `initPlayer()`: read CONFIG, set `video.src`, apply `autoplay`/`muted`/`loop` attributes conditionally, set `video.title`
  - [x] 3.3 Implement Loading_Screen show/hide: show on page load, hide on `canplay` event
  - [x] 3.4 Implement error handling: on `error` event, hide Loading_Screen, show Error_State with message "Unable to load video." and sub-message
  - [x] 3.5 Implement `handleAutoplay()`: call `video.play()`, on resolve hide Play_Overlay, on reject show Play_Overlay with "Tap to play the video" button
  - [x] 3.6 Implement Play_Overlay button click handler: call `video.play()` and hide overlay
  - [x] 3.7 Implement `handleRetry()`: clear `video.src`, reassign `CONFIG.videoUrl` to trigger reload without `location.reload()`
  - [x] 3.8 Implement `initBranding()`: toggle Branding_Block visibility per `CONFIG.showBranding`, conditionally render `<img>` for logoUrl, set org name text
  - [x] 3.9 Add `aria-label` attributes to Play_Overlay button and Retry button; add `title` attribute to `<video>` element

- [x] 4. QR Generator logic (`qr-generator.js`)
  - [x] 4.1 Add QR library script tag to `qr-generator.html` via jsDelivr CDN (qrcode package, pinned version)
  - [x] 4.2 Implement `generateQR()`: validate URL input (non-empty/non-whitespace), render QR into container via library, show Download button
  - [x] 4.3 Implement `downloadQR()`: convert rendered canvas to data URL, trigger `.png` download via `<a download>` element
  - [x] 4.4 Wire up Generate button click to `generateQR()` and Download button click to `downloadQR()`

- [x] 5. README
  - [x] 5.1 Write `README.md` covering: local setup, deployment to Cloudflare Pages, video URL replacement instructions, video hosting recommendations, and QR code generation instructions

- [x] 6. Unit tests
  - [x] 6.1 Set up Vitest with jsdom environment (no build step; configure for `--run` single-pass)
  - [x] 6.2 Test DOM structure of `video.html`: verify `<video>` has `controls`, `playsinline`, `preload="metadata"` attributes
  - [x] 6.3 Test accessibility attributes: Play_Overlay button has `aria-label`, Retry button has `aria-label`, video element has `title`
  - [x] 6.4 Test Loading_Screen contains "Loading video..." text
  - [x] 6.5 Test Error_State contains "Unable to load video." and sub-message text
  - [x] 6.6 Test `video.html` has no `<iframe>` elements
  - [x] 6.7 Test `video.html` has no framework/analytics/tracking script tags
  - [x] 6.8 Test QR Generator page has URL input, Generate button, and Download button in DOM
  - [x] 6.9 Test `CONFIG` object has all required keys

- [x] 7. Property-based tests
  - [x] 7.1 Install fast-check as dev dependency (pinned version)
  - [x] 7.2 Property 1: For any valid URL string, after `initPlayer()`, `video.src` equals `CONFIG.videoUrl`
  - [x] 7.3 Property 2 & 3: For any CONFIG with `autoplay: true` / `loop: true`, corresponding attributes are applied to the video element
  - [x] 7.4 Property 4: For any CONFIG with `autoplay: true`, mock `play()` resolving/rejecting; verify Play_Overlay visibility is the inverse of autoplay success
  - [x] 7.5 Property 5: For any Play_Overlay-visible state, button click calls `play()` and hides overlay
  - [x] 7.6 Property 6: Firing `canplay` in any loading state hides Loading_Screen
  - [x] 7.7 Property 7: Firing `error` in any loading state hides Loading_Screen and shows Error_State
  - [x] 7.8 Property 8: In any error state, Retry click reassigns `video.src` and does not call `window.location.reload`
  - [x] 7.9 Property 9 & 10 & 11: For any CONFIG, branding visibility matches `showBranding`; img presence matches non-empty `logoUrl`; org name text appears in block
  - [x] 7.10 Property 12: For any non-empty URL string, Generate click results in QR container having a rendered child
  - [x] 7.11 Property 13: For any empty/whitespace URL string, Generate click does not render QR and shows validation message

# Requirements Document

## Introduction

A lightweight, mobile-first HTML/CSS/Vanilla JavaScript web application that enables users to scan a QR code and immediately watch a video hosted at a direct URL — with no third-party advertisements, no iframes, and no external tracking. The project includes a video playback page and a separate QR code generator admin page, deployable to static hosting platforms such as Cloudflare Pages, GitHub Pages, Netlify, or Vercel.

## Glossary

- **Video_Page**: The main `video.html` page that loads and plays the configured video.
- **QR_Generator**: The `qr-generator.html` admin page that generates a scannable QR code for any URL.
- **Player**: The native HTML5 `<video>` element used to render the video.
- **CONFIG**: A single JavaScript configuration object at the top of `script.js` that controls all runtime behavior.
- **Loading_Screen**: A full-screen overlay shown while the video source is being fetched/buffered.
- **Play_Overlay**: A centered button shown when browser autoplay restrictions prevent automatic playback.
- **Branding_Block**: An optional organization name and logo displayed minimally on the Video_Page.

---

## Requirements

### Requirement 1: Core Video Playback

**User Story:** As a user who scans a QR code, I want the video to load and play immediately in my browser, so that I can watch the content without friction or advertisements.

#### Acceptance Criteria

1. THE Video_Page SHALL load the video source exclusively from the URL defined in `CONFIG.videoUrl`.
2. THE Player SHALL be a native HTML5 `<video>` element with the `controls`, `playsinline`, and `preload="metadata"` attributes.
3. THE Video_Page SHALL NOT embed any YouTube, Vimeo, Facebook, Instagram, Google Drive, or other advertising-supported video iframe or third-party player.
4. THE Video_Page SHALL NOT include any advertisement networks, tracking scripts, analytics beacons, or third-party popups.
5. THE Player SHALL support `.mp4`, `.webm`, and `.ogg` video formats.

---

### Requirement 2: Configuration Object

**User Story:** As a developer deploying this project, I want a single configuration section at the top of the JavaScript file, so that I can customize the video URL and branding without searching through the entire codebase.

#### Acceptance Criteria

1. THE `script.js` file SHALL define a `CONFIG` object as the sole location for runtime configuration.
2. THE `CONFIG` object SHALL include the following properties: `videoUrl`, `title`, `autoplay`, `muted`, `loop`, `showBranding`, `organizationName`, and `logoUrl`.
3. THE Video_Page SHALL read `CONFIG.videoUrl` to set the video source and SHALL NOT hard-code any video URL elsewhere in the codebase.
4. WHEN `CONFIG.autoplay` is `true`, THE Player SHALL have the `autoplay` and `muted` attributes applied at initialization.
5. WHEN `CONFIG.loop` is `true`, THE Player SHALL have the `loop` attribute applied.

---

### Requirement 3: Autoplay Behavior

**User Story:** As a user opening the page on a mobile device, I want the video to start playing automatically if the browser allows it, so that I do not need extra taps to begin watching.

#### Acceptance Criteria

1. WHEN the Video_Page loads and `CONFIG.autoplay` is `true`, THE Player SHALL attempt to call `video.play()` programmatically.
2. WHEN the autoplay attempt succeeds, THE Play_Overlay SHALL be hidden and playback SHALL continue.
3. WHEN the autoplay attempt is blocked by the browser, THE Play_Overlay SHALL be displayed with a prominent button labeled "Tap to play the video".
4. WHEN the user taps the Play_Overlay button, THE Player SHALL begin playback and THE Play_Overlay SHALL be hidden.
5. THE Video_Page SHALL NOT attempt to bypass browser autoplay restrictions through workarounds such as fake user interaction simulation.
6. THE Player SHALL include the `muted` and `playsinline` attributes to maximize autoplay compatibility on mobile browsers including Android Chrome, iPhone Safari, Samsung Internet, and iOS Chrome.

---

### Requirement 4: Loading Screen

**User Story:** As a user on a slow mobile connection, I want to see a loading indicator while the video buffers, so that I know the page is working and have not hit an error.

#### Acceptance Criteria

1. THE Loading_Screen SHALL be displayed immediately when the Video_Page first loads.
2. WHEN the Player fires the `canplay` event, THE Loading_Screen SHALL be hidden.
3. WHEN the Player fires the `error` event, THE Loading_Screen SHALL be hidden and the error state SHALL be displayed instead.
4. THE Loading_Screen SHALL include the text "Loading video..." and a smooth CSS animation (no external animation libraries).
5. THE Loading_Screen SHALL NOT remain visible indefinitely if the video fails to load.

---

### Requirement 5: Error Handling

**User Story:** As a user whose video fails to load, I want a clear error message and a retry option, so that I can attempt playback again without reloading the entire page.

#### Acceptance Criteria

1. WHEN the Player fires an `error` event, THE Video_Page SHALL display an error message reading "Unable to load video."
2. THE Video_Page SHALL display the sub-message "Please check your internet connection or try again." alongside the error message.
3. THE Video_Page SHALL display a "Retry" button when an error occurs.
4. WHEN the user clicks the Retry button, THE Video_Page SHALL reset the video source and attempt to load the video again without performing a full page refresh.
5. IF the video URL is unreachable due to a network error, THEN THE Video_Page SHALL handle the failure gracefully and SHALL NOT display a blank screen with no feedback.
6. IF the video format is unsupported by the browser, THEN THE Video_Page SHALL display the error state described in criteria 1–3.

---

### Requirement 6: Responsive Mobile-First Layout

**User Story:** As a user opening the page on a smartphone, I want the video to occupy as much of the screen as possible and be easy to interact with, so that I have the best viewing experience on my device.

#### Acceptance Criteria

1. THE Video_Page SHALL use a dark or black background color for the full viewport.
2. THE Player SHALL have `width: 100%` and `height: auto` by default so it scales to the available width.
3. THE Video_Page SHALL maintain the video's native aspect ratio at all viewport sizes.
4. THE Video_Page SHALL include responsive CSS breakpoints that optimize the layout for viewports of 320px, 768px, and 1024px width and above.
5. THE Video_Page SHALL render correctly on Android Chrome, iPhone Safari, Samsung Internet, iOS Chrome, and desktop Chrome/Firefox/Safari.
6. THE Player SHALL have rounded corners via CSS and be centered horizontally within the viewport.

---

### Requirement 7: Branding Block

**User Story:** As an organization deploying this for an event, I want to optionally show my organization name and logo on the page, so that attendees know who is presenting the content.

#### Acceptance Criteria

1. WHEN `CONFIG.showBranding` is `true`, THE Branding_Block SHALL be visible on the Video_Page.
2. WHEN `CONFIG.showBranding` is `false`, THE Branding_Block SHALL be hidden.
3. WHEN `CONFIG.logoUrl` is a non-empty string, THE Branding_Block SHALL display the logo image using that URL.
4. WHEN `CONFIG.logoUrl` is an empty string, THE Branding_Block SHALL NOT render an `<img>` element for the logo.
5. THE Branding_Block SHALL display `CONFIG.organizationName` as text.
6. THE Branding_Block SHALL be styled minimally so that the Player remains the primary visual focus of the page.

---

### Requirement 8: Accessibility

**User Story:** As a user with accessibility needs, I want the video player and interactive controls to be operable via keyboard and assistive technology, so that I can use the application regardless of how I interact with my device.

#### Acceptance Criteria

1. THE Play_Overlay button SHALL have an `aria-label` attribute with a descriptive value.
2. THE Retry button SHALL have an `aria-label` attribute with a descriptive value.
3. ALL interactive elements SHALL be reachable and activatable via keyboard Tab and Enter/Space navigation.
4. ALL interactive elements SHALL have visible focus states via CSS `:focus-visible` styling.
5. THE Video_Page SHALL have sufficient color contrast between text and background meeting WCAG 2.1 AA contrast ratios.
6. THE Player SHALL include a `title` attribute to provide an accessible name for the video element.

---

### Requirement 9: QR Code Generator Page

**User Story:** As an event organizer, I want a simple admin page where I can enter the video page URL and download a high-resolution QR code, so that I can print or display it at an event.

#### Acceptance Criteria

1. THE QR_Generator SHALL be a standalone HTML page (`qr-generator.html`) that operates independently of the Video_Page.
2. THE QR_Generator SHALL provide a text input field for the user to enter any URL.
3. WHEN the user clicks the "Generate QR" button, THE QR_Generator SHALL render a QR code for the entered URL.
4. THE QR_Generator SHALL use a lightweight client-side QR code library and SHALL NOT send the URL to any external server.
5. THE generated QR code SHALL have a white background, sufficient quiet-zone padding, and sufficient module size to be scannable when printed.
6. THE QR_Generator SHALL provide a "Download PNG" button that saves the QR code as a `.png` file to the user's device.
7. IF the URL input field is empty when the Generate button is clicked, THEN THE QR_Generator SHALL display a validation message and SHALL NOT render a QR code.

---

### Requirement 10: Performance

**User Story:** As a user on a mobile network, I want the page to load as fast as possible, so that I am not waiting for the application to become interactive after scanning the QR code.

#### Acceptance Criteria

1. THE Video_Page SHALL NOT load any JavaScript framework or CSS framework (e.g., React, Vue, Bootstrap, Tailwind CDN).
2. THE Video_Page SHALL be implemented in pure HTML, CSS, and Vanilla JavaScript only.
3. THE Player SHALL use `preload="metadata"` by default so only video metadata is fetched on page load, not the full video file.
4. THE Video_Page SHALL have no more than three external resource requests on initial load (excluding the video source itself).
5. THE QR_Generator MAY load one lightweight external QR library via CDN for QR code rendering.

---

### Requirement 11: Security

**User Story:** As a developer deploying this application, I want the frontend code to contain no API keys, personal data collection, or third-party tracking, so that user privacy is protected and the site cannot be exploited.

#### Acceptance Criteria

1. THE Video_Page SHALL NOT contain any API keys, secret tokens, or credentials in the source code.
2. THE Video_Page SHALL NOT collect, store, or transmit any personally identifiable information.
3. THE Video_Page SHALL NOT include any analytics scripts, advertising SDKs, or third-party tracking pixels.
4. THE `CONFIG.videoUrl` SHALL be a direct HTTPS URL to a video file and SHALL NOT be a URL to an advertising-supported platform page.
5. THE Video_Page SHALL be compatible with HTTPS delivery to prevent mixed-content browser warnings.

---

### Requirement 12: Deployment Compatibility

**User Story:** As a developer, I want the project to deploy without build steps to major static hosting platforms, so that I can host it quickly and at low cost.

#### Acceptance Criteria

1. THE project SHALL consist entirely of static files (HTML, CSS, JS, assets) with no server-side runtime requirements.
2. THE project SHALL be deployable to Cloudflare Pages, GitHub Pages, Netlify, and Vercel without a build step.
3. THE project SHALL include a `README.md` with sections covering: local setup, deployment to Cloudflare Pages, video URL replacement instructions, video hosting recommendations, and QR code generation instructions.
4. THE project structure SHALL follow the layout: `index.html`, `video.html`, `style.css`, `script.js`, `qr-generator.html`, `qr-generator.js`, `assets/`, `README.md`.

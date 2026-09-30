/**
 * Property-based tests for QR Video Player
 * Uses fast-check for generative testing.
 * Each property runs a minimum of 100 iterations.
 */

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const scriptContent = fs.readFileSync(path.join(rootDir, "script.js"), "utf-8");
const qrGeneratorContent = fs.readFileSync(path.join(rootDir, "qr-generator.js"), "utf-8");
const videoHtml = fs.readFileSync(path.join(rootDir, "video.html"), "utf-8");

// Helper: create a fresh video player DOM with script.js executed inside it
function createVideoDOM() {
  const dom = new JSDOM(videoHtml, { runScripts: "dangerously" });
  const { window } = dom;
  // Prevent DOMContentLoaded auto-init from running by removing the listener
  // by executing the script which registers it — we'll call init manually
  const scriptEl = window.document.createElement("script");
  scriptEl.textContent = scriptContent;
  window.document.body.appendChild(scriptEl);
  return dom;
}

// Helper: create a fresh QR generator DOM with qr-generator.js executed
function createQRDOM() {
  // Minimal QR generator HTML (no CDN script — we mock QRCode)
  const qrHtml = `<!DOCTYPE html><html><body>
    <input type="url" id="url-input">
    <button id="generate-btn" type="button">Generate QR</button>
    <p id="validation-msg"></p>
    <div id="qr-container"></div>
    <button id="download-btn" type="button" style="display:none">Download PNG</button>
  </body></html>`;
  const dom = new JSDOM(qrHtml, { runScripts: "dangerously" });
  const { window } = dom;
  // Mock QRCode library
  window.QRCode = {
    toCanvas: function(url, opts, cb) {
      const canvas = window.document.createElement("canvas");
      cb(null, canvas);
    }
  };
  const scriptEl = window.document.createElement("script");
  scriptEl.textContent = qrGeneratorContent;
  window.document.body.appendChild(scriptEl);
  return dom;
}

// ─── Property 1: video.src matches CONFIG.videoUrl after initPlayer() ─────────

describe("Property 1: video.src matches CONFIG.videoUrl after initPlayer()", () => {
  // Feature: qr-video-player, Property 1: For any valid URL string, after initPlayer(), video.src equals CONFIG.videoUrl
  it("holds for arbitrary HTTPS URLs", () => {
    fc.assert(
      fc.property(
        fc.webUrl({ validSchemes: ["https"] }),
        (url) => {
          const dom = createVideoDOM();
          const { window } = dom;
          window.CONFIG.videoUrl = url;
          window.initPlayer();
          // getAttribute returns the raw value set by script; .src may be normalized
          const rawSrc = window.document.getElementById("player").getAttribute("src");
          expect(rawSrc).toBe(url);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 2: autoplay attribute applied when CONFIG.autoplay is true ──────

describe("Property 2: autoplay+muted attributes applied when CONFIG.autoplay is true", () => {
  // Feature: qr-video-player, Property 2: For any CONFIG with autoplay:true, autoplay and muted attributes are present after initPlayer()
  it("holds for any CONFIG with autoplay:true", () => {
    fc.assert(
      fc.property(
        fc.record({
          videoUrl: fc.constant("https://example.com/video.mp4"),
          title: fc.string(),
          autoplay: fc.constant(true),
          muted: fc.boolean(),
          loop: fc.boolean(),
          showBranding: fc.boolean(),
          organizationName: fc.string(),
          logoUrl: fc.constant(""),
        }),
        (config) => {
          const dom = createVideoDOM();
          const { window } = dom;
          Object.assign(window.CONFIG, config);
          window.initPlayer();
          const video = window.document.getElementById("player");
          expect(video.hasAttribute("autoplay")).toBe(true);
          expect(video.hasAttribute("muted")).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 3: loop attribute applied when CONFIG.loop is true ──────────────

describe("Property 3: loop attribute applied when CONFIG.loop is true", () => {
  // Feature: qr-video-player, Property 3: For any CONFIG with loop:true, loop attribute is present after initPlayer()
  it("holds for any CONFIG with loop:true", () => {
    fc.assert(
      fc.property(
        fc.record({
          videoUrl: fc.constant("https://example.com/video.mp4"),
          title: fc.string(),
          autoplay: fc.boolean(),
          muted: fc.boolean(),
          loop: fc.constant(true),
          showBranding: fc.boolean(),
          organizationName: fc.string(),
          logoUrl: fc.constant(""),
        }),
        (config) => {
          const dom = createVideoDOM();
          const { window } = dom;
          Object.assign(window.CONFIG, config);
          window.initPlayer();
          const video = window.document.getElementById("player");
          expect(video.hasAttribute("loop")).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 4: Play_Overlay visibility is inverse of autoplay success ───────

describe("Property 4: Play_Overlay visibility matches autoplay rejection", () => {
  // Feature: qr-video-player, Property 4: For any CONFIG with autoplay:true, Play_Overlay is shown iff play() rejects
  it("overlay hidden on resolve, shown on reject", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.boolean(), // true = play resolves, false = play rejects
        async (resolves) => {
          const dom = createVideoDOM();
          const { window } = dom;
          window.CONFIG.autoplay = true;
          const video = window.document.getElementById("player");
          video.play = resolves
            ? () => Promise.resolve()
            : () => Promise.reject(new Error("blocked"));
          window.initPlayer();
          // Trigger canplay manually to invoke handleAutoplay
          const canplayEvent = new window.Event("canplay");
          video.dispatchEvent(canplayEvent);
          // Wait for promise microtasks
          await new Promise((resolve) => setTimeout(resolve, 10));
          const overlay = window.document.getElementById("play-overlay");
          if (resolves) {
            expect(overlay.hasAttribute("hidden")).toBe(true);
          } else {
            expect(overlay.hasAttribute("hidden")).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 5: Play_Overlay button click calls play() and hides overlay ─────

describe("Property 5: Play_Overlay tap triggers playback and hides overlay", () => {
  // Feature: qr-video-player, Property 5: For any Play_Overlay-visible state, button click calls play() and hides overlay
  it("play() called and overlay hidden on button click", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(true), // overlay is visible
        async () => {
          const dom = createVideoDOM();
          const { window } = dom;
          let playCalled = false;
          const video = window.document.getElementById("player");
          video.play = () => { playCalled = true; return Promise.resolve(); };
          window.initPlayer();
          // Make overlay visible
          window.showPlayOverlay();
          // Click the play button
          window.document.getElementById("play-btn").click();
          await new Promise((resolve) => setTimeout(resolve, 10));
          expect(playCalled).toBe(true);
          const overlay = window.document.getElementById("play-overlay");
          expect(overlay.hasAttribute("hidden")).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 6: canplay event hides Loading_Screen ──────────────────────────

describe("Property 6: canplay event hides Loading_Screen", () => {
  // Feature: qr-video-player, Property 6: Firing canplay in any loading state hides Loading_Screen
  it("Loading_Screen hidden after canplay fires", () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const dom = createVideoDOM();
          const { window } = dom;
          window.CONFIG.autoplay = false; // skip autoplay to isolate canplay
          window.initPlayer();
          window.showLoadingScreen();
          const video = window.document.getElementById("player");
          const canplayEvent = new window.Event("canplay");
          video.dispatchEvent(canplayEvent);
          const loadingScreen = window.document.getElementById("loading-screen");
          expect(loadingScreen.hasAttribute("hidden")).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 7: error event hides Loading_Screen and shows Error_State ───────

describe("Property 7: error event triggers error state", () => {
  // Feature: qr-video-player, Property 7: Firing error in any loading state hides Loading_Screen and shows Error_State
  it("Loading_Screen hidden and Error_State visible after error fires", () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const dom = createVideoDOM();
          const { window } = dom;
          window.initPlayer();
          window.showLoadingScreen();
          const video = window.document.getElementById("player");
          const errorEvent = new window.Event("error");
          video.dispatchEvent(errorEvent);
          const loadingScreen = window.document.getElementById("loading-screen");
          const errorState = window.document.getElementById("error-state");
          expect(loadingScreen.hasAttribute("hidden")).toBe(true);
          expect(errorState.hasAttribute("hidden")).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 8: Retry reassigns src and does not call location.reload ────────

describe("Property 8: Retry resets video source without full page reload", () => {
  // Feature: qr-video-player, Property 8: In any error state, Retry click reassigns video.src and does not call window.location.reload
  it("video.src reassigned; location.reload not called", () => {
    fc.assert(
      fc.property(
        fc.webUrl({ validSchemes: ["https"] }),
        (url) => {
          // Build the DOM without executing script.js yet so we can set up the
          // reload spy before the script wires up event listeners.
          const dom = new JSDOM(videoHtml, { runScripts: "dangerously" });
          const { window } = dom;

          // Mock video.play() to avoid jsdom not-implemented errors
          const videoEl = window.document.getElementById("player");
          videoEl.play = () => Promise.resolve();

          // Spy on reload by replacing the whole location object before the
          // script runs (jsdom location.reload is non-configurable after init).
          let reloadCalled = false;
          // jsdom allows replacing window.location via the Window constructor
          // internals — use a simple wrapping approach that tracks the call.
          const originalLocation = window.location;
          window.__reloadSpy = () => { reloadCalled = true; };
          // Patch via script injection so the spy is in the same realm
          const spyScript = window.document.createElement("script");
          spyScript.textContent = `
            (function() {
              var orig = window.location.reload.bind(window.location);
              Object.defineProperty(window.location, 'reload', {
                configurable: true,
                writable: true,
                value: function() { window.__reloadSpy(); orig(); }
              });
            })();
          `;
          window.document.body.appendChild(spyScript);

          // Now inject script.js
          const s = window.document.createElement("script");
          s.textContent = scriptContent;
          window.document.body.appendChild(s);

          window.CONFIG.videoUrl = url;
          window.initPlayer();
          window.showErrorState();
          window.document.getElementById("retry-btn").click();

          const video = window.document.getElementById("player");
          expect(video.getAttribute("src")).toBe(url);
          expect(reloadCalled).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 9: Branding visibility matches CONFIG.showBranding ──────────────

describe("Property 9: Branding visibility matches CONFIG.showBranding", () => {
  // Feature: qr-video-player, Property 9: For any CONFIG, Branding_Block is visible iff showBranding is true
  it("branding hidden/visible matches showBranding", () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (showBranding) => {
          const dom = createVideoDOM();
          const { window } = dom;
          window.CONFIG.showBranding = showBranding;
          window.CONFIG.logoUrl = "";
          window.initBranding();
          const brandingEl = window.document.getElementById("branding");
          if (showBranding) {
            expect(brandingEl.hasAttribute("hidden")).toBe(false);
          } else {
            expect(brandingEl.hasAttribute("hidden")).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 10: img presence matches non-empty logoUrl ─────────────────────

describe("Property 10: Logo img rendered iff logoUrl is non-empty", () => {
  // Feature: qr-video-player, Property 10: For any CONFIG, img is present iff logoUrl is non-empty
  it("img created for non-empty logoUrl, absent for empty", () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.constant(""), fc.webUrl({ validSchemes: ["https"] })),
        (logoUrl) => {
          const dom = createVideoDOM();
          const { window } = dom;
          window.CONFIG.showBranding = true;
          window.CONFIG.logoUrl = logoUrl;
          window.initBranding();
          const logoWrapper = window.document.getElementById("branding-logo-wrapper");
          const img = logoWrapper.querySelector("img");
          if (logoUrl !== "") {
            expect(img).not.toBeNull();
          } else {
            expect(img).toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 11: organizationName text appears in Branding_Block ─────────────

describe("Property 11: organizationName text appears in Branding_Block", () => {
  // Feature: qr-video-player, Property 11: For any organizationName with showBranding:true, text appears in Branding_Block
  it("org name is in branding text content", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (orgName) => {
          const dom = createVideoDOM();
          const { window } = dom;
          window.CONFIG.showBranding = true;
          window.CONFIG.logoUrl = "";
          window.CONFIG.organizationName = orgName;
          window.initBranding();
          const brandingEl = window.document.getElementById("branding");
          expect(brandingEl.textContent).toContain(orgName);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 12: QR rendered for any non-empty URL ──────────────────────────

describe("Property 12: QR code rendered for any non-empty URL input", () => {
  // Feature: qr-video-player, Property 12: For any non-empty URL string, Generate click results in a rendered child in QR container
  it("qr-container has a child after generate click with non-empty URL", () => {
    fc.assert(
      fc.property(
        fc.webUrl({ validSchemes: ["https"] }),
        (url) => {
          const dom = createQRDOM();
          const { window } = dom;
          const input = window.document.getElementById("url-input");
          input.value = url;
          window.document.getElementById("generate-btn").click();
          const container = window.document.getElementById("qr-container");
          expect(container.children.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 13: Empty/whitespace URL prevents QR generation ────────────────

describe("Property 13: Empty/whitespace URL prevents QR generation", () => {
  // Feature: qr-video-player, Property 13: For any empty/whitespace URL string, Generate click does not render QR and shows validation message
  it("no QR rendered and validation message shown for empty/whitespace input", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("", " ", "   ", "\t", "\n", "  \t  "),
        (emptyUrl) => {
          const dom = createQRDOM();
          const { window } = dom;
          const input = window.document.getElementById("url-input");
          input.value = emptyUrl;
          window.document.getElementById("generate-btn").click();
          const container = window.document.getElementById("qr-container");
          const validationMsg = window.document.getElementById("validation-msg");
          expect(container.children.length).toBe(0);
          expect(validationMsg.textContent.trim().length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

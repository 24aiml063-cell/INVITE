/**
 * Unit tests for QR Video Player
 * Tests DOM structure, accessibility, content, and CONFIG.
 */

import { describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadHTML(filename) {
  const html = fs.readFileSync(path.join(rootDir, filename), "utf-8");
  return new JSDOM(html);
}

// ─── 6.2 video.html: <video> attributes ──────────────────────────────────────

describe("video.html – <video> element attributes", () => {
  const dom = loadHTML("video.html");
  const video = dom.window.document.querySelector("video#player");

  it("has the controls attribute", () => {
    expect(video).not.toBeNull();
    expect(video.hasAttribute("controls")).toBe(true);
  });

  it("has the playsinline attribute", () => {
    expect(video.hasAttribute("playsinline")).toBe(true);
  });

  it('has preload="metadata"', () => {
    expect(video.getAttribute("preload")).toBe("metadata");
  });
});

// ─── 6.3 Accessibility attributes ────────────────────────────────────────────

describe("video.html – accessibility attributes", () => {
  const dom = loadHTML("video.html");
  const doc = dom.window.document;

  it("Play_Overlay button has aria-label", () => {
    const playBtn = doc.querySelector("#play-btn");
    expect(playBtn).not.toBeNull();
    const label = playBtn.getAttribute("aria-label");
    expect(label).toBeTruthy();
    expect(label.length).toBeGreaterThan(0);
  });

  it("Retry button has aria-label", () => {
    const retryBtn = doc.querySelector("#retry-btn");
    expect(retryBtn).not.toBeNull();
    const label = retryBtn.getAttribute("aria-label");
    expect(label).toBeTruthy();
    expect(label.length).toBeGreaterThan(0);
  });

  it("video element has title attribute", () => {
    const video = doc.querySelector("video#player");
    expect(video).not.toBeNull();
    const title = video.getAttribute("title");
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });
});

// ─── 6.4 Loading_Screen text ─────────────────────────────────────────────────

describe("video.html – Loading_Screen", () => {
  const dom = loadHTML("video.html");
  const loadingScreen = dom.window.document.querySelector("#loading-screen");

  it("contains 'Loading video...' text", () => {
    expect(loadingScreen).not.toBeNull();
    expect(loadingScreen.textContent).toContain("Loading video...");
  });
});

// ─── 6.5 Error_State content ─────────────────────────────────────────────────

describe("video.html – Error_State", () => {
  const dom = loadHTML("video.html");
  const errorState = dom.window.document.querySelector("#error-state");

  it("contains 'Unable to load video.' text", () => {
    expect(errorState).not.toBeNull();
    expect(errorState.textContent).toContain("Unable to load video.");
  });

  it("contains sub-message text about checking internet connection", () => {
    expect(errorState.textContent).toContain(
      "Please check your internet connection or try again."
    );
  });
});

// ─── 6.6 No <iframe> elements in video.html ──────────────────────────────────

describe("video.html – no iframes", () => {
  const dom = loadHTML("video.html");

  it("contains no <iframe> elements", () => {
    const iframes = dom.window.document.querySelectorAll("iframe");
    expect(iframes.length).toBe(0);
  });
});

// ─── 6.7 No framework/analytics/tracking scripts in video.html ───────────────

describe("video.html – no tracking or framework scripts", () => {
  const html = fs.readFileSync(path.join(rootDir, "video.html"), "utf-8");
  const dom = new JSDOM(html);
  const scripts = Array.from(dom.window.document.querySelectorAll("script[src]"));
  const srcs = scripts.map((s) => s.getAttribute("src").toLowerCase());

  const trackingDomains = [
    "google-analytics",
    "googletagmanager",
    "gtag",
    "facebook",
    "hotjar",
    "mixpanel",
    "segment",
  ];

  const frameworkDomains = [
    "react",
    "vue",
    "bootstrap",
    "tailwind",
    "angular",
    "jquery",
  ];

  trackingDomains.forEach((domain) => {
    it(`does not include a tracking script containing "${domain}"`, () => {
      const found = srcs.some((src) => src.includes(domain));
      expect(found).toBe(false);
    });
  });

  frameworkDomains.forEach((domain) => {
    it(`does not include a framework/CDN script containing "${domain}"`, () => {
      const found = srcs.some((src) => src.includes(domain));
      expect(found).toBe(false);
    });
  });
});

// ─── 6.8 QR Generator page DOM elements ──────────────────────────────────────

describe("qr-generator.html – required DOM elements", () => {
  const dom = loadHTML("qr-generator.html");
  const doc = dom.window.document;

  it("has a URL input field", () => {
    const input = doc.querySelector("#url-input");
    expect(input).not.toBeNull();
  });

  it("has a Generate button", () => {
    const generateBtn = doc.querySelector("#generate-btn");
    expect(generateBtn).not.toBeNull();
  });

  it("has a Download button", () => {
    const downloadBtn = doc.querySelector("#download-btn");
    expect(downloadBtn).not.toBeNull();
  });
});

// ─── 6.9 CONFIG object keys in script.js ─────────────────────────────────────

describe("script.js – CONFIG object", () => {
  const scriptContent = fs.readFileSync(path.join(rootDir, "script.js"), "utf-8");

  it("defines a CONFIG object", () => {
    expect(scriptContent).toContain("const CONFIG = {");
  });

  const requiredKeys = [
    "videoUrl",
    "title",
    "autoplay",
    "muted",
    "loop",
    "showBranding",
    "organizationName",
    "logoUrl",
  ];

  requiredKeys.forEach((key) => {
    it(`CONFIG contains the key "${key}"`, () => {
      // Match "key:" or "key :" pattern as it appears in an object literal
      const pattern = new RegExp(`\\b${key}\\s*:`);
      expect(pattern.test(scriptContent)).toBe(true);
    });
  });
});

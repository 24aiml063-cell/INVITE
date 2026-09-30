// ============================================================
// CONFIG — Edit this object to configure the video player.
// This is the sole location for all runtime configuration.
// ============================================================
const CONFIG = {
  videoUrl: "INVITATION.mp4",
  title: "Invitation",
  autoplay: true,
  muted: true,
  loop: false,
  showBranding: true,
  organizationName: "Acme Corp",
  logoUrl: "assets/logo.png"
};

// ============================================================
// Element references
// ============================================================
const video         = document.getElementById("player");
const loadingScreen = document.getElementById("loading-screen");
const playOverlay   = document.getElementById("play-overlay");
const playBtn       = document.getElementById("play-btn");
const errorState    = document.getElementById("error-state");
const retryBtn      = document.getElementById("retry-btn");
const branding      = document.getElementById("branding");
const brandingLogo  = document.getElementById("branding-logo-wrapper");
const brandingName  = document.getElementById("branding-name");

// ============================================================
// Visibility helpers (exposed globally for testability)
// ============================================================
function showLoadingScreen() {
  loadingScreen.removeAttribute("hidden");
}

function hideLoadingScreen() {
  loadingScreen.setAttribute("hidden", "");
}

function showPlayOverlay() {
  playOverlay.removeAttribute("hidden");
  playOverlay.setAttribute("aria-hidden", "false");
}

function hidePlayOverlay() {
  playOverlay.setAttribute("hidden", "");
  playOverlay.setAttribute("aria-hidden", "true");
}

function showErrorState() {
  errorState.removeAttribute("hidden");
}

function hideErrorState() {
  errorState.setAttribute("hidden", "");
}

// ============================================================
// initPlayer — sets up the video element from CONFIG
// ============================================================
function initPlayer() {
  // Set accessible title dynamically from CONFIG
  video.title = CONFIG.title;
  video.setAttribute("aria-label", CONFIG.title);

  // Apply optional boolean attributes only when true
  if (CONFIG.autoplay) {
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");   // muted is required for autoplay in most browsers
    video.muted = true;                 // also set the property (some browsers need this)
  }

  if (CONFIG.loop) {
    video.setAttribute("loop", "");
  }

  // Set the video source — triggers the network request
  video.src = CONFIG.videoUrl;

  // canplay: video is ready to play without buffering the full file
  video.addEventListener("canplay", function onCanPlay() {
    hideLoadingScreen();

    if (CONFIG.autoplay) {
      handleAutoplay();
    } else {
      showPlayOverlay();
    }
  }, { once: true });

  // error: network failure, unsupported format, missing file, etc.
  video.addEventListener("error", function onError() {
    hideLoadingScreen();
    showErrorState();
  });
}

// ============================================================
// handleAutoplay — attempt programmatic play, show overlay on rejection
// ============================================================
function handleAutoplay() {
  const playPromise = video.play();

  if (playPromise !== undefined) {
    playPromise
      .then(function () {
        hidePlayOverlay();
      })
      .catch(function () {
        // Browser blocked autoplay — show the tap-to-play overlay
        showPlayOverlay();
      });
  }
}

// ============================================================
// Play_Overlay button — tap to start playback
// ============================================================
playBtn.addEventListener("click", function () {
  video.play().then(function () {
    hidePlayOverlay();
  }).catch(function () {
    // If play still fails (e.g., no source), keep the overlay visible
  });
});

// ============================================================
// handleRetry — reload video without a full page refresh
// ============================================================
function handleRetry() {
  hideErrorState();
  showLoadingScreen();

  // Clear src, then reassign to trigger a fresh network request
  video.src = "";
  video.src = CONFIG.videoUrl;
}

retryBtn.addEventListener("click", handleRetry);

// ============================================================
// initBranding — conditionally render the Branding_Block
// ============================================================
function initBranding() {
  if (!CONFIG.showBranding) {
    branding.setAttribute("hidden", "");
    return;
  }

  // Show branding block
  branding.removeAttribute("hidden");

  // Render logo only when logoUrl is a non-empty string
  if (CONFIG.logoUrl && CONFIG.logoUrl.trim() !== "") {
    const img = document.createElement("img");
    img.src = CONFIG.logoUrl;
    img.alt = CONFIG.organizationName || "Organization logo";

    // Silently hide the image if it 404s
    img.addEventListener("error", function () {
      img.setAttribute("hidden", "");
    });

    brandingLogo.appendChild(img);
  }

  // Set the organization name text
  brandingName.textContent = CONFIG.organizationName;
}

// ============================================================
// Accessibility: ensure aria-label on interactive elements
// ============================================================
if (!playBtn.getAttribute("aria-label")) {
  playBtn.setAttribute("aria-label", "Tap to play the video");
}

if (!retryBtn.getAttribute("aria-label")) {
  retryBtn.setAttribute("aria-label", "Retry loading the video");
}

// ============================================================
// Bootstrap on DOMContentLoaded
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  showLoadingScreen();
  initPlayer();
  initBranding();
});

// ============================================================
// Expose functions globally for testability
// ============================================================
window.initPlayer        = initPlayer;
window.handleAutoplay    = handleAutoplay;
window.handleRetry       = handleRetry;
window.initBranding      = initBranding;
window.showLoadingScreen = showLoadingScreen;
window.hideLoadingScreen = hideLoadingScreen;
window.showPlayOverlay   = showPlayOverlay;
window.hidePlayOverlay   = hidePlayOverlay;
window.showErrorState    = showErrorState;
window.hideErrorState    = hideErrorState;
window.CONFIG            = CONFIG;

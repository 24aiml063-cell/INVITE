/**
 * qr-generator.js
 * QR code generator logic for qr-generator.html.
 * All client-side only — no external server calls.
 */

/**
 * Validates the URL input and renders a QR code into #qr-container.
 * Shows #download-btn after a successful render.
 * Displays a validation message if the input is empty or whitespace-only.
 */
function generateQR() {
  var input = document.getElementById("url-input");
  var validationMsg = document.getElementById("validation-msg");
  var qrContainer = document.getElementById("qr-container");
  var downloadBtn = document.getElementById("download-btn");

  if (input.value.trim() === "") {
    validationMsg.textContent = "Please enter a URL.";
    return;
  }

  // Clear validation message and previous QR code
  validationMsg.textContent = "";
  qrContainer.innerHTML = "";

  QRCode.toCanvas(
    input.value.trim(),
    { width: 256, margin: 2 },
    function (error, canvas) {
      if (error) {
        validationMsg.textContent = "Failed to generate QR code. Please try again.";
        return;
      }
      qrContainer.appendChild(canvas);
      downloadBtn.style.display = "";
    }
  );
}

/**
 * Converts the rendered QR canvas to a PNG data URL and triggers a download.
 */
function downloadQR() {
  var qrContainer = document.getElementById("qr-container");
  var canvas = qrContainer.querySelector("canvas");

  if (!canvas) {
    return;
  }

  var dataUrl = canvas.toDataURL("image/png");
  var anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = "qr-code.png";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

// Wire up button click handlers
document.getElementById("generate-btn").addEventListener("click", generateQR);
document.getElementById("download-btn").addEventListener("click", downloadQR);

// Expose functions on window for testability
window.generateQR = generateQR;
window.downloadQR = downloadQR;

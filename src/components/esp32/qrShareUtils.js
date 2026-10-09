/**
 * QR Code Sharing Utilities for InnoIDE Companion App
 * Handles:
 * - Converting QR Code SVG to high-resolution PNG Canvas
 * - Copying QR Code image to system clipboard (ClipboardItem image/png)
 * - Downloading QR Code as PNG or SVG
 * - Native OS Web Share API integration
 * - Messaging links (WhatsApp, Telegram, Email)
 */

/**
 * Find the SVG element representing the QR code inside a container
 * @param {HTMLElement|string} target Container element or DOM ID
 * @returns {SVGElement|null}
 */
export function getQrSvgElement(target) {
  if (!target) {
    target = document.getElementById("publish-companion-qr-container");
  } else if (typeof target === "string") {
    target = document.getElementById(target);
  }
  if (!target) return null;
  if (target.tagName?.toLowerCase() === "svg") return target;
  return target.querySelector("svg");
}

/**
 * Render a high-resolution Canvas containing the QR code with InnoIDE branding & metadata
 * @param {Object} options
 * @param {SVGElement} options.svgElement
 * @param {string} options.projectName
 * @param {string} options.modeLabel
 * @param {string} options.detailText
 * @param {number} [options.scale=2]
 * @returns {Promise<HTMLCanvasElement>}
 */
export function renderQrCanvas({
  svgElement,
  projectName = "Companion App",
  modeLabel = "Multi-Device Remote",
  detailText = "",
  scale = 2
}) {
  return new Promise((resolve, reject) => {
    if (!svgElement) {
      return reject(new Error("QR SVG element not found"));
    }

    try {
      // Serialize SVG with proper XML namespace
      let svgXml = new XMLSerializer().serializeToString(svgElement);
      if (!svgXml.includes("xmlns=")) {
        svgXml = svgXml.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      const svgBlob = new Blob([svgXml], { type: "image/svg+xml;charset=utf-8" });
      const blobUrl = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        try {
          const qrBaseSize = 280;
          const qrWidth = qrBaseSize * scale;
          const qrHeight = qrBaseSize * scale;

          const padding = 24 * scale;
          const headerHeight = 72 * scale;
          const footerHeight = detailText ? 56 * scale : 40 * scale;

          const totalWidth = qrWidth + padding * 2;
          const totalHeight = qrHeight + padding * 2 + headerHeight + footerHeight;

          const canvas = document.createElement("canvas");
          canvas.width = totalWidth;
          canvas.height = totalHeight;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            URL.revokeObjectURL(blobUrl);
            return reject(new Error("Canvas 2D context unavailable"));
          }

          // 1. Crisp White Background
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, totalWidth, totalHeight);

          // 2. Top Accent Gradient Banner
          const gradient = ctx.createLinearGradient(0, 0, totalWidth, 0);
          gradient.addColorStop(0, "#06B6D4"); // Cyan
          gradient.addColorStop(0.5, "#3B82F6"); // Blue
          gradient.addColorStop(1, "#8B5CF6"); // Purple
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, totalWidth, 6 * scale);

          // 3. Header: Title & Project Name
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          ctx.fillStyle = "#0F172A";
          ctx.font = `bold ${16 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          const displayTitle = projectName ? `InnoIDE • ${projectName}` : "InnoIDE Companion App";
          ctx.fillText(displayTitle, totalWidth / 2, 28 * scale);

          // Mode & Subtitle Badge
          ctx.fillStyle = "#64748B";
          ctx.font = `600 ${11 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          ctx.fillText(`● ${modeLabel.toUpperCase()}`, totalWidth / 2, 48 * scale);

          // Subtle divider line
          ctx.strokeStyle = "#E2E8F0";
          ctx.lineWidth = 1 * scale;
          ctx.beginPath();
          ctx.moveTo(padding, headerHeight);
          ctx.lineTo(totalWidth - padding, headerHeight);
          ctx.stroke();

          // 4. Center QR Code Frame
          const qrX = padding;
          const qrY = headerHeight + padding;

          // Draw subtle frame around QR
          ctx.fillStyle = "#F8FAFC";
          ctx.fillRect(qrX - 4 * scale, qrY - 4 * scale, qrWidth + 8 * scale, qrHeight + 8 * scale);
          ctx.strokeStyle = "#CBD5E1";
          ctx.lineWidth = 1 * scale;
          ctx.strokeRect(qrX - 4 * scale, qrY - 4 * scale, qrWidth + 8 * scale, qrHeight + 8 * scale);

          // Draw the QR Image
          ctx.drawImage(img, qrX, qrY, qrWidth, qrHeight);

          // 5. Footer Content
          const footerStartY = qrY + qrHeight + 16 * scale;

          if (detailText) {
            ctx.fillStyle = "#334155";
            ctx.font = `500 ${10 * scale}px monospace`;
            // Truncate long URLs gracefully
            const maxLen = 48;
            const truncated = detailText.length > maxLen ? detailText.slice(0, maxLen) + "…" : detailText;
            ctx.fillText(truncated, totalWidth / 2, footerStartY + 10 * scale);
          }

          ctx.fillStyle = "#94A3B8";
          ctx.font = `500 ${9 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          ctx.fillText("Scan with Phone Camera or InnoIDE Companion Scanner", totalWidth / 2, totalHeight - 16 * scale);

          URL.revokeObjectURL(blobUrl);
          resolve(canvas);
        } catch (err) {
          URL.revokeObjectURL(blobUrl);
          reject(err);
        }
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(blobUrl);
        reject(err);
      };

      img.src = blobUrl;
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Copy the rendered QR Code as a PNG image to the system clipboard
 * @param {Object} params
 * @returns {Promise<boolean>}
 */
export async function copyQrImageToClipboard(params) {
  const canvas = await renderQrCanvas(params);
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        return reject(new Error("Failed to create PNG blob from canvas"));
      }
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);
          resolve(true);
        } else {
          reject(new Error("Clipboard image writing not supported by browser/environment"));
        }
      } catch (err) {
        reject(err);
      }
    }, "image/png");
  });
}

/**
 * Trigger download of the QR code as PNG image
 * @param {Object} params
 * @param {string} [params.fileName]
 */
export async function downloadQrImagePng(params) {
  const canvas = await renderQrCanvas(params);
  const fileName = params.fileName || `${(params.projectName || "companion").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-qr.png`;

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("Could not create PNG blob"));
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve(true);
    }, "image/png");
  });
}

/**
 * Trigger download of the raw vector SVG of the QR code
 * @param {SVGElement} svgElement
 * @param {string} [fileName]
 */
export function downloadQrImageSvg(svgElement, fileName = "companion-qr.svg") {
  if (!svgElement) throw new Error("SVG element not found");
  let svgXml = new XMLSerializer().serializeToString(svgElement);
  if (!svgXml.includes("xmlns=")) {
    svgXml = svgXml.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  const blob = new Blob([svgXml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

/**
 * Format a rich, readable share message containing project details and companion link
 */
export function buildShareMessage({
  projectName = "My Project",
  qrPayloadMode = "webapp",
  companionNetworkMode = "local",
  activeQrPayload = "",
  webAppQrPayload = "",
  widgetsCount = 0,
  rulesCount = 0
}) {
  const isCloud = companionNetworkMode === "cloud";
  const isBundle = qrPayloadMode === "bundle";

  if (isBundle) {
    return (
      `📦 InnoIDE Companion Bundle: ${projectName}\n` +
      `Components: ${widgetsCount} UI Widgets • ${rulesCount} Logic Rules\n\n` +
      `Scan the QR code in your InnoIDE companion scanner to import this complete project layout.`
    );
  }

  const url = webAppQrPayload || activeQrPayload;
  const networkDesc = isCloud
    ? "Cloud Remote (Works worldwide over 4G/5G mobile cellular & Wi-Fi)"
    : "Local Wi-Fi (Connect smartphone to same local Wi-Fi router)";

  return (
    `🚀 InnoIDE Companion Web App: ${projectName}\n` +
    `📱 Connect Link: ${url}\n` +
    `🌐 Network: ${networkDesc}\n\n` +
    `Scan the QR code with your phone camera or click the link to control the hardware instantly!`
  );
}

/**
 * Share via Native Web Share API if supported
 */
export async function shareViaNativeApi({
  projectName,
  shareText,
  shareUrl,
  svgElement,
  modeLabel
}) {
  if (!navigator.share) {
    return { success: false, reason: "unsupported" };
  }

  // Attempt to attach PNG file if canvas rendering succeeds and files sharing is supported
  let fileToShare = null;
  if (svgElement && navigator.canShare) {
    try {
      const canvas = await renderQrCanvas({
        svgElement,
        projectName,
        modeLabel,
        detailText: shareUrl
      });
      const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
      if (blob) {
        const fileName = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-qr.png`;
        const testFile = new File([blob], fileName, { type: "image/png" });
        if (navigator.canShare({ files: [testFile] })) {
          fileToShare = testFile;
        }
      }
    } catch {
      // Fallback to text/url sharing
    }
  }

  const shareData = {
    title: `InnoIDE Companion - ${projectName}`,
    text: shareText
  };

  if (shareUrl && shareUrl.startsWith("http")) {
    shareData.url = shareUrl;
  }
  if (fileToShare) {
    shareData.files = [fileToShare];
  }

  try {
    await navigator.share(shareData);
    return { success: true };
  } catch (err) {
    if (err.name === "AbortError") {
      return { success: false, reason: "cancelled" };
    }
    throw err;
  }
}

/**
 * Open external share links (WhatsApp)
 */
export function openSocialShare(channel, { shareText }) {
  let url = "";

  switch (channel) {
    case "whatsapp":
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      break;

    default:
      return;
  }

  if (window.electronAPI?.app?.openExternal) {
    window.electronAPI.app.openExternal(url);
  } else {
    window.open(url, "_blank");
  }
}

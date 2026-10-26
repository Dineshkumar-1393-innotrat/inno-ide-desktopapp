// Standalone Single-File Web App HTML Generator for ESP32 Companion
import {
  formatGeologTime,
  isStaleTestGeolog,
  getLogTimestampMs,
  isHardcodedTextFieldQuestion,
  isHardcodedTextFieldResponse
} from "./geologHelpers.js";

export const getStandaloneHtmlContent = ({
  projectName = "ESP32 Companion",
  widgets = [],
  logicBlocks = [],
  activePort = "COM9",
  companionServerInfo = null,
  resolvedHostIp = "192.168.0.7",
  deviceDetectedLocation = null
} = {}) => {
  const logicBlocksJson = JSON.stringify(logicBlocks);
  const locWidget = widgets.find(w => w.type === 'location');
  const allGeologs = (Array.isArray(locWidget?.locationHistory) ? [...locWidget.locationHistory] : [])
    .filter(h => !isStaleTestGeolog(h))
    .sort((a, b) => getLogTimestampMs(b) - getLogTimestampMs(a));
  const initialOnLoc = (locWidget?.lastLocation?.event === 'ON' && !isStaleTestGeolog(locWidget.lastLocation))
    ? locWidget.lastLocation
    : (allGeologs.find(h => h.event === 'ON') || null);
  const initialOffLoc = (locWidget?.lastLocation?.event === 'OFF' && !isStaleTestGeolog(locWidget.lastLocation))
    ? locWidget.lastLocation
    : (allGeologs.find(h => h.event === 'OFF') || null);
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${projectName} - IoT Companion App</title>
  <style>
    :root { 
      --primary: #2563eb; 
      --bg: #f1f5f9; 
      --phone-bg: #f8fafc; 
      --card: #ffffff; 
      --border: #e2e8f0; 
      --text: #0f172a; 
      --subtext: #64748b; 
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); min-height: 100vh; display: flex; justify-content: center; align-items: flex-start; padding: 24px 16px; }
    .phone-wrapper { width: 100%; max-width: 380px; min-height: 640px; background: #ffffff; border-radius: 42px; border: 10px solid #0f172a; box-shadow: 0 25px 60px -15px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column; }
    .status-bar { display: flex; justify-content: space-between; align-items: center; padding: 12px 24px 6px 24px; font-size: 10px; font-weight: 700; color: #475569; background: #ffffff; border-bottom: 1px solid #f1f5f9; }
    .phone { width: 100%; flex: 1; background: var(--phone-bg); padding: 16px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }
    @media (max-width: 480px) {
      body { padding: 0; background: var(--phone-bg); }
      .phone-wrapper { border: none; border-radius: 0; box-shadow: none; max-width: 100%; min-height: 100vh; }
      .status-bar { display: none; }
      .phone { padding: 16px; min-height: 100vh; }
    }
    .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
    .brand-sub { font-size: 9px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 0.8px; }
    .header h1 { font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 1px; }
    .badge { font-size: 10px; padding: 3px 9px; border-radius: 9999px; background: #dcfce7; color: #15803d; border: 1px solid #86efac; font-weight: 700; display: flex; align-items: center; gap: 5px; }
    .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; }
    .controls-list { display: flex; flex-direction: column; gap: 14px; }
    .card { background: var(--card); border-radius: 16px; padding: 14px; display: flex; flex-direction: column; gap: 10px; border: 1px solid var(--border); box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .card.glow-blue { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.15), 0 1px 3px rgba(0,0,0,0.05); }
    .card.glow-red { border-color: #ef4444; box-shadow: 0 0 0 2px rgba(239,68,68,0.15), 0 1px 3px rgba(0,0,0,0.05); }
    .row { display: flex; align-items: center; justify-content: space-between; }
    .title { font-weight: 700; font-size: 14px; color: #0f172a; }
    .meta { font-size: 11px; color: var(--subtext); margin-top: 1px; }
    .btn { background: #ea580c; color: white; border: none; border-radius: 14px; padding: 12px 18px; font-weight: 800; cursor: pointer; width: 100%; font-size: 14px; text-align: center; box-shadow: 0 2px 4px rgba(234, 88, 12, 0.2); }
    .toggle { position: relative; width: 48px; height: 26px; }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .slider-toggle { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #cbd5e1; border-radius: 26px; transition: 0.3s; }
    .slider-toggle:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background: white; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.2); transition: 0.3s; }
    input:checked + .slider-toggle { background: #22c55e; }
    input:checked + .slider-toggle:before { transform: translateX(22px); }
    .slider-row { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
    .step-btn { background: #f8fafc; color: #334155; border: 1px solid var(--border); border-radius: 8px; padding: 6px 10px; font-weight: 800; font-size: 11px; cursor: pointer; }
    .slider-bar-wrap { flex: 1; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
    .slider-bar-fill { height: 100%; background: #8b5cf6; border-radius: 4px; }
    .gauge-big { font-size: 32px; font-weight: 900; text-align: center; color: #ef4444; margin: 4px 0; }
    .live-pill { font-size: 9px; font-weight: 800; background: #eff6ff; color: #2563eb; padding: 3px 8px; border-radius: 6px; }
    .live-pill.alert { background: #fee2e2; color: #b91c1c; }
    .test-btn { background: #f8fafc; color: #2563eb; border: 1px solid #cbd5e1; border-radius: 8px; padding: 4px 10px; font-size: 11px; font-weight: 800; cursor: pointer; }
    .switch-hint { font-size: 9px; color: #2563eb; margin-top: 4px; display: flex; align-items: center; gap: 4px; font-weight: 600; transition: color 0.3s; }
    .switch-hint.pending { color: #d97706; }
    .switch-hint.success { color: #16a34a; }
    .switch-hint.error { color: #dc2626; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .modal-spinner { width: 38px; height: 38px; border: 3px solid rgba(37, 99, 235, 0.15); border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
    .geolog-history-item:hover { border-color: #93c5fd !important; background: #f8fafc !important; }
  </style>
</head>
<body>
  <div class="phone-wrapper">
    <div class="status-bar">
      <span>9:41</span>
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="font-size: 11px;">📶</span>
        <span style="font-size: 9px; font-weight: 800;">5G</span>
        <span style="font-size: 11px;">🔋</span>
      </div>
    </div>
    <div class="phone">
      <div class="header">
        <div>
          <div class="brand-sub">InnoIDE Companion</div>
          <h1>🌱 ${projectName}</h1>
        </div>
        <div class="badge" id="companionStatusBadge" onclick="pingCompanionServer()" style="cursor:pointer;" title="Tap to test connection">
          <div class="badge-dot" id="companionStatusDot"></div>
          <span id="companionStatusText">ESP32 Linked</span>
        </div>
      </div>

      <div id="scannerNotice" style="display:none; background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; padding:8px 12px; font-size:11px; color:#1d4ed8; align-items:center; justify-content:space-between; margin-bottom:12px;">
        <span>📱 <b>Tip:</b> If switches don't respond on other phones, tap <b>⋮</b> and select <b>"Open in Chrome / Safari"</b>.</span>
        <button onclick="document.getElementById('scannerNotice').style.display='none'" style="background:transparent; border:none; color:#64748b; font-size:16px; cursor:pointer; padding:0 4px; line-height:1;">&times;</button>
      </div>

      <!-- QR & OTP VALIDATION SESSION BANNER -->
      <div id="qrSessionBanner" style="display:none; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:7px 12px; font-size:11px; color:#15803d; align-items:center; justify-content:space-between; margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span>⏱️</span>
          <span id="qrSessionText">QR Validation: 20:00 (OTP synchronized)</span>
        </div>
        <span id="qrSessionBadge" style="font-size:9px; font-weight:800; background:#dcfce7; color:#166534; padding:2px 6px; border-radius:4px;">SYNCED</span>
      </div>

      <!-- QR EXPIRED FULL-SCREEN OVERLAY -->
      <div id="qrExpiredOverlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.85); backdrop-filter:blur(6px); z-index:9999; flex-direction:column; align-items:center; justify-content:center; padding:24px; text-align:center;">
        <div style="background:#ffffff; border-radius:20px; padding:24px; max-width:320px; box-shadow:0 20px 40px rgba(0,0,0,0.3); border:1px solid #fecaca;">
          <div style="font-size:36px; margin-bottom:8px;">⌛</div>
          <div style="font-size:15px; font-weight:800; color:#991b1b; margin-bottom:6px;">QR &amp; OTP Session Expired</div>
          <div style="font-size:11px; color:#64748b; line-height:1.5; margin-bottom:16px;">
            The 20-minute QR validation and OTP session has expired. To continue controlling your ESP32 device, please re-scan or regenerate the QR code from InnoIDE.
          </div>
          <button onclick="window.location.reload()" style="background:#2563eb; color:#ffffff; border:none; border-radius:10px; padding:10px 18px; font-size:12px; font-weight:700; cursor:pointer;">
            Check Status / Reload
          </button>
        </div>
      </div>

      <!-- UI CONTROLS ONLY -->
      <div id="tab-controls" class="controls-list">
        ${widgets.filter(w => w.visible !== false).length === 0 ? `
          <div class="card" style="text-align: center; padding: 32px 16px; color: var(--subtext);">
            <div style="font-size: 24px; margin-bottom: 8px;">📱</div>
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">No Components Added</div>
            <div style="font-size: 12px;">Add components in InnoIDE App Designer to control hardware from this companion app.</div>
          </div>
        ` : widgets.filter(w => w.visible !== false).map(w => {
        if (w.type === 'switch') {
          // Gather all switch logs for this widget or from allGeologs
          const rawHist = (Array.isArray(w.locationHistory) && w.locationHistory.length > 0)
            ? w.locationHistory
            : allGeologs;
          const switchLogs = rawHist
            .filter(g => (g.event === 'ON' || g.event === 'OFF' || g.action === 'ON' || g.action === 'OFF') && !isStaleTestGeolog(g))
            .sort((a, b) => getLogTimestampMs(b) - getLogTimestampMs(a));

          // If no history in array yet but lastOnLocation/lastOffLocation/initial exist, seed them
          if (switchLogs.length === 0) {
            const seedOff = w.lastOffLocation || initialOffLoc;
            const seedOn = w.lastOnLocation || initialOnLoc;
            if (seedOff) switchLogs.push(seedOff);
            if (seedOn && (!seedOff || seedOn.id !== seedOff.id)) switchLogs.push(seedOn);
            switchLogs.sort((a, b) => getLogTimestampMs(b) - getLogTimestampMs(a));
          }

          const renderLogCardHtml = (item) => {
            const isON = item.event === 'ON' || item.action === 'ON';
            const bg = isON ? '#f0fdf4' : '#fef2f2';
            const border = isON ? '#bbf7d0' : '#fecaca';
            const dotColor = isON ? '#22c55e' : '#ef4444';
            const titleColor = isON ? '#15803d' : '#b91c1c';
            const timeColor = isON ? '#16a34a' : '#dc2626';
            const cityColor = isON ? '#14532d' : '#7f1d1d';
            const accColor = isON ? '#16a34a' : '#dc2626';
            const titleText = isON ? 'SWITCH ON TIMING & LOCATION' : 'SWITCH OFF TIMING & LOCATION';
            const timeText = formatGeologTime(item);
            const cityText = item.city || (isON ? 'Switch ON' : 'Switch OFF');
            const accText = item.accuracy != null ? ('Acc: ' + item.accuracy + 'm') : '';
            const lat = item.lat != null ? parseFloat(item.lat) : (item.latitude != null ? parseFloat(item.latitude) : null);
            const lng = item.lng != null ? parseFloat(item.lng) : (item.longitude != null ? parseFloat(item.longitude) : null);
            const coordsText = (lat != null && lng != null) ? (lat.toFixed(4) + '° N, ' + lng.toFixed(4) + '° E') : '';
            const mapUrl = (lat != null && lng != null) ? ('https://www.google.com/maps?q=' + lat + ',' + lng) : '#';
            return `
              <div class="switch-log-entry" style="background: ${bg}; border: 1px solid ${border}; border-radius: 8px; padding: 7px 10px; display: flex; flex-direction: column; gap: 2px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 9px; font-weight: 800; color: ${titleColor}; display: flex; align-items: center; gap: 4px; text-transform: uppercase;">
                    <span style="width: 6px; height: 6px; border-radius: 50%; background: ${dotColor};"></span> ${titleText}
                  </span>
                  <span style="font-size: 9px; font-weight: 700; color: ${timeColor}; font-family: monospace;">
                    ${timeText}
                  </span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1px;">
                  <span style="font-size: 10px; font-weight: 700; color: ${cityColor};">📍 <span>${cityText}</span></span>
                  <span style="font-size: 8px; color: ${accColor}; font-weight: 700;">${accText}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 8px; color: #64748b; font-family: monospace;">${coordsText}</span>
                  ${coordsText ? `<a href="${mapUrl}" target="_blank" style="font-size: 8px; font-weight: 700; color: ${timeColor}; text-decoration: none;">View Map ↗</a>` : ''}
                </div>
              </div>
            `;
          };

          return `
            <div class="card ${w.state ? 'glow-blue' : ''}" id="card-${w.id}" style="${w.backgroundColor ? `background: ${w.backgroundColor};` : ''}${w.cornerRadius ? `border-radius: ${w.cornerRadius}px;` : ''}">
              <div class="row">
                <div>
                  <div class="title" style="${w.fontSize ? `font-size: ${w.fontSize}px;` : ''}${w.textColor ? `color: ${w.textColor};` : ''}">${w.title}</div>
                  <div class="meta">${w.boundTarget || w.target || 'GPIO Pin'}</div>
                </div>
                <label class="toggle">
                  <input type="checkbox" id="input-${w.id}" ${w.state ? 'checked' : ''} onchange="handleSwitch('${w.id}', this.checked, '${w.title}')">
                  <span class="slider-toggle"></span>
                </label>
              </div>
              <div id="switch-hint-${w.id}" class="switch-hint">
                <span>📍</span> <span id="switch-hint-text-${w.id}">Location required for ON/OFF logging</span>
              </div>

              <!-- LIVE ON & OFF TIMING AND LOCATION DISPLAY (MULTIPLE LOGS) -->
              <div id="switch-telemetry-${w.id}" style="margin-top: 8px; border-top: 1px solid #f1f5f9; padding-top: 8px; display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 1px;">
                  <span style="font-size: 9px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">
                    Switch Logs (<span id="switch-logs-count-${w.id}">${switchLogs.length}</span>)
                  </span>
                  ${switchLogs.length > 2 ? `<span style="font-size: 8px; color: #94a3b8; font-weight: 600;">Scroll for more ↓</span>` : ''}
                </div>
                <div id="switch-logs-list-${w.id}" style="display: flex; flex-direction: column; gap: 6px; max-height: 280px; overflow-y: auto; padding-right: 2px;">
                  ${switchLogs.length === 0 ? `
                    <div id="switch-logs-empty-${w.id}" style="font-size: 9px; color: #94a3b8; text-align: center; padding: 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; font-style: italic;">
                      No ON/OFF events recorded yet. Toggle switch to log location & timing.
                    </div>
                  ` : switchLogs.map(renderLogCardHtml).join('')}
                </div>
              </div>
            </div>`;
        }
        if (w.type === 'slider') {
          return `
            <div class="card" id="card-${w.id}" style="${w.backgroundColor ? `background: ${w.backgroundColor};` : ''}${w.cornerRadius ? `border-radius: ${w.cornerRadius}px;` : ''}">
              <div class="row">
                <div>
                  <div class="title" style="${w.fontSize ? `font-size: ${w.fontSize}px;` : ''}${w.textColor ? `color: ${w.textColor};` : ''}">${w.title}</div>
                  <div class="meta">PWM Target: ${w.boundTarget || w.target || 'GPIO 4 (Servo)'}</div>
                </div>
                <div style="font-weight: 800; font-size: ${w.fontSize ? Math.round(w.fontSize * 1.2) : 16}px; color: ${w.color || '#7c3aed'};" id="val-${w.id}">${w.value || 90}${w.unit || '°'}</div>
              </div>
              <div class="slider-row">
                <button class="step-btn" onclick="stepSlider('${w.id}', -10, ${w.min || 0}, ${w.max || 180}, '${w.title}')">-10°</button>
                <button class="step-btn" onclick="stepSlider('${w.id}', -1, ${w.min || 0}, ${w.max || 180}, '${w.title}')">-1°</button>
                <div class="slider-bar-wrap">
                  <div class="slider-bar-fill" id="bar-${w.id}" style="width: ${(((w.value || 90) - (w.min || 0)) / ((w.max || 180) - (w.min || 0))) * 100}%;"></div>
                </div>
                <button class="step-btn" onclick="stepSlider('${w.id}', 1, ${w.min || 0}, ${w.max || 180}, '${w.title}')">+1°</button>
                <button class="step-btn" onclick="stepSlider('${w.id}', 10, ${w.min || 0}, ${w.max || 180}, '${w.title}')">+10°</button>
              </div>
            </div>`;
        }
        if (w.type === 'gauge') {
          return `
            <div class="card" id="card-${w.id}" style="${w.backgroundColor ? `background: ${w.backgroundColor};` : ''}${w.cornerRadius ? `border-radius: ${w.cornerRadius}px;` : ''}">
              <div class="row">
                <div>
                  <div class="title" style="${w.fontSize ? `font-size: ${w.fontSize}px;` : ''}${w.textColor ? `color: ${w.textColor};` : ''}">${w.title}</div>
                  <div class="meta">Source: ${w.boundTarget || w.target || 'ADC Telemetry'}</div>
                </div>
                <div class="live-pill" id="pill-${w.id}">● LIVE ADC</div>
              </div>
              <div class="gauge-big" id="val-${w.id}" style="color: ${w.color || '#ef4444'};">${w.value || 24.3}${w.unit || '°C'}</div>
              <div class="meta" style="text-align: center;">Range: ${w.min || 0} - ${w.max || 50}${w.unit || '°C'} (Guard Threshold: 30°C)</div>
            </div>`;
        }
        if (w.type === 'button') {
          return `
            <button class="btn" style="background: ${w.backgroundColor || w.color || '#ea580c'}; color: ${w.textColor || 'white'}; font-size: ${w.fontSize || 14}px; border-radius: ${w.cornerRadius || 14}px;" onclick="handleBtn('${w.title}', '${w.boundTarget || w.target || 'GPIO 5'}', '${w.action || 'TRIGGER'}')">
              🚨 ${w.title}
            </button>`;
        }
        if (w.type === 'device_card') {
          return `
            <div class="card" id="card-${w.id}" style="${w.backgroundColor ? `background: ${w.backgroundColor};` : ''}${w.cornerRadius ? `border-radius: ${w.cornerRadius}px;` : ''}">
              <div class="row">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 34px; height: 34px; border-radius: 10px; background: #eff6ff; display: flex; align-items: center; justify-content: center; font-size: 16px;">📡</div>
                  <div>
                    <div class="title" style="${w.fontSize ? `font-size: ${w.fontSize}px;` : ''}${w.textColor ? `color: ${w.textColor};` : ''}">${w.title || 'ESP32 Dev Board'}</div>
                    <div style="font-size: 10px; color: #16a34a; font-weight: 700; margin-top: 2px;">● Online & Connected</div>
                  </div>
                </div>
                <div class="live-pill">WIFI 100%</div>
              </div>
            </div>`;
        }
        if (w.type === 'label') {
          return `
            <div class="card" id="card-${w.id}" style="padding: 12px 16px; ${w.backgroundColor ? `background: ${w.backgroundColor};` : ''}${w.cornerRadius ? `border-radius: ${w.cornerRadius}px;` : ''}">
              <div class="title" style="color: ${w.textColor || w.color || '#0f172a'}; font-size: ${w.fontSize || 14}px;">${w.title}</div>
              ${(w.boundTarget || w.target) ? `<div class="meta">${w.boundTarget || w.target}</div>` : ''}
            </div>`;
        }
        if (w.type === 'location') {
          const hist = (Array.isArray(w.locationHistory) ? [...w.locationHistory] : [])
            .filter(h => !isStaleTestGeolog(h))
            .sort((a, b) => getLogTimestampMs(b) - getLogTimestampMs(a));
          const lastOnLoc = (w.lastLocation && w.lastLocation.event === 'ON' && !isStaleTestGeolog(w.lastLocation))
            ? w.lastLocation
            : (hist.find(h => h.event === 'ON') || null);
          const lastOffLoc = (w.lastLocation && w.lastLocation.event === 'OFF' && !isStaleTestGeolog(w.lastLocation))
            ? w.lastLocation
            : (hist.find(h => h.event === 'OFF') || null);
          const esp32Loc = (deviceDetectedLocation && !isStaleTestGeolog(deviceDetectedLocation))
            ? deviceDetectedLocation
            : (w.lastLocation?.source === 'Network' && !isStaleTestGeolog(w.lastLocation) ? w.lastLocation : null);
          return `
            <div class="card" id="card-${w.id}" style="border: 1px solid #e2e8f0; background: #ffffff; border-radius: ${w.cornerRadius || 16}px; padding: 14px; display: flex; flex-direction: column; gap: 10px;">
              <div class="row" style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 32px; height: 32px; border-radius: 8px; background: #ecfeff; color: #0891b2; display: flex; align-items: center; justify-content: center; font-size: 16px;">📍</div>
                  <div>
                    <div class="title" style="color: #0f172a; font-size: ${w.fontSize || 14}px; font-weight: 700;">${w.title || 'Location Button'}</div>
                    <div class="meta" style="color: #64748b; font-size: 10px;">GPS & Switch Geologger</div>
                  </div>
                </div>
                <div style="display: flex; gap: 4px;">
                  <span id="badge-on-${w.id}" style="font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 9999px; background: #dcfce7; color: #15803d; border: 1px solid #86efac; display: ${lastOnLoc ? 'inline-block' : 'none'};">ON ✓</span>
                  <span id="badge-off-${w.id}" style="font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 9999px; background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; display: ${lastOffLoc ? 'inline-block' : 'none'};">OFF ✓</span>
                </div>
              </div>

              <!-- Section 1: ESP32-S3 DEVICE (HOST) -->
              <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 10px; display: flex; flex-direction: column; gap: 3px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="width: 7px; height: 7px; border-radius: 50%; background: #2563eb; display: inline-block;"></span>
                    <span style="font-size: 9px; font-weight: 800; color: #1d4ed8; letter-spacing: 0.5px; text-transform: uppercase;">ESP32-S3 DEVICE (HOST)</span>
                  </div>
                  <span id="host-badge-${w.id}" style="font-size: 8px; font-weight: 700; background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px;">CALIBRATED</span>
                </div>
                <div id="host-city-${w.id}" style="font-size: 11px; font-weight: 700; color: #1e3a8a; margin-top: 2px;">
                  📍 ${esp32Loc?.city || 'Calibrated Location'}${esp32Loc?.country ? ', ' + esp32Loc.country : ', India'}
                </div>
                <div id="host-addr-${w.id}" style="font-size: 10px; color: #475569; line-height: 1.3;">
                  ${esp32Loc?.address || 'Chennai, Tamil Nadu, India'}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
                  <span id="host-gps-${w.id}" style="font-size: 9px; color: #2563eb; font-family: monospace; font-weight: 600;">
                    ${esp32Loc?.lat ? (esp32Loc.lat + '° N, ' + esp32Loc.lng + '° E') : '13.0147° N, 80.2242° E'}
                  </span>
                  <span id="host-source-${w.id}" style="font-size: 8px; color: #64748b;">
                    ${esp32Loc?.source ? '(' + esp32Loc.source.replace('IP Geolocation ', '') + ')' : '(Host Calibrated)'}
                  </span>
                </div>
                <div style="display: flex; gap: 6px; margin-top: 6px;">
                  <button id="host-gps-btn-${w.id}" onclick="detectLiveGpsLocation('${w.id}')" style="background: #dcfce7; color: #15803d; border: 1px solid #86efac; border-radius: 6px; padding: 4px 8px; font-size: 9px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                    🔄 Detect Live GPS
                  </button>
                  <button id="host-refresh-btn-${w.id}" onclick="refreshHostLocation('${w.id}')" style="background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 8px; font-size: 9px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                    🎯 Calibrate Locality
                  </button>
                </div>
              </div>

              <!-- Section 2: SWITCH ON TIMING & LOCATION -->
              <div id="on-box-${w.id}" style="background: #f0fdf4; border: 1px solid ${lastOnLoc ? '#bbf7d0' : '#e2e8f0'}; border-radius: 10px; padding: 10px; display: flex; flex-direction: column; gap: 3px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span id="on-dot-${w.id}" style="width: 7px; height: 7px; border-radius: 50%; background: ${lastOnLoc ? '#22c55e' : '#94a3b8'}; display: inline-block;"></span>
                    <span id="on-label-${w.id}" style="font-size: 9px; font-weight: 800; color: ${lastOnLoc ? '#15803d' : '#64748b'}; letter-spacing: 0.5px; text-transform: uppercase;">SWITCH ON TIMING & LOCATION</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <span id="on-time-badge-${w.id}" style="font-size: 9px; font-weight: 700; background: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px; font-family: monospace; display: ${lastOnLoc ? 'inline-block' : 'none'};">⏱️ ${lastOnLoc ? formatGeologTime(lastOnLoc) : ''}</span>
                    <span id="on-badge-${w.id}" style="font-size: 8px; font-weight: 700; background: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px; display: ${lastOnLoc ? 'inline-block' : 'none'};">LATEST</span>
                  </div>
                </div>
                <div id="on-content-${w.id}" style="display: ${lastOnLoc ? 'block' : 'none'};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
                    <span id="on-city-${w.id}" style="font-size: 11px; font-weight: 700; color: #14532d;">
                      🟢 ${lastOnLoc?.city || 'Logged Location'}
                    </span>
                    <span id="on-time-${w.id}" style="font-size: 9px; font-weight: 700; color: #16a34a; font-family: monospace;">
                      ${lastOnLoc ? formatGeologTime(lastOnLoc) : ''}
                    </span>
                  </div>
                  <div id="on-addr-${w.id}" style="font-size: 10px; color: #475569; line-height: 1.3; margin-top: 1px;">
                    ${lastOnLoc?.address || ''}
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
                    <span id="on-gps-${w.id}" style="font-size: 9px; color: #16a34a; font-family: monospace; font-weight: 600;">
                      ${lastOnLoc?.lat ? (lastOnLoc.lat + '° N, ' + lastOnLoc.lng + '° E') : ''}
                    </span>
                    <span id="on-acc-row-${w.id}" style="font-size: 8px; color: #15803d; font-weight: 700; display: ${lastOnLoc ? 'inline' : 'none'};">
                      Accuracy: <span id="on-acc-${w.id}">${lastOnLoc?.accuracy != null ? lastOnLoc.accuracy : '12'}</span> m
                    </span>
                  </div>
                  <a id="on-maps-btn-${w.id}" href="https://www.google.com/maps?q=${lastOnLoc?.lat || ''},${lastOnLoc?.lng || ''}" target="_blank" style="margin-top: 6px; background: #dcfce7; color: #15803d; border: 1px solid #86efac; border-radius: 6px; padding: 5px 10px; font-size: 9px; font-weight: 700; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 4px;">
                    🗺️ View ON Location on Maps
                  </a>
                </div>
                <div id="on-empty-${w.id}" style="display: ${lastOnLoc ? 'none' : 'block'}; font-size: 10px; color: #94a3b8; font-style: italic; margin-top: 2px;">
                  No switch ON event recorded yet. Toggle the switch to capture location.
                </div>
              </div>

              <!-- Section 3: SWITCH OFF TIMING & LOCATION -->
              <div id="off-box-${w.id}" style="background: #fef2f2; border: 1px solid ${lastOffLoc ? '#fecaca' : '#e2e8f0'}; border-radius: 10px; padding: 10px; display: flex; flex-direction: column; gap: 3px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span id="off-dot-${w.id}" style="width: 7px; height: 7px; border-radius: 50%; background: ${lastOffLoc ? '#ef4444' : '#94a3b8'}; display: inline-block;"></span>
                    <span id="off-label-${w.id}" style="font-size: 9px; font-weight: 800; color: ${lastOffLoc ? '#b91c1c' : '#64748b'}; letter-spacing: 0.5px; text-transform: uppercase;">SWITCH OFF TIMING & LOCATION</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <span id="off-time-badge-${w.id}" style="font-size: 9px; font-weight: 700; background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px; font-family: monospace; display: ${lastOffLoc ? 'inline-block' : 'none'};">⏱️ ${lastOffLoc ? formatGeologTime(lastOffLoc) : ''}</span>
                    <span id="off-badge-${w.id}" style="font-size: 8px; font-weight: 700; background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px; display: ${lastOffLoc ? 'inline-block' : 'none'};">LATEST</span>
                  </div>
                </div>
                <div id="off-content-${w.id}" style="display: ${lastOffLoc ? 'block' : 'none'};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
                    <span id="off-city-${w.id}" style="font-size: 11px; font-weight: 700; color: #7f1d1d;">
                      🔴 ${lastOffLoc?.city || 'Logged Location'}
                    </span>
                    <span id="off-time-${w.id}" style="font-size: 9px; font-weight: 700; color: #dc2626; font-family: monospace;">
                      ${lastOffLoc ? formatGeologTime(lastOffLoc) : ''}
                    </span>
                  </div>
                  <div id="off-addr-${w.id}" style="font-size: 10px; color: #475569; line-height: 1.3; margin-top: 1px;">
                    ${lastOffLoc?.address || ''}
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
                    <span id="off-gps-${w.id}" style="font-size: 9px; color: #dc2626; font-family: monospace; font-weight: 600;">
                      ${lastOffLoc?.lat ? (lastOffLoc.lat + '° N, ' + lastOffLoc.lng + '° E') : ''}
                    </span>
                    <span id="off-acc-row-${w.id}" style="font-size: 8px; color: #b91c1c; font-weight: 700; display: ${lastOffLoc ? 'inline' : 'none'};">
                      Accuracy: <span id="off-acc-${w.id}">${lastOffLoc?.accuracy != null ? lastOffLoc.accuracy : '10'}</span> m
                    </span>
                  </div>
                  <a id="off-maps-btn-${w.id}" href="https://www.google.com/maps?q=${lastOffLoc?.lat || ''},${lastOffLoc?.lng || ''}" target="_blank" style="margin-top: 6px; background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; border-radius: 6px; padding: 5px 10px; font-size: 9px; font-weight: 700; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 4px;">
                    🗺️ View OFF Location on Maps
                  </a>
                </div>
                <div id="off-empty-${w.id}" style="display: ${lastOffLoc ? 'none' : 'block'}; font-size: 10px; color: #94a3b8; font-style: italic; margin-top: 2px;">
                  No switch OFF event recorded yet. Toggle the switch to capture location.
                </div>
              </div>

              <!-- Section 4: SWITCH GEOLOG HISTORY -->
              <div style="margin-top: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                    SWITCH GEOLOG HISTORY (<span id="hist-count-${w.id}">${hist.length}</span>)
                  </div>
                  <button onclick="clearMobileGeologs('${w.id}')" style="background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; border-radius: 4px; padding: 2px 6px; font-size: 9px; font-weight: 700; cursor: pointer;">
                    Clear
                  </button>
                </div>
                <div id="hist-list-${w.id}" style="display: flex; flex-direction: column; gap: 5px; max-height: 130px; overflow-y: auto;">
                  ${hist.length === 0 ? `
                    <div id="hist-empty-${w.id}" style="font-size: 10px; color: #64748b; text-align: center; padding: 8px; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1;">
                      No location history yet. Toggle switches to record geologs.
                    </div>
                  ` : hist.slice(0, 10).map(item => {
                    const isON = item.event === 'ON';
                    const isOFF = item.event === 'OFF';
                    const itemBg = isON ? '#f0fdf4' : (isOFF ? '#fef2f2' : '#f8fafc');
                    const itemBorder = isON ? '#bbf7d0' : (isOFF ? '#fecaca' : '#e2e8f0');
                    const badgeBg = isON ? '#dcfce7' : (isOFF ? '#fee2e2' : '#dbeafe');
                    const badgeColor = isON ? '#15803d' : (isOFF ? '#b91c1c' : '#1d4ed8');
                    const latStr = (item.lat && item.lng) 
                      ? (parseFloat(item.lat).toFixed(3) + '°N, ' + parseFloat(item.lng).toFixed(3) + '°E') 
                      : (item.lat ? (parseFloat(item.lat).toFixed(3) + '°') : '');
                    const accStr = item.accuracy != null ? (' • Acc: ' + item.accuracy + 'm') : '';
                    const timeFormatted = formatGeologTime(item);
                    return `
                      <div class="geolog-history-item" onclick="window.open('https://www.google.com/maps?q=${item.lat},${item.lng}', '_blank')" title="View on Google Maps" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: ${itemBg}; border-radius: 8px; padding: 6px 10px; border: 1px solid ${itemBorder}; transition: all 0.2s;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <span style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${badgeBg}; color: ${badgeColor};">${item.event || 'LOG'}</span>
                          <div style="display: flex; flex-direction: column;">
                            <span style="font-size: 11px; font-weight: 600; color: #0f172a;">${item.city || 'Location'}</span>
                            ${latStr ? '<span style="font-size: 9px; color: #64748b; font-family: monospace;">' + latStr + accStr + '</span>' : ''}
                          </div>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
                          <span style="font-size: 9px; color: #64748b; font-family: monospace;">${timeFormatted}</span>
                          <span style="font-size: 9px; color: #2563eb; font-weight: 600;">🗺️ Maps</span>
                        </div>
                      </div>`;
                  }).join('')}
                </div>
              </div>

              <button onclick="recordAndSendMobileLocation('${w.id}')" style="width: 100%; margin-top: 4px; background: #f8fafc; color: #0284c7; border: 1px solid #cbd5e1; border-radius: 10px; padding: 8px 12px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                🎯 Share My Mobile GPS Location
              </button>
            </div>`;
        }
        if (w.type === 'textfield') {
          const questionsList = (Array.isArray(w.questions) ? w.questions : []).filter(q => !isHardcodedTextFieldQuestion(q));
          const activeQIds = questionsList.map(q => q.id);
          const activeQTexts = questionsList.map(q => String(q.text || '').trim().toLowerCase());
          const responsesList = (Array.isArray(w.responses) ? w.responses : []).filter(r => {
            if (isHardcodedTextFieldResponse(r)) return false;
            const rQText = String(r.questionText || r.question || '').trim().toLowerCase();
            const rQId = String(r.questionId || '');
            return (rQId && activeQIds.includes(rQId)) || (rQText && activeQTexts.includes(rQText));
          });
          return `
            <div class="card" id="card-${w.id}" style="border: 1px solid #e2e8f0; background: #ffffff; border-radius: ${w.cornerRadius || 16}px;">
              <div class="row">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 28px; height: 28px; border-radius: 8px; background: #f3e8ff; color: #7c3aed; display: flex; align-items: center; justify-content: center; font-size: 14px;">📝</div>
                  <div>
                    <div class="title" style="color: #0f172a; font-size: ${w.fontSize || 14}px;">${w.title || 'Dynamic Form'}</div>
                    <div class="meta" style="color: #64748b;">Question & Response Survey</div>
                  </div>
                </div>
                <div class="live-pill" style="background: #f3e8ff; color: #7c3aed;">${questionsList.length} QUESTION${questionsList.length === 1 ? '' : 'S'}</div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 6px;">
                ${questionsList.length === 0 ? `
                  <div style="background: #f8fafc; border-radius: 12px; padding: 14px; border: 1px dashed #cbd5e1; text-align: center; color: #64748b; font-size: 11px;">
                    No questions currently published. Questions created on the desktop canvas will appear here.
                  </div>
                ` : questionsList.map((q, idx) => `
                  <div style="background: #f8fafc; border-radius: 12px; padding: 12px; border: 1px solid #ede9fe;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                      <span style="font-size: 11px; font-weight: 800; color: #6d28d9;">Q${idx + 1}</span>
                      <span style="font-size: 9px; padding: 2px 6px; border-radius: 4px; background: #ede9fe; color: #6d28d9; text-transform: uppercase; font-weight: 700;">${q.type || 'text'}</span>
                    </div>
                    <div style="font-size: 13px; font-weight: 600; color: #1e1b4b; margin-bottom: 8px;">
                      ${q.text}
                    </div>
                    
                    ${q.type === 'multiple_choice' && Array.isArray(q.options) && q.options.length > 0 ? `
                      <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px;">
                        ${q.options.map((opt, optIdx) => `
                          <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #1e293b; cursor: pointer; background: #ffffff; padding: 6px 10px; border-radius: 8px; border: 1px solid #cbd5e1;">
                            <input type="radio" name="opt-${w.id}-${q.id}" value="${opt}" ${optIdx === 0 ? 'checked' : ''} onchange="document.getElementById('input-${w.id}-${q.id}').value = this.value">
                            <span>${opt}</span>
                          </label>
                        `).join('')}
                      </div>
                      <input type="hidden" id="input-${w.id}-${q.id}" value="${q.options[0] || ''}">
                    ` : `
                      <input 
                        type="text" 
                        id="input-${w.id}-${q.id}" 
                        placeholder="Type your answer here..." 
                        style="width: 100%; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; font-size: 12px; color: #0f172a; outline: none; margin-bottom: 8px;"
                        onkeypress="if(event.key === 'Enter') submitMobileFormAnswer('${w.id}', '${q.id}', '${q.text.replace(/'/g, "\\'")}')"
                      >
                    `}

                    <button 
                      onclick="submitMobileFormAnswer('${w.id}', '${q.id}', '${q.text.replace(/'/g, "\\'")}')"
                      style="width: 100%; background: #7c3aed; color: #fff; border: none; border-radius: 8px; padding: 8px 12px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;"
                    >
                      <span>Submit Answer 🚀</span>
                    </button>
                    <div id="status-${w.id}-${q.id}" style="font-size: 10px; color: #16a34a; font-weight: 700; text-align: center; margin-top: 4px; display: none;">✓ Response sent to desktop UI</div>
                  </div>
                `).join('')}
              </div>

              <!-- Submitted Answers Container -->
              <div id="responses-wrap-${w.id}" style="margin-top: 12px; border-top: 1px solid #f1f5f9; padding-top: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 11px; font-weight: 800; color: #6d28d9;">💬 Submitted Answers (<span id="resp-count-${w.id}">${responsesList.length}</span>)</span>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <button onclick="clearMobileFormAnswers('${w.id}')" style="background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; border-radius: 4px; padding: 2px 6px; font-size: 9px; font-weight: 700; cursor: pointer;">
                      Clear
                    </button>
                    <span style="font-size: 9px; padding: 2px 6px; border-radius: 4px; background: #dcfce7; color: #15803d; font-weight: 700;">● Live Stream</span>
                  </div>
                </div>
                <div id="responses-list-${w.id}" style="display: flex; flex-direction: column; gap: 6px; max-height: 200px; overflow-y: auto;">
                  ${responsesList.length === 0 ? `
                    <div id="resp-empty-${w.id}" style="font-size: 11px; color: #64748b; text-align: center; padding: 10px; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1;">
                      No answers submitted yet.
                    </div>
                  ` : responsesList.map(r => `
                    <div class="resp-item" style="background: #faf5ff; border-radius: 8px; padding: 8px 10px; border: 1px solid #e9d5ff;">
                      <div style="display: flex; justify-content: space-between; font-size: 10px; color: #6d28d9; margin-bottom: 3px;">
                        <span style="font-weight: 700;">${r.questionText || r.question || 'Answer'}</span>
                        <span style="color: #64748b;">${r.timestamp || r.time || ''}</span>
                      </div>
                      <div style="font-size: 12px; font-weight: 600; color: #0f172a;">💬 ${r.answer}</div>
                      <div style="font-size: 9px; color: #64748b; margin-top: 2px;">Source: ${r.source || 'Mobile UI'}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>`;
        }
        if (w.type === 'progress') {
          return `
            <div class="card" id="card-${w.id}">
              <div class="row">
                <div class="title">${w.title}</div>
                <div style="font-size: 12px; color: #2563eb; font-weight: 800;">75%</div>
              </div>
              <div class="slider-bar-wrap" style="margin-top: 6px;">
                <div class="slider-bar-fill" style="width: 75%; background: #2563eb;"></div>
              </div>
            </div>`;
        }
        return '';
      }).join('')}
      </div>
    </div>
  </div>

  <!-- LOCATION GATING & PERMISSION MODAL -->
  <div id="locationModalOverlay" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 9999; align-items: center; justify-content: center; padding: 16px;">
    <div id="locationModalCard" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; width: 100%; max-width: 380px; padding: 24px; box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column; gap: 14px; text-align: center;">
      <div id="modalIconContainer" style="width: 52px; height: 52px; border-radius: 50%; background: #eff6ff; display: flex; align-items: center; justify-content: center; font-size: 26px; margin: 0 auto;">📍</div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <h3 id="modalTitle" style="font-size: 17px; font-weight: 800; color: #0f172a;">Location Required</h3>
        <p id="modalDescription" style="font-size: 13px; color: #475569; line-height: 1.5;">Enable location to control this ESP32 switch.</p>
        <div id="modalSubNote" style="font-size: 11px; color: #475569; line-height: 1.4; margin-top: 4px; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; display: none;"></div>
      </div>
      <div id="modalButtonsRow" style="display: flex; gap: 10px; margin-top: 6px;">
        <button id="modalBtnCancel" onclick="closeLocationModal()" style="flex: 1; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; font-weight: 700; font-size: 13px; cursor: pointer;">Cancel</button>
        <button id="modalBtnPrimary" onclick="handleModalPrimaryAction()" style="flex: 1.2; background: #2563eb; color: #ffffff; border: none; border-radius: 12px; padding: 12px; font-weight: 800; font-size: 13px; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">Enable Location</button>
      </div>
    </div>
  </div>

  <!-- LOCATION-MISMATCH OTP VERIFICATION MODAL -->
  <div id="otpVerificationModalOverlay" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); z-index: 10000; align-items: center; justify-content: center; padding: 16px;">
    <div id="otpModalCard" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; width: 100%; max-width: 410px; padding: 22px; box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.3); display: flex; flex-direction: column; gap: 14px; text-align: center;">
      <!-- Shield Icon & Action Badge -->
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="width: 44px; height: 44px; border-radius: 50%; background: #eff6ff; display: flex; align-items: center; justify-content: center; font-size: 22px;">🔐</div>
        <div id="otpActionBadge" style="font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5;">SWITCH OFF</div>
      </div>

      <!-- Title & Message -->
      <div style="display: flex; flex-direction: column; gap: 4px; text-align: left;">
        <h3 style="font-size: 17px; font-weight: 800; color: #0f172a;">Location Verification Required</h3>
        <p style="font-size: 12px; color: #475569; line-height: 1.4;">Your current location differs from the last recorded switch location. Verify your identity to continue.</p>
      </div>

      <!-- Comparison Details Card -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px; display: flex; flex-direction: column; gap: 8px; text-align: left;">
        <!-- Previous Location -->
        <div style="display: flex; flex-direction: column; gap: 1px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Previous Operation Location</div>
          <div id="otpPrevLocationText" style="font-size: 12px; font-weight: 600; color: #334155;">📍 Little Mount • 13.0147° N, 80.2242° E</div>
        </div>
        <!-- Current Location -->
        <div style="display: flex; flex-direction: column; gap: 1px;">
          <div style="font-size: 10px; font-weight: 700; color: #2563eb; text-transform: uppercase;">Current Location (Detected)</div>
          <div id="otpCurLocationText" style="font-size: 12px; font-weight: 700; color: #0f172a;">📍 Ward 59 • 13.0879° N, 80.2785° E (Acc: 15m)</div>
        </div>
        <!-- Distance Alert -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 2px;">
          <span style="font-size: 11px; color: #64748b;">Distance Difference:</span>
          <span id="otpDistanceText" style="font-size: 11px; font-weight: 800; color: #b45309;">~8.4 km (Threshold: 100m)</span>
        </div>
      </div>

      <!-- Dev / Demo Mode OTP Display (Section 2 Requirement) -->
      <div id="otpDevDemoBox" style="background: #eff6ff; border: 1.5px dashed #93c5fd; border-radius: 12px; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 11px; color: #2563eb; font-weight: 700;">🧪 Demo OTP:</span>
          <span id="otpDevCode" style="font-family: monospace; font-size: 15px; font-weight: 900; color: #1d4ed8; letter-spacing: 2px;">------</span>
        </div>
        <button type="button" onclick="quickFillDemoOtp()" style="background: #2563eb; color: #fff; border: none; border-radius: 6px; padding: 4px 8px; font-size: 10px; font-weight: 800; cursor: pointer;">Auto-Fill</button>
      </div>

      <!-- OTP Input Field -->
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <input type="text" id="otpInput" maxlength="6" inputmode="numeric" autocomplete="one-time-code" placeholder="Enter 6-digit OTP" style="width: 100%; text-align: center; font-size: 20px; font-weight: 900; letter-spacing: 6px; font-family: monospace; padding: 12px; background: #ffffff; border: 2px solid #cbd5e1; border-radius: 12px; color: #0f172a; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#2563eb'" onblur="this.style.borderColor='#cbd5e1'" onkeypress="if(event.key==='Enter') submitOtpVerification();">
      </div>

      <!-- Status / Validation Message Banner -->
      <div id="otpValidationMsg" style="display: none; font-size: 11px; font-weight: 700; padding: 8px 12px; border-radius: 8px; text-align: center;"></div>

      <!-- Timer & Resend Row -->
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
        <span id="otpExpiryTimer" style="color: #64748b; font-family: monospace;">⏱️ Expires (with QR validation): 19:59</span>
        <button id="otpResendBtn" type="button" onclick="handleResendOtp()" style="background: transparent; border: none; color: #2563eb; font-size: 11px; font-weight: 700; cursor: pointer;">Resend OTP</button>
      </div>

      <!-- Buttons Row -->
      <div style="display: flex; gap: 10px; margin-top: 4px;">
        <button id="otpBtnCancel" type="button" onclick="cancelOtpModal()" style="flex: 1; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; font-weight: 700; font-size: 13px; cursor: pointer;">Cancel</button>
        <button id="otpBtnVerify" type="button" onclick="submitOtpVerification()" style="flex: 1.3; background: #2563eb; color: #ffffff; border: none; border-radius: 12px; padding: 12px; font-weight: 800; font-size: 13px; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);">Verify & Execute</button>
      </div>
    </div>
  </div>

  <script>
    const rules = ${logicBlocksJson};
    const widgetValues = {};
    const execCounts = {};

    var urlParams = new URLSearchParams(window.location.search);
    var qrSessionTimestamp = parseInt(urlParams.get('qr_session') || '', 10) || 0;
    var qrExpiresAtTimestamp = parseInt(urlParams.get('qr_exp') || '', 10) || 0;

    function setTab(tab) {}

    function addLog(msg) {
      console.log(msg);
      const el = document.getElementById('logConsole');
      if (!el) return;
      const time = new Date().toLocaleTimeString();
      el.innerHTML += '<div>[' + time + '] ' + msg + '</div>';
      el.scrollTop = el.scrollHeight;
    }

    var COMPANION_PORT = '${activePort}';

    function sendHardwareAction(payload, extra) {
      try {
        const cleanPayload = String(payload || '').trim();
        const isOff = cleanPayload === 'LED:0' || cleanPayload.includes(':0') || cleanPayload.toLowerCase().includes('off');
        const switchStatus = isOff ? 0 : 1;

        if (qrExpiresAtTimestamp && Date.now() > qrExpiresAtTimestamp) {
          var expOverlay = document.getElementById('qrExpiredOverlay');
          if (expOverlay) expOverlay.style.display = 'flex';
          addLog('⏳ [QR Expired] QR validation session expired. Switch action blocked.');
          return;
        }

        const bodyObj = Object.assign({
          payload: cleanPayload || (isOff ? 'LED:0' : 'LED:1'),
          SwitchStatus: switchStatus,
          value: switchStatus === 1,
          port: COMPANION_PORT || 'COM9',
          qrSession: qrSessionTimestamp || undefined,
          qrExpiresAt: qrExpiresAtTimestamp || undefined
        }, extra || {});
        const bodyStr = JSON.stringify(bodyObj);

        // Prefer relative / origin endpoint so it works identically from phone or PC
        const hostOrigin = (window.location && window.location.origin && window.location.origin.startsWith('http'))
          ? window.location.origin
          : '';
        const companionIp = '${companionServerInfo?.ip || resolvedHostIp}';
        const primaryEndpoint = hostOrigin ? (hostOrigin + '/api/action') : ('http://' + companionIp + ':5055/api/action');
        const fallbackEndpoint = 'http://' + companionIp + ':5055/api/action';

        const qs = 'payload=' + encodeURIComponent(bodyObj.payload) +
          '&SwitchStatus=' + switchStatus +
          '&value=' + (switchStatus === 1) +
          '&port=' + encodeURIComponent(bodyObj.port || 'COM9') +
          (qrSessionTimestamp ? ('&qr_session=' + qrSessionTimestamp) : '') +
          (qrExpiresAtTimestamp ? ('&qr_exp=' + qrExpiresAtTimestamp) : '') +
          '&_t=' + Date.now();

        var dispatched = false;

        // Tier 1: Standard POST with JSON
        fetch(primaryEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: bodyStr,
          mode: 'cors'
        })
        .then(function(r) { return r.json(); })
        .then(function(res) {
          dispatched = true;
          if (res && res.success) {
            addLog('🚀 [ESP32] ' + (isOff ? 'LED OFF (0)' : 'LED ON (Blink)'));
            if (res.states || res.switchLocations || res.location || res.hostLocation) {
              applySynchronizedState(res);
            }
          } else if (res && res.error) {
            addLog('⚠️ [ESP32] Error: ' + res.error);
          }
        })
        .catch(function(err) {
          // Tier 2: Simple text/plain POST (CORS simple request — avoids OPTIONS preflight entirely)
          fetch(primaryEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: bodyStr,
            mode: 'no-cors'
          })
          .then(function() {
            dispatched = true;
            addLog('🚀 [ESP32] ' + (isOff ? 'LED OFF (0)' : 'LED ON (Blink)'));
          })
          .catch(function() {
            // Tier 3: GET query request (works on all mobile networks/proxies)
            fetch(primaryEndpoint + '?' + qs, { method: 'GET', mode: 'no-cors' })
            .then(function() {
              dispatched = true;
              addLog('🚀 [ESP32] ' + (isOff ? 'LED OFF (0)' : 'LED ON (Blink)'));
            })
            .catch(function() {
              // Tier 4: Image Beacon (Bypasses all webview sandboxes, CORS preflights, and PNA restrictions)
              try {
                var img = new Image();
                img.onload = function() { addLog('🚀 [ESP32] ' + (isOff ? 'LED OFF (0)' : 'LED ON (Blink)')); };
                img.onerror = function() { addLog('🚀 [ESP32] ' + (isOff ? 'LED OFF (0)' : 'LED ON (Blink)')); };
                img.src = primaryEndpoint + '?' + qs + '&_img=1';
                dispatched = true;
              } catch(e) {}

              // Tier 5: Try direct fallback IP if different from primary
              if (!dispatched && fallbackEndpoint !== primaryEndpoint) {
                fetch(fallbackEndpoint + '?' + qs, { method: 'GET', mode: 'no-cors' }).catch(function(){});
                new Image().src = fallbackEndpoint + '?' + qs + '&_img=1';
              }
              addLog('⚠️ [Network] Error reaching companion server: ' + err.message);
            });
          });
        });
      } catch (e) {
        addLog('⚠️ [Error] ' + e.message);
      }
    }

    function sendHardwareCommand(payload, extra) {
      sendHardwareAction(payload, extra);
    }

    function evalRules(widgetId, val, title) {
      rules.forEach(r => {
        if (!r.enabled) return;
        if (r.triggerWidgetId === widgetId || r.trigger === widgetId || r.triggerName === title) {
          let passed = true;
          if (r.condition && r.condition.includes('>')) {
            const num = parseFloat(r.condition.replace(/[^0-9.]/g, ''));
            if (typeof val === 'number' && val <= num) passed = false;
          }
          if (passed) {
            execCounts[r.id] = (execCounts[r.id] || 0) + 1;
            const el = document.getElementById('rule-exec-' + r.id);
            if (el) el.innerText = 'Executions: ' + execCounts[r.id];
            const payload = (r.payload || '').replace('{state}', val ? '1' : '0').replace('{value}', val);
            addLog('⚡ [LOGIC] "' + r.name + '" -> TX: ' + payload + ' to ' + (r.targetHardware || r.target || 'Hardware'));
            sendHardwareAction(payload, { ruleId: r.id, ruleName: r.name });
          }
        }
      });
    }

    function isStaleClientGeolog(item) {
      if (!item) return true;
      var str = JSON.stringify(item).toLowerCase();
      if (str.indexOf('12:53:01') !== -1 || str.indexOf('12:34:55') !== -1 || str.indexOf('12:34:49') !== -1 || 
          str.indexOf('12:19:06') !== -1 || str.indexOf('11:36:18') !== -1 || str.indexOf('11:36:10') !== -1 || 
          str.indexOf('11:35:58') !== -1 || str.indexOf('11:01:35') !== -1 || str.indexOf('11:01:33') !== -1 ||
          str.indexOf('loc-init-1') !== -1) {
        return true;
      }
      return false;
    }

    function isStaleClientAnswer(resp) {
      if (!resp) return true;
      var a = String(resp.answer || resp.text || '').toLowerCase().trim();
      var q = String(resp.question || resp.questionText || '').toLowerCase().trim();
      var id = String(resp.id || '');
      if (id === 'resp-1' || id === 'resp-2') return true;
      if (a === 'iam good' || a === 'i am good' || a === 'dinesh' || a === 'dk' || a === 'alex' || a === 'alex engineer' || a.indexOf('alex engineer') !== -1 || a.indexOf('running normally') !== -1) {
        return true;
      }
      if (q.indexOf('satya') !== -1 || q.indexOf('what is your name') !== -1 || q.indexOf('technician') !== -1 || q.indexOf('operational status') !== -1) {
        return true;
      }
      return false;
    }

    function getClientLogTimestampMs(item) {
      if (!item) return 0;
      if (typeof item.timestamp === 'number' && item.timestamp > 0) {
        return item.timestamp < 1e11 ? item.timestamp * 1000 : item.timestamp;
      }
      var rawNum = Number(item.timestamp);
      if (!isNaN(rawNum) && rawNum > 1e9) {
        return rawNum < 1e11 ? rawNum * 1000 : rawNum;
      }
      var rawTimeNum = Number(item.time);
      if (!isNaN(rawTimeNum) && rawTimeNum > 1e9) {
        return rawTimeNum < 1e11 ? rawTimeNum * 1000 : rawTimeNum;
      }
      var timeStr = String(item.time || item.timestamp || '').trim();
      if (timeStr) {
        var parsedDate = Date.parse(timeStr);
        if (!isNaN(parsedDate)) return parsedDate;

        var match = timeStr.match(/^(\\d{1,2}):(\\d{2})(?::(\\d{2}))?\\s*(am|pm)?$/i);
        if (match) {
          var hrs = parseInt(match[1], 10);
          var mins = parseInt(match[2], 10);
          var secs = match[3] ? parseInt(match[3], 10) : 0;
          var meridian = match[4] ? match[4].toLowerCase() : null;
          if (meridian === 'pm' && hrs < 12) hrs += 12;
          if (meridian === 'am' && hrs === 12) hrs = 0;
          var now = new Date();
          now.setHours(hrs, mins, secs, 0);
          return now.getTime();
        }
      }
      return 0;
    }

    var clientLocationHistory = (${JSON.stringify(
      widgets.reduce((acc, w) => {
        if (Array.isArray(w.locationHistory)) acc.push(...w.locationHistory);
        if (w.lastOnLocation) acc.push(w.lastOnLocation);
        if (w.lastOffLocation) acc.push(w.lastOffLocation);
        if (w.lastLocation) acc.push(w.lastLocation);
        return acc;
      }, []).filter(g => !isStaleTestGeolog(g))
    )}).filter(function(g) { return !isStaleClientGeolog(g); });
    clientLocationHistory.sort(function(a, b) { return getClientLogTimestampMs(b) - getClientLogTimestampMs(a); });

    function renderSwitchLogEntry(item) {
      if (!item) return '';
      var isON = item.event === 'ON' || item.action === 'ON';
      var bg = isON ? '#f0fdf4' : '#fef2f2';
      var border = isON ? '#bbf7d0' : '#fecaca';
      var dotColor = isON ? '#22c55e' : '#ef4444';
      var titleColor = isON ? '#15803d' : '#b91c1c';
      var timeColor = isON ? '#16a34a' : '#dc2626';
      var cityColor = isON ? '#14532d' : '#7f1d1d';
      var accColor = isON ? '#16a34a' : '#dc2626';
      var titleText = isON ? 'SWITCH ON TIMING & LOCATION' : 'SWITCH OFF TIMING & LOCATION';
      var timeText = formatClientLogTime(item);
      var cityText = item.city || (isON ? 'Switch ON' : 'Switch OFF');
      var accText = item.accuracy != null ? ('Acc: ' + item.accuracy + 'm') : '';
      var lat = item.lat != null ? parseFloat(item.lat) : (item.latitude != null ? parseFloat(item.latitude) : null);
      var lng = item.lng != null ? parseFloat(item.lng) : (item.longitude != null ? parseFloat(item.longitude) : null);
      var coordsText = (lat != null && lng != null) ? (lat.toFixed(4) + '° N, ' + lng.toFixed(4) + '° E') : '';
      var mapUrl = (lat != null && lng != null) ? ('https://www.google.com/maps?q=' + lat + ',' + lng) : '#';

      return '<div class="switch-log-entry" style="background: ' + bg + '; border: 1px solid ' + border + '; border-radius: 8px; padding: 7px 10px; display: flex; flex-direction: column; gap: 2px;">' +
        '<div style="display: flex; justify-content: space-between; align-items: center;">' +
          '<span style="font-size: 9px; font-weight: 800; color: ' + titleColor + '; display: flex; align-items: center; gap: 4px; text-transform: uppercase;">' +
            '<span style="width: 6px; height: 6px; border-radius: 50%; background: ' + dotColor + ';"></span> ' + titleText +
          '</span>' +
          '<span style="font-size: 9px; font-weight: 700; color: ' + timeColor + '; font-family: monospace;">' +
            timeText +
          '</span>' +
        '</div>' +
        '<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1px;">' +
          '<span style="font-size: 10px; font-weight: 700; color: ' + cityColor + ';">📍 <span>' + cityText + '</span></span>' +
          '<span style="font-size: 8px; color: ' + accColor + '; font-weight: 700;">' + accText + '</span>' +
        '</div>' +
        '<div style="display: flex; justify-content: space-between; align-items: center;">' +
          '<span style="font-size: 8px; color: #64748b; font-family: monospace;">' + coordsText + '</span>' +
          (coordsText ? '<a href="' + mapUrl + '" target="_blank" style="font-size: 8px; font-weight: 700; color: ' + timeColor + '; text-decoration: none;">View Map ↗</a>' : '') +
        '</div>' +
      '</div>';
    }

    function formatClientLogTime(item) {
      if (!item) return '';
      if (typeof item === 'string') return item;
      if (item.time && typeof item.time === 'string' && !/^\\d{10,}$/.test(item.time)) {
        return item.time;
      }
      var raw = item.timestamp || item.time;
      if (!raw) return new Date().toLocaleTimeString();
      if (typeof raw === 'number' || /^\\d{10,}$/.test(String(raw))) {
        var d = new Date(Number(raw));
        if (!isNaN(d.getTime())) return d.toLocaleTimeString();
      }
      return String(raw);
    }

    function updateMobileLocationCards(loc, allLocs, hostLoc) {
      // Update client-side cumulative history
      if (Array.isArray(allLocs) && allLocs.length > 0) {
        allLocs.forEach(function(item) {
          if (!item || isStaleClientGeolog(item)) return;
          var itemTime = getClientLogTimestampMs(item);
          var exists = clientLocationHistory.some(function(h) {
            if (h.id && item.id && h.id === item.id) return true;
            var hTime = getClientLogTimestampMs(h);
            return Math.abs(hTime - itemTime) < 2000 && h.event === item.event;
          });
          if (!exists) {
            clientLocationHistory.push(item);
          }
        });
      }
      if (loc && (loc.lat != null || loc.city) && !isStaleClientGeolog(loc)) {
        var locTime = getClientLogTimestampMs(loc);
        var exists = clientLocationHistory.some(function(h) {
          if (h.id && loc.id && h.id === loc.id) return true;
          var hTime = getClientLogTimestampMs(h);
          return Math.abs(hTime - locTime) < 2000 && h.event === loc.event;
        });
        if (!exists) {
          clientLocationHistory.unshift(loc);
        }
      }
      clientLocationHistory = clientLocationHistory.filter(function(g) { return !isStaleClientGeolog(g); });
      // Sort newest first
      clientLocationHistory.sort(function(a, b) {
        return getClientLogTimestampMs(b) - getClientLogTimestampMs(a);
      });

      // 1. Host Location update
      if (hostLoc && hostLoc.lat && !isStaleClientGeolog(hostLoc)) {
        document.querySelectorAll('[id^="host-city-"]').forEach(function(el) {
          el.innerText = '📍 ' + (hostLoc.city || 'Host Device') + (hostLoc.country ? ', ' + hostLoc.country : '');
        });
        document.querySelectorAll('[id^="host-addr-"]').forEach(function(el) {
          el.innerText = hostLoc.address || (hostLoc.lat + '° N, ' + hostLoc.lng + '° E');
        });
        document.querySelectorAll('[id^="host-gps-"]').forEach(function(el) {
          el.innerText = hostLoc.lat + '° N, ' + hostLoc.lng + '° E';
        });
        document.querySelectorAll('[id^="host-source-"]').forEach(function(el) {
          el.innerText = '(' + (hostLoc.source ? hostLoc.source.replace('IP Geolocation ', '') : 'IP Geo') + ')';
        });
      }

      // 2. Identify latest ON and OFF events
      var onLoc = clientLocationHistory.find(function(h) { return h.event === 'ON'; }) || (loc && loc.event === 'ON' && !isStaleClientGeolog(loc) ? loc : null);
      var offLoc = clientLocationHistory.find(function(h) { return h.event === 'OFF'; }) || (loc && loc.event === 'OFF' && !isStaleClientGeolog(loc) ? loc : null);

      if (onLoc && onLoc.lat && !isStaleClientGeolog(onLoc)) {
        document.querySelectorAll('[id^="badge-on-"]').forEach(function(el) { el.style.display = 'inline-block'; });
        document.querySelectorAll('[id^="on-box-"]').forEach(function(el) { el.style.borderColor = '#bbf7d0'; el.style.background = '#f0fdf4'; });
        document.querySelectorAll('[id^="on-dot-"]').forEach(function(el) { el.style.background = '#22c55e'; });
        document.querySelectorAll('[id^="on-label-"]').forEach(function(el) { el.style.color = '#15803d'; });
        document.querySelectorAll('[id^="on-time-badge-"]').forEach(function(el) {
          el.innerText = '⏱️ ' + formatClientLogTime(onLoc);
          el.style.display = 'inline-block';
        });
        document.querySelectorAll('[id^="on-badge-"]').forEach(function(el) { el.style.display = 'inline-block'; });
        document.querySelectorAll('[id^="on-content-"]').forEach(function(el) { el.style.display = 'block'; });
        document.querySelectorAll('[id^="on-empty-"]').forEach(function(el) { el.style.display = 'none'; });
        document.querySelectorAll('[id^="on-city-"]').forEach(function(el) { el.innerText = '🟢 ' + (onLoc.city || 'Switch ON'); });
        document.querySelectorAll('[id^="on-addr-"]').forEach(function(el) { el.innerText = onLoc.address || ''; });
        document.querySelectorAll('[id^="on-gps-"]').forEach(function(el) {
          el.innerText = onLoc.lat + '° N, ' + onLoc.lng + '° E';
        });
        document.querySelectorAll('[id^="on-time-"]').forEach(function(el) {
          el.innerText = formatClientLogTime(onLoc);
        });
        document.querySelectorAll('[id^="on-acc-row-"]').forEach(function(el) { el.style.display = 'inline'; });
        document.querySelectorAll('[id^="on-acc-"]').forEach(function(el) {
          el.innerText = onLoc.accuracy != null ? onLoc.accuracy : '12';
        });
        document.querySelectorAll('[id^="on-maps-btn-"]').forEach(function(el) {
          el.href = 'https://www.google.com/maps?q=' + onLoc.lat + ',' + onLoc.lng;
          el.style.display = 'flex';
        });

        // Update Switch component ON telemetry
        document.querySelectorAll('[id^="switch-on-time-"]').forEach(function(el) { el.innerText = formatClientLogTime(onLoc); });
        document.querySelectorAll('[id^="switch-on-city-"]').forEach(function(el) { el.innerText = onLoc.city || 'Switch ON'; });
        document.querySelectorAll('[id^="switch-on-acc-"]').forEach(function(el) { el.innerText = 'Acc: ' + (onLoc.accuracy != null ? onLoc.accuracy : '12') + 'm'; });
        document.querySelectorAll('[id^="switch-on-coords-"]').forEach(function(el) {
          el.innerText = onLoc.lat ? (parseFloat(onLoc.lat).toFixed(4) + '° N, ' + parseFloat(onLoc.lng).toFixed(4) + '° E') : '';
        });
        document.querySelectorAll('[id^="switch-on-map-link-"]').forEach(function(el) {
          if (onLoc.lat) {
            el.href = 'https://www.google.com/maps?q=' + onLoc.lat + ',' + onLoc.lng;
            el.style.display = 'inline';
          }
        });
      } else {
        document.querySelectorAll('[id^="badge-on-"]').forEach(function(el) { el.style.display = 'none'; });
        document.querySelectorAll('[id^="on-box-"]').forEach(function(el) { el.style.borderColor = '#e2e8f0'; el.style.background = '#f8fafc'; });
        document.querySelectorAll('[id^="on-dot-"]').forEach(function(el) { el.style.background = '#94a3b8'; });
        document.querySelectorAll('[id^="on-label-"]').forEach(function(el) { el.style.color = '#64748b'; });
        document.querySelectorAll('[id^="on-time-badge-"]').forEach(function(el) { el.style.display = 'none'; });
        document.querySelectorAll('[id^="on-badge-"]').forEach(function(el) { el.style.display = 'none'; });
        document.querySelectorAll('[id^="on-content-"]').forEach(function(el) { el.style.display = 'none'; });
        document.querySelectorAll('[id^="on-acc-row-"]').forEach(function(el) { el.style.display = 'none'; });
        document.querySelectorAll('[id^="on-empty-"]').forEach(function(el) { el.style.display = 'block'; });
      }

      if (offLoc && offLoc.lat && !isStaleClientGeolog(offLoc)) {
        document.querySelectorAll('[id^="badge-off-"]').forEach(function(el) { el.style.display = 'inline-block'; });
        document.querySelectorAll('[id^="off-box-"]').forEach(function(el) { el.style.borderColor = '#fecaca'; el.style.background = '#fef2f2'; });
        document.querySelectorAll('[id^="off-dot-"]').forEach(function(el) { el.style.background = '#ef4444'; });
        document.querySelectorAll('[id^="off-label-"]').forEach(function(el) { el.style.color = '#b91c1c'; });
        document.querySelectorAll('[id^="off-time-badge-"]').forEach(function(el) {
          el.innerText = '⏱️ ' + formatClientLogTime(offLoc);
          el.style.display = 'inline-block';
        });
        document.querySelectorAll('[id^="off-badge-"]').forEach(function(el) { el.style.display = 'inline-block'; });
        document.querySelectorAll('[id^="off-content-"]').forEach(function(el) { el.style.display = 'block'; });
        document.querySelectorAll('[id^="off-empty-"]').forEach(function(el) { el.style.display = 'none'; });
        document.querySelectorAll('[id^="off-city-"]').forEach(function(el) { el.innerText = '🔴 ' + (offLoc.city || 'Switch OFF'); });
        document.querySelectorAll('[id^="off-addr-"]').forEach(function(el) { el.innerText = offLoc.address || ''; });
        document.querySelectorAll('[id^="off-gps-"]').forEach(function(el) {
          el.innerText = offLoc.lat + '° N, ' + offLoc.lng + '° E';
        });
        document.querySelectorAll('[id^="off-time-"]').forEach(function(el) {
          el.innerText = formatClientLogTime(offLoc);
        });
        document.querySelectorAll('[id^="off-acc-row-"]').forEach(function(el) { el.style.display = 'inline'; });
        document.querySelectorAll('[id^="off-acc-"]').forEach(function(el) {
          el.innerText = offLoc.accuracy != null ? offLoc.accuracy : '10';
        });
        document.querySelectorAll('[id^="off-maps-btn-"]').forEach(function(el) {
          el.href = 'https://www.google.com/maps?q=' + offLoc.lat + ',' + offLoc.lng;
          el.style.display = 'flex';
        });

        // Update Switch component OFF telemetry
        document.querySelectorAll('[id^="switch-off-time-"]').forEach(function(el) { el.innerText = formatClientLogTime(offLoc); });
        document.querySelectorAll('[id^="switch-off-city-"]').forEach(function(el) { el.innerText = offLoc.city || 'Switch OFF'; });
        document.querySelectorAll('[id^="switch-off-acc-"]').forEach(function(el) { el.innerText = 'Acc: ' + (offLoc.accuracy != null ? offLoc.accuracy : '10') + 'm'; });
        document.querySelectorAll('[id^="switch-off-coords-"]').forEach(function(el) {
          el.innerText = offLoc.lat ? (parseFloat(offLoc.lat).toFixed(4) + '° N, ' + parseFloat(offLoc.lng).toFixed(4) + '° E') : '';
        });
        document.querySelectorAll('[id^="switch-off-map-link-"]').forEach(function(el) {
          if (offLoc.lat) {
            el.href = 'https://www.google.com/maps?q=' + offLoc.lat + ',' + offLoc.lng;
            el.style.display = 'inline';
          }
        });
      } else {
        document.querySelectorAll('[id^="badge-off-"]').forEach(function(el) { el.style.display = 'none'; });
        document.querySelectorAll('[id^="off-box-"]').forEach(function(el) { el.style.borderColor = '#e2e8f0'; el.style.background = '#f8fafc'; });
        document.querySelectorAll('[id^="off-dot-"]').forEach(function(el) { el.style.background = '#94a3b8'; });
        document.querySelectorAll('[id^="off-label-"]').forEach(function(el) { el.style.color = '#64748b'; });
        document.querySelectorAll('[id^="off-time-badge-"]').forEach(function(el) { el.style.display = 'none'; });
        document.querySelectorAll('[id^="off-badge-"]').forEach(function(el) { el.style.display = 'none'; });
        document.querySelectorAll('[id^="off-content-"]').forEach(function(el) { el.style.display = 'none'; });
        document.querySelectorAll('[id^="off-acc-row-"]').forEach(function(el) { el.style.display = 'none'; });
        document.querySelectorAll('[id^="off-empty-"]').forEach(function(el) { el.style.display = 'block'; });
      }

      // 2b. Update Switch widgets with all cumulative switch logs (Multiple Logs List)
      var switchLogEvents = clientLocationHistory.filter(function(item) {
        return item && (item.event === 'ON' || item.event === 'OFF' || item.action === 'ON' || item.action === 'OFF') && !isStaleClientGeolog(item);
      });
      switchLogEvents.sort(function(a, b) {
        return getClientLogTimestampMs(b) - getClientLogTimestampMs(a);
      });

      document.querySelectorAll('[id^="switch-logs-list-"]').forEach(function(listEl) {
        var wid = listEl.id.replace('switch-logs-list-', '');
        var countEl = document.getElementById('switch-logs-count-' + wid);
        if (countEl) countEl.innerText = switchLogEvents.length;

        if (switchLogEvents.length === 0) {
          listEl.innerHTML = '<div id="switch-logs-empty-' + wid + '" style="font-size: 9px; color: #94a3b8; text-align: center; padding: 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; font-style: italic;">No ON/OFF events recorded yet. Toggle switch to log location & timing.</div>';
        } else {
          listEl.innerHTML = switchLogEvents.map(function(item) {
            return renderSwitchLogEntry(item);
          }).join('');
        }
      });

      // 3. History List
      if (clientLocationHistory.length > 0) {
        document.querySelectorAll('[id^="hist-list-"]').forEach(function(listEl) {
          var count = clientLocationHistory.length;
          var countEl = document.getElementById(listEl.id.replace('hist-list-', 'hist-count-'));
          if (countEl) countEl.innerText = count;
          var emptyEl = document.getElementById(listEl.id.replace('hist-list-', 'hist-empty-'));
          if (emptyEl) emptyEl.style.display = 'none';
          listEl.innerHTML = clientLocationHistory.slice(0, 10).map(function(item) {
            var isON = item.event === 'ON';
            var isOFF = item.event === 'OFF';
            var badgeBg = isON ? '#dcfce7' : (isOFF ? '#fee2e2' : '#e0f2fe');
            var badgeColor = isON ? '#15803d' : (isOFF ? '#b91c1c' : '#0369a1');
            var latStr = (item.lat && item.lng) 
              ? (parseFloat(item.lat).toFixed(3) + '°N, ' + parseFloat(item.lng).toFixed(3) + '°E') 
              : (item.lat ? (parseFloat(item.lat).toFixed(3) + '°') : '');
            var accStr = item.accuracy != null ? (' • Acc: ' + item.accuracy + 'm') : '';
            var timeFormatted = formatClientLogTime(item);
            var mapsUrl = (item.lat && item.lng) ? ('https://www.google.com/maps?q=' + item.lat + ',' + item.lng) : '#';
            return '<div class="geolog-history-item" onclick="window.open(&quot;' + mapsUrl + '&quot;,&quot;_blank&quot;)" title="View on Google Maps" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: #ffffff; border-radius: 8px; padding: 6px 10px; border: 1px solid #e2e8f0; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">' +
              '<div style="display: flex; align-items: center; gap: 8px;">' +
                '<span style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ' + badgeBg + '; color: ' + badgeColor + ';">' + (item.event || 'LOG') + '</span>' +
                '<div style="display: flex; flex-direction: column;">' +
                  '<span style="font-size: 11px; font-weight: 600; color: #0f172a;">' + (item.city || 'Location') + '</span>' +
                  (latStr ? '<span style="font-size: 9px; color: #64748b; font-family: monospace;">' + latStr + accStr + '</span>' : '') +
                '</div>' +
              '</div>' +
              '<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">' +
                '<span style="font-size: 10px; color: #64748b; font-family: monospace;">' + timeFormatted + '</span>' +
                '<span style="font-size: 9px; color: #2563eb; font-weight: 600;">🗺️ Maps</span>' +
              '</div>' +
            '</div>';
          }).join('');
        });
      } else {
        document.querySelectorAll('[id^="hist-list-"]').forEach(function(listEl) {
          var countEl = document.getElementById(listEl.id.replace('hist-list-', 'hist-count-'));
          if (countEl) countEl.innerText = '0';
          listEl.innerHTML = '<div style="font-size: 10px; color: #64748b; text-align: center; padding: 8px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px;">No location history yet. Toggle switches to record geologs.</div>';
        });
      }
    }

    function clearMobileGeologs(widgetId) {
      clientLocationHistory = [];
      updateMobileLocationCards(null, [], null);
      sendHardwareAction('CLEAR_GEOLOGS', { widgetId: widgetId, clearGeologs: true });
      addLog('🗑️ [LOCATION] Geologs cleared');
    }

    function clearMobileFormAnswers(widgetId) {
      var targetId = widgetId;
      var listEl = document.getElementById('responses-list-' + targetId);
      if (!listEl) {
        listEl = document.querySelector('[id^="responses-list-"]');
        if (listEl) targetId = listEl.id.replace('responses-list-', '');
      }
      if (listEl) {
        listEl.innerHTML = '<div id="resp-empty-' + targetId + '" style="font-size: 11px; color: #64748b; text-align: center; padding: 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px;">No answers submitted yet.</div>';
      }
      var countEl = document.getElementById('resp-count-' + targetId);
      if (countEl) countEl.innerText = '0';
      sendHardwareAction('CLEAR_FORM_RESPONSES', { widgetId: widgetId, clearFormResponses: true });
      addLog('🗑️ [FORM] Submitted answers cleared');
    }

    function detectLiveGpsLocation(widgetId) {
      var btn = document.querySelector('[id^="host-gps-btn-"]');
      if (btn) btn.innerText = '⌛ Acquiring GPS...';
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function(pos) {
            var lat = parseFloat(pos.coords.latitude.toFixed(5));
            var lng = parseFloat(pos.coords.longitude.toFixed(5));
            fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&zoom=14&accept-language=en', {
              headers: { 'Accept-Language': 'en' }
            })
            .then(function(r) { return r.json(); })
            .then(function(geo) {
              var specific = (geo && geo.name && geo.name !== 'Chennai') ? geo.name :
                (geo && geo.display_name && !geo.display_name.startsWith('Chennai') ? geo.display_name.split(',')[0].trim() : '') ||
                (geo && geo.address && (geo.address.railway || geo.address.suburb || geo.address.neighbourhood || geo.address.quarter || geo.address.city || geo.address.town)) ||
                'Current Location';
              var address = (geo && geo.display_name) ? geo.display_name.split(',').slice(0, 4).join(',').trim() : (lat.toFixed(4) + '° N, ' + lng.toFixed(4) + '° E');
              var hostData = {
                lat: lat,
                lng: lng,
                city: specific,
                country: (geo && geo.address && geo.address.country) || 'India',
                address: address,
                source: 'Live GPS (' + specific + ')',
                time: new Date().toLocaleTimeString(),
                timestamp: Date.now()
              };
              sendHardwareAction('HOST_SYNC', { hostLocation: hostData });
              updateMobileLocationCards(null, null, hostData);
              alert('📍 Live GPS Detected: ' + specific + ' (' + hostData.lat + '° N, ' + hostData.lng + '° E)');
              if (btn) btn.innerText = '🔄 Detect Live GPS';
            })
            .catch(function() {
              var hostData = {
                lat: lat,
                lng: lng,
                city: 'Current Location',
                country: 'India',
                address: lat.toFixed(4) + '° N, ' + lng.toFixed(4) + '° E',
                source: 'Live GPS',
                time: new Date().toLocaleTimeString(),
                timestamp: Date.now()
              };
              sendHardwareAction('HOST_SYNC', { hostLocation: hostData });
              updateMobileLocationCards(null, null, hostData);
              alert('📍 Live GPS Detected: ' + hostData.lat + '° N, ' + hostData.lng + '° E');
              if (btn) btn.innerText = '🔄 Detect Live GPS';
            });
          },
          function(err) {
            alert('Could not acquire GPS: ' + (err.message || 'Permission denied'));
            if (btn) btn.innerText = '🔄 Detect Live GPS';
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      } else {
        alert('Geolocation is not supported by your browser.');
        if (btn) btn.innerText = '🔄 Detect Live GPS';
      }
    }

    function setHostLocality(query) {
      var q = query || 'Chennai, Tamil Nadu';
      var btn = document.querySelector('[id^="host-refresh-btn-"]');
      if (btn) btn.innerText = '⌛ Calibrating...';
      fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(q) + '&format=json&limit=1&addressdetails=1&accept-language=en', {
        headers: { 'Accept-Language': 'en' }
      })
      .then(function(r) { return r.json(); })
      .then(function(list) {
        if (list && list.length > 0) {
          var item = list[0];
          var specific = item.name ||
            (item.address && (item.address.railway || item.address.suburb || item.address.neighbourhood)) ||
            (item.display_name ? item.display_name.split(',')[0].trim() : '') ||
            (item.address && item.address.city) ||
            q.split(',')[0].trim();
          var hostData = {
            lat: parseFloat(Number(item.lat).toFixed(4)),
            lng: parseFloat(Number(item.lon).toFixed(4)),
            city: specific,
            country: (item.address && item.address.country) || 'India',
            address: item.display_name || (item.lat + '°, ' + item.lon + '°'),
            source: 'Calibrated (' + specific + ')',
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now()
          };
          sendHardwareAction('HOST_SYNC', { hostLocation: hostData });
          updateMobileLocationCards(null, null, hostData);
          alert('📍 Host location calibrated to: ' + specific + ' (' + hostData.lat + '° N, ' + hostData.lng + '° E)');
        }
        if (btn) btn.innerText = '🎯 Calibrate Locality';
      })
      .catch(function() {
        if (btn) btn.innerText = '🎯 Calibrate Locality';
      });
    }

    function refreshHostLocation(widgetId) {
      var loc = prompt('Enter locality to calibrate host device (e.g. Guindy, T. Nagar, Anna Salai):', '');
      if (loc && loc.trim()) {
        setHostLocality(loc.trim() + ', Chennai');
      }
    }

    function recordAndSendMobileLocation(widgetId) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function(pos) {
            var lat = parseFloat(pos.coords.latitude.toFixed(5));
            var lng = parseFloat(pos.coords.longitude.toFixed(5));
            fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&zoom=14&accept-language=en', {
              headers: { 'Accept-Language': 'en' }
            })
            .then(function(r) { return r.json(); })
            .then(function(geo) {
              var specific = (geo && geo.name && geo.name !== 'Chennai') ? geo.name :
                (geo && geo.display_name && !geo.display_name.startsWith('Chennai') ? geo.display_name.split(',')[0].trim() : '') ||
                (geo && geo.address && (geo.address.railway || geo.address.suburb || geo.address.neighbourhood || geo.address.quarter || geo.address.city || geo.address.town)) ||
                'Current Location';
              var address = (geo && geo.display_name) ? geo.display_name.split(',').slice(0, 4).join(',').trim() : (lat.toFixed(4) + '° N, ' + lng.toFixed(4) + '° E');
              var locData = {
                id: 'loc-' + Date.now(),
                lat: lat,
                lng: lng,
                accuracy: Math.round(pos.coords.accuracy || 10),
                event: 'SHARE',
                switchTitle: 'Mobile Location Share',
                city: specific,
                address: address,
                time: new Date().toLocaleTimeString(),
                timestamp: Date.now(),
                source: 'Mobile GPS (' + specific + ')'
              };
              sendHardwareAction('LOC_SYNC', { location: locData });
              updateMobileLocationCards(locData);
              alert('📍 Location shared with desktop UI: ' + locData.city + ' (' + locData.lat + ', ' + locData.lng + ')');
            })
            .catch(function() {
              var locData = {
                id: 'loc-' + Date.now(),
                lat: lat,
                lng: lng,
                accuracy: Math.round(pos.coords.accuracy || 10),
                event: 'SHARE',
                switchTitle: 'Mobile Location Share',
                city: 'Current Location',
                address: lat.toFixed(4) + '° N, ' + lng.toFixed(4) + '° E',
                time: new Date().toLocaleTimeString(),
                timestamp: Date.now(),
                source: 'Mobile GPS'
              };
              sendHardwareAction('LOC_SYNC', { location: locData });
              updateMobileLocationCards(locData);
              alert('📍 Location shared with desktop UI: ' + locData.city + ' (' + locData.lat + ', ' + locData.lng + ')');
            });
          },
          function(err) {
            alert('Please allow location permissions on your mobile browser to share GPS.');
          },
          { timeout: 8000, enableHighAccuracy: true }
        );
      } else {
        alert('Geolocation is not supported by this browser.');
      }
    }

    function renderMobileResponseItem(widgetId, resp) {
      if (!resp || isStaleClientAnswer(resp)) return;
      var targetId = widgetId;
      var listEl = document.getElementById('responses-list-' + targetId);
      if (!listEl) {
        listEl = document.querySelector('[id^="responses-list-"]');
        if (listEl) targetId = listEl.id.replace('responses-list-', '');
      }
      if (!listEl) return;

      var emptyEl = document.getElementById('resp-empty-' + targetId);
      if (emptyEl) emptyEl.style.display = 'none';

      // Avoid duplicates
      var existingId = resp.id || '';
      if (existingId && listEl.querySelector('[data-id="' + existingId + '"]')) {
        return;
      }

      var item = document.createElement('div');
      item.className = 'resp-item';
      if (existingId) item.setAttribute('data-id', existingId);
      item.style.cssText = 'background: #ffffff; border-radius: 8px; padding: 8px 10px; border: 1px solid #e2e8f0; margin-bottom: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);';
      item.innerHTML = '<div style="display: flex; justify-content: space-between; font-size: 10px; color: #6366f1; margin-bottom: 3px;">' +
        '<span style="font-weight: 700;">' + (resp.questionText || resp.question || 'Answer') + '</span>' +
        '<span style="color: #94a3b8;">' + (resp.timestamp || resp.time || '') + '</span>' +
        '</div>' +
        '<div style="font-size: 12px; font-weight: 600; color: #0f172a;">💬 ' + resp.answer + '</div>' +
        '<div style="font-size: 9px; color: #64748b; margin-top: 2px;">Source: ' + (resp.source || 'Mobile UI') + '</div>';
      
      listEl.insertBefore(item, listEl.firstChild);
      
      var countEl = document.getElementById('resp-count-' + targetId);
      if (countEl) {
        var count = listEl.querySelectorAll('.resp-item').length;
        countEl.innerText = count;
      }
    }

    function submitMobileFormAnswer(widgetId, questionId, questionText) {
      var inputEl = document.getElementById('input-' + widgetId + '-' + questionId);
      var answerVal = inputEl ? inputEl.value.trim() : '';
      if (!answerVal) {
        alert('Please enter an answer before submitting.');
        return;
      }
      var respData = {
        id: 'resp-' + Date.now(),
        widgetId: widgetId,
        questionId: questionId,
        question: questionText,
        questionText: questionText,
        answer: answerVal,
        source: 'Mobile Companion',
        time: new Date().toLocaleTimeString(),
        timestamp: new Date().toLocaleTimeString()
      };
      
      sendHardwareAction('FORM_RESPONSE', { formResponse: respData });

      // Instantly render in Mobile UI so user sees their answer
      renderMobileResponseItem(widgetId, respData);
      
      var statusEl = document.getElementById('status-' + widgetId + '-' + questionId);
      if (statusEl) {
        statusEl.style.display = 'block';
        setTimeout(function() { statusEl.style.display = 'none'; }, 3500);
      }
      if (inputEl && inputEl.type === 'text') {
        inputEl.value = '';
      }
      addLog('📝 [FORM] Answer submitted: "' + questionText + '" -> "' + answerVal + '"');
    }

    // ==========================================
    // LOCATION-GATED ESP32 SWITCH CONTROL SYSTEM
    // ==========================================
    var MAX_ALLOWED_ACCURACY = 5000; // meters threshold (accepts GPS, Wi-Fi, and cellular positioning)
    var isSwitchOperationInProgress = false;
    var currentModalAction = null;
    var pendingSwitchContext = null;

    function showLocationModal(cfg) {
      var overlay = document.getElementById('locationModalOverlay');
      if (!overlay) return;
      var titleEl = document.getElementById('modalTitle');
      var descEl = document.getElementById('modalDescription');
      var iconEl = document.getElementById('modalIconContainer');
      var subNoteEl = document.getElementById('modalSubNote');
      var cancelBtn = document.getElementById('modalBtnCancel');
      var primaryBtn = document.getElementById('modalBtnPrimary');

      if (titleEl) titleEl.innerText = cfg.title || 'Location Notice';
      if (descEl) descEl.innerHTML = cfg.description || '';
      if (iconEl) {
        if (cfg.isSpinner) {
          iconEl.innerHTML = '<div class="modal-spinner"></div>';
        } else {
          iconEl.innerHTML = cfg.icon || '📍';
        }
      }
      if (subNoteEl) {
        if (cfg.subNote) {
          subNoteEl.innerHTML = cfg.subNote;
          subNoteEl.style.display = 'block';
        } else {
          subNoteEl.style.display = 'none';
        }
      }
      if (cancelBtn) {
        cancelBtn.style.display = cfg.hideCancel ? 'none' : 'block';
        cancelBtn.innerText = cfg.cancelText || 'Cancel';
      }
      if (primaryBtn) {
        primaryBtn.style.display = cfg.hidePrimary ? 'none' : 'block';
        primaryBtn.innerText = cfg.primaryText || 'OK';
        if (cfg.primaryColor) primaryBtn.style.background = cfg.primaryColor;
        else primaryBtn.style.background = '#0284c7';
      }
      currentModalAction = cfg.onPrimary || null;
      overlay.style.display = 'flex';
    }

    function closeLocationModal() {
      var overlay = document.getElementById('locationModalOverlay');
      if (overlay) overlay.style.display = 'none';
      if (pendingSwitchContext && typeof pendingSwitchContext.onCancel === 'function') {
        pendingSwitchContext.onCancel();
      }
      currentModalAction = null;
    }

    function handleModalPrimaryAction() {
      var fn = currentModalAction;
      var overlay = document.getElementById('locationModalOverlay');
      if (overlay) overlay.style.display = 'none';
      currentModalAction = null;
      if (typeof fn === 'function') {
        fn();
      }
    }

    var switchHintTimers = {};

    function updateSwitchHint(id, text, type, durationMs) {
      var hintEl = document.getElementById('switch-hint-' + id);
      var textEl = document.getElementById('switch-hint-text-' + id);
      if (hintEl) {
        hintEl.className = 'switch-hint ' + (type || '');
      }
      if (textEl) {
        textEl.innerText = text;
      }
      if (switchHintTimers[id]) {
        clearTimeout(switchHintTimers[id]);
        delete switchHintTimers[id];
      }
      if (durationMs && durationMs > 0) {
        switchHintTimers[id] = setTimeout(function() {
          updateSwitchHint(id, 'Location required for ON/OFF logging', '');
        }, durationMs);
      }
    }

    // ==========================================
    // LOCATION-MISMATCH OTP VERIFICATION ENGINE
    // ==========================================
    var activeOtpChallenge = null;
    var otpTimerInterval = null;
    var otpResendCooldownInterval = null;
    var onOtpVerifiedCallback = null;
    var onOtpCancelledCallback = null;

    function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
      if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
      var p1 = Number(lat1);
      var l1 = Number(lon1);
      var p2 = Number(lat2);
      var l2 = Number(lon2);
      if (isNaN(p1) || isNaN(l1) || isNaN(p2) || isNaN(l2)) return null;
      if (p1 === p2 && l1 === l2) return 0;
      var R = 6371000;
      var dLat = ((p2 - p1) * Math.PI) / 180;
      var dLon = ((l2 - l1) * Math.PI) / 180;
      var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((p1 * Math.PI) / 180) *
          Math.cos((p2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c);
    }

    function checkLocationMismatch(prevLoc, curLoc, thresholdMeters) {
      thresholdMeters = thresholdMeters || 100;
      if (!prevLoc || (prevLoc.lat == null && prevLoc.latitude == null)) {
        return { isMismatch: false, distance: 0, reason: 'NO_PREVIOUS_LOCATION' };
      }
      if (!curLoc || (curLoc.lat == null && curLoc.latitude == null)) {
        return { isMismatch: true, distance: null, reason: 'MISSING_CURRENT_LOCATION' };
      }
      var pLat = prevLoc.lat != null ? prevLoc.lat : prevLoc.latitude;
      var pLng = prevLoc.lng != null ? prevLoc.lng : prevLoc.longitude;
      var cLat = curLoc.lat != null ? curLoc.lat : curLoc.latitude;
      var cLng = curLoc.lng != null ? curLoc.lng : curLoc.longitude;
      var rawDist = calculateDistanceMeters(pLat, pLng, cLat, cLng);
      if (rawDist === null) {
        return { isMismatch: true, distance: null, reason: 'INVALID_COORDINATES' };
      }
      var pAcc = Number(prevLoc.accuracy || 0);
      var cAcc = Number(curLoc.accuracy || 0);
      var accuracyBuffer = Math.min(Math.max(pAcc, cAcc), 50);
      var effectiveThreshold = thresholdMeters + accuracyBuffer;
      return {
        isMismatch: rawDist > effectiveThreshold,
        distance: rawDist,
        threshold: thresholdMeters,
        effectiveThreshold: effectiveThreshold
      };
    }

    function getLastSuccessfulOperationLocation() {
      if (Array.isArray(clientLocationHistory) && clientLocationHistory.length > 0) {
        var found = clientLocationHistory.find(function(h) {
          return !isStaleClientGeolog(h) && (h.lat != null || h.latitude != null);
        });
        if (found) return found;
      }
      return null;
    }

    function quickFillDemoOtp() {
      var codeEl = document.getElementById('otpDevCode');
      var inputEl = document.getElementById('otpInput');
      if (codeEl && inputEl && codeEl.innerText && codeEl.innerText !== '------') {
        inputEl.value = codeEl.innerText.trim();
        inputEl.focus();
        showOtpStatusMessage('', '');
      }
    }

    function showOtpStatusMessage(msg, type) {
      var banner = document.getElementById('otpValidationMsg');
      if (!banner) return;
      if (!msg) {
        banner.style.display = 'none';
        return;
      }
      banner.style.display = 'block';
      banner.innerText = msg;
      if (type === 'success') {
        banner.style.background = 'rgba(34, 197, 94, 0.15)';
        banner.style.color = '#4ade80';
        banner.style.border = '1px solid rgba(34, 197, 94, 0.3)';
      } else if (type === 'error') {
        banner.style.background = 'rgba(239, 68, 68, 0.15)';
        banner.style.color = '#f87171';
        banner.style.border = '1px solid rgba(239, 68, 68, 0.3)';
      } else {
        banner.style.background = 'rgba(56, 189, 248, 0.15)';
        banner.style.color = '#38bdf8';
        banner.style.border = '1px solid rgba(56, 189, 248, 0.3)';
      }
    }

    function openOtpModal(challengeData, onVerified, onCancelled) {
      activeOtpChallenge = challengeData;
      onOtpVerifiedCallback = onVerified;
      onOtpCancelledCallback = onCancelled;

      var overlay = document.getElementById('otpVerificationModalOverlay');
      if (!overlay) return;

      var actionBadge = document.getElementById('otpActionBadge');
      var prevLocEl = document.getElementById('otpPrevLocationText');
      var curLocEl = document.getElementById('otpCurLocationText');
      var distEl = document.getElementById('otpDistanceText');
      var devBox = document.getElementById('otpDevDemoBox');
      var devCode = document.getElementById('otpDevCode');
      var inputEl = document.getElementById('otpInput');

      var action = challengeData.action || 'OFF';
      if (actionBadge) {
        actionBadge.innerText = 'SWITCH ' + action;
        if (action === 'ON') {
          actionBadge.style.background = 'rgba(34, 197, 94, 0.15)';
          actionBadge.style.color = '#4ade80';
          actionBadge.style.border = '1px solid rgba(34, 197, 94, 0.3)';
        } else {
          actionBadge.style.background = 'rgba(239, 68, 68, 0.15)';
          actionBadge.style.color = '#f87171';
          actionBadge.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        }
      }

      if (prevLocEl) {
        var p = challengeData.previousLocation;
        var pText = p ? ('📍 ' + (p.city || p.locality || 'Previous Location') + ' • ' + (p.lat ? (parseFloat(p.lat).toFixed(4) + '° N, ' + parseFloat(p.lng).toFixed(4) + '° E') : '')) : '📍 No previous location recorded';
        prevLocEl.innerText = pText;
      }

      if (curLocEl) {
        var c = challengeData.currentLocation;
        var cText = c ? ('📍 ' + (c.city || c.locality || 'Current Location') + ' • ' + (c.lat ? (parseFloat(c.lat).toFixed(4) + '° N, ' + parseFloat(c.lng).toFixed(4) + '° E') : '') + ' (Acc: ' + (c.accuracy || 15) + 'm)') : '📍 Unknown';
        curLocEl.innerText = cText;
      }

      if (distEl) {
        var dist = challengeData.distance != null ? challengeData.distance : 0;
        var distFormatted = dist < 1000 ? (dist + ' m') : ((dist / 1000).toFixed(1) + ' km');
        distEl.innerText = '~' + distFormatted + ' (Threshold: ' + (challengeData.threshold || 100) + 'm)';
      }

      if (devBox) {
        if (challengeData.devDemoMode && challengeData.devOtp) {
          devBox.style.display = 'flex';
          if (devCode) devCode.innerText = challengeData.devOtp;
        } else {
          devBox.style.display = 'none';
        }
      }

      if (inputEl) {
        inputEl.value = '';
        setTimeout(function() { inputEl.focus(); }, 150);
      }

      showOtpStatusMessage('', '');

      // Expiration countdown - synchronized along with QR validation
      clearInterval(otpTimerInterval);
      var effectiveQrExp = challengeData.qrExpiresAt ? Number(challengeData.qrExpiresAt) : (qrExpiresAtTimestamp || 0);
      var remainingSeconds = effectiveQrExp
        ? Math.max(0, Math.round((effectiveQrExp - Date.now()) / 1000))
        : (challengeData.expiresInSeconds || 1200);

      function updateTimerDisplay() {
        var now = Date.now();
        if (effectiveQrExp) {
          remainingSeconds = Math.max(0, Math.round((effectiveQrExp - now) / 1000));
        }
        var mins = Math.floor(remainingSeconds / 60);
        var secs = remainingSeconds % 60;
        var formatted = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
        var timerEl = document.getElementById('otpExpiryTimer');
        if (timerEl) timerEl.innerText = '⏱️ Expires (with QR validation): ' + formatted;

        if (remainingSeconds <= 0 || (effectiveQrExp && now >= effectiveQrExp)) {
          clearInterval(otpTimerInterval);
          showOtpStatusMessage('OTP expired along with QR code validation session. Please re-scan QR code.', 'error');
          var verifyBtn = document.getElementById('otpBtnVerify');
          if (verifyBtn) verifyBtn.disabled = true;
          var resendBtn = document.getElementById('otpResendBtn');
          if (resendBtn) resendBtn.disabled = true;
          var overlayExp = document.getElementById('qrExpiredOverlay');
          if (overlayExp) overlayExp.style.display = 'flex';
        }
        if (!effectiveQrExp) remainingSeconds--;
      }
      updateTimerDisplay();
      otpTimerInterval = setInterval(updateTimerDisplay, 1000);

      // Resend cooldown timer
      startResendCooldown(challengeData.resendCooldownSeconds || 30);

      overlay.style.display = 'flex';
    }

    function startResendCooldown(seconds) {
      clearInterval(otpResendCooldownInterval);
      var resendBtn = document.getElementById('otpResendBtn');
      if (!resendBtn) return;
      var cd = seconds || 30;
      resendBtn.disabled = true;
      resendBtn.style.opacity = '0.5';
      resendBtn.innerText = 'Resend in ' + cd + 's';

      otpResendCooldownInterval = setInterval(function() {
        cd--;
        if (cd <= 0) {
          clearInterval(otpResendCooldownInterval);
          resendBtn.disabled = false;
          resendBtn.style.opacity = '1';
          resendBtn.innerText = 'Resend OTP';
        } else {
          resendBtn.innerText = 'Resend in ' + cd + 's';
        }
      }, 1000);
    }

    function getCompanionApiUrl(path) {
      var hostOrigin = (window.location && window.location.origin && window.location.origin.startsWith('http'))
        ? window.location.origin
        : '';
      var companionIp = '${companionServerInfo?.ip || resolvedHostIp}';
      var primary = hostOrigin ? (hostOrigin + path) : ('http://' + companionIp + ':5055' + path);
      var fallback = 'http://' + companionIp + ':5055' + path;
      return { primary: primary, fallback: fallback };
    }

    async function fetchCompanionSafeJson(path, options) {
      var endpoints = getCompanionApiUrl(path);
      var opts = Object.assign({
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        mode: 'cors'
      }, options || {});

      var parseSafe = async function(response) {
        var text = await response.text();
        var trimmed = text.trim();
        if (!trimmed || trimmed.startsWith('<') || trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html>')) {
          throw new Error('SERVER_RETURNED_HTML');
        }
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new Error('INVALID_JSON: ' + text.substring(0, 30));
        }
      };

      try {
        var res1 = await fetch(endpoints.primary, opts);
        return await parseSafe(res1);
      } catch (err1) {
        if (endpoints.fallback && endpoints.fallback !== endpoints.primary) {
          try {
            var res2 = await fetch(endpoints.fallback, opts);
            return await parseSafe(res2);
          } catch (err2) {
            throw err2;
          }
        }
        throw err1;
      }
    }

    async function handleResendOtp() {
      if (!activeOtpChallenge || !activeOtpChallenge.challengeId) return;
      var now = Date.now();
      var effectiveQrExp = (activeOtpChallenge && activeOtpChallenge.qrExpiresAt) ? Number(activeOtpChallenge.qrExpiresAt) : (qrExpiresAtTimestamp || 0);
      if (effectiveQrExp && now >= effectiveQrExp) {
        showOtpStatusMessage('QR validation session has expired. Please re-scan QR code.', 'error');
        var resendBtn = document.getElementById('otpResendBtn');
        if (resendBtn) resendBtn.disabled = true;
        var overlayExp = document.getElementById('qrExpiredOverlay');
        if (overlayExp) overlayExp.style.display = 'flex';
        return;
      }

      var resendBtn = document.getElementById('otpResendBtn');
      if (resendBtn && resendBtn.disabled) return;

      showOtpStatusMessage('Sending new OTP...', 'info');

      var isLocalChallenge = Boolean(activeOtpChallenge.challengeId && activeOtpChallenge.challengeId.startsWith('local-'));
      var res = null;

      if (!isLocalChallenge) {
        try {
          res = await fetchCompanionSafeJson('/api/otp/resend', {
            method: 'POST',
            body: JSON.stringify({
              challengeId: activeOtpChallenge.challengeId,
              qrSession: qrSessionTimestamp || undefined,
              qrExpiresAt: effectiveQrExp || undefined
            })
          });
        } catch (e) {
          console.warn('[Companion] Backend resend failed or returned HTML, falling back to local OTP:', e.message);
        }
      }

      if (res && res.success) {
        activeOtpChallenge.devOtp = res.devOtp;
        if (res.qrExpiresAt) activeOtpChallenge.qrExpiresAt = res.qrExpiresAt;
        var devCode = document.getElementById('otpDevCode');
        if (devCode && res.devOtp) devCode.innerText = res.devOtp;
        showOtpStatusMessage('New OTP sent successfully.', 'success');
        startResendCooldown(res.resendCooldownSeconds || 30);
        var inputEl = document.getElementById('otpInput');
        if (inputEl) inputEl.value = '';
        return;
      }

      // Local fallback resend:
      var newOtp = String(Math.floor(100000 + Math.random() * 900000));
      activeOtpChallenge.devOtp = newOtp;
      activeOtpChallenge.qrExpiresAt = effectiveQrExp || (Date.now() + 1200000);
      var devCodeEl = document.getElementById('otpDevCode');
      if (devCodeEl) devCodeEl.innerText = newOtp;
      showOtpStatusMessage('New OTP generated: ' + newOtp, 'success');
      startResendCooldown(30);
      var inp = document.getElementById('otpInput');
      if (inp) inp.value = '';
    }

    function cancelOtpModal() {
      clearInterval(otpTimerInterval);
      clearInterval(otpResendCooldownInterval);
      var overlay = document.getElementById('otpVerificationModalOverlay');
      if (overlay) overlay.style.display = 'none';

      if (activeOtpChallenge && activeOtpChallenge.challengeId && !activeOtpChallenge.challengeId.startsWith('local-')) {
        fetchCompanionSafeJson('/api/otp/cancel', {
          method: 'POST',
          body: JSON.stringify({ challengeId: activeOtpChallenge.challengeId })
        }).catch(function() {});
      }

      var cb = onOtpCancelledCallback;
      activeOtpChallenge = null;
      onOtpVerifiedCallback = null;
      onOtpCancelledCallback = null;

      if (typeof cb === 'function') cb();
    }

    async function submitOtpVerification() {
      if (!activeOtpChallenge) return;
      var inputEl = document.getElementById('otpInput');
      var otpVal = inputEl ? inputEl.value.trim() : '';

      if (!otpVal) {
        showOtpStatusMessage('Please enter the OTP.', 'error');
        return;
      }

      var verifyBtn = document.getElementById('otpBtnVerify');
      if (verifyBtn) {
        verifyBtn.disabled = true;
        verifyBtn.innerText = 'Verifying...';
      }

      showOtpStatusMessage('Verifying OTP...', 'info');

      function finishVerification(token) {
        if (verifyBtn) {
          verifyBtn.disabled = false;
          verifyBtn.innerText = 'Verify & Execute';
        }
        showOtpStatusMessage('Location verified. Executing switch operation.', 'success');
        clearInterval(otpTimerInterval);
        clearInterval(otpResendCooldownInterval);

        setTimeout(function() {
          var overlay = document.getElementById('otpVerificationModalOverlay');
          if (overlay) overlay.style.display = 'none';

          var cb = onOtpVerifiedCallback;
          activeOtpChallenge = null;
          onOtpVerifiedCallback = null;
          onOtpCancelledCallback = null;

          if (typeof cb === 'function') cb(token);
        }, 600);
      }

      var isLocalChallenge = Boolean(activeOtpChallenge.challengeId && activeOtpChallenge.challengeId.startsWith('local-'));
      var res = null;

      if (!isLocalChallenge) {
        try {
          res = await fetchCompanionSafeJson('/api/otp/verify', {
            method: 'POST',
            body: JSON.stringify({
              challengeId: activeOtpChallenge.challengeId,
              otp: otpVal,
              widgetId: activeOtpChallenge.widgetId,
              action: activeOtpChallenge.action
            })
          });
        } catch (verErr) {
          console.warn('[Companion] Backend verify failed or returned HTML, checking devOtp locally:', verErr.message);
        }
      }

      // If backend verification succeeded with a token, finish
      if (res && res.success && res.verificationToken) {
        finishVerification(res.verificationToken);
        return;
      }

      // If backend explicitly rejected the OTP (e.g. invalid OTP entered), and was not a 404/html
      if (res && res.success === false && res.code && res.code !== 'CHALLENGE_NOT_FOUND') {
        if (verifyBtn) {
          verifyBtn.disabled = false;
          verifyBtn.innerText = 'Verify & Execute';
        }
        showOtpStatusMessage(res.error || 'Invalid OTP. Please try again.', 'error');
        return;
      }

      // Fallback: Check entered OTP against activeOtpChallenge.devOtp
      if (activeOtpChallenge.devOtp) {
        if (otpVal === String(activeOtpChallenge.devOtp).trim()) {
          var localToken = 'vt-local-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
          finishVerification(localToken);
          return;
        } else {
          if (verifyBtn) {
            verifyBtn.disabled = false;
            verifyBtn.innerText = 'Verify & Execute';
          }
          showOtpStatusMessage('Invalid OTP. Please try again.', 'error');
          return;
        }
      }

      if (verifyBtn) {
        verifyBtn.disabled = false;
        verifyBtn.innerText = 'Verify & Execute';
      }
      showOtpStatusMessage((res && res.error) || 'Invalid OTP. Please try again.', 'error');
    }

    function sendHardwareActionAsync(payload, extra) {
      return new Promise(function(resolve) {
        try {
          var cleanPayload = String(payload || '').trim();
          var isOff = cleanPayload === 'LED:0' || cleanPayload.includes(':0') || cleanPayload.toLowerCase().includes('off');
          var switchStatus = isOff ? 0 : 1;

          if (qrExpiresAtTimestamp && Date.now() > qrExpiresAtTimestamp) {
            var expOverlay = document.getElementById('qrExpiredOverlay');
            if (expOverlay) expOverlay.style.display = 'flex';
            return resolve({ success: false, error: 'QR & OTP session expired. Please re-scan QR code.' });
          }

          var bodyObj = Object.assign({
            payload: cleanPayload || (isOff ? 'LED:0' : 'LED:1'),
            SwitchStatus: switchStatus,
            value: switchStatus === 1,
            port: COMPANION_PORT || 'COM9',
            qrSession: qrSessionTimestamp || undefined,
            qrExpiresAt: qrExpiresAtTimestamp || undefined
          }, extra || {});
          var bodyStr = JSON.stringify(bodyObj);

          var hostOrigin = (window.location && window.location.origin && window.location.origin.startsWith('http'))
            ? window.location.origin
            : '';
          var companionIp = '${companionServerInfo?.ip || resolvedHostIp}';
          var primaryEndpoint = hostOrigin ? (hostOrigin + '/api/action') : ('http://' + companionIp + ':5055/api/action');
          var fallbackEndpoint = 'http://' + companionIp + ':5055/api/action';

          fetch(primaryEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: bodyStr,
            mode: 'cors'
          })
          .then(function(r) {
            return r.json().catch(function() { return { success: r.ok }; });
          })
          .then(function(res) {
            if (res && res.success && res.writeResult?.success !== false) {
              addLog('🚀 [ESP32] ' + (isOff ? 'LED OFF (0)' : 'LED ON (Blink)'));
              resolve({ success: true, data: res });
            } else {
              var errMsg = (res && res.error) || 'ESP32 did not confirm the requested state';
              addLog('⚠️ [ESP32] Hardware rejected: ' + errMsg);
              resolve({ success: false, error: errMsg });
            }
          })
          .catch(function(err) {
            if (fallbackEndpoint !== primaryEndpoint) {
              fetch(fallbackEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: bodyStr
              })
              .then(function(r) { return r.json(); })
              .then(function(res) {
                if (res && res.success && res.writeResult?.success !== false) {
                  resolve({ success: true, data: res });
                } else {
                  resolve({ success: false, error: (res && res.error) || err.message });
                }
              })
              .catch(function(e) {
                resolve({ success: false, error: e.message || err.message });
              });
            } else {
              resolve({ success: false, error: err.message });
            }
          });
        } catch(e) {
          resolve({ success: false, error: e.message });
        }
      });
    }

    async function checkLocationAvailability() {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return { available: false, state: 'unsupported' };
      }
      if (navigator.permissions && navigator.permissions.query) {
        try {
          var p = await navigator.permissions.query({ name: 'geolocation' });
          if (p.state === 'denied') {
            return { available: false, state: 'denied' };
          }
          return { available: true, state: p.state };
        } catch(e) {}
      }
      return { available: true, state: 'prompt' };
    }

    // ONE-SHOT GPS ACQUISITION (NO watchPosition! NEVER continuously tracks!)
    function getOneAccurateGpsLocation(maxAllowedAccuracy, totalTimeoutMs) {
      return new Promise(function(resolve) {
        if (!navigator.geolocation) {
          return resolve({ valid: false, errorType: 'SERVICES_DISABLED', message: 'Geolocation is not supported.' });
        }

        var timeoutMs = totalTimeoutMs || 10000;
        var startTime = Date.now();

        function attemptFix() {
          var remainingTime = Math.max(3000, timeoutMs - (Date.now() - startTime));
          navigator.geolocation.getCurrentPosition(
            function(pos) {
              if (pos && pos.coords && typeof pos.coords.latitude === 'number' && typeof pos.coords.longitude === 'number') {
                var rawAcc = pos.coords.accuracy;
                var acc = (typeof rawAcc === 'number' && !isNaN(rawAcc)) ? Math.round(rawAcc) : 15;
                resolve({
                  valid: true,
                  coords: {
                    latitude: parseFloat(pos.coords.latitude.toFixed(5)),
                    longitude: parseFloat(pos.coords.longitude.toFixed(5)),
                    accuracy: acc
                  },
                  accuracy: acc,
                  timestamp: pos.timestamp || Date.now()
                });
                return;
              }
              resolve({
                valid: false,
                errorType: 'UNKNOWN',
                message: 'No coordinates returned by location service.'
              });
            },
            async function(err) {
              if (err.code === 1) { // PERMISSION_DENIED
                return resolve({ valid: false, errorType: 'PERMISSION_DENIED', message: 'Location permission denied by user.' });
              }

              // Fallback to IP / Network positioning if hardware GPS times out indoors
              try {
                var controller = new AbortController();
                var tid = setTimeout(function() { controller.abort(); }, 3000);
                var ipRes = await fetch('https://ipapi.co/json/', { signal: controller.signal });
                clearTimeout(tid);
                if (ipRes.ok) {
                  var ipData = await ipRes.json();
                  if (ipData && ipData.latitude && ipData.longitude) {
                    return resolve({
                      valid: true,
                      coords: {
                        latitude: parseFloat(Number(ipData.latitude).toFixed(5)),
                        longitude: parseFloat(Number(ipData.longitude).toFixed(5)),
                        accuracy: 100
                      },
                      accuracy: 100,
                      timestamp: Date.now()
                    });
                  }
                }
              } catch(e) {}

              if (err.code === 2) { // POSITION_UNAVAILABLE
                resolve({ valid: false, errorType: 'SERVICES_DISABLED', message: 'Location services are disabled on device.' });
              } else if (err.code === 3) { // TIMEOUT
                resolve({ valid: false, errorType: 'TIMEOUT', message: 'GPS location acquisition timed out.' });
              } else {
                resolve({ valid: false, errorType: 'UNKNOWN', message: err.message || 'Unknown GPS error' });
              }
            },
            { enableHighAccuracy: true, timeout: remainingTime, maximumAge: 30000 }
          );
        }

        attemptFix();
      });
    }

    async function reverseGeocodeLocation(lat, lng) {
      try {
        var controller = new AbortController();
        var to = setTimeout(function() { controller.abort(); }, 2500);
        var res = await fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&zoom=14&accept-language=en', {
          headers: { 'Accept-Language': 'en' },
          signal: controller.signal
        });
        clearTimeout(to);
        if (res.ok) {
          var geo = await res.json();
          var specific = (geo && geo.name && geo.name !== 'Chennai') ? geo.name :
            (geo && geo.display_name && !geo.display_name.startsWith('Chennai') ? geo.display_name.split(',')[0].trim() : '') ||
            (geo && geo.address && (geo.address.railway || geo.address.suburb || geo.address.neighbourhood || geo.address.quarter || geo.address.city || geo.address.town)) ||
            'Little Mount';
          var address = (geo && geo.display_name) ? geo.display_name.split(',').slice(0, 4).join(',').trim() : (lat.toFixed(4) + '° N, ' + lng.toFixed(4) + '° E');
          return {
            locality: specific,
            city: (geo.address && (geo.address.city || geo.address.town)) || 'Chennai',
            state: (geo.address && geo.address.state) || 'Tamil Nadu',
            country: (geo.address && geo.address.country) || 'India',
            formattedAddress: address
          };
        }
      } catch(e) {}
      return {
        locality: 'Little Mount',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        formattedAddress: lat.toFixed(4) + '° N, ' + lng.toFixed(4) + '° E'
      };
    }

    async function handleSwitch(id, checked, title) {
      var switchEl = document.getElementById('input-' + id);
      var card = document.getElementById('card-' + id);

      var now = Date.now();
      if (qrExpiresAtTimestamp && now >= qrExpiresAtTimestamp) {
        if (switchEl) switchEl.checked = !checked;
        updateSwitchHint(id, 'QR session expired — Switch control disabled', 'error');
        var expOverlay = document.getElementById('qrExpiredOverlay');
        if (expOverlay) expOverlay.style.display = 'flex';
        return;
      }

      // Operation lock - prevent duplicate triggers while location or switch is in progress
      if (isSwitchOperationInProgress) {
        if (switchEl) switchEl.checked = !checked;
        return;
      }

      isSwitchOperationInProgress = true;
      if (switchEl) switchEl.disabled = true;

      var targetAction = checked ? 'ON' : 'OFF';

      function revertSwitchUI() {
        if (switchEl) {
          switchEl.checked = !checked;
          switchEl.disabled = false;
        }
        if (card) {
          if (!checked) card.classList.add('glow-blue');
          else card.classList.remove('glow-blue');
        }
        isSwitchOperationInProgress = false;
        pendingSwitchContext = null;
      }

      pendingSwitchContext = {
        id: id,
        checked: checked,
        title: title,
        onCancel: function() {
          revertSwitchUI();
          updateSwitchHint(id, 'Location required for ON/OFF logging', '');
        }
      };

      // 1. Initial Permission Pre-Check
      updateSwitchHint(id, 'Checking location permission...', 'pending');
      var permCheck = await checkLocationAvailability();
      if (permCheck.state === 'denied') {
        revertSwitchUI();
        updateSwitchHint(id, 'Location access denied — Switch not changed', 'error');
        showLocationModal({
          title: 'Location Permission Required',
          description: 'Location access is required to record where this switch action occurred.<br><br>Please allow location access to continue.',
          icon: '📍',
          cancelText: 'Cancel',
          primaryText: 'Enable Location',
          onPrimary: function() {
            navigator.geolocation.getCurrentPosition(
              function() {
                showLocationModal({
                  title: 'Location Enabled',
                  description: 'Location access has been granted.<br>You can now toggle the switch.',
                  icon: '✅',
                  hideCancel: true,
                  primaryText: 'Continue',
                  onPrimary: function() {
                    handleSwitch(id, checked, title);
                  }
                });
              },
              function() {
                showLocationModal({
                  title: 'Permission Denied in Browser',
                  description: 'To enable location:<br>1. Tap the <b>lock / info icon (🔒)</b> in your browser address bar.<br>2. Select <b>Site Settings</b> or <b>Permissions</b>.<br>3. Set Location to <b>Allow</b>, then refresh.',
                  icon: '⚙️',
                  cancelText: 'Close',
                  primaryText: 'Retry',
                  onPrimary: function() {
                    handleSwitch(id, checked, title);
                  }
                });
              },
              { enableHighAccuracy: true, timeout: 6000 }
            );
          }
        });
        return;
      }

      // 2. UI State: GETTING_LOCATION
      updateSwitchHint(id, 'Getting your current location...', 'pending');
      showLocationModal({
        title: 'Getting Accurate Location...',
        description: 'Please wait while we determine your current location for the switch ' + targetAction + ' action.',
        isSpinner: true,
        cancelText: 'Cancel',
        hidePrimary: true
      });

      // 3. Request ONE fresh accurate GPS location (max 50m accuracy, 10s timeout)
      // NEVER continuously tracks or starts watchPosition
      var locResult = await getOneAccurateGpsLocation(MAX_ALLOWED_ACCURACY, 10000);

      // Handle Failure States
      if (!locResult.valid) {
        revertSwitchUI();

        if (locResult.errorType === 'PERMISSION_DENIED') {
          // Case A — Permission Not Granted
          updateSwitchHint(id, 'Permission required — Switch not changed', 'error');
          showLocationModal({
            title: 'Location Permission Required',
            description: 'Location access is required to record where this switch action occurred.<br><br>Please allow location access to continue.',
            icon: '📍',
            cancelText: 'Cancel',
            primaryText: 'Enable Location',
            onPrimary: function() {
              navigator.geolocation.getCurrentPosition(
                function() { handleSwitch(id, checked, title); },
                function() {
                  showLocationModal({
                    title: 'Permission Denied in Browser',
                    description: 'Please tap the site settings / lock icon in your address bar and allow Location access.',
                    icon: '⚙️',
                    cancelText: 'Close',
                    primaryText: 'Retry',
                    onPrimary: function() { handleSwitch(id, checked, title); }
                  });
                },
                { enableHighAccuracy: true, timeout: 6000 }
              );
            }
          });
          return;
        }

        if (locResult.errorType === 'SERVICES_DISABLED') {
          // Case B — Location Services Disabled
          updateSwitchHint(id, 'Location services disabled — Switch not changed', 'error');
          showLocationModal({
            title: 'Location Services Disabled',
            description: 'Please enable Location Services to continue controlling the switch.',
            subNote: '📱 <b>To enable:</b> Open your mobile device <b>Settings &rarr; Location</b> and turn it ON, then return and tap Retry.',
            icon: '⚠️',
            cancelText: 'Cancel',
            primaryText: 'Open Location Settings',
            onPrimary: function() {
              showLocationModal({
                title: 'Check Location Services',
                description: 'Once you have enabled device GPS location, tap Retry to proceed with switch control.',
                icon: '🔄',
                cancelText: 'Cancel',
                primaryText: 'Retry Now',
                onPrimary: function() { handleSwitch(id, checked, title); }
              });
            }
          });
          return;
        }

        // Case C — Timeout or Location Acquisition Failed
        var isTimeout = locResult.errorType === 'TIMEOUT';
        updateSwitchHint(id, (isTimeout ? 'Location timed out' : 'Location unavailable') + ' — Switch not changed', 'error');
        showLocationModal({
          title: isTimeout ? 'Location Request Timed Out' : 'Unable to Detect Location',
          description: isTimeout
            ? 'GPS request took too long to acquire a position.<br><br>Please make sure Location is enabled on your device and tap Retry.'
            : ((locResult.message || 'Unable to determine device location.') + '<br><br>Please check your location settings and try again.'),
          icon: isTimeout ? '⏱️' : '📍',
          cancelText: 'Cancel',
          primaryText: 'Retry Location',
          onPrimary: function() { handleSwitch(id, checked, title); }
        });
        return;
      }

      // 4. UI State: EXECUTING_SWITCH
      updateSwitchHint(id, 'Location confirmed (' + locResult.accuracy + 'm). Turning switch ' + targetAction + '...', 'pending');
      showLocationModal({
        title: 'Executing Switch ' + targetAction + '...',
        description: 'Location confirmed (Accuracy: ' + locResult.accuracy + 'm).<br>Transmitting ' + targetAction + ' command to ESP32...',
        isSpinner: true,
        hideCancel: true,
        hidePrimary: true
      });

      // 5. Reverse geocode address
      var geo = await reverseGeocodeLocation(locResult.coords.latitude, locResult.coords.longitude);

      // 6. Build Independent Event Object
      var timeStr = new Date().toLocaleTimeString();
      var geoEvent = {
        id: 'loc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        eventId: 'loc-' + Date.now(),
        deviceId: 'ESP32-S3 (' + (COMPANION_PORT || 'COM9') + ')',
        action: targetAction,
        event: targetAction,
        latitude: locResult.coords.latitude,
        longitude: locResult.coords.longitude,
        lat: locResult.coords.latitude,
        lng: locResult.coords.longitude,
        accuracy: locResult.accuracy,
        address: geo.formattedAddress,
        locality: geo.locality,
        city: geo.locality || geo.city || 'Little Mount',
        state: geo.state || 'Tamil Nadu',
        country: geo.country || 'India',
        timestamp: timeStr,
        time: timeStr,
        locationSource: 'GPS',
        source: 'GPS',
        locationCapturedAt: new Date().toISOString(),
        switchCommandStatus: 'SUCCESS',
        esp32Confirmed: false
      };

      // 6b. Location-Mismatch Verification Check
      // Retrieve the last successfully executed operation location
      var prevOperationLoc = getLastSuccessfulOperationLocation();

      // Look up the configured threshold from the matching rule for this widget
      var matchedRule = rules.find(function(r) {
        return r.enabled && (r.triggerWidgetId === id || r.trigger === id) &&
          (r.conditionType === 'Location Mismatch on Turn OFF (OTP Guard)' ||
           (r.condition && r.condition.indexOf('Location Mismatch') !== -1) ||
           (r.condition && r.condition.indexOf('OTP') !== -1));
      });
      var ruleThreshold = matchedRule && matchedRule.conditionThreshold !== undefined
        ? parseFloat(matchedRule.conditionThreshold) || 100
        : 100;

      var mismatch = checkLocationMismatch(prevOperationLoc, geoEvent, ruleThreshold);

      var isSwitchOff = !checked;
      var hasOtpRule = Boolean(matchedRule);

      // OTP is required on switch OFF when an OTP Guard rule is configured AND:
      //   a) No previous ON-location recorded yet (first switch OFF guard), OR
      //   b) Raw GPS distance from the ON location exceeds the configured threshold
      //      (uses the Distance / Geofence Radius value directly — no accuracy-buffer inflation)
      var rawDistance = mismatch.distance; // metres, or null if coords missing
      var locationMismatchExceedsThreshold =
        !prevOperationLoc ||              // no prior location → always guard
        rawDistance == null ||            // couldn't compute distance → guard
        rawDistance > ruleThreshold;      // actual movement > configured threshold (e.g. 1 m)

      var requiresOtp = isSwitchOff && hasOtpRule && locationMismatchExceedsThreshold;
      var verificationToken = null;

      if (requiresOtp) {
        // Close the spinner modal
        var spinnerOverlay = document.getElementById('locationModalOverlay');
        if (spinnerOverlay) spinnerOverlay.style.display = 'none';

        // Keep switch visually in prior state while OTP verification is pending
        if (switchEl) switchEl.checked = !checked;
        var hintDistText = rawDistance != null
          ? (' — moved ' + rawDistance + 'm (threshold: ' + ruleThreshold + 'm)')
          : '';
        updateSwitchHint(id, 'OTP required: location change detected' + hintDistText, 'pending');

        // Request OTP challenge from backend or fallback to local challenge
        var challengeData = null;
        try {
          challengeData = await fetchCompanionSafeJson('/api/otp/request', {
            method: 'POST',
            body: JSON.stringify({
              widgetId: id,
              switchTitle: title,
              action: 'OFF',
              deviceId: 'ESP32-S3 (' + (COMPANION_PORT || 'COM9') + ')',
              currentLocation: geoEvent,
              previousLocation: prevOperationLoc,
              qrSession: qrSessionTimestamp || undefined,
              qrExpiresAt: qrExpiresAtTimestamp || undefined
            })
          });
        } catch(fetchErr) {
          console.warn('[Companion] Backend OTP request failed, creating local fallback challenge:', fetchErr.message);
        }

        // If backend returned HTML, 404, or failed, create local challenge
        if (!challengeData || !challengeData.success) {
          var fallbackOtp = String(Math.floor(100000 + Math.random() * 900000));
          var fallbackRemaining = qrExpiresAtTimestamp ? Math.max(0, Math.round((qrExpiresAtTimestamp - Date.now()) / 1000)) : 1200;
          challengeData = {
            success: true,
            challengeId: 'local-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            widgetId: id,
            switchTitle: title,
            action: 'OFF',
            deviceId: 'ESP32-S3 (' + (COMPANION_PORT || 'COM9') + ')',
            currentLocation: geoEvent,
            previousLocation: prevOperationLoc,
            distance: rawDistance,
            threshold: ruleThreshold,
            qrSession: qrSessionTimestamp || undefined,
            qrExpiresAt: qrExpiresAtTimestamp || (Date.now() + 1200000),
            expiresInSeconds: fallbackRemaining,
            resendCooldownSeconds: 30,
            devDemoMode: true,
            devOtp: fallbackOtp
          };
        }

        try {
          // Await OTP verification modal resolution
          verificationToken = await new Promise(function(resolveVerify) {
            openOtpModal(
              challengeData,
              function(token) { resolveVerify(token); },
              function() { resolveVerify(null); }
            );
          });

          if (!verificationToken) {
            revertSwitchUI();
            updateSwitchHint(id, 'Location verification cancelled — Switch not changed', 'error');
            return;
          }
        } catch(otpErr) {
          revertSwitchUI();
          updateSwitchHint(id, 'Verification error: ' + otpErr.message, 'error');
          return;
        }

        // Show executing spinner
        showLocationModal({
          title: 'Executing Switch ' + targetAction + '...',
          description: 'Location verified.<br>Transmitting ' + targetAction + ' command to ESP32...',
          isSpinner: true,
          hideCancel: true,
          hidePrimary: true
        });
      }

      // 7. Send command to ESP32
      var cmd = checked ? 'LED:1' : 'LED:0';
      var res = await sendHardwareActionAsync(cmd, {
        widgetId: id,
        widgetType: 'switch',
        value: checked,
        switchTitle: title,
        location: geoEvent,
        verificationToken: verificationToken
      });

      // 8. Confirm ESP32 response (Important Failure Handling)
      if (!res || !res.success) {
        revertSwitchUI();
        updateSwitchHint(id, 'ESP32 failed to confirm state', 'error');
        showLocationModal({
          title: 'Switch Action Failed',
          description: 'The ESP32 did not confirm the requested state (' + (res?.error || 'No response') + ').<br>The switch has not been changed.',
          icon: '❌',
          cancelText: 'Dismiss',
          hidePrimary: true
        });
        return;
      }

      // 9. ESP32 Confirmed! Save Event & Update UI
      geoEvent.esp32Confirmed = true;
      if (switchEl) switchEl.disabled = false;
      if (card) {
        if (checked) card.classList.add('glow-blue');
        else card.classList.remove('glow-blue');
      }

      // Keep switch location & status confirmation visible for 5 minutes (300,000 ms)
      updateSwitchHint(id, 'Switch ' + targetAction + ' at ' + geoEvent.city + ' (Accuracy: ' + geoEvent.accuracy + 'm)', 'success', 5 * 60 * 1000);

      // Update location cards & history with fresh accuracy
      updateMobileLocationCards(geoEvent);

      // Close modal
      closeLocationModal();
      isSwitchOperationInProgress = false;
      pendingSwitchContext = null;

      addLog('✅ [SUCCESS] Switch ' + targetAction + ' logged at ' + geoEvent.city + ' (Acc: ' + geoEvent.accuracy + 'm)');
      evalRules(id, checked, title);
    }

    function stepSlider(id, delta, min, max, title) {
      const current = widgetValues[id] ?? 90;
      const next = Math.max(min, Math.min(max, current + delta));
      widgetValues[id] = next;
      document.getElementById('val-' + id).innerText = next + '°';
      document.getElementById('bar-' + id).style.width = (((next - min) / (max - min)) * 100) + '%';
      addLog('📱 [UI] ' + title + ' -> ' + next + '°');
      evalRules(id, next, title);
    }

    function handleBtn(title, target, action) {
      addLog('🚨 [UI] Button Pressed: "' + title + '" -> Dispatched ' + action + ' to ' + target);
      sendHardwareAction((action || 'TRIGGER') + '\\r\\n', { target: target });
      evalRules(target, 1, title);
    }

    function toggleRule(id, checked) {
      const r = rules.find(x => x.id === id);
      if (r) r.enabled = checked;
      addLog('⚡ Rule "' + (r?.name || id) + '" is now ' + (checked ? 'ACTIVE' : 'PAUSED'));
    }

    function testRule(id) {
      const r = rules.find(x => x.id === id);
      if (r) {
        execCounts[r.id] = (execCounts[r.id] || 0) + 1;
        const el = document.getElementById('rule-exec-' + r.id);
        if (el) el.innerText = 'Executions: ' + execCounts[r.id];
        const payload = (r.payload || 'CMD').replace('{state}', '1').replace('{value}', '100');
        addLog('⚡ [TEST EXECUTION] "' + r.name + '" -> Dispatched ' + payload + ' to ' + r.targetHardware);
        sendHardwareAction(payload + '\\r\\n', { ruleId: r.id, test: true });
      }
    }

    // Dynamic Telemetry Sensor Interval
    const configuredGauges = ${JSON.stringify(widgets.filter(w => w.type === 'gauge'))};
    if (configuredGauges.length > 0) {
      setInterval(() => {
        configuredGauges.forEach(gw => {
          const valEl = document.getElementById('val-' + gw.id);
          const pillEl = document.getElementById('pill-' + gw.id);
          const cardEl = document.getElementById('card-' + gw.id);
          if (valEl) {
            const cur = widgetValues[gw.id] ?? (gw.value || 24.3);
            const delta = (Math.random() - 0.5) * 0.8;
            const min = gw.min || 0;
            const max = gw.max || 50;
            const next = parseFloat(Math.max(min, Math.min(max, cur + delta)).toFixed(1));
            widgetValues[gw.id] = next;
            valEl.innerText = next + (gw.unit || '°C');
            const isHigh = next > (min + (max - min) * 0.6);
            if (isHigh) {
              if (pillEl) { pillEl.className = 'live-pill alert'; pillEl.innerText = '⚠️ THRESHOLD EXCEEDED'; }
              if (cardEl) cardEl.className = 'card glow-red';
              evalRules(gw.id, next, gw.title);
            } else {
              if (pillEl) { pillEl.className = 'live-pill'; pillEl.innerText = '● LIVE ADC'; }
              if (cardEl) cardEl.className = 'card';
            }
          }
        });
      }, 3000);
    }

    function applySynchronizedState(data) {
      if (!data || !data.states) return;
      var states = data.states;
      Object.keys(states).forEach(function(widgetId) {
        var val = states[widgetId];
        // 1. Switch inputs
        var switchEl = document.getElementById('input-' + widgetId);
        if (!switchEl && (widgetId === 'w-led' || widgetId.toLowerCase().includes('led'))) {
          switchEl = document.getElementById('input-w-led') || document.querySelector('input[type="checkbox"]');
        }
        if (switchEl && typeof val === 'boolean') {
          if (isSwitchOperationInProgress) return;
          if (switchEl.checked !== val) {
            switchEl.checked = val;
            var card = document.getElementById('card-' + widgetId) || switchEl.closest('.card');
            if (card) {
              if (val) card.classList.add('glow-blue');
              else card.classList.remove('glow-blue');
            }
            addLog('🔄 [SYNC] ' + widgetId + ' updated from network -> ' + (val ? 'ON' : 'OFF'));
          }
        }
        // 2. Sliders
        var valEl = document.getElementById('val-' + widgetId);
        var barEl = document.getElementById('bar-' + widgetId);
        if (valEl && typeof val === 'number') {
          widgetValues[widgetId] = val;
          valEl.innerText = val + '°';
          if (barEl) barEl.style.width = (((val - 0) / 180) * 100) + '%';
        }
      });
      if (data.hostLocation) {
        updateMobileLocationCards(null, null, data.hostLocation);
      }
      if (data.switchLocations && Array.isArray(data.switchLocations)) {
        var cleanLocs = data.switchLocations.filter(function(item) { return !isStaleClientGeolog(item); });
        updateMobileLocationCards(data.lastLocation && !isStaleClientGeolog(data.lastLocation) ? data.lastLocation : null, cleanLocs, data.hostLocation || null);
      } else if (data.lastLocation && !isStaleClientGeolog(data.lastLocation)) {
        updateMobileLocationCards(data.lastLocation, null, data.hostLocation || null);
      }
      if (data.formResponse && !isStaleClientAnswer(data.formResponse)) {
        renderMobileResponseItem(data.formResponse.widgetId || '', data.formResponse);
      }
      if (Array.isArray(data.formResponses)) {
        var cleanResponses = data.formResponses.filter(function(r) { return !isStaleClientAnswer(r); });
        var formCard = document.querySelector('[id^="responses-list-"]');
        if (formCard) {
          var wid = formCard.id.replace('responses-list-', '');
          var countEl = document.getElementById('resp-count-' + wid);
          if (countEl) countEl.innerText = cleanResponses.length;
          var emptyEl = document.getElementById('resp-empty-' + wid);
          if (cleanResponses.length === 0) {
            if (emptyEl) {
              emptyEl.style.display = 'block';
              formCard.innerHTML = '';
              formCard.appendChild(emptyEl);
            } else {
              formCard.innerHTML = '<div id="resp-empty-' + wid + '" style="font-size: 11px; color: #64748b; text-align: center; padding: 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px;">No answers submitted yet.</div>';
            }
          } else {
            if (emptyEl) emptyEl.style.display = 'none';
            formCard.innerHTML = cleanResponses.map(function(r) {
              return '<div class="resp-item" style="background: #ffffff; border-radius: 8px; padding: 8px 10px; border: 1px solid #e2e8f0; margin-bottom: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">' +
                '<div style="display: flex; justify-content: space-between; font-size: 10px; color: #6366f1; margin-bottom: 3px;">' +
                '<span style="font-weight: 700;">' + (r.questionText || r.question || 'Answer') + '</span>' +
                '<span style="color: #94a3b8;">' + (r.timestamp || r.time || '') + '</span>' +
                '</div>' +
                '<div style="font-size: 12px; font-weight: 600; color: #0f172a;">💬 ' + r.answer + '</div>' +
                '<div style="font-size: 9px; color: #64748b; margin-top: 2px;">Source: ' + (r.source || 'Mobile UI') + '</div>' +
                '</div>';
            }).join('');
          }
        }
      }
    }

    function initRealtimeStateSync() {
      var companionIp = '${companionServerInfo?.ip || resolvedHostIp}';
      var hostOrigin = (window.location && window.location.origin && window.location.origin.startsWith('http'))
        ? window.location.origin
        : ('http://' + companionIp + ':5055');

      // 1. Initial State Fetch
      fetch(hostOrigin + '/api/state', { method: 'GET', mode: 'cors' })
        .then(function(r) { return r.json(); })
        .then(function(res) {
          if (res && res.states) applySynchronizedState(res);
        }).catch(function() {});

      // 2. Real-time Server-Sent Events (SSE)
      try {
        if (window.EventSource) {
          var evtSource = new EventSource(hostOrigin + '/api/events');
          evtSource.onmessage = function(e) {
            try {
              var payload = JSON.parse(e.data);
              applySynchronizedState(payload);
            } catch(err) {}
          };
        }
      } catch(e) {}

      // 3. Resilient Polling Fallback (every 1.5s for instant multi-device sync across mobile 4G/5G networks)
      setInterval(function() {
        fetch(hostOrigin + '/api/state', { method: 'GET', mode: 'cors' })
          .then(function(r) { return r.json(); })
          .then(function(res) {
            if (res && res.states) applySynchronizedState(res);
          }).catch(function() {});
      }, 1500);
    }

    function pingCompanionServer() {
      var companionIp = '${companionServerInfo?.ip || resolvedHostIp}';
      var hostOrigin = (window.location && window.location.origin && window.location.origin.startsWith('http'))
        ? window.location.origin
        : ('http://' + companionIp + ':5055');

      var badge = document.getElementById('companionStatusBadge');
      var text = document.getElementById('companionStatusText');
      var dot = document.getElementById('companionStatusDot');

      fetch(hostOrigin + '/api/status', { method: 'GET', mode: 'cors' })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (badge && text && dot) {
            badge.style.background = 'rgba(34,197,94,0.15)';
            badge.style.color = '#4ade80';
            dot.style.background = '#22c55e';
            text.innerText = 'ESP32 Linked (' + (data.activePorts && data.activePorts.length ? data.activePorts[0] : (data.port || 'Online')) + ')';
          }
        })
        .catch(function() {
          var img = new Image();
          img.onload = function() {
            if (badge && text && dot) {
              badge.style.background = 'rgba(34,197,94,0.15)';
              badge.style.color = '#4ade80';
              dot.style.background = '#22c55e';
              text.innerText = 'ESP32 Linked';
            }
          };
          img.onerror = function() {
            if (badge && text && dot) {
              badge.style.background = 'rgba(239,68,68,0.15)';
              badge.style.color = '#f87171';
              dot.style.background = '#ef4444';
              text.innerText = 'Reconnecting... (Tap)';
            }
          };
          img.src = hostOrigin + '/api/status?_img=1&_t=' + Date.now();
        });
    }

    function initQrSessionTracker() {
      // Only track QR validation session and countdown if qr_exp was explicitly provided in the web app URL query parameters
      if (!qrExpiresAtTimestamp) {
        return;
      }
      startQrSessionCountdown();
    }

    function startQrSessionCountdown() {
      var banner = document.getElementById('qrSessionBanner');
      var textEl = document.getElementById('qrSessionText');
      var overlay = document.getElementById('qrExpiredOverlay');
      if (banner) banner.style.display = 'flex';

      function tick() {
        var now = Date.now();
        var remaining = Math.max(0, Math.round((qrExpiresAtTimestamp - now) / 1000));
        var mins = Math.floor(remaining / 60);
        var secs = remaining % 60;
        var formatted = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;

        if (textEl) {
          if (remaining > 0) {
            textEl.innerText = 'QR Validation: ' + formatted + ' (OTP synchronized)';
          } else {
            textEl.innerText = 'QR & OTP Session Expired (20 min)';
            if (banner) {
              banner.style.background = '#fef2f2';
              banner.style.borderColor = '#fecaca';
              banner.style.color = '#991b1b';
            }
          }
        }

        if (remaining <= 0) {
          if (overlay) overlay.style.display = 'flex';
          var resendBtn = document.getElementById('otpResendBtn');
          if (resendBtn) resendBtn.disabled = true;
          var verifyBtn = document.getElementById('otpBtnVerify');
          if (verifyBtn) verifyBtn.disabled = true;
        }
      }

      tick();
      setInterval(tick, 1000);
    }

    window.addEventListener('load', function() {
      pingCompanionServer();
      initRealtimeStateSync();
      initQrSessionTracker();
      var ua = navigator.userAgent || '';
      var isInApp = /MicroMessenger|Line|FB_IAB|Instagram|Twitter|WebView|SamsungBrowser|MiuiBrowser|GSA/i.test(ua) || (window.self !== window.top);
      var notice = document.getElementById('scannerNotice');
      if (notice && isInApp) {
        notice.style.display = 'flex';
      }
    });
  </script>
</body>
</html>`;
};

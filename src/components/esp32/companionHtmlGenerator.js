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
  const widgetsJson = JSON.stringify(widgets);
  const logicBlocksJson = JSON.stringify(logicBlocks);
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${projectName} - IoT Companion App</title>
  <style>
    :root { --primary: #38bdf8; --bg: #090d16; --card: #131b2e; --border: #1e293b; --text: #f8fafc; --subtext: #94a3b8; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); min-height: 100vh; display: flex; justify-content: center; padding: 16px; }
    .phone { width: 100%; max-width: 440px; background: #0f172a; border-radius: 28px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); padding: 20px; display: flex; flex-direction: column; gap: 16px; border: 1px solid var(--border); }
    .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
    .brand-sub { font-size: 10px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; }
    .header h1 { font-size: 18px; font-weight: 800; color: #fff; margin-top: 2px; }
    .badge { font-size: 11px; padding: 4px 10px; border-radius: 9999px; background: rgba(34,197,94,0.15); color: #4ade80; font-weight: 700; display: flex; align-items: center; gap: 5px; }
    .badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; }
    .controls-list { display: flex; flex-direction: column; gap: 14px; }
    .card { background: var(--card); border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 12px; border: 1px solid var(--border); }
    .card.glow-blue { border-color: #2563eb; background: #101a38; }
    .card.glow-red { border-color: #ef4444; background: #261214; }
    .row { display: flex; align-items: center; justify-content: space-between; }
    .title { font-weight: 700; font-size: 15px; color: #f8fafc; }
    .meta { font-size: 12px; color: var(--subtext); margin-top: 2px; }
    .btn { background: #ea580c; color: white; border: none; border-radius: 14px; padding: 14px 20px; font-weight: 800; cursor: pointer; width: 100%; font-size: 14px; text-align: center; }
    .toggle { position: relative; width: 48px; height: 26px; }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .slider-toggle { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #334155; border-radius: 26px; transition: 0.3s; }
    .slider-toggle:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; }
    input:checked + .slider-toggle { background: #2563eb; }
    input:checked + .slider-toggle:before { transform: translateX(22px); }
    .slider-row { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
    .step-btn { background: #1e293b; color: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 6px 10px; font-weight: 800; font-size: 11px; cursor: pointer; }
    .slider-bar-wrap { flex: 1; height: 8px; background: #1e293b; border-radius: 4px; overflow: hidden; }
    .slider-bar-fill { height: 100%; background: #a855f7; border-radius: 4px; }
    .gauge-big { font-size: 36px; font-weight: 900; text-align: center; color: #38bdf8; margin: 6px 0; }
    .live-pill { font-size: 10px; font-weight: 800; background: #082f49; color: #38bdf8; padding: 3px 8px; border-radius: 6px; }
    .live-pill.alert { background: #7f1d1d; color: #fca5a5; }
    .test-btn { background: #1e293b; color: #38bdf8; border: 1px solid #334155; border-radius: 8px; padding: 4px 10px; font-size: 11px; font-weight: 800; cursor: pointer; }
  </style>
</head>
<body>
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

    <div id="scannerNotice" style="display:none; background:rgba(34,211,238,0.12); border:1px solid rgba(34,211,238,0.3); border-radius:12px; padding:8px 12px; font-size:11px; color:#38bdf8; align-items:center; justify-content:space-between; margin-bottom:12px;">
      <span>📱 <b>Tip:</b> If switches don't respond on other phones, tap <b>⋮</b> and select <b>"Open in Chrome / Safari"</b>.</span>
      <button onclick="document.getElementById('scannerNotice').style.display='none'" style="background:transparent; border:none; color:#94a3b8; font-size:16px; cursor:pointer; padding:0 4px; line-height:1;">&times;</button>
    </div>

    <!-- UI CONTROLS ONLY -->
    <div id="tab-controls" class="controls-list">
      ${widgets.filter(w => w.visible !== false).length === 0 ? `
        <div class="card" style="text-align: center; padding: 32px 16px; color: var(--subtext);">
          <div style="font-size: 24px; margin-bottom: 8px;">📱</div>
          <div style="font-weight: 700; color: #f8fafc; margin-bottom: 4px;">No Components Added</div>
          <div style="font-size: 12px;">Add components in InnoIDE App Designer to control hardware from this companion app.</div>
        </div>
      ` : widgets.filter(w => w.visible !== false).map(w => {
      if (w.type === 'switch') {
        return `
          <div class="card ${w.state ? 'glow-blue' : ''}" id="card-${w.id}" style="${w.backgroundColor ? `background: ${w.backgroundColor};` : ''}${w.cornerRadius ? `border-radius: ${w.cornerRadius}px;` : ''}">
            <div class="row">
              <div>
                <div class="title" style="${w.fontSize ? `font-size: ${w.fontSize}px;` : ''}${w.textColor ? `color: ${w.textColor};` : ''}">${w.title}</div>
                <div class="meta">Target: ${w.boundTarget || w.target || 'GPIO Pin'}</div>
              </div>
              <label class="toggle">
                <input type="checkbox" id="input-${w.id}" ${w.state ? 'checked' : ''} onchange="handleSwitch('${w.id}', this.checked, '${w.title}')">
                <span class="slider-toggle"></span>
              </label>
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
              <div style="font-weight: 800; font-size: ${w.fontSize ? Math.round(w.fontSize * 1.2) : 18}px; color: ${w.color || '#a855f7'};" id="val-${w.id}">${w.value || 90}${w.unit || '°'}</div>
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
            <div class="gauge-big" id="val-${w.id}" style="color: ${w.color || '#38bdf8'};">${w.value || 24.3}${w.unit || '°C'}</div>
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
                <div style="width: 34px; height: 34px; border-radius: 10px; background: rgba(37,99,235,0.2); display: flex; align-items: center; justify-content: center; font-size: 16px;">📡</div>
                <div>
                  <div class="title" style="${w.fontSize ? `font-size: ${w.fontSize}px;` : ''}${w.textColor ? `color: ${w.textColor};` : ''}">${w.title || 'ESP32 Dev Board'}</div>
                  <div style="font-size: 10px; color: #4ade80; font-weight: 700; margin-top: 2px;">● Online & Connected</div>
                </div>
              </div>
              <div class="live-pill">WIFI 100%</div>
            </div>
          </div>`;
      }
      if (w.type === 'label') {
        return `
          <div class="card" id="card-${w.id}" style="padding: 12px 16px; ${w.backgroundColor ? `background: ${w.backgroundColor};` : ''}${w.cornerRadius ? `border-radius: ${w.cornerRadius}px;` : ''}">
            <div class="title" style="color: ${w.textColor || w.color || '#f8fafc'}; font-size: ${w.fontSize || 15}px;">${w.title}</div>
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
          <div class="card" id="card-${w.id}" style="border: 1px solid #06b6d4; background: #0c1929; border-radius: ${w.cornerRadius || 16}px; padding: 14px; display: flex; flex-direction: column; gap: 10px;">
            <div class="row" style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(6,182,212,0.2); display: flex; align-items: center; justify-content: center; font-size: 16px;">📍</div>
                <div>
                  <div class="title" style="color: #38bdf8; font-size: ${w.fontSize || 14}px; font-weight: 700;">${w.title || 'Location Button'}</div>
                  <div class="meta" style="color: #67e8f9; font-size: 11px;">GPS Switch Geologger</div>
                </div>
              </div>
              <div style="display: flex; gap: 4px;">
                <span id="badge-on-${w.id}" style="font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 9999px; background: rgba(34,197,94,0.2); color: #4ade80; display: ${lastOnLoc ? 'inline-block' : 'none'};">ON ✓</span>
                <span id="badge-off-${w.id}" style="font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: 9999px; background: rgba(239,68,68,0.2); color: #f87171; display: ${lastOffLoc ? 'inline-block' : 'none'};">OFF ✓</span>
              </div>
            </div>

            <!-- Section 1: ESP32-S3 DEVICE (HOST) -->
            <div style="background: #0c1d36; border: 1.5px solid #1d4ed8; border-radius: 12px; padding: 10px; display: flex; flex-direction: column; gap: 3px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; display: inline-block;"></span>
                  <span style="font-size: 10px; font-weight: 800; color: #60a5fa; letter-spacing: 0.5px; text-transform: uppercase;">ESP32-S3 DEVICE (HOST)</span>
                </div>
                <span id="host-badge-${w.id}" style="font-size: 8px; font-weight: 700; background: rgba(59,130,246,0.2); color: #93c5fd; padding: 2px 6px; border-radius: 4px;">CALIBRATED</span>
              </div>
              <div id="host-city-${w.id}" style="font-size: 12px; font-weight: 700; color: #f8fafc; margin-top: 2px;">
                📍 ${esp32Loc?.city || 'Calibrated Location'}${esp32Loc?.country ? ', ' + esp32Loc.country : ', India'}
              </div>
              <div id="host-addr-${w.id}" style="font-size: 10px; color: #94a3b8; line-height: 1.3;">
                ${esp32Loc?.address || 'Chennai, Tamil Nadu, India'}
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
                <span id="host-gps-${w.id}" style="font-size: 10px; color: #60a5fa; font-family: monospace; font-weight: 600;">
                  ${esp32Loc?.lat ? (esp32Loc.lat + '° N, ' + esp32Loc.lng + '° E') : '13.0147° N, 80.2242° E'}
                </span>
                <span id="host-source-${w.id}" style="font-size: 9px; color: #64748b;">
                  ${esp32Loc?.source ? '(' + esp32Loc.source.replace('IP Geolocation ', '') + ')' : '(Host Calibrated)'}
                </span>
              </div>
              <div style="display: flex; gap: 6px; margin-top: 6px;">
                <button id="host-gps-btn-${w.id}" onclick="detectLiveGpsLocation('${w.id}')" style="background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid #166534; border-radius: 6px; padding: 4px 8px; font-size: 9px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                  🔄 Detect Live GPS
                </button>
                <button id="host-refresh-btn-${w.id}" onclick="refreshHostLocation('${w.id}')" style="background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid #1d4ed8; border-radius: 6px; padding: 4px 8px; font-size: 9px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                  🎯 Calibrate Locality
                </button>
              </div>
            </div>

            <!-- Section 2: SWITCH ON LOCATION -->
            <div id="on-box-${w.id}" style="background: #092318; border: 1.5px solid ${lastOnLoc ? '#166534' : '#1e3a2b'}; border-radius: 12px; padding: 10px; display: flex; flex-direction: column; gap: 3px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span id="on-dot-${w.id}" style="width: 8px; height: 8px; border-radius: 50%; background: ${lastOnLoc ? '#22c55e' : '#475569'}; display: inline-block;"></span>
                  <span id="on-label-${w.id}" style="font-size: 10px; font-weight: 800; color: ${lastOnLoc ? '#4ade80' : '#94a3b8'}; letter-spacing: 0.5px; text-transform: uppercase;">SWITCH ON LOCATION</span>
                </div>
                <span id="on-badge-${w.id}" style="font-size: 8px; font-weight: 700; background: rgba(34,197,94,0.2); color: #86efac; padding: 2px 6px; border-radius: 4px; display: ${lastOnLoc ? 'inline-block' : 'none'};">LATEST</span>
              </div>
              <div id="on-content-${w.id}" style="display: ${lastOnLoc ? 'block' : 'none'};">
                <div id="on-city-${w.id}" style="font-size: 12px; font-weight: 700; color: #f8fafc; margin-top: 2px;">
                  🟢 ${lastOnLoc?.city || 'Logged Location'}
                </div>
                <div id="on-addr-${w.id}" style="font-size: 10px; color: #94a3b8; line-height: 1.3; margin-top: 1px;">
                  ${lastOnLoc?.address || ''}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
                  <span id="on-gps-${w.id}" style="font-size: 10px; color: #4ade80; font-family: monospace; font-weight: 600;">
                    ${lastOnLoc?.lat ? (lastOnLoc.lat + '° N, ' + lastOnLoc.lng + '° E') : ''}
                  </span>
                  <span id="on-time-${w.id}" style="font-size: 9px; color: #86efac;">
                    ${formatGeologTime(lastOnLoc)}
                  </span>
                </div>
                <a id="on-maps-btn-${w.id}" href="https://www.google.com/maps?q=${lastOnLoc?.lat || ''},${lastOnLoc?.lng || ''}" target="_blank" style="margin-top: 6px; background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid #166534; border-radius: 6px; padding: 5px 10px; font-size: 9px; font-weight: 700; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 4px;">
                  🗺️ View ON Location on Maps
                </a>
              </div>
              <div id="on-empty-${w.id}" style="display: ${lastOnLoc ? 'none' : 'block'}; font-size: 10px; color: #64748b; font-style: italic; margin-top: 2px;">
                No switch ON event recorded yet. Toggle the switch to capture location.
              </div>
            </div>

            <!-- Section 3: SWITCH OFF LOCATION -->
            <div id="off-box-${w.id}" style="background: #261214; border: 1.5px solid ${lastOffLoc ? '#991b1b' : '#3a1e22'}; border-radius: 12px; padding: 10px; display: flex; flex-direction: column; gap: 3px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span id="off-dot-${w.id}" style="width: 8px; height: 8px; border-radius: 50%; background: ${lastOffLoc ? '#ef4444' : '#475569'}; display: inline-block;"></span>
                  <span id="off-label-${w.id}" style="font-size: 10px; font-weight: 800; color: ${lastOffLoc ? '#f87171' : '#94a3b8'}; letter-spacing: 0.5px; text-transform: uppercase;">SWITCH OFF LOCATION</span>
                </div>
                <span id="off-badge-${w.id}" style="font-size: 8px; font-weight: 700; background: rgba(239,68,68,0.2); color: #fca5a5; padding: 2px 6px; border-radius: 4px; display: ${lastOffLoc ? 'inline-block' : 'none'};">LATEST</span>
              </div>
              <div id="off-content-${w.id}" style="display: ${lastOffLoc ? 'block' : 'none'};">
                <div id="off-city-${w.id}" style="font-size: 12px; font-weight: 700; color: #f8fafc; margin-top: 2px;">
                  🔴 ${lastOffLoc?.city || 'Logged Location'}
                </div>
                <div id="off-addr-${w.id}" style="font-size: 10px; color: #94a3b8; line-height: 1.3; margin-top: 1px;">
                  ${lastOffLoc?.address || ''}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
                  <span id="off-gps-${w.id}" style="font-size: 10px; color: #f87171; font-family: monospace; font-weight: 600;">
                    ${lastOffLoc?.lat ? (lastOffLoc.lat + '° N, ' + lastOffLoc.lng + '° E') : ''}
                  </span>
                  <span id="off-time-${w.id}" style="font-size: 9px; color: #fca5a5;">
                    ${formatGeologTime(lastOffLoc)}
                  </span>
                </div>
                <a id="off-maps-btn-${w.id}" href="https://www.google.com/maps?q=${lastOffLoc?.lat || ''},${lastOffLoc?.lng || ''}" target="_blank" style="margin-top: 6px; background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid #991b1b; border-radius: 6px; padding: 5px 10px; font-size: 9px; font-weight: 700; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 4px;">
                  🗺️ View OFF Location on Maps
                </a>
              </div>
              <div id="off-empty-${w.id}" style="display: ${lastOffLoc ? 'none' : 'block'}; font-size: 10px; color: #64748b; font-style: italic; margin-top: 2px;">
                No switch OFF event recorded yet. Toggle the switch to capture location.
              </div>
            </div>

            <!-- Section 4: SWITCH GEOLOG HISTORY -->
            <div style="margin-top: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">
                  SWITCH GEOLOG HISTORY (<span id="hist-count-${w.id}">${hist.length}</span>)
                </div>
                <button onclick="clearMobileGeologs('${w.id}')" style="background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); border-radius: 4px; padding: 2px 6px; font-size: 9px; font-weight: 700; cursor: pointer;">
                  Clear
                </button>
              </div>
              <div id="hist-list-${w.id}" style="display: flex; flex-direction: column; gap: 5px; max-height: 130px; overflow-y: auto;">
                ${hist.length === 0 ? `
                  <div id="hist-empty-${w.id}" style="font-size: 10px; color: #64748b; text-align: center; padding: 8px; background: #0b1322; border-radius: 8px;">
                    No location history yet. Toggle switches to record geologs.
                  </div>
                ` : hist.slice(0, 10).map(item => {
                  const isON = item.event === 'ON';
                  const isOFF = item.event === 'OFF';
                  const badgeBg = isON ? 'rgba(34,197,94,0.2)' : (isOFF ? 'rgba(239,68,68,0.2)' : 'rgba(56,189,248,0.2)');
                  const badgeColor = isON ? '#4ade80' : (isOFF ? '#f87171' : '#38bdf8');
                  const latStr = (item.lat && item.lng) 
                    ? (parseFloat(item.lat).toFixed(3) + '°N, ' + parseFloat(item.lng).toFixed(3) + '°E') 
                    : (item.lat ? (parseFloat(item.lat).toFixed(3) + '°') : '');
                  const timeFormatted = formatGeologTime(item);
                  return `
                    <div style="display: flex; justify-content: space-between; align-items: center; background: #0b1322; border-radius: 8px; padding: 6px 10px; border: 1px solid #1e293b;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${badgeBg}; color: ${badgeColor};">${item.event || 'LOG'}</span>
                        <div style="display: flex; flex-direction: column;">
                          <span style="font-size: 11px; font-weight: 600; color: #e2e8f0;">${item.city || 'Location'}</span>
                          ${latStr ? '<span style="font-size: 9px; color: #64748b; font-family: monospace;">' + latStr + '</span>' : ''}
                        </div>
                      </div>
                      <span style="font-size: 10px; color: #94a3b8; font-family: monospace;">${timeFormatted}</span>
                    </div>`;
                }).join('')}
              </div>
            </div>

            <button onclick="recordAndSendMobileLocation('${w.id}')" style="width: 100%; margin-top: 4px; background: #1e293b; color: #38bdf8; border: 1px solid #334155; border-radius: 10px; padding: 8px 12px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
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
          <div class="card" id="card-${w.id}" style="border: 1px solid #6366f1; background: #0e122b; border-radius: ${w.cornerRadius || 16}px;">
            <div class="row">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 28px; height: 28px; border-radius: 8px; background: rgba(99,102,241,0.25); display: flex; align-items: center; justify-content: center; font-size: 14px;">📝</div>
                <div>
                  <div class="title" style="color: #a5b4fc; font-size: ${w.fontSize || 14}px;">${w.title || 'Dynamic Form'}</div>
                  <div class="meta" style="color: #818cf8;">Question & Response Survey</div>
                </div>
              </div>
              <div class="live-pill" style="background: rgba(99,102,241,0.25); color: #c7d2fe;">${questionsList.length} QUESTION${questionsList.length === 1 ? '' : 'S'}</div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 6px;">
              ${questionsList.length === 0 ? `
                <div style="background: #090d1e; border-radius: 12px; padding: 14px; border: 1px dashed #1e254d; text-align: center; color: #64748b; font-size: 11px;">
                  No questions currently published. Questions created on the desktop canvas will appear here.
                </div>
              ` : questionsList.map((q, idx) => `
                <div style="background: #090d1e; border-radius: 12px; padding: 12px; border: 1px solid #1e254d;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-size: 11px; font-weight: 800; color: #818cf8;">Q${idx + 1}</span>
                    <span style="font-size: 9px; padding: 2px 6px; border-radius: 4px; background: rgba(99,102,241,0.2); color: #a5b4fc; text-transform: uppercase;">${q.type || 'text'}</span>
                  </div>
                  <div style="font-size: 13px; font-weight: 600; color: #f8fafc; margin-bottom: 8px;">
                    ${q.text}
                  </div>
                  
                  ${q.type === 'multiple_choice' && Array.isArray(q.options) && q.options.length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px;">
                      ${q.options.map((opt, optIdx) => `
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #cbd5e1; cursor: pointer; background: #131a38; padding: 6px 10px; border-radius: 8px; border: 1px solid #232d5b;">
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
                      style="width: 100%; background: #131a38; border: 1px solid #232d5b; border-radius: 8px; padding: 10px; font-size: 12px; color: #f8fafc; outline: none; margin-bottom: 8px;"
                      onkeypress="if(event.key === 'Enter') submitMobileFormAnswer('${w.id}', '${q.id}', '${q.text.replace(/'/g, "\\'")}')"
                    >
                  `}

                  <button 
                    onclick="submitMobileFormAnswer('${w.id}', '${q.id}', '${q.text.replace(/'/g, "\\'")}')"
                    style="width: 100%; background: #4f46e5; color: #fff; border: none; border-radius: 8px; padding: 8px 12px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;"
                  >
                    <span>Submit Answer 🚀</span>
                  </button>
                  <div id="status-${w.id}-${q.id}" style="font-size: 10px; color: #4ade80; text-align: center; margin-top: 4px; display: none;">✓ Response sent to desktop UI</div>
                </div>
              `).join('')}
            </div>

            <!-- Submitted Answers Container -->
            <div id="responses-wrap-${w.id}" style="margin-top: 12px; border-top: 1px solid #1e254d; padding-top: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 11px; font-weight: 800; color: #a5b4fc;">💬 Submitted Answers (<span id="resp-count-${w.id}">${responsesList.length}</span>)</span>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <button onclick="clearMobileFormAnswers('${w.id}')" style="background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); border-radius: 4px; padding: 2px 6px; font-size: 9px; font-weight: 700; cursor: pointer;">
                    Clear
                  </button>
                  <span style="font-size: 9px; padding: 2px 6px; border-radius: 4px; background: rgba(34,197,94,0.15); color: #4ade80; font-weight: 700;">● Live Stream</span>
                </div>
              </div>
              <div id="responses-list-${w.id}" style="display: flex; flex-direction: column; gap: 6px; max-height: 200px; overflow-y: auto;">
                ${responsesList.length === 0 ? `
                  <div id="resp-empty-${w.id}" style="font-size: 11px; color: #64748b; text-align: center; padding: 10px; background: #090d1e; border-radius: 8px;">
                    No answers submitted yet.
                  </div>
                ` : responsesList.map(r => `
                  <div class="resp-item" style="background: #131a38; border-radius: 8px; padding: 8px 10px; border: 1px solid #232d5b;">
                    <div style="display: flex; justify-content: space-between; font-size: 10px; color: #818cf8; margin-bottom: 3px;">
                      <span style="font-weight: 700;">${r.questionText || r.question || 'Answer'}</span>
                      <span style="color: #64748b;">${r.timestamp || r.time || ''}</span>
                    </div>
                    <div style="font-size: 12px; font-weight: 600; color: #4ade80;">💬 ${r.answer}</div>
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
              <div style="font-size: 12px; color: #38bdf8; font-weight: 800;">75%</div>
            </div>
            <div class="slider-bar-wrap" style="margin-top: 6px;">
              <div class="slider-bar-fill" style="width: 75%; background: #38bdf8;"></div>
            </div>
          </div>`;
      }
      return '';
    }).join('')}
    </div>
  </div>

  <script>
    const rules = ${logicBlocksJson};
    const widgetValues = {};
    const execCounts = {};

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
        const bodyObj = Object.assign({
          payload: cleanPayload || (isOff ? 'LED:0' : 'LED:1'),
          SwitchStatus: switchStatus,
          value: switchStatus === 1,
          port: COMPANION_PORT || 'COM9'
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

        var match = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i);
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
      (widgets.find(w => w.type === 'location')?.locationHistory || []).filter(g => !isStaleTestGeolog(g))
    )}).filter(function(g) { return !isStaleClientGeolog(g); });
    clientLocationHistory.sort(function(a, b) { return getClientLogTimestampMs(b) - getClientLogTimestampMs(a); });

    function formatClientLogTime(item) {
      if (!item) return '';
      if (typeof item === 'string') return item;
      if (item.time && typeof item.time === 'string' && !/^\d{10,}$/.test(item.time)) {
        return item.time;
      }
      var raw = item.timestamp || item.time;
      if (!raw) return new Date().toLocaleTimeString();
      if (typeof raw === 'number' || /^\d{10,}$/.test(String(raw))) {
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
        document.querySelectorAll('[id^="on-box-"]').forEach(function(el) { el.style.borderColor = '#166534'; el.style.background = '#092318'; });
        document.querySelectorAll('[id^="on-dot-"]').forEach(function(el) { el.style.background = '#22c55e'; });
        document.querySelectorAll('[id^="on-label-"]').forEach(function(el) { el.style.color = '#4ade80'; });
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
        document.querySelectorAll('[id^="on-maps-btn-"]').forEach(function(el) {
          el.href = 'https://www.google.com/maps?q=' + onLoc.lat + ',' + onLoc.lng;
          el.style.display = 'flex';
        });
      } else {
        document.querySelectorAll('[id^="badge-on-"]').forEach(function(el) { el.style.display = 'none'; });
        document.querySelectorAll('[id^="on-box-"]').forEach(function(el) { el.style.borderColor = '#1e3a2b'; el.style.background = '#092318'; });
        document.querySelectorAll('[id^="on-dot-"]').forEach(function(el) { el.style.background = '#475569'; });
        document.querySelectorAll('[id^="on-label-"]').forEach(function(el) { el.style.color = '#94a3b8'; });
        document.querySelectorAll('[id^="on-badge-"]').forEach(function(el) { el.style.display = 'none'; });
        document.querySelectorAll('[id^="on-content-"]').forEach(function(el) { el.style.display = 'none'; });
        document.querySelectorAll('[id^="on-empty-"]').forEach(function(el) { el.style.display = 'block'; });
      }

      if (offLoc && offLoc.lat && !isStaleClientGeolog(offLoc)) {
        document.querySelectorAll('[id^="badge-off-"]').forEach(function(el) { el.style.display = 'inline-block'; });
        document.querySelectorAll('[id^="off-box-"]').forEach(function(el) { el.style.borderColor = '#991b1b'; el.style.background = '#261214'; });
        document.querySelectorAll('[id^="off-dot-"]').forEach(function(el) { el.style.background = '#ef4444'; });
        document.querySelectorAll('[id^="off-label-"]').forEach(function(el) { el.style.color = '#f87171'; });
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
        document.querySelectorAll('[id^="off-maps-btn-"]').forEach(function(el) {
          el.href = 'https://www.google.com/maps?q=' + offLoc.lat + ',' + offLoc.lng;
          el.style.display = 'flex';
        });
      } else {
        document.querySelectorAll('[id^="badge-off-"]').forEach(function(el) { el.style.display = 'none'; });
        document.querySelectorAll('[id^="off-box-"]').forEach(function(el) { el.style.borderColor = '#3a1e22'; el.style.background = '#261214'; });
        document.querySelectorAll('[id^="off-dot-"]').forEach(function(el) { el.style.background = '#475569'; });
        document.querySelectorAll('[id^="off-label-"]').forEach(function(el) { el.style.color = '#94a3b8'; });
        document.querySelectorAll('[id^="off-badge-"]').forEach(function(el) { el.style.display = 'none'; });
        document.querySelectorAll('[id^="off-content-"]').forEach(function(el) { el.style.display = 'none'; });
        document.querySelectorAll('[id^="off-empty-"]').forEach(function(el) { el.style.display = 'block'; });
      }

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
            var badgeBg = isON ? 'rgba(34,197,94,0.2)' : (isOFF ? 'rgba(239,68,68,0.2)' : 'rgba(56,189,248,0.2)');
            var badgeColor = isON ? '#4ade80' : (isOFF ? '#f87171' : '#38bdf8');
            var latStr = (item.lat && item.lng) 
              ? (parseFloat(item.lat).toFixed(3) + '°N, ' + parseFloat(item.lng).toFixed(3) + '°E') 
              : (item.lat ? (parseFloat(item.lat).toFixed(3) + '°') : '');
            var timeFormatted = formatClientLogTime(item);
            return '<div style="display: flex; justify-content: space-between; align-items: center; background: #0b1322; border-radius: 8px; padding: 6px 10px; border: 1px solid #1e293b;">' +
              '<div style="display: flex; align-items: center; gap: 8px;">' +
                '<span style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ' + badgeBg + '; color: ' + badgeColor + ';">' + (item.event || 'LOG') + '</span>' +
                '<div style="display: flex; flex-direction: column;">' +
                  '<span style="font-size: 11px; font-weight: 600; color: #e2e8f0;">' + (item.city || 'Location') + '</span>' +
                  (latStr ? '<span style="font-size: 9px; color: #64748b; font-family: monospace;">' + latStr + '</span>' : '') +
                '</div>' +
              '</div>' +
              '<span style="font-size: 10px; color: #94a3b8; font-family: monospace;">' + timeFormatted + '</span>' +
            '</div>';
          }).join('');
        });
      } else {
        document.querySelectorAll('[id^="hist-list-"]').forEach(function(listEl) {
          var countEl = document.getElementById(listEl.id.replace('hist-list-', 'hist-count-'));
          if (countEl) countEl.innerText = '0';
          listEl.innerHTML = '<div style="font-size: 10px; color: #64748b; text-align: center; padding: 8px; background: #0b1322; border-radius: 8px;">No location history yet. Toggle switches to record geologs.</div>';
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
        listEl.innerHTML = '<div id="resp-empty-' + targetId + '" style="font-size: 11px; color: #64748b; text-align: center; padding: 10px; background: #090d1e; border-radius: 8px;">No answers submitted yet.</div>';
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
      item.style.cssText = 'background: #131a38; border-radius: 8px; padding: 8px 10px; border: 1px solid #232d5b; margin-bottom: 6px;';
      item.innerHTML = '<div style="display: flex; justify-content: space-between; font-size: 10px; color: #818cf8; margin-bottom: 3px;">' +
        '<span style="font-weight: 700;">' + (resp.questionText || resp.question || 'Answer') + '</span>' +
        '<span style="color: #64748b;">' + (resp.timestamp || resp.time || '') + '</span>' +
        '</div>' +
        '<div style="font-size: 12px; font-weight: 600; color: #4ade80;">💬 ' + resp.answer + '</div>' +
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

    function handleSwitch(id, checked, title) {
      const card = document.getElementById('card-' + id);
      if (card) {
        if (checked) card.classList.add('glow-blue');
        else card.classList.remove('glow-blue');
      }
      addLog('📱 [UI] ' + title + ' -> ' + (checked ? 'ON (Blinking)' : 'OFF (Stopped)'));

      var eventLabel = checked ? 'ON' : 'OFF';

      // 1. Host Location / Calibrated baseline for instant 0ms dynamic geologging
      var hostCityEl = document.querySelector('[id^="host-city-"]');
      var hostCityText = hostCityEl ? hostCityEl.innerText.replace('📍', '').trim().split(',')[0].trim() : 'Little Mount';
      var hostAddrEl = document.querySelector('[id^="host-addr-"]');
      var hostAddrText = hostAddrEl ? hostAddrEl.innerText.trim() : 'Little Mount, Anna Salai (Mount Road), Chennai, Tamil Nadu, 600015, India';
      var hostGpsEl = document.querySelector('[id^="host-gps-"]');
      var hostGpsText = hostGpsEl ? hostGpsEl.innerText.trim() : '13.0147° N, 80.2242° E';
      var defaultLat = 13.0147;
      var defaultLng = 80.2242;
      if (hostGpsText && hostGpsText.indexOf('°') !== -1) {
        var parts = hostGpsText.split(',');
        if (parts.length >= 2) {
          var p0 = parseFloat(parts[0]);
          var p1 = parseFloat(parts[1]);
          if (!isNaN(p0) && !isNaN(p1)) {
            defaultLat = p0;
            defaultLng = p1;
          }
        }
      }

      var instantLoc = {
        id: 'loc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        lat: defaultLat,
        lng: defaultLng,
        event: eventLabel,
        switchTitle: title || 'Device Switch',
        city: hostCityText || 'Little Mount',
        address: hostAddrText,
        time: new Date().toLocaleTimeString(),
        timestamp: Date.now(),
        source: 'Switch Event (' + (hostCityText || 'Host') + ')'
      };

      // 2. Immediately update mobile UI (0ms instant dynamic feedback!)
      updateMobileLocationCards(instantLoc);

      // 3. Dispatch hardware action with this instantLoc so companion server records it
      sendHardwareAction(checked ? 'LED:1' : 'LED:0', {
        widgetId: id,
        widgetType: 'switch',
        value: checked,
        switchTitle: title,
        location: instantLoc,
        autoGeolog: true
      });

      // 4. Try background GPS to refine coordinates (if browser geolocation supported / allowed)
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
                hostCityText || 'Switch Geolog';
              var address = (geo && geo.display_name) ? geo.display_name.split(',').slice(0, 4).join(',').trim() : (lat.toFixed(4) + '° N, ' + lng.toFixed(4) + '° E');
              var refinedLoc = {
                id: instantLoc.id,
                lat: lat,
                lng: lng,
                accuracy: Math.round(pos.coords.accuracy || 10),
                event: eventLabel,
                switchTitle: title,
                city: specific,
                address: address,
                time: instantLoc.time,
                timestamp: instantLoc.timestamp,
                source: 'Mobile GPS (' + specific + ')'
              };
              updateMobileLocationCards(refinedLoc);
              sendHardwareAction('LOC_SYNC', { location: refinedLoc, syncOnly: true });
            })
            .catch(function() {
              var refinedLoc = {
                id: instantLoc.id,
                lat: lat,
                lng: lng,
                accuracy: Math.round(pos.coords.accuracy || 10),
                event: eventLabel,
                switchTitle: title,
                city: hostCityText || 'Switch Geolog',
                address: lat.toFixed(4) + '° N, ' + lng.toFixed(4) + '° E',
                time: instantLoc.time,
                timestamp: instantLoc.timestamp,
                source: 'Mobile GPS'
              };
              updateMobileLocationCards(refinedLoc);
              sendHardwareAction('LOC_SYNC', { location: refinedLoc, syncOnly: true });
            });
          },
          function() {
            // Geolocation not available or denied - instantLoc already rendered and saved!
          },
          { timeout: 5000, enableHighAccuracy: true }
        );
      }

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
              formCard.innerHTML = '<div id="resp-empty-' + wid + '" style="font-size: 11px; color: #64748b; text-align: center; padding: 10px; background: #090d1e; border-radius: 8px;">No answers submitted yet.</div>';
            }
          } else {
            if (emptyEl) emptyEl.style.display = 'none';
            formCard.innerHTML = cleanResponses.map(function(r) {
              return '<div class="resp-item" style="background: #131a38; border-radius: 8px; padding: 8px 10px; border: 1px solid #232d5b; margin-bottom: 6px;">' +
                '<div style="display: flex; justify-content: space-between; font-size: 10px; color: #818cf8; margin-bottom: 3px;">' +
                '<span style="font-weight: 700;">' + (r.questionText || r.question || 'Answer') + '</span>' +
                '<span style="color: #64748b;">' + (r.timestamp || r.time || '') + '</span>' +
                '</div>' +
                '<div style="font-size: 12px; font-weight: 600; color: #4ade80;">💬 ' + r.answer + '</div>' +
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

    window.addEventListener('load', function() {
      pingCompanionServer();
      initRealtimeStateSync();
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

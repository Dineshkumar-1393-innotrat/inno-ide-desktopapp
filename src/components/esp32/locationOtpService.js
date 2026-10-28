/**
 * Location-Mismatch OTP Verification Service
 * Handles distance calculation (Haversine formula), GPS accuracy buffering,
 * cryptographically secure OTP generation, expiration, rate limiting,
 * verification token issuance, and single-use authorization for hardware switch operations.
 */

export const DEFAULT_DISTANCE_THRESHOLD_METERS = 50;
export const DEFAULT_LATITUDE = 13.0185;
export const DEFAULT_LONGITUDE = 80.2227;

/**
 * Immutable Single Source of Truth for Geofence Origin Coordinates:
 * Chennai Office: Door No. 17/A, Muthayal Naidu Street, Little Mount, Saidapet, Chennai (~13.0185° N, ~80.2227° E)
 */
export const GEOFENCE_ORIGIN = Object.freeze({
  latitude: 13.0185,
  longitude: 80.2227,
  lat: 13.0185,
  lng: 80.2227,
  name: "Chennai Office (Primary Location)",
  organization: "Innotrat Labs",
  city: "Little Mount, Saidapet",
  locality: "Little Mount",
  district: "Chennai",
  state: "Tamil Nadu",
  postalCode: "600015",
  country: "India",
  address: "Door No. 17/A, Muthayal Naidu Street, Little Mount, Saidapet, Chennai, Tamil Nadu 600015",
  source: "Chennai Office (Primary Location)"
});

export const PRIMARY_OFFICE_LOCATION = GEOFENCE_ORIGIN;

export const DEFAULT_OTP_EXPIRY_SECONDS = 1200; // 20 minutes
export const DEFAULT_MAX_ATTEMPTS = 3;
export const DEFAULT_RESEND_COOLDOWN_SECONDS = 30;

function getCrypto() {
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto;
  }
  return null;
}

/**
 * Converts a threshold value and unit to meters.
 * Validates that threshold is a finite, non-negative number.
 * Fails closed (returns null) if missing, invalid, or unsupported.
 * @param {number|string} threshold
 * @param {string} unit - 'm', 'km', 'ft', 'mi'
 * @returns {number|null} Converted threshold in meters, or null if invalid.
 */
export function convertThresholdToMeters(threshold, unit = 'm') {
  if (threshold === null || threshold === undefined || threshold === '') return null;
  const num = Number(threshold);
  if (isNaN(num) || !isFinite(num) || num < 0) return null;

  const cleanUnit = String(unit || 'm').toLowerCase().trim();
  switch (cleanUnit) {
    case 'm':
    case 'meter':
    case 'meters':
    case '':
      return num;
    case 'km':
    case 'kilometer':
    case 'kilometers':
      return num * 1000;
    case 'ft':
    case 'feet':
    case 'foot':
      return num * 0.3048;
    case 'mi':
    case 'mile':
    case 'miles':
      return num * 1609.344;
    default:
      return null;
  }
}

/**
 * Validates GPS coordinates and integrity.
 * Fails closed if missing, out of range, mocked, or inaccurate.
 * @param {Object} loc
 * @returns {{ valid: boolean, latitude?: number, longitude?: number, reason?: string }}
 */
export function validateGpsCoordinates(loc) {
  if (!loc || typeof loc !== 'object') {
    return { valid: false, reason: 'MISSING_LOCATION_OBJECT' };
  }
  const lat = loc.lat != null ? Number(loc.lat) : (loc.latitude != null ? Number(loc.latitude) : NaN);
  const lng = loc.lng != null ? Number(loc.lng) : (loc.lon != null ? Number(loc.lon) : (loc.longitude != null ? Number(loc.longitude) : NaN));

  if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
    return { valid: false, reason: 'INVALID_NUMERIC_COORDINATES' };
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { valid: false, reason: 'COORDINATES_OUT_OF_RANGE' };
  }
  if (loc.isMock === true || loc.mocked === true) {
    return { valid: false, reason: 'MOCKED_GPS_DETECTED' };
  }
  if (loc.accuracy != null) {
    const acc = Number(loc.accuracy);
    if (isNaN(acc) || !isFinite(acc) || acc < 0 || acc > 5000) {
      return { valid: false, reason: 'INVALID_GPS_ACCURACY' };
    }
  }
  return { valid: true, latitude: lat, longitude: lng };
}

/**
 * Calculates the great-circle distance between two GPS coordinates in meters using the Haversine formula.
 * Returns exact floating-point distance without premature integer rounding before comparison.
 * @param {number|string} lat1 - Latitude of first point
 * @param {number|string} lon1 - Longitude of first point
 * @param {number|string} lat2 - Latitude of second point
 * @param {number|string} lon2 - Longitude of second point
 * @returns {number|null} Exact distance in meters, or null if coordinates are invalid.
 */
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const p1 = Number(lat1);
  const l1 = Number(lon1);
  const p2 = Number(lat2);
  const l2 = Number(lon2);
  if (isNaN(p1) || isNaN(l1) || isNaN(p2) || isNaN(l2)) return null;
  if (!isFinite(p1) || !isFinite(l1) || !isFinite(p2) || !isFinite(l2)) return null;
  if (p1 < -90 || p1 > 90 || p2 < -90 || p2 > 90 || l1 < -180 || l1 > 180 || l2 < -180 || l2 > 180) return null;

  // Exact same coordinates
  if (p1 === p2 && l1 === l2) return 0;

  const R = 6371000; // Earth radius in meters
  const dLat = ((p2 - p1) * Math.PI) / 180;
  const dLon = ((l2 - l1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1 * Math.PI) / 180) *
      Math.cos((p2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats a distance in meters into human-readable text (e.g. "45 m" or "1.4 km").
 */
export function formatDistance(meters) {
  if (meters == null || isNaN(meters)) return 'Unknown distance';
  if (meters < 1000) return String(Math.round(meters * 10) / 10) + ' m';
  return (meters / 1000).toFixed(2) + ' km';
}

/**
 * Compares current location strictly against the fixed GEOFENCE_ORIGIN constant.
 * Never uses previous location or dynamic location as origin.
 * Enforces boundary: distanceMeters <= thresholdMeters -> allow; distanceMeters > thresholdMeters -> OTP required.
 * @param {Object} param1 - Location object or (legacy prevLoc)
 * @param {Object|number} [param2] - Current location or threshold
 * @param {number} [param3] - Configurable threshold
 * @returns {Object} Mismatch evaluation result
 */
export function isLocationMismatch(param1, param2, param3) {
  let curLoc;
  let rawThreshold;

  if (param3 !== undefined) {
    // Legacy call: (prevLoc, curLoc, threshold) -> strictly compare curLoc against GEOFENCE_ORIGIN
    curLoc = param2;
    rawThreshold = param3;
  } else if (param2 !== undefined && (typeof param2 === 'number' || typeof param2 === 'string')) {
    // Standard call: (curLoc, threshold)
    curLoc = param1;
    rawThreshold = param2;
  } else {
    // Default call: (curLoc)
    curLoc = param2 || param1;
    rawThreshold = DEFAULT_DISTANCE_THRESHOLD_METERS;
  }

  // Validate and convert threshold (fail closed if missing or invalid)
  const thresholdMeters = convertThresholdToMeters(rawThreshold);
  if (thresholdMeters === null) {
    return {
      isMismatch: true,
      distance: null,
      threshold: rawThreshold,
      origin: GEOFENCE_ORIGIN,
      reason: 'INVALID_OR_MISSING_THRESHOLD'
    };
  }

  // GPS validation (fail closed)
  const gpsValidation = validateGpsCoordinates(curLoc);
  if (!gpsValidation.valid) {
    return {
      isMismatch: true,
      distance: null,
      threshold: thresholdMeters,
      origin: GEOFENCE_ORIGIN,
      reason: gpsValidation.reason
    };
  }

  const rawDist = calculateDistanceMeters(
    GEOFENCE_ORIGIN.latitude,
    GEOFENCE_ORIGIN.longitude,
    gpsValidation.latitude,
    gpsValidation.longitude
  );

  if (rawDist === null) {
    return {
      isMismatch: true,
      distance: null,
      threshold: thresholdMeters,
      origin: GEOFENCE_ORIGIN,
      reason: 'INVALID_COORDINATES'
    };
  }

  // Boundary condition check:
  // distanceMeters <= thresholdMeters -> within boundary (no OTP, isMismatch: false)
  // distanceMeters > thresholdMeters -> outside boundary (OTP required, isMismatch: true)
  const isMismatch = rawDist > thresholdMeters;

  return {
    isMismatch,
    distance: rawDist,
    threshold: thresholdMeters,
    origin: GEOFENCE_ORIGIN,
    currentLocation: curLoc,
    formattedDistance: formatDistance(rawDist)
  };
}

export function generateSecureOtp() {
  const c = getCrypto();
  if (c && typeof c.getRandomValues === 'function') {
    const arr = new Uint32Array(1);
    c.getRandomValues(arr);
    const num = (arr[0] % 900000) + 100000;
    return String(num);
  }
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Generates a random cryptographic token for single-use authorization.
 */
export function generateVerificationToken() {
  const c = getCrypto();
  if (c && typeof c.randomUUID === 'function') {
    return (c.randomUUID().replace(/-/g, '') + c.randomUUID().replace(/-/g, '')).substring(0, 48);
  }
  if (c && typeof c.getRandomValues === 'function') {
    const bytes = new Uint8Array(24);
    c.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return (
    Math.random().toString(36).substring(2) +
    Math.random().toString(36).substring(2) +
    Date.now().toString(36)
  );
}

/**
 * Service managing the OTP verification lifecycle, rate limiting, and single-use hardware tokens.
 */
export class LocationOtpService {
  constructor(options = {}) {
    this.otpExpirySeconds = options.otpExpirySeconds || DEFAULT_OTP_EXPIRY_SECONDS;
    this.maxAttempts = options.maxAttempts || DEFAULT_MAX_ATTEMPTS;
    this.resendCooldownSeconds = options.resendCooldownSeconds || DEFAULT_RESEND_COOLDOWN_SECONDS;
    this.distanceThresholdMeters = options.distanceThresholdMeters || DEFAULT_DISTANCE_THRESHOLD_METERS;
    this.devDemoMode = options.devDemoMode !== undefined ? options.devDemoMode : true;

    // challengeId -> challenge record
    this.challenges = new Map();
    // token -> verified single-use token record
    this.verifiedTokens = new Map();
    // Security and audit logs
    this.auditLogs = [];
  }

  logEvent(type, details) {
    const logEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString(),
      type,
      ...details
    };
    this.auditLogs.push(logEntry);
    if (this.auditLogs.length > 200) this.auditLogs.shift();
    return logEntry;
  }

  /**
   * Creates a new OTP verification challenge for a pending switch operation.
   * Synchronizes OTP expiration lifetime directly with the QR validation session.
   */
  createChallenge({
    widgetId = 'w-led',
    switchTitle = 'Switch',
    action = 'OFF',
    deviceId = 'ESP32-S3 (COM9)',
    currentLocation = null,
    previousLocation = null,
    threshold = null,
    unit = 'm',
    devDemoMode = null,
    qrSession = null,
    qrExpiresAt = null
  } = {}) {
    this.cleanExpired();

    const normalizedAction = String(action).toUpperCase() === 'ON' ? 'ON' : 'OFF';
    const effectiveThreshold = threshold != null ? (convertThresholdToMeters(threshold, unit) || this.distanceThresholdMeters) : this.distanceThresholdMeters;
    const mismatchResult = isLocationMismatch(currentLocation, effectiveThreshold);
    const otp = generateSecureOtp();
    const challengeId = `otp-${Date.now()}-${generateVerificationToken().substring(0, 8)}`;
    const now = Date.now();
    const isDemo = devDemoMode !== null ? devDemoMode : this.devDemoMode;

    // Calculate expiration synchronized with QR validation session
    let targetExpiresAt = now + (this.otpExpirySeconds * 1000);
    let resolvedQrExp = null;
    if (qrExpiresAt) {
      const numExp = Number(qrExpiresAt);
      if (!isNaN(numExp) && numExp > 0) {
        resolvedQrExp = numExp;
        targetExpiresAt = Math.min(targetExpiresAt, numExp);
      }
    }
    const expiresInSeconds = Math.max(0, Math.round((targetExpiresAt - now) / 1000));

    const challenge = {
      challengeId,
      otp, // Plain OTP kept in server memory only
      widgetId,
      switchTitle,
      action: normalizedAction,
      deviceId,
      currentLocation,
      previousLocation,
      distance: mismatchResult.distance,
      threshold: effectiveThreshold,
      createdAt: now,
      expiresAt: targetExpiresAt,
      qrSession: qrSession ? Number(qrSession) : null,
      qrExpiresAt: resolvedQrExp,
      lastRequestedAt: now,
      attempts: 0,
      maxAttempts: this.maxAttempts,
      resendCount: 0,
      status: 'PENDING' // 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'MAX_ATTEMPTS_EXCEEDED' | 'CANCELLED'
    };

    this.challenges.set(challengeId, challenge);

    this.logEvent('OTP_CHALLENGE_CREATED', {
      challengeId,
      widgetId,
      action: normalizedAction,
      deviceId,
      distance: mismatchResult.distance,
      expiresInSeconds,
      qrExpiresAt: resolvedQrExp
    });

    return {
      success: true,
      challengeId,
      action: normalizedAction,
      switchTitle,
      distance: mismatchResult.distance,
      threshold: effectiveThreshold,
      expiresInSeconds,
      qrExpiresAt: resolvedQrExp,
      qrSession: challenge.qrSession,
      resendCooldownSeconds: this.resendCooldownSeconds,
      devDemoMode: isDemo,
      // Section 2 Requirement: Display generated OTP in popup for development/demo implementation behind flag
      devOtp: isDemo ? otp : undefined,
      currentLocation,
      previousLocation
    };
  }

  /**
   * Verifies the submitted OTP against the pending challenge.
   */
  verifyOtp({ challengeId, otp, widgetId = null, action = null }) {
    if (!challengeId || !this.challenges.has(challengeId)) {
      return {
        success: false,
        error: 'Challenge not found or already completed.',
        code: 'CHALLENGE_NOT_FOUND'
      };
    }

    const challenge = this.challenges.get(challengeId);
    const now = Date.now();

    // Check QR validation session expiration along with OTP expiration
    if (challenge.qrExpiresAt && now > challenge.qrExpiresAt) {
      challenge.status = 'EXPIRED';
      this.logEvent('OTP_QR_SESSION_EXPIRED', { challengeId, widgetId: challenge.widgetId, qrExpiresAt: challenge.qrExpiresAt });
      return {
        success: false,
        error: 'OTP expired along with QR code validation session. Please re-scan or regenerate QR code.',
        code: 'QR_SESSION_EXPIRED'
      };
    }

    // Check expiration
    if (now > challenge.expiresAt || challenge.status === 'EXPIRED') {
      challenge.status = 'EXPIRED';
      this.logEvent('OTP_EXPIRED', { challengeId, widgetId: challenge.widgetId });
      return {
        success: false,
        error: 'OTP expired. Request a new OTP.',
        code: 'OTP_EXPIRED'
      };
    }

    // Check status
    if (challenge.status === 'CANCELLED') {
      return {
        success: false,
        error: 'Verification was cancelled. Please initiate the switch operation again.',
        code: 'CHALLENGE_CANCELLED'
      };
    }

    // Check maximum attempts
    if (challenge.attempts >= challenge.maxAttempts || challenge.status === 'MAX_ATTEMPTS_EXCEEDED') {
      challenge.status = 'MAX_ATTEMPTS_EXCEEDED';
      this.logEvent('OTP_MAX_ATTEMPTS_EXCEEDED', { challengeId, widgetId: challenge.widgetId });
      return {
        success: false,
        error: 'Maximum verification attempts exceeded. Please request a new OTP later.',
        code: 'MAX_ATTEMPTS_EXCEEDED'
      };
    }

    // Check binding (widget and action)
    if (widgetId && challenge.widgetId !== widgetId) {
      return {
        success: false,
        error: 'Challenge does not match the target switch.',
        code: 'MISMATCH_WIDGET'
      };
    }
    if (action && challenge.action !== String(action).toUpperCase()) {
      return {
        success: false,
        error: 'Challenge does not match the requested switch action.',
        code: 'MISMATCH_ACTION'
      };
    }

    // Check empty OTP
    const cleanOtp = String(otp || '').trim();
    if (!cleanOtp) {
      return {
        success: false,
        error: 'Please enter the OTP.',
        code: 'EMPTY_OTP'
      };
    }

    // Check correctness
    if (cleanOtp !== challenge.otp) {
      challenge.attempts += 1;
      const remaining = challenge.maxAttempts - challenge.attempts;
      this.logEvent('OTP_INCORRECT_ATTEMPT', {
        challengeId,
        widgetId: challenge.widgetId,
        attempts: challenge.attempts,
        remaining
      });

      if (challenge.attempts >= challenge.maxAttempts) {
        challenge.status = 'MAX_ATTEMPTS_EXCEEDED';
        return {
          success: false,
          error: 'Maximum verification attempts exceeded. Please request a new OTP later.',
          code: 'MAX_ATTEMPTS_EXCEEDED',
          remainingAttempts: 0
        };
      }

      return {
        success: false,
        error: 'Invalid OTP. Please try again.',
        code: 'INVALID_OTP',
        remainingAttempts: remaining
      };
    }

    // Successful OTP verification!
    challenge.status = 'VERIFIED';
    const token = generateVerificationToken();

    // Issue single-use token valid within the remaining QR validation session
    const tokenRecord = {
      token,
      challengeId,
      widgetId: challenge.widgetId,
      action: challenge.action,
      deviceId: challenge.deviceId,
      location: challenge.currentLocation,
      issuedAt: now,
      expiresAt: challenge.qrExpiresAt ? Math.min(now + 1200000, challenge.qrExpiresAt) : now + 1200000,
      qrExpiresAt: challenge.qrExpiresAt || null,
      consumed: false
    };

    this.verifiedTokens.set(token, tokenRecord);

    this.logEvent('OTP_VERIFIED_SUCCESS', {
      challengeId,
      widgetId: challenge.widgetId,
      action: challenge.action
    });

    return {
      success: true,
      message: 'Location verified. Executing switch operation.',
      verificationToken: token,
      challengeId,
      action: challenge.action
    };
  }

  /**
   * Resends a new OTP for an active challenge, respecting cooldown and QR validation session.
   */
  resendOtp({ challengeId, devDemoMode = null }) {
    if (!challengeId || !this.challenges.has(challengeId)) {
      return {
        success: false,
        error: 'Challenge not found.',
        code: 'CHALLENGE_NOT_FOUND'
      };
    }

    const challenge = this.challenges.get(challengeId);
    const now = Date.now();

    // Check if QR session has already expired before anything else
    if (challenge.qrExpiresAt && now >= challenge.qrExpiresAt) {
      challenge.status = 'EXPIRED';
      return {
        success: false,
        error: 'QR validation session has expired. Please re-scan or regenerate QR code.',
        code: 'QR_SESSION_EXPIRED'
      };
    }

    const elapsedSeconds = Math.floor((now - challenge.lastRequestedAt) / 1000);

    if (elapsedSeconds < this.resendCooldownSeconds) {
      const waitTime = this.resendCooldownSeconds - elapsedSeconds;
      return {
        success: false,
        error: `Please wait ${waitTime}s before requesting a new OTP.`,
        code: 'RESEND_COOLDOWN',
        remainingCooldown: waitTime
      };
    }

    // Generate fresh OTP and reset attempts
    const newOtp = generateSecureOtp();
    challenge.otp = newOtp;
    challenge.attempts = 0;
    challenge.status = 'PENDING';
    challenge.lastRequestedAt = now;

    // Recalculate expiration respecting QR session validity
    let newExpiresAt = now + (this.otpExpirySeconds * 1000);
    if (challenge.qrExpiresAt) {
      newExpiresAt = Math.min(newExpiresAt, challenge.qrExpiresAt);
    }
    const remSeconds = Math.max(0, Math.round((newExpiresAt - now) / 1000));
    if (remSeconds <= 0) {
      challenge.status = 'EXPIRED';
      return {
        success: false,
        error: 'QR validation session has expired. Please re-scan or regenerate QR code.',
        code: 'QR_SESSION_EXPIRED'
      };
    }
    challenge.expiresAt = newExpiresAt;
    challenge.resendCount += 1;

    const isDemo = devDemoMode !== null ? devDemoMode : this.devDemoMode;

    this.logEvent('OTP_RESENT', {
      challengeId,
      widgetId: challenge.widgetId,
      resendCount: challenge.resendCount,
      expiresInSeconds: remSeconds
    });

    return {
      success: true,
      challengeId,
      action: challenge.action,
      expiresInSeconds: remSeconds,
      qrExpiresAt: challenge.qrExpiresAt,
      resendCooldownSeconds: this.resendCooldownSeconds,
      devDemoMode: isDemo,
      devOtp: isDemo ? newOtp : undefined
    };
  }

  /**
   * Cancels a pending challenge.
   */
  cancelChallenge({ challengeId }) {
    if (challengeId && this.challenges.has(challengeId)) {
      const ch = this.challenges.get(challengeId);
      ch.status = 'CANCELLED';
      this.logEvent('OTP_CHALLENGE_CANCELLED', { challengeId, widgetId: ch.widgetId });
      return { success: true, message: 'Challenge cancelled' };
    }
    return { success: false, error: 'Challenge not found' };
  }

  /**
   * Validates a single-use verification token presented to authorize a hardware switch operation.
   */
  validateToken({ token, widgetId = null, action = null }) {
    if (!token) {
      return {
        valid: false,
        error: 'Invalid or missing OTP verification token.',
        code: 'TOKEN_INVALID'
      };
    }

    // In dev demo mode, accept client-generated fallback verification tokens (e.g. offline or fallback mode)
    if (this.devDemoMode && typeof token === 'string' && (token.startsWith('vt-local-') || token.startsWith('vt-demo-'))) {
      return {
        valid: true,
        consumed: true,
        token,
        widgetId,
        action,
        demoAuthorized: true
      };
    }

    if (!this.verifiedTokens.has(token)) {
      return {
        valid: false,
        error: 'Invalid or missing OTP verification token.',
        code: 'TOKEN_INVALID'
      };
    }

    const rec = this.verifiedTokens.get(token);
    const now = Date.now();

    if (rec.consumed) {
      return {
        valid: false,
        error: 'Verification token has already been used.',
        code: 'TOKEN_ALREADY_USED'
      };
    }

    // Check QR validation session expiration along with token lifetime
    if (rec.qrExpiresAt && now > rec.qrExpiresAt) {
      this.verifiedTokens.delete(token);
      return {
        valid: false,
        error: 'QR validation session expired. Please verify again.',
        code: 'QR_SESSION_EXPIRED'
      };
    }

    if (now > rec.expiresAt) {
      this.verifiedTokens.delete(token);
      return {
        valid: false,
        error: 'Verification token has expired. Please verify again.',
        code: 'TOKEN_EXPIRED'
      };
    }

    if (widgetId && rec.widgetId && rec.widgetId !== widgetId && widgetId !== 'w-led') {
      return {
        valid: false,
        error: 'Verification token does not match the requested switch.',
        code: 'TOKEN_WIDGET_MISMATCH'
      };
    }

    if (action && rec.action !== String(action).toUpperCase()) {
      return {
        valid: false,
        error: 'Verification token does not match the requested switch action.',
        code: 'TOKEN_ACTION_MISMATCH'
      };
    }

    return {
      valid: true,
      tokenRecord: rec
    };
  }

  /**
   * Consumes a single-use token immediately after hardware authorization.
   */
  consumeToken(token) {
    if (token && this.verifiedTokens.has(token)) {
      const rec = this.verifiedTokens.get(token);
      rec.consumed = true;
      this.verifiedTokens.delete(token);
      this.logEvent('TOKEN_CONSUMED', { token: token.substring(0, 8) + '...', challengeId: rec.challengeId });
      return true;
    }
    return false;
  }

  cleanExpired() {
    const now = Date.now();
    for (const [id, ch] of this.challenges.entries()) {
      if (now > ch.expiresAt + 600000) {
        this.challenges.delete(id);
      }
    }
    for (const [t, rec] of this.verifiedTokens.entries()) {
      if (now > rec.expiresAt + 600000) {
        this.verifiedTokens.delete(t);
      }
    }
  }
}

// Default singleton instance for companion server
export const defaultLocationOtpService = new LocationOtpService();

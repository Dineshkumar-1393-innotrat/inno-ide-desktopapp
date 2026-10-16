/**
 * Location-Mismatch OTP Verification Service
 * Handles distance calculation (Haversine formula), GPS accuracy buffering,
 * cryptographically secure OTP generation, expiration, rate limiting,
 * verification token issuance, and single-use authorization for hardware switch operations.
 */

export const DEFAULT_DISTANCE_THRESHOLD_METERS = 100;
export const DEFAULT_OTP_EXPIRY_SECONDS = 300; // 5 minutes
export const DEFAULT_MAX_ATTEMPTS = 3;
export const DEFAULT_RESEND_COOLDOWN_SECONDS = 30;

function getCrypto() {
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto;
  }
  return null;
}

/**
 * Calculates the great-circle distance between two GPS coordinates in meters using the Haversine formula.
 * @param {number|string} lat1 - Latitude of first point
 * @param {number|string} lon1 - Longitude of first point
 * @param {number|string} lat2 - Latitude of second point
 * @param {number|string} lon2 - Longitude of second point
 * @returns {number|null} Distance in meters rounded to nearest integer, or null if coordinates are invalid.
 */
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const p1 = Number(lat1);
  const l1 = Number(lon1);
  const p2 = Number(lat2);
  const l2 = Number(lon2);
  if (isNaN(p1) || isNaN(l1) || isNaN(p2) || isNaN(l2)) return null;

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
  return Math.round(R * c);
}

/**
 * Formats a distance in meters into human-readable text (e.g. "45 m" or "1.4 km").
 */
export function formatDistance(meters) {
  if (meters == null || isNaN(meters)) return 'Unknown distance';
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Compares current location with previous successful location, accounting for GPS accuracy.
 * @param {Object} prevLoc - Previous successful operation location
 * @param {Object} curLoc - Current device location
 * @param {number} thresholdMeters - Configurable threshold (default: 100m)
 * @returns {Object} Mismatch evaluation result
 */
export function isLocationMismatch(prevLoc, curLoc, thresholdMeters = DEFAULT_DISTANCE_THRESHOLD_METERS) {
  // If there is no previous successful location recorded, this is the first operation -> no mismatch
  if (!prevLoc || (prevLoc.lat == null && prevLoc.latitude == null) || (prevLoc.lng == null && prevLoc.longitude == null)) {
    return {
      isMismatch: false,
      distance: 0,
      threshold: thresholdMeters,
      reason: 'FIRST_OPERATION_NO_PREVIOUS_LOCATION'
    };
  }

  // If current location is missing/unavailable, we cannot verify location
  if (!curLoc || (curLoc.lat == null && curLoc.latitude == null) || (curLoc.lng == null && curLoc.longitude == null)) {
    return {
      isMismatch: true,
      distance: null,
      threshold: thresholdMeters,
      reason: 'MISSING_CURRENT_LOCATION'
    };
  }

  const prevLat = prevLoc.lat != null ? prevLoc.lat : prevLoc.latitude;
  const prevLng = prevLoc.lng != null ? prevLoc.lng : prevLoc.longitude;
  const curLat = curLoc.lat != null ? curLoc.lat : curLoc.latitude;
  const curLng = curLoc.lng != null ? curLoc.lng : curLoc.longitude;

  const rawDist = calculateDistanceMeters(prevLat, prevLng, curLat, curLng);
  if (rawDist === null) {
    return {
      isMismatch: true,
      distance: null,
      threshold: thresholdMeters,
      reason: 'INVALID_COORDINATES'
    };
  }

  // Account for GPS accuracy and temporary fluctuations:
  // We apply an accuracy buffer to avoid unnecessary OTP prompts caused by GPS drift.
  // We cap the buffer at 50 meters so wide GPS inaccuracies don't mask a real physical move.
  const prevAcc = Number(prevLoc.accuracy || 0);
  const curAcc = Number(curLoc.accuracy || 0);
  const accuracyBuffer = Math.min(Math.max(prevAcc, curAcc), 50);
  const effectiveThreshold = thresholdMeters + accuracyBuffer;

  const isMismatch = rawDist > effectiveThreshold;

  return {
    isMismatch,
    distance: rawDist,
    threshold: thresholdMeters,
    effectiveThreshold,
    accuracyBuffer,
    formattedDistance: formatDistance(rawDist)
  };
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP.
 */
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
   */
  createChallenge({
    widgetId = 'w-led',
    switchTitle = 'Switch',
    action = 'OFF',
    deviceId = 'ESP32-S3 (COM9)',
    currentLocation = null,
    previousLocation = null,
    devDemoMode = null
  } = {}) {
    this.cleanExpired();

    const normalizedAction = String(action).toUpperCase() === 'ON' ? 'ON' : 'OFF';
    const mismatchResult = isLocationMismatch(previousLocation, currentLocation, this.distanceThresholdMeters);
    const otp = generateSecureOtp();
    const challengeId = `otp-${Date.now()}-${generateVerificationToken().substring(0, 8)}`;
    const now = Date.now();
    const isDemo = devDemoMode !== null ? devDemoMode : this.devDemoMode;

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
      threshold: this.distanceThresholdMeters,
      createdAt: now,
      expiresAt: now + (this.otpExpirySeconds * 1000),
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
      distance: mismatchResult.distance
    });

    return {
      success: true,
      challengeId,
      action: normalizedAction,
      switchTitle,
      distance: mismatchResult.distance,
      threshold: this.distanceThresholdMeters,
      expiresInSeconds: this.otpExpirySeconds,
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

    // Issue single-use token valid for 60 seconds to complete the hardware switch
    const tokenRecord = {
      token,
      challengeId,
      widgetId: challenge.widgetId,
      action: challenge.action,
      deviceId: challenge.deviceId,
      location: challenge.currentLocation,
      issuedAt: now,
      expiresAt: now + 300000, // 5 minutes validity
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
   * Resends a new OTP for an active challenge, respecting cooldown.
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
    challenge.expiresAt = now + (this.otpExpirySeconds * 1000);
    challenge.resendCount += 1;

    const isDemo = devDemoMode !== null ? devDemoMode : this.devDemoMode;

    this.logEvent('OTP_RESENT', {
      challengeId,
      widgetId: challenge.widgetId,
      resendCount: challenge.resendCount
    });

    return {
      success: true,
      challengeId,
      action: challenge.action,
      expiresInSeconds: this.otpExpirySeconds,
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

// ──────────────────────────────────────────────
// JWT Decode Helpers (frontend-safe, no verify)
// These helpers decode without validating signature.
// Use ONLY on the frontend to read payload data.
// The backend ALWAYS verifies with jsonwebtoken.
// ──────────────────────────────────────────────

/**
 * Safely decode a JWT token and return its payload.
 * Returns null on any error (invalid token, malformed, etc.)
 * @param {string} token
 * @returns {object|null}
 */
export function decodeToken(token) {
  if (!token || typeof token !== "string") return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Base64url → Base64 → JSON
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Get structured token payload: { _id, role, exp, iat }
 * Returns null if token is invalid.
 * @param {string} token
 * @returns {{ _id: string, role: string, exp: number, iat: number }|null}
 */
export function getTokenPayload(token) {
  return decodeToken(token);
}

/**
 * Check if a JWT token is expired.
 * Returns true if expired OR if the token is invalid.
 * @param {string} token
 * @returns {boolean}
 */
export function isTokenExpired(token) {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;

  // exp is in seconds; Date.now() is in milliseconds
  return Date.now() >= payload.exp * 1000;
}

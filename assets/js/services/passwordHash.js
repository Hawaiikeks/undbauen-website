/**
 * Password Hashing Service
 * Uses Web Crypto API for secure password hashing
 *
 * Note: This is a client-side implementation. For production,
 * password hashing should be done server-side.
 */

/**
 * Hash password using PBKDF2
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password (base64 encoded salt+hash)
 */
export async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey('raw', data, { name: 'PBKDF2' }, false, [
    'deriveBits'
  ]);

  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  // Combine salt + hash for storage
  const combined = new Uint8Array(salt.length + hash.byteLength);
  combined.set(salt);
  combined.set(new Uint8Array(hash), salt.length);

  // Return base64 encoded string
  return btoa(String.fromCharCode(...combined));
}

/**
 * Verify password against hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password (base64 encoded salt+hash)
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(password, hash) {
  if (!password || !hash) {
    return false;
  }

  try {
    // Decode base64
    const combined = Uint8Array.from(atob(hash), c => c.charCodeAt(0));
    const salt = combined.slice(0, 16);
    const storedHash = combined.slice(16);

    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const keyMaterial = await crypto.subtle.importKey('raw', data, { name: 'PBKDF2' }, false, [
      'deriveBits'
    ]);

    const computedHash = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );

    // Constant-time comparison to prevent timing attacks
    const computedArray = new Uint8Array(computedHash);
    if (computedArray.length !== storedHash.length) {
      return false;
    }

    let equal = true;
    for (let i = 0; i < computedArray.length; i++) {
      equal = equal && computedArray[i] === storedHash[i];
    }
    return equal;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Check if password needs rehashing (e.g., if algorithm changed)
 * @param {string} hash - Hashed password
 * @returns {boolean}
 */
export function needsRehash(hash) {
  // For now, always return false
  // In future, check hash version/algorithm
  return false;
}









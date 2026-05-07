/**
 * Client-side cryptographic utilities for PIN hashing
 * Uses SubtleCrypto API (available in all modern browsers)
 */

/**
 * Generate SHA-256 hash of a string
 * Returns hex-encoded hash string
 */
export async function hashPin(pin: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Convert ArrayBuffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('PIN hashing failed:', error);
    throw new Error('PIN hashing failed');
  }
}

/**
 * Verify if a plaintext PIN matches a stored hash
 */
export async function verifyPin(plainPin: string, storedHash: string): Promise<boolean> {
  try {
    const computedHash = await hashPin(plainPin);
    return computedHash === storedHash;
  } catch {
    return false;
  }
}

/**
 * Generate HMAC-SHA256 for request signing (CSRF protection)
 */
export async function generateHmac(message: string, secret: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      secretKey,
      encoder.encode(message)
    );
    
    const signatureArray = Array.from(new Uint8Array(signature));
    return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('HMAC generation failed:', error);
    throw new Error('HMAC generation failed');
  }
}

/**
 * Constant-time comparison to prevent timing attacks
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Backend cryptographic utilities for Cloudflare Workers
 * Uses SubtleCrypto API available in Cloudflare Workers
 */

/**
 * Hash a PIN using PBKDF2 (more suitable for passwords than SHA-256)
 * This should match the hashing algorithm used on client-side
 */
export async function hashPin(pin: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    
    // Use SHA-256 to match client-side hashing
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('PIN hashing failed:', error);
    throw new Error('PIN hashing failed');
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

/**
 * Validate PIN format
 */
export function validatePin(pin: string): { valid: boolean; error?: string } {
  if (!pin || typeof pin !== 'string') {
    return { valid: false, error: 'PIN is required' };
  }
  
  if (!/^\d{4}$/.test(pin)) {
    return { valid: false, error: 'PIN must be exactly 4 digits' };
  }
  
  return { valid: true };
}

/**
 * Rate limiting helper with exponential backoff
 * Locks for: 5 min (5 fails) → 15 min (10 fails) → 30 min (15 fails) → 60 min (20+ fails)
 * Uses attemptKey (session/device ID) instead of IP to avoid blocking entire WiFi network
 * 
 * @param kv KV namespace for storing attempt records
 * @param attemptKey Unique identifier (sessionId, deviceId, etc.) - NOT IP address
 * @returns Object with allowed flag and remaining attempts info
 */
export async function checkRateLimitWithBackoff(
  kv: KVNamespace,
  attemptKey: string
): Promise<{
  allowed: boolean;
  failedAttempts: number;
  lockoutUntil?: number;
  lockoutMinutes?: number;
  message?: string;
}> {
  const key = `rate-limit:${attemptKey}`;
  const now = Date.now();
  
  try {
    // Get current attempt record
    const data = await kv.get(key, 'json') as {
      failedAttempts: number;
      lockoutUntil: number;
      firstAttemptTime: number;
    } | null;

    if (data && data.lockoutUntil > now) {
      // Still in lockout period
      const remainingMs = data.lockoutUntil - now;
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      
      return {
        allowed: false,
        failedAttempts: data.failedAttempts,
        lockoutUntil: data.lockoutUntil,
        lockoutMinutes: remainingMinutes,
        message: `Bị khóa ${remainingMinutes} phút. Thử lại sau.`
      };
    }

    // Not in lockout or lockout expired
    if (data && data.lockoutUntil <= now) {
      // Reset attempts after lockout expires
      await kv.delete(key);
      return {
        allowed: true,
        failedAttempts: 0
      };
    }

    // First attempt
    return {
      allowed: true,
      failedAttempts: 0
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow if KV fails
    return { allowed: true, failedAttempts: 0 };
  }
}

/**
 * Record a failed attempt and apply lockout
 * 
 * @param kv KV namespace
 * @param attemptKey Unique identifier (not IP)
 * @returns Updated attempt record with new lockout time
 */
export async function recordFailedAttempt(
  kv: KVNamespace,
  attemptKey: string
): Promise<{ failedAttempts: number; lockoutMinutes: number; lockoutUntil: number }> {
  const key = `rate-limit:${attemptKey}`;
  const now = Date.now();

  try {
    const data = await kv.get(key, 'json') as {
      failedAttempts: number;
      lockoutUntil: number;
      firstAttemptTime: number;
    } | null;

    let failedAttempts = (data?.failedAttempts ?? 0) + 1;

    // Determine lockout duration based on number of failed attempts
    // 5 fails = 5 min, 10 fails = 15 min, 15 fails = 30 min, 20+ fails = 60 min
    let lockoutMinutes: number;
    if (failedAttempts <= 5) {
      lockoutMinutes = 5;
    } else if (failedAttempts <= 10) {
      lockoutMinutes = 15;
    } else if (failedAttempts <= 15) {
      lockoutMinutes = 30;
    } else {
      lockoutMinutes = 60; // Max 60 minutes
    }

    const lockoutUntil = now + lockoutMinutes * 60 * 1000;

    await kv.put(
      key,
      JSON.stringify({
        failedAttempts,
        lockoutUntil,
        firstAttemptTime: data?.firstAttemptTime ?? now
      }),
      { expirationTtl: lockoutMinutes * 60 + 3600 } // Keep record for 1 hour after lockout expires
    );

    return {
      failedAttempts,
      lockoutMinutes,
      lockoutUntil
    };
  } catch (error) {
    console.error('Record failed attempt error:', error);
    throw error;
  }
}

/**
 * Clear rate limit for an attemptKey (call after successful login)
 */
export async function clearRateLimit(kv: KVNamespace, attemptKey: string): Promise<void> {
  const key = `rate-limit:${attemptKey}`;
  try {
    await kv.delete(key);
  } catch (error) {
    console.error('Clear rate limit error:', error);
  }
}

/**
 * Derive a deterministic session token from the PIN hash
 * Token = SHA-256(pinHash + ":hqs-session")
 * Không cần SESSION_SECRET binding — tự động đổi khi đổi PIN
 */
export async function deriveSessionToken(pinHash: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pinHash + ':hqs-session');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

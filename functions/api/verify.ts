import { hashPin, constantTimeCompare, validatePin, checkRateLimitWithBackoff, recordFailedAttempt, clearRateLimit } from '../crypto-backend';

interface VerifyContext {
  request: Request;
  env: {
    DB: D1Database; // Thêm DB để ghi log
    ADMIN_PIN_HASH: string;
    RATE_LIMIT: KVNamespace;
  };
}

export async function onRequestPost(context: VerifyContext) {
  try {
    let body: any;
    try {
      body = await context.request.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid JSON' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { pin, attemptKey } = body;

    if (!attemptKey || typeof attemptKey !== 'string' || attemptKey.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Thiếu identifer phiên làm việc' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const clientIp = context.request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const ipKey = `ip:${clientIp}`;
    const sessionKey = `session:${attemptKey}`;

    const [ipLimit, sessionLimit] = await Promise.all([
      checkRateLimitWithBackoff(context.env.RATE_LIMIT, ipKey),
      checkRateLimitWithBackoff(context.env.RATE_LIMIT, sessionKey),
    ]);

    const blockedLimit = !ipLimit.allowed ? ipLimit : (!sessionLimit.allowed ? sessionLimit : null);
    if (blockedLimit) {
      return new Response(
        JSON.stringify({
          success: false,
          message: blockedLimit.message || `Bị khóa ${blockedLimit.lockoutMinutes} phút`,
          code: 'RATE_LIMITED',
          lockoutMinutes: blockedLimit.lockoutMinutes,
          failedAttempts: blockedLimit.failedAttempts
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validation = validatePin(pin);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ success: false, message: validation.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const hashedInput = await hashPin(pin);
    const isValid = constantTimeCompare(hashedInput, context.env.ADMIN_PIN_HASH);

    if (isValid) {
      // Clear rate limit
      await Promise.all([
        clearRateLimit(context.env.RATE_LIMIT, ipKey),
        clearRateLimit(context.env.RATE_LIMIT, sessionKey),
      ]);

      // Derive session token
      const tokenBuffer = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(context.env.ADMIN_PIN_HASH + ':hqs-session')
      );
      const sessionToken = Array.from(new Uint8Array(tokenBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Ghi log đăng nhập thành công
      try {
        await context.env.DB.prepare(
          'INSERT INTO audit_logs (id, action, details, timestamp) VALUES (?, ?, ?, ?)'
        ).bind(
          Math.random().toString(36).substring(2, 15),
          'LOGIN',
          `Đăng nhập thành công từ IP: ${clientIp}`,
          Date.now()
        ).run();
      } catch (logErr) {
        console.error('Failed to log login:', logErr);
      }

      return new Response(
        JSON.stringify({ success: true, message: 'PIN verified successfully', sessionToken }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      const attempts = await recordFailedAttempt(context.env.RATE_LIMIT, ipKey);
      await recordFailedAttempt(context.env.RATE_LIMIT, sessionKey);
      
      return new Response(
        JSON.stringify({ success: false, message: 'PIN không đúng', failedAttempts: attempts }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Verify error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

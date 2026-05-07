import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Coffee, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { checkAndPullFromCloud, storePinSecurely, storeSessionToken } from '../utils';
import { validatePin } from '../validationUtils';

interface LoginPageProps {
  onLogin: () => void;
}

/**
 * Generate or retrieve a unique device/session ID
 * This is used for rate limiting instead of IP address
 * Ensures we don't block the entire WiFi network by mistake
 */
function getOrCreateSessionId(): string {
  const STORAGE_KEY = 'hqs_session_id';
  let sessionId = localStorage.getItem(STORAGE_KEY);
  
  if (!sessionId) {
    // Generate a new session ID (8-char random string)
    sessionId = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY, sessionId);
  }
  
  return sessionId;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => getOrCreateSessionId());

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate PIN format
    const validation = validatePin(pin);
    if (!validation.valid) {
      setError(validation.errors[0]?.message || 'Mã PIN không hợp lệ');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          pin,
          attemptKey: sessionId // Send session ID for rate limiting instead of IP
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Hash PIN before storing
        const stored = await storePinSecurely(pin);
        if (!stored) {
          setError('Lỗi mã hóa PIN. Vui lòng thử lại.');
          setIsLoading(false);
          return;
        }
        
        // Lưu session token để dùng cho các request /api/data
        if (data.sessionToken) {
          storeSessionToken(data.sessionToken);
        }
        
        localStorage.setItem('hqs_is_logged_in', 'true');
        
        try {
          await checkAndPullFromCloud();
        } catch (syncErr) {
          console.error('Auto sync error:', syncErr);
          // Don't prevent login if sync fails
        }

        window.location.reload();
      } else {
        // Show detailed error messages based on response
        if (data.code === 'RATE_LIMITED') {
          setError(`Bị khóa ${data.lockoutMinutes} phút do nhập sai quá nhiều lần. Thử lại sau.`);
        } else if (data.failedAttempts) {
          setError(`${data.message} (Lần thử: ${data.failedAttempts})`);
        } else {
          setError(data.message || 'Mã PIN không chính xác!');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ!';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-surface rounded-3xl shadow-2xl border border-outline-variant overflow-hidden">
          <div className="bg-primary p-8 text-center space-y-4">
            <div className="w-20 h-20 bg-surface/20 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-md border border-white/30">
              <Coffee className="text-white" size={40} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{localStorage.getItem('hqs_shop_name') || 'Hoa Quả Sơn Coffee Manager'}</h1>
              <p className="text-secondary-container font-medium text-sm">Ứng dụng quản lý doanh thu quán cà phê</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-error-container text-error p-4 rounded-xl flex items-center gap-3 border border-error/20"
              >
                <AlertCircle size={20} />
                <span className="text-sm font-bold">{error}</span>
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest px-1">Mã PIN truy cập</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    required
                    maxLength={4}
                    inputMode="numeric"
                    placeholder="Nhập mã PIN..."
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container border border-outline-variant rounded-xl font-bold focus:ring-2 focus:ring-primary outline-none transition-all text-center tracking-[1em] text-xl"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-[10px] text-outline-variant px-1">Mã PIN gồm 4 chữ số</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || pin.length !== 4}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  Đăng nhập
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="text-center pt-4 border-t border-outline-variant">
              <p className="text-[10px] text-outline font-black uppercase tracking-tighter">
                42 Lý Tự Trọng - P.Tuy Hòa - Đắk Lắk
              </p>
            </div>
          </form>
        </div>

        <p className="text-center mt-8 text-on-surface-variant text-xs font-medium">
          Dữ liệu của bạn được lưu trữ an toàn ngay tại trình duyệt của bạn (Local Storage)
        </p>
      </motion.div>
    </div>
  );
};

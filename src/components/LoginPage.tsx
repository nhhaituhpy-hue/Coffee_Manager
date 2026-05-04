import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Coffee, ChevronRight, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network delay for feel
    setTimeout(() => {
      const storedCredentials = localStorage.getItem('hqs_admin_creds');
      const creds = storedCredentials ? JSON.parse(storedCredentials) : { user: 'admin', pass: 'admin' };

      if (username === creds.user && password === creds.pass) {
        localStorage.setItem('hqs_is_logged_in', 'true');
        onLogin();
      } else {
        setError('Tài khoản hoặc mật khẩu không chính xác!');
        setIsLoading(false);
      }
    }, 800);
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
                <label className="text-[10px] font-black text-outline uppercase tracking-widest px-1">Tài khoản quản trị</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Nhập username...(admin)"
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container border border-outline-variant rounded-xl font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest px-1">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Nhập password...(admin)"
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container border border-outline-variant rounded-xl font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              disabled={isLoading}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

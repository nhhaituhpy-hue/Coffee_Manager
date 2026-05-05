import React, { useState } from 'react';
import { X, FolderOpen, Save, Database, Download, CloudUpload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState('system');
  const [shopName, setShopName] = useState(() => {
    return localStorage.getItem('hqs_shop_name') || 'Hoa Quả Sơn Coffee Analytics';
  });
  const [shopLocation, setShopLocation] = useState(() => {
    return localStorage.getItem('hqs_shop_location') || 'Cơ sở: 42 Lý Tự Trọng - Tuy Hòa';
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('hqs_theme') || 'light';
  });

  // Account settings state
  const [accountTabState, setAccountTabState] = useState(() => {
    const stored = localStorage.getItem('hqs_admin_creds');
    return stored ? JSON.parse(stored) : { user: 'admin', pass: 'admin' };
  });
  const [newPass, setNewPass] = useState('');

  if (!isOpen) return null;

  const handleUpdateAccount = () => {
    if (!newPass) {
      alert('Vui lòng nhập mật khẩu mới');
      return;
    }
    const newCreds = { ...accountTabState, pass: newPass };
    localStorage.setItem('hqs_admin_creds', JSON.stringify(newCreds));
    setAccountTabState(newCreds);
    setNewPass('');
    alert('Đã cập nhật thông tin tài khoản thành công!');
  };

  const handleBackup = () => {
    const backupData: Record<string, string | null> = {};
    
    // Thu thập tất cả các key có tiền tố hqs_ trong localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('hqs_')) {
        backupData[key] = localStorage.getItem(key);
      }
    }
    
    // Tạo file tên theo ngày giờ
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `HQS_Backup_${timestamp}.json`;
    
    const dataBlob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const dataUrl = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(dataUrl);
    
    alert('Đã xuất file sao lưu thành công!');
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        let count = 0;
        
        // Duyệt qua tất cả các key trong file backup và khôi phục vào localStorage
        Object.keys(data).forEach(key => {
          if (key.startsWith('hqs_') && data[key] !== null) {
            localStorage.setItem(key, data[key]);
            count++;
          }
        });
        
        if (count > 0) {
          alert(`Khôi phục thành công ${count} mục dữ liệu! Ứng dụng sẽ tải lại.`);
          window.location.reload();
        } else {
          alert('File JSON không chứa dữ liệu hợp lệ (thiếu tiền tố hqs_).');
        }
      } catch (err) {
        alert('Lỗi khôi phục: File không hợp lệ hoặc bị hỏng.');
        console.error(err);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input để có thể chọn lại cùng 1 file nếu cần
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container">
            <div className="flex items-center gap-2">
              <Database className="text-primary" size={20} />
              <h3 className="text-lg font-black text-on-surface">Cài Đặt Hệ Thống</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex h-[400px]">
            {/* Sidebar Tab Labels */}
            <div className="w-48 bg-surface-container border-r border-outline-variant p-4 space-y-2">
              <button 
                onClick={() => setActiveSettingsTab('system')}
                className={`w-full text-left px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeSettingsTab === 'system' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
              >
                Hệ Thống
              </button>
              <button 
                onClick={() => setActiveSettingsTab('account')}
                className={`w-full text-left px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeSettingsTab === 'account' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
              >
                Tài Khoản
              </button>
              <button 
                onClick={() => setActiveSettingsTab('theme')}
                className={`w-full text-left px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeSettingsTab === 'theme' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
              >
                Giao Diện
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 space-y-8 overflow-y-auto">
              {activeSettingsTab === 'system' ? (
                <>
                  <section className="space-y-4">
                    <h4 className="text-xs font-black text-outline uppercase tracking-widest">Cấu hình quán</h4>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-surface-container border border-outline-variant rounded-xl space-y-3">
                        <label className="text-xs font-bold text-on-surface">Tên quán hiển thị</label>
                        <div className="flex gap-2 mb-4">
                          <input 
                            type="text" 
                            value={shopName} 
                            onChange={(e) => setShopName(e.target.value)}
                            placeholder="Ví dụ: Hoa Quả Sơn Coffee"
                            className="flex-1 bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm font-bold text-primary focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                        <label className="text-xs font-bold text-on-surface">Địa chỉ cơ sở hiển thị</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={shopLocation} 
                            onChange={(e) => setShopLocation(e.target.value)}
                            placeholder="Ví dụ: Cơ sở: 42 Lý Tự Trọng - Tuy Hòa"
                            className="flex-1 bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm font-bold text-primary focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-xs font-black text-outline uppercase tracking-widest">Thao tác dữ liệu</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={handleBackup}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-surface-container-high border border-outline-variant rounded-xl font-bold text-xs hover:bg-surface-container-highest transition-all">
                        <Download size={16} /> Xuất Backup
                      </button>
                      <label className="flex items-center justify-center gap-2 px-4 py-3 bg-surface-container-high border border-outline-variant rounded-xl font-bold text-xs hover:bg-surface-container-highest transition-all cursor-pointer">
                        <CloudUpload size={16} /> Restore Dữ Liệu
                        <input type="file" accept=".json" className="hidden" onChange={handleRestore} />
                      </label>
                    </div>
                  </section>
                </>
              ) : activeSettingsTab === 'account' ? (
                <section className="space-y-6">
                  <h4 className="text-xs font-black text-outline uppercase tracking-widest">Quản lý tài khoản quản trị</h4>
                  <div className="p-6 bg-surface-container border border-outline-variant rounded-2xl space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface">Tên đăng nhập (Username)</label>
                      <input 
                        type="text" 
                        value={accountTabState.user}
                        readOnly
                        className="w-full bg-surface-container-highest border border-outline-variant rounded-lg px-4 py-3 text-sm font-bold text-on-surface-variant outline-none"
                      />
                      <p className="text-[10px] text-outline italic">* Tên đăng nhập mặc định không thể thay đổi để bảo mật hệ thống.</p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-bold text-on-surface">Mật khẩu mới (Password)</label>
                      <input 
                        type="password" 
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="Nhập mật khẩu mới..."
                        className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm font-bold text-primary focus:ring-2 focus:ring-primary outline-none transition-all"
                      />
                    </div>

                    <button 
                      onClick={handleUpdateAccount}
                      className="w-full py-3 bg-secondary text-white rounded-xl font-black text-xs shadow-md hover:opacity-90 flex items-center justify-center gap-2 mt-4"
                    >
                      <Save size={16} />
                      Cập Nhật Mật Khẩu
                    </button>
                  </div>

                  <div className="p-4 bg-error-container/10 border border-error/10 rounded-xl">
                    <p className="text-xs text-error font-medium leading-relaxed">
                      Lưu ý: Mật khẩu này được lưu trực tiếp trên máy tính này. Nếu bạn quên mật khẩu, bạn cần xóa dữ liệu trình duyệt để khôi phục về mặc định (admin/admin).
                    </p>
                  </div>
                </section>
              ) : activeSettingsTab === 'theme' ? (
                <section className="space-y-6">
                  <h4 className="text-xs font-black text-outline uppercase tracking-widest">Tùy chỉnh giao diện</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setTheme('light')}
                      className={`p-4 border rounded-2xl flex flex-col items-center justify-center gap-3 transition-all ${theme === 'light' ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}
                    >
                      <div className="w-12 h-12 bg-surface rounded-full border border-outline-variant shadow-sm flex flex-col items-center justify-center">
                        <span className="text-xl">☀️</span>
                      </div>
                      <span className="font-bold text-sm">Light Mode</span>
                    </button>
                    <button 
                      onClick={() => setTheme('dark')}
                      className={`p-4 border rounded-2xl flex flex-col items-center justify-center gap-3 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}
                    >
                      <div className="w-12 h-12 bg-surface-container-highest rounded-full border border-slate-700 shadow-sm flex flex-col items-center justify-center">
                        <span className="text-xl">🌙</span>
                      </div>
                      <span className="font-bold text-sm">Dark Mode</span>
                    </button>
                  </div>
                </section>
              ) : null}
            </div>
          </div>

          <div className="px-6 py-6 border-t border-outline-variant bg-surface-container-high flex justify-end">
            <button 
              className="px-10 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 flex items-center gap-2"
              onClick={() => {
                localStorage.setItem('hqs_shop_name', shopName);
                localStorage.setItem('hqs_shop_location', shopLocation);
                localStorage.setItem('hqs_theme', theme);
                alert('Đã lưu cấu hình cài đặt!');
                onClose();
                window.location.reload();
              }}
            >
              <Save size={18} />
              Lưu Cài Đặt
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

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

  if (!isOpen) return null;

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    try {
      const backupData: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('hqs_')) {
          backupData[key] = localStorage.getItem(key);
        }
      }
      
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('hqs_admin_pin') || ''}`,
        },
        body: JSON.stringify(backupData),
      });

      if (response.ok) {
        alert('Đã đồng bộ dữ liệu lên Cloud thành công!');
      } else {
        alert('Có lỗi xảy ra khi đồng bộ lên Cloud.');
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi kết nối đến Cloud.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncFromCloud = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/data', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hqs_admin_pin') || ''}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        let count = 0;
        
        Object.keys(data).forEach(key => {
          if (key.startsWith('hqs_') && data[key] !== null) {
            localStorage.setItem(key, data[key]);
            count++;
          }
        });
        
        if (count > 0) {
          alert(`Tải thành công ${count} mục dữ liệu từ Cloud! Ứng dụng sẽ tải lại.`);
          window.location.reload();
        } else {
          alert('Không có dữ liệu trên Cloud hoặc dữ liệu trống.');
        }
      } else {
        alert('Có lỗi xảy ra khi tải dữ liệu từ Cloud.');
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi kết nối đến Cloud.');
    } finally {
      setIsSyncing(false);
    }
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
                        onClick={handleSyncToCloud}
                        disabled={isSyncing}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white border border-outline-variant rounded-xl font-bold text-xs hover:opacity-90 transition-all disabled:opacity-50">
                        <CloudUpload size={16} /> Đồng bộ lên Cloud
                      </button>
                      <button
                        onClick={handleSyncFromCloud}
                        disabled={isSyncing}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-surface-container-high border border-outline-variant rounded-xl font-bold text-xs hover:bg-surface-container-highest transition-all disabled:opacity-50">
                        <Download size={16} /> Tải từ Cloud
                      </button>
                    </div>
                  </section>
                </>
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

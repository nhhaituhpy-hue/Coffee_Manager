import React, { useState, useEffect } from 'react';
import { X, Save, Database, Loader2 } from 'lucide-react';
import { saveCloudData, fetchCloudData } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState('system');
  const [shopName, setShopName] = useState('Hoa Quả Sơn Coffee Analytics');
  const [shopLocation, setShopLocation] = useState('Cơ sở: 42 Lý Tự Trọng - Tuy Hòa');
  const [theme, setTheme] = useState('light');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const data = await fetchCloudData();
      if (data) {
        if (data.hqs_shop_name) setShopName(data.hqs_shop_name);
        if (data.hqs_shop_location) setShopLocation(data.hqs_shop_location);
        if (data.hqs_theme) setTheme(data.hqs_theme);
      }
    }
    if (isOpen) loadSettings();
  }, [isOpen]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await saveCloudData({
        hqs_shop_name: shopName,
        hqs_shop_location: shopLocation,
        hqs_theme: theme
      });
      
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      onClose();
    } catch (error) {
      console.error('Failed to save settings', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
        <motion.div 
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface w-full h-full md:h-auto md:max-w-2xl rounded-none md:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
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

          <div className="flex flex-col md:flex-row flex-1 min-h-0 md:h-[400px]">
            <div className="md:w-48 bg-surface-container border-b md:border-b-0 md:border-r border-outline-variant p-2 md:p-4 flex md:flex-col gap-2">
              <button 
                onClick={() => setActiveSettingsTab('system')}
                className={`flex-1 md:flex-none md:w-full text-center md:text-left px-3 md:px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeSettingsTab === 'system' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
              >
                Hệ Thống
              </button>
              <button 
                onClick={() => setActiveSettingsTab('theme')}
                className={`flex-1 md:flex-none md:w-full text-center md:text-left px-3 md:px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeSettingsTab === 'theme' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
              >
                Giao Diện
              </button>
            </div>

            <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
              {activeSettingsTab === 'system' ? (
                <section className="space-y-4">
                  <h4 className="text-xs font-black text-outline uppercase tracking-widest">Cấu hình quán</h4>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline">Tên quán</label>
                      <input 
                        type="text" 
                        value={shopName} 
                        onChange={(e) => setShopName(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline">Địa chỉ</label>
                      <input 
                        type="text" 
                        value={shopLocation} 
                        onChange={(e) => setShopLocation(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 font-bold"
                      />
                    </div>
                  </div>
                </section>
              ) : (
                <section className="space-y-4">
                  <h4 className="text-xs font-black text-outline uppercase tracking-widest">Chủ đề</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setTheme('light')} className={`p-4 rounded-xl border-2 font-bold ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-outline-variant'}`}>Sáng</button>
                    <button onClick={() => setTheme('dark')} className={`p-4 rounded-xl border-2 font-bold ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-outline-variant'}`}>Tối</button>
                  </div>
                </section>
              )}
            </div>
          </div>

          <div className="px-6 py-4 bg-surface-container border-t border-outline-variant flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2 font-bold text-outline">Hủy</button>
            <button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="px-8 py-2 bg-primary text-white rounded-lg font-bold flex items-center gap-2"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              Lưu thay đổi
            </button>
          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

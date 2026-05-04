import React from 'react';
import { X, Info, Phone, Mail, User, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-surface rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
        >
          <div className="flex justify-between items-center p-6 border-b border-outline-variant bg-surface-container/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                <Info size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-on-surface">Thông tin ứng dụng</h2>
                <p className="text-xs font-medium text-tertiary">Version 1.0.1</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-outline hover:text-on-surface hover:bg-surface-container-highest/50 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex justify-center items-center w-20 h-20 bg-primary/10 rounded-full mb-4">
                <Coffee size={40} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-1">Ứng dụng quản lý thu chi<br/>quán cà phê</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container border border-outline-variant/30">
                <div className="p-2 bg-surface rounded-lg shadow-sm border border-outline-variant/50">
                  <User size={18} className="text-secondary" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-outline tracking-wider mb-0.5">Tác giả</p>
                  <p className="font-bold text-sm">Nguyễn Hoàng Hải</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container border border-outline-variant/30">
                <div className="p-2 bg-surface rounded-lg shadow-sm border border-outline-variant/50">
                  <Phone size={18} className="text-secondary" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-outline tracking-wider mb-0.5">Số điện thoại</p>
                  <p className="font-bold text-sm">0973308684</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container border border-outline-variant/30">
                <div className="p-2 bg-surface rounded-lg shadow-sm border border-outline-variant/50">
                  <Mail size={18} className="text-secondary" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-outline tracking-wider mb-0.5">Email</p>
                  <p className="font-bold text-sm">nhhai.tuhpy@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-outline-variant bg-surface-container/50 flex justify-end">
             <button
               onClick={onClose}
               className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors pointer-cursor"
             >
               Đóng
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

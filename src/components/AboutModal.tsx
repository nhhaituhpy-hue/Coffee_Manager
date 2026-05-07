import React from 'react';
import { X, Info, Phone, Mail, User, Coffee, History, Clock, FileEdit, LogIn, Trash2, Settings, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuditLog } from '../types';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs?: AuditLog[];
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, logs = [] }) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN': return <LogIn size={14} className="text-blue-500" />;
      case 'UPDATE_ENTRY': return <FileEdit size={14} className="text-emerald-500" />;
      case 'UPDATE_FIXED': return <Settings size={14} className="text-orange-500" />;
      case 'UPDATE_SAVING': return <Wallet size={14} className="text-purple-500" />;
      case 'DELETE': return <Trash2 size={14} className="text-red-500" />;
      default: return <Clock size={14} className="text-outline" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'LOGIN': return 'Đăng nhập';
      case 'UPDATE_ENTRY': return 'Sửa doanh thu';
      case 'UPDATE_FIXED': return 'Sửa CP cố định';
      case 'UPDATE_SAVING': return 'Sửa quỹ';
      case 'DELETE': return 'Xóa dữ liệu';
      case 'UPDATE_SETTING': return 'Cài đặt';
      default: return action;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-surface rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="flex justify-between items-center p-6 border-b border-outline-variant bg-surface-container/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                <Info size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-on-surface">Thông tin ứng dụng</h2>
                <p className="text-xs font-medium text-tertiary">Version 1.1.0 (Audit Enabled)</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-outline hover:text-on-surface hover:bg-surface-container-highest/50 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
            {/* Tác giả Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="text-center md:text-left">
                <div className="inline-flex justify-center items-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Coffee size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-1">HQSCoffee Manager</h3>
                <p className="text-sm text-outline font-medium">Hệ thống quản lý tài chính thông minh</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container border border-outline-variant/30">
                  <User size={16} className="text-secondary" />
                  <span className="text-sm font-bold">Nguyễn Hoàng Hải</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container border border-outline-variant/30">
                  <Phone size={16} className="text-secondary" />
                  <span className="text-sm font-bold">0973308684</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container border border-outline-variant/30">
                  <Mail size={16} className="text-secondary" />
                  <span className="text-sm font-bold">nhhai.tuhpy@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Audit Log Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <History size={18} />
                <h4 className="text-sm font-black uppercase tracking-widest">Lịch sử thao tác gần đây</h4>
              </div>

              <div className="bg-surface-container rounded-2xl border border-outline-variant overflow-hidden shadow-inner">
                <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-surface-container-high z-10">
                      <tr className="text-[10px] font-black text-outline uppercase tracking-widest border-b border-outline-variant">
                        <th className="px-4 py-3">Thời gian</th>
                        <th className="px-4 py-3">Hành động</th>
                        <th className="px-4 py-3">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/50">
                      {logs.length > 0 ? (
                        logs.map((log, i) => (
                          <tr key={i} className="hover:bg-surface-container-highest/30 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-on-surface">
                                  {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-[10px] text-outline">
                                  {new Date(log.timestamp).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {getActionIcon(log.action)}
                                <span className="text-xs font-bold whitespace-nowrap">{getActionLabel(log.action)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-xs text-on-surface-variant italic leading-relaxed">{log.details}</p>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-10 text-center text-xs text-outline italic">Chưa có dữ liệu lịch sử</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-outline-variant bg-surface-container/50 flex justify-end flex-shrink-0">
             <button
               onClick={onClose}
               className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95"
             >
               Đóng
             </button>
          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

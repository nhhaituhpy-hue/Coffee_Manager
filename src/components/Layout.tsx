import React, { useState } from 'react';
import {
  LayoutDashboard,
  Edit3,
  TableProperties,
  Receipt,
  PiggyBank,
  BarChart3,
  Plus,
  HelpCircle,
  LogOut,
  Settings,
  ChevronRight,
  Calendar,
  X,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onSettingsClick: () => void;
  onAboutClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, onSettingsClick, onAboutClick }) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const menuItems = [
    { id: 'daily-entry', label: 'Nhập liệu hàng ngày', icon: Edit3 },
    { id: 'ledger', label: 'Sổ doanh thu', icon: TableProperties },
    { id: 'fixed-expenses', label: 'Chi phí cố định', icon: Receipt },
    { id: 'savings', label: 'Quỹ tiết kiệm', icon: PiggyBank },
  ];

  return (
    <aside className="h-full w-64 bg-surface-container border-r border-outline-variant flex flex-col z-40">
      <div className="p-6 mb-4">
        <h1 className="text-xl font-black text-primary leading-tight">
          {localStorage.getItem('hqs_shop_name') || 'Hoa Quả Sơn Coffee'}
        </h1>
        <p className="text-xs text-on-surface-variant mt-4 mb-2 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          {localStorage.getItem('hqs_shop_location') || '42 Lý Tự Trọng - Tuy Hòa'}
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                ? 'bg-primary/10 text-primary border-r-4 border-primary rounded-r-none'
                : 'text-on-surface-variant hover:bg-surface-container-highest/50'
                }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 space-y-4">
        <div className="pt-4 border-t border-outline-variant space-y-1">
          <button
            onClick={onAboutClick}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-surface-container-highest/50 rounded-lg text-on-surface-variant text-sm font-medium transition-colors"
          >
            <HelpCircle size={18} />
            <span>Thông tin ứng dụng</span>
          </button>
          <button
            onClick={onSettingsClick}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-surface-container-highest/50 rounded-lg text-on-surface-variant text-sm font-medium transition-colors"
          >
            <Settings size={18} />
            <span>Cài Đặt</span>
          </button>
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-error/10 text-error rounded-lg text-sm font-bold transition-colors"
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isLogoutModalOpen && (
          <div 
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsLogoutModalOpen(false)}
          >
            <motion.div 
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-surface w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden p-6 text-center"
            >
              <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">Xác nhận đăng xuất</h3>
              <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
                Bạn có chắc chắn muốn thoát khỏi hệ thống quản lý? Các dữ liệu chưa được lưu có thể bị mất.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 py-3 bg-surface-container hover:bg-surface-container-highest text-on-surface-variant font-bold rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={onLogout}
                  className="flex-1 py-3 bg-error/10 text-primary font-bold rounded-xl border border-error/20 hover:bg-error/20 transition-all"
                >
                  Đăng xuất
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </aside>
  );
};

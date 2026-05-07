import React, { useState } from 'react';
import {
  Edit3,
  TableProperties,
  Receipt,
  PiggyBank,
  Settings,
  HelpCircle,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MobileHeaderProps {
  shopName: string;
  shopLocation: string;
  onSettingsClick: () => void;
  onAboutClick: () => void;
  onLogout: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  shopName, 
  shopLocation, 
  onSettingsClick, 
  onAboutClick, 
  onLogout 
}) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface-container border-b border-outline-variant" style={{ paddingTop: 'var(--safe-area-top)' }}>
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-black text-primary truncate leading-tight">
              {shopName}
            </h1>
            <p className="text-[10px] text-on-surface-variant truncate flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-secondary flex-shrink-0"></span>
              {shopLocation}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={onAboutClick}
              className="p-2.5 hover:bg-surface-container-highest/50 rounded-lg text-on-surface-variant transition-colors mobile-touch-target flex items-center justify-center"
            >
              <HelpCircle size={20} />
            </button>
            <button
              onClick={onSettingsClick}
              className="p-2.5 hover:bg-surface-container-highest/50 rounded-lg text-on-surface-variant transition-colors mobile-touch-target flex items-center justify-center"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="p-2.5 hover:bg-error/10 rounded-lg text-error transition-colors mobile-touch-target flex items-center justify-center"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
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
                Bạn có chắc chắn muốn thoát khỏi hệ thống quản lý?
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
    </>
  );
};

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'daily-entry', label: 'Nhập liệu', icon: Edit3 },
    { id: 'ledger', label: 'Sổ thu', icon: TableProperties },
    { id: 'fixed-expenses', label: 'Chi phí', icon: Receipt },
    { id: 'savings', label: 'Quỹ', icon: PiggyBank },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container border-t border-outline-variant pb-safe">
      <div className="flex items-stretch h-16">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all relative mobile-touch-target ${
                isActive
                  ? 'text-primary'
                  : 'text-on-surface-variant'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-1/4 right-1/4 h-[3px] bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] leading-tight ${isActive ? 'font-black' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

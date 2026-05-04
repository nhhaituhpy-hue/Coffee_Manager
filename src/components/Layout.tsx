import React from 'react';
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
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onSettingsClick: () => void;
  onAboutClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, onSettingsClick, onAboutClick }) => {
  const menuItems = [
    { id: 'daily-entry', label: 'Nhập Liệu Hàng Ngày', icon: Edit3 },
    { id: 'ledger', label: 'Sổ Doanh Thu', icon: TableProperties },
    { id: 'fixed-expenses', label: 'Chi Phí Cố Định', icon: Receipt },
    { id: 'savings', label: 'Quỹ Tiết Kiệm', icon: PiggyBank },
  ];

  return (
    <aside className="h-full w-64 bg-surface-container border-r border-outline-variant flex flex-col z-40">
      <div className="p-6 mb-4">
        <h1 className="text-xl font-black text-primary leading-tight">
          {localStorage.getItem('hqs_shop_name') || 'Hoa Quả Sơn Coffee Analytics'}
        </h1>
        <p className="text-xs text-on-surface-variant mt-4 mb-2 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          {localStorage.getItem('hqs_shop_location') || 'Cơ sở: 42 Lý Tự Trọng - Tuy Hòa'}
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive 
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
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-error/10 text-error rounded-lg text-sm font-bold transition-colors"
          >
            <LogOut size={18} />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

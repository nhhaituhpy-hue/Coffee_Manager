import React, { useState } from 'react';
import { X, Save, Calendar, Coins, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, parseCurrency } from '../utils';

interface AddRevenueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddRevenueModal: React.FC<AddRevenueModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState('2023-10');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container">
            <h3 className="text-lg font-black text-on-surface">Thêm Doanh Thu Bất Thường</h3>
            <button onClick={onClose} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest px-1">Số tiền doanh thu</label>
              <div className="relative flex items-center">
                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                <input 
                  type="text" 
                  value={formatCurrency(amount)}
                  onChange={(e) => setAmount(parseCurrency(e.target.value))}
                  placeholder="Nhập số tiền..."
                  className="w-full pl-12 pr-12 py-4 bg-surface-container border border-outline-variant rounded-xl text-2xl font-black text-primary focus:ring-2 focus:ring-primary focus:bg-surface outline-none transition-all text-right"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-primary">đ</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest px-1">Thống kê vào tháng</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
                <input 
                  type="month" 
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-surface-container border border-outline-variant rounded-xl font-bold text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-xl flex gap-3 border border-primary/10">
              <Info className="text-primary shrink-0" size={20} />
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Doanh thu này sẽ được cộng trực tiếp vào tổng doanh thu của tháng được chọn mà không cần ghi nhận theo ngày cụ thể. Phù hợp cho các khoản thu ngoài, sự kiện hoặc điều chỉnh số dư.
              </p>
            </div>
          </div>

          <div className="px-6 py-6 bg-surface-container border-t border-outline-variant flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 font-bold text-on-surface-variant hover:bg-surface-container-highest rounded-xl transition-all"
            >
              Hủy Bỏ
            </button>
            <button 
              className="flex-3 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 flex items-center justify-center gap-2"
              onClick={() => {
                alert(`Đã ghi nhận ${amount}đ vào tháng ${month}`);
                onClose();
              }}
            >
              <Save size={18} />
              Ghi Nhận Doanh Thu
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

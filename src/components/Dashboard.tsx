import React from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowUp, CheckCircle, ChevronRight, BarChart, PencilLine } from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_DAILY_ENTRIES } from '../constants';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-outline-variant p-6 rounded-2xl shadow-sm border-l-4 border-l-secondary"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider">Tổng Doanh Thu</span>
            <TrendingUp className="text-secondary" />
          </div>
          <div className="text-4xl font-bold text-secondary font-financial">45.200.000đ</div>
          <div className="mt-2 flex items-center text-xs font-semibold text-secondary">
            <ArrowUp size={14} className="mr-1" />
            Tăng 12.5% so với tháng trước
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface border border-outline-variant p-6 rounded-2xl shadow-sm border-l-4 border-l-tertiary"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col">
              <span className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider">Tổng Chi Phí</span>
              <span className="text-[10px] text-tertiary font-bold leading-none mt-1">(Gồm CP cố định)</span>
            </div>
            <TrendingDown className="text-tertiary" />
          </div>
          <div className="text-4xl font-bold text-tertiary font-financial">28.150.000đ</div>
          <div className="mt-2 flex items-center text-xs font-semibold text-tertiary">
            <ArrowUp size={14} className="mr-1" />
            Tăng 4.2% so với tháng trước
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-primary text-white p-6 rounded-2xl shadow-md"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="opacity-80 text-sm font-semibold uppercase tracking-wider">Lợi Nhuận Ròng</span>
            <Wallet />
          </div>
          <div className="text-4xl font-bold font-financial">17.050.000đ</div>
          <div className="mt-2 flex items-center text-xs font-semibold">
            <CheckCircle size={14} className="mr-1" />
            Đạt 85% mục tiêu tháng
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart Placeholder */}
        <div className="lg:col-span-2 bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black">Xu Hướng Doanh Thu</h3>
            <div className="flex bg-surface-container-high p-1 rounded-lg">
              <button className="px-4 py-1.5 bg-surface shadow-sm rounded-md text-sm font-bold text-primary">Theo Tháng</button>
              <button className="px-4 py-1.5 text-sm font-bold text-on-surface-variant">Theo Tuần</button>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 px-2 relative">
             {/* Simple Bar Chart Visualization */}
             {[40, 55, 45, 70, 65, 85, 95, 80, 75, 60, 50, 45].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end items-center h-full group">
                   <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    className={`w-full rounded-t-lg transition-all ${i === 6 ? 'bg-primary' : 'bg-primary/20 group-hover:bg-primary/40'}`}
                   />
                </div>
             ))}
             <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <BarChart size={200} />
             </div>
          </div>
          <div className="flex justify-between mt-4 text-xs font-bold text-outline uppercase tracking-wider">
            <span>Ngày 01</span>
            <span>Ngày 15</span>
            <span>Ngày 30</span>
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-black mb-6">Cơ Cấu Chi Phí</h3>
          <div className="flex flex-col items-center">
            {/* Visual Pie Chart Mockup */}
            <div className="relative w-48 h-48 rounded-full border-[16px] border-slate-100 flex items-center justify-center mb-8">
              <div 
                className="absolute inset-0 rounded-full border-[16px] border-tertiary border-r-transparent border-b-transparent border-t-transparent -rotate-45"
                style={{ clipPath: 'polygon(50% 50%, 0 0, 100% 0, 100% 100%)' }}
              ></div>
              <div className="text-center">
                <span className="block text-xs font-semibold text-outline mb-1 uppercase">Tổng Cộng</span>
                <span className="block text-2xl font-bold">28.1Tr</span>
              </div>
            </div>
            
            <div className="w-full space-y-3">
              {[
                { label: 'Nguyên liệu', val: '45%', color: 'bg-primary' },
                { label: 'Nhân sự', val: '30%', color: 'bg-secondary' },
                { label: 'Mặt bằng/Điện nước', val: '15%', color: 'bg-tertiary' },
                { label: 'Chi phí khác', val: '10%', color: 'bg-slate-400' },
              ].map((cat) => (
                <div key={cat.label} className="flex justify-between items-center text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                    <span className="text-on-surface-variant font-bold">{cat.label}</span>
                  </div>
                  <span className="font-financial">{cat.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-surface border border-outline-variant shadow-sm rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
          <h3 className="text-xl font-black">Giao Dịch Gần Đây</h3>
          <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
            Xem Sổ Chi Tiết <ChevronRight size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant text-outline text-[11px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Ngày</th>
                <th className="px-6 py-4">Doanh Thu</th>
                <th className="px-6 py-4">Tổng Chi</th>
                <th className="px-6 py-4">Lợi Nhuận</th>
                <th className="px-6 py-4 text-center">Trạng Thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {MOCK_DAILY_ENTRIES.map((entry) => (
                <tr key={entry.id} className="hover:bg-surface-container transition-colors group">
                  <td className="px-6 py-4 text-sm font-semibold">{entry.date}</td>
                  <td className="px-6 py-4 text-sm font-bold text-secondary font-financial">+{entry.revenue.toLocaleString()}đ</td>
                  <td className="px-6 py-4 text-sm font-bold text-tertiary font-financial">-{entry.expenses.toLocaleString()}đ</td>
                  <td className="px-6 py-4 text-sm font-bold text-primary font-financial">{entry.profit.toLocaleString()}đ</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      entry.status === 'PAID' ? 'bg-secondary/10 text-secondary' : 
                      entry.status === 'PENDING' ? 'bg-primary/10 text-primary' : 'bg-tertiary/10 text-tertiary'
                    }`}>
                      {entry.status === 'PAID' ? 'Đã Chốt' : entry.status === 'PENDING' ? 'Tạm Tính' : 'Chờ Duyệt'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      className="p-1.5 text-outline hover:text-primary hover:bg-primary/5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Chỉnh sửa ngày: ${entry.date}`);
                      }}
                    >
                      <PencilLine size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

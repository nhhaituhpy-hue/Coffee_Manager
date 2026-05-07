import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../utils';
import { DailyEntry } from '../types';

interface EntryCardProps {
  entry: DailyEntry;
  onEdit: (dateStr: string) => void;
  onDelete: (id: string) => void;
  index: number;
}

/**
 * Mobile-optimized card view for ledger entries
 * Replaces table layout on small screens
 */
export const EntryCard: React.FC<EntryCardProps> = ({ entry, onEdit, onDelete, index }) => {
  const isPositiveProfit = entry.profit >= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-surface border border-outline-variant rounded-xl p-4 space-y-4 hover:shadow-lg transition-shadow"
    >
      {/* Header: Date and Status */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <p className="text-xs font-black text-outline uppercase tracking-widest">Ngày</p>
          <p className="text-lg font-bold text-on-surface">{entry.date}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          entry.status === 'PAID' ? 'bg-secondary/10 text-secondary' : 'bg-tertiary/10 text-tertiary'
        }`}>
          {entry.status === 'PAID' ? '✓ Đã chốt' : entry.status}
        </span>
      </div>

      {/* Financial Summary Grid: Revenue & Expenses */}
      <div className="grid grid-cols-2 gap-3">
        {/* Revenue */}
        <div className="bg-surface-container p-3 rounded-xl border border-outline-variant/10">
          <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1">
            Doanh thu
          </p>
          <p className="text-lg font-black text-primary font-financial">
            {formatCurrency(entry.revenue)}đ
          </p>
        </div>

        {/* Expenses */}
        <div className="bg-surface-container p-3 rounded-xl border border-outline-variant/10">
          <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1">
            Chi phí
          </p>
          <p className="text-lg font-black text-tertiary font-financial">
            {formatCurrency(entry.expenses)}đ
          </p>
        </div>
      </div>

      {/* Expense Breakdown (if available) */}
      {entry.details && entry.details.length > 0 && (
        <div className="bg-surface-container rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
          <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-2">
            Chi tiết ({entry.details.length})
          </p>
          <div className="space-y-1">
            {entry.details.slice(0, 3).map((detail, idx) => (
              <div key={idx} className="flex justify-between text-xs">
                <span className="text-on-surface-variant truncate">{detail.name || 'Chi phí'}</span>
                <span className="text-on-surface font-bold ml-2 flex-shrink-0">
                  {formatCurrency(detail.amount)} đ
                </span>
              </div>
            ))}
            {entry.details.length > 3 && (
              <p className="text-[10px] text-outline-variant italic pt-1">
                +{entry.details.length - 3} chi phí khác
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => onEdit(entry.date)}
          className="flex-1 py-2.5 min-h-[48px] bg-primary text-white rounded-lg font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Edit2 size={16} />
          Sửa
        </button>
        <button
          onClick={() => onDelete(entry.id)}
          className="flex-1 py-2.5 min-h-[48px] bg-error/10 text-error rounded-lg font-bold text-sm hover:bg-error/20 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Trash2 size={16} />
          Xóa
        </button>
      </div>
    </motion.div>
  );
};

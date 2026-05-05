import React, { useState } from 'react';
import { Save, Calendar, ChevronRight, Plus, Trash2, Check, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { DEFAULT_FIXED_EXPENSES } from '../constants';


export const FixedExpenses: React.FC = () => {
  const today = new Date();
  const currentMonthStr = (today.getMonth() + 1).toString().padStart(2, '0');
  const currentYearStr = today.getFullYear().toString();

  const defaultMonth = `Tháng ${currentMonthStr}, ${currentYearStr}`;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  const [allExpenses, setAllExpenses] = useState<Record<string, any[]>>(() => {
    try {
      const stored = localStorage.getItem('hqs_fixed_expenses');
      if (stored) return JSON.parse(stored);
    } catch { }
    return { [defaultMonth]: DEFAULT_FIXED_EXPENSES.map(e => ({ ...e })) };
  });

  const expenses = allExpenses[selectedMonth] || (selectedMonth === defaultMonth ? DEFAULT_FIXED_EXPENSES.map(e => ({ ...e })) : []);

  const setExpenses = (newExpenses: any[]) => {
    setAllExpenses(prev => ({ ...prev, [selectedMonth]: newExpenses }));
  };

  // Create last 6 months for dropdown fallback
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return `Tháng ${(d.getMonth() + 1).toString().padStart(2, '0')}, ${d.getFullYear()}`;
  });

  const allMonths = last6Months;

  const handleAmountChange = (id: string, value: string) => {
    const numericValue = parseInt(value.replace(/\D/g, ''), 10) || 0;
    setExpenses(expenses.map(exp => exp.id === id ? { ...exp, amount: numericValue } : exp));
  };

  const handleCategoryChange = (id: string, newCategory: string) => {
    setExpenses(expenses.map(exp => exp.id === id ? { ...exp, category: newCategory } : exp));
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const handleAddExpense = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setExpenses([...expenses, {
      id: newId,
      category: 'Chi phí mới',
      amount: 0,
    }]);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('hqs_fixed_expenses', JSON.stringify(allExpenses));
      setIsSaving(false);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 2000);
    }, 600);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Quản lý chi phí cố định</h2>
      </div>

      <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container flex justify-between items-center">
          <h3 className="text-xs font-bold text-on-surface-variant tracking-widest">Danh sách {selectedMonth}</h3>
          <div className="flex gap-2">
            <div className="flex items-center gap-3 border border-outline-variant px-4 py-2 rounded-lg bg-surface hover:bg-surface-container transition-colors cursor-pointer group relative">
              <Calendar size={14} className="text-primary" />
              <select
                className="bg-transparent border-none text-xs font-bold p-0 focus:ring-0 text-primary cursor-pointer outline-none appearance-none pr-5 z-10"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {allMonths.map(month => (
                  <option key={month}>{month}</option>
                ))}
              </select>
              <ChevronRight size={14} className="text-primary absolute right-3 rotate-90 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="divide-y divide-outline-variant">
          <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-surface-container text-[11px] font-bold text-outline tracking-widest">
            <div className="col-span-8">Loại chi phí</div>
            <div className="col-span-4 text-right">Số tiền</div>
          </div>

          {expenses.map((expense) => {
            return (
              <div key={expense.id} className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-blue-50/30 transition-colors group">
                <div className="col-span-8 flex items-center gap-4">
                  <input
                    type="text"
                    value={expense.category}
                    onChange={(e) => handleCategoryChange(expense.id, e.target.value)}
                    className="font-bold text-on-surface bg-transparent border-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all outline-none rounded-lg px-2 py-1 w-full placeholder:text-outline"
                    placeholder="Tên chi phí"
                  />
                </div>
                <div className="col-span-4 flex items-center gap-2">
                  <div className="relative group/input flex-1">
                    <input
                      type="text"
                      value={expense.amount.toLocaleString('vi-VN')}
                      onChange={(e) => handleAmountChange(expense.id, e.target.value)}
                      className="w-full text-right bg-surface-container border border-transparent rounded-lg px-4 py-3 font-financial font-bold focus:ring-2 focus:ring-primary focus:bg-surface focus:border-transparent group-hover/input:border-outline-variant transition-all outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-outline pointer-events-none hidden focus-within:block opacity-50">VND</span>
                  </div>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="p-2 text-error bg-error/5 hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Xóa chi phí"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-8 py-8 border-t border-outline-variant bg-surface-container flex justify-between items-center">
          <button
            onClick={handleAddExpense}
            className="px-6 py-4 bg-surface border-2 border-dashed border-outline-variant text-primary rounded-xl font-bold flex items-center gap-2 hover:border-primary hover:bg-primary/5 transition-all"
          >
            <Plus size={20} />
            Thêm chi phí
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-10 py-4 text-white rounded-xl font-bold flex items-center justify-center min-w-[200px] gap-3 shadow-lg transition-all relative overflow-hidden
                ${showStatus ? 'bg-secondary' : 'bg-primary hover:shadow-xl hover:opacity-90 active:translate-y-px'}
                ${isSaving ? 'opacity-80 cursor-wait' : ''}
              `}
          >
            <AnimatePresence mode="wait">
              {isSaving ? (
                <motion.div
                  key="saving"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="animate-spin" size={20} />
                  <span>Đang lưu...</span>
                </motion.div>
              ) : showStatus ? (
                <motion.div
                  key="saved"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Check size={20} />
                  <span>Đã lưu thành công</span>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Save size={20} />
                  <span>Lưu thay đổi</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </div>
  );
};

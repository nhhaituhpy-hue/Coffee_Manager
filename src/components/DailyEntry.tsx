import React, { useState, useEffect } from 'react';
import { Calendar, Save, Trash2, PlusCircle, Info, PencilLine, Check, Loader2, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, parseCurrency, autoFormatAmountOnBlur } from '../utils';
import { DEFAULT_EXPENSES } from '../constants';
import { DailyEntry as DailyEntryType, DailyEntryDetail } from '../types';

interface DailyEntryProps {
  entries: DailyEntryType[];
  onUpdateEntry: (entry: DailyEntryType) => void;
  dateToEdit?: string | null;
}

export const DailyEntry: React.FC<DailyEntryProps> = ({ entries, onUpdateEntry, dateToEdit }) => {
  const today = new Date();
  // Hàm chuyển đổi Date sang DD-MM-YYYY (để lưu trữ/tính toán)
  const getFormattedDate = (dateInfo: Date) => {
    const year = dateInfo.getFullYear();
    const month = (dateInfo.getMonth() + 1).toString().padStart(2, '0');
    const day = dateInfo.getDate().toString().padStart(2, '0');
    return `${day}-${month}-${year}`;
  };

  // Hàm chuyển đổi DD-MM-YYYY sang YYYY-MM-DD (để ô input date hiểu được)
  const toInputFormat = (ddmmyyyy: string) => {
    const parts = ddmmyyyy.split('-');
    if (parts.length === 3 && parts[0].length === 2) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return ddmmyyyy;
  };

  const [selectedDateStr, setSelectedDateStr] = useState(getFormattedDate(today));
  
  // Cập nhật ngày được chọn khi có yêu cầu chỉnh sửa từ Ledger
  useEffect(() => {
    if (dateToEdit) {
      setSelectedDateStr(dateToEdit);
    }
  }, [dateToEdit]);

  // Hàm lùi/tiến ngày
  const changeDate = (days: number) => {
    const parts = selectedDateStr.split('-');
    const current = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    const next = new Date(current.getTime() + days * 86400000);
    setSelectedDateStr(getFormattedDate(next));
  };

  const goToToday = () => {
    setSelectedDateStr(getFormattedDate(new Date()));
  };

  const entryDateStr = selectedDateStr; // Định dạng DD-MM-YYYY dùng để tìm kiếm trong DB

  // Chuỗi hiển thị tiêu đề DD/MM/YYYY
  const displayDateStr = selectedDateStr.replace(/-/g, '/');

  const existingEntry = entries.find(e => e.date === entryDateStr);

  const [revenue, setRevenue] = useState(existingEntry ? existingEntry.revenue.toString() : '');

  // Expenses state
  const [expensesList, setExpensesList] = useState<DailyEntryDetail[]>(() => {
    if (existingEntry?.details) return existingEntry.details;
    return DEFAULT_EXPENSES;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  // Sync state when entries refresh
  useEffect(() => {
    if (existingEntry) {
      setRevenue(existingEntry.revenue.toString());
      if (existingEntry.details) {
        setExpensesList(existingEntry.details);
      }
    } else {
      setRevenue('');
      setExpensesList(DEFAULT_EXPENSES);
    }
  }, [existingEntry]);

  const totalExpenses = expensesList.reduce((sum, item) => sum + (parseInt(item.amount.toString()) || 0), 0);
  const profit = (parseInt(revenue) || 0) - totalExpenses;

  const handleSaveData = () => {
    setIsSaving(true);

    // Minimal artificial delay for user feedback
    setTimeout(() => {
      const newEntry: DailyEntryType = {
        id: existingEntry?.id || Math.random().toString(36).substr(2, 9),
        date: entryDateStr,
        revenue: parseInt(revenue) || 0,
        expenses: totalExpenses,
        profit: profit,
        details: expensesList,
        status: 'PAID',
        _timestamp: Date.now()
      };
      
      onUpdateEntry(newEntry);
      setIsSaving(false);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 2000);
    }, 600);
  };

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseCurrency(e.target.value);
    setRevenue(rawValue);
  };

  const handleRevenueBlur = () => {
    setRevenue(autoFormatAmountOnBlur(revenue));
  };

  const handleExpenseChange = (id: number, field: string, value: string) => {
    setExpensesList(prev => prev.map(item => {
      if (item.id === id) {
        if (field === 'amount') {
          return { ...item, [field]: parseInt(parseCurrency(value)) || 0 };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleExpenseBlur = (id: number, value: number) => {
    setExpensesList(prev => prev.map(item => {
      if (item.id === id) {
        const formatted = parseInt(autoFormatAmountOnBlur(value)) || 0;
        return { ...item, amount: formatted };
      }
      return item;
    }));
  };

  const addExpense = () => {
    const newId = expensesList.length > 0 ? Math.max(...expensesList.map(item => item.id)) + 1 : 1;
    setExpensesList([...expensesList, { id: newId, name: '', amount: 0 }]);
  };

  const removeExpense = (id: number) => {
    setExpensesList(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center mb-4 md:mb-8 gap-4">
        <div className="flex-none">
          <h2 className="text-xl md:text-3xl font-bold">Nhập liệu hàng ngày</h2>
        </div>
        
        {/* Bộ điều hướng ngày mới - Tối ưu Mobile */}
        <div className="flex-1 flex flex-wrap items-center justify-center md:justify-start gap-2 w-full md:w-auto">
          <div className="flex items-center bg-surface border border-outline-variant rounded-xl p-1 shadow-sm flex-shrink-0">
            <button 
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-surface-container-highest rounded-lg text-primary transition-colors mobile-touch-target flex items-center justify-center"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button 
              onClick={goToToday}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedDateStr === getFormattedDate(today)
                  ? 'bg-primary text-white shadow-md'
                  : 'text-outline hover:text-primary'
              }`}
            >
              Hôm nay
            </button>

            <button 
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-surface-container-highest rounded-lg text-primary transition-colors mobile-touch-target flex items-center justify-center"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Lịch để chọn ngày bất kỳ */}
          <div className="relative">
            <input
              type="date"
              value={toInputFormat(selectedDateStr)}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  const parts = val.split('-');
                  setSelectedDateStr(`${parts[2]}-${parts[1]}-${parts[0]}`);
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full"
            />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
              selectedDateStr !== getFormattedDate(today) 
                ? 'bg-secondary/10 border-secondary text-secondary' 
                : 'bg-surface border-outline-variant text-primary'
            }`}>
              <CalendarDays size={18} />
              <span className="text-sm font-bold whitespace-nowrap">{displayDateStr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Section */}
      <div className="bg-surface border border-outline-variant border-l-[6px] border-l-secondary p-3 md:p-5 rounded-2xl shadow-sm relative group">
        <div className="flex justify-between items-start mb-2">
          <label className="block text-[10px] md:text-xs font-black text-outline uppercase tracking-widest">Tổng Doanh Thu Trong Ngày</label>
        </div>

        <div className="relative flex items-center justify-end">
          <input
            type="text"
            value={formatCurrency(revenue)}
            onChange={handleRevenueChange}
            onBlur={handleRevenueBlur}
            placeholder="0"
            className="w-full text-right text-2xl md:text-4xl font-black font-financial bg-transparent border-none focus:ring-0 transition-all py-2 pr-8 md:pr-12 text-secondary focus:text-primary outline-none focus:outline-none"
          />
          <span className="text-lg md:text-2xl font-black transition-colors text-secondary group-focus-within:text-primary">đ</span>
        </div>

        <div className="mt-2 flex items-center gap-2 text-outline text-[10px] italic justify-end">
          <Info size={10} className="flex-shrink-0" />
          <span className="hidden md:inline">Nhập doanh thu thực tế. Sau đó bấm "Chốt sổ & Lưu dữ liệu" đồng bộ sang Sổ doanh thu.</span>
          <span className="md:hidden">Nhập doanh thu → bấm "Chốt sổ" để lưu.</span>
        </div>
      </div>

      {/* Expense List Table */}
      <div className="bg-surface border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-surface-container px-4 md:px-8 py-3 md:py-4 border-b border-outline-variant flex justify-between items-center">
          <span className="text-[10px] md:text-xs font-black text-on-surface-variant uppercase tracking-widest">Danh sách chi phí</span>
          <span className="bg-surface-container-highest text-[10px] font-black px-2 py-0.5 rounded text-on-surface-variant">Danh mục: {expensesList.length.toString().padStart(2, '0')}</span>
        </div>
        <div className="overflow-x-auto max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-surface-container z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
              <tr className="text-left text-[11px] font-bold text-outline uppercase tracking-widest border-b border-outline-variant">
                <th className="hidden md:table-cell px-8 py-4 w-16 text-center">#</th>
                <th className="px-3 md:px-8 py-3 md:py-4">Tên chi phí</th>
                <th className="px-3 md:px-8 py-3 md:py-4 w-32 md:w-64 text-right">Số tiền (đ)</th>
                <th className="px-2 md:px-8 py-3 md:py-4 w-10 md:w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-medium">
              {expensesList.map((item, index) => (
                <tr key={item.id} className="group hover:bg-surface-container transition-colors">
                  <td className="hidden md:table-cell px-8 py-6 text-center text-outline text-sm">{index + 1}</td>
                  <td className="px-3 md:px-8 py-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleExpenseChange(item.id, 'name', e.target.value)}
                      placeholder="Nhập tên chi phí..."
                      className="w-full bg-transparent border-none font-bold text-sm md:text-base text-on-surface focus:ring-1 focus:ring-primary rounded-lg py-2"
                    />
                  </td>
                  <td className="px-3 md:px-8 py-2">
                    <div className="flex items-center justify-end relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={item.amount === 0 ? '' : formatCurrency(item.amount)}
                        onChange={(e) => handleExpenseChange(item.id, 'amount', e.target.value)}
                        onBlur={() => handleExpenseBlur(item.id, item.amount)}
                        className="w-full bg-transparent border-none font-bold text-sm md:text-base text-right font-financial focus:ring-1 focus:ring-primary rounded-lg pr-4 py-2"
                      />
                      <span className="text-[10px] font-bold text-outline">đ</span>
                    </div>
                  </td>
                  <td className="px-2 md:px-8 py-2 text-center text-right">
                    <button
                      onClick={() => removeExpense(item.id)}
                      className="text-outline hover:text-tertiary transition-colors md:opacity-0 md:group-hover:opacity-100 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 md:p-4 bg-surface-container border-t border-outline-variant">
          <button
            onClick={addExpense}
            className="flex items-center justify-center gap-2 text-primary font-bold text-sm bg-surface border border-outline-variant px-4 md:px-6 py-2.5 rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm w-full md:w-auto"
          >
            <PlusCircle size={18} /> Thêm chi phí
          </button>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="flex flex-col space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-stretch">
          <div className="bg-surface-container-high p-4 md:p-8 rounded-2xl border border-outline-variant flex flex-col justify-center">
            <span className="text-[10px] md:text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-1 md:mb-2">Chi phí tạm tính</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-4xl font-black text-tertiary font-financial">{totalExpenses.toLocaleString()}</span>
              <span className="text-base md:text-xl font-bold text-tertiary">đ</span>
            </div>
          </div>
          <div className="bg-primary/5 p-4 md:p-8 rounded-2xl border border-primary/20 flex flex-col justify-center">
            <span className="text-[10px] md:text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-1 md:mb-2">Lợi nhuận tạm tính</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-4xl font-black text-primary font-financial">{profit.toLocaleString()}</span>
              <span className="text-base md:text-xl font-bold text-primary">đ</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 md:pt-4">
          <button
            onClick={handleSaveData}
            disabled={isSaving}
            className={`
              flex items-center justify-center gap-3 w-full md:w-auto px-6 md:px-10 py-3 md:py-4 rounded-xl font-black text-base md:text-lg shadow-lg overflow-hidden transition-all relative
              ${showStatus ? 'bg-secondary text-white' : 'bg-primary text-white hover:shadow-primary/20 hover:-translate-y-1 active:translate-y-0'}
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
                  <span>Đang đồng bộ...</span>
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
                  <span>Đã đồng bộ</span>
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
                  <span>Chốt sổ & Lưu dữ liệu</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Calendar, Save, Trash2, PlusCircle, Info, PencilLine, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, parseCurrency } from '../utils';

interface DailyEntryProps {
  entries: any[];
  onUpdateEntry: (entry: any) => void;
  dateToEdit?: string | null;
}

export const DailyEntry: React.FC<DailyEntryProps> = ({ entries, onUpdateEntry, dateToEdit }) => {
  const today = new Date();
  const getFormattedDate = (dateInfo: Date) => {
    return `${dateInfo.getFullYear()}-${(dateInfo.getMonth() + 1).toString().padStart(2, '0')}-${dateInfo.getDate().toString().padStart(2, '0')}`;
  };
  
  const [selectedDateStr, setSelectedDateStr] = useState(getFormattedDate(today));
  
  useEffect(() => {
    if (dateToEdit) {
      const d = new Date(dateToEdit);
      if (!isNaN(d.getTime())) {
        setSelectedDateStr(getFormattedDate(d));
      }
    }
  }, [dateToEdit]);
  
  const selectedDateObj = new Date(selectedDateStr);
  const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const entryDateStr = selectedDateObj.toLocaleDateString('en-US', formatOptions); // Match format in MOCK_DAILY_ENTRIES

  const displayDateStr = `${selectedDateObj.getDate().toString().padStart(2, '0')}/${(selectedDateObj.getMonth() + 1).toString().padStart(2, '0')}/${selectedDateObj.getFullYear()}`;
  
  const existingEntry = entries.find(e => e.date === entryDateStr);

  const [revenue, setRevenue] = useState(existingEntry?.revenue.toString() || '0');
  
  // Expenses state
  const [expensesList, setExpensesList] = useState(() => {
    if (existingEntry?.details) return existingEntry.details;
    return [
      { id: 1, name: 'Đá bi', amount: '45000' },
      { id: 2, name: 'Sữa đặc', amount: '120000' }
    ];
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
      setRevenue('0');
      setExpensesList([]);
    }
  }, [existingEntry]);

  const totalExpenses = expensesList.reduce((sum, item) => sum + (parseInt(item.amount) || 0), 0);
  const profit = (parseInt(revenue) || 0) - totalExpenses;

  const handleSaveData = () => {
    setIsSaving(true);
    
    // Minimal artificial delay for user feedback
    setTimeout(() => {
      onUpdateEntry({
        id: existingEntry?.id || Math.random().toString(36).substr(2, 9),
        date: entryDateStr,
        revenue: parseInt(revenue) || 0,
        expenses: totalExpenses,
        profit: profit,
        details: expensesList,
        status: 'PAID'
      });
      setIsSaving(false);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 2000);
    }, 600);
  };

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseCurrency(e.target.value);
    setRevenue(rawValue);
  };

  const handleExpenseChange = (id: number, field: string, value: string) => {
    setExpensesList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: field === 'amount' ? parseCurrency(value) : value };
      }
      return item;
    }));
  };

  const addExpense = () => {
    const newId = expensesList.length > 0 ? Math.max(...expensesList.map(item => item.id)) + 1 : 1;
    setExpensesList([...expensesList, { id: newId, name: '', amount: '0' }]);
  };

  const removeExpense = (id: number) => {
    setExpensesList(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center mb-8 gap-4">
        <div className="flex-none">
          <h2 className="text-3xl font-bold">Nhập Liệu Hàng Ngày</h2>
        </div>
        <div className="flex-1 flex justify-center w-full md:w-auto">
          <div className="relative bg-surface border border-outline-variant px-4 py-2.5 rounded-xl shadow-sm hover:bg-surface-container transition-colors flex items-center justify-center group overflow-hidden">
            <input 
              type="date"
              value={selectedDateStr}
              onChange={(e) => setSelectedDateStr(e.target.value)}
              className="w-full h-full font-bold text-sm text-primary group-hover:text-tertiary transition-colors bg-transparent border-none focus:ring-0 cursor-pointer outline-none"
            />
          </div>
        </div>
      </div>

      {/* Revenue Section */}
      <div className="bg-surface border border-outline-variant border-l-[6px] border-l-secondary p-5 rounded-2xl shadow-sm relative group">
        <div className="flex justify-between items-start mb-2">
          <label className="block text-xs font-black text-outline uppercase tracking-widest">Tổng Doanh Thu Trong Ngày</label>
        </div>
        
        <div className="relative flex items-center justify-end">
          <input 
            type="text" 
            value={formatCurrency(revenue)}
            onChange={handleRevenueChange}
            placeholder="0" 
            className="w-full text-right text-4xl font-black font-financial bg-transparent border-none focus:ring-0 transition-all py-2 pr-12 text-secondary focus:text-primary outline-none focus:outline-none"
          />
          <span className="text-2xl font-black transition-colors text-secondary group-focus-within:text-primary">đ</span>
        </div>
        
        <div className="mt-2 flex items-center gap-2 text-outline text-[10px] italic justify-end">
          <Info size={10} />
          <span>Nhập doanh thu thực tế. Sau đó bấm "Chốt Sổ & Lưu Dữ Liệu" đồng bộ sang Sổ Doanh Thu.</span>
        </div>
      </div>

      {/* Expense List Table */}
      <div className="bg-surface border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-surface-container px-8 py-4 border-b border-outline-variant flex justify-between items-center">
          <span className="text-xs font-black text-on-surface-variant uppercase tracking-widest">Danh Sách Chi Phí</span>
          <span className="bg-surface-container-highest text-[10px] font-black px-2 py-0.5 rounded text-on-surface-variant">BẢN GHI: {expensesList.length.toString().padStart(2, '0')}</span>
        </div>
        <div className="overflow-x-auto max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-surface-container z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
              <tr className="text-left text-[11px] font-bold text-outline uppercase tracking-widest border-b border-outline-variant">
                <th className="px-8 py-4 w-16 text-center">#</th>
                <th className="px-8 py-4">Tên chi phí</th>
                <th className="px-8 py-4 w-64 text-right">Số tiền (đ)</th>
                <th className="px-8 py-4 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-medium">
              {expensesList.map((item, index) => (
                <tr key={item.id} className="group hover:bg-surface-container transition-colors">
                  <td className="px-8 py-6 text-center text-outline text-sm">{index + 1}</td>
                  <td className="px-8 py-2">
                    <input 
                      type="text" 
                      value={item.name} 
                      onChange={(e) => handleExpenseChange(item.id, 'name', e.target.value)}
                      placeholder="Nhập tên chi phí..."
                      className="w-full bg-transparent border-none font-bold text-on-surface focus:ring-1 focus:ring-primary rounded-lg" 
                    />
                  </td>
                  <td className="px-8 py-2">
                    <div className="flex items-center justify-end relative">
                      <input 
                        type="text" 
                        value={formatCurrency(item.amount)} 
                        onChange={(e) => handleExpenseChange(item.id, 'amount', e.target.value)}
                        className="w-full bg-transparent border-none font-bold text-right font-financial focus:ring-1 focus:ring-primary rounded-lg pr-4" 
                      />
                      <span className="text-[10px] font-bold text-outline">đ</span>
                    </div>
                  </td>
                  <td className="px-8 py-2 text-center text-right">
                    <button 
                      onClick={() => removeExpense(item.id)}
                      className="text-outline hover:text-tertiary transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-surface-container border-t border-outline-variant">
           <button 
             onClick={addExpense}
             className="flex items-center gap-2 text-primary font-bold text-sm bg-surface border border-outline-variant px-6 py-2.5 rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm"
           >
             <PlusCircle size={18} /> Thêm chi phí
           </button>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="flex flex-col space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <div className="bg-surface-container-high p-8 rounded-2xl border border-outline-variant flex flex-col justify-center">
             <span className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Tổng Chi Phí (Tạm tính)</span>
             <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-tertiary font-financial">{totalExpenses.toLocaleString()}</span>
                <span className="text-xl font-bold text-tertiary">đ</span>
             </div>
          </div>
          <div className="bg-primary/5 p-8 rounded-2xl border border-primary/20 flex flex-col justify-center">
             <span className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Lợi Nhuận Ước Tính</span>
             <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-primary font-financial">{profit.toLocaleString()}</span>
                <span className="text-xl font-bold text-primary">đ</span>
             </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSaveData}
            disabled={isSaving}
            className={`
              flex items-center gap-3 px-10 py-4 rounded-xl font-black text-lg shadow-lg overflow-hidden transition-all relative
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
                  <span>Đã Đồng Bộ Sổ</span>
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
                  <span>Chốt Sổ & Lưu Dữ Liệu</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </div>
  );
};

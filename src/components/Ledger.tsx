import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalendarDays, FileSpreadsheet, FileText, ChevronLeft, ChevronRight, TrendingUp, Wallet, Receipt, Trash2, X, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency, fetchCloudData, deleteCloudItem } from '../utils';
import { loadVietnameseFont, loadVietnameseFontBold } from '../utils/pdfFontLoader';
import { DEFAULT_FIXED_EXPENSES } from '../constants';
import { DailyEntry } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useResponsive } from '../responsiveUtils';
import { EntryCard } from './EntryCard';

interface LedgerProps {
  entries: DailyEntry[];
  setEntries: (entries: DailyEntry[]) => void;
  onEditDate: (dateStr: string) => void;
}

export const Ledger: React.FC<LedgerProps> = ({ entries, setEntries, onEditDate }) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { isMobile } = useResponsive();
  const [cloudFixedExpenses, setCloudFixedExpenses] = useState<Record<string, any[]>>({});
  const [cloudSavings, setCloudSavings] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const data = await fetchCloudData();
      if (data) {
        if (data.hqs_fixed_expenses) setCloudFixedExpenses(data.hqs_fixed_expenses);
        if (data.hqs_savings_transactions) setCloudSavings(data.hqs_savings_transactions);
      }
    }
    loadData();
  }, []);

  const handleDelete = async () => {
    if (deleteConfirmId) {
      setEntries(entries.filter(e => e.id !== deleteConfirmId));
      await deleteCloudItem('entry', deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const today = new Date();
  const currentMonthStr = (today.getMonth() + 1).toString().padStart(2, '0');
  const currentYearStr = today.getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState(`Tháng ${currentMonthStr}, ${currentYearStr}`);
  const [isExporting, setIsExporting] = useState(false);

  const availableMonths = entries.map(e => {
    const d = new Date(e.date);
    if (isNaN(d.getTime())) return null;
    return `Tháng ${(d.getMonth() + 1).toString().padStart(2, '0')}, ${d.getFullYear()}`;
  }).filter(Boolean) as string[];

  const last6Months = Array.from({ length: 12 }).map((_, i) => {
    let m = today.getMonth() - i;
    let y = today.getFullYear();
    while (m < 0) { m += 12; y -= 1; }
    return `Tháng ${(m + 1).toString().padStart(2, '0')}, ${y}`;
  });

  const monthOptionsSet = new Set([...last6Months, ...availableMonths]);
  const allMonths = Array.from(monthOptionsSet).sort((a, b) => {
    const matchA = a.match(/Tháng (\d{2}), (\d{4})/);
    const matchB = b.match(/Tháng (\d{2}), (\d{4})/);
    if (matchA && matchB) {
      if (matchA[2] !== matchB[2]) return parseInt(matchB[2]) - parseInt(matchA[2]);
      return parseInt(matchB[1]) - parseInt(matchA[1]);
    }
    return 0;
  });

  const validSelectedMonth = allMonths.includes(selectedMonth) ? selectedMonth : allMonths[0];
  const match = validSelectedMonth.match(/Tháng (\d{2}), (\d{4})/);

  // Hàm parse ngày an toàn cho cả DD-MM-YYYY và YYYY-MM-DD
  const parseDateToTime = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length === 2) {
      // DD-MM-YYYY -> YYYY-MM-DD
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  };

  const filteredEntries = match ? entries.filter(e => {
    const time = parseDateToTime(e.date);
    const d = new Date(time);
    return (d.getMonth() + 1) === parseInt(match[1]) && d.getFullYear() === parseInt(match[2]);
  }).sort((a, b) => parseDateToTime(a.date) - parseDateToTime(b.date)) : entries;

  const totalFixedExpenses = React.useMemo(() => {
    if (cloudFixedExpenses[validSelectedMonth]) {
      return cloudFixedExpenses[validSelectedMonth].reduce((sum: number, exp: any) => sum + (Number(exp.amount) || 0), 0);
    }
    return DEFAULT_FIXED_EXPENSES.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  }, [validSelectedMonth, cloudFixedExpenses]);

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      // Load font Be Vietnam Pro từ local assets (bundled bởi Vite)
      // Parallel load regular + bold để tối ưu thời gian
      const [fontBase64, fontBoldBase64] = await Promise.all([
        loadVietnameseFont(),
        loadVietnameseFontBold(),
      ]);

      const doc = new jsPDF();

      if (fontBase64) {
        doc.addFileToVFS('BeVietnamPro.ttf', fontBase64);
        doc.addFont('BeVietnamPro.ttf', 'BeVietnamPro', 'normal');
      }
      if (fontBoldBase64) {
        doc.addFileToVFS('BeVietnamPro-Bold.ttf', fontBoldBase64);
        doc.addFont('BeVietnamPro-Bold.ttf', 'BeVietnamPro', 'bold');
      }
      if (fontBase64 || fontBoldBase64) {
        doc.setFont('BeVietnamPro');
      } else {
        doc.setFont('helvetica');
      }

      const activeFont = fontBase64 ? 'BeVietnamPro' : 'helvetica';
      const tableStyles = { font: activeFont, fontSize: 10 } as any;
      const headStyles = { font: activeFont, fontStyle: 'normal' } as any;

      // Title
      doc.setFontSize(18);
      doc.text(`BÁO CÁO - ${validSelectedMonth.toUpperCase()}`, 105, 15, { align: 'center' });

      const totalRevenue = filteredEntries.reduce((sum, e) => sum + e.revenue, 0);
      const totalDailyExpenses = filteredEntries.reduce((sum, e) => sum + e.expenses, 0);
      const totalExp = totalDailyExpenses + totalFixedExpenses;
      const netProfit = totalRevenue - totalExp;

      // 1. Summary Table
      autoTable(doc, {
        startY: 25,
        head: [['Hạng mục', 'Giá trị (VND)']],
        body: [
          ['Tổng Doanh thu', totalRevenue.toLocaleString('vi-VN')],
          ['Tổng Chi phí (Hàng ngày + Cố định)', totalExp.toLocaleString('vi-VN')],
          ['Lợi nhuận', netProfit.toLocaleString('vi-VN')],
        ],
        theme: 'striped',
        headStyles: { fillColor: [26, 86, 219], ...headStyles },
        styles: tableStyles,
      });

      // 2. Dividend Table
      const finalYSummary = (doc as any).lastAutoTable.finalY;
      doc.setFontSize(12);
      doc.setFont(activeFont);
      doc.text('BẢNG CHIA CỔ TỨC', 14, finalYSummary + 10);

      autoTable(doc, {
        startY: finalYSummary + 15,
        head: [['Cổ đông', 'Tỉ lệ', 'Số tiền (VND)']],
        body: [
          ['Mẹ Ngọc', '50%', Math.floor(netProfit * 0.5).toLocaleString('vi-VN')],
          ['Dung Hải', '35%', Math.floor(netProfit * 0.35).toLocaleString('vi-VN')],
          ['Bố Song', '15%', Math.floor(netProfit * 0.15).toLocaleString('vi-VN')],
        ],
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], ...headStyles },
        styles: tableStyles,
      });

      // 3. Savings Fund Table
      const finalYDividends = (doc as any).lastAutoTable.finalY;
      doc.setFontSize(12);
      doc.setFont(activeFont);
      doc.text('QUỸ TIẾT KIỆM DỰ PHÒNG', 14, finalYDividends + 10);

      const currentBalance = cloudSavings.reduce((sum, tx) => sum + (tx.amount ?? 0), 0);
      const matchMonth = validSelectedMonth.match(/Tháng (\d{2}), (\d{4})/);
      const targetMonthYear = matchMonth ? `${matchMonth[1]}/${matchMonth[2]}` : '';
      const monthlySavings = cloudSavings.filter(tx => (tx.date ?? '').includes(targetMonthYear));
      const monthlyDeposit = monthlySavings.reduce((sum, tx) => sum + (tx.amount > 0 ? tx.amount : 0), 0);

      autoTable(doc, {
        startY: finalYDividends + 15,
        head: [['Hạng mục', 'Giá trị (VND)']],
        body: [
          ['Số dư quỹ hiện tại', currentBalance.toLocaleString('vi-VN')],
          [`Trích lập trong ${validSelectedMonth}`, monthlyDeposit.toLocaleString('vi-VN')],
        ],
        theme: 'grid',
        headStyles: { fillColor: [247, 194, 77], textColor: [139, 66, 66], ...headStyles },
        styles: tableStyles,
      });

      // 4. Savings History
      const finalYSavingsSummary = (doc as any).lastAutoTable.finalY;
      if (monthlySavings.length > 0) {
        doc.setFontSize(11);
        doc.setFont(activeFont);
        doc.text(`Lịch sử giao dịch quỹ - ${validSelectedMonth}`, 14, finalYSavingsSummary + 10);

        autoTable(doc, {
          startY: finalYSavingsSummary + 15,
          head: [['Ngày', 'Nội dung', 'Số tiền']],
          body: monthlySavings.map(tx => [
            tx.date ?? '',
            tx.description ?? '',
            (tx.amount ?? 0).toLocaleString('vi-VN'),
          ]),
          theme: 'striped',
          headStyles: { fillColor: [214, 151, 96], ...headStyles },
          styles: { ...tableStyles, fontSize: 9 },
        });
      }

      // 5. Daily Entries Table
      const lastY = (doc as any).lastAutoTable.finalY;
      let nextY = lastY + 15;
      if (nextY > 250) { doc.addPage(); nextY = 20; }

      doc.setFontSize(12);
      doc.setFont(activeFont);
      doc.text('BẢNG KÊ CHI TIẾT THEO NGÀY', 14, nextY - 5);

      autoTable(doc, {
        startY: nextY,
        head: [['Ngày', 'Doanh thu', 'Chi phí', 'Lợi nhuận']],
        body: filteredEntries.map(e => [
          e.date,
          e.revenue.toLocaleString('vi-VN'),
          e.expenses.toLocaleString('vi-VN'),
          e.profit.toLocaleString('vi-VN'),
        ]),
        theme: 'striped',
        headStyles: { fillColor: [75, 85, 99], ...headStyles },
        styles: { ...tableStyles, fontSize: 9 },
      });

      // 6. Fixed Expenses Table
      const finalYDaily = (doc as any).lastAutoTable.finalY;
      let nextYFixed = finalYDaily + 15;
      if (nextYFixed > 250) { doc.addPage(); nextYFixed = 20; }

      doc.setFontSize(12);
      doc.setFont(activeFont);
      doc.text('BẢNG KÊ CHI PHÍ CỐ ĐỊNH', 14, nextYFixed - 5);

      const currentFixed = cloudFixedExpenses[validSelectedMonth] || DEFAULT_FIXED_EXPENSES;
      autoTable(doc, {
        startY: nextYFixed,
        head: [['Nội dung chi phí', 'Số tiền (VND)']],
        body: currentFixed.map((exp: any) => [
          exp.category ?? '',
          (Number(exp.amount) || 0).toLocaleString('vi-VN'),
        ]),
        theme: 'grid',
        headStyles: { fillColor: [107, 114, 128], ...headStyles },
        styles: { ...tableStyles, fontSize: 9 },
      });

      doc.save(`Báo Cáo ${validSelectedMonth.replace(/, /g, '-')}.pdf`);
    } catch (e) {
      console.error('PDF Export Error:', e);
      alert(`Lỗi khi xuất PDF: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 overflow-y-auto custom-scrollbar pb-24 pr-1 overscroll-contain">
      {/* Top Section: Header, Month Selector, Summary, and Export Button */}
      <div className="flex-none space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
          <div className="flex-none">
            <h2 className="text-xl md:text-3xl font-bold">Sổ doanh thu & Báo cáo</h2>
            <p className="text-on-surface-variant text-[10px] md:text-sm mt-0.5">Dữ liệu được lưu trữ an toàn trên đám mây.</p>
          </div>
          <div className="flex-none">
            <div className="relative flex items-center gap-2 bg-surface border border-outline-variant px-4 py-2.5 rounded-xl shadow-sm hover:bg-surface-container transition-all cursor-pointer group">
              <CalendarDays size={18} className="text-primary" />
              <span className="text-sm font-black text-primary">{validSelectedMonth}</span>

              <select
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                value={validSelectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {allMonths.map(month => (
                  <option key={month} value={month} className="bg-surface text-on-surface">{month}</option>
                ))}
              </select>
            </div>
          </div>
          {!isMobile && (
            <button
              onClick={exportToPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm font-bold shadow-sm hover:bg-surface-container transition-all active:scale-95 disabled:opacity-50 ml-auto"
            >
              <FileText size={18} className="text-tertiary" />
              {isExporting ? 'Đang xuất...' : 'Xuất Báo cáo'}
            </button>
          )}
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-surface p-4 rounded-2xl border-l-4 border-secondary shadow-sm">
            <span className="text-[10px] font-black text-outline uppercase tracking-widest">Doanh thu {validSelectedMonth}</span>
            <p className="text-xl font-black font-financial">{filteredEntries.reduce((sum, entry) => sum + entry.revenue, 0).toLocaleString()}đ</p>
          </div>
          <div className="bg-surface p-4 rounded-2xl border-l-4 border-tertiary shadow-sm">
            <span className="text-[10px] font-black text-outline uppercase tracking-widest">Tổng chi {validSelectedMonth}</span>
            <p className="text-xl font-black font-financial">{(filteredEntries.reduce((sum, entry) => sum + entry.expenses, 0) + totalFixedExpenses).toLocaleString()}đ</p>
          </div>
          <div className="bg-primary text-white p-4 rounded-2xl shadow-lg">
            <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">Lợi nhuận ròng</span>
            <p className="text-xl font-black font-financial">{(filteredEntries.reduce((sum, entry) => sum + entry.revenue, 0) - (filteredEntries.reduce((sum, entry) => sum + entry.expenses, 0) + totalFixedExpenses)).toLocaleString()}đ</p>
          </div>
        </div>

        {/* PDF Export Button (Moved up for mobile) */}
        {isMobile && (
          <button
            onClick={exportToPDF}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <FileText size={18} className="text-tertiary" />
            {isExporting ? 'Đang xuất...' : 'Xuất Báo Cáo PDF'}
          </button>
        )}
      </div>

      {/* Bottom Section: Scrollable Entries List/Table */}
      <div className="flex-none bg-surface border border-outline-variant rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {isMobile ? (
          <div className="overflow-y-auto p-3 space-y-3 max-h-[320px] custom-scrollbar overscroll-contain">
            {filteredEntries.map((entry, idx) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={onEditDate}
                onDelete={(id) => setDeleteConfirmId(id)}
                index={idx}
              />
            ))}
            {filteredEntries.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-outline text-sm">Không có dữ liệu trong tháng này</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-auto custom-scrollbar max-h-[350px]">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 z-10 shadow-sm">
                <tr className="bg-surface-container border-b border-outline-variant text-[11px] font-black text-outline uppercase tracking-widest">
                  <th className="px-5 py-3">Ngày</th>
                  <th className="px-5 py-3 text-right">Tổng Doanh Thu</th>
                  <th className="px-5 py-3 text-right">Tổng Chi Phí</th>
                  <th className="px-5 py-3 text-right">Lợi Nhuận</th>
                  <th className="px-5 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} onClick={() => onEditDate(entry.date)} className="hover:bg-blue-50/30 transition-colors cursor-pointer group">
                    <td className="px-5 py-3 font-bold text-primary text-sm">{entry.date}</td>
                    <td className="px-5 py-3 text-right font-financial font-bold">{entry.revenue.toLocaleString()}đ</td>
                    <td className="px-5 py-3 text-right font-financial font-bold text-tertiary">-{entry.expenses.toLocaleString()}đ</td>
                    <td className="px-5 py-3 text-right font-financial font-black text-secondary">{entry.profit.toLocaleString()}đ</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        className="p-2 text-tertiary hover:bg-tertiary/10 rounded-lg"
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(entry.id); }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setDeleteConfirmId(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-outline-variant"
            >
              <div className="w-20 h-20 bg-tertiary/10 text-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-on-surface mb-2">Xác nhận xóa</h3>
              <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
                Dữ liệu của ngày này sẽ bị xóa vĩnh viễn khỏi hệ thống đám mây. Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-4 font-bold bg-surface-container hover:bg-surface-container-highest text-on-surface-variant rounded-2xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-4 font-bold bg-tertiary text-white rounded-2xl shadow-lg shadow-tertiary/20 hover:opacity-90 active:scale-95 transition-all"
                >
                  Xóa ngay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

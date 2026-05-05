import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalendarDays, FileSpreadsheet, FileText, ChevronLeft, ChevronRight, TrendingUp, Wallet, Receipt, Trash2, X, Loader2 } from 'lucide-react';
import { formatCurrency } from '../utils';
import { DEFAULT_FIXED_EXPENSES } from '../constants';

interface LedgerProps {
  entries: any[];
  setEntries: (entries: any) => void;
  onEditDate: (dateStr: string) => void;
}

export const Ledger: React.FC<LedgerProps> = ({ entries, setEntries, onEditDate }) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteConfirmId) {
      setEntries((prev: any[]) => prev.filter(e => e.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const today = new Date();
  const currentMonthStr = (today.getMonth() + 1).toString().padStart(2, '0');
  const currentYearStr = today.getFullYear().toString();
  const previousMonth = today.getMonth() === 0 ? 12 : today.getMonth();
  const previousMonthStr = previousMonth.toString().padStart(2, '0');
  const previousYearStr = today.getMonth() === 0 ? (today.getFullYear() - 1).toString() : today.getFullYear().toString();

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
    while (m < 0) {
      m += 12;
      y -= 1;
    }
    return `Tháng ${(m + 1).toString().padStart(2, '0')}, ${y}`;
  });

  // Combine and remove duplicates, then sort in descending order
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

  // Ensure selectedMonth is valid or fallback
  const validSelectedMonth = allMonths.includes(selectedMonth) ? selectedMonth : allMonths[0];

  const match = validSelectedMonth.match(/Tháng (\d{2}), (\d{4})/);
  const filteredEntries = match ? entries.filter(e => {
    const d = new Date(e.date);
    return (d.getMonth() + 1) === parseInt(match[1]) && d.getFullYear() === parseInt(match[2]);
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : entries;

  const totalFixedExpenses = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('hqs_fixed_expenses');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[validSelectedMonth]) {
          return parsed[validSelectedMonth].reduce((sum: number, exp: any) => sum + exp.amount, 0);
        }
      }
    } catch { }
    return DEFAULT_FIXED_EXPENSES.reduce((sum, exp) => sum + exp.amount, 0);
  }, [validSelectedMonth]);

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      let finalY = 0;

      try {
        const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf';
        const response = await fetch(fontUrl);
        const fontBuffer = await response.arrayBuffer();
        let binary = '';
        const bytes = new Uint8Array(fontBuffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64String = window.btoa(binary);
        doc.addFileToVFS('Roboto-Regular.ttf', base64String);
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

        const fontBoldUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf';
        const responseBold = await fetch(fontBoldUrl);
        const fontBufferBold = await responseBold.arrayBuffer();
        let binaryBold = '';
        const bytesBold = new Uint8Array(fontBufferBold);
        const lenBold = bytesBold.byteLength;
        for (let i = 0; i < lenBold; i++) {
          binaryBold += String.fromCharCode(bytesBold[i]);
        }
        const base64StringBold = window.btoa(binaryBold);
        doc.addFileToVFS('Roboto-Medium.ttf', base64StringBold);
        doc.addFont('Roboto-Medium.ttf', 'Roboto', 'bold');

        doc.setFont('Roboto');
      } catch (e) {
        console.error('Failed to load font', e);
      }

      // Add title
      doc.setFontSize(16);
      doc.setFont('Roboto', 'bold');
      doc.text('Sổ doanh thu & Báo cáo', 14, 15);

      // Add date range
      doc.setFontSize(10);
      doc.setFont('Roboto', 'normal');
      doc.setTextColor(100);
      doc.text(selectedMonth, 14, 22);

      const tableData = filteredEntries.map(entry => [
        entry.date,
        `${entry.revenue.toLocaleString()} VNĐ`,
        `-${entry.expenses.toLocaleString()} VNĐ`,
        `${entry.profit > 0 ? '+' : ''}${entry.profit.toLocaleString()} VNĐ`
      ]);


      autoTable(doc, {
        head: [['Ngày', 'Tổng doanh thu', 'Tổng chi phí', 'Lợi nhuận']],
        body: tableData,
        startY: 28,
        styles: { font: 'Roboto', fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [63, 114, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      finalY = (doc as any).lastAutoTable.finalY || 28;

      // Fixed Expenses
      doc.setFontSize(12);
      doc.setFont('Roboto', 'bold');
      doc.setTextColor(0);
      doc.text('Chi phí cố định', 14, finalY + 15);

      const fixedExpensesData = DEFAULT_FIXED_EXPENSES.map(exp => [
        exp.category,
        `${exp.amount.toLocaleString()} VNĐ`
      ]);

      autoTable(doc, {
        head: [['Loại chi phí', 'Số tiền']],
        body: fixedExpensesData,
        startY: finalY + 20,
        styles: { font: 'Roboto', fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [63, 114, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      finalY = (doc as any).lastAutoTable.finalY || finalY + 20;


      // Summary Table
      doc.setFontSize(12);
      doc.setFont('Roboto', 'bold');
      doc.setTextColor(0);
      doc.text('Bảng tổng kết', 14, finalY + 15);

      const totalRevenue = filteredEntries.reduce((sum, entry) => sum + entry.revenue, 0);
      const totalVariableExpenses = filteredEntries.reduce((sum, entry) => sum + entry.expenses, 0);
      const totalExpenses = totalVariableExpenses + totalFixedExpenses;
      const netProfit = totalRevenue - totalExpenses;

      const summaryData = [
        ['Tổng doanh thu', `${totalRevenue.toLocaleString()} VNĐ`],
        ['Tổng chi phí (đã bao gồm chi phí cố định)', `${totalExpenses.toLocaleString()} VNĐ`],
        ['Lợi nhuận ròng', `${netProfit > 0 ? '+' : ''}${netProfit.toLocaleString()} VNĐ`],
      ];

      autoTable(doc, {
        head: [['Hạng mục', 'Tổng cộng']],
        body: summaryData,
        startY: finalY + 20,
        styles: { font: 'Roboto', fontSize: 11, cellPadding: 5 },
        headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 253, 244] },
      });

      // Bảng chia cổ tức
      finalY = (doc as any).lastAutoTable.finalY || finalY + 20;

      doc.setFontSize(12);
      doc.setFont('Roboto', 'bold');
      doc.setTextColor(0);
      doc.text('Bảng chia cổ tức', 14, finalY + 15);

      const dividendData = [
        ['Mẹ Ngọc', `${(netProfit > 0 ? netProfit * 0.5 : 0).toLocaleString()} VNĐ`],
        ['Hải Dung', `${(netProfit > 0 ? netProfit * 0.35 : 0).toLocaleString()} VNĐ`],
        ['Bố Song', `${(netProfit > 0 ? netProfit * 0.15 : 0).toLocaleString()} VNĐ`],
      ];

      autoTable(doc, {
        head: [['Tên', 'Chia cổ tức']],
        body: dividendData,
        startY: finalY + 20,
        styles: { font: 'Roboto', fontSize: 11, cellPadding: 5 },
        headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [254, 252, 232] },
      });

      // Tự động tạo tên file theo tháng/năm đang chọn
      const monthMatch = validSelectedMonth.match(/Tháng (\d{2}), (\d{4})/);
      const fileName = monthMatch
        ? `Báo cáo doanh thu tháng ${parseInt(monthMatch[1])}-${monthMatch[2]}.pdf`
        : 'Bao-cao-doanh-thu.pdf';

      doc.save(fileName);
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi xuất PDF. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center mb-8 gap-4">
        <div className="flex-none">
          <h2 className="text-3xl font-bold">Sổ doanh thu & Báo cáo</h2>
          <p className="text-on-surface-variant text-sm mt-1">Theo dõi chi tiết các giao dịch tài chính hàng ngày.</p>
        </div>
        <div className="flex-1 flex justify-center w-full md:w-auto">
          <div className="flex items-center gap-3 bg-surface border border-outline-variant px-5 py-2.5 rounded-xl shadow-sm hover:bg-surface-container transition-colors cursor-pointer group relative">
            <CalendarDays size={18} className="text-primary" />
            <select
              className="bg-transparent border-none text-sm font-bold p-0 focus:ring-0 text-primary cursor-pointer outline-none appearance-none pr-6 z-10"
              value={validSelectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {allMonths.map(month => (
                <option key={month}>{month}</option>
              ))}
            </select>
            <ChevronRight size={16} className="text-primary absolute right-4 rotate-90 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-surface border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-auto max-h-[500px]">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr className="bg-surface-container border-b border-outline-variant text-[11px] font-black text-outline uppercase tracking-widest">
                <th className="px-8 py-5">Ngày</th>
                <th className="px-8 py-5 text-right">Tổng Doanh Thu</th>
                <th className="px-8 py-5 text-right">Tổng Chi Phí</th>
                <th className="px-8 py-5 text-right">Lợi Nhuận</th>
                <th className="px-8 py-5 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.map((entry, idx) => (
                <tr key={entry.id} onClick={() => onEditDate(entry.date)} className={`hover:bg-blue-50/30 transition-colors cursor-pointer group ${idx % 2 === 1 ? 'bg-surface-container/20' : ''}`}>
                  <td className="px-8 py-5 font-bold text-primary text-sm group-hover:underline decoration-2 underline-offset-4">{entry.date}</td>
                  <td className="px-8 py-5 text-right font-financial font-bold text-on-surface">
                    {entry.revenue.toLocaleString()}đ
                  </td>
                  <td className="px-8 py-5 text-right font-financial font-bold text-tertiary">-{entry.expenses.toLocaleString()}đ</td>
                  <td className="px-8 py-5 text-right font-financial font-black text-secondary">{entry.profit > 0 ? '+' : ''}{entry.profit.toLocaleString()}đ</td>
                  <td className="px-8 py-5 text-right">
                    <button
                      className="p-2 text-tertiary bg-tertiary/5 hover:bg-tertiary/10 rounded-lg transition-all"
                      title="Xóa dữ liệu ngày"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(entry.id);
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-surface-container border-t border-outline-variant flex gap-4">
          <div className="flex gap-2">
            <button
              onClick={exportToPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-6 py-2 bg-surface border border-outline-variant rounded-lg text-xs font-bold hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed">
              {isExporting ? <Loader2 size={16} className="animate-spin text-tertiary" /> : <FileText size={16} className="text-tertiary" />}
              {isExporting ? 'Đang xuất...' : 'Xuất PDF'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-2xl border-l-4 border-secondary shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black text-outline uppercase tracking-widest">Tổng doanh thu {selectedMonth.split(',')[0].toLowerCase()}</span>
            <TrendingUp className="text-secondary" />
          </div>
          <p className="text-3xl font-black font-financial">{filteredEntries.reduce((sum, entry) => sum + entry.revenue, 0).toLocaleString()}đ</p>
        </div>
        <div className="bg-surface p-6 rounded-2xl border-l-4 border-tertiary shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-outline uppercase tracking-widest">Tổng chi {validSelectedMonth.split(',')[0].toLowerCase()}</span>
              <span className="text-[9px] text-tertiary font-bold">(Bao gồm cả chi cố định)</span>
            </div>
            <Receipt className="text-tertiary" />
          </div>
          <p className="text-3xl font-black font-financial">{(filteredEntries.reduce((sum, entry) => sum + entry.expenses, 0) + totalFixedExpenses).toLocaleString()}đ</p>
        </div>
        <div className="bg-primary text-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">Lợi nhuận {validSelectedMonth.split(',')[0].toLowerCase()}</span>
            <Wallet className="opacity-80" />
          </div>
          <p className="text-3xl font-black font-financial">{(filteredEntries.reduce((sum, entry) => sum + entry.revenue, 0) - (filteredEntries.reduce((sum, entry) => sum + entry.expenses, 0) + totalFixedExpenses)).toLocaleString()}đ</p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 bg-surface-container-highest/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 min-h-screen animate-in fade-in duration-200"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="bg-surface rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col pt-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="absolute top-4 right-4 p-2 text-outline hover:bg-surface-container-high rounded-full transition-colors"
            >
              <X size={16} />
            </button>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-tertiary/10 text-tertiary rounded-full flex items-center justify-center">
                <Trash2 size={32} />
              </div>
            </div>
            <h3 className="text-center font-bold text-xl mb-2 text-on-surface">Xác nhận xóa sổ</h3>
            <p className="text-center text-sm font-medium text-on-surface-variant mb-6 px-2">
              Bạn có chắc chắn muốn xóa bản ghi của ngày này không? Dữ liệu bên nhập liệu sẽ được làm trống ngay lập tức.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-tertiary text-white shadow-sm hover:opacity-90 hover:shadow-md transition-all active:scale-[0.98]"
              >
                Xóa bản ghi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

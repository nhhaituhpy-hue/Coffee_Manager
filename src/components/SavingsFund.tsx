import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  PiggyBank, 
  Target, 
  Settings2, 
  PlusCircle, 
  ArrowRightCircle, 
  FileText, 
  Filter, 
  CheckCircle2, 
  X, 
  Trash2, 
  Lock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { autoFormatAmountOnBlur } from '../utils';

export const SavingsFund: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('hqs_savings_transactions');
      if (stored) return JSON.parse(stored);
    } catch { }
    return [];
  });

  const [currentBalance, setCurrentBalance] = useState(() => {
    return transactions.reduce((acc, tx) => acc + tx.amount, 0);
  });

  const [monthlyTotal, setMonthlyTotal] = useState(0);

  // Features states
  const [isDepositMode, setIsDepositMode] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('');

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterText, setFilterText] = useState('');

  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    setCurrentBalance(transactions.reduce((acc, tx) => acc + tx.amount, 0));

    // Calculate monthly total
    const currentMonth = new Date().toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
    const total = transactions.reduce((acc, tx) => {
      if (tx.amount > 0 && tx.date.endsWith(currentMonth)) {
        return acc + tx.amount;
      }
      return acc;
    }, 0);
    setMonthlyTotal(total);
  }, [transactions]);

  const addTransaction = (type: string, description: string, amount: number) => {
    const newTx = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      type,
      description,
      amount,
      balanceAfter: currentBalance + amount
    };

    const newTransactions = [newTx, ...transactions];
    setTransactions(newTransactions);
    localStorage.setItem('hqs_savings_transactions', JSON.stringify(newTransactions));
  };

  const handleDepositSubmit = () => {
    const amount = parseInt(depositAmount.replace(/\D/g, ''), 10);
    if (amount && amount > 0) {
      addTransaction('MANUAL', 'Nộp thêm thủ công', amount);
      setDepositAmount('');
      setIsDepositMode(false);
    }
  };

  const handleWithdrawSubmit = () => {
    const amount = parseInt(withdrawAmount.replace(/\D/g, ''), 10);
    if (amount && amount > 0 && withdrawReason.trim() !== '') {
      addTransaction('WITHDRAW', withdrawReason, -amount);
      setWithdrawAmount('');
      setWithdrawReason('');
      setIsWithdrawModalOpen(false);
    }
  };

  const handleDeleteAllTransactions = async () => {
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin: adminPin }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTransactions([]);
        localStorage.setItem('hqs_savings_transactions', JSON.stringify([]));
        setIsDeleteAllModalOpen(false);
        setAdminPin('');
        setDeleteError('');
      } else {
        setDeleteError('Mã PIN không đúng.');
      }
    } catch (err) {
      setDeleteError('Lỗi kết nối máy chủ!');
    }
  };

  const filteredTransactions = transactions.filter(tx =>
    tx.description.toLowerCase().includes(filterText.toLowerCase())
  );
  
  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      
      // Load fonts (tương tự Ledger.tsx để hỗ trợ tiếng Việt)
      try {
        const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf';
        const response = await fetch(fontUrl);
        const fontBuffer = await response.arrayBuffer();
        let binary = '';
        const bytes = new Uint8Array(fontBuffer);
        for (let i = 0; i < bytes.byteLength; i++) {
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
        for (let i = 0; i < bytesBold.byteLength; i++) {
          binaryBold += String.fromCharCode(bytesBold[i]);
        }
        const base64StringBold = window.btoa(binaryBold);
        doc.addFileToVFS('Roboto-Medium.ttf', base64StringBold);
        doc.addFont('Roboto-Medium.ttf', 'Roboto', 'bold');
        doc.setFont('Roboto');
      } catch (e) {
        console.error('Failed to load font', e);
      }

      // Tiêu đề
      doc.setFontSize(18);
      doc.setFont('Roboto', 'bold');
      doc.setTextColor(92, 58, 33); // Màu nâu primary
      doc.text('Lịch Sử Giao Dịch Quỹ Tiết Kiệm', 14, 20);
      
      doc.setFontSize(10);
      doc.setFont('Roboto', 'normal');
      doc.setTextColor(100);
      doc.text(`Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}`, 14, 28);
      
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Số dư hiện tại: ${currentBalance.toLocaleString()} VNĐ`, 14, 38);

      const tableData = filteredTransactions.map(tx => [
        tx.date,
        tx.description,
        `${tx.amount > 0 ? '+' : ''}${tx.amount.toLocaleString()} VNĐ`,
        `${tx.balanceAfter.toLocaleString()} VNĐ`
      ]);

      autoTable(doc, {
        head: [['Ngày', 'Nội dung giao dịch', 'Số tiền', 'Số dư sau GD']],
        body: tableData,
        startY: 45,
        styles: { font: 'Roboto', fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [92, 58, 33], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          2: { halign: 'right' },
          3: { halign: 'right' }
        }
      });

      doc.save(`Lich-su-quy-tiet-kiem-${new Date().getTime()}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi xuất PDF. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      <div>
        <h2 className="text-3xl font-bold mb-2">Quỹ tiết kiệm dự phòng</h2>
        <p className="text-on-surface-variant max-w-3xl">
          Quản lý nguồn quỹ trích lập hàng tháng từ doanh thu để phục vụ các kế hoạch nâng cấp trang thiết bị, mở rộng quy mô hoặc xử lý các sự cố khẩn cấp của cửa hàng.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-surface border border-outline-variant p-6 rounded-2xl shadow-sm border-l-4 border-l-primary"
        >
          <p className="text-xs font-bold text-outline uppercase tracking-widest mb-2">Số dư hiện tại</p>
          <div className="flex items-baseline gap-2">
            <p className={`text-4xl font-black font-financial ${currentBalance < 0 ? 'text-tertiary' : 'text-on-surface'}`}>
              {currentBalance.toLocaleString('vi-VN')}đ
            </p>
          </div>
          <div className="mt-4 flex items-center text-secondary text-xs font-bold">
            <TrendingUp size={14} className="mr-1" />
            +0% so với tháng trước
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-surface-container-highest text-white rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between shadow-xl relative overflow-hidden group gap-8">
          <div className="absolute -right-12 -top-12 scale-150 opacity-10 group-hover:opacity-20 transition-all duration-700">
            <PiggyBank size={200} />
          </div>
          <div className="relative z-10 w-full md:w-1/3 lg:w-1/4 md:pr-4 mb-6 md:mb-0">
            <h3 className="text-2xl font-bold mb-3" style={{ color: '#843b3b' }}>Thao tác quỹ</h3>
            <p className="text-outline text-sm mb-0 leading-relaxed">Nộp thêm thủ công hoặc rút quỹ chính xác cho các chi phí phát sinh khẩn cấp.</p>
          </div>

          <div className="relative z-10 w-full flex-1 flex flex-col xl:flex-row gap-3">
            {isDepositMode ? (
              <div className="flex items-stretch gap-2 flex-1">
                <input
                  type="text"
                  placeholder="Số tiền nộp (VNĐ)..."
                  value={depositAmount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setDepositAmount(val ? parseInt(val).toLocaleString('vi-VN') : '');
                  }}
                  onBlur={() => {
                    const raw = autoFormatAmountOnBlur(depositAmount);
                    setDepositAmount(raw ? parseInt(raw).toLocaleString('vi-VN') : '');
                  }}
                  className="min-w-0 flex-1 px-4 py-4 rounded-xl bg-surface/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 font-financial font-bold"
                  autoFocus
                />
                <button
                  onClick={handleDepositSubmit}
                  className="px-6 bg-secondary text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center flex-shrink-0"
                >
                  <CheckCircle2 size={24} />
                </button>
                <button
                  onClick={() => { setIsDepositMode(false); setDepositAmount(''); }}
                  className="px-6 bg-surface/10 text-white rounded-xl font-bold hover:bg-surface/20 transition-all flex items-center justify-center flex-shrink-0"
                >
                  <X size={24} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsDepositMode(true)}
                className="flex-1 py-4 px-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all"
                style={{ backgroundColor: '#f7c24d', color: '#8b4242' }}
              >
                <PlusCircle size={20} /> Nộp thêm vào quỹ
              </button>
            )}
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="flex-1 py-4 px-4 border border-white/20 rounded-xl font-bold flex items-center justify-center gap-3 transition-all text-center whitespace-nowrap"
              style={{ backgroundColor: '#d49760', color: '#502424' }}
            >
              <ArrowRightCircle size={20} /> Rút quỹ
            </button>
          </div>
        </div>
      </div>

      {/* Saving History */}
      <div className="bg-surface border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-6 border-b border-outline-variant flex justify-between items-center bg-surface-container relative">
          <h3 className="text-xl font-bold">Lịch sử giao dịch</h3>
          <div className="flex gap-2">
            <div className="relative flex items-center">
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.input
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    type="text"
                    placeholder="Lọc tên khoản chi..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="absolute right-full mr-2 px-3 py-1.5 text-sm border border-outline-variant rounded-lg focus:outline-none focus:border-primary bg-surface"
                  />
                )}
              </AnimatePresence>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 text-xs font-bold px-4 py-2 border border-outline-variant rounded-lg transition-colors ${isFilterOpen ? 'bg-primary text-white border-primary' : 'hover:bg-surface-container-high bg-surface'}`}
              >
                <Filter size={14} /> Bộ lọc
              </button>
            </div>
            <button 
              onClick={exportToPDF}
              disabled={isExporting}
              className="flex items-center gap-2 text-xs font-bold px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-high bg-surface transition-colors disabled:opacity-70"
            >
              {isExporting ? <Loader2 size={14} className="animate-spin text-primary" /> : <FileText size={14} className="text-primary" />}
              {isExporting ? 'Đang xuất...' : 'Xuất PDF'}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface border-b border-outline-variant text-[10px] font-black text-outline uppercase tracking-[0.2em]">
                <th className="px-8 py-4">Ngày</th>
                <th className="px-8 py-4 w-[40%]">Loại giao dịch</th>
                <th className="px-8 py-4 text-right">Số tiền</th>
                <th className="px-8 py-4 text-right">Số dư sau GD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-outline text-sm">Chưa có giao dịch nào phù hợp</td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="px-8 py-5 text-sm font-semibold">{tx.date}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${tx.type === 'WITHDRAW' ? 'bg-tertiary/10 text-tertiary' :
                            tx.type === 'MANUAL' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                          }`}>
                          {tx.type === 'WITHDRAW' ? <Target size={16} /> : <TrendingUp size={16} />}
                        </div>
                        <span className="text-sm font-bold text-on-surface">{tx.description}</span>
                      </div>
                    </td>
                    <td className={`px-8 py-5 text-right font-bold font-financial ${tx.amount > 0 ? 'text-secondary' : 'text-tertiary'}`}>
                      {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()}đ
                    </td>
                    <td className="px-8 py-5 text-right text-sm font-bold text-on-surface-variant font-financial">
                      {tx.balanceAfter.toLocaleString()}đ
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredTransactions.length > 0 && (
          <div className="px-8 py-6 bg-surface-container border-t border-outline-variant flex justify-center">
            <button onClick={() => setIsDeleteAllModalOpen(true)} className="text-red-500 text-sm font-black uppercase tracking-widest hover:underline border border-red-200 bg-red-50 px-4 py-2 rounded-lg cursor-pointer dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30 flex items-center gap-2"><Trash2 size={16} /> Xóa tất cả giao dịch</button>
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-surface-container-highest/40 backdrop-blur-sm"
              onClick={() => setIsWithdrawModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-surface rounded-2xl shadow-xl w-full max-w-md p-8 m-4"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ArrowRightCircle className="text-tertiary" />
                  Rút quỹ khẩn cấp
                </h3>
                <button onClick={() => setIsWithdrawModalOpen(false)} className="text-outline hover:text-on-surface transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Số tiền cần rút (VNĐ)</label>
                  <input
                    type="text"
                    value={withdrawAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val) {
                        const num = parseInt(val);
                        setWithdrawAmount(num.toLocaleString('vi-VN'));
                      } else {
                        setWithdrawAmount('');
                      }
                    }}
                    onBlur={() => {
                      const raw = autoFormatAmountOnBlur(withdrawAmount);
                      setWithdrawAmount(raw ? parseInt(raw).toLocaleString('vi-VN') : '');
                    }}
                    placeholder="VD: 5.000.000"
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:outline-none focus:border-primary font-financial font-bold text-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">Lý do rút quỹ</label>
                  <input
                    type="text"
                    value={withdrawReason}
                    onChange={(e) => setWithdrawReason(e.target.value)}
                    placeholder="VD: Sửa chữa máy lạnh..."
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="flex-1 py-3 text-on-surface-variant font-bold hover:bg-surface-container rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleWithdrawSubmit}
                  disabled={!withdrawAmount || !withdrawReason.trim()}
                  className="flex-1 py-3 bg-tertiary text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Xác nhận rút
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete All Modal */}
      <AnimatePresence>
        {isDeleteAllModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-surface-container-highest/40 backdrop-blur-sm"
              onClick={() => {
                setIsDeleteAllModalOpen(false);
                setAdminPin('');
                setDeleteError('');
              }}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-surface rounded-2xl shadow-xl w-full max-w-md p-8 m-4"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-error">
                  <Trash2 className="text-error" />
                  Xóa tất cả giao dịch
                </h3>
                <button
                  onClick={() => {
                    setIsDeleteAllModalOpen(false);
                    setAdminPin('');
                    setDeleteError('');
                  }}
                  className="text-outline hover:text-on-surface transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-error/10 text-error rounded-xl font-bold text-sm">
                  Cảnh báo: Hành động này sẽ xóa vĩnh viễn toàn bộ lịch sử thu/chi của quỹ tiết kiệm và không thể hoàn tác. Số dư quỹ cũng sẽ bị hoàn nguyên.
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-on-surface-variant mb-2">
                    <Lock size={16} /> Nhập mã PIN truy cập để xác nhận
                  </label>
                  <input
                    type="password"
                    value={adminPin}
                    onChange={(e) => {
                      setAdminPin(e.target.value);
                      if (deleteError) setDeleteError('');
                    }}
                    maxLength={4}
                    placeholder="Nhập mã PIN..."
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:outline-none focus:border-error text-center tracking-[1em] text-xl"
                  />
                  {deleteError && (
                    <p className="text-error text-sm font-bold mt-2">{deleteError}</p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => {
                    setIsDeleteAllModalOpen(false);
                    setAdminPin('');
                    setDeleteError('');
                  }}
                  className="flex-1 py-3 text-on-surface-variant font-bold hover:bg-surface-container rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteAllTransactions}
                  disabled={!adminPin}
                  className="flex-1 py-3 border border-error text-error bg-error/10 font-bold rounded-xl hover:bg-error/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Xác nhận xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};



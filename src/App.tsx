import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Layout';
import { LoginPage } from './components/LoginPage';
import { DailyEntry } from './components/DailyEntry';
import { Ledger } from './components/Ledger';
import { FixedExpenses } from './components/FixedExpenses';
import { SavingsFund } from './components/SavingsFund';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';
import { MobileHeader, BottomNav } from './components/MobileNav';
import { motion, AnimatePresence } from 'motion/react';
import { DEFAULT_DAILY_ENTRIES } from './constants';
import { fetchCloudData, saveCloudData, storeSessionToken } from './utils';
import { DailyEntry as DailyEntryType } from './types';
import { useResponsive } from './responsiveUtils';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('daily-entry');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [dateToEdit, setDateToEdit] = useState<string | null>(null);
  const [shopName, setShopName] = useState('Hoa Quả Sơn Coffee Analytics');
  const [shopLocation, setShopLocation] = useState('42 Lý Tự Trọng - Tuy Hòa');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('hqs_is_logged_in') === 'true');
  
  const { isMobile } = useResponsive();

  // Application State
  const [entries, setEntries] = useState<DailyEntryType[]>(DEFAULT_DAILY_ENTRIES);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Fetch data from cloud on mount — chỉ chạy khi đã đăng nhập
  useEffect(() => {
    async function initData() {
      if (!isLoggedIn) {
        // Chưa login → hiện LoginPage ngay, không fetch
        setIsLoading(false);
        return;
      }
      try {
        const cloudData = await fetchCloudData();
        if (cloudData) {
          if (cloudData.hqs_ledger_entries) setEntries(cloudData.hqs_ledger_entries);
          if (cloudData.hqs_shop_name) setShopName(cloudData.hqs_shop_name);
          if (cloudData.hqs_shop_location) setShopLocation(cloudData.hqs_shop_location);
          if (cloudData.hqs_audit_logs) setAuditLogs(cloudData.hqs_audit_logs);
          
          // Theme initialization
          const theme = cloudData.hqs_theme || 'light';
          if (theme === 'dark') document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        }
      } catch (e) {
        console.error('Initial data fetch failed', e);
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, [isLoggedIn]);

  const handleEditDate = (dateStr: string) => {
    setDateToEdit(dateStr);
    setActiveTab('daily-entry');
  };

  // Reset dateToEdit khi chuyển tab để đảm bảo lần click sau từ Ledger vẫn kích hoạt useEffect
  useEffect(() => {
    if (activeTab !== 'daily-entry') {
      setDateToEdit(null);
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('hqs_is_logged_in');
    sessionStorage.removeItem('hqs_session_token'); // Token lưu trong sessionStorage
    storeSessionToken('');
    setIsLoggedIn(false);
  };

  const updateEntry = async (updatedEntry: DailyEntryType) => {
    // Add timestamp for conflict resolution on server
    const entryWithTs = { ...updatedEntry, _timestamp: Date.now() };
    
    // Optimistic update
    setEntries((prev) => {
      const exists = prev.find(e => e.date === updatedEntry.date);
      if (exists) {
        return prev.map(e => e.date === updatedEntry.date ? entryWithTs : e);
      }
      return [entryWithTs, ...prev];
    });

    // Save to cloud
    try {
      await saveCloudData({ hqs_ledger_entries: [entryWithTs] });
    } catch (e) {
      console.error('Failed to save entry to cloud', e);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-outline font-bold animate-pulse">Đang tải dữ liệu từ đám mây...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'daily-entry':
        return <DailyEntry entries={entries} onUpdateEntry={updateEntry} dateToEdit={dateToEdit} />;
      case 'ledger':
        return <Ledger entries={entries} setEntries={setEntries} onEditDate={handleEditDate} />;
      case 'fixed-expenses':
        return <FixedExpenses />;
      case 'savings':
        return <SavingsFund />;
      default:
        return <DailyEntry entries={entries} onUpdateEntry={updateEntry} dateToEdit={dateToEdit} />;
    }
  };

  return (
    <div className="h-screen bg-background text-on-surface overflow-hidden flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        shopName={shopName}
        shopLocation={shopLocation}
        onLogout={handleLogout}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onAboutClick={() => setIsAboutOpen(true)}
      />

      {isMobile && (
        <MobileHeader
          shopName={shopName}
          shopLocation={shopLocation}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onAboutClick={() => setIsAboutOpen(true)}
          onLogout={handleLogout}
        />
      )}
      
      <main className="flex-1 h-screen flex flex-col overflow-hidden relative">
        <div className={`flex-1 overflow-y-auto p-4 md:p-8 bg-background custom-scrollbar ${isMobile ? 'pt-[calc(3.5rem+var(--safe-area-top))] pb-[calc(5rem+var(--safe-area-bottom))]' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
        <AboutModal
          isOpen={isAboutOpen}
          onClose={() => setIsAboutOpen(false)}
          logs={auditLogs}
        />
      </main>

      {isMobile && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </div>
  );
}

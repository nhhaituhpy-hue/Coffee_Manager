/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sidebar } from './components/Layout';
import { DailyEntry } from './components/DailyEntry';
import { Ledger } from './components/Ledger';
import { FixedExpenses } from './components/FixedExpenses';
import { SavingsFund } from './components/SavingsFund';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';
import { LoginPage } from './components/LoginPage';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_DAILY_ENTRIES } from './constants';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('hqs_is_logged_in') === 'true';
  });
  const [activeTab, setActiveTab] = useState('daily-entry');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [dateToEdit, setDateToEdit] = useState<string | null>(null);

  const [entries, setEntries] = useState(() => {
    const stored = localStorage.getItem('hqs_ledger_entries');
    return stored ? JSON.parse(stored) : MOCK_DAILY_ENTRIES;
  });

  useEffect(() => {
    localStorage.setItem('hqs_ledger_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    const theme = localStorage.getItem('hqs_theme') || 'light';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('hqs_is_logged_in');
    setIsAuthenticated(false);
  };

  const handleEditDate = (dateStr: string) => {
    setDateToEdit(dateStr);
    setActiveTab('daily-entry');
  };

  const updateEntry = (updatedEntry: any) => {
    setEntries((prev: any[]) => {
      const exists = prev.find(e => e.date === updatedEntry.date);
      if (exists) {
        return prev.map(e => e.date === updatedEntry.date ? updatedEntry : e);
      }
      return [updatedEntry, ...prev];
    });
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
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
        onLogout={handleLogout}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onAboutClick={() => setIsAboutOpen(true)}
      />
      
      <main className="flex-1 h-screen flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-8 bg-background custom-scrollbar">
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
        />
      </main>
    </div>
  );
}


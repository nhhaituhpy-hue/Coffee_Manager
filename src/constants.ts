import { DailyEntry, FixedExpense, SavingTransaction } from './types';

export const DEFAULT_DAILY_ENTRIES: DailyEntry[] = [];

export const DEFAULT_FIXED_EXPENSES: FixedExpense[] = [
    { id: '1', category: 'Tiền điện', amount: 0 },
    { id: '2', category: 'Tiền nước', amount: 0 },
    { id: '3', category: 'Tiền mạng', amount: 0 },
];

export const DEFAULT_SAVINGS: SavingTransaction[] = [];

export const DEFAULT_EXPENSES = [
    { id: 1, name: 'Đá', amount: '0' }
];

export type TransactionStatus = 'PAID' | 'PENDING' | 'LOSS' | 'FINALIZED' | 'AWAIT_REVIEW';

export interface DailyEntry {
  id: string;
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
  status: TransactionStatus;
}

export interface FixedExpense {
  id: string;
  category: string;
  amount: number;
}

export interface SavingTransaction {
  id: string;
  date: string;
  type: 'REVENUE_PERCENT' | 'MANUAL' | 'WITHDRAW';
  description: string;
  amount: number;
  balanceAfter: number;
  status: 'COMPLETED';
}

export type TransactionStatus = 'PAID' | 'PENDING' | 'LOSS' | 'FINALIZED' | 'AWAIT_REVIEW';

export interface DailyEntryDetail {
  id: number;
  name: string;
  amount: number;
}

export interface DailyEntry {
  id: string;
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
  status: TransactionStatus;
  details?: DailyEntryDetail[];
  _timestamp: number; // Per-entry timestamp for conflict resolution
}

export interface FixedExpense {
  id: string;
  category: string;
  amount: number;
  _timestamp?: number;
}

export interface SavingTransaction {
  id: string;
  date: string;
  type: 'REVENUE_PERCENT' | 'MANUAL' | 'WITHDRAW';
  description: string;
  amount: number;
  balanceAfter: number;
  status: 'COMPLETED';
  _timestamp?: number;
}

export interface AuditLog {
  action: string;
  details: string;
  timestamp: number;
}

export interface SyncMetadata {
  [key: string]: {
    _timestamp: number;
    _version?: string;
  };
}

export interface AppState {
  hqs_ledger_entries: DailyEntry[];
  hqs_fixed_expenses: Record<string, FixedExpense[]>;
  hqs_savings_transactions: SavingTransaction[];
  hqs_audit_logs?: AuditLog[];
  hqs_is_logged_in: boolean;
  hqs_admin_pin_hash: string; // Hashed PIN, never plaintext
  hqs_shop_name: string;
  hqs_shop_location: string;
  hqs_theme: 'light' | 'dark';
  hqs_last_updated: string;
}

// Validation guards
export function isDailyEntry(obj: unknown): obj is DailyEntry {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'date' in obj &&
    'revenue' in obj && typeof (obj as any).revenue === 'number' &&
    'expenses' in obj && typeof (obj as any).expenses === 'number'
  );
}

export function isFixedExpense(obj: unknown): obj is FixedExpense {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'category' in obj &&
    'amount' in obj &&
    typeof (obj as any).amount === 'number'
  );
}

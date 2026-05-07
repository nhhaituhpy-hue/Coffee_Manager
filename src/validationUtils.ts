/**
 * Input validation utilities for data integrity
 */

import { DailyEntry, FixedExpense, SavingTransaction } from './types';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate PIN format (must be 4 digits)
 */
export function validatePin(pin: string): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  
  if (!pin || pin.trim().length === 0) {
    errors.push({ field: 'pin', message: 'PIN is required' });
  } else if (!/^\d{4}$/.test(pin)) {
    errors.push({ field: 'pin', message: 'PIN must be exactly 4 digits' });
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Validate DailyEntry data structure
 */
export function validateDailyEntry(entry: unknown): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  
  if (!entry || typeof entry !== 'object') {
    errors.push({ field: 'entry', message: 'Entry must be a valid object' });
    return { valid: false, errors };
  }
  
  const e = entry as Record<string, any>;
  
  if (typeof e.id !== 'string' || !e.id) {
    errors.push({ field: 'id', message: 'Entry ID is required' });
  }
  
  if (typeof e.date !== 'string' || !e.date) {
    errors.push({ field: 'date', message: 'Entry date is required' });
  }
  
  if (typeof e.revenue !== 'number' || e.revenue < 0) {
    errors.push({ field: 'revenue', message: 'Revenue must be a non-negative number' });
  }
  
  if (typeof e.expenses !== 'number' || e.expenses < 0) {
    errors.push({ field: 'expenses', message: 'Expenses must be a non-negative number' });
  }
  
  if (!Array.isArray(e.details)) {
    errors.push({ field: 'details', message: 'Entry details must be an array' });
  }
  
  if (typeof e._timestamp !== 'number' || e._timestamp < 0) {
    errors.push({ field: '_timestamp', message: 'Timestamp is required' });
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Validate FixedExpense data structure
 */
export function validateFixedExpense(expense: unknown): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  
  if (!expense || typeof expense !== 'object') {
    errors.push({ field: 'expense', message: 'Expense must be a valid object' });
    return { valid: false, errors };
  }
  
  const exp = expense as Record<string, any>;
  
  if (typeof exp.id !== 'string' || !exp.id) {
    errors.push({ field: 'id', message: 'Expense ID is required' });
  }
  
  if (typeof exp.category !== 'string' || !exp.category) {
    errors.push({ field: 'category', message: 'Category is required' });
  }
  
  if (typeof exp.amount !== 'number' || exp.amount < 0) {
    errors.push({ field: 'amount', message: 'Amount must be a non-negative number' });
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Sanitize user input to prevent basic XSS
 */
export function sanitizeInput(input: string, maxLength: number = 500): string {
  if (typeof input !== 'string') return '';
  
  return input
    .substring(0, maxLength)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Validate JSON payload size (prevent DoS)
 */
export function validatePayloadSize(payload: string, maxSizeMB: number = 5): boolean {
  const sizeInBytes = new Blob([payload]).size;
  const sizeInMB = sizeInBytes / (1024 * 1024);
  return sizeInMB <= maxSizeMB;
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Validate it's an object
    if (typeof parsed !== 'object' || parsed === null) {
      return fallback;
    }
    
    return parsed as T;
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
}

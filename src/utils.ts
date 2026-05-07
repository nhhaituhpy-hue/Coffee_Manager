import { validatePayloadSize } from './validationUtils';

// ── Session token helpers ─────────────────────────────────────────────────────
/** Lưu session token nhận được từ server sau khi đăng nhập thành công */
export const storeSessionToken = (token: string): void => {
  sessionStorage.setItem('hqs_session_token', token);
};

/** Lấy session token để đính kèm vào mọi request đến /api/data */
export const getSessionToken = (): string => {
  return sessionStorage.getItem('hqs_session_token') ?? '';
};

/** Header helper — dùng cho mọi request đến /api/data */
const authHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  'X-Session-Token': getSessionToken(),
});

// Helper for formatting currency
export const formatCurrency = (value: string | number): string => {
  if (!value && value !== 0) return '';
  const num = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('vi-VN');
};

export const parseCurrency = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const autoFormatAmountOnBlur = (value: string | number): string => {
  if (!value && value !== 0) return '';
  const num = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : value;
  if (isNaN(num) || num === 0) return value.toString();
  
  if (num < 10000) {
    return (num * 1000).toString();
  }
  
  return num.toString();
};

/**
 * Cloud-first data saving
 * Sends data directly to D1 database
 */
export const saveCloudData = async (payload: Record<string, any>): Promise<void> => {
  try {
    const json = JSON.stringify(payload);
    if (!validatePayloadSize(json)) {
      throw new Error('Data exceeds size limit');
    }

    const response = await fetch('/api/data', {
      method: 'POST',
      headers: authHeaders(),
      body: json,
    });

    if (!response.ok) {
      throw new Error(`Cloud save failed: ${response.status}`);
    }
  } catch (error) {
    console.error('Cloud save error:', error);
    throw error;
  }
};

/**
 * Cloud-first data loading
 */
export const fetchCloudData = async (): Promise<any> => {
  try {
    const token = getSessionToken();
    const response = await fetch('/api/data', {
      headers: { 'X-Session-Token': token },
    });
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error(`fetchCloudData failed: HTTP ${response.status}`, body);
      if (response.status === 401) {
        console.warn('Session token hiện tại:', token ? `${token.substring(0, 8)}...` : '(trống)');
      }
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch cloud data error:', error);
    return null;
  }
};

/**
 * Delete item from cloud
 */
export const deleteCloudItem = async (type: 'entry' | 'fixed' | 'saving', id: string): Promise<void> => {
  try {
    await fetch('/api/data', {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ type, id }),
    });
  } catch (error) {
    console.error('Delete cloud item error:', error);
  }
};

// Legacy stubs to prevent breakage during migration
export const saveLocalData = (key: string, value: any) => {
  console.warn('saveLocalData is deprecated, use saveCloudData instead');
  // We trigger a cloud save immediately for the specific key
  saveCloudData({ [key]: value }).catch(console.error);
};

export const checkAndPullFromCloud = async () => {
  return fetchCloudData();
};

export const storePinSecurely = async (pin: string): Promise<boolean> => {
  try {
    localStorage.setItem('hqs_is_logged_in', 'true');
    return true;
  } catch (e) {
    return false;
  }
};

export const verifyPinSecurely = async (pin: string): Promise<boolean> => {
  // This is a placeholder since the actual verification happens on server /api/verify
  return true; 
};

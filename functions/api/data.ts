interface DataContext {
  request: Request;
  env: {
    DB: D1Database;
    ADMIN_PIN_HASH: string;
  };
}

// ── Derive + verify session token ─────────────────────────────────────────────
async function deriveExpectedToken(adminPinHash: string): Promise<string> {
  const buffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(adminPinHash + ':hqs-session')
  );
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function isAuthenticated(request: Request, adminPinHash: string): Promise<boolean> {
  const token = request.headers.get('X-Session-Token');
  if (!token || !adminPinHash) return false;
  const expected = await deriveExpectedToken(adminPinHash);
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

const UNAUTHORIZED = () =>
  new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });

// ── Table init ───────────────────────────────────────────────────────────────
let tablesInitialized = false;
async function ensureTables(db: D1Database) {
  if (tablesInitialized) return;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS ledger_entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      data TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS fixed_expenses (
      id TEXT PRIMARY KEY,
      month TEXT NOT NULL,
      data TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS savings_transactions (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      details TEXT,
      timestamp INTEGER NOT NULL
    )`),
  ]);
  tablesInitialized = true;
}

// Helper ghi log vào DB
function logAction(db: D1Database, action: string, details: string) {
  return db.prepare(
    'INSERT INTO audit_logs (id, action, details, timestamp) VALUES (?, ?, ?, ?)'
  ).bind(
    Math.random().toString(36).substring(2, 15),
    action,
    details,
    Date.now()
  );
}

function formatVND(amount: number) {
  return amount.toLocaleString('vi-VN') + 'đ';
}

function isValidId(id: unknown): id is string {
  return typeof id === 'string' && /^[\w\-]{1,64}$/.test(id);
}

const VALID_TYPES: Record<string, string> = {
  entry: 'ledger_entries',
  fixed: 'fixed_expenses',
  saving: 'savings_transactions',
};

const ALLOWED_SETTINGS = ['shop_name', 'shop_location', 'theme'] as const;

/**
 * GET /api/data
 */
export async function onRequestGet(context: DataContext) {
  if (!await isAuthenticated(context.request, context.env.ADMIN_PIN_HASH)) {
    return UNAUTHORIZED();
  }

  try {
    const db = context.env.DB;
    await ensureTables(db);

    const [ledger, fixed, savings, settings, logs] = await Promise.all([
      db.prepare('SELECT data FROM ledger_entries ORDER BY date DESC').all(),
      db.prepare('SELECT month, data FROM fixed_expenses').all(),
      db.prepare('SELECT data FROM savings_transactions').all(),
      db.prepare('SELECT key, value FROM app_settings').all(),
      db.prepare('SELECT action, details, timestamp FROM audit_logs ORDER BY timestamp DESC LIMIT 100').all(),
    ]);

    const result: Record<string, any> = {
      hqs_ledger_entries: ledger.results.map(r => JSON.parse(r.data as string)),
      hqs_fixed_expenses: {},
      hqs_savings_transactions: savings.results.map(r => JSON.parse(r.data as string)),
      hqs_audit_logs: logs.results,
    };

    fixed.results.forEach(r => {
      const month = r.month as string;
      if (!result.hqs_fixed_expenses[month]) result.hqs_fixed_expenses[month] = [];
      result.hqs_fixed_expenses[month].push(JSON.parse(r.data as string));
    });

    settings.results.forEach(r => {
      result[`hqs_${r.key}`] = r.value;
    });

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/data error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}

/**
 * POST /api/data
 */
export async function onRequestPost(context: DataContext) {
  if (!await isAuthenticated(context.request, context.env.ADMIN_PIN_HASH)) {
    return UNAUTHORIZED();
  }

  try {
    const db = context.env.DB;
    await ensureTables(db);

    const body = await context.request.json() as any;
    const statements: D1PreparedStatement[] = [];

    // Process ledger entries
    if (Array.isArray(body.hqs_ledger_entries)) {
      for (const entry of body.hqs_ledger_entries) {
        if (!isValidId(entry?.id)) continue;
        statements.push(
          db.prepare(`
            INSERT INTO ledger_entries (id, date, data, timestamp)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              data = excluded.data,
              date = excluded.date,
              timestamp = excluded.timestamp
            WHERE excluded.timestamp >= ledger_entries.timestamp
          `).bind(entry.id, entry.date, JSON.stringify(entry), entry._timestamp || Date.now())
        );
        statements.push(logAction(db, 'UPDATE_ENTRY', 
          `Ngày ${entry.date}: Thu ${formatVND(entry.revenue)}, Chi ${formatVND(entry.expenses)}`
        ));
      }
    }

    // Process fixed expenses
    if (body.hqs_fixed_expenses && typeof body.hqs_fixed_expenses === 'object') {
      for (const [month, expenses] of Object.entries(body.hqs_fixed_expenses)) {
        if (!Array.isArray(expenses)) continue;
        const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        for (const exp of expenses as any[]) {
          if (!isValidId(exp?.id)) continue;
          statements.push(
            db.prepare(`
              INSERT INTO fixed_expenses (id, month, data, timestamp)
              VALUES (?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                data = excluded.data,
                timestamp = excluded.timestamp
              WHERE excluded.timestamp >= fixed_expenses.timestamp
            `).bind(exp.id, month, JSON.stringify(exp), exp._timestamp || Date.now())
          );
        }
        statements.push(logAction(db, 'UPDATE_FIXED', `Cố định ${month}: Tổng ${formatVND(total)}`));
      }
    }

    // Process savings
    if (Array.isArray(body.hqs_savings_transactions)) {
      for (const tx of body.hqs_savings_transactions) {
        if (!isValidId(tx?.id)) continue;
        statements.push(
          db.prepare(`
            INSERT INTO savings_transactions (id, data, timestamp)
            VALUES (?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              data = excluded.data,
              timestamp = excluded.timestamp
            WHERE excluded.timestamp >= savings_transactions.timestamp
          `).bind(tx.id, JSON.stringify(tx), tx._timestamp || Date.now())
        );
        statements.push(logAction(db, 'UPDATE_SAVING', `Quỹ (${tx.type}): ${formatVND(tx.amount)} - ${tx.description}`));
      }
    }

    for (const key of ALLOWED_SETTINGS) {
      if (body[`hqs_${key}`] !== undefined) {
        statements.push(
          db.prepare(
            'INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
          ).bind(key, String(body[`hqs_${key}`]).substring(0, 200))
        );
        statements.push(logAction(db, 'UPDATE_SETTING', `Cài đặt: ${key} = ${body[`hqs_${key}`]}`));
      }
    }

    if (statements.length > 0) {
      await db.batch(statements);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('POST /api/data error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}

/**
 * DELETE /api/data
 */
export async function onRequestDelete(context: DataContext) {
  if (!await isAuthenticated(context.request, context.env.ADMIN_PIN_HASH)) {
    return UNAUTHORIZED();
  }

  try {
    const db = context.env.DB;
    const { type, id } = await context.request.json() as any;

    const table = VALID_TYPES[type];
    if (!table) return new Response(JSON.stringify({ error: 'Invalid type' }), { status: 400 });
    if (!isValidId(id)) return new Response(JSON.stringify({ error: 'Invalid id' }), { status: 400 });

    // Lấy thông tin trước khi xóa để ghi log chi tiết
    const existing = await db.prepare(`SELECT data FROM ${table} WHERE id = ?`).bind(id).first();
    let detail = `Xóa ${type} (ID: ${id})`;
    
    if (existing) {
      try {
        const data = JSON.parse(existing.data as string);
        if (type === 'entry') detail = `Xóa doanh thu ngày ${data.date} (Số tiền: ${formatVND(data.revenue)})`;
        else if (type === 'fixed') detail = `Xóa chi phí cố định: ${data.category} (${formatVND(data.amount)})`;
        else if (type === 'saving') detail = `Xóa quỹ: ${data.description} (${formatVND(data.amount)})`;
      } catch (e) {}
    }

    await db.batch([
      db.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id),
      logAction(db, 'DELETE', detail)
    ]);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('DELETE /api/data error:', error);
    return new Response(JSON.stringify({ error: 'Delete failed' }), { status: 500 });
  }
}

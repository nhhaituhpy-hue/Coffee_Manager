function checkAuth(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
  }
  const pin = authHeader.split('Bearer ')[1];
  return pin === env.ADMIN_PIN;
}

export async function onRequestGet(context) {
  try {
    if (!checkAuth(context.request, context.env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const db = context.env.DB;
    
    // Ensure table exists (for first run)
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS store_data (
        id TEXT PRIMARY KEY,
        json_data TEXT
      )
    `).run();

    const result = await db.prepare("SELECT json_data FROM store_data WHERE id = 'app_data'").first();
    
    if (result && result.json_data) {
      return new Response(result.json_data, {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    return new Response(JSON.stringify({}), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    if (!checkAuth(context.request, context.env)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const db = context.env.DB;
    const body = await context.request.text();
    
    // Ensure table exists
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS store_data (
        id TEXT PRIMARY KEY,
        json_data TEXT
      )
    `).run();
    
    // Upsert into D1
    await db.prepare(`
      INSERT INTO store_data (id, json_data) 
      VALUES ('app_data', ?) 
      ON CONFLICT(id) DO UPDATE SET json_data = excluded.json_data
    `).bind(body).run();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

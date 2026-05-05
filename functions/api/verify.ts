export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const pin = body.pin;
    
    if (!pin) {
        return new Response(JSON.stringify({ success: false, message: 'Missing PIN' }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    if (pin === context.env.ADMIN_PIN) {
        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });
    } else {
        return new Response(JSON.stringify({ success: false, message: 'Invalid PIN' }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

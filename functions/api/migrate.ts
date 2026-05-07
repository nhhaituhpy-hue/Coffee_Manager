// File di chuyển dữ liệu đã được vô hiệu hóa.
// Bạn hãy xóa file này khỏi thư mục functions/api/migrate.ts
export async function onRequestPost() {
  return new Response("Migration endpoint disabled", { status: 404 });
}

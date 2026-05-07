// src/utils/pdfFontLoader.ts
// Load font từ local assets (bundled bởi Vite) — không phụ thuộc CDN, hoạt động offline
import regularFontUrl from '../assets/fonts/BeVietnamPro-Regular.ttf?url';
import boldFontUrl from '../assets/fonts/BeVietnamPro-Bold.ttf?url';

let cachedRegular: string | null = null;
let cachedBold: string | null = null;

async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font load failed: ${url}`);
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  // chunk 8192 bytes để tránh stack overflow với buffer lớn
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return btoa(binary);
}

export async function loadVietnameseFont(): Promise<string> {
  if (!cachedRegular) cachedRegular = await urlToBase64(regularFontUrl);
  return cachedRegular;
}

export async function loadVietnameseFontBold(): Promise<string> {
  if (!cachedBold) cachedBold = await urlToBase64(boldFontUrl);
  return cachedBold;
}

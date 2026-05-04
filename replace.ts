import fs from 'fs';
import path from 'path';

function walkDir(dir: string, callback: (path: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(/bg-white/g, 'bg-surface');
    content = content.replace(/bg-slate-50\b/g, 'bg-surface-container');
    content = content.replace(/bg-slate-100\b/g, 'bg-surface-container-high');
    content = content.replace(/bg-slate-200\b/g, 'bg-surface-container-highest');
    content = content.replace(/text-slate-400\b/g, 'text-outline');
    content = content.replace(/text-slate-500\b/g, 'text-outline');
    content = content.replace(/text-slate-600\b/g, 'text-on-surface-variant');
    content = content.replace(/text-slate-900\b/g, 'text-on-surface');
    content = content.replace(/bg-slate-900\b/g, 'bg-surface-container-highest');
    fs.writeFileSync(filePath, content, 'utf-8');
  }
});

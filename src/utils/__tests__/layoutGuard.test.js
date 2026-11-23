import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const SRC_DIR = path.resolve(process.cwd(), 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const INDEX_CSS_PATH = path.join(SRC_DIR, 'index.css');

/**
 * 遞迴收集 src/components 下所有非測試用的 JSX 元件檔案
 */
function collectComponentFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === '__tests__') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectComponentFiles(fullPath));
    } else if (entry.name.endsWith('.jsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * 擷取 JSX 中所有靜態或樣板字串的 className 內容
 */
function extractClassStrings(source) {
  const matches = [];
  const patterns = [/className="([^"]+)"/g, /className=\{\s*`([^`]+)`\s*\}/g];
  for (const regex of patterns) {
    let match = regex.exec(source);
    while (match) {
      matches.push(match[1]);
      match = regex.exec(source);
    }
  }
  return matches;
}

describe('全站響應式與定位排版防呆靜態守門 (Layout Guardrails)', () => {
  const componentFiles = collectComponentFiles(COMPONENTS_DIR);
  const indexCss = fs.readFileSync(INDEX_CSS_PATH, 'utf8');

  it('禁止任何 fixed 抽屜或彈窗使用 h-screen / 100vh（防止手機網址列導致底部按鈕被裁切）', () => {
    const violations = [];
    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      for (const cls of extractClassStrings(content)) {
        const tokens = cls.split(/\s+/);
        const hasFixed = tokens.includes('fixed');
        const hasStaticVh = tokens.some((t) => t === 'h-screen' || t === 'h-[100vh]');
        if (hasFixed && hasStaticVh) {
          violations.push(`${path.relative(SRC_DIR, file)}: "${cls}"`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('index.css 中的 [data-lenis-prevent] 必須保留 overscroll-behavior: contain 且禁止使用 overflow: clip/hidden', () => {
    const blockMatch = indexCss.match(/\.lenis\.lenis-smooth\s+\[data-lenis-prevent\]\s*\{([^}]+)\}/);
    expect(blockMatch).not.toBeNull();
    const blockBody = blockMatch[1];
    expect(blockBody).toMatch(/overscroll-behavior\s*:\s*contain/);
    expect(blockBody).not.toMatch(/overflow\s*:\s*(clip|hidden)/);
  });

  it('禁止同一元素同時套用 fixed 與 optical-surface（防止 optical-surface 的 position: relative 覆蓋定位）', () => {
    const violations = [];
    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      for (const cls of extractClassStrings(content)) {
        const tokens = cls.split(/\s+/);
        if (tokens.includes('fixed') && tokens.includes('optical-surface')) {
          violations.push(`${path.relative(SRC_DIR, file)}: "${cls}"`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('禁止在 optical-surface 外層直接寫 overflow-hidden 或 overflow-clip（避免裁切 3D 玻璃斷面）', () => {
    const violations = [];
    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      for (const cls of extractClassStrings(content)) {
        const tokens = cls.split(/\s+/);
        const isOptical = tokens.includes('optical-surface');
        const clipsBevel = tokens.includes('overflow-hidden') || tokens.includes('overflow-clip');
        if (isOptical && clipsBevel) {
          violations.push(`${path.relative(SRC_DIR, file)}: "${cls}"`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('所有行動抽屜與彈窗元件（含 data-lenis-prevent）皆須具備 overflow-y-auto 以支援小螢幕捲動', () => {
    const violations = [];
    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('data-lenis-prevent') && !content.includes('overflow-y-auto')) {
        violations.push(path.relative(SRC_DIR, file));
      }
    }
    expect(violations).toEqual([]);
  });
});

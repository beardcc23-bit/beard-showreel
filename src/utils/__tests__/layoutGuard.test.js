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
 * 擷取 JSX 中所有靜態字串、跨行樣板字串（含 ${...} 條件分支內字串片段）與三元表達式的 className 內容
 */
export function extractClassStrings(source) {
  const results = [];

  // 1. 靜態雙引號與單引號 className="..." / className='...'
  for (const regex of [/className="([^"]+)"/g, /className='([^']+)'/g]) {
    let match = regex.exec(source);
    while (match) {
      results.push(match[1]);
      match = regex.exec(source);
    }
  }

  // 2. 動態大括號表達式 className={...}（支援巢狀一層大括號以解析樣板字串內的 ${...} 與跨行三元表達式）
  const exprRegex = /className=\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
  let exprMatch = exprRegex.exec(source);
  while (exprMatch) {
    const expr = exprMatch[1].trim();
    if (expr.startsWith('`') && expr.endsWith('`')) {
      const inner = expr.slice(1, -1);
      // 將 ${...} 插值內的引號字串字面量展開為空白分隔 token，再與外層靜態樣板文字合併
      const flattened = inner.replace(/\$\{([^}]*)\}/g, (_all, interp) => {
        const quoted = [];
        const litRegex = /'([^']*)'|"([^"]*)"/g;
        let lm = litRegex.exec(interp);
        while (lm) {
          quoted.push(lm[1] ?? lm[2]);
          lm = litRegex.exec(interp);
        }
        return ` ${quoted.join(' ')} `;
      });
      results.push(flattened.trim());
    } else {
      // 純三元或邏輯表達式 className={cond ? 'fixed h-screen' : 'hidden'}：逐一檢查各引號分支與整體合併
      const quoted = [];
      const litRegex = /'([^']*)'|"([^"]*)"/g;
      let lm = litRegex.exec(expr);
      while (lm) {
        const val = lm[1] ?? lm[2];
        if (val) {
          results.push(val);
          quoted.push(val);
        }
        lm = litRegex.exec(expr);
      }
      if (quoted.length > 1) {
        results.push(quoted.join(' '));
      }
    }
    exprMatch = exprRegex.exec(source);
  }

  return results;
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

  it('extractClassStrings 應能穿透解析樣板插值與跨行三元條件內的違規 class token', () => {
    const sample = `
      <div className={\`z-50 \${isOpen ? 'fixed h-screen' : 'hidden'}\`} />
      <aside className={
        active
          ? 'fixed optical-surface p-4'
          : 'relative'
      } />
    `;
    const extracted = extractClassStrings(sample);
    const hasFixedVh = extracted.some((cls) => {
      const t = cls.split(/\s+/);
      return t.includes('fixed') && t.includes('h-screen');
    });
    const hasFixedOptical = extracted.some((cls) => {
      const t = cls.split(/\s+/);
      return t.includes('fixed') && t.includes('optical-surface');
    });
    expect(hasFixedVh).toBe(true);
    expect(hasFixedOptical).toBe(true);
  });
});

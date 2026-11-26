import React from 'react';

/**
 * 全站與動態 Chunk 安全錯誤邊界（防止版本部署瞬間舊 Hash 動態載入失敗造成整頁白屏死當）
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // 若為部署換版導致動態 import chunk 404，於每工作階段自動嘗試重整一次載入新版索引
    const msg = String(error?.message || '');
    const isChunkError =
      /Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(
        msg
      );
    if (isChunkError && typeof window !== 'undefined') {
      try {
        const reloadKey = 'ag_chunk_reload_ts';
        const lastReload = Number(sessionStorage.getItem(reloadKey) || 0);
        if (Date.now() - lastReload > 15000) {
          sessionStorage.setItem(reloadKey, String(Date.now()));
          window.location.reload();
        }
      } catch {
        // 忽略無痕限制
      }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.minimal) return null;
      return (
        <div className="min-h-[100dvh] bg-[#030407] text-[#F2F5F8] flex flex-col items-center justify-center px-6 text-center">
          <p className="text-sm text-zinc-300 tracking-wider mb-6">
            頁面版本已更新，請重新載入以檢視最新內容。
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="spectral-cta px-7 py-3 text-xs tracking-[0.2em] cursor-pointer"
          >
            重新載入
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

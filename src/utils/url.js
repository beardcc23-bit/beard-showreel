const ALLOWED_EXTERNAL_HOSTS = new Set([
  'www.youtube.com',
  'youtu.be',
  'www.facebook.com',
  'web.facebook.com',
  'fb.watch',
  'www.instagram.com',
]);

/**
 * 驗證同源站內圖片路徑（白名單副檔名，阻斷協議相對路徑 //、反斜線與目錄遍歷 ..）
 */
export function isSafeLocalImageUrl(imageUrl) {
  if (typeof imageUrl !== 'string' || !imageUrl) return false;
  if (imageUrl.includes('..') || imageUrl.includes('\\')) return false;
  return /^\/(?!\/)[\w/.-]+\.(?:webp|png|jpe?g)$/i.test(imageUrl);
}

/**
 * 驗證並正規化外部 HTTPS 網址（嚴格比對協定與白名單網域）；不合法回傳 null。
 */
export function getSafeExternalUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== 'https:' ||
      !ALLOWED_EXTERNAL_HOSTS.has(parsed.hostname.toLowerCase())
    ) {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * 安全開啟外部 HTTPS 連結：僅於新分頁開啟並啟用 noopener,noreferrer。
 * 注意：HTML 規範中帶 noopener 的 window.open() 即使成功開新分頁亦會回傳 null，
 * 故禁止於回傳 null 時以 window.location.assign 覆寫當前原分頁。
 */
export function openSafeExternalUrl(url) {
  const safeHref = getSafeExternalUrl(url);
  if (!safeHref) {
    return false;
  }
  const newWindow = window.open(safeHref, '_blank', 'noopener,noreferrer');
  if (newWindow) {
    newWindow.opener = null;
  }
  return true;
}

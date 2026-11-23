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
 * 安全開啟外部 HTTPS 連結：以 URL 解析器嚴格比對協定與允許網域白名單，
 * 強制啟用 noopener,noreferrer 阻斷逆向 Tabnabbing，並於新分頁受阻時安全降級跳轉。
 */
export function openSafeExternalUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== 'https:' ||
      !ALLOWED_EXTERNAL_HOSTS.has(parsed.hostname.toLowerCase())
    ) {
      return false;
    }
    const newWindow = window.open(parsed.href, '_blank', 'noopener,noreferrer');
    if (newWindow) {
      newWindow.opener = null;
    } else {
      window.location.assign(parsed.href);
    }
    return true;
  } catch {
    return false;
  }
}

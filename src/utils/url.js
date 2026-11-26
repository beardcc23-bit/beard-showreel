const ALLOWED_EXTERNAL_HOSTS = new Set([
  'www.youtube.com',
  'youtu.be',
  'www.facebook.com',
  'web.facebook.com',
  'fb.watch',
  'www.instagram.com',
]);

const FACEBOOK_VIDEO_HOSTS = new Set([
  'www.facebook.com',
  'web.facebook.com',
  'facebook.com',
  'fb.watch',
]);

/**
 * 驗證同源站內圖片路徑（白名單副檔名與選配快取版本號，阻斷協議相對路徑 //、反斜線、超長字串與目錄遍歷 ..）
 */
export function isSafeLocalImageUrl(imageUrl) {
  if (typeof imageUrl !== 'string' || !imageUrl || imageUrl.length > 256) return false;
  if (imageUrl.includes('..') || imageUrl.includes('\\')) return false;
  return /^\/(?!\/)[\w/.-]+\.(?:webp|png|jpe?g)(?:\?v=[\w-]+)?$/i.test(imageUrl);
}

/**
 * 驗證並正規化外部 HTTPS 網址（嚴格比對協定、阻斷帳密偽裝與白名單網域）；不合法回傳 null。
 */
export function getSafeExternalUrl(url) {
  if (!url || typeof url !== 'string' || url.length > 512) {
    return null;
  }
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== 'https:' ||
      parsed.username ||
      parsed.password ||
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
 * 驗證並正規化可內嵌於 Modal 的 Facebook HTTPS 影片網址；不合法回傳空字串。
 */
export function getSafeFacebookVideoUrl(url) {
  if (!url || typeof url !== 'string' || url.length > 512) {
    return '';
  }
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== 'https:' ||
      parsed.username ||
      parsed.password ||
      !FACEBOOK_VIDEO_HOSTS.has(parsed.hostname.toLowerCase())
    ) {
      return '';
    }
    return parsed.href;
  } catch {
    return '';
  }
}

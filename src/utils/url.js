/**
 * 安全開啟外部 HTTPS 連結，強制啟用 noopener,noreferrer 阻斷逆向 Tabnabbing，
 * 並於行動端內嵌瀏覽器阻擋新分頁時安全降級跳轉。
 */
export function openSafeExternalUrl(url) {
  if (!url || typeof url !== 'string' || !/^https:\/\//i.test(url)) {
    return false;
  }
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) {
    newWindow.opener = null;
  } else {
    window.location.href = url;
  }
  return true;
}

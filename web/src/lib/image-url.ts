/**
 * Ảnh Google Maps (`lh3.googleusercontent.com/...=w1920-h1080-k-no`) cho phép đổi kích thước qua hậu tố URL.
 * Thumbnail chỉ cần vài trăm px — tải bản 1920px làm trang nặng gấp nhiều lần.
 */
export function resizeGoogleImage(url: string | null | undefined, width: number, height: number): string | null {
  if (!url) return null;
  if (!/googleusercontent\.com\//.test(url)) return url;
  return url.replace(/=w\d+-h\d+(-[a-z0-9-]+)?$/i, `=w${width}-h${height}-k-no`);
}

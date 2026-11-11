/**
 * Tag cache dùng chung cho mọi query đọc dữ liệu quán (`"use cache"` + `cacheTag`).
 * Gọi `POST /api/revalidate` để đánh dấu toàn bộ dữ liệu gắn tag này là cũ sau khi cập nhật DB.
 */
export const CACHE_TAG_CAFES = "cafes";

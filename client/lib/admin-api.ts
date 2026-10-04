import { siteSchema, type SiteContent } from '@shared/site-content';
let endpoint = '';
export async function configureAdmin() {
  const response = await fetch('/admin-config.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Админка ещё не подключена. Обратитесь к владельцу сайта.');
  const config = await response.json();
  if (!config.apiUrl || !/^https:\/\//.test(config.apiUrl)) throw new Error('Админка ещё не подключена. Обратитесь к владельцу сайта.');
  endpoint = config.apiUrl.replace(/\/$/, '');
}
export class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }
export async function api(path: string, token: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', 'Bearer ' + token);
  const response = await fetch(endpoint + path, { ...init, headers, credentials: 'omit' });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(body.error || 'Не удалось сохранить изменения. Попробуйте ещё раз.', response.status);
  return body;
}
export async function login(username: string, password: string) {
  return api('/session', '', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({username,password}) });
}
export async function getContent(token: string): Promise<{content: SiteContent; sha: string}> {
  const result = await api('/content', token);
  return {content: siteSchema.parse(result.content), sha: result.sha};
}
export async function compressImage(file: File): Promise<Blob> {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Выберите фотографию JPG, PNG или WebP. Фото HEIC сначала экспортируйте в JPG.');
  if (file.size > 30 * 1024 * 1024) throw new Error('Фотография слишком большая. Максимум 30 МБ.');
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [.85,.72,.58]) {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', quality));
      if (blob && blob.size <= 900000) return blob;
    }
    throw new Error('Не удалось уменьшить фотографию. Выберите снимок меньшего размера.');
  } finally { bitmap.close(); }
}


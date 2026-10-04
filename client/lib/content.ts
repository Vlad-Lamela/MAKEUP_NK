import { siteSchema, type SiteContent } from '@shared/site-content';
export async function loadContent(): Promise<SiteContent> {
  const response = await fetch('/content/site.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error('Не удалось загрузить страницу. Попробуйте ещё раз.');
  return siteSchema.parse(await response.json());
}

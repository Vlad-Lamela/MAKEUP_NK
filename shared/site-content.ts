import { z } from 'zod';
const text = (max: number) => z.string().trim().max(max);
const link = z.string().url().max(2000).refine(v => v.startsWith('https://'), 'Нужна ссылка https://');
const image = z.string().max(2000).refine(v => /^\/media\/[a-zA-Z0-9._-]+$/.test(v) || v.startsWith('https://'), 'Выберите фотографию');
export const siteSchema = z.object({
  version: z.literal(1), publishedId: text(80),
  hero: z.object({ title: text(100).min(1), subtitle: text(240), image, imageAlt: text(160) }),
  about: z.object({ title: text(100), text: text(1600), image, quote: text(240) }),
  offerings: z.array(z.object({ id: z.enum(['makeup','hair','training']), title: text(80), description: text(240), image, tile: z.number().int().min(0).max(8).optional() })).length(3),
  contacts: z.object({ phone: text(40), city: text(80), address: text(240), booking: link, vk: link, telegram: link, max: link, instagram: link, portfolio: link }),
  services: z.array(z.object({ id: text(80).regex(/^[a-zA-Z0-9-]+$/), title: text(100).min(1), description: text(700), price: z.number().int().min(0).max(1000000).nullable(), group: z.enum(['makeup','hair','training']), visible: z.boolean(), image })).max(30),
  gallery: z.array(z.object({ id: text(80).regex(/^[a-zA-Z0-9-]+$/), image, caption: text(160), category: z.enum(['makeup', 'hair', 'look']), tile: z.number().int().min(0).max(8).optional(), visible: z.boolean() })).max(100),
}).superRefine((data, ctx) => {
  for (const name of ['services', 'gallery', 'offerings'] as const) if (new Set(data[name].map(item => item.id)).size !== data[name].length) ctx.addIssue({ code: 'custom', path: [name], message: 'Повторяющиеся карточки' });
});
export type SiteContent = z.infer<typeof siteSchema>;
export const categories = { makeup: 'Макияж', hair: 'Причёски', look: 'Образы' } as const;
export const serviceGroups = { makeup: 'Макияж', hair: 'Причёски', training: 'Обучение' } as const;

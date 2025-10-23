export type UtmSource =
  | "vk_main"
  | "wa_booking"
  | "vk_dm"
  | "tg_booking"
  | "ig_profile";

export function withUtm(
  url: string,
  source: UtmSource,
  campaign = "landing",
  medium = "button"
): string {
  try {
    const u = new URL(url);
    if (!u.searchParams.has("utm_source")) u.searchParams.set("utm_source", source);
    if (!u.searchParams.has("utm_medium")) u.searchParams.set("utm_medium", medium);
    if (!u.searchParams.has("utm_campaign")) u.searchParams.set("utm_campaign", campaign);
    return u.toString();
  } catch {
    // на случай, если передали не-URL
    return url;
  }
}

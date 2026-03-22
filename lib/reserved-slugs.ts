/** Slugs that cannot be used as organizer public URL segment (static app routes). */
export const RESERVED_ORGANIZER_SLUGS = new Set([
  "api",
  "cadastro",
  "login",
  "painel",
  "register",
  "auth",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

export const isReservedOrganizerSlug = (slug: string) =>
  RESERVED_ORGANIZER_SLUGS.has(slug.toLowerCase());

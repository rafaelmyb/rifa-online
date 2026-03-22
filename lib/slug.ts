const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const normalizeSlug = (raw: string) =>
  raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const isValidSlug = (slug: string) =>
  slug.length >= 2 &&
  slug.length <= 60 &&
  SLUG_REGEX.test(slug);

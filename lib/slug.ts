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

const MAX_RAFFLE_SLUG_LEN = 60;

/** Slug for URL from raffle title at creation time (lowercase, hyphens). */
export const raffleSlugFromTitle = (title: string) =>
  normalizeSlug(title).slice(0, MAX_RAFFLE_SLUG_LEN).replace(/-+$/g, "");

/**
 * Next candidate when `slug` is taken: `base-2`, `base-3`, … keeping length ≤ 60.
 */
export const nextRaffleSlugCandidate = (base: string, counter: number) => {
  const suf = `-${counter}`;
  const maxStem = MAX_RAFFLE_SLUG_LEN - suf.length;
  let stem = base.slice(0, Math.max(0, maxStem)).replace(/-+$/g, "");
  if (stem.length < 1) stem = "rifa";
  return `${stem}${suf}`.slice(0, MAX_RAFFLE_SLUG_LEN).replace(/-+$/g, "");
};

/** Digits only, max 11 (DDD + celular). */
export const digitsFromPhoneInput = (raw: string) =>
  raw.replace(/\D/g, "").slice(0, 11);

/**
 * Máscara ao digitar: (XX) XXXXX-XXXX se o 3º dígito (após DDD) for 9 (celular),
 * senão (XX) XXXX-XXXX (fixo).
 */
export const formatBrazilPhoneAsYouType = (raw: string): string => {
  const d = digitsFromPhoneInput(raw);
  if (d.length === 0) return "";
  const dd = d.slice(0, 2);
  const rest = d.slice(2);
  if (d.length <= 2) return `(${dd}`;
  if (d.length <= 6) return `(${dd}) ${rest}`;

  const mobile = rest[0] === "9";
  if (mobile) {
    const a = rest.slice(0, 5);
    const b = rest.slice(5, 9);
    if (rest.length <= 5) return `(${dd}) ${a}`;
    return `(${dd}) ${a}-${b}`;
  }

  const a = rest.slice(0, 4);
  const b = rest.slice(4, 8);
  if (rest.length <= 4) return `(${dd}) ${a}`;
  return `(${dd}) ${a}-${b}`;
};

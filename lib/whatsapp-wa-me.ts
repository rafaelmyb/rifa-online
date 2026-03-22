import { digitsFromPhoneInput } from "@/lib/brazil-phone";

/** `https://wa.me/...` para WhatsApp Web/App; retorna `null` se não houver número utilizável. */
export const buildWaMeHref = (storedDigitsOrRaw: string): string | null => {
  const d = digitsFromPhoneInput(storedDigitsOrRaw);
  if (d.length < 10) return null;

  let international = d;
  if (!d.startsWith("55")) {
    if (d.length !== 10 && d.length !== 11) return null;
    international = `55${d}`;
  }

  return `https://wa.me/${international}`;
};

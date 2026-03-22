import { z } from "zod";
import { digitsFromPhoneInput } from "@/lib/brazil-phone";

export const purchaseFormSchema = z.object({
  buyerName: z
    .string()
    .trim()
    .min(3, "Informe o nome completo."),
  buyerPhone: z
    .string()
    .trim()
    .superRefine((val, ctx) => {
      const digits = digitsFromPhoneInput(val);
      if (digits.length < 10 || digits.length > 11) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe um telefone com DDD (10 ou 11 dígitos).",
        });
      }
    }),
  selectedNumbers: z
    .array(z.number().int().positive())
    .min(1, "Selecione ao menos um número."),
});

export type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;

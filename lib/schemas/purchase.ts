import { z } from "zod";

export const purchaseFormSchema = z.object({
  buyerName: z
    .string()
    .trim()
    .min(3, "Informe o nome completo."),
  buyerPhone: z
    .string()
    .trim()
    .min(10, "Informe um telefone válido."),
  selectedNumbers: z
    .array(z.number().int().positive())
    .min(1, "Selecione ao menos um número."),
});

export type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;

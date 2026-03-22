"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createRaffle } from "@/lib/actions/raffle-crud";
import {
  digitsFromPhoneInput,
  formatBrazilPhoneAsYouType,
} from "@/lib/brazil-phone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    title: z.string().min(2, "Título obrigatório"),
    priceReais: z
      .string()
      .min(1, "Informe o preço")
      .transform((s) => Number(s.replace(",", ".")))
      .refine((n) => Number.isFinite(n) && n > 0, "Preço inválido"),
    totalNumbers: z
      .string()
      .min(1, "Informe a quantidade")
      .transform((s) => parseInt(s, 10))
      .refine(
        (n) => Number.isInteger(n) && n >= 1 && n <= 10000,
        "Quantidade entre 1 e 10.000",
      ),
    pixKey: z.string().min(1, "Chave PIX obrigatória"),
    whatsappPhone: z.string(),
    status: z.enum(["DRAFT", "PUBLISHED"]),
  })
  .superRefine((data, ctx) => {
    const d = digitsFromPhoneInput(data.whatsappPhone);
    if (d.length < 10 || d.length > 11) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o WhatsApp com DDD (10 ou 11 dígitos).",
        path: ["whatsappPhone"],
      });
    }
  });

type FormInputValues = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

const emptyDefaults: FormInputValues = {
  title: "",
  priceReais: "",
  totalNumbers: "",
  pixKey: "",
  whatsappPhone: "",
  status: "DRAFT",
};

export const CreateRaffleForm = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const form = useForm<FormInputValues, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults,
  });

  const { reset } = form;
  useEffect(() => {
    if (pathname === "/painel/rifas/nova") {
      reset(emptyDefaults);
    }
  }, [pathname, reset]);

  const onSubmit = form.handleSubmit(async (data) => {
    setLoading(true);
    try {
      const priceCents = Math.round(data.priceReais * 100);
      const id = await createRaffle({
        title: data.title,
        priceCents,
        totalNumbers: data.totalNumbers,
        pixKey: data.pixKey,
        whatsappPhone: data.whatsappPhone,
        status: data.status,
      });
      toast.success("Rifa criada");
      router.push(`/painel/rifas/${id}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao criar rifa");
    } finally {
      setLoading(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" {...form.register("title")} />
        {form.formState.errors.title && (
          <p className="text-destructive text-sm">
            {form.formState.errors.title.message}
          </p>
        )}
        <p className="text-muted-foreground text-xs leading-relaxed">
          O link público da rifa será gerado a partir do título (minúsculas e
          hífens entre as palavras). Esse link não muda se você editar o título
          depois.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="priceReais">Preço por número (R$)</Label>
          <Input
            id="priceReais"
            type="number"
            step="0.01"
            placeholder="0,00"
            {...form.register("priceReais")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalNumbers">Quantidade de números</Label>
          <Input
            id="totalNumbers"
            type="number"
            placeholder="0"
            min={1}
            max={10000}
            {...form.register("totalNumbers")}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="pixKey">Chave PIX</Label>
        <Input id="pixKey" {...form.register("pixKey")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatsappPhone">WhatsApp (comprovante)</Label>
        <Controller
          control={form.control}
          name="whatsappPhone"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              id="whatsappPhone"
              ref={ref}
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="(00) 00000-0000"
              value={value}
              onBlur={onBlur}
              onChange={(e) => {
                onChange(formatBrazilPhoneAsYouType(e.target.value));
              }}
            />
          )}
        />
        {form.formState.errors.whatsappPhone && (
          <p className="text-destructive text-sm">
            {form.formState.errors.whatsappPhone.message}
          </p>
        )}
        <p className="text-muted-foreground text-xs">
          Número em que o comprador enviará o comprovante do PIX.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none"
          {...form.register("status")}
        >
          <option value="PUBLISHED">Publicada</option>
          <option value="DRAFT">Rascunho</option>
        </select>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Salvando…" : "Criar rifa"}
      </Button>
    </form>
  );
};

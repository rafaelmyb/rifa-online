"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updateRaffle } from "@/lib/actions/raffle-crud";
import {
  digitsFromPhoneInput,
  formatBrazilPhoneAsYouType,
} from "@/lib/brazil-phone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    title: z.string().min(2, "Título obrigatório"),
    pixKey: z.string().min(1, "Chave PIX obrigatória"),
    whatsappPhone: z.string(),
    status: z.enum(["DRAFT", "PUBLISHED"]),
  })
  .superRefine((data, ctx) => {
    const d = digitsFromPhoneInput(data.whatsappPhone);
    if (d.length > 0 && (d.length < 10 || d.length > 11)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "WhatsApp: 10 ou 11 dígitos, ou deixe vazio.",
        path: ["whatsappPhone"],
      });
    }
  });

type FormValues = z.infer<typeof schema>;

type EditRaffleFormProps = {
  raffleId: string;
  defaultValues: FormValues;
  /** When false, hide "Rascunho" if current status is published (there are reservations). */
  allowDraftStatus: boolean;
};

export const EditRaffleForm = ({
  raffleId,
  defaultValues,
  allowDraftStatus,
}: EditRaffleFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const status = form.watch("status");
  const showDraftOption = allowDraftStatus || status === "DRAFT";

  const onSubmit = form.handleSubmit(async (data) => {
    if (!showDraftOption && data.status === "DRAFT") {
      toast.error("Não é possível voltar para rascunho com pedidos existentes.");
      return;
    }
    setLoading(true);
    try {
      await updateRaffle(raffleId, {
        title: data.title,
        pixKey: data.pixKey,
        whatsappPhone: data.whatsappPhone,
        status: data.status,
      });
      toast.success("Rifa atualizada");
      router.push("/painel/rifas");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-title">Título</Label>
        <Input id="edit-title" {...form.register("title")} />
        {form.formState.errors.title && (
          <p className="text-destructive text-sm">
            {form.formState.errors.title.message}
          </p>
        )}
        <p className="text-muted-foreground text-xs leading-relaxed">
          O link público da rifa não muda ao editar o título.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-pixKey">Chave PIX</Label>
        <Input id="edit-pixKey" {...form.register("pixKey")} />
        {form.formState.errors.pixKey && (
          <p className="text-destructive text-sm">
            {form.formState.errors.pixKey.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-whatsappPhone">WhatsApp (comprovante)</Label>
        <Controller
          control={form.control}
          name="whatsappPhone"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              id="edit-whatsappPhone"
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
          Opcional até preencher; usado na página de confirmação do comprador com
          link para o WhatsApp.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-status">Status</Label>
        <select
          id="edit-status"
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none"
          {...form.register("status")}
        >
          <option value="PUBLISHED">Publicada</option>
          {showDraftOption && <option value="DRAFT">Rascunho</option>}
        </select>
        {!allowDraftStatus && status === "PUBLISHED" && (
          <p className="text-muted-foreground text-xs">
            Rascunho fica indisponível enquanto houver pedidos nesta rifa.
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando…" : "Salvar alterações"}
        </Button>
        <Link
          href="/painel/rifas"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
};

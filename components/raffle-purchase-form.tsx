"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { createPurchase } from "@/lib/actions/purchase";
import {
  purchaseFormSchema,
  type PurchaseFormValues,
} from "@/lib/schemas/purchase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RaffleNumberGrid } from "@/components/raffle-number-grid";
import { formatBrazilPhoneAsYouType } from "@/lib/brazil-phone";

type NumberRow = { value: number; status: "AVAILABLE" | "HELD" | "SOLD" };

type RafflePurchaseFormProps = {
  raffleId: string;
  organizerSlug: string;
  raffleSlug: string;
  title: string;
  priceCents: number;
  numbers: NumberRow[];
};

export const RafflePurchaseForm = ({
  raffleId,
  organizerSlug,
  raffleSlug,
  title,
  priceCents,
  numbers,
}: RafflePurchaseFormProps) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      buyerName: "",
      buyerPhone: "",
      selectedNumbers: [],
    },
    mode: "onChange",
  });

  const selectedArr = useWatch({
    control: form.control,
    name: "selectedNumbers",
  });

  const selectedSet = useMemo(() => new Set(selectedArr ?? []), [selectedArr]);

  const toggleNumber = (value: number) => {
    const current = form.getValues("selectedNumbers");
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value].sort((a, b) => a - b);
    form.setValue("selectedNumbers", next, { shouldValidate: true });
  };

  const totalCents = (selectedArr?.length ?? 0) * priceCents;
  const isValid = form.formState.isValid;

  const onSubmit = form.handleSubmit(async (data) => {
    setSubmitting(true);
    try {
      const result = await createPurchase(
        raffleId,
        data.buyerName,
        data.buyerPhone,
        data.selectedNumbers,
      );
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.push(
        `/${organizerSlug}/${raffleSlug}/obrigado?pedido=${result.reservationId}`,
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {(priceCents / 100).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}{" "}
          por número
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="buyerName">Nome completo</Label>
          <Input
            id="buyerName"
            autoComplete="name"
            {...form.register("buyerName")}
          />
          {form.formState.errors.buyerName && (
            <p className="text-destructive text-sm">
              {form.formState.errors.buyerName.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="buyerPhone">Telefone</Label>
          <Controller
            control={form.control}
            name="buyerPhone"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Input
                id="buyerPhone"
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
          {form.formState.errors.buyerPhone && (
            <p className="text-destructive text-sm">
              {form.formState.errors.buyerPhone.message}
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Escolha seus números</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RaffleNumberGrid
            numbers={numbers}
            selected={selectedSet}
            onToggle={toggleNumber}
          />
          {form.formState.errors.selectedNumbers && (
            <p className="text-destructive text-sm">
              {form.formState.errors.selectedNumbers.message}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-2 rounded-lg border border-border bg-card/50 p-4">
        <p className="text-sm font-medium">Números selecionados</p>
        {(selectedArr?.length ?? 0) === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum ainda.</p>
        ) : (
          <p className="text-sm">{selectedArr!.join(", ")}</p>
        )}
        <p className="text-lg font-semibold">
          Total:{" "}
          {(totalCents / 100).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
        disabled={!isValid || submitting}
      >
        {submitting ? "Processando…" : "Confirmar reserva"}
      </Button>
    </form>
  );
};

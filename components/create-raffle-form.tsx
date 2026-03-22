"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createRaffle } from "@/lib/actions/raffle-crud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  title: z.string().min(2, "Título obrigatório"),
  slug: z.string().min(2, "Slug obrigatório"),
  priceReais: z.number().positive("Preço inválido"),
  totalNumbers: z.number().int().min(1).max(10000),
  pixKey: z.string().min(1, "Chave PIX obrigatória"),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

type FormValues = z.infer<typeof schema>;

export const CreateRaffleForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      slug: "",
      priceReais: 40,
      totalNumbers: 1000,
      pixKey: "69999657952",
      status: "PUBLISHED",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setLoading(true);
    try {
      const priceCents = Math.round(data.priceReais * 100);
      const id = await createRaffle({
        title: data.title,
        slug: data.slug,
        priceCents,
        totalNumbers: data.totalNumbers,
        pixKey: data.pixKey,
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
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL da rifa)</Label>
        <Input id="slug" placeholder="ex: rifa-moto" {...form.register("slug")} />
        {form.formState.errors.slug && (
          <p className="text-destructive text-sm">
            {form.formState.errors.slug.message}
          </p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="priceReais">Preço por número (R$)</Label>
          <Input
            id="priceReais"
            type="number"
            step="0.01"
            {...form.register("priceReais", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalNumbers">Quantidade de números</Label>
          <Input
            id="totalNumbers"
            type="number"
            {...form.register("totalNumbers", { valueAsNumber: true })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="pixKey">Chave PIX</Label>
        <Input id="pixKey" {...form.register("pixKey")} />
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

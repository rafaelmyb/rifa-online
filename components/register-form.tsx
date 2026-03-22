"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { registerOrganizer } from "@/lib/actions/raffle-crud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    email: z.string().email("E-mail inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirm: z.string(),
    organizerSlug: z.string().min(2, "Identificador obrigatório"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Senhas não conferem",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

export const RegisterForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      confirm: "",
      organizerSlug: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setLoading(true);
    try {
      await registerOrganizer({
        email: data.email,
        password: data.password,
        organizerSlug: data.organizerSlug,
      });
      const sign = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (sign?.error) {
        toast.success("Conta criada. Faça login.");
        router.push("/login");
        return;
      }
      router.push("/painel");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="text-destructive text-sm">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="organizerSlug">Identificador público (URL)</Label>
        <Input
          id="organizerSlug"
          placeholder="ex: minha-empresa"
          {...form.register("organizerSlug")}
        />
        <p className="text-muted-foreground text-xs">
          Seu painel público: /seu-identificador/nome-da-rifa
        </p>
        {form.formState.errors.organizerSlug && (
          <p className="text-destructive text-sm">
            {form.formState.errors.organizerSlug.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-destructive text-sm">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirmar senha</Label>
        <Input
          id="confirm"
          type="password"
          autoComplete="new-password"
          {...form.register("confirm")}
        />
        {form.formState.errors.confirm && (
          <p className="text-destructive text-sm">
            {form.formState.errors.confirm.message}
          </p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Criando…" : "Criar conta"}
      </Button>
    </form>
  );
};

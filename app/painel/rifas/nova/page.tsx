import Link from "next/link";
import { CreateRaffleForm } from "@/components/create-raffle-form";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

export default function NovaRifaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/painel/rifas"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          ← Voltar
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Nova rifa</h1>
      </div>
      <CreateRaffleForm />
    </div>
  );
}

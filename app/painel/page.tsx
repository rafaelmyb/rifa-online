import Link from "next/link";
import { auth } from "@/auth";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

export default async function PainelHomePage() {
  const session = await auth();
  const slug = session?.user?.organizerSlug;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Painel</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Seu identificador público:{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-foreground">
            {slug}
          </code>
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/painel/rifas"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Gerenciar rifas
        </Link>
      </div>
    </div>
  );
}

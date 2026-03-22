import Link from "next/link";
import { PageContainer } from "@/components/page-container";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center py-16">
      <PageContainer>
        <div className="mx-auto max-w-xl space-y-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Rifa online
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Plataforma para organizadores criarem rifas e compradores escolherem
            números com pagamento via PIX.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/demo/rifa-principal"
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
            >
              Ver rifa demo
            </Link>
            <Link
              href="/cadastro"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Criar conta
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
              )}
            >
              Entrar
            </Link>
          </div>
        </div>
      </PageContainer>
    </main>
  );
}

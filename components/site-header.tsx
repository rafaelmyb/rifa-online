import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { PageContainer } from "@/components/page-container";

export const SiteHeader = () => (
  <header className="border-b border-border bg-card/40 backdrop-blur-sm">
    <PageContainer>
      <div className="flex h-14 items-center justify-between gap-4">
        <Link href="/" className="font-semibold tracking-tight">
          Rifa online
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/cadastro"
            className="text-muted-foreground hover:text-foreground"
          >
            Cadastro
          </Link>
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground"
          >
            Entrar
          </Link>
          <Link
            href="/painel"
            className="text-muted-foreground hover:text-foreground"
          >
            Painel
          </Link>
          <ModeToggle />
        </nav>
      </div>
    </PageContainer>
  </header>
);

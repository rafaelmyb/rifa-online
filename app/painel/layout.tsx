import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { LogoutButton } from "@/components/logout-button";
import { PageContainer } from "@/components/page-container";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border bg-muted/30">
        <PageContainer>
          <div className="flex h-12 items-center justify-between gap-4">
            <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
              <Link href="/painel" className="hover:text-primary">
                Início
              </Link>
              <Link href="/painel/rifas" className="hover:text-primary">
                Minhas rifas
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground hidden max-w-[12rem] truncate text-xs sm:inline">
                {session.user.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </PageContainer>
      </div>
      <div className="flex-1 py-8">
        <PageContainer>{children}</PageContainer>
      </div>
    </div>
  );
}

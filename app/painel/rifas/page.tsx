import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CopyLinkButton } from "@/components/copy-link-button";
import { RaffleDeleteDialog } from "@/components/raffle-delete-dialog";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function PainelRifasPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const raffles = await prisma.raffle.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  const org = session.user.organizerSlug;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Minhas rifas</h1>
        <Link
          href="/painel/rifas/nova"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Nova rifa
        </Link>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Link público</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {raffles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  Nenhuma rifa. Crie a primeira.
                </TableCell>
              </TableRow>
            ) : (
              raffles.map((r) => {
                const url = `${base}/${org}/${r.slug}`;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell>
                      {r.status === "PUBLISHED" ? "Publicada" : "Rascunho"}
                    </TableCell>
                    <TableCell>
                      <div className="flex w-full flex-row items-center justify-between gap-2 sm:max-w-md">
                        <span className="text-muted-foreground truncate text-xs">
                          {url}
                        </span>
                        <CopyLinkButton url={url} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                        <Link
                          href={`/painel/rifas/${r.id}`}
                          className={cn(
                            buttonVariants({ variant: "link", size: "sm" }),
                            "h-auto p-0",
                          )}
                        >
                          Pedidos
                        </Link>
                        <Link
                          href={`/painel/rifas/${r.id}/editar`}
                          className={cn(
                            buttonVariants({ variant: "link", size: "sm" }),
                            "h-auto p-0",
                          )}
                        >
                          Editar
                        </Link>
                        <RaffleDeleteDialog raffleId={r.id} title={r.title} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

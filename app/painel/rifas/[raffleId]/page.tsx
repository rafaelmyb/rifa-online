import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ReservationsAdminList } from "@/components/reservations-admin-list";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

type PageProps = { params: Promise<{ raffleId: string }> };

const formatBrlFromCents = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default async function PainelRifaPedidosPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { raffleId } = await params;

  const raffle = await prisma.raffle.findFirst({
    where: { id: raffleId, userId: session.user.id },
  });
  if (!raffle) notFound();

  const reservations = await prisma.reservation.findMany({
    where: { raffleId },
    orderBy: { createdAt: "desc" },
    include: {
      numbers: { orderBy: { value: "asc" }, select: { value: true } },
    },
  });

  const collectedCents = reservations
    .filter((r) => r.status === "PAID")
    .reduce((sum, r) => sum + r.totalCents, 0);
  const provisionedCents = reservations.reduce(
    (sum, r) => sum + r.totalCents,
    0,
  );

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  const exportHref = `${base}/api/painel/rifas/${raffleId}/export`;

  const rows = reservations.map((r) => ({
    id: r.id,
    buyerName: r.buyerName,
    buyerPhone: r.buyerPhone,
    totalCents: r.totalCents,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    numbers: r.numbers.map((n) => n.value).join(", "),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/painel/rifas"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          ← Rifas
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          {raffle.title}
        </h1>
      </div>
      <p className="text-muted-foreground text-sm">
        Pedidos desta rifa. Confirme o PIX manualmente ou exclua pendentes para
        reliberar números.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-muted/40 rounded-lg border border-border px-4 py-3">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Provisionado (todos os pedidos)
          </p>
          <p className="text-foreground mt-1 text-lg font-semibold tabular-nums">
            {formatBrlFromCents(provisionedCents)}
          </p>
        </div>

        <div className="bg-muted/40 rounded-lg border border-border px-4 py-3">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Arrecadado (pagos confirmados)
          </p>
          <p className="text-foreground mt-1 text-lg font-semibold tabular-nums">
            {formatBrlFromCents(collectedCents)}
          </p>
        </div>
      </div>
      <ReservationsAdminList rows={rows} exportHref={exportHref} />
    </div>
  );
}

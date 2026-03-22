import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/page-container";
import { getReservationForThanksPage } from "@/lib/queries/reservation-thanks";
import { isReservedOrganizerSlug } from "@/lib/reserved-slugs";

type PageProps = {
  params: Promise<{ organizerSlug: string; raffleSlug: string }>;
  searchParams: Promise<{ pedido?: string }>;
};

export default async function ObrigadoPage({ params, searchParams }: PageProps) {
  const { organizerSlug, raffleSlug } = await params;
  const { pedido } = await searchParams;

  if (isReservedOrganizerSlug(organizerSlug) || !pedido) {
    notFound();
  }

  const data = await getReservationForThanksPage(
    pedido,
    organizerSlug,
    raffleSlug,
  );
  if (!data) {
    notFound();
  }

  return (
    <main className="flex-1 py-10">
      <PageContainer>
        <div className="mx-auto max-w-2xl space-y-6 text-center sm:text-left">
          <h1 className="text-2xl font-semibold tracking-tight">
            Compra realizada
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Obrigado, <span className="text-foreground">{data.buyerName}</span>.
            Seus números:{" "}
            <span className="text-foreground font-medium">
              {data.numbers.join(", ")}
            </span>
            . Total:{" "}
            {(data.totalCents / 100).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
            .
          </p>
          <div className="bg-card space-y-3 rounded-lg border border-border p-6 text-left">
            <p className="text-sm leading-relaxed">
              Faça o pagamento via <strong>PIX</strong> para a chave abaixo{" "}
              <strong>o quanto antes</strong>. Se não pagar logo em seguida,
              você pode perder os números adquiridos. Após o pagamento, o
              organizador confirmará e seus números ficarão definitivamente
              registrados.
            </p>
            <p className="font-mono text-lg font-semibold tracking-wide">
              {data.pixKey}
            </p>
          </div>
          <p className="text-muted-foreground text-sm">
            Obrigado pela ajuda! Deus te abençoe!
          </p>
          <Link
            href={`/${organizerSlug}/${raffleSlug}`}
            className="text-primary inline-block text-sm font-medium underline-offset-4 hover:underline"
          >
            Voltar à rifa
          </Link>
        </div>
      </PageContainer>
    </main>
  );
}

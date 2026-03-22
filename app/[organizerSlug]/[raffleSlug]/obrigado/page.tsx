import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { PageContainer } from "@/components/page-container";
import { PixKeyCopy } from "@/components/pix-key-copy";
import { getReservationForThanksPage } from "@/lib/queries/reservation-thanks";
import { isReservedOrganizerSlug } from "@/lib/reserved-slugs";

type PageProps = {
  params: Promise<{ organizerSlug: string; raffleSlug: string }>;
  searchParams: Promise<{ pedido?: string }>;
};

export default async function ObrigadoPage({
  params,
  searchParams,
}: PageProps) {
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
          <h1 className="flex flex-wrap items-center justify-center gap-2 text-2xl font-semibold tracking-tight sm:justify-start">
            <CircleCheck
              className="size-8 shrink-0 text-green-600 dark:text-green-500"
              aria-hidden
            />
            Reserva realizada
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
              Faça o pagamento via <strong>PIX</strong> para a chave abaixo.
              Após o pagamento, envie o comprovante pelo{" "}
              {data.waMeUrl && data.whatsappDisplay ? (
                <a
                  href={data.waMeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-medium underline-offset-4 hover:underline"
                >
                  WhatsApp {data.whatsappDisplay}
                </a>
              ) : (
                <span className="text-foreground font-medium">WhatsApp</span>
              )}{" "}
              do organizador para que ele confirme seus números escolhidos.
              {!data.waMeUrl && (
                <span className="text-muted-foreground">
                  {" "}
                  (O organizador ainda não cadastrou o número no painel da
                  rifa.)
                </span>
              )}
            </p>
            <PixKeyCopy pixKey={data.pixKey} />
          </div>
          <p className="text-muted-foreground text-sm">
            Obrigado pela ajuda! Deus te abençoe!
          </p>
          <Link
            href={`/${organizerSlug}/${raffleSlug}`}
            className="text-primary inline-block text-sm font-medium underline-offset-4 hover:underline"
          >
            Comprar mais números
          </Link>
        </div>
      </PageContainer>
    </main>
  );
}

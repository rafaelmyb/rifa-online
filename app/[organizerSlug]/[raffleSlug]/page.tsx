import { notFound } from "next/navigation";
import { PageContainer } from "@/components/page-container";
import { RafflePurchaseForm } from "@/components/raffle-purchase-form";
import { isReservedOrganizerSlug } from "@/lib/reserved-slugs";
import { getPublicRaffle } from "@/lib/queries/public-raffle";

type PageProps = {
  params: Promise<{ organizerSlug: string; raffleSlug: string }>;
};

export default async function PublicRafflePage({ params }: PageProps) {
  const { organizerSlug, raffleSlug } = await params;

  if (isReservedOrganizerSlug(organizerSlug)) {
    notFound();
  }

  const data = await getPublicRaffle(organizerSlug, raffleSlug);
  if (!data) {
    notFound();
  }

  return (
    <main className="flex-1 py-8">
      <PageContainer>
        <RafflePurchaseForm
          raffleId={data.raffle.id}
          organizerSlug={data.organizerSlug}
          raffleSlug={raffleSlug}
          title={data.raffle.title}
          priceCents={data.raffle.priceCents}
          numbers={data.numbers}
        />
      </PageContainer>
    </main>
  );
}

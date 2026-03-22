import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { EditRaffleForm } from "@/components/edit-raffle-form";
import { buttonVariants } from "@/lib/button-variants";
import { prisma } from "@/lib/prisma";
import { formatBrazilPhoneAsYouType } from "@/lib/brazil-phone";
import { cn } from "@/lib/utils";

type PageProps = { params: Promise<{ raffleId: string }> };

export default async function EditarRifaPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { raffleId } = await params;

  const raffle = await prisma.raffle.findFirst({
    where: { id: raffleId, userId: session.user.id },
    include: { _count: { select: { reservations: true } } },
  });
  if (!raffle) notFound();

  const reservationCount = raffle._count.reservations;
  const allowDraftStatus =
    raffle.status !== "PUBLISHED" || reservationCount === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/painel/rifas"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          ← Voltar
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Editar rifa</h1>
      </div>
      <EditRaffleForm
        raffleId={raffle.id}
        allowDraftStatus={allowDraftStatus}
        defaultValues={{
          title: raffle.title,
          pixKey: raffle.pixKey,
          whatsappPhone:
            raffle.whatsappPhone.length > 0
              ? formatBrazilPhoneAsYouType(raffle.whatsappPhone)
              : "",
          status: raffle.status,
        }}
      />
    </div>
  );
}

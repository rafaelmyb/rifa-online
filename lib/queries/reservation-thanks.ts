import { formatBrazilPhoneAsYouType } from "@/lib/brazil-phone";
import { prisma } from "@/lib/prisma";
import { buildWaMeHref } from "@/lib/whatsapp-wa-me";

export async function getReservationForThanksPage(
  reservationId: string,
  organizerSlug: string,
  raffleSlug: string,
) {
  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId },
    include: {
      raffle: {
        include: {
          user: { select: { organizerSlug: true } },
        },
      },
    },
  });

  if (!reservation) return null;
  if (reservation.raffle.user.organizerSlug !== organizerSlug) return null;
  if (reservation.raffle.slug !== raffleSlug) return null;

  const numbers = await prisma.raffleNumber.findMany({
    where: { reservationId },
    orderBy: { value: "asc" },
    select: { value: true },
  });

  const waDigits = reservation.raffle.whatsappPhone;

  return {
    buyerName: reservation.buyerName,
    pixKey: reservation.raffle.pixKey,
    whatsappDisplay:
      waDigits.length > 0 ? formatBrazilPhoneAsYouType(waDigits) : null,
    waMeUrl: buildWaMeHref(waDigits),
    numbers: numbers.map((n) => n.value),
    totalCents: reservation.totalCents,
  };
}

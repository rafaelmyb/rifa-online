import { prisma } from "@/lib/prisma";

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

  return {
    buyerName: reservation.buyerName,
    pixKey: reservation.raffle.pixKey,
    numbers: numbers.map((n) => n.value),
    totalCents: reservation.totalCents,
  };
}

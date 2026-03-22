import { prisma } from "@/lib/prisma";

export async function getPublicRaffle(organizerSlug: string, raffleSlug: string) {
  const user = await prisma.user.findUnique({
    where: { organizerSlug },
    select: { id: true },
  });
  if (!user) return null;

  const raffle = await prisma.raffle.findFirst({
    where: {
      userId: user.id,
      slug: raffleSlug,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      priceCents: true,
      totalNumbers: true,
      pixKey: true,
    },
  });
  if (!raffle) return null;

  const numbers = await prisma.raffleNumber.findMany({
    where: { raffleId: raffle.id },
    select: { value: true, status: true },
    orderBy: { value: "asc" },
  });

  return { raffle, numbers, organizerSlug };
}

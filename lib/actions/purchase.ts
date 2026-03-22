"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PurchaseResult =
  | { ok: true; reservationId: string }
  | { ok: false; error: string };

export async function createPurchase(
  raffleId: string,
  buyerName: string,
  buyerPhone: string,
  selectedValues: number[],
): Promise<PurchaseResult> {
  if (!selectedValues.length) {
    return { ok: false, error: "Selecione ao menos um número." };
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const raffle = await tx.raffle.findFirst({
          where: { id: raffleId, status: "PUBLISHED" },
        });
        if (!raffle) {
          throw new Error("Rifa não encontrada ou indisponível.");
        }

        const nums = await tx.raffleNumber.findMany({
          where: {
            raffleId,
            value: { in: selectedValues },
            status: "AVAILABLE",
          },
        });

        if (nums.length !== selectedValues.length) {
          throw new Error(
            "Alguns números não estão mais disponíveis. Atualize a página.",
          );
        }

        const totalCents = selectedValues.length * raffle.priceCents;

        const reservation = await tx.reservation.create({
          data: {
            raffleId,
            buyerName: buyerName.trim(),
            buyerPhone: buyerPhone.trim(),
            totalCents,
            status: "PENDING_PAYMENT",
          },
        });

        await tx.raffleNumber.updateMany({
          where: { id: { in: nums.map((n) => n.id) } },
          data: { status: "HELD", reservationId: reservation.id },
        });

        return { reservationId: reservation.id, raffleId };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    const full = await prisma.raffle.findUnique({
      where: { id: result.raffleId },
      include: { user: { select: { organizerSlug: true } } },
    });
    if (full) {
      revalidatePath(`/${full.user.organizerSlug}/${full.slug}`);
      revalidatePath(
        `/${full.user.organizerSlug}/${full.slug}/obrigado`,
      );
    }

    return { ok: true, reservationId: result.reservationId };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Não foi possível concluir a compra.";
    return { ok: false, error: message };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function assertRaffleOwner(raffleId: string, userId: string) {
  const raffle = await prisma.raffle.findFirst({
    where: { id: raffleId, userId },
  });
  if (!raffle) throw new Error("Rifa não encontrada.");
  return raffle;
}

export async function markReservationPaid(reservationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado.");

  const meta = await prisma.reservation.findFirst({
    where: {
      id: reservationId,
      status: "PENDING_PAYMENT",
      raffle: { userId: session.user.id },
    },
    include: { raffle: { include: { user: true } } },
  });
  if (!meta) throw new Error("Pedido não encontrado ou já processado.");

  await prisma.$transaction(async (tx) => {
    await tx.raffleNumber.updateMany({
      where: { reservationId },
      data: { status: "SOLD" },
    });

    await tx.reservation.update({
      where: { id: reservationId },
      data: { status: "PAID" },
    });
  });

  const path = `/${meta.raffle.user.organizerSlug}/${meta.raffle.slug}`;
  revalidatePath("/painel");
  revalidatePath("/painel/rifas");
  revalidatePath(path);
}

export async function deletePendingReservation(reservationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado.");

  const meta = await prisma.reservation.findFirst({
    where: {
      id: reservationId,
      status: "PENDING_PAYMENT",
      raffle: { userId: session.user.id },
    },
    include: { raffle: { include: { user: true } } },
  });
  if (!meta) throw new Error("Pedido não encontrado.");

  await prisma.$transaction(async (tx) => {
    await tx.raffleNumber.updateMany({
      where: { reservationId },
      data: { status: "AVAILABLE", reservationId: null },
    });

    await tx.reservation.delete({ where: { id: reservationId } });
  });

  const path = `/${meta.raffle.user.organizerSlug}/${meta.raffle.slug}`;
  revalidatePath("/painel");
  revalidatePath("/painel/rifas");
  revalidatePath(path);
}

export async function exportReservationsExcel(raffleId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado.");

  await assertRaffleOwner(raffleId, session.user.id);

  const reservations = await prisma.reservation.findMany({
    where: { raffleId },
    orderBy: { createdAt: "desc" },
    include: {
      numbers: { orderBy: { value: "asc" }, select: { value: true } },
    },
  });

  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Pedidos");

  sheet.columns = [
    { header: "Nome", key: "name", width: 28 },
    { header: "Telefone", key: "phone", width: 18 },
    { header: "Números", key: "numbers", width: 40 },
    { header: "Valor (R$)", key: "total", width: 14 },
    { header: "Status", key: "status", width: 16 },
    { header: "Criado em", key: "created", width: 22 },
  ];

  for (const r of reservations) {
    sheet.addRow({
      name: r.buyerName,
      phone: r.buyerPhone,
      numbers: r.numbers.map((n) => n.value).join(", "),
      total: (r.totalCents / 100).toFixed(2),
      status: r.status === "PAID" ? "Pago" : "Pendente",
      created: r.createdAt.toISOString(),
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

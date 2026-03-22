"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isReservedOrganizerSlug } from "@/lib/reserved-slugs";
import { isValidSlug, normalizeSlug } from "@/lib/slug";

export async function registerOrganizer(formData: {
  email: string;
  password: string;
  organizerSlug: string;
}) {
  const email = formData.email.trim().toLowerCase();
  const password = formData.password;
  const slug = normalizeSlug(formData.organizerSlug);

  if (!email.includes("@")) throw new Error("E-mail inválido.");
  if (password.length < 8) throw new Error("Senha deve ter ao menos 8 caracteres.");
  if (!isValidSlug(slug)) throw new Error("Identificador público inválido (use letras minúsculas, números e hífens).");
  if (isReservedOrganizerSlug(slug)) throw new Error("Este identificador não está disponível.");

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { organizerSlug: slug }] },
  });
  if (existing) throw new Error("E-mail ou identificador já cadastrado.");

  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { email, passwordHash, organizerSlug: slug },
  });

  revalidatePath("/cadastro");
}

export async function createRaffle(formData: {
  title: string;
  slug: string;
  priceCents: number;
  totalNumbers: number;
  pixKey: string;
  status: "DRAFT" | "PUBLISHED";
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado.");

  const slug = normalizeSlug(formData.slug);
  if (!isValidSlug(slug)) throw new Error("Slug da rifa inválido.");

  const totalNumbers = Math.min(Math.max(1, formData.totalNumbers), 10_000);
  const priceCents = Math.max(1, formData.priceCents);

  const raffle = await prisma.$transaction(async (tx) => {
    const r = await tx.raffle.create({
      data: {
        userId: session.user!.id,
        slug,
        title: formData.title.trim(),
        priceCents,
        totalNumbers,
        pixKey: formData.pixKey.trim() || "69999657952",
        status: formData.status,
      },
    });

    const batch = 500;
    for (let start = 1; start <= totalNumbers; start += batch) {
      const end = Math.min(start + batch - 1, totalNumbers);
      await tx.raffleNumber.createMany({
        data: Array.from({ length: end - start + 1 }, (_, i) => ({
          raffleId: r.id,
          value: start + i,
          status: "AVAILABLE" as const,
        })),
      });
    }
    return r;
  });

  revalidatePath("/painel/rifas");
  const u = await prisma.user.findUnique({
    where: { id: session.user!.id },
    select: { organizerSlug: true },
  });
  if (u) revalidatePath(`/${u.organizerSlug}/${slug}`);
  return raffle.id;
}

export async function updateRaffle(
  raffleId: string,
  formData: {
    title: string;
    pixKey: string;
    status: "DRAFT" | "PUBLISHED";
  },
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado.");

  const raffle = await prisma.raffle.findFirst({
    where: { id: raffleId, userId: session.user.id },
  });
  if (!raffle) throw new Error("Rifa não encontrada.");

  await prisma.raffle.update({
    where: { id: raffleId },
    data: {
      title: formData.title.trim(),
      pixKey: formData.pixKey.trim(),
      status: formData.status,
    },
  });

  revalidatePath("/painel/rifas");
  const u = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizerSlug: true },
  });
  if (u) revalidatePath(`/${u.organizerSlug}/${raffle.slug}`);
}

export async function deleteRaffle(raffleId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado.");

  const raffle = await prisma.raffle.findFirst({
    where: { id: raffleId, userId: session.user.id },
  });
  if (!raffle) throw new Error("Rifa não encontrada.");

  const u = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizerSlug: true },
  });

  await prisma.raffle.delete({ where: { id: raffleId } });
  revalidatePath("/painel/rifas");
  if (u) revalidatePath(`/${u.organizerSlug}/${raffle.slug}`);
}

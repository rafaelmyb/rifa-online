"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isReservedOrganizerSlug } from "@/lib/reserved-slugs";
import { digitsFromPhoneInput } from "@/lib/brazil-phone";
import {
  isValidSlug,
  nextRaffleSlugCandidate,
  normalizeSlug,
  raffleSlugFromTitle,
} from "@/lib/slug";

function assertOrganizerWhatsappDigits(raw: string): string {
  const d = digitsFromPhoneInput(raw);
  if (d.length < 10 || d.length > 11) {
    throw new Error("WhatsApp: informe DDD + número (10 ou 11 dígitos).");
  }
  return d;
}

/** Vazio permitido (rifas antigas); se preenchido, deve ter 10 ou 11 dígitos. */
function normalizeOrganizerWhatsappForUpdate(raw: string): string {
  const d = digitsFromPhoneInput(raw);
  if (d.length === 0) return "";
  if (d.length < 10 || d.length > 11) {
    throw new Error(
      "WhatsApp: informe DDD + número (10 ou 11 dígitos) ou deixe vazio.",
    );
  }
  return d;
}

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
  priceCents: number;
  totalNumbers: number;
  pixKey: string;
  whatsappPhone: string;
  status: "DRAFT" | "PUBLISHED";
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado.");

  const title = formData.title.trim();
  let slug = raffleSlugFromTitle(title);
  if (!isValidSlug(slug)) {
    throw new Error(
      "Use um título que gere um link válido (ao menos 2 caracteres: letras, números ou palavras separadas por hífen).",
    );
  }

  const totalNumbers = Math.min(Math.max(1, formData.totalNumbers), 10_000);
  const priceCents = Math.max(1, formData.priceCents);
  const whatsappPhone = assertOrganizerWhatsappDigits(formData.whatsappPhone);

  const raffle = await prisma.$transaction(async (tx) => {
    const userId = session.user!.id;
    const base = slug;
    let counter = 2;
    for (;;) {
      const taken = await tx.raffle.findFirst({
        where: { userId, slug },
        select: { id: true },
      });
      if (!taken) break;
      slug = nextRaffleSlugCandidate(base, counter);
      if (!isValidSlug(slug)) {
        slug = `rifa-${userId.slice(-6)}-${counter}`.slice(0, 60);
        if (!isValidSlug(slug)) throw new Error("Não foi possível gerar um link único para a rifa.");
      }
      counter += 1;
      if (counter > 10_000) throw new Error("Não foi possível gerar um link único para a rifa.");
    }

    const r = await tx.raffle.create({
      data: {
        userId,
        slug,
        title,
        priceCents,
        totalNumbers,
        pixKey: formData.pixKey.trim() || "69999657952",
        whatsappPhone,
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
    whatsappPhone: string;
    status: "DRAFT" | "PUBLISHED";
  },
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado.");

  const raffle = await prisma.raffle.findFirst({
    where: { id: raffleId, userId: session.user.id },
  });
  if (!raffle) throw new Error("Rifa não encontrada.");

  const whatsappPhone = normalizeOrganizerWhatsappForUpdate(formData.whatsappPhone);

  // Only safe fields: title, pixKey, whatsappPhone, status. Never slug / priceCents / totalNumbers.
  if (
    raffle.status === "PUBLISHED" &&
    formData.status === "DRAFT"
  ) {
    const hasReservations = await prisma.reservation.count({
      where: { raffleId },
    });
    if (hasReservations > 0) {
      throw new Error(
        "Não é possível voltar para rascunho: já existem pedidos nesta rifa. Os compradores precisam do link público.",
      );
    }
  }

  await prisma.raffle.update({
    where: { id: raffleId },
    data: {
      title: formData.title.trim(),
      pixKey: formData.pixKey.trim(),
      whatsappPhone,
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

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  const organizerSlug = process.env.SEED_ORGANIZER_SLUG ?? "demo";
  const raffleSlug = process.env.SEED_RAFFLE_SLUG ?? "rifa-principal";

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      organizerSlug,
    },
    update: {
      passwordHash,
      organizerSlug,
    },
  });

  let raffle = await prisma.raffle.findFirst({
    where: { userId: user.id, slug: raffleSlug },
  });

  if (!raffle) {
    raffle = await prisma.raffle.create({
      data: {
        userId: user.id,
        slug: raffleSlug,
        title: "Rifa principal",
        priceCents: 4000,
        totalNumbers: 1000,
        pixKey: "69999657952",
        status: "PUBLISHED",
      },
    });

    const batchSize = 500;
    for (let start = 1; start <= 1000; start += batchSize) {
      const end = Math.min(start + batchSize - 1, 1000);
      await prisma.raffleNumber.createMany({
        data: Array.from({ length: end - start + 1 }, (_, i) => ({
          raffleId: raffle!.id,
          value: start + i,
          status: "AVAILABLE" as const,
        })),
      });
    }
  }

  console.log("Seed OK:", { email, organizerSlug, raffleSlug });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });

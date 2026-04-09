import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "zmien-mnie-od-razu";
  const hash = await bcrypt.hash(adminPassword, 12);

  await prisma.formalities.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      gardenBankAccount: "— uzupełni prezes w panelu —",
      contactPhone: "—",
    },
    update: {},
  });

  const pages = [
    { slug: "o-ogrodzie", title: "O ogrodzie", content: "Treść do uzupełnienia w panelu administratora." },
    { slug: "osiagniecia", title: "Osiągnięcia", content: "" },
    { slug: "plan-dzialek", title: "Plan działek", content: "_Plan można dodać jako obrazek lub PDF w panelu._" },
  ];

  for (const p of pages) {
    await prisma.sitePage.upsert({
      where: { slug: p.slug },
      create: p,
      update: { title: p.title },
    });
  }

  await prisma.user.upsert({
    where: { login: "admin" },
    create: {
      login: "admin",
      email: process.env.ADMIN_SEED_EMAIL ?? "admin@example.local",
      passwordHash: hash,
      name: "Administrator",
      roles: {
        create: [{ role: Role.ADMIN }],
      },
      mustSetEmailOnLogin: false,
      accountActive: true,
    },
    update: {
      passwordHash: hash,
      accountActive: true,
      roles: {
        deleteMany: {},
        create: [{ role: Role.ADMIN }],
      },
    },
  });

  console.log("Seed OK. Login: admin, hasło:", adminPassword);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

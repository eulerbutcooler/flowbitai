import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  const tenants = [
    {
      name: "Delivery",
      customerId: "deliverydelhi",
      admin: {
        email: "admin@delivery.com",
        password: "admin123",
      },
    },
    {
      name: "RetailStore",
      customerId: "retailstore",
      admin: {
        email: "admin@retailstore.com",
        password: "admin123",
      },
    },
  ];

  for (const tenant of tenants) {
    const hashed = await bcrypt.hash(tenant.admin.password, 10);

    await prisma.user.create({
      data: {
        email: tenant.admin.email,
        password: hashed,
        role: "ADMIN",
        customerId: tenant.customerId,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error("Error seeding:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

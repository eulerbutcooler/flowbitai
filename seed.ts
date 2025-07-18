import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Create users for the tenants (don't delete existing data)
  console.log("Seeding database with LogisticsCo and RetailGmbH tenants...");

  const tenants = [
    {
      name: "LogisticsCo",
      customerId: "logisticsco",
      admin: {
        email: "admin@logisticsco.com",
        password: "admin123",
      },
    },
    {
      name: "RetailGmbH",
      customerId: "retailgmbh",
      admin: {
        email: "admin@retailgmbh.com",
        password: "admin123",
      },
    },
  ];

  for (const tenant of tenants) {
    console.log(`Creating admin for ${tenant.name}...`);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: tenant.admin.email },
    });

    if (existingUser) {
      console.log(`  Admin for ${tenant.name} already exists`);
      continue;
    }

    const hashed = await bcrypt.hash(tenant.admin.password, 10);

    await prisma.user.create({
      data: {
        email: tenant.admin.email,
        password: hashed,
        role: "ADMIN",
        customerId: tenant.customerId,
      },
    });

    console.log(`  Created admin for ${tenant.name}: ${tenant.admin.email}`);
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

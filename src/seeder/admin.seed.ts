import bcrypt from "bcryptjs";
import prisma from "@lib/prisma";
import { AdminType } from "@prisma/client";

export async function main() {
  const [, , username, email, password] = process.argv;
  if (!username || !email || !password) {
    console.error("Usage: ts-node admin.seed.ts <username> <email> <password>");
    process.exit(1);
  }

  console.log("Seeding Super Admin ...");
  const admin = {
    username,
    email,
    password: await bcrypt.hash(password, 10),
    role: AdminType.SUPERADMIN,
  };

  const adminExist = await prisma.admin.findUnique({
    where: { email: admin.email },
  });

  if (adminExist) {
    console.log("Admin already exists, returning...");
    process.exit(0);
  }

  await prisma.admin.create({
    data: {
      email: admin.email,
      username: admin.username,
      password: admin.password,
      role: admin.role,
    },
  });

  console.log("Admin created successfully!");
}

main();

require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../config/database");

async function main() {
  const email = "admin@raymond.com";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin already exists:", email);
    return;
  }

  const hashedPassword = await bcrypt.hash("Admin@1234", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Super Admin",
      phoneNumber: "+10000000000",
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin created:", admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

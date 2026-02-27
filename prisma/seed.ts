import { PrismaClient, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("DEFLASHINGHTMF", 10)

  await prisma.user.upsert({
    where: {
      username: "deflashing@htm.com",
    },
    update: {},
    create: {
      username: "deflashing@htm.com",
      password: hashedPassword,
      role: UserRole.DEFLASHING,
    },
  })

  console.log("✅ Deflashing account seeded")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
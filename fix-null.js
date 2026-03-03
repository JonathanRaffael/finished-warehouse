const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fix() {
  const nullRecords = await prisma.$queryRawUnsafe(`
    SELECT id FROM "Deflashing"
    WHERE "incomingId" IS NULL
  `)

  console.log('NULL RECORDS:', nullRecords)

  // Kalau mau langsung hapus:
  await prisma.$executeRawUnsafe(`
    DELETE FROM "Deflashing"
    WHERE "incomingId" IS NULL
  `)

  console.log('Null incomingId deleted')
}

fix()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {

  // Vehicles
  await prisma.vehicle.createMany({
    data: [
      {
        model: "Van-05",
        plate: "MH12AB1234",
        maxLoad: 500,
        status: "Available",
        odometer: 10000
      },
      {
        model: "Truck-01",
        plate: "MH14XY5678",
        maxLoad: 1000,
        status: "Available",
        odometer: 20000
      }
    ]
  })

  // Drivers
  await prisma.driver.createMany({
    data: [
      {
        name: "Alex",
        licenseStatus: "Valid",
        safetyScore: 85,
        status: "On Duty"
      },
      {
        name: "John",
        licenseStatus: "Expired",
        safetyScore: 60,
        status: "On Duty"
      }
    ]
  })

  console.log("✅ Dummy data inserted successfully")

}

main()
  .catch(e => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

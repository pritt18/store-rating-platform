import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data cleanly
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash("Admin@1234", salt);
  const ownerPassword = await bcrypt.hash("Owner@1234", salt);
  const userPassword = await bcrypt.hash("User@12345", salt);

  // 1. Create System Administrator
  // Name: 29 chars (meets 20-60 req)
  const admin = await prisma.user.create({
    data: {
      name: "Administrator Master Account",
      email: "admin@storerating.com",
      password: adminPassword,
      address: "HQ Suite 100, Global Commerce Center, Silicon Boulevard, CA 94016",
      role: UserRole.ADMIN,
    },
  });

  // 2. Create Store Owners
  // Name: 25 chars (meets 20-60 req)
  const owner1 = await prisma.user.create({
    data: {
      name: "Jonathan Edward Mitchell",
      email: "owner1@storerating.com",
      password: ownerPassword,
      address: "450 Market Street, Financial Plaza, San Francisco, CA 94105",
      role: UserRole.STORE_OWNER,
    },
  });

  // Name: 26 chars (meets 20-60 req)
  const owner2 = await prisma.user.create({
    data: {
      name: "Victoria Elizabeth Foster",
      email: "owner2@storerating.com",
      password: ownerPassword,
      address: "782 Broadway Avenue, Midtown Tower, New York, NY 10003",
      role: UserRole.STORE_OWNER,
    },
  });

  // 3. Create Normal Users
  // Name: 26 chars
  const user1 = await prisma.user.create({
    data: {
      name: "Alexander Wright Patterson",
      email: "user1@storerating.com",
      password: userPassword,
      address: "312 Willow Creek Lane, Apt 4B, Austin, TX 78701",
      role: UserRole.USER,
    },
  });

  // Name: 27 chars
  const user2 = await prisma.user.create({
    data: {
      name: "Samantha Christine Jenkins",
      email: "user2@storerating.com",
      password: userPassword,
      address: "884 Pine Forest Drive, Seattle, WA 98101",
      role: UserRole.USER,
    },
  });

  // Name: 24 chars
  const user3 = await prisma.user.create({
    data: {
      name: "Benjamin Harrison Vance",
      email: "user3@storerating.com",
      password: userPassword,
      address: "519 Magnolia Court, Denver, CO 80202",
      role: UserRole.USER,
    },
  });

  // 4. Create Stores
  const store1 = await prisma.store.create({
    data: {
      name: "Nexus Electronics & Gadgets Hub",
      email: "nexus.tech@example.com",
      address: "101 Cyber Way, Technology Park, San Francisco, CA",
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: "Artisan Roasted Coffee Roasters",
      email: "artisan.brew@example.com",
      address: "42 Espresso Lane, Downtown Historic District, New York, NY",
      ownerId: owner2.id,
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: "Summit Outdoor Gear & Apparel",
      email: "summit.outdoors@example.com",
      address: "880 Mountain Crest Parkway, Denver, CO",
      ownerId: null, // Unassigned store for admin demo
    },
  });

  const store4 = await prisma.store.create({
    data: {
      name: "Organic Harvest Market & Deli",
      email: "harvest.green@example.com",
      address: "240 Farmview Boulevard, Austin, TX",
      ownerId: null,
    },
  });

  // 5. Create Initial Ratings (1-5 stars)
  await prisma.rating.createMany({
    data: [
      { userId: user1.id, storeId: store1.id, rating: 5 },
      { userId: user2.id, storeId: store1.id, rating: 4 },
      { userId: user3.id, storeId: store1.id, rating: 5 },

      { userId: user1.id, storeId: store2.id, rating: 4 },
      { userId: user2.id, storeId: store2.id, rating: 3 },

      { userId: user2.id, storeId: store3.id, rating: 5 },
      { userId: user3.id, storeId: store3.id, rating: 4 },

      { userId: user1.id, storeId: store4.id, rating: 4 },
    ],
  });

  console.log("✅ Database seeded successfully!");
  console.log("-----------------------------------------");
  console.log("Credentials:");
  console.log("Admin:       admin@storerating.com  / Admin@1234");
  console.log("Store Owner: owner1@storerating.com / Owner@1234");
  console.log("Normal User: user1@storerating.com  / User@12345");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

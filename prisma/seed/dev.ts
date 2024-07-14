import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// adds users if they do not already exist
async function main() {
  console.log(`adding admin & nonAdmin dev users to DB`);
  // add admin user
  await prisma.user.upsert({
    where: { id: "402a8052-9c4d-496e-bd17-d25f3d0c2bf7" },
    update: {},
    create: {
      id: "402a8052-9c4d-496e-bd17-d25f3d0c2bf7",
      firstName: "test",
      lastName: "admin",
      siteAdmin: true,
      active: true,
    },
  });

  // add non admin
  await prisma.user.upsert({
    where: { id: "88c150cc-1235-4523-9224-65caafa935eb" },
    update: {},
    create: {
      id: "88c150cc-1235-4523-9224-65caafa935eb",
      firstName: "test",
      lastName: "nonAdmin",
      siteAdmin: false,
      active: true,
    },
  });

  console.log("adding partner org");
  await prisma.partnerOrg.upsert({
    where: { id: "3ab3107d-09bc-44cd-b73b-0dfd17bd7576" },
    update: {},
    create: {
      id: "3ab3107d-09bc-44cd-b73b-0dfd17bd7576",
      name: "test partner org",
      admins: { connect: { id: "88c150cc-1235-4523-9224-65caafa935eb" } },
    },
  });

  await prisma.partnerOrg.upsert({
    where: { id: "f27e212e-76c2-4977-8fd5-9b5367a31b68" },
    update: {},
    create: {
      id: "f27e212e-76c2-4977-8fd5-9b5367a31b68",
      name: "another test partner org",
      admins: { connect: { id: "402a8052-9c4d-496e-bd17-d25f3d0c2bf7" } },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

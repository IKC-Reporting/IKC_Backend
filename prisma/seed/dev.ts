import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// adds users if they do not already exist
async function main() {
  console.log(`adding admin & nonAdmin dev users to DB`);

  // add admin user (password=superAddm1n#1)
  await prisma.user.upsert({
    where: { id: "402a8052-9c4d-496e-bd17-d25f3d0c2bf7" },
    update: {},
    create: {
      id: "402a8052-9c4d-496e-bd17-d25f3d0c2bf7",
      firstName: "test",
      lastName: "admin",
      email: "fakeAdmin.email@localhost.net",
      password: "$2b$10$QCp3BfTdsYwgZREKJNS1ruCBN0PLjpmS3XePJcuT9QsCc9Jxmqee6",
      siteAdmin: true,
      active: true,
    },
  });

  // add non admin (password=helloW0rldm&)
  await prisma.user.upsert({
    where: { id: "88c150cc-1235-4523-9224-65caafa935eb" },
    update: {},
    create: {
      id: "88c150cc-1235-4523-9224-65caafa935eb",
      firstName: "test",
      lastName: "nonAdmin",
      email: "fakeUser.email@localhost.net",
      password: "$2b$10$X1Dx6nGtR5F1h1gXux6DgunjOqEEBM7g02FIcx1udLhNCKNTC54/.",
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

  console.log("adding two research projects");
  await prisma.researchProject.upsert({
    where: { id: "88a21a78-ef83-4091-baec-835f61391fb3" },
    update: {},
    create: {
      id: "88a21a78-ef83-4091-baec-835f61391fb3",
      projectTitle: "test research project",
      startDate: new Date(),
      endDate: new Date(Date.now() + 100000),
      admins: { connect: { id: "88c150cc-1235-4523-9224-65caafa935eb" } },
    },
  });

  await prisma.researchProject.upsert({
    where: { id: "4455c019-a941-4ad3-806f-ebb0cf1a2ffb" },
    update: {},
    create: {
      id: "4455c019-a941-4ad3-806f-ebb0cf1a2ffb",
      projectTitle: "another test research project",
      startDate: new Date("1884/01/01"),
      endDate: new Date("3077/12/24"),
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

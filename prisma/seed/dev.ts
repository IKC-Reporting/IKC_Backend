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

  // add contributor user (password=P@ssw0rd123!)
  await prisma.user.upsert({
    where: { id: "24a7cf8c-feca-4863-87e8-1952a18a6973" },
    update: {},
    create: {
      id: "24a7cf8c-feca-4863-87e8-1952a18a6973",
      firstName: "contributor user",
      lastName: "lastname",
      email: "contributions.research@localhost.net",
      password: "$2b$10$.R.hlIYt0b6ZGq7D/3sUAOMDA97hpUHLVgU1585cnA67z3SuiGuzS",
      siteAdmin: false,
      active: true,
    },
  });

  // add empty / unconnected user (password=123P@ssw0rdz!)
  await prisma.user.upsert({
    where: { id: "d38cbf18-ac04-4517-96d5-289c2b6222c0" },
    update: {},
    create: {
      id: "d38cbf18-ac04-4517-96d5-289c2b6222c0",
      firstName: "unconnected user",
      lastName: "lastname",
      email: "notReal@localhost.email",
      password: "$2b$10$tXUTPAZzllI1WRUgQOxrD.Gb3j2ErgXvPGCDLvz.rpp/Zo2AAwsD2",
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
      startDate: new Date("2000/01/01"),
      endDate: new Date("3000/01/01"),
      admins: { connect: { id: "88c150cc-1235-4523-9224-65caafa935eb" } },
      projectPartners: {
        connect: { id: "3ab3107d-09bc-44cd-b73b-0dfd17bd7576" },
      },
    },
  });

  await prisma.researchProject.upsert({
    where: { id: "4455c019-a941-4ad3-806f-ebb0cf1a2ffb" },
    update: {},
    create: {
      id: "4455c019-a941-4ad3-806f-ebb0cf1a2ffb",
      projectTitle: "another test research project",
      startDate: new Date("2000/01/01"),
      endDate: new Date("3000/01/01"),
      admins: { connect: { id: "402a8052-9c4d-496e-bd17-d25f3d0c2bf7" } },
    },
  });

  console.log("creating contributor");

  await prisma.contributor.upsert({
    where: { id: "fee9a62e-b403-4162-8e43-deb6b879ac9" },
    update: {},
    create: {
      id: "fee9a62e-b403-4162-8e43-deb6b879ac9",
      userId: "24a7cf8c-feca-4863-87e8-1952a18a6973",
      partnerOrgId: "3ab3107d-09bc-44cd-b73b-0dfd17bd7576",
      researchProjectId: "88a21a78-ef83-4091-baec-835f61391fb3",
      hourlyRate: 20,
      benRatePer: 0.2,
    },
  });

  await prisma.contribItem.upsert({
    where: { id: "1e137e1a-ca37-432a-bde1-7cf93946706a" },
    update: {},
    create: {
      id: "1e137e1a-ca37-432a-bde1-7cf93946706a",
      contributorId: "fee9a62e-b403-4162-8e43-deb6b879ac9",
      date: new Date("2024-02-02"),
      details: "example details...",
    },
  });

  await prisma.hourContribution.upsert({
    where: { contribItemId: "1e137e1a-ca37-432a-bde1-7cf93946706a" },
    update: {},
    create: {
      contribItemId: "1e137e1a-ca37-432a-bde1-7cf93946706a",
      hours: 5,
      hourlyRate: 20,
      benRatePer: 0.2,
    },
  });

  await prisma.contribItem.upsert({
    where: { id: "8d5e869c-1988-45ba-a95c-44b1d30ac3c0" },
    update: {},
    create: {
      id: "8d5e869c-1988-45ba-a95c-44b1d30ac3c0",
      contributorId: "fee9a62e-b403-4162-8e43-deb6b879ac9",
      date: new Date("2024-01-01"),
      details: "example details...",
    },
  });

  await prisma.otherContribution.upsert({
    where: { contribItemId: "8d5e869c-1988-45ba-a95c-44b1d30ac3c0" },
    update: {},
    create: {
      contribItemId: "8d5e869c-1988-45ba-a95c-44b1d30ac3c0",
      itemName: "coca-cola",
      value: 1.99,
      items: 1,
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

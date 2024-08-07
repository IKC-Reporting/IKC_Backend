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
      password: "$2b$10$zek/ZxLjx3f1y3Ofy7v13OZDUwRhoRMCZa0z3Vy09.Xf0P3MwPR/O",
      siteAdmin: true,
      active: true,
    },
  });

  // add non admin (password=h3lloW0r1dm&)
  await prisma.user.upsert({
    where: { id: "88c150cc-1235-4523-9224-65caafa935eb" },
    update: {},
    create: {
      id: "88c150cc-1235-4523-9224-65caafa935eb",
      firstName: "test",
      lastName: "nonAdmin",
      email: "fakeUser.email@localhost.net",
      password: "$2b$10$IIYMvspwWavu/jqQlBGL1euys3hevh3dPnwhznREA6iZ4XBll4cla",
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
      password: "$2b$10$cMpqF8CNyso3f5DuF8PTB.QZYjZi3fzrLIhkAkNotTVbN//iECJXG",
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
      projectPartners: {
        connect: { id: "f27e212e-76c2-4977-8fd5-9b5367a31b68" },
      },
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

  await prisma.contributor.upsert({
    where: { id: "1b29dfd0-d506-4051-8aff-3f59b92f125c" },
    update: {},
    create: {
      id: "1b29dfd0-d506-4051-8aff-3f59b92f125c",
      userId: "d38cbf18-ac04-4517-96d5-289c2b6222c0",
      partnerOrgId: "f27e212e-76c2-4977-8fd5-9b5367a31b68",
      researchProjectId: "4455c019-a941-4ad3-806f-ebb0cf1a2ffb",
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
    where: { id: "d6f7650b-345c-46ae-89a1-01f7be5374d7" },
    update: {},
    create: {
      id: "d6f7650b-345c-46ae-89a1-01f7be5374d7",
      contributorId: "fee9a62e-b403-4162-8e43-deb6b879ac9",
      date: new Date("2023-02-02"),
      details: "example details with float",
    },
  });

  await prisma.hourContribution.upsert({
    where: { contribItemId: "d6f7650b-345c-46ae-89a1-01f7be5374d7" },
    update: {},
    create: {
      contribItemId: "d6f7650b-345c-46ae-89a1-01f7be5374d7",
      hours: 9.25,
      hourlyRate: 21,
      benRatePer: 0.24,
    },
  });

  await prisma.contribItem.upsert({
    where: { id: "e57ebd9c-0e91-4c86-b43d-a2f2afc5cb92" },
    update: {},
    create: {
      id: "e57ebd9c-0e91-4c86-b43d-a2f2afc5cb92",
      contributorId: "fee9a62e-b403-4162-8e43-deb6b879ac9",
      date: new Date("2023-01-07"),
      details: "example details for ikc report add contribution test",
    },
  });

  await prisma.hourContribution.upsert({
    where: { contribItemId: "e57ebd9c-0e91-4c86-b43d-a2f2afc5cb92" },
    update: {},
    create: {
      contribItemId: "e57ebd9c-0e91-4c86-b43d-a2f2afc5cb92",
      hours: 3,
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

  await prisma.contribItem.upsert({
    where: { id: "ef67def3-0bec-497d-ab90-cba50429760e" },
    update: {},
    create: {
      id: "ef67def3-0bec-497d-ab90-cba50429760e",
      contributorId: "fee9a62e-b403-4162-8e43-deb6b879ac9",
      date: new Date("2024-01-01"),
      details: "example details...",
    },
  });

  await prisma.otherContribution.upsert({
    where: { contribItemId: "ef67def3-0bec-497d-ab90-cba50429760e" },
    update: {},
    create: {
      contribItemId: "ef67def3-0bec-497d-ab90-cba50429760e",
      itemName: "sprite",
      value: 20.1,
      items: 2,
    },
  });

  // add contribution for another project
  await prisma.contribItem.upsert({
    where: { id: "63ea1fb6-1023-4f40-b87a-3be779fefcf9" },
    update: {},
    create: {
      id: "63ea1fb6-1023-4f40-b87a-3be779fefcf9",
      contributorId: "1b29dfd0-d506-4051-8aff-3f59b92f125c",
      date: new Date("2024-07-11"),
      details: "example details...",
    },
  });

  await prisma.otherContribution.upsert({
    where: { contribItemId: "63ea1fb6-1023-4f40-b87a-3be779fefcf9" },
    update: {},
    create: {
      contribItemId: "63ea1fb6-1023-4f40-b87a-3be779fefcf9",
      itemName: "pepsi",
      value: 0.99,
      items: 10,
    },
  });

  console.log("creating ikc report with one contribution");

  await prisma.iKCReport.upsert({
    where: { id: "9cee81d9-6b9e-4348-ac1b-caaa7534a660" },
    update: {},
    create: {
      id: "9cee81d9-6b9e-4348-ac1b-caaa7534a660",
      partnerOrgId: "3ab3107d-09bc-44cd-b73b-0dfd17bd7576",
      researchProjectId: "88a21a78-ef83-4091-baec-835f61391fb3",
      reportStartDate: new Date("2024-01-01"),
      submissionDate: new Date("2024-03-01"),
      approvalDate: new Date("2024-07-23"),
      isApproved: true,
      approverId: "88c150cc-1235-4523-9224-65caafa935eb",
      Contributions: {
        connect: [
          { id: "ef67def3-0bec-497d-ab90-cba50429760e" },
          { id: "d6f7650b-345c-46ae-89a1-01f7be5374d7" },
        ],
      },
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

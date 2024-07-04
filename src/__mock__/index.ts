export const testUser = {
  id: "testUserId",
  firstName: "newUser",
  lastName: "exLastname",
  siteAdmin: false,
  active: true,
};

export const testAdmin = {
  id: "testAdminId",
  firstName: "newAdmin",
  lastName: "exLastname",
  siteAdmin: true,
  active: true,
  PartnerOrgAdminAssignments: [{ id: "testPartnerOrgId" }],
};

export const testPartnerOrg = {
  id: "testPartnerOrgId",
  ResearchProject: null,
  researchProjectId: null,
  name: "example org name",
  admins: [testAdmin],
  contributors: null,
};

export const testContributor = {
  id: "testContributorId",

  userId: testUser.id,
  partnerOrgId: "partnerOrgID",
  annualSalary: 45000,
  dailyHours: 8,
  benRatePer: 0.1,
  HourContribItem: [null],
  OtherContribItem: [null],
};

export const employeeHoursMock = [
  {
    employeeName: "Jane Smith",
    hoursPerMonth1: 3,
    hoursPerMonth2: 5,
    hoursPerMonth3: 2,
    totalHours: 10,
    hourly: 50.0,
    total: 500.0,
  },
  {
    employeeName: "Frank Turner",
    hoursPerMonth1: 5,
    hoursPerMonth2: 4,
    hoursPerMonth3: 8,
    totalHours: 17,
    hourly: 15.0,
    total: 255.0,
  },
  {
    employeeName: "Karen Jones",
    hoursPerMonth1: 8,
    hoursPerMonth2: 9,
    hoursPerMonth3: 10,
    totalHours: 27,
    hourly: 100.0,
    total: 2700.0,
  },
];

export const otherContributionsMock = [
  {
    item: "Equipment",
    date: "2021-01-10",
    details: "2 x sensors for project ($100 each)",
    value: 200.0,
  },
  {
    item: "Travel",
    date: "2021-02-15",
    details: "Travel for site meeting (20km each way @ 0.61/km)",
    value: 24.4,
  },
  {
    item: "Travel",
    date: "2021-03-22",
    details: "Travel to Conestoga College (20km each way @ 0.61/km)",
    value: 24.4,
  },
  {
    item: "Materials/Supplies",
  },
  {
    item: "Other",
  },
];

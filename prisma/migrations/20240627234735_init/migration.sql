-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "siteAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Contributor" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "partnerOrgId" TEXT NOT NULL,
    "annualSalary" DOUBLE PRECISION NOT NULL,
    "dailyHours" DOUBLE PRECISION NOT NULL,
    "benRatePer" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Contributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerOrg" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "admins" TEXT[],
    "researchProjectId" TEXT,

    CONSTRAINT "PartnerOrg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HourLog" (
    "id" SERIAL NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "month" TEXT NOT NULL,
    "hourlyPay" DOUBLE PRECISION NOT NULL,
    "hourContribItemId" INTEGER,

    CONSTRAINT "HourLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HourContribItem" (
    "id" SERIAL NOT NULL,
    "contributorId" INTEGER NOT NULL,
    "iKCReportId" TEXT,

    CONSTRAINT "HourContribItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtherContribItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contributionDate" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "details" TEXT NOT NULL,
    "contributorId" INTEGER NOT NULL,
    "iKCReportId" TEXT,

    CONSTRAINT "OtherContribItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionItem" (
    "id" SERIAL NOT NULL,
    "submitterId" TEXT NOT NULL,
    "ikcReportID" TEXT NOT NULL,
    "submissionDate" TIMESTAMP(3) NOT NULL,
    "iKCReportId" TEXT,

    CONSTRAINT "SubmissionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IKCReport" (
    "id" TEXT NOT NULL,
    "partnerOrgId" TEXT NOT NULL,
    "reportStartDate" TIMESTAMP(3) NOT NULL,
    "reportEndDate" TIMESTAMP(3) NOT NULL,
    "researchProjectId" TEXT,

    CONSTRAINT "IKCReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchProject" (
    "id" TEXT NOT NULL,
    "projectTitle" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "admins" TEXT[],

    CONSTRAINT "ResearchProject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Contributor_userId_partnerOrgId_key" ON "Contributor"("userId", "partnerOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerOrg_id_key" ON "PartnerOrg"("id");

-- CreateIndex
CREATE UNIQUE INDEX "IKCReport_id_key" ON "IKCReport"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchProject_id_key" ON "ResearchProject"("id");

-- AddForeignKey
ALTER TABLE "Contributor" ADD CONSTRAINT "Contributor_partnerOrgId_fkey" FOREIGN KEY ("partnerOrgId") REFERENCES "PartnerOrg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerOrg" ADD CONSTRAINT "PartnerOrg_researchProjectId_fkey" FOREIGN KEY ("researchProjectId") REFERENCES "ResearchProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HourLog" ADD CONSTRAINT "HourLog_hourContribItemId_fkey" FOREIGN KEY ("hourContribItemId") REFERENCES "HourContribItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HourContribItem" ADD CONSTRAINT "HourContribItem_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Contributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HourContribItem" ADD CONSTRAINT "HourContribItem_iKCReportId_fkey" FOREIGN KEY ("iKCReportId") REFERENCES "IKCReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtherContribItem" ADD CONSTRAINT "OtherContribItem_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Contributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtherContribItem" ADD CONSTRAINT "OtherContribItem_iKCReportId_fkey" FOREIGN KEY ("iKCReportId") REFERENCES "IKCReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionItem" ADD CONSTRAINT "SubmissionItem_iKCReportId_fkey" FOREIGN KEY ("iKCReportId") REFERENCES "IKCReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IKCReport" ADD CONSTRAINT "IKCReport_researchProjectId_fkey" FOREIGN KEY ("researchProjectId") REFERENCES "ResearchProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

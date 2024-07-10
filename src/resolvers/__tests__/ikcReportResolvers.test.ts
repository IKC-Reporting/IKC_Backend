import { describe, expect, it, vi } from "vitest";
import prisma from "../../../libs/__mocks__/prisma";
import ikcReportResolvers from "../ikcReportResolvers";
import { testIKCReport } from "../../__mocks__/index";
vi.mock("../../../libs/prisma");

describe("IKCReportResolvers unit tests", () => {
    describe("IKCReport Queries", () => {
        describe("ikcReport query tests", () => {
            it("should return an IKC report when the ID exists in the database", async () => {
                // Mocking the prisma response
                prisma.iKCReport.findUniqueOrThrow.mockResolvedValue({
                    ...testIKCReport,
                });

                const ikcReport = await ikcReportResolvers.Query.ikcReport(
                    null,
                    { id: "testId" },
                    null,
                    null
                );

                expect(ikcReport?.id).toBe(testIKCReport.id);
            });

            it("should return null if there is a database error", async () => {
                prisma.iKCReport.findUniqueOrThrow.mockRejectedValue(
                    Error("Prisma db error")
                );

                const ikcReport = await ikcReportResolvers.Query.ikcReport(
                    null,
                    { id: "testId" },
                    null,
                    null
                );

                expect(ikcReport).toBe(null);
            });
        });
    });

    describe("IKCReport Mutations", () => {
        describe("createIKCReport tests", () => {
            it("should create an IKC report when given valid data and IDs", async () => {
                prisma.iKCReport.create.mockResolvedValue({
                    ...testIKCReport,
                });

                const ikcReportId = await ikcReportResolvers.Mutation.createIKCReport(
                    null,
                    {
                        userId: "testUserId",
                        partnerOrgId: "testPartnerOrgId",
                        reportStartDate: new Date(),
                        reportEndDate: new Date(),
                        employeeHourIds: ["testHourId"],
                        otherContributionIds: ["testContributionId"],
                    },
                    null,
                    null
                );

                expect(ikcReportId).toBe(testIKCReport.id);
            });

            it("should return null if there is a database error", async () => {
                prisma.iKCReport.create.mockRejectedValue(Error("Prisma db error"));

                const ikcReportId = await ikcReportResolvers.Mutation.createIKCReport(
                    null,
                    {
                        userId: "testUserId",
                        partnerOrgId: "testPartnerOrgId",
                        reportStartDate: new Date(),
                        reportEndDate: new Date(),
                        employeeHourIds: ["testHourId"],
                        otherContributionIds: ["testContributionId"],
                    },
                    null,
                    null
                );

                expect(ikcReportId).toBe(null);
            });
        });

        describe("submitIKCReport tests", () => {
            it("should submit an IKC report when given valid data", async () => {
                prisma.iKCReport.update.mockResolvedValue({
                    ...testIKCReport,
                    submitterId: "testUserId",
                    submissionDate: new Date(),
                });

                const ikcReportId = await ikcReportResolvers.Mutation.submitIKCReport(
                    null,
                    {
                        submitterId: "testUserId",
                        ikcReportID: "testReportId",
                        submissionDate: new Date(),
                    },
                    null,
                    null
                );

                expect(ikcReportId).toBe(testIKCReport.id);
            });

            it("should return null if there is a database error", async () => {
                prisma.iKCReport.update.mockRejectedValue(Error("Prisma db error"));

                const ikcReportId = await ikcReportResolvers.Mutation.submitIKCReport(
                    null,
                    {
                        submitterId: "testUserId",
                        ikcReportID: "testReportId",
                        submissionDate: new Date(),
                    },
                    null,
                    null
                );

                expect(ikcReportId).toBe(null);
            });
        });

        describe("approveIKCReport tests", () => {
            it("should approve an IKC report when given valid data", async () => {
                prisma.iKCReport.update.mockResolvedValue({
                    ...testIKCReport,
                    isApproved: true,
                    approverId: "testUserId",
                    approvalDate: new Date(),
                });

                const isApproved = await ikcReportResolvers.Mutation.approveIKCReport(
                    null,
                    {
                        userId: "testUserId",
                        ikcReportID: "testReportId",
                    },
                    null,
                    null
                );

                expect(isApproved).toBe(true);
            });

            it("should return false if there is a database error", async () => {
                prisma.iKCReport.update.mockRejectedValue(Error("Prisma db error"));

                const isApproved = await ikcReportResolvers.Mutation.approveIKCReport(
                    null,
                    {
                        userId: "testUserId",
                        ikcReportID: "testReportId",
                    },
                    null,
                    null
                );

                expect(isApproved).toBe(false);
            });
        });
    });
});

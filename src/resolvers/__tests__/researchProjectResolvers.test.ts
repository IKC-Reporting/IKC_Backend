import { describe, expect, it, vi } from "vitest";
import prisma from "../../../libs/__mocks__/prisma";
import { testResearchProject, testUser, testPartnerOrg } from "../../__mocks__/index";
import researchProjectResolvers from "../researchProjectResolvers";

vi.mock("../../../libs/prisma");

describe("ResearchProjectResolver unit tests", () => {
    describe("ResearchProject Queries", () => {
        describe("get researchProject query tests", () => {
            it("should return a researchProject with ID exists in the database", async () => {
                prisma.researchProject.findUnique.mockResolvedValue({
                    ...testResearchProject,
                });

                const researchProject = await researchProjectResolvers.Query.researchProject(
                    null,
                    { id: "testId" },
                    null,
                    null
                );

                expect(researchProject?.id).toBe(testResearchProject.id);
            });

            it("should return null if researchProject with ID does not exist", async () => {
                prisma.researchProject.findUnique.mockResolvedValue(null);

                const researchProject = await researchProjectResolvers.Query.researchProject(
                    null,
                    { id: "nonExistentId" },
                    null,
                    null
                );

                expect(researchProject).toBe(null);
            });

            it("should handle database errors", async () => {
                prisma.researchProject.findUnique.mockRejectedValue(new Error("Prisma db error"));

                const researchProject = await researchProjectResolvers.Query.researchProject(
                    null,
                    { id: "testId" },
                    null,
                    null
                );

                expect(researchProject).toBe(null);
            });
        });
    });

    describe("ResearchProject Mutations", () => {
        describe("createResearchProject mutation tests", () => {
            it("should create a researchProject when given valid data", async () => {
                prisma.researchProject.create.mockResolvedValue({ ...testResearchProject });

                const researchProjectId = await researchProjectResolvers.Mutation.createResearchProject(
                    null,
                    {
                        siteAdminId: testUser.id,
                        adminId: testUser.id,
                        projectTitle: testResearchProject.projectTitle,
                        startDate: testResearchProject.startDate,
                        endDate: testResearchProject.endDate,
                    },
                    null,
                    null
                );

                expect(researchProjectId).toBe(testResearchProject.id);
            });

            it("should fail when given invalid data", async () => {
                prisma.researchProject.create.mockRejectedValue(new Error("Invalid input data"));

                const researchProjectId = await researchProjectResolvers.Mutation.createResearchProject(
                    null,
                    {
                        siteAdminId: testUser.id,
                        adminId: testUser.id,
                        projectTitle: testResearchProject.projectTitle,
                        startDate: testResearchProject.startDate,
                        endDate: testResearchProject.endDate,
                    },
                    null,
                    null
                );

                expect(researchProjectId).toBe(null);
            });
        });

        describe("addPartnerOrg mutation tests", () => {
            it("should add a partnerOrg to the researchProject when given valid data", async () => {
                prisma.researchProject.update.mockResolvedValue({ ...testResearchProject });

                const success = await researchProjectResolvers.Mutation.addPartnerOrg(
                    null,
                    {
                        userId: testResearchProject.id,
                        researchProjectId: testResearchProject.id,
                        partnerOrgId: testPartnerOrg.id,
                    },
                    null,
                    null
                );

                expect(success).toBe(true);
            });

            it("should fail when given invalid data", async () => {
                prisma.researchProject.update.mockRejectedValue(new Error("Invalid input data"));

                const success = await researchProjectResolvers.Mutation.addPartnerOrg(
                    null,
                    {
                        userId: testResearchProject.id,
                        researchProjectId: testResearchProject.id,
                        partnerOrgId: testPartnerOrg.id,
                    },
                    null,
                    null
                );

                expect(success).toBe(false);
            });
        });

        describe("removePartnerOrg mutation tests", () => {
            it("should remove a partnerOrg from the researchProject when given valid data", async () => {
                prisma.researchProject.update.mockResolvedValue({ ...testResearchProject });

                const success = await researchProjectResolvers.Mutation.removePartnerOrg(
                    null,
                    {
                        userId: testResearchProject.id,
                        researchProjectId: testResearchProject.id,
                        partnerOrgId: testPartnerOrg.id,
                    },
                    null,
                    null
                );

                expect(success).toBe(true);
            });

            it("should fail when given invalid data", async () => {
                prisma.researchProject.update.mockRejectedValue(new Error("Invalid input data"));

                const success = await researchProjectResolvers.Mutation.removePartnerOrg(
                    null,
                    {
                        userId: testResearchProject.id,
                        researchProjectId: testResearchProject.id,
                        partnerOrgId: testPartnerOrg.id,
                    },
                    null,
                    null
                );

                expect(success).toBe(false);
            });
        });

        describe("addNewAdmin mutation tests", () => {
            it("should add a new admin to the researchProject when given valid data", async () => {
                prisma.researchProject.update.mockResolvedValue({ ...testResearchProject });

                const success = await researchProjectResolvers.Mutation.addNewAdmin(
                    null,
                    {
                        userId: testResearchProject.id,
                        newAdmin: testUser.id,
                    },
                    null,
                    null
                );

                expect(success).toBe(true);
            });

            it("should fail when given invalid data", async () => {
                prisma.researchProject.update.mockRejectedValue(new Error("Invalid input data"));

                const success = await researchProjectResolvers.Mutation.addNewAdmin(
                    null,
                    {
                        userId: testResearchProject.id,
                        newAdmin: testUser.id,
                    },
                    null,
                    null
                );

                expect(success).toBe(false);
            });
        });

        describe("removeAdmin mutation tests", () => {
            it("should remove an admin from the researchProject when given valid data", async () => {
                prisma.researchProject.update.mockResolvedValue({ ...testResearchProject });

                const success = await researchProjectResolvers.Mutation.removeAdmin(
                    null,
                    {
                        userId: testResearchProject.id,
                        adminId: testUser.id,
                    },
                    null,
                    null
                );

                expect(success).toBe(true);
            });

            it("should fail when given invalid data", async () => {
                prisma.researchProject.update.mockRejectedValue(new Error("Invalid input data"));

                const success = await researchProjectResolvers.Mutation.removeAdmin(
                    null,
                    {
                        userId: testResearchProject.id,
                        adminId: testUser.id,
                    },
                    null,
                    null
                );

                expect(success).toBe(false);
            });
        });
    });
});

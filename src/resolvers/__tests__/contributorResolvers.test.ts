import { describe, expect, it, vi } from "vitest";
import prisma from "../../../libs/__mocks__/prisma";
import {
  testAdmin,
  testContributor,
  testPartnerOrg,
  testUser,
} from "../../__mocks__/index";
import contributorResolvers from "../contributorResolvers";
vi.mock("../../../libs/prisma");

describe("ContributorResolver unit tests", () => {
  describe("Contributor Queries", () => {
    describe("get contributor query tests", () => {
      it("should return a contributor with ID exists in the database", async () => {
        prisma.contributor.findUniqueOrThrow.mockResolvedValue({
          ...testContributor,
        });

        const contributor = await contributorResolvers.Query.contributor(
          null,
          { userId: "testId" },
          null,
          null
        );

        expect(contributor?.id).toBe(testContributor.id);
      });

      it("should return an error if there is a database error", async () => {
        prisma.contributor.findUniqueOrThrow.mockRejectedValue(
          Error("Prisma db error")
        );

        expect(
          await contributorResolvers.Query.contributor(
            null,
            "testId",
            null,
            null
          )
        ).toBe(null);
      });
    });
  });

  describe("Contributor Mutations", () => {
    describe("createContributor tests", () => {
      it("should create a contributor when given data & IDs", async () => {
        prisma.partnerOrg.findUniqueOrThrow.mockResolvedValue({
          ...testPartnerOrg,
        });
        prisma.user.findUniqueOrThrow.mockResolvedValue({
          ...testAdmin,
        });

        prisma.contributor.create.mockResolvedValue({
          ...testContributor,
          id: testContributor.id,
          userId: testUser.id,
        });

        prisma.user.update.mockResolvedValue({ ...testUser });

        const contributorId =
          await contributorResolvers.Mutation.createContributor(
            null,
            {
              userId: testUser.id,
              partnerOrgAdminId: testAdmin.id,
              partnerOrgId: testContributor.partnerOrgId,
              hourlyRate: testContributor.hourlyRate,
              benRatePer: testContributor.benRatePer,
            },
            null,
            null
          );

        expect(contributorId).toBe(testContributor.id);
      });

      it("should fail when given data & an invalid admin Id", async () => {
        prisma.partnerOrg.findUniqueOrThrow.mockResolvedValue({
          ...testPartnerOrg,
        });
        prisma.user.findUniqueOrThrow.mockResolvedValue({
          ...testUser,
        });

        prisma.contributor.create.mockResolvedValue({ ...testContributor });

        prisma.user.update.mockResolvedValue({ ...testUser });

        const contributorId =
          await contributorResolvers.Mutation.createContributor(
            null,
            {
              userId: testUser.id,
              partnerOrgAdminId: testUser.id,
              partnerOrgId: testContributor.partnerOrgId,
              hourlyRate: testContributor.hourlyRate,
              benRatePer: testContributor.benRatePer,
            },
            null,
            null
          );

        expect(contributorId).toBe(null);
      });

      it("should fail when db returns null / userId & returned user don't match", async () => {
        prisma.partnerOrg.findUniqueOrThrow.mockResolvedValue({
          ...testPartnerOrg,
        });
        prisma.user.findUniqueOrThrow.mockResolvedValue({
          ...testAdmin,
        });

        // @ts-ignore
        prisma.contributor.create.mockResolvedValue(null);

        prisma.user.update.mockResolvedValue({ ...testUser });

        const contributorId =
          await contributorResolvers.Mutation.createContributor(
            null,
            {
              userId: testUser.id,
              partnerOrgAdminId: testAdmin.id,
              partnerOrgId: testContributor.partnerOrgId,
              hourlyRate: testContributor.hourlyRate,
              benRatePer: testContributor.benRatePer,
            },
            null,
            null
          );

        expect(contributorId).toBe(null);
      });

      it("should fail when db returns null / userId & returned user don't match", async () => {
        prisma.partnerOrg.findUniqueOrThrow.mockResolvedValue({
          ...testPartnerOrg,
        });
        prisma.user.findUniqueOrThrow.mockImplementation(() => {
          throw new Error("primsa db error");
        });

        const contributorId =
          await contributorResolvers.Mutation.createContributor(
            null,
            {
              userId: testUser.id,
              partnerOrgAdminId: testAdmin.id,
              partnerOrgId: testContributor.partnerOrgId,
              hourlyRate: testContributor.hourlyRate,
              benRatePer: testContributor.benRatePer,
            },
            null,
            null
          );

        expect(contributorId).toBe(null);
      });
    });
  });
});

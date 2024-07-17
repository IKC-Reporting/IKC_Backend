import { describe, expect, it, vi } from "vitest";
import prisma from "../../../libs/__mocks__/prisma";
import { testAdmin, testPartnerOrg, testUser } from "../../__mocks__/index";
import partnerOrgResolvers from "../partnerOrgResolvers";

// Mocking Prisma
vi.mock("../../../libs/prisma");

describe("PartnerOrgResolver unit tests", () => {
  describe("PartnerOrg Queries", () => {
    describe("get partnerOrg query tests", () => {
      it("should return a partnerOrg with ID exists in the database", async () => {
        prisma.partnerOrg.findUnique.mockResolvedValue({
          ...testPartnerOrg,
        });

        const partnerOrg = await partnerOrgResolvers.Query.partnerOrg(
          null,
          { id: "testId" },
          null,
          null
        );

        expect(partnerOrg?.id).toBe(testPartnerOrg.id);
      });

      it("should return null if partnerOrg with ID does not exist", async () => {
        prisma.partnerOrg.findUnique.mockResolvedValue(null);

        const partnerOrg = await partnerOrgResolvers.Query.partnerOrg(
          null,
          { id: "nonExistentId" },
          null,
          null
        );

        expect(partnerOrg).toBe(null);
      });

      it("should handle database errors", async () => {
        prisma.partnerOrg.findUnique.mockRejectedValue(
          new Error("Prisma db error")
        );

        const partnerOrg = await partnerOrgResolvers.Query.partnerOrg(
          null,
          { id: "testId" },
          null,
          null
        );

        expect(partnerOrg).toBe(null);
      });
    });
  });

  describe("PartnerOrg Mutations", () => {
    describe("createPartnerOrg mutation tests", () => {
      it("should create a partnerOrg when given valid data", async () => {
        prisma.user.findUniqueOrThrow.mockResolvedValue({ ...testAdmin });
        prisma.partnerOrg.create.mockResolvedValue({ ...testPartnerOrg });

        const partnerOrgId =
          await partnerOrgResolvers.Mutation.createPartnerOrg(
            null,
            {
              siteAdminId: testUser.id,
              adminId: testUser.id,
              name: testPartnerOrg.name,
            },
            null,
            null
          );

        expect(partnerOrgId).toBe(testPartnerOrg.id);
      });

      it("should fail when given invalid data", async () => {
        prisma.user.findUniqueOrThrow.mockResolvedValue({ ...testAdmin });
        prisma.partnerOrg.create.mockRejectedValue(
          new Error("Invalid input data")
        );

        const partnerOrgId =
          await partnerOrgResolvers.Mutation.createPartnerOrg(
            null,
            {
              siteAdminId: testUser.id,
              adminId: testUser.id,
              name: testPartnerOrg.name,
            },
            null,
            null
          );

        expect(partnerOrgId).toBe(null);
      });
    });

    describe("addPartnerOrgAdmin mutation tests", () => {
      it("should add a new admin to the partnerOrg when given valid data", async () => {
        prisma.user.findUniqueOrThrow.mockResolvedValue({ ...testAdmin });
        prisma.partnerOrg.update.mockResolvedValue({ ...testPartnerOrg });
        prisma.partnerOrg.findUniqueOrThrow.mockResolvedValue({
          ...testPartnerOrg,
          // @ts-ignore
          admins: [testUser],
        });

        const success = await partnerOrgResolvers.Mutation.addPartnerOrgAdmin(
          null,
          {
            orgId: testPartnerOrg.id,

            newAdminId: testUser.id,
          },
          null,
          null
        );

        expect(success).toBe(true);
      });

      it("should fail when given invalid data", async () => {
        prisma.partnerOrg.update.mockRejectedValue(
          new Error("Invalid input data")
        );

        const success = await partnerOrgResolvers.Mutation.addPartnerOrgAdmin(
          null,
          {
            userId: testPartnerOrg.id,
            newAdminId: testUser.id,
          },
          null,
          null
        );

        expect(success).toBe(false);
      });
    });

    describe("removePartnerOrgAdmin mutation tests", () => {
      it("should remove an admin from the partnerOrg when given valid data", async () => {
        prisma.user.findUniqueOrThrow.mockResolvedValue({
          ...testAdmin,
        });
        prisma.partnerOrg.update.mockResolvedValue({ ...testPartnerOrg });

        prisma.partnerOrg.findUniqueOrThrow.mockResolvedValue({
          ...testPartnerOrg,
        });

        const success =
          await partnerOrgResolvers.Mutation.removePartnerOrgAdmin(
            null,
            {
              orgId: testPartnerOrg.id,
              removedAdminId: testUser.id,
            },
            null,
            null
          );

        expect(success).toBe(true);
      });

      it("should fail when given invalid data", async () => {
        prisma.partnerOrg.update.mockRejectedValue(
          new Error("Invalid input data")
        );

        const success =
          await partnerOrgResolvers.Mutation.removePartnerOrgAdmin(
            null,
            {
              userId: testPartnerOrg.id,
              removedAdminId: testUser.id,
            },
            null,
            null
          );

        expect(success).toBe(false);
      });
    });
  });
});

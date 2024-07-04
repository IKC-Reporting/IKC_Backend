import { describe, expect, it, vi } from "vitest";
import prisma from "../../../libs/__mocks__/prisma";
import contributorResolvers from "../contributorResolvers";

vi.mock("../../../libs/prisma");

const testUser = {
  id: "testUserId",
  firstName: "newUser",
  lastName: "exLastname",
  siteAdmin: false,
  active: true,
};

const testAdmin = {
  id: "testAdminId",
  firstName: "newAdmin",
  lastName: "exLastname",
  siteAdmin: true,
  active: true,
};

const testPartnerOrg = {
  id: "testPartnerOrgId",
  ResearchProject: null,
  researchProjectId: null,
  name: "example org name",
  admins: [testUser],
  contributors: null,
};

const testContributor = {
  id: "testContributorId",

  userId: testUser.id,
  partnerOrgId: "partnerOrgID",
  annualSalary: 45000,
  dailyHours: 8,
  benRatePer: 0.1,
  HourContribItem: [null],
  OtherContribItem: [null],
};

describe("ContributorResolver unit tests", () => {
  describe("User Queries", () => {
    describe("get user query tests", () => {
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

  describe.skip("User Mutations", () => {});
});

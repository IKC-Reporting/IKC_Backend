import { describe, expect, it, vi } from "vitest";
import prisma from "../../../libs/__mocks__/prisma";
import { testContributionItem } from "../../__mocks__";
import contributionResolvers from "../contributionResolvers";

vi.mock("../../../libs/prisma");

describe("ContributionResolver unit tests", () => {
  describe("Contribution Queries", () => {
    describe("get contributor query tests", () => {
      it("should get a contribution when given a valid id & user", async () => {
        prisma.contribItem.findUnique.mockResolvedValue({
          ...testContributionItem,
        });

        const contribution = await contributionResolvers.Query?.contribution(
          null,
          { id: testContributionItem.id },
          null,
          null
        );

        expect(contribution?.id).toBe(testContributionItem.id);
      });
    });
  });
});

import { describe, expect, it, vi } from "vitest";
import userResolvers from "../userResolvers";
import { randomUUID } from "crypto";
import prisma from "../../../libs/__mocks__/prisma";

vi.mock("../../../libs/prisma");

const testUser = {
  id: randomUUID(),
  firstName: "newUser",
  lastName: "exLastname",
  siteAdmin: false,
  active: true,
};

const testAdmin = {
  id: randomUUID(),
  firstName: "newAdmin",
  lastName: "exLastname",
  siteAdmin: true,
  active: true,
};

describe("User resolver tests", () => {
  describe("user Queries", () => {
    describe("get user query tests", () => {
      it("should return a user if ID exists in the database", async () => {
        prisma.user.findUniqueOrThrow.mockResolvedValue({ ...testUser });

        const user = await userResolvers.Query.user(
          null,
          { userId: "testId" },
          null,
          null
        );

        expect(user?.id).toBe(testUser.id);
      });

      it("should return an error if there is a database error", async () => {
        prisma.user.findUniqueOrThrow.mockRejectedValue(
          Error("Prisma db error")
        );

        expect(await userResolvers.Query.user(null, "testId", null, null)).toBe(
          null
        );
      });
    });
  });
  describe("User Mutations", () => {
    describe("createUser tests", () => {
      it("should create a user when given data & a correct admin ID", async () => {
        prisma.user.findUniqueOrThrow.mockResolvedValue({
          ...testAdmin,
        });
        prisma.user.create.mockResolvedValue({ ...testUser, id: "newUser123" });

        const userId = await userResolvers.Mutation.createUser(
          null,
          {
            siteAdminId: testAdmin.id,
            firstName: testUser.firstName,
            lastName: testUser.lastName,
            isSiteAdmin: testUser.siteAdmin,
          },
          null,
          null
        );

        expect(userId).toBe("newUser123");
      });

      it("should fail when given data & an invalid admin Id", async () => {
        prisma.user.findUniqueOrThrow.mockResolvedValue({ ...testUser });

        expect(
          await userResolvers.Mutation.createUser(
            null,
            {
              siteAdminId: testAdmin.id,
              firstName: testUser.firstName,
              lastName: testUser.lastName,
              isSiteAdmin: testUser.siteAdmin,
            },
            null,
            null
          )
        ).toBe(null);
      });

      it("should fail when given invalid data / db error", async () => {
        prisma.user.findUniqueOrThrow.mockResolvedValue({
          ...testAdmin,
        });

        // @ts-ignore
        prisma.user.create.mockResolvedValue(null);

        expect(
          await userResolvers.Mutation.createUser(
            null,
            {
              siteAdminId: testAdmin.id,
              firstName: testUser.firstName,
              lastName: testUser.lastName,
              isSiteAdmin: testUser.siteAdmin,
            },
            null,
            null
          )
        ).toBe(null);
      });
    });

    describe("updateUser tests", () => {
      it("should succeed if given valid inputs", async () => {
        prisma.user.update.mockResolvedValue({ ...testUser });
        prisma.user.findUniqueOrThrow.mockResolvedValue({
          ...testUser,
          firstName: "newFirstname",
        });

        const response = await userResolvers.Mutation.updateUser(
          null,
          {
            userId: testAdmin.id,
            firstName: "newFirstname",
            lastName: testUser.lastName,
          },
          null,
          null
        );

        expect(response).toBeTruthy();
      });

      it("should fail if the returned user after update has old/wrong fields", async () => {
        prisma.user.update.mockResolvedValue({ ...testAdmin });
        prisma.user.findUniqueOrThrow.mockResolvedValue({
          ...testUser,
        });

        const response = await userResolvers.Mutation.updateUser(
          null,
          {
            userId: testAdmin.id,
            firstName: "newFirstname",
            lastName: testUser.lastName,
          },
          null,
          null
        );

        expect(response).toBeFalsy();
      });

      it("should fail if there is a DB error", async () => {
        prisma.user.update.mockImplementation(() => {
          throw new Error("primsa db error");
        });

        const response = await userResolvers.Mutation.updateUser(
          null,
          {
            userId: testAdmin.id,
            firstName: testUser.firstName,
            lastName: testUser.lastName,
          },
          null,
          null
        );

        expect(response).toBeFalsy();
      });
    });

    describe("disableUser tests", () => {
      it("should succeed if given valid inputs", async () => {
        prisma.user.findUniqueOrThrow.mockResolvedValue({ ...testAdmin });
        prisma.user.update.mockResolvedValue({ ...testUser, active: false });

        const response = await userResolvers.Mutation.disableUser(
          null,
          {
            userId: testUser.id,
            siteAdminId: testAdmin.id,
          },
          null,
          null
        );

        expect(response).toBeTruthy();
      });

      it("should fail if the returned user after update has old/wrong fields", async () => {
        prisma.user.findUniqueOrThrow.mockResolvedValue({ ...testAdmin });
        prisma.user.update.mockResolvedValue({ ...testUser });

        const response = await userResolvers.Mutation.disableUser(
          null,
          {
            userId: testUser.id,
            siteAdminId: testAdmin.id,
          },
          null,
          null
        );

        expect(response).toBeFalsy();
      });

      it("should fail if there is a DB error", async () => {
        prisma.user.findUniqueOrThrow.mockImplementation(() => {
          throw new Error("prisma db error");
        });
        prisma.user.update.mockResolvedValue({ ...testUser, active: false });

        const response = await userResolvers.Mutation.disableUser(
          null,
          {
            userId: testUser.id,
            siteAdminId: testAdmin.id,
          },
          null,
          null
        );

        expect(response).toBeFalsy();
      });
    });

    describe("reactivateUser tests", () => {
      it("should succeed if given valid inputs", async () => {
        prisma.user.findUniqueOrThrow.mockResolvedValue({ ...testAdmin });
        prisma.user.update.mockResolvedValue({ ...testUser, active: true });

        const response = await userResolvers.Mutation.reactivateUser(
          null,
          {
            userId: testUser.id,
            siteAdminId: testAdmin.id,
          },
          null,
          null
        );

        expect(response).toBeTruthy();
      });

      it("should fail if the returned user after update has old/wrong fields", async () => {
        prisma.user.findUniqueOrThrow.mockResolvedValue({ ...testAdmin });
        prisma.user.update.mockResolvedValue({ ...testUser, active: false });

        const response = await userResolvers.Mutation.reactivateUser(
          null,
          {
            userId: testUser.id,
            siteAdminId: testAdmin.id,
          },
          null,
          null
        );

        expect(response).toBeFalsy();
      });

      it("should fail if there is a DB error", async () => {
        prisma.user.findUniqueOrThrow.mockImplementation(() => {
          throw new Error("prisma db error");
        });
        prisma.user.update.mockResolvedValue({ ...testUser });

        const response = await userResolvers.Mutation.reactivateUser(
          null,
          {
            userId: testUser.id,
            siteAdminId: testAdmin.id,
          },
          null,
          null
        );

        expect(response).toBeFalsy();
      });
    });
  });
});

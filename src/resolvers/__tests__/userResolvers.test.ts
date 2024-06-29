import { describe, expect, it, vi } from "vitest";
import userResolvers from "../userResolvers";
import { randomUUID } from "crypto";
import prisma from "../../../libs/__mocks__/prisma";

vi.mock("../../../libs/prisma");

describe("User resolver tests", () => {
  it("should create a user with a random uuid", async () => {
    const newUser = {
      creatorId: randomUUID(),
      firstName: "newuser",
      lastName: "exLastname",
      siteAdmin: false,
    };

    prisma.user.create.mockResolvedValue({ ...newUser, id: "newUser123" });
    const userId = userResolvers.Mutation.createUser(
      newUser.creatorId,
      newUser.firstName,
      newUser.lastName,
      newUser.siteAdmin
    );

    expect(userId).toBeTruthy();
  });
});

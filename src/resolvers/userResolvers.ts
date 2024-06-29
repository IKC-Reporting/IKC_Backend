import { randomUUID } from "crypto";
import { User } from "../generated/graphql";
import prisma from "../../libs/prisma";

export default {
  Query: {
    async user(id) {
      const mockUser: User = {
        firstName: "exFirstname",
        lastName: "exLastname",
        siteAdmin: false,
        id: "abc123-uuid-mock-value",
      };
      return mockUser;
    },
  },
  Mutation: {
    async createUser(creatorId, firstName, lastName, isSiteAdmin) {
      const creator = {
        firstName: "exFirstname",
        lastName: "exLastname",
        siteAdmin: true,
        id: creatorId,
      };

      if (creator.siteAdmin === true) {
        // add to db
        const newUser = await prisma.user.create({
          data: {
            firstName,
            lastName,
            siteAdmin: isSiteAdmin,
            id: randomUUID(),
          },
        });

        // return id
        return newUser.id;
      } else {
        return null;
      }
    },
  },
};

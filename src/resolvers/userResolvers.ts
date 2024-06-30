import { randomUUID } from "crypto";
import { User } from "../generated/graphql";
import prisma from "../../libs/prisma.js";
import { logger } from "../utils/Logger.js";

export default {
  Query: {
    user: async (parent, args, context, info) => {
      const { id } = args;

      logger.info(`querying user with id: ${id}`);
      try {
        const user: User = await prisma.user.findFirst({ where: { id } });

        return { ...user };
      } catch (error) {
        logger.error(`error with user query`, error);
        return null;
      }
    },
  },
  Mutation: {
    createUser: async (parent, args, context, info) => {
      const { creatorId, firstName, lastName, isSiteAdmin } = args;

      logger.info(
        `creating user with: creatorId: ${creatorId}, firstName: ${firstName}, lastName: ${lastName}, isSiteAdmin: ${isSiteAdmin}`
      );
      try {
        const creator: User = await prisma.user.findFirst({
          where: { id: creatorId },
        });

        if (creator.siteAdmin === true) {
          const newUser = await prisma.user.create({
            data: {
              firstName,
              lastName,
              siteAdmin: isSiteAdmin,
              id: randomUUID(),
            },
          });

          if (newUser) {
            return newUser.id;
          }
        } else {
          logger.warn(
            `failed to create user, creatorId: ${creatorId} not siteAdmin`
          );
          return null;
        }
      } catch (error) {
        logger.error(`error creating user`, error);
        return null;
      }
    },
  },
};

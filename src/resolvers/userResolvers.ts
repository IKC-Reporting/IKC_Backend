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
        logger.error(`error with user query: ${error}`);
        return null;
      }
    },
  },
  Mutation: {
    createUser: async (parent, args, context, info) => {
      const { siteAdminId, firstName, lastName, isSiteAdmin } = args;

      logger.info(
        `creating user with: creatorId: ${siteAdminId}, firstName: ${firstName}, lastName: ${lastName}, isSiteAdmin: ${isSiteAdmin}`
      );
      try {
        const creator: User = await prisma.user.findFirstOrThrow({
          where: { id: siteAdminId },
        });

        if (creator?.siteAdmin) {
          const newUser = await prisma.user.create({
            data: {
              firstName,
              lastName,
              siteAdmin: isSiteAdmin,
              id: randomUUID(),
            },
          });

          if (newUser) {
            logger.info(
              `new user: { firstName: ${newUser.firstName}, lastName: ${newUser.lastName}, siteAdmin: ${newUser.siteAdmin}, id: ${newUser.id} }`
            );
            return newUser.id;
          } else {
            return null;
          }
        } else {
          logger.warn(
            `failed to create user, creatorId: ${siteAdminId} not siteAdmin`
          );
          return null;
        }
      } catch (error) {
        logger.error(`error creating user: ${error}`);
        return null;
      }
    },
  },
};

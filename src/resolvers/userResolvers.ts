import { randomUUID } from "crypto";
import prisma from "../../libs/prisma.js";
import { User } from "../generated/graphql";
import { logger } from "../utils/Logger.js";
import {
  checkPassword,
  genPasswordHash,
  validateLoginVars,
} from "../utils/auth.js";

export default {
  Query: {
    user: async (parent, args, context, info) => {
      const { id } = args;

      logger.info(`querying user with id: ${id}`);
      try {
        // pull out password to not share it
        const { password, ...user } = await prisma.user.findUniqueOrThrow({
          where: { id, active: true },
        });

        // don't need to check as OrThrow already triggers an error if no user is found
        return { ...user };
      } catch (error) {
        logger.error(`error with user query: ${error}`);
        return null;
      }
    },
    login: async (parent, args, context, info) => {
      const { email, password } = args;
      try {
        validateLoginVars(email, password);
        const result = await checkPassword(password, email);
        return result;
      } catch (error) {
        logger.error(`error with user query: ${error}`);
        return null;
      }
    },
  },
  Mutation: {
    createUser: async (parent, args, context, info) => {
      const { siteAdminId, firstName, lastName, email, password, isSiteAdmin } =
        args;

      logger.info(
        `creating user with: creatorId: ${siteAdminId}, firstName: ${firstName}, lastName: ${lastName}, email: ${email}, isSiteAdmin: ${isSiteAdmin}`
      );
      try {
        // check if creator is active & has correct authority
        const creator: User = await prisma.user.findUniqueOrThrow({
          where: { id: siteAdminId, active: true },
        });

        if (!creator?.siteAdmin) {
          throw new Error(
            `failed to create user, creatorId: ${siteAdminId} not siteAdmin`
          );
        }

        // for now this is hardcoded...
        if (!validateLoginVars(email, password)) {
          throw new Error(`invalid login email`);
        }
        const hashedPassword = await genPasswordHash(password);
        // if they do then create a new active user with a unique id
        const newUser = await prisma.user.create({
          data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            siteAdmin: isSiteAdmin,
            id: randomUUID(),
            active: true,
          },
        });

        if (newUser) {
          logger.info(
            `new user: { firstName: ${newUser.firstName}, lastName: ${newUser.lastName}, siteAdmin: ${newUser.siteAdmin}, id: ${newUser.id} }`
          );
          return newUser.id;
        } else {
          throw new Error(
            `new user returned null or undefined from prisma create`
          );
        }
      } catch (error) {
        logger.error(`error creating user: ${error}`);
        return null;
      }
    },

    updateUser: async (parent, args, context, info) => {
      const { userId, firstName, lastName } = args;

      logger.info(
        `updating user ${userId} with new firstName: ${firstName}, lastName: ${lastName}`
      );
      try {
        const activeUserCheck = await prisma.user.findUniqueOrThrow({
          where: { id: userId },
        });

        if (activeUserCheck.active === false) {
          throw new Error(`unable to update ${userId} user deactivated`);
        }

        await prisma.user.update({
          where: { id: userId },
          data: { firstName, lastName },
        });

        const user = await prisma.user.findUniqueOrThrow({
          where: { id: userId },
        });

        // check if user name is updated, assuming input was not null
        if (
          (firstName === undefined || user.firstName === firstName) &&
          (lastName === undefined || user.lastName === lastName)
        ) {
          logger.info(`successfully updated user`);
          return true;
        } else {
          logger.warn(
            `failure updated user, updated names not returned from prisma response`
          );
          return false;
        }
      } catch (error) {
        logger.error(`error updating user: ${error}`);
        return false;
      }
    },

    disableUser: async (parent, args, context, info) => {
      const { siteAdminId, userId } = args;

      try {
        // check if creator is active & has correct authority
        const creator: User = await prisma.user.findUniqueOrThrow({
          where: { id: siteAdminId, active: true },
        });

        if (!creator?.siteAdmin) {
          throw new Error(
            `cannot deactivate ${userId}, ${siteAdminId} not site admin`
          );
        }
        // if they do then toggle the active state to false
        const user = await prisma.user.update({
          where: { id: userId },
          data: { active: false },
        });

        if (!user.active) {
          logger.info(`successfully disabled user ${user.id}`);
          return true;
        } else {
          logger.warn(
            `failure to disable user, incorrect state returned from prisma response for user ${user.id}`
          );
          return false;
        }
      } catch (error) {
        logger.error(`error disabling user: ${error}`);
        return false;
      }
    },

    reactivateUser: async (parent, args, context, info) => {
      const { siteAdminId, userId } = args;

      try {
        // check if creator is active & has correct authority
        const creator: User = await prisma.user.findUniqueOrThrow({
          where: { id: siteAdminId, active: true },
        });

        if (!creator?.siteAdmin) {
          throw new Error(`invalid site admin credentials for ${siteAdminId}`);
        }

        // if they do then toggle the active state to true
        const user = await prisma.user.update({
          where: { id: userId },
          data: { active: true },
        });

        if (user.active) {
          logger.info(`successfully enabled user ${user.id}`);
          return true;
        } else {
          logger.warn(
            `failure to enable user, incorrect state returned from prisma response for user ${user.id}`
          );
          return false;
        }
      } catch (error) {
        logger.error(`error disabling user: ${error}`);
        return false;
      }
    },
  },
};

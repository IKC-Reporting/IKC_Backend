import { randomUUID } from "crypto";
import prisma from "../../libs/prisma";
import { logger } from "../utils/Logger";
import { getContribution, getContributionsArray } from "../utils/reducers";

export default {
  Query: {
    contribution: async (parent, args, context, info) => {
      const { id } = args;
      logger.info(`querying contribution with id: ${id}`);

      try {
        const contribution = await prisma.contribItem.findUnique({
          where: { id },
          include: {
            Contributor: true,
            IKCReport: true,
            hourContribution: true,
            otherContribution: true,
          },
        });

        // putting this into a function as it is reused elsewhere
        return getContribution(contribution);
      } catch (error) {
        logger.error(`error with contribution query: ${error}`);
        return null;
      }
    },
    getAllContributionsForUser: async (parent, args, context, info) => {
      const { userId } = args;

      logger.info(`getting all contributions for user: ${userId}`);
      try {
        const user = await prisma.user.findUniqueOrThrow({
          where: { id: userId },
          include: { contributorAssignments: { select: { id: true } } },
        });

        const contributions = await prisma.contribItem.findMany({
          where: {
            contributorId: {
              in: user.contributorAssignments.map(
                (contributor) => contributor.id
              ),
            },
          },
          include: { hourContribution: true, otherContribution: true },
        });

        return getContributionsArray(contributions);
      } catch (error) {
        throw new Error(
          `error with getAllContributionsForUser query: ${error}`
        );
      }
    },
    getAllContributionsForContributor: async (parent, args, context, info) => {
      const { contributorId } = args;
      logger.info(
        `getting all contributions for contributor: ${contributorId}`
      );
      try {
        const contributor = await prisma.contributor.findUniqueOrThrow({
          where: { id: contributorId },
          include: {
            contributions: {
              include: { hourContribution: true, otherContribution: true },
            },
          },
        });

        return getContributionsArray(contributor.contributions);
      } catch (error) {
        throw new Error(
          `error with getAllContributionsForUser query: ${error}`
        );
      }
    },
  },
  Mutation: {
    createHourContribution: async (parent, args, context, info) => {
      const { contributorId, date, details, hours } = args;

      try {
        const contributor = await prisma.contributor.findUniqueOrThrow({
          where: { id: contributorId },
          include: { ResearchProject: true },
        });

        if (
          new Date(date).getTime() <
          new Date(contributor.ResearchProject.startDate).getTime()
        ) {
          throw new Error(`contribution before project start date`);
        } else if (
          new Date(date).getTime() >
          new Date(contributor.ResearchProject.endDate).getTime()
        ) {
          throw new Error(`contribution after project end date`);
        }

        if (hours <= 0) {
          throw new Error(`hours not above 0`);
        }

        const newContribution = await prisma.contribItem.create({
          data: {
            id: randomUUID(),
            contributorId,
            date: new Date(date),
            details,
          },
        });
        if (newContribution) {
          const newHourlyContribution = await prisma.hourContribution.create({
            data: {
              contribItemId: newContribution.id,
              hours,
              hourlyRate: contributor.hourlyRate,
              benRatePer: contributor.benRatePer,
            },
          });
          if (newHourlyContribution) {
            return newHourlyContribution.contribItemId;
          } else {
            throw new Error(
              `hourly contribution returning null after creation`
            );
          }
        } else {
          throw new Error(`contribution returning null after creation`);
        }
      } catch (error) {
        logger.error(`error with creating hourly contribution: ${error}`);
        return null;
      }
    },
    createOtherContribution: async (parent, args, context, info) => {
      const { contributorId, date, details, itemName, value, items } = args;

      try {
        const contributor = await prisma.contributor.findUniqueOrThrow({
          where: { id: contributorId },
          include: { ResearchProject: true },
        });

        if (
          new Date(date).getTime() <
          new Date(contributor.ResearchProject.startDate).getTime()
        ) {
          throw new Error(`contribution before project start date`);
        } else if (
          new Date(date).getTime() >
          new Date(contributor.ResearchProject.endDate).getTime()
        ) {
          throw new Error(`contribution after project end date`);
        }

        if (value <= 0) {
          throw new Error(`value not above 0`);
        } else if (items <= 0) {
          throw new Error(`items or items not above 0`);
        }

        const newContribution = await prisma.contribItem.create({
          data: {
            id: randomUUID(),
            contributorId,
            date: new Date(date),
            details,
          },
        });
        if (newContribution) {
          const newOtherContribution = await prisma.otherContribution.create({
            data: {
              contribItemId: newContribution.id,
              itemName,
              value,
              items,
            },
          });
          if (newOtherContribution) {
            return newOtherContribution.contribItemId;
          } else {
            throw new Error(`other contribution returning null after creation`);
          }
        } else {
          throw new Error(`contribution returning null after creation`);
        }
      } catch (error) {
        logger.error(`error with creating hourly contribution: ${error}`);
        return null;
      }
    },
    removeContribution: async (parent, args, context, info) => {
      const { userId, contributionId } = args;

      try {
        // get contribution item, then get contributor from matching user + contribution for verifying access permission
        const contribution = await prisma.contribItem.findUniqueOrThrow({
          where: { id: contributionId },
          include: {
            hourContribution: true,
            otherContribution: true,
            Contributor: {
              include: {
                PartnerOrg: { include: { admins: true } },
                User: true,
              },
            },
          },
        });

        const user = await prisma.user.findUniqueOrThrow({
          where: { id: userId },
        });

        const userCheck = contribution.Contributor.User.id !== userId;
        const orgAdminCheck = !contribution.Contributor.PartnerOrg.admins.some(
          (admin) => admin.id === userId
        );
        const siteAdminCheck = !user.siteAdmin;

        if (userCheck && orgAdminCheck && siteAdminCheck) {
          throw new Error(
            `invalid permissions user is not contributor, organization admin, or site admin`
          );
        }

        if (contribution.hourContribution) {
          const hourContribution = await prisma.hourContribution.delete({
            where: { contribItemId: contribution.id },
          });

          if (!hourContribution) {
            throw new Error(`issue deleting hour contribution sub item`);
          }
        } else if (contribution.otherContribution) {
          const otherContribution = await prisma.otherContribution.delete({
            where: { contribItemId: contribution.id },
          });

          if (!otherContribution) {
            throw new Error(`issue deleting other contribution sub item`);
          }
        } else {
          throw new Error(`contribution has no sub-item`);
        }

        const removedContribution = await prisma.contribItem.delete({
          where: { id: contribution.id },
        });

        if (!removedContribution) {
          throw new Error(`issue deleting contribution`);
        }

        return true;
      } catch (error) {
        logger.error(`error with removing contribution: ${error}`);
        return false;
      }
    },
  },
};

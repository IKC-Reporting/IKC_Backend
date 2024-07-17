import { randomUUID } from "crypto";
import prisma from "../../libs/prisma";
import { logger } from "../utils/Logger";

export default {
  Query: {
    contribution: async (parent, args, context, info) => {
      const { id } = args;
      logger.info(`querying contribution with id: ${id}`);

      try {
        // return all (should only have one hour / other so one will be null)
        const contribution = await prisma.contribItem.findUniqueOrThrow({
          where: { id },
          include: {
            Contributor: true,
            IKCReport: true,
          },
        });

        const hourContribution = await prisma.hourContribution.findUnique({
          where: { contribItemId: id },
        });

        if (hourContribution) {
          return {
            ...contribution,
            hourContribution: {
              hours: hourContribution.hours,
              hourlyRate: hourContribution.hourlyRate,
              benRatePer: hourContribution.benRatePer,
            },
            otherContribution: null,
          };
        }
        const otherContribution = await prisma.otherContribution.findUnique({
          where: { contribItemId: id },
        });
        if (otherContribution) {
          // have to manually assign sub-items due to foreign key...
          return {
            ...contribution,
            hourContribution: null,
            otherContribution: {
              itemName: otherContribution.itemName,
              value: otherContribution.value,
              items: otherContribution.items,
            },
          };
        }
      } catch (error) {
        logger.error(`error with contribution query: ${error}`);
        return null;
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

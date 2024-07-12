import { randomUUID } from "crypto";
import prisma from "../../libs/prisma";
import { Contribution } from "../generated/graphql";
import { logger } from "../utils/Logger";

export default {
  Query: {
    contribution: async (parent, args, context, info) => {
      const { id } = args;
      logger.info(`querying contribution with id: ${id}`);

      try {
        // return all (should only have one hour / other so one will be null)
        const contribution: Contribution =
          await prisma.contribItem.findUniqueOrThrow({
            where: { id },
            include: {
              Contributor: true,
              IKCReport: true,
              hourContribution: true,
              otherContribution: true,
            },
          });

        // have to manually assign sub-items due to foreign key...
        return {
          ...contribution,
          hourContribution: {
            hours: contribution.hourContribution.hours,
            hourlyRate: contribution.hourContribution.hourlyRate,
            benRatePer: contribution.hourContribution.benRatePer,
          },
          otherContribution: {
            itemName: contribution.otherContribution.itemName,
            value: contribution.otherContribution.value,
            items: contribution.otherContribution.items,
          },
        };
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
        });

        if (contributor && (date as Date).getDate() < Date.now()) {
          const newContribution = await prisma.contribItem.create({
            data: {
              id: randomUUID(),
              contributorId,
              date,
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
        });

        if (contributor && (date as Date).getDate() < Date.now()) {
          const newContribution = await prisma.contribItem.create({
            data: {
              id: randomUUID(),
              contributorId,
              date,
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
              throw new Error(
                `other contribution returning null after creation`
              );
            }
          } else {
            throw new Error(`contribution returning null after creation`);
          }
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
          include: { hourContribution: true, otherContribution: true },
        });

        const contributor = await prisma.contributor.findUniqueOrThrow({
          where: { id: userId, contributions: { some: contribution } },
        });
        if (contributor) {
          let hourlyItemRet;
          if (contribution.hourContribution) {
            hourlyItemRet = await prisma.hourContribution.delete({
              where: { contribItemId: contribution.id },
            });
          }

          let otherItemRet;
          if (contribution.otherContribution) {
            otherItemRet = await prisma.otherContribution.delete({
              where: { contribItemId: contribution.id },
            });
          }

          if (hourlyItemRet || otherItemRet) {
            const contribRet = await prisma.contribItem.delete({
              where: { id: contribution.id },
            });

            if (contribRet) {
              logger.info(`deleted contribution item: ${contribution.id}`);
              return true;
            } else {
              throw new Error("failed deleting main contribution item");
            }
          } else {
            throw new Error(
              "failed deleting hourly/other contribution sub item"
            );
          }
        } else {
          throw new Error(
            `failed to delete contribution item, incorrect permissions with userID: ${userId} on contributor: ${contribution.contributorId}`
          );
        }
      } catch (error) {
        logger.error(`error with removing contribution: ${error}`);
        return false;
      }
    },
  },
};

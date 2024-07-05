import prisma from "../../libs/prisma";
import { logger } from "../utils/Logger";

export default {
  Query: {
    otherContribItem: async (parent, args, context, info) => {
      const { id } = args;

      logger.info(`querying other contribution item with id: ${id}`);
      try {
        const otherContribItem = await prisma.otherContribItem.findFirst({
          where: { id },
        });

        return { ...otherContribItem };
      } catch (error) {
        logger.error(`error with other contribution item query: ${error}`);
        return null;
      }
    },
  },
  Mutation: {
    createOtherContribItem: async (parent, args, context, info) => {
      const {
        contributorId,
        ikcReportId,
        name,
        contributionDate,
        value,
        details,
      } = args;

      logger.info(
        `creating other contribution item with contributorId: ${contributorId}, name: ${name}, contributionDate: ${contributionDate}, value: ${value}, details: ${details}`
      );

      try {
        const ikcReport = await prisma.iKCReport.findUniqueOrThrow({
          where: { id: ikcReportId },
        });
        const contributor = await prisma.contributor.findUniqueOrThrow({
          where: { id: contributorId },
        });

        if (contributor && ikcReport) {
          const otherContribItem = await prisma.otherContribItem.create({
            data: {
              contributorId,
              ikcReportId,
              name,
              contributionDate,
              value,
              details,
            },
          });

          return otherContribItem?.id;
        } else {
          throw new Error(
            `contributor and/or ikc report not matching in database`
          );
        }
      } catch (error) {
        logger.error(`failed to create other contribution item: ${error}`);
      }
    },
    removeOtherContribItem: async (parent, args, context, info) => {
      const { userId, itemId } = args;
    },
  },
};

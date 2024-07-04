import { randomUUID } from "crypto";
import prisma from "../../libs/prisma";
import { logger } from "../utils/Logger";

export default {
  Query: {
    contributor: async (parent, args, context, info) => {
      const { id } = args;

      logger.info(`querying contributor with id: ${id}`);

      try {
        const contributor = await prisma.contributor.findUniqueOrThrow({
          where: { id },
          include: {
            User: true,
            HourContribItems: true,
            OtherContribItems: true,
          },
        });

        return { ...contributor };
      } catch (error) {
        logger.error(`error with contributor query: ${error}`);
        return null;
      }
    },
  },
  Mutations: {
    createContributor: async (parent, args, context, info) => {
      const {
        userId,
        partnerOrgAdminId,
        partnerOrgId,
        annualSalary,
        dailyHours,
        benRatePer,
      } = args;

      logger.info(
        `User ${userId} being added to organization ${partnerOrgId} by organization admin ${partnerOrgAdminId}`
      );

      try {
        const partnerOrg = await prisma.partnerOrg.findUniqueOrThrow({
          where: { id: partnerOrgId },
        });

        const admin = await prisma.user.findUniqueOrThrow({
          where: { id: partnerOrgAdminId },
          include: { PartnerOrgAdminAssignments: true },
        });

        if (
          admin?.id === partnerOrgAdminId &&
          admin?.PartnerOrgAdminAssignments.includes({ ...partnerOrg })
        ) {
          const contributor = await prisma.contributor.create({
            data: {
              id: randomUUID(),

              userId,
              partnerOrgId,

              annualSalary,
              dailyHours,
              benRatePer,

              HourContribItems: null,
              OtherContribItems: null,
            },
          });

          const user = await prisma.user.update({
            where: { id: userId },
            data: {
              contributorAssignments: { connect: { id: contributor.id } },
            },
          });

          if (contributor?.userId === user?.id) {
            logger.info(
              `added contributor ${contributor.id} with data: { id: ${contributor.id}, userId: ${contributor.userId}, partnerOrgId: ${contributor.partnerOrgId}, annualSalary: ${contributor.annualSalary}, dailyHours: ${contributor.dailyHours}, benRatePer: ${contributor.benRatePer} }`
            );
            return contributor.id;
          } else {
            throw new Error(
              `contributor userId not matching user id in database`
            );
          }
        }
      } catch (error) {
        logger.error(`error creating contributor: ${error}`);
        return null;
      }
    },
  },
};

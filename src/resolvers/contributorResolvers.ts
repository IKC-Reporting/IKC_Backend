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
          },
        });

        return {
          id: contributor.id,
          userId: contributor.userId,
          partnerOrgId: contributor.partnerOrgId,
          researchProjectId: contributor.researchProjectId,
          hourlyRate: contributor.hourlyRate,
          benRatePer: contributor.benRatePer,
        };
      } catch (error) {
        logger.error(`error with contributor query: ${error}`);
        return null;
      }
    },
  },
  Mutation: {
    createContributor: async (parent, args, context, info) => {
      const {
        userId,
        partnerOrgAdminId,
        partnerOrgId,
        researchProjectId,
        hourlyRate,
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
          !admin?.siteAdmin &&
          !admin?.PartnerOrgAdminAssignments.some(
            (item) => item.id === partnerOrg.id
          )
        ) {
          throw new Error(
            "organization admin invalid permissions to create contributor"
          );
        }

        const researchProject = await prisma.researchProject.findUniqueOrThrow({
          where: { id: researchProjectId },
          include: { projectPartners: true },
        });

        if (
          !researchProject.projectPartners.some(
            (partner) => partner.id === partnerOrgId
          )
        ) {
          throw new Error(
            `partner org unconnected to research project, invalid permissions`
          );
        }

        if (hourlyRate <= 0 || hourlyRate > 100) {
          throw new Error(`incorrect hourlyRate value (over 100)`);
        } else if (1 < benRatePer || benRatePer < 0) {
          throw new Error(
            `incorrect benRatePer value (not decimal between 0 & 1)`
          );
        }
        const user = await prisma.user.findUniqueOrThrow({
          where: { id: userId },
        });
        const researchProj_withoutOrg =
          await prisma.researchProject.findUniqueOrThrow({
            where: { id: researchProjectId },
          });
        const contributor = await prisma.contributor.create({
          data: {
            id: randomUUID(),

            User: { connect: user },
            PartnerOrg: { connect: partnerOrg },
            ResearchProject: {
              connect: researchProj_withoutOrg,
            },
            hourlyRate,
            benRatePer,
          },
        });

        if (contributor?.userId === user?.id) {
          logger.info(
            `added contributor ${contributor.id} with data: { id: ${contributor.id}, userId: ${contributor.userId}, partnerOrgId: ${contributor.partnerOrgId}, hourlyRate: ${contributor.hourlyRate}, benRatePer: ${contributor.benRatePer} }`
          );
          return contributor.id;
        } else {
          throw new Error(
            `contributor userId not matching user id in database`
          );
        }
      } catch (error) {
        logger.error(`error creating contributor: ${error}`);
        return null;
      }
    },
  },
};

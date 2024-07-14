import { randomUUID } from "crypto";
import prisma from "../../libs/prisma";
import { logger } from "../utils/Logger";
import {
  getAdminIds,
  getIKCReportArray,
  getProjectPartners,
} from "../utils/reducers";

export default {
  Query: {
    researchProject: async (parent, args, context, info) => {
      const { id } = args;

      logger.info(`Querying research project with id: ${id}`);

      try {
        const researchProject = await prisma.researchProject.findUnique({
          where: { id },
          include: {
            admins: true,
            projectPartners: {
              select: { id: true, name: true, contributors: true },
            },
            ikcReports: {
              select: {
                id: true,
                partnerOrgId: true,
                reportStartDate: true,
                reportEndDate: true,
                Contributions: {
                  select: {
                    id: true,
                    contributorId: true,
                    date: true,
                    details: true,
                    hourContribution: true,
                    otherContribution: true,
                  },
                },
                submitterId: true,
                isApproved: true,
                approverId: true,
                approvalDate: true,
              },
            },
          },
        });
        const projectAdmins = getAdminIds(researchProject.admins);

        const projectPartners = getProjectPartners(
          researchProject.projectPartners
        );
        const projectReports = getIKCReportArray(researchProject.ikcReports);

        return {
          id: researchProject.id,
          projectTitle: researchProject.projectTitle,
          startDate: researchProject.startDate,
          endDate: researchProject.endDate,
          admins: projectAdmins,
          projectPartners: projectPartners,
          ikcReports: projectReports,
        };
      } catch (error) {
        logger.error(`Error querying research project: ${error}`);
        return null;
      }
    },
  },
  Mutation: {
    createResearchProject: async (parent, args, context, info) => {
      const { siteAdminId, adminId, projectTitle, startDate, endDate } = args;

      logger.info(`Creating research project with title: ${projectTitle}`);

      try {
        const newResearchProject = await prisma.researchProject.create({
          data: {
            id: randomUUID(),
            projectTitle,
            startDate,
            endDate,
            admins: { connect: { id: adminId } },
          },
        });

        return newResearchProject.id;
      } catch (error) {
        logger.error(`Error creating research project: ${error}`);
        return null;
      }
    },
    addPartnerOrg: async (parent, args, context, info) => {
      const { userId, researchProjectId, partnerOrgId } = args;

      logger.info(
        `Adding partner organization ${partnerOrgId} to research project ${researchProjectId}`
      );

      try {
        const updatedResearchProject = await prisma.researchProject.update({
          where: { id: researchProjectId },
          data: {
            projectPartners: {
              connect: { id: partnerOrgId },
            },
          },
        });

        return true;
      } catch (error) {
        logger.error(
          `Error adding partner organization to research project: ${error}`
        );
        return false;
      }
    },
    removePartnerOrg: async (parent, args, context, info) => {
      const { userId, researchProjectId, partnerOrgId } = args;

      logger.info(
        `Removing partner organization ${partnerOrgId} from research project ${researchProjectId}`
      );

      try {
        const updatedResearchProject = await prisma.researchProject.update({
          where: { id: researchProjectId },
          data: {
            projectPartners: {
              disconnect: { id: partnerOrgId },
            },
          },
        });

        return true;
      } catch (error) {
        logger.error(
          `Error removing partner organization from research project: ${error}`
        );
        return false;
      }
    },
    addResearchProjectAdmin: async (parent, args, context, info) => {
      const { userId, newAdmin } = args;

      logger.info(`Adding new admin ${newAdmin} to research project ${userId}`);

      try {
        const updatedResearchProject = await prisma.researchProject.update({
          where: { id: userId },
          data: {
            admins: {
              connect: { id: newAdmin },
            },
          },
        });

        return true;
      } catch (error) {
        logger.error(`Error adding new admin to research project: ${error}`);
        return false;
      }
    },
    removeResearchProjectAdmin: async (parent, args, context, info) => {
      const { userId, adminId } = args;

      logger.info(`Removing admin ${adminId} from research project ${userId}`);

      try {
        const updatedResearchProject = await prisma.researchProject.update({
          where: { id: userId },
          data: {
            admins: {
              disconnect: { id: adminId },
            },
          },
        });

        return true;
      } catch (error) {
        logger.error(`Error removing admin from research project: ${error}`);
        return false;
      }
    },
  },
};

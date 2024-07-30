import { randomUUID } from "crypto";
import prisma from "../../libs/prisma";
import { logger } from "../utils/Logger";
import { getResearchProject } from "../utils/reducers";

export default {
  Query: {
    researchProject: async (parent, args, context, info) => {
      const { id } = args;

      logger.info(`Querying research project with id: ${id}`);

      try {
        return await getResearchProject(id);
      } catch (error) {
        logger.error(`Error querying research project: ${error}`);
        return null;
      }
    },
    getAllProjForOrgs: async (parent, args, context, info) => {
      const { orgId } = args;

      logger.info(`Querying all projects for partner organization: ${orgId}`);

      const researchProjectIds = (
        await prisma.researchProject.findMany({
          where: { projectPartners: { some: { id: orgId } } },
        })
      ).map((project) => project.id);

      const researchProjects = await researchProjectIds.map(async (id) =>
        getResearchProject(id)
      );

      return researchProjects;
    },
  },
  Mutation: {
    createResearchProject: async (parent, args, context, info) => {
      const { siteAdminId, adminId, projectTitle, startDate, endDate } = args;

      logger.info(`Creating research project with title: ${projectTitle}`);

      try {
        const siteAdmin = await prisma.user.findUniqueOrThrow({
          where: { id: siteAdminId },
        });

        if (siteAdmin.siteAdmin === false) {
          throw new Error(`site admin invalid credentials`);
        }

        const newResearchProject = await prisma.researchProject.create({
          data: {
            id: randomUUID(),
            projectTitle,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
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
        const admin = await prisma.user.findUniqueOrThrow({
          where: { id: userId },
        });

        const researchProject = await prisma.researchProject.findUniqueOrThrow({
          where: { id: researchProjectId },
          include: { admins: true, projectPartners: true },
        });

        if (
          !researchProject.admins.some((admin) => admin.id === userId) &&
          !admin.siteAdmin
        ) {
          throw new Error(`invalid access, user not admin of project`);
        }

        const partnerOrg = await prisma.partnerOrg.findUniqueOrThrow({
          where: { id: partnerOrgId },
        });

        await prisma.researchProject.update({
          where: { id: researchProjectId },
          data: {
            projectPartners: {
              connect: partnerOrg,
            },
          },
        });

        const updatedResearchProject =
          await prisma.researchProject.findUniqueOrThrow({
            where: { id: researchProjectId },
            include: { projectPartners: true },
          });

        if (
          !updatedResearchProject.projectPartners.some(
            (partner) => partner.id === partnerOrgId
          )
        ) {
          throw new Error(`partner not added to db, update error`);
        }
        return true;
      } catch (error) {
        logger.error(
          `Error adding partner organization to research project: ${error}`
        );
        return false;
      }
    },
    addResearchProjectAdmin: async (parent, args, context, info) => {
      const { userId, newAdminId, researchProjectId } = args;

      logger.info(
        `Adding new admin ${newAdminId} to research project ${userId}`
      );

      try {
        const user = await prisma.user.findUniqueOrThrow({
          where: { id: userId },
        });

        const researchProject = await prisma.researchProject.findUniqueOrThrow({
          where: { id: researchProjectId },
          include: { admins: true, projectPartners: true },
        });

        if (
          !researchProject.admins.some((admin) => admin.id === userId) &&
          !user.siteAdmin
        ) {
          throw new Error(`invalid access, user not admin of project`);
        }
        const newAdmin = await prisma.user.findUniqueOrThrow({
          where: { id: newAdminId },
        });

        await prisma.researchProject.update({
          where: { id: researchProjectId },
          data: {
            admins: {
              connect: newAdmin,
            },
          },
        });

        const updatedResearchProject =
          await prisma.researchProject.findUniqueOrThrow({
            where: { id: researchProjectId },
            include: { admins: true },
          });

        if (
          updatedResearchProject.admins.some((admin) => admin.id === newAdminId)
        ) {
          throw new Error(`admin not added to db, update error`);
        }
        return true;
      } catch (error) {
        logger.error(`Error adding new admin to research project: ${error}`);
        return false;
      }
    },
    removeResearchProjectAdmin: async (parent, args, context, info) => {
      const { userId, removedAdminId, researchProjectId } = args;

      logger.info(
        `Removing admin ${removedAdminId} from research project ${userId}`
      );

      try {
        const user = await prisma.user.findUniqueOrThrow({
          where: { id: userId },
        });

        const researchProject = await prisma.researchProject.findUniqueOrThrow({
          where: { id: researchProjectId },
          include: { admins: true, projectPartners: true },
        });

        if (
          !researchProject.admins.some((admin) => admin.id === userId) &&
          !user.siteAdmin
        ) {
          throw new Error(`invalid access, user not admin of project`);
        }

        const removedAdmin = await prisma.user.findUniqueOrThrow({
          where: { id: removedAdminId },
        });

        await prisma.researchProject.update({
          where: { id: researchProjectId },
          data: {
            admins: {
              disconnect: removedAdmin,
            },
          },
        });

        const updatedResearchProject =
          await prisma.researchProject.findUniqueOrThrow({
            where: { id: researchProjectId },
            include: { admins: true },
          });

        if (
          updatedResearchProject.admins.some(
            (admin) => admin.id === removedAdminId
          )
        ) {
          throw new Error(`admin not removed from db, update error`);
        }
        return true;
      } catch (error) {
        logger.error(`Error adding new admin to research project: ${error}`);
        return false;
      }
    },
  },
};

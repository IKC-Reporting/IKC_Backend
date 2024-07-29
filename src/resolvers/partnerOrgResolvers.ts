import { randomUUID } from "crypto";
import prisma from "../../libs/prisma";
import { logger } from "../utils/Logger";
import { getIKCReport, getPartnerOrg } from "../utils/reducers";

export default {
  Query: {
    partnerOrg: async (parent, args, context, info) => {
      const { id } = args;

      logger.info(`Querying partner organization with id: ${id}`);

      try {
        const partnerOrg = await prisma.partnerOrg.findUnique({
          where: { id },
          include: {
            contributors: true,
            admins: true,
          },
        });

        return getPartnerOrg(partnerOrg);
      } catch (error) {
        logger.error(`Error querying partner organization: ${error}`);
        return null;
      }
    },
    getAllOrgsForUser: async (parent, args, context, info) => {
      const { userId } = args;

      logger.info(`Querying all partner organizations for user: ${userId}`);

      const partnerOrgs = await prisma.partnerOrg.findMany({
        where: {
          OR: [
            { admins: { some: { id: userId } } },
            { contributors: { some: { userId: userId } } },
          ],
        },
        include: {
          contributors: true,
          admins: true,
        },
      });

      return partnerOrgs.map((partnerOrg) => getPartnerOrg(partnerOrg));
    },
    getAllOrgsForProject: async (parent, args, context, info) => {
      const { projectId } = args;

      logger.info(
        `Querying all partner organizations for project: ${projectId}`
      );

      const partnerOrgs = await prisma.partnerOrg.findMany({
        where: { ResearchProjects: { some: { id: projectId } } },
        include: {
          contributors: true,
          admins: true,
        },
      });

      return partnerOrgs.map((partnerOrg) => getPartnerOrg(partnerOrg));
    },

    getAllIKCByPartnerOrg: async (parent, args, context, info) => {
      const { id } = args;

      logger.info(`Querying all ikc reports for organization: ${id}`);

      try {
        const ikcReportIds = (
          await prisma.iKCReport.findMany({
            where: { partnerOrgId: id },
          })
        ).map((ikcReport) => ikcReport.id);

        const ikcReports = await ikcReportIds.map(async (ikcReportId) => {
          return await getIKCReport(ikcReportId);
        });

        return ikcReports;
      } catch (error) {
        logger.error(`Error querying IKC report: ${error}`);
        return null;
      }
    },

    getAllApprovedContribByOrg: async (parent, args, context, info) => {
      const { id } = args;

      logger.info(`Querying all approved contributions for project: ${id}`);

      try {
        const partnerOrg = await prisma.partnerOrg.findUniqueOrThrow({
          where: { id: id },
          include: {
            IKCReport: {
              select: {
                id: true,
                ResearchProject: true,
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
                isApproved: true,
              },
            },
          },
        });

        const data = partnerOrg.IKCReport.reduce(
          (previousValue, currentValue) => {
            const projectName = currentValue.ResearchProject.projectTitle;
            let values = previousValue;

            if (!values[projectName]) {
              values[projectName] = {
                projectName: projectName,
                contributions: {},
              };
            }

            currentValue.Contributions.forEach((contribution) => {
              const month = contribution.date.toLocaleString("default", {
                month: "long",
              });

              if (!values[projectName].contributions[month]) {
                values[projectName].contributions[month] = {
                  month: month,
                  total: 0,
                };
              }

              if (contribution.hourContribution) {
                const temp = values[projectName].contributions[month].total;
                values[projectName].contributions[month].total =
                  temp +
                  (
                    contribution.hourContribution.hourlyRate *
                    contribution.hourContribution.hours
                  ).toFixed(2);
              } else if (contribution.otherContribution) {
                const temp = values[projectName].contributions[month].total;
                values[projectName].contributions[month].total =
                  temp +
                  (
                    contribution.otherContribution.value *
                    contribution.otherContribution.value
                  ).toFixed(2);
              }
            });

            return values;
          },
          {}
        );

        let projContrib = Object.values(data).map((val) => {
          let contributions = Object.values(val["contributions"]).map(
            (contrib) => {
              return contrib;
            }
          );

          return {
            projectName: val["projectName"],
            contributions: contributions,
          };
        });

        return projContrib;
      } catch (error) {
        logger.error(
          `Error querying approved contributions for partner: ${error}`
        );
        return null;
      }
    },
  },
  Mutation: {
    createPartnerOrg: async (parent, args, context, info) => {
      const { siteAdminId, adminId, name } = args;

      logger.info(`Creating partner organization with name: ${name}`);

      try {
        const siteAdmin = await prisma.user.findUniqueOrThrow({
          where: { id: siteAdminId },
        });

        if (!siteAdmin.siteAdmin) {
          throw new Error("invalid permissions for site admin id");
        }

        const newPartnerOrg = await prisma.partnerOrg.create({
          data: {
            id: randomUUID(),
            name,
            admins: { connect: { id: adminId } },
          },
        });

        return newPartnerOrg.id;
      } catch (error) {
        logger.error(`Error creating partner organization: ${error}`);
        return null;
      }
    },
    addPartnerOrgAdmin: async (parent, args, context, info) => {
      const { orgAdminId, orgId, newAdminId } = args;

      logger.info(
        `Adding admin ${newAdminId} to partner organization ${orgId}`
      );

      try {
        const user = await prisma.user.findUniqueOrThrow({
          where: { id: orgAdminId },
          include: { PartnerOrgAdminAssignments: true },
        });

        if (
          !user.PartnerOrgAdminAssignments.some(
            (partnerOrg) => partnerOrg.id === orgId
          ) &&
          !user.siteAdmin
        ) {
          throw new Error(
            "user is not admin of organization, permission denied"
          );
        }
        const newAdmin = await prisma.user.findUniqueOrThrow({
          where: { id: newAdminId },
        });

        await prisma.partnerOrg.update({
          where: { id: orgId },
          data: {
            admins: { connect: newAdmin },
          },
        });

        const updatedPartnerOrg = await prisma.partnerOrg.findUniqueOrThrow({
          where: { id: orgId },
          include: { admins: true },
        });

        if (updatedPartnerOrg.admins.some((user) => user.id === newAdminId)) {
          return true;
        } else {
          throw new Error("new admin not found in organization");
        }
      } catch (error) {
        logger.error(`Error adding admin to partner organization: ${error}`);
        return false;
      }
    },
    removePartnerOrgAdmin: async (parent, args, context, info) => {
      const { orgAdminId, orgId, removedAdminId } = args;

      logger.info(
        `Removing admin ${removedAdminId} from partner organization ${orgId}`
      );

      try {
        const user = await prisma.user.findUniqueOrThrow({
          where: { id: orgAdminId },
          include: { PartnerOrgAdminAssignments: true },
        });

        if (
          !user.PartnerOrgAdminAssignments.some(
            (partnerOrg) => partnerOrg.id === orgId
          ) &&
          !user.siteAdmin
        ) {
          throw new Error(
            "user is not admin of organization, permission denied"
          );
        }

        const partnerOrg = await prisma.partnerOrg.findUniqueOrThrow({
          where: { id: orgId },
          include: { admins: true },
        });

        if (partnerOrg.admins.length <= 1) {
          throw new Error(`only one or less admins, unable to remove`);
        }

        const removeAdmin = await prisma.user.findUniqueOrThrow({
          where: { id: removedAdminId },
        });

        await prisma.partnerOrg.update({
          where: { id: orgId },
          data: {
            admins: { disconnect: removeAdmin },
          },
        });

        const updatedPartnerOrg = await prisma.partnerOrg.findUniqueOrThrow({
          where: { id: orgId },
          include: { admins: true },
        });

        if (
          updatedPartnerOrg.admins.some((admin) => admin.id === removedAdminId)
        ) {
          throw new Error("admin not removed from organization DB error");
        } else {
          return true;
        }
      } catch (error) {
        logger.error(
          `Error removing admin from partner organization: ${error}`
        );
        return false;
      }
    },
  },
};

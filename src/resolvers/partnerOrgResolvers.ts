import { randomUUID } from "crypto";
import prisma from "../../libs/prisma";
import { logger } from "../utils/Logger";
import { getAdminIds, getContributorArray } from "../utils/reducers";

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

        const adminIds = getAdminIds(partnerOrg.admins);

        const contributors = getContributorArray(partnerOrg.contributors);

        return {
          id: partnerOrg.id,
          name: partnerOrg.name,
          admins: adminIds,
          contributors,
        };
      } catch (error) {
        logger.error(`Error querying partner organization: ${error}`);
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

        const partnerOrgAdmins = await prisma.partnerOrg.findUniqueOrThrow({
          where: { id: orgId },
          include: { admins: true },
        });

        const newAdminList = partnerOrgAdmins.admins.filter(
          (admin) => admin.id != removedAdminId
        );

        await prisma.partnerOrg.update({
          where: { id: orgId },
          data: {
            admins: { set: newAdminList },
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

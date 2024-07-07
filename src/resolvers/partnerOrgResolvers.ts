import { randomUUID } from "crypto";
import prisma from "../../libs/prisma";
import { logger } from "../utils/Logger";

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
                    },
                });

                return partnerOrg;
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
            const { userId, newAdminId } = args;

            logger.info(`Adding admin ${newAdminId} to partner organization ${userId}`);

            try {
                const updatedPartnerOrg = await prisma.partnerOrg.update({
                    where: { id: userId },
                    data: {
                        admins: { set: newAdminId },
                    },
                });

                return true;
            } catch (error) {
                logger.error(`Error adding admin to partner organization: ${error}`);
                return false;
            }
        },
        removePartnerOrgAdmin: async (parent, args, context, info) => {
            const { userId, removedAdminId } = args;

            logger.info(`Removing admin ${removedAdminId} from partner organization ${userId}`);

            try {
                const updatedPartnerOrg = await prisma.partnerOrg.update({
                    where: { id: userId },
                    data: {
                        admins: { set: [] },
                    },
                });

                return true;
            } catch (error) {
                logger.error(`Error removing admin from partner organization: ${error}`);
                return false;
            }
        },
    },
};

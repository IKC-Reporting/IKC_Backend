import { randomUUID } from "crypto";
import prisma from "../../libs/prisma";
import { logger } from "../utils/Logger";

export default {
    Query: {
        ikcReport: async (parent, args, context, info) => {
            const { id } = args;

            logger.info(`Querying IKC report with id: ${id}`);

            try {
                const ikcReport = await prisma.iKCReport.findUniqueOrThrow({
                    where: { id },
                    include: {
                        Contributions: {
                            include: {
                                hourContribution: true,
                                otherContribution: true,
                            },
                        },
                    },
                });

                return { ...ikcReport };
            } catch (error) {
                logger.error(`Error querying IKC report: ${error}`);
                return null;
            }
        },
    },
    Mutation: {
        createIKCReport: async (parent, args, context, info) => {
            const {
                userId,
                partnerOrgId,
                reportStartDate,
                reportEndDate,
                employeeHourIds,
                otherContributionIds,
            } = args;

            logger.info(`Creating IKC report for partner organization ${partnerOrgId} by user ${userId}`);

            try {
                const ikcReport = await prisma.iKCReport.create({
                    data: {
                        id: randomUUID(),
                        partnerOrgId,
                        reportStartDate,
                        reportEndDate,
                        Contributions: {
                            connect: [
                                ...employeeHourIds.map((id) => ({ id })),
                                ...otherContributionIds.map((id) => ({ id })),
                            ],
                        },
                    },
                });

                logger.info(`Created IKC report with id: ${ikcReport.id}`);
                return ikcReport.id;
            } catch (error) {
                logger.error(`Error creating IKC report: ${error}`);
                return null;
            }
        },
        submitIKCReport: async (parent, args, context, info) => {
            const { submitterId, ikcReportID, submissionDate } = args;

            logger.info(`Submitting IKC report ${ikcReportID} by user ${submitterId}`);

            try {
                const ikcReport = await prisma.iKCReport.update({
                    where: { id: ikcReportID },
                    data: {
                        submitterId,
                        submissionDate,
                    },
                });

                logger.info(`Submitted IKC report with id: ${ikcReportID}`);
                return ikcReport.id;
            } catch (error) {
                logger.error(`Error submitting IKC report: ${error}`);
                return null;
            }
        },
        approveIKCReport: async (parent, args, context, info) => {
            const { userId, ikcReportID } = args;

            logger.info(`Approving IKC report ${ikcReportID} by user ${userId}`);

            try {
                const ikcReport = await prisma.iKCReport.update({
                    where: { id: ikcReportID },
                    data: {
                        isApproved: true,
                        approverId: userId,
                        approvalDate: new Date(),
                    },
                });

                logger.info(`Approved IKC report with id: ${ikcReportID}`);
                return true;
            } catch (error) {
                logger.error(`Error approving IKC report: ${error}`);
                return false;
            }
        },
        denyIKCReport: async (parent, args, context, info) => {
            const { userId, ikcReportID } = args;

            logger.info(`Denying IKC report ${ikcReportID} by user ${userId}`);

            try {
                const ikcReport = await prisma.iKCReport.update({
                    where: { id: ikcReportID },
                    data: {
                        isApproved: false,
                        approverId: userId,
                        approvalDate: new Date(),
                    },
                });

                logger.info(`Denied IKC report with id: ${ikcReportID}`);
                return true;
            } catch (error) {
                logger.error(`Error denying IKC report: ${error}`);
                return false;
            }
        },
    },
};

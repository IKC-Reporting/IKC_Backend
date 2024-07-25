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
        });

        const contributions = await prisma.contribItem.findMany({
          where: { ikcReportId: id },
          include: { otherContribution: true, hourContribution: true },
        });

        return { ...ikcReport, contributions: contributions };
      } catch (error) {
        logger.error(`Error querying IKC report: ${error}`);
        return null;
      }
    },
  },
  Mutation: {
    createIKCReport: async (parent, args, context, info) => {
      const { userId, partnerOrgId, contributionIds } = args;

      logger.info(
        `Creating IKC report for partner organization ${partnerOrgId} by user ${userId}`
      );

      try {
        const user = await prisma.user.findUniqueOrThrow({
          where: { id: userId },
          include: { PartnerOrgAdminAssignments: true },
        });

        if (
          !user.PartnerOrgAdminAssignments.some(
            (assign) => assign.id === partnerOrgId
          )
        ) {
          throw new Error(`invalid permissions for user`);
        }

        // only add contributions if the partnerOrg is connected
        const contributions = await prisma.contribItem.findMany({
          where: {
            id: { in: contributionIds },
            Contributor: { partnerOrgId: partnerOrgId },
          },
        });

        let reportStartDate = contributions[0].date;
        let reportEndDate = contributions[0].date;
        contributions.forEach((contribution) => {
          if (contribution.date < reportStartDate) {
            reportStartDate = contribution.date;
          }

          if (contribution.date > reportEndDate) {
            reportEndDate = contribution.date;
          }
        });

        const ikcReport = await prisma.iKCReport.create({
          data: {
            id: randomUUID(),
            partnerOrgId,
            reportStartDate: new Date(),
            reportEndDate: null,
            Contributions: {
              connect: contributionIds.map((id) => ({ id })),
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
      const { submitterId, ikcReportId, submissionDate } = args;

      logger.info(
        `Submitting IKC report ${ikcReportId} by user ${submitterId}`
      );

      try {
        const ikcReport = await prisma.iKCReport.update({
          where: { id: ikcReportId },
          data: {
            submitterId,
            submissionDate,
          },
        });

        logger.info(`Submitted IKC report with id: ${ikcReportId}`);
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

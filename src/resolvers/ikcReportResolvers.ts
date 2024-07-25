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
      const { userId, partnerOrgId, researchProjectId } = args;

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
          ) &&
          !user.siteAdmin
        ) {
          throw new Error(`invalid permissions for user`);
        }

        const ikcReport = await prisma.iKCReport.create({
          data: {
            id: randomUUID(),
            partnerOrgId,
            researchProjectId,
            reportStartDate: new Date(),
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
      const { userId, ikcReportId } = args;

      logger.info(`Submitting IKC report ${ikcReportId} by user ${userId}`);

      try {
        const submitter = await prisma.user.findUniqueOrThrow({
          where: { id: userId },
          include: { PartnerOrgAdminAssignments: true },
        });

        const ikcReport = await prisma.iKCReport.findUniqueOrThrow({
          where: { id: ikcReportId },
        });

        if (
          !submitter.PartnerOrgAdminAssignments.some(
            (assign) => assign.id === ikcReport.partnerOrgId
          ) &&
          !submitter.siteAdmin
        ) {
          throw new Error(`invalid permissions for user`);
        }

        await prisma.iKCReport.update({
          where: { id: ikcReportId },
          data: {
            submissionDate: new Date(),
            submitterId: userId,
          },
        });

        logger.info(`Submitted IKC report with id: ${ikcReportId}`);
        return true;
      } catch (error) {
        logger.error(`Error submitting IKC report: ${error}`);
        return false;
      }
    },

    approveIKCReport: async (parent, args, context, info) => {
      const { userId, ikcReportId } = args;

      logger.info(`user ${userId} approving IKC report ${ikcReportId}`);

      try {
        const admin = await prisma.user.findUniqueOrThrow({
          where: { id: userId },
          include: { PartnerOrgAdminAssignments: true },
        });

        const ikcReport = await prisma.iKCReport.findUniqueOrThrow({
          where: { id: ikcReportId },
        });

        if (
          !admin.PartnerOrgAdminAssignments.some(
            (assign) => assign.id === ikcReport.partnerOrgId
          ) &&
          !admin.siteAdmin
        ) {
          throw new Error(`invalid permissions for user`);
        }

        await prisma.iKCReport.update({
          where: { id: ikcReportId },
          data: {
            approvalDate: new Date(),
            approverId: userId,
            isApproved: true,
          },
        });

        logger.info(`Approved IKC report with id: ${ikcReportId}`);
        return true;
      } catch (error) {
        logger.error(`Error approving IKC report: ${error}`);
        return false;
      }
    },

    denyIKCReport: async (parent, args, context, info) => {
      const { userId, ikcReportId } = args;

      logger.info(
        `user ${userId} denying IKC report ${ikcReportId} submission`
      );

      try {
        const admin = await prisma.user.findUniqueOrThrow({
          where: { id: userId },
          include: { PartnerOrgAdminAssignments: true },
        });

        const ikcReport = await prisma.iKCReport.findUniqueOrThrow({
          where: { id: ikcReportId },
        });

        if (
          !admin.PartnerOrgAdminAssignments.some(
            (assign) => assign.id === ikcReport.partnerOrgId
          ) &&
          !admin.siteAdmin
        ) {
          throw new Error(`invalid permissions for user`);
        }

        await prisma.iKCReport.update({
          where: { id: ikcReportId },
          data: {
            submissionDate: null,
            submitterId: null,
            approvalDate: null,
            approverId: null,
            isApproved: false,
          },
        });

        logger.info(`Denied IKC report with id: ${ikcReportId}`);
        return true;
      } catch (error) {
        logger.error(`Error denying IKC report: ${error}`);
        return false;
      }
    },
  },
};

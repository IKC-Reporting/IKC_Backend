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

        const partnerOrg = await prisma.partnerOrg.findUniqueOrThrow({
          where: { id: partnerOrgId },
          include: { ResearchProjects: true },
        });

        if (
          !partnerOrg.ResearchProjects.some(
            (project) => project.id === researchProjectId
          )
        ) {
          throw new Error(`project not connected to org`);
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

        if (ikcReport.isApproved) {
          // don't think its too important to return null so just exist early...
          return true;
        }

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
          include: { ResearchProjectAdminAssignments: true },
        });

        const ikcReport = await prisma.iKCReport.findUniqueOrThrow({
          where: { id: ikcReportId },
        });

        if (
          !admin.ResearchProjectAdminAssignments.some(
            (assign) => assign.id === ikcReport.researchProjectId
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
          include: { ResearchProjectAdminAssignments: true },
        });

        const ikcReport = await prisma.iKCReport.findUniqueOrThrow({
          where: { id: ikcReportId },
        });

        if (
          !admin.ResearchProjectAdminAssignments.some(
            (assign) => assign.id === ikcReport.researchProjectId
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

    addContributionToReport: async (parent, args, context, info) => {
      const { userId, ikcReportId, contributionId } = args;

      logger.info(
        `contribution ${contributionId} being added to IKC report ${ikcReportId} by user ${userId}`
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

        const contribution = await prisma.contribItem.findUniqueOrThrow({
          where: { id: contributionId },
          include: { Contributor: true },
        });

        if (contribution.Contributor.partnerOrgId !== ikcReport.partnerOrgId) {
          throw new Error(`contribution not connected to partner org`);
        } else if (
          contribution.Contributor.researchProjectId !==
          ikcReport.researchProjectId
        ) {
          throw new Error(`contribution not connected to project`);
        }

        await prisma.iKCReport.update({
          where: { id: ikcReportId },
          data: {
            Contributions: { connect: { id: contributionId } },
          },
        });

        logger.info(`added ${contributionId} to IKC report`);
        return true;
      } catch (error) {
        logger.error(`Error adding contribution to IKC report: ${error}`);
        return false;
      }
    },

    removeContributionFromReport: async (parent, args, context, info) => {
      const { userId, ikcReportId, contributionId } = args;

      logger.info(
        `contribution ${contributionId} being added to IKC report ${ikcReportId} by user ${userId}`
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

        const contribution = await prisma.contribItem.findUniqueOrThrow({
          where: { id: contributionId },
          include: { Contributor: true },
        });

        if (contribution.Contributor.partnerOrgId !== ikcReport.partnerOrgId) {
          throw new Error(`contribution not connected to partner org`);
        } else if (
          contribution.Contributor.researchProjectId !==
          ikcReport.researchProjectId
        ) {
          throw new Error(`contribution not connected to project`);
        }

        await prisma.iKCReport.update({
          where: { id: ikcReportId },
          data: {
            Contributions: { disconnect: { id: contributionId } },
          },
        });

        logger.info(`added ${contributionId} to IKC report`);
        return true;
      } catch (error) {
        logger.error(`Error adding contribution to IKC report: ${error}`);
        return false;
      }
    },
  },
};

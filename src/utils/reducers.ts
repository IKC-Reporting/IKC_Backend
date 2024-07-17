import { Contributor as PrismaContributor, User } from "@prisma/client";
import {
  Contribution,
  Contributor as GraphQLContributor,
  IkcReport,
  PartnerOrgItem,
} from "../generated/graphql";

// reducers for prisma data conversions into arrays for graphql to ease repeated, complex code
export const getAdminIds = (admins: User[]): string[] => {
  return admins.reduce((previousValue, currentValue) => {
    return [...previousValue, currentValue.id];
  }, []);
};

export const getContributorArray = (
  contributors: PrismaContributor[]
): GraphQLContributor[] => {
  return contributors.reduce((previousValue, currentValue) => {
    return [
      ...previousValue,
      {
        id: currentValue.id,
        userId: currentValue.userId,
        partnerOrgId: currentValue.partnerOrgId,
        researchOrgId: currentValue.researchProjectId,
        hourlyRate: currentValue.hourlyRate,
        benRatePer: currentValue.benRatePer,
      },
    ];
  }, []);
};

// couldn't get this to work with input validation due to issues implementing https://www.prisma.io/docs/orm/prisma-client/type-safety/operating-against-partial-structures-of-model-types
export const getProjectPartners = (projectPartners): PartnerOrgItem[] => {
  return projectPartners.reduce((previousValue, currentValue) => {
    return [
      ...previousValue,
      {
        id: currentValue.id,
        name: currentValue.name,
        contributors: getContributorArray(currentValue.contributors),
      },
    ];
  }, []);
};

export const getContributionsArray = (contributions): Contribution[] => {
  return contributions.reduce((previousValue, currentValue) => {
    return [
      ...previousValue,
      {
        id: currentValue.id,
        date: currentValue.data,
        details: currentValue.details,

        hourContribution: {
          hours: currentValue.hourContribution.hours,
          hourlyRate: currentValue.hourContribution.hourlyRate,
          benRatePer: currentValue.hourContribution.benRatePer,
        },
        otherContribution: {
          itemName: currentValue.otherContribution.itemName,
          value: currentValue.otherContribution.value,
          items: currentValue.otherContribution.items,
        },
      },
    ];
  }, []);
};

export const getIKCReportArray = (ikcReports): IkcReport[] => {
  return ikcReports.reduce((previousValue, currentValue) => {
    return [
      ...previousValue,
      {
        id: currentValue.id,
        partnerOrgId: currentValue.partnerOrgId,
        reportStartDate: currentValue.reportStartDate,
        reportEndDate: currentValue.reportEndDate,
        contributions: getContributionsArray(currentValue.Contributions),
        submitterId: currentValue.submitterId,
        isApproved: currentValue.isApproved,
        approverId: currentValue.approverId,
        approvalDate: currentValue.approvalDate,
      },
    ];
  }, []);
};

// .reduce((previousValue, currentValue) => {
//     return [...previousValue, {}];
//   }, []);

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

export const getContribution = (contribution) => {
  // return all (should only have one hour / other so one will be null)

  if (contribution?.hourContribution) {
    return {
      ...contribution,
      hourContribution: {
        hours: contribution.hourContribution.hours,
        hourlyRate: contribution.hourContribution.hourlyRate,
        benRatePer: contribution.hourContribution.benRatePer,
      },
      otherContribution: null,
    };
  }

  if (contribution?.otherContribution) {
    // have to manually assign sub-items due to foreign key...
    return {
      ...contribution,
      hourContribution: null,
      otherContribution: {
        itemName: contribution.otherContribution.itemName,
        value: contribution.otherContribution.value,
        items: contribution.otherContribution.items,
      },
    };
  }
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

export const getPartnerOrg = (partnerOrg) => {
  const adminIds = getAdminIds(partnerOrg.admins);

  const contributors = getContributorArray(partnerOrg.contributors);

  return {
    id: partnerOrg.id,
    name: partnerOrg.name,
    admins: adminIds,
    contributors,
  };
};

export const getContributionsArray = (contributions): Contribution[] => {
  return contributions.reduce((previousValue, currentValue) => {
    let hourContribution = null;
    let otherContribution = null;

    // need to check if they are null as there should only be one
    if (currentValue?.hourContribution) {
      hourContribution = {
        hours: currentValue.hourContribution.hours,
        hourlyRate: currentValue.hourContribution.hourlyRate,
        benRatePer: currentValue.hourContribution.benRatePer,
      };
    } else if (currentValue?.otherContribution) {
      otherContribution = {
        itemName: currentValue.otherContribution.itemName,
        value: currentValue.otherContribution.value,
        items: currentValue.otherContribution.items,
      };
    } else {
      throw new Error(
        `no contribution sub-item, unexpected values in contribution ${currentValue.id}`
      );
    }
    return [
      ...previousValue,
      {
        id: currentValue.id,
        contributorId: currentValue.contributorId,
        date: currentValue.date,
        details: currentValue.details,
        hourContribution,
        otherContribution,
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

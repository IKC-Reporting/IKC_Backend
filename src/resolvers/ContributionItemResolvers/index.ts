import { employeeHours, otherContributions } from "../../__mock__";
// import { OtherContribution } from "../../generated/graphql";

export const contributionItems = {
  Query: {
    employeeHours: async () => employeeHours,
    otherContributions: async () => otherContributions,
  },
  Mutation: {
    createOtherContributionItem: async (_, { name }) => {
      if (name) {
        return true;
      } else {
        return false;
      }
    },
  },
};

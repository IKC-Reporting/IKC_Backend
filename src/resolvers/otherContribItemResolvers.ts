import { randomUUID } from "crypto";
import { otherContributions } from "../__mock__";

export const OtherContribItemResolvers = {
  Query: {
    otherContribItem(id) {
      const mock = otherContributions[0];

      return {
        id: randomUUID(),
        contributionDate: mock.date,
        contributor: {
          annualSalary: 123,
          benRatePer: 0.2,
          dailyHours: 12,
          userId: randomUUID(),
        },
        details: mock.details,
        name: "name",
        value: mock.value,
      };
    },
  },
};

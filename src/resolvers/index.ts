import { Resolvers } from "../generated/graphql";
import contributionResolvers from "./contributionResolvers";
import contributorResolvers from "./contributorResolvers";
import ikcReportResolvers from "./ikcReportResolvers";
import userResolvers from "./userResolvers.js";

const resolvers: Resolvers = {
  Query: {
    ...userResolvers.Query,
    ...contributorResolvers.Query,
    ...contributionResolvers.Query,
    ...ikcReportResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...contributorResolvers.Mutation,
    ...contributionResolvers.Mutation,
    ...ikcReportResolvers.Mutation,
  },
};
export default resolvers;

// val: async (parent, args, context, info) =>{const {}=args;return null}

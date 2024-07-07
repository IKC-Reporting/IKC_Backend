import { Resolvers } from "../generated/graphql";
import contributionResolvers from "./contributionResolvers";
import contributorResolvers from "./contributorResolvers";
import userResolvers from "./userResolvers.js";

const resolvers: Resolvers = {
  Query: {
    ...userResolvers.Query,
    ...contributorResolvers.Query,
    ...contributionResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...contributorResolvers.Mutation,
    ...contributionResolvers.Mutation,
  },
};
export default resolvers;

// val: async (parent, args, context, info) =>{const {}=args;return null}

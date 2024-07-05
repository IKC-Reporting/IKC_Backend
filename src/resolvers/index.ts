import { Resolvers } from "../generated/graphql";
import contributorResolvers from "./contributorResolvers";
import otherContribItemResolvers from "./otherContribItemResolvers";
import userResolvers from "./userResolvers.js";

const resolvers: Resolvers = {
  Query: {
    ...userResolvers.Query,
    ...contributorResolvers.Query,
    ...otherContribItemResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...contributorResolvers.Mutation,
    ...otherContribItemResolvers.Mutation,
  },
};
export default resolvers;

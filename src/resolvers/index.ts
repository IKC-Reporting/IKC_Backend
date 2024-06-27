import { Resolvers } from "../generated/graphql";
import { OtherContribItemResolvers } from "./otherContribItemResolvers";
const resolvers: Resolvers = { Query: { ...OtherContribItemResolvers.Query } };
export default resolvers;

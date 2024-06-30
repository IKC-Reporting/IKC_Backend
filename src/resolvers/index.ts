import { Resolvers } from "../generated/graphql";
import userResolvers from "./userResolvers.js";

const resolvers: Resolvers = {
  ...userResolvers,
};
export default resolvers;

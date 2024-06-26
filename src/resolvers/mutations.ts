import { MutationResolvers } from "../generated/graphql";
import { contributionItems } from "./ContributionItemResolvers/index.js";

// Use the generated `MutationResolvers` type
// to type check our mutations!
const mutations: MutationResolvers = {
  ...contributionItems?.Mutation,
};

export default mutations;

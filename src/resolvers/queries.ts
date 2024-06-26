import { QueryResolvers } from "../generated/graphql";
import { contributionItems } from "./ContributionItemResolvers/index.js";

// Use the generated `QueryResolvers`
// type to type check our queries!
const queries: QueryResolvers = {
  ...contributionItems.Query,
};

export default queries;

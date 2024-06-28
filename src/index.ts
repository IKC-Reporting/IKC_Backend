import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { readFileSync } from "fs";
import resolvers from "./resolvers/index.js";

const typeDefs = readFileSync("./schema.graphql", "utf8");
// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

console.log(process.env.GRAPHQL_PORT);
// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  listen: { port: parseInt(process.env.GRAPHQL_PORT) },
});

console.log(`🚀  Server ready at: ${url}`);

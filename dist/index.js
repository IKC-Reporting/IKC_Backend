import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
export const typeDefs = `
  type EmployeeHour {
    employeeName: String
    hoursPerMonth1: Int
    hoursPerMonth2: Int
    hoursPerMonth3: Int
    totalHours: Int
    hourly: Float
    total: Float
  }

  type OtherContribution {
    item: String
    date: String
    details: String
    value: Float
  }

  type Query {
    employeeHours: [EmployeeHour]
    otherContributions: [OtherContribution]
  }
`;
export const employeeHours = [
    {
        employeeName: 'Jane Smith',
        hoursPerMonth1: 3,
        hoursPerMonth2: 5,
        hoursPerMonth3: 2,
        totalHours: 10,
        hourly: 50.00,
        total: 500.00,
    },
    {
        employeeName: 'Frank Turner',
        hoursPerMonth1: 5,
        hoursPerMonth2: 4,
        hoursPerMonth3: 8,
        totalHours: 17,
        hourly: 15.00,
        total: 255.00,
    },
    {
        employeeName: 'Karen Jones',
        hoursPerMonth1: 8,
        hoursPerMonth2: 9,
        hoursPerMonth3: 10,
        totalHours: 27,
        hourly: 100.00,
        total: 2700.00,
    },
];
export const otherContributions = [
    {
        item: 'Equipment',
        date: '2021-01-10',
        details: '2 x sensors for project ($100 each)',
        value: 200.00,
    },
    {
        item: 'Travel',
        date: '2021-02-15',
        details: 'Travel for site meeting (20km each way @ 0.61/km)',
        value: 24.40,
    },
    {
        item: 'Travel',
        date: '2021-03-22',
        details: 'Travel to Conestoga College (20km each way @ 0.61/km)',
        value: 24.40,
    },
    {
        item: 'Materials/Supplies',
    },
    {
        item: 'Other',
    },
];
// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves contributions from the "contributions" array above.
export const resolvers = {
    Query: {
        employeeHours: () => employeeHours,
        otherContributions: () => otherContributions,
    },
};
// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
    typeDefs,
    resolvers,
});
// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});
console.log(`🚀  Server ready at: ${url}`);

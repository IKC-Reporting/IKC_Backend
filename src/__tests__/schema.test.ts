import { describe, it, expect } from 'vitest';
import { resolvers } from '../index';

describe('GraphQL Resolvers', () => {
  it('should return all employee hours', () => {
    const employeeHours = resolvers.Query.employeeHours();
    expect(employeeHours).toHaveLength(3); // Assuming there are 3 employee hours
  });

  it('should return all other contributions', () => {
    const otherContributions = resolvers.Query.otherContributions();
    expect(otherContributions).toHaveLength(5); // Assuming there are 5 other contributions
  });
});

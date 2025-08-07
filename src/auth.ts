
import { users } from './mockData.ts';

/**
 * Simulates authentication by retrieving a user object from in-memory data
 * based on the provided user ID. Throws an error if the user is not found.
 *
 * Used to enforce role-based access control (RBAC) throughout the API.
 *
 * @param userId - The ID of the user making the request
 * @returns The matching user object from the mock users list
 */

export function getCurrentUser(userId: string) {
  const user = users.find(u => u.id === userId);
  if (!user) {
    throw new Error("User not found or not authenticated.");
  }
  return user;
}

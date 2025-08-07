// src/auth.ts
import { users } from './mockData.ts';

export function getCurrentUser(userId: string) {
  const user = users.find(u => u.id === userId);
  if (!user) {
    throw new Error("User not found or not authenticated.");
  }
  return user;
}

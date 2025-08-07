//src/mockData.ts

import { Role, Visibility } from './types.ts';

export const users = [
  { id: "1", name: "Alice", role: Role.EMPLOYEE, team: "Engineering" },
  { id: "2", name: "Bob", role: Role.MANAGER, team: "Engineering" },
  { id: "3", name: "Charlie", role: Role.HR, team: "People" },
  { id: "4", name: "Dana", role: Role.EMPLOYEE, team: "Marketing" },
];

export const recognitions = [
  {
    id: "101",
    senderId: "1",
    recipientId: "2",
    message: "Thanks for the support on the sprint!",
    emoji: "👏",
    visibility: Visibility.PUBLIC,
    createdAt: new Date().toISOString(),
  },
  {
    id: "102",
    senderId: "2",
    recipientId: "1",
    message: "Great job fixing that critical bug.",
    emoji: "🐛",
    visibility: Visibility.PRIVATE,
    createdAt: new Date().toISOString(),
  },
];

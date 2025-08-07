// src/resolvers.ts

import { PubSub } from 'graphql-subscriptions';
import { users, recognitions } from './mockData.ts';
import { getCurrentUser } from './auth.ts';
import { Role, Visibility } from './types.ts';

// Initialize PubSub for real-time GraphQL subscriptions
const pubsub = new PubSub();
const NEW_RECOGNITION = 'NEW_RECOGNITION';

/**
 * GraphQL resolvers for Query, Mutation, Subscription, and custom fields.
 * Handles business logic for fetching data, enforcing role-based access,
 * sending recognitions, and broadcasting real-time updates.
 */
export const resolvers = {
  // ------------------ Query Resolvers ------------------
  Query: {
    /**
     * Returns the list of all users.
     */
    users: () => users,

    /**
     * Returns recognitions visible to the current user.
     * - HR and MANAGER roles can see all recognitions.
     * - Other roles only see PUBLIC recognitions.
     */
    recognitions: (_: any, { userId }: { userId: string }) => {
      const currentUser = getCurrentUser(userId);
      if (
        currentUser.role === Role.HR ||
        currentUser.role === Role.MANAGER
      ) {
        return recognitions;
      }
      return recognitions.filter(r => r.visibility === Visibility.PUBLIC);
    },

    /**
     * Returns recognitions received by the current user.
     * Allows EMPLOYEE to view recognitions addressed to them,
     * including PRIVATE and ANONYMOUS ones.
     */
    myRecognitions: (_: any, { userId }: { userId: string }) => {
      const currentUser = getCurrentUser(userId);
      return recognitions.filter(r =>
        r.recipientId === currentUser.id &&
        [Visibility.PUBLIC, Visibility.PRIVATE, Visibility.ANONYMOUS].includes(
          r.visibility
        )
      );
    },
  },

  // ------------------ Mutation Resolver ------------------
  Mutation: {
    /**
     * Sends a new recognition from one user to another.
     * - Creates a new recognition object with timestamp
     * - Stores it in memory
     * - Publishes it via PubSub for real-time delivery
     */
    sendRecognition: (
      _: any,
      args: {
        senderId: string;
        recipientId: string;
        message: string;
        emoji: string;
        visibility: Visibility;
      }
    ) => {
      const sender = getCurrentUser(args.senderId);
      const newRec = {
        id: `${Date.now()}`,
        senderId: sender.id,
        recipientId: args.recipientId,
        message: args.message,
        emoji: args.emoji,
        visibility: args.visibility,
        createdAt: new Date().toISOString(),
      };
      recognitions.push(newRec);
      pubsub.publish(NEW_RECOGNITION, { newRecognition: newRec });
      return newRec;
    },
  },

  // ------------------ Subscription Resolver ------------------
  Subscription: {
    /**
     * Subscribes to real-time notifications for new recognitions.
     * Triggered whenever sendRecognition publishes an event.
     */
    newRecognition: {
      subscribe: () => pubsub.asyncIterableIterator(NEW_RECOGNITION),
    },
  },

  // ------------------ Field Resolvers ------------------
  Recognition: {
    /**
     * Resolves the sender's user object for each recognition.
     */
    sender: (r: any) => users.find(u => u.id === r.senderId)!,

    /**
     * Resolves the recipient's user object for each recognition.
     */
    recipient: (r: any) => users.find(u => u.id === r.recipientId)!,
  },
};

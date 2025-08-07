// src/resolvers.ts

import { PubSub } from 'graphql-subscriptions';
import { users, recognitions } from './mockData.ts';
import { getCurrentUser } from './auth.ts';
import { Role, Visibility } from './types.ts';


// 4️⃣ Instantiate and cast
const pubsub = new PubSub();
const NEW_RECOGNITION = 'NEW_RECOGNITION';

export const resolvers = {
  Query: {
    users: () => users,

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

  Mutation: {
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

  Subscription: {
    newRecognition: {
      // 🎉 No TS error here now
      subscribe: () => pubsub.asyncIterableIterator(NEW_RECOGNITION),
    },
  },

  Recognition: {
    sender: (r: any) => users.find(u => u.id === r.senderId)!,
    recipient: (r: any) => users.find(u => u.id === r.recipientId)!,
  },
};


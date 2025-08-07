//src/index.ts

import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@as-integrations/express5';
import { createServer } from 'http';
import express from 'express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import cors from 'cors';

import { resolvers } from './resolvers.ts';
import { typeDefs } from './schema.ts';

// 1️⃣ Build a shared schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// 2️⃣ Set up Express + HTTP server
const app = express();
const httpServer = createServer(app);

// 3️⃣ Attach a WebSocket server on the **same** `/graphql` path
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',        // <— match your HTTP endpoint!
});
const serverCleanup = useServer({ schema }, wsServer);

// 4️⃣ Create ApolloServer with drain plugins
const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

// 5️⃣ Start and apply middleware
await server.start();
app.use(
  '/graphql',
  cors<cors.CorsRequest>(),
  express.json(),
  expressMiddleware(server),
);

// 6️⃣ Listen on port 4000 (both HTTP & WS)
httpServer.listen(4000, () => {
  console.log(`🚀 Server running at http://localhost:4000/graphql`);
  console.log(`🚀 Subscriptions ready at ws://localhost:4000/graphql`);
});

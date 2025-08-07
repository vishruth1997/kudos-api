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

/**
 * Construct an executable GraphQL schema from type definitions and resolvers.
 * This schema will be shared by both HTTP and WebSocket servers.
 */
const schema = makeExecutableSchema({ typeDefs, resolvers });

/**
 * Initialize Express application and create an HTTP server to host both:
 * - Apollo GraphQL API (via HTTP)
 * - GraphQL Subscriptions (via WebSocket)
 */
const app = express();
const httpServer = createServer(app);

/**
 * Attach a WebSocket server to support GraphQL subscriptions on the same `/graphql` path.
 * The useServer() function binds the schema to the WebSocket server.
 */
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});
const serverCleanup = useServer({ schema }, wsServer);

/**
 * Create an ApolloServer instance with:
 * - Shared schema (HTTP + WebSocket)
 * - Plugin to properly close WebSocket server on shutdown
 */
const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose(); // Clean up WebSocket server
          },
        };
      },
    },
  ],
});

/**
 * Start the Apollo Server and bind it as middleware on the `/graphql` path.
 * Middleware includes:
 * - CORS policy
 * - JSON body parsing
 * - Apollo Express integration
 */
await server.start();
app.use(
  '/graphql',
  cors<cors.CorsRequest>(),
  express.json(),
  expressMiddleware(server),
);

/**
 * Start listening on port 4000.
 * Both HTTP and WebSocket GraphQL endpoints are hosted under `/graphql`.
 */
httpServer.listen(4000, () => {
  console.log(` Server running at http://localhost:4000/graphql`);
  console.log(` Subscriptions ready at ws://localhost:4000/graphql`);
});

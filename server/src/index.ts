import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas and handlers
import { createNameInputSchema, getNameInputSchema } from './schema';
import { createName } from './handlers/create_name';
import { getName } from './handlers/get_name';
import { getPedro } from './handlers/get_pedro';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Create a new name
  createName: publicProcedure
    .input(createNameInputSchema)
    .mutation(({ input }) => createName(input)),
  
  // Get a name by ID
  getName: publicProcedure
    .input(getNameInputSchema)
    .query(({ input }) => getName(input)),
  
  // Get Pedro specifically - main endpoint for displaying Pedro on screen
  getPedro: publicProcedure
    .query(() => getPedro()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
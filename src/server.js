import path from 'node:path';
import fastify from 'fastify';
import fastifyStatic from 'fastify-static';
import fastifyFormBody from 'fastify-formbody';
import fastifyMultipart from 'fastify-multipart';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
let counter = 0;

const server = fastify({
  logger: true,
});
server.register(fastifyStatic, {
  root: __dirname,
});
server.register(fastifyFormBody);
server.register(fastifyMultipart, {
  addToBody: true,
});

// Declare a route
server.get('/', async (request, reply) => {
  return reply.sendFile('index.html');
});

server.post('/api/blog', (request, reply) => {
  counter++;

  // Browser native requests (form submissions or page refreshes)
  if (request.headers['sec-fetch-mode'] === 'navigate') {
    return reply.redirect(303, request.headers.referer);
  }

  return { counter };
});
server.get('/api/blog/', (request, reply) => {
  // Browser native requests (form submissions or page refreshes)
  if (request.headers['sec-fetch-mode'] === 'navigate') {
    return reply.redirect(303, request.headers.referer);
  }
  return { counter };
});
server.get('/api/blog/:id', (request, reply) => {
  // Browser native requests (form submissions or page refreshes)
  if (request.headers['sec-fetch-mode'] === 'navigate') {
    return reply.redirect(303, request.headers.referer);
  }
  return { counter };
});
server.post('/api/blog/:id/update', (request, reply) => {
  counter = request.body.counter;
  // Browser native requests (form submissions or page refreshes)
  if (request.headers['sec-fetch-mode'] === 'navigate') {
    return reply.redirect(303, request.headers.referer);
  }
  return { counter };
});
server.post('/api/blog/:id/delete', (request, reply) => {
  counter = 0;
  // Browser native requests (form submissions or page refreshes)
  if (request.headers['sec-fetch-mode'] === 'navigate') {
    return reply.redirect(303, request.headers.referer);
  }
  return { counter };
});

// Run the server!
const start = async () => {
  try {
    await server.listen(3000);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};
start();

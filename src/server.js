import path from 'node:path'
import fastify from 'fastify'
import fastifyStatic from 'fastify-static'
import fastifyFormBody from 'fastify-formbody'
import fastifyMultipart from 'fastify-multipart'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const server = fastify({
  logger: true
})
server.register(fastifyStatic, {
  root: __dirname,
})
server.register(fastifyFormBody)
server.register(fastifyMultipart, {
  addToBody: true,
})

// Declare a route
server.get('/', async (request, reply) => {
  return reply.sendFile('index.html')
})

server.all('/api', (request, reply) => {
  console.log(request.body)
  return request.body
})

// Run the server!
const start = async () => {
  try {
    await server.listen(3000)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}
start()
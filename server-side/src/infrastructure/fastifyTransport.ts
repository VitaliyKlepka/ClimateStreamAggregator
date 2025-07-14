import Fastify from 'fastify';
import cors from '@fastify/cors';

export async function createFastifyTransport() {
  const fastify = Fastify({ logger: true });
  await fastify.register(cors);

  return fastify;
}
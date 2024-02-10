import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  if (process.env.NODE_ENV !== 'production') {
    // development
    const prisma = new PrismaClient({
      log: ['info', 'warn', 'error', { emit: 'event', level: 'query' }],
    });
    prisma.$on('query', (e) => {
      const { timestamp, query, params, duration } = e;
      console.log('prisma:query', { timestamp, query, params, duration });
    });
    return prisma;
  } else {
    // production
    const prisma = new PrismaClient({
      log: ['info', 'error'],
    });
    return prisma;
  }
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

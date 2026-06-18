import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';
import crypto from 'crypto';

const basePrisma = global.basePrisma || new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
    { emit: 'stdout', level: 'error' },
  ],
});

if (process.env.NODE_ENV !== 'production') {
  global.basePrisma = basePrisma;
}

// Log queries in development
if (process.env.NODE_ENV !== 'production') {
  basePrisma.$on('query', (e) => {
    logger.debug(`Prisma Query: ${e.query} - Params: ${e.params} - Duration: ${e.duration}ms`);
  });
}

const modelsWithUpdatedAt = ['clinic', 'user', 'doctor', 'staff', 'patient', 'subscription', 'certificate', 'setting'];

// Global Soft Delete and Auto-UUID / Auto-UpdatedAt Injection using Prisma Extensions
export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const lowerModel = model.toLowerCase();

        // 1. Auto-generate UUIDs and set updatedAt for insertion operations
        if (operation === 'create') {
          args.data = args.data || {};
          if (!args.data.id) {
            args.data.id = crypto.randomUUID();
          }
          if (modelsWithUpdatedAt.includes(lowerModel) && !args.data.updatedAt) {
            args.data.updatedAt = new Date();
          }
        } else if (operation === 'createMany') {
          if (Array.isArray(args.data)) {
            args.data.forEach(item => {
              if (item) {
                if (!item.id) item.id = crypto.randomUUID();
                if (modelsWithUpdatedAt.includes(lowerModel) && !item.updatedAt) {
                  item.updatedAt = new Date();
                }
              }
            });
          } else if (args.data && Array.isArray(args.data.data)) {
            args.data.data.forEach(item => {
              if (item) {
                if (!item.id) item.id = crypto.randomUUID();
                if (modelsWithUpdatedAt.includes(lowerModel) && !item.updatedAt) {
                  item.updatedAt = new Date();
                }
              }
            });
          }
        } else if (operation === 'upsert') {
          args.create = args.create || {};
          if (!args.create.id) {
            args.create.id = crypto.randomUUID();
          }
          if (modelsWithUpdatedAt.includes(lowerModel) && !args.create.updatedAt) {
            args.create.updatedAt = new Date();
          }
          
          args.update = args.update || {};
          if (modelsWithUpdatedAt.includes(lowerModel) && !args.update.updatedAt) {
            args.update.updatedAt = new Date();
          }
        } else if (operation === 'update') {
          args.data = args.data || {};
          if (modelsWithUpdatedAt.includes(lowerModel) && !args.data.updatedAt) {
            args.data.updatedAt = new Date();
          }
        } else if (operation === 'updateMany') {
          args.data = args.data || {};
          if (modelsWithUpdatedAt.includes(lowerModel) && !args.data.updatedAt) {
            args.data.updatedAt = new Date();
          }
        }

        // 2. Global Soft Delete filter/intercept
        const softDeleteModels = ['clinic', 'user', 'doctor', 'staff', 'patient', 'certificate'];
        
        if (softDeleteModels.includes(lowerModel)) {
          // Read operations: filter out soft-deleted records
          if (['findFirst', 'findMany', 'findUnique', 'count'].includes(operation)) {
            args.where = args.where || {};
            if (args.where.deletedAt === undefined) {
              args.where.deletedAt = null;
            }
          }
          
          // Intercept single delete -> soft delete update
          if (operation === 'delete') {
            return basePrisma[model].update({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }
          
          // Intercept multiple delete -> soft delete updateMany
          if (operation === 'deleteMany') {
            return basePrisma[model].updateMany({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }
        }
        
        return query(args);
      },
    },
  },
});

export default prisma;

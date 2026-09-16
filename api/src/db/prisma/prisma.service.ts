import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../../generated/prisma/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Prisma: Successfully connected');
    } catch (error) {
      console.error('❌ Prisma: Connection error - ', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

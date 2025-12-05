/**
 * FASE 4.4: CUSTOM WEBHOOKS
 * Auto-Model Router: GPT-5.1 Codex (Backend/NestJS/Module)
 * 
 * Módulo para webhooks customizados que permitem
 * aos usuários integrar com qualquer API externa
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomWebhooksService } from './custom-webhooks.service';
import { CustomWebhooksController } from './custom-webhooks.controller';
import { PrismaModule } from '@/database/prisma.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    BullModule.registerQueue({
      name: 'webhooks',
    }),
  ],
  providers: [CustomWebhooksService],
  controllers: [CustomWebhooksController],
  exports: [CustomWebhooksService],
})
export class CustomWebhooksModule {}

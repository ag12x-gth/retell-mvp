/**
 * FASE 4.1: INTEGRAÇÃO TWILIO
 * Auto-Model Router: GPT-5.1 Codex (Backend/NestJS/Module)
 * 
 * Módulo de integração com Twilio para:
 * - Compra e provisionamento de números
 * - Configuração de webhooks
 * - Envio de SMS
 * - Verificação de números (Caller ID)
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TwilioService } from './twilio.service';
import { TwilioController } from './twilio.controller';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [TwilioService],
  controllers: [TwilioController],
  exports: [TwilioService],
})
export class TwilioModule {}

/**
 * FASE 4: INTEGRAÇÕES (Semanas 10-11)
 * Auto-Model Router: GPT-5.1 Codex (Backend/NestJS/Module)
 * 
 * Módulo central de integrações que agrupa todos os módulos
 * de integração externa (Twilio, CRM, Calendar, Custom Webhooks)
 */

import { Module } from '@nestjs/common';
import { TwilioModule } from './twilio/twilio.module';
import { CrmModule } from './crm/crm.module';
import { CalendarModule } from './calendar/calendar.module';
import { CustomWebhooksModule } from './custom-webhooks/custom-webhooks.module';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';

@Module({
  imports: [
    TwilioModule,
    CrmModule,
    CalendarModule,
    CustomWebhooksModule,
  ],
  providers: [IntegrationsService],
  controllers: [IntegrationsController],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}

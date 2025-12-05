/**
 * FASE 4.2: INTEGRAÇÃO CRM
 * Auto-Model Router: GPT-5.1 Codex (Backend/NestJS/Module)
 * 
 * Módulo de integração com CRMs:
 * - Salesforce
 * - HubSpot
 * - Zendesk
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CrmService } from './crm.service';
import { SalesforceService } from './salesforce.service';
import { HubspotService } from './hubspot.service';
import { ZendeskService } from './zendesk.service';
import { CrmController } from './crm.controller';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [CrmService, SalesforceService, HubspotService, ZendeskService],
  controllers: [CrmController],
  exports: [CrmService],
})
export class CrmModule {}

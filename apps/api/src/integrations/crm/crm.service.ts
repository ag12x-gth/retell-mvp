/**
 * FASE 4.2: CRM SERVICE (Orquestrador)
 * Auto-Model Router: GPT-5.1 Codex (Backend/TypeScript/Service)
 * 
 * Serviço orquestrador que abstrai integrações com múltiplos CRMs
 * através de uma interface unificada
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SalesforceService } from './salesforce.service';
import { HubspotService } from './hubspot.service';
import { ZendeskService } from './zendesk.service';
import { PrismaService } from '@/database/prisma.service';

export type CrmProvider = 'salesforce' | 'hubspot' | 'zendesk';

export interface CreateLeadDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  company?: string;
  source?: string;
  callId: string;
  notes?: string;
}

export interface CreateTicketDto {
  subject: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: string;
  callId: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface SyncCallDto {
  callId: string;
  syncTranscript?: boolean;
  syncRecording?: boolean;
  syncAnalytics?: boolean;
}

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);

  constructor(
    private prisma: PrismaService,
    private salesforceService: SalesforceService,
    private hubspotService: HubspotService,
    private zendeskService: ZendeskService,
  ) {}

  /**
   * Obter serviço CRM específico
   */
  private getCrmService(provider: CrmProvider) {
    switch (provider) {
      case 'salesforce':
        return this.salesforceService;
      case 'hubspot':
        return this.hubspotService;
      case 'zendesk':
        return this.zendeskService;
      default:
        throw new BadRequestException(`Unsupported CRM provider: ${provider}`);
    }
  }

  /**
   * Criar lead no CRM após chamada de vendas
   */
  async createLead(provider: CrmProvider, dto: CreateLeadDto, organizationId: string) {
    this.logger.log(`Creating lead in ${provider} for org ${organizationId}`);

    try {
      const crmService = this.getCrmService(provider);
      const result = await crmService.createLead(dto);

      // Registrar atividade no banco
      await this.prisma.crmActivity.create({
        data: {
          organizationId,
          provider,
          activityType: 'lead_created',
          callId: dto.callId,
          externalId: result.id,
          metadata: result,
        },
      });

      return result;
    } catch (error) {
      this.logger.error(`Error creating lead in ${provider}:`, error);
      throw new BadRequestException(`Failed to create lead: ${error.message}`);
    }
  }

  /**
   * Criar ticket de suporte no CRM
   */
  async createTicket(provider: CrmProvider, dto: CreateTicketDto, organizationId: string) {
    this.logger.log(`Creating ticket in ${provider} for org ${organizationId}`);

    try {
      const crmService = this.getCrmService(provider);
      const result = await crmService.createTicket(dto);

      // Registrar atividade
      await this.prisma.crmActivity.create({
        data: {
          organizationId,
          provider,
          activityType: 'ticket_created',
          callId: dto.callId,
          externalId: result.id,
          metadata: result,
        },
      });

      return result;
    } catch (error) {
      this.logger.error(`Error creating ticket in ${provider}:`, error);
      throw new BadRequestException(`Failed to create ticket: ${error.message}`);
    }
  }

  /**
   * Sincronizar chamada completa com CRM
   */
  async syncCall(provider: CrmProvider, dto: SyncCallDto, organizationId: string) {
    this.logger.log(`Syncing call ${dto.callId} to ${provider}`);

    try {
      // Buscar dados da chamada
      const call = await this.prisma.call.findUnique({
        where: { id: dto.callId },
        include: {
          agent: true,
          transcript: dto.syncTranscript,
          analytics: dto.syncAnalytics,
        },
      });

      if (!call) {
        throw new BadRequestException('Call not found');
      }

      const crmService = this.getCrmService(provider);
      const result = await crmService.syncCall(call, dto);

      // Registrar atividade
      await this.prisma.crmActivity.create({
        data: {
          organizationId,
          provider,
          activityType: 'call_synced',
          callId: dto.callId,
          externalId: result.id,
          metadata: result,
        },
      });

      return result;
    } catch (error) {
      this.logger.error(`Error syncing call to ${provider}:`, error);
      throw new BadRequestException(`Failed to sync call: ${error.message}`);
    }
  }

  /**
   * Testar conexão com CRM
   */
  async testConnection(provider: CrmProvider, credentials: any) {
    try {
      const crmService = this.getCrmService(provider);
      const result = await crmService.testConnection(credentials);
      return { success: true, provider, ...result };
    } catch (error) {
      this.logger.error(`Connection test failed for ${provider}:`, error);
      return { success: false, provider, error: error.message };
    }
  }

  /**
   * Listar atividades do CRM
   */
  async listActivities(organizationId: string, filters?: {
    provider?: CrmProvider;
    activityType?: string;
    callId?: string;
  }) {
    return this.prisma.crmActivity.findMany({
      where: {
        organizationId,
        ...filters,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });
  }

  /**
   * Configurar integração CRM
   */
  async configureIntegration(
    organizationId: string,
    provider: CrmProvider,
    config: {
      enabled: boolean;
      credentials: any;
      settings?: {
        autoCreateLeads?: boolean;
        autoCreateTickets?: boolean;
        syncTranscripts?: boolean;
      };
    },
  ) {
    // Testar conexão primeiro
    if (config.enabled) {
      const testResult = await this.testConnection(provider, config.credentials);
      if (!testResult.success) {
        throw new BadRequestException(`Connection test failed: ${testResult.error}`);
      }
    }

    // Salvar configuração
    const integration = await this.prisma.integration.upsert({
      where: {
        organizationId_provider: {
          organizationId,
          provider,
        },
      },
      update: {
        enabled: config.enabled,
        credentials: config.credentials,
        settings: config.settings || {},
        updatedAt: new Date(),
      },
      create: {
        organizationId,
        provider,
        enabled: config.enabled,
        credentials: config.credentials,
        settings: config.settings || {},
      },
    });

    return integration;
  }
}

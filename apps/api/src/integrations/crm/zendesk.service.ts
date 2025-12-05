/**
 * FASE 4.2.3: ZENDESK SERVICE
 * Auto-Model Router: GPT-5.1 Codex (Backend/TypeScript/Service)
 * 
 * Implementação específica para Zendesk Support
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type { CreateTicketDto } from './crm.service';

@Injectable()
export class ZendeskService {
  private readonly logger = new Logger(ZendeskService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Obter credenciais do Zendesk
   */
  private getCredentials(credentials?: any) {
    return {
      subdomain: credentials?.subdomain || this.configService.get('ZENDESK_SUBDOMAIN'),
      email: credentials?.email || this.configService.get('ZENDESK_EMAIL'),
      apiToken: credentials?.apiToken || this.configService.get('ZENDESK_API_TOKEN'),
    };
  }

  /**
   * Obter base URL
   */
  private getBaseUrl(credentials?: any): string {
    const { subdomain } = this.getCredentials(credentials);
    return `https://${subdomain}.zendesk.com/api/v2`;
  }

  /**
   * Obter headers de autenticação
   */
  private getAuthHeaders(credentials?: any) {
    const { email, apiToken } = this.getCredentials(credentials);
    const authString = Buffer.from(`${email}/token:${apiToken}`).toString('base64');
    
    return {
      Authorization: `Basic ${authString}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Criar Lead (User) no Zendesk
   */
  async createLead(dto: any, credentials?: any) {
    const baseUrl = this.getBaseUrl(credentials);
    const headers = this.getAuthHeaders(credentials);

    const userData = {
      user: {
        name: `${dto.firstName} ${dto.lastName}`,
        email: dto.email,
        phone: dto.phone,
        organization_id: dto.company ? undefined : null,
        user_fields: {
          call_id: dto.callId,
          source: dto.source || 'AI Phone Call',
        },
      },
    };

    const response = await axios.post(
      `${baseUrl}/users`,
      userData,
      { headers },
    );

    this.logger.log(`User created in Zendesk: ${response.data.user.id}`);

    return {
      id: response.data.user.id,
      success: true,
      userData: response.data.user,
    };
  }

  /**
   * Criar Ticket no Zendesk
   */
  async createTicket(dto: CreateTicketDto, credentials?: any) {
    const baseUrl = this.getBaseUrl(credentials);
    const headers = this.getAuthHeaders(credentials);

    // Mapear prioridade
    const priorityMap = {
      low: 'low',
      medium: 'normal',
      high: 'high',
      urgent: 'urgent',
    };

    const ticketData = {
      ticket: {
        subject: dto.subject,
        comment: {
          body: dto.description,
        },
        priority: priorityMap[dto.priority] || 'normal',
        status: dto.status || 'new',
        type: 'problem',
        tags: ['ai-call', 'retell-ai'],
        custom_fields: [
          {
            id: 'call_id',
            value: dto.callId,
          },
        ],
        // Se houver email/phone do cliente, criar/vincular usuário
        requester: dto.customerEmail ? {
          email: dto.customerEmail,
          phone: dto.customerPhone,
        } : undefined,
      },
    };

    const response = await axios.post(
      `${baseUrl}/tickets`,
      ticketData,
      { headers },
    );

    this.logger.log(`Ticket created in Zendesk: ${response.data.ticket.id}`);

    return {
      id: response.data.ticket.id,
      success: true,
      ticketData: response.data.ticket,
    };
  }

  /**
   * Sincronizar chamada como comentário no ticket
   */
  async syncCall(call: any, options: any, credentials?: any) {
    const baseUrl = this.getBaseUrl(credentials);
    const headers = this.getAuthHeaders(credentials);

    // Criar ticket para a chamada
    const ticketData = {
      ticket: {
        subject: `AI Call Log - ${new Date(call.startedAt).toLocaleString()}`,
        comment: {
          body: `
**AI Call Recording**

**Agent:** ${call.agent.name}
**Duration:** ${call.duration}s
**Sentiment:** ${call.callAnalysis?.sentiment || 'N/A'}
**Success:** ${call.callAnalysis?.successful ? 'Yes' : 'No'}
**From:** ${call.fromNumber}
**To:** ${call.toNumber}

**Summary:**
${call.callAnalysis?.summary || 'N/A'}

${options.syncTranscript ? `**Transcript:**\n${call.transcript}` : ''}

${call.recordingUrl ? `**Recording:** ${call.recordingUrl}` : ''}
          `.trim(),
          public: false, // Comentário interno
        },
        type: 'task',
        status: 'solved',
        tags: ['ai-call', 'auto-generated'],
        custom_fields: [
          {
            id: 'call_id',
            value: call.id,
          },
        ],
      },
    };

    const response = await axios.post(
      `${baseUrl}/tickets`,
      ticketData,
      { headers },
    );

    this.logger.log(`Call ticket created in Zendesk: ${response.data.ticket.id}`);

    return {
      id: response.data.ticket.id,
      success: true,
      ticketData: response.data.ticket,
    };
  }

  /**
   * Testar conexão
   */
  async testConnection(credentials?: any) {
    try {
      const baseUrl = this.getBaseUrl(credentials);
      const headers = this.getAuthHeaders(credentials);

      const response = await axios.get(
        `${baseUrl}/tickets/count`,
        { headers },
      );

      return {
        connected: true,
        ticketCount: response.data.count.value,
      };
    } catch (error) {
      this.logger.error('Zendesk connection test failed:', error);
      throw error;
    }
  }
}

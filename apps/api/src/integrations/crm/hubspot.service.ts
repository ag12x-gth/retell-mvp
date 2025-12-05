/**
 * FASE 4.2.2: HUBSPOT SERVICE
 * Auto-Model Router: GPT-5.1 Codex (Backend/TypeScript/Service)
 * 
 * Implementação específica para HubSpot CRM
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type { CreateLeadDto, CreateTicketDto } from './crm.service';

@Injectable()
export class HubspotService {
  private readonly logger = new Logger(HubspotService.name);
  private readonly baseUrl = 'https://api.hubapi.com';

  constructor(private configService: ConfigService) {}

  /**
   * Obter API key do HubSpot
   */
  private getApiKey(credentials?: any): string {
    return credentials?.apiKey || this.configService.get('HUBSPOT_API_KEY');
  }

  /**
   * Criar Contact (lead) no HubSpot
   */
  async createLead(dto: CreateLeadDto, credentials?: any) {
    const apiKey = this.getApiKey(credentials);

    const contactData = {
      properties: {
        firstname: dto.firstName,
        lastname: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        company: dto.company,
        hs_lead_status: 'NEW',
        // Custom property para vincular com a chamada
        call_id: dto.callId,
        lifecyclestage: 'lead',
      },
    };

    const response = await axios.post(
      `${this.baseUrl}/crm/v3/objects/contacts`,
      contactData,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    this.logger.log(`Contact created in HubSpot: ${response.data.id}`);

    // Criar nota adicional se houver
    if (dto.notes) {
      await this.createNote(response.data.id, dto.notes, apiKey);
    }

    return {
      id: response.data.id,
      success: true,
      contactData: response.data.properties,
    };
  }

  /**
   * Criar Ticket no HubSpot
   */
  async createTicket(dto: CreateTicketDto, credentials?: any) {
    const apiKey = this.getApiKey(credentials);

    const ticketData = {
      properties: {
        subject: dto.subject,
        content: dto.description,
        hs_pipeline_stage: '1', // New ticket
        hs_ticket_priority: dto.priority?.toUpperCase() || 'MEDIUM',
        source_type: 'PHONE',
        // Custom property
        call_id: dto.callId,
      },
    };

    const response = await axios.post(
      `${this.baseUrl}/crm/v3/objects/tickets`,
      ticketData,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    this.logger.log(`Ticket created in HubSpot: ${response.data.id}`);

    return {
      id: response.data.id,
      success: true,
      ticketData: response.data.properties,
    };
  }

  /**
   * Criar nota no HubSpot
   */
  private async createNote(contactId: string, note: string, apiKey: string) {
    const noteData = {
      properties: {
        hs_note_body: note,
        hs_timestamp: new Date().toISOString(),
      },
    };

    await axios.post(
      `${this.baseUrl}/crm/v3/objects/notes`,
      noteData,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    // Associar nota ao contato
    await axios.put(
      `${this.baseUrl}/crm/v3/objects/notes/${noteData}/associations/contact/${contactId}/note_to_contact`,
      {},
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );
  }

  /**
   * Sincronizar chamada completa como Engagement
   */
  async syncCall(call: any, options: any, credentials?: any) {
    const apiKey = this.getApiKey(credentials);

    const engagementData = {
      properties: {
        hs_timestamp: new Date(call.startedAt).toISOString(),
        hs_call_title: `AI Call - ${call.agent.name}`,
        hs_call_body: `
Duration: ${call.duration}s
Sentiment: ${call.callAnalysis?.sentiment || 'N/A'}
Success: ${call.callAnalysis?.successful ? 'Yes' : 'No'}

Summary: ${call.callAnalysis?.summary || 'N/A'}

${options.syncTranscript ? `Transcript:\n${call.transcript}` : ''}
        `.trim(),
        hs_call_from_number: call.fromNumber,
        hs_call_to_number: call.toNumber,
        hs_call_duration: call.duration * 1000, // em ms
        hs_call_status: 'COMPLETED',
        hs_call_recording_url: call.recordingUrl,
        // Custom property
        call_id: call.id,
      },
    };

    const response = await axios.post(
      `${this.baseUrl}/crm/v3/objects/calls`,
      engagementData,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    this.logger.log(`Call engagement created in HubSpot: ${response.data.id}`);

    return {
      id: response.data.id,
      success: true,
      engagementData: response.data.properties,
    };
  }

  /**
   * Testar conexão
   */
  async testConnection(credentials?: any) {
    try {
      const apiKey = this.getApiKey(credentials);

      const response = await axios.get(
        `${this.baseUrl}/crm/v3/objects/contacts?limit=1`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );

      return {
        connected: true,
        recordCount: response.data.total,
      };
    } catch (error) {
      this.logger.error('HubSpot connection test failed:', error);
      throw error;
    }
  }
}

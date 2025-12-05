/**
 * FASE 4.2.1: SALESFORCE SERVICE
 * Auto-Model Router: GPT-5.1 Codex (Backend/TypeScript/Service)
 * 
 * Implementação específica para Salesforce CRM
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type { CreateLeadDto, CreateTicketDto } from './crm.service';

@Injectable()
export class SalesforceService {
  private readonly logger = new Logger(SalesforceService.name);
  private accessToken: string | null = null;
  private instanceUrl: string | null = null;

  constructor(private configService: ConfigService) {}

  /**
   * Autenticar no Salesforce (OAuth 2.0)
   */
  private async authenticate(credentials?: any) {
    const clientId = credentials?.clientId || this.configService.get('SALESFORCE_CLIENT_ID');
    const clientSecret = credentials?.clientSecret || this.configService.get('SALESFORCE_CLIENT_SECRET');
    const username = credentials?.username || this.configService.get('SALESFORCE_USERNAME');
    const password = credentials?.password || this.configService.get('SALESFORCE_PASSWORD');
    const securityToken = credentials?.securityToken || this.configService.get('SALESFORCE_SECURITY_TOKEN');

    const response = await axios.post(
      'https://login.salesforce.com/services/oauth2/token',
      new URLSearchParams({
        grant_type: 'password',
        client_id: clientId,
        client_secret: clientSecret,
        username: username,
        password: password + securityToken,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    this.accessToken = response.data.access_token;
    this.instanceUrl = response.data.instance_url;

    this.logger.log('Salesforce authentication successful');
    return response.data;
  }

  /**
   * Criar Lead no Salesforce
   */
  async createLead(dto: CreateLeadDto) {
    if (!this.accessToken) {
      await this.authenticate();
    }

    const leadData = {
      FirstName: dto.firstName,
      LastName: dto.lastName,
      Email: dto.email,
      Phone: dto.phone,
      Company: dto.company || 'Unknown',
      LeadSource: dto.source || 'AI Phone Call',
      Description: dto.notes,
      // Custom field para vincular com a chamada
      Call_ID__c: dto.callId,
    };

    const response = await axios.post(
      `${this.instanceUrl}/services/data/v57.0/sobjects/Lead`,
      leadData,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    this.logger.log(`Lead created in Salesforce: ${response.data.id}`);

    return {
      id: response.data.id,
      success: response.data.success,
      leadData,
    };
  }

  /**
   * Criar Case (ticket) no Salesforce
   */
  async createTicket(dto: CreateTicketDto) {
    if (!this.accessToken) {
      await this.authenticate();
    }

    const caseData = {
      Subject: dto.subject,
      Description: dto.description,
      Priority: dto.priority || 'Medium',
      Status: dto.status || 'New',
      Origin: 'AI Phone Call',
      SuppliedEmail: dto.customerEmail,
      SuppliedPhone: dto.customerPhone,
      Call_ID__c: dto.callId,
    };

    const response = await axios.post(
      `${this.instanceUrl}/services/data/v57.0/sobjects/Case`,
      caseData,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    this.logger.log(`Case created in Salesforce: ${response.data.id}`);

    return {
      id: response.data.id,
      success: response.data.success,
      caseData,
    };
  }

  /**
   * Sincronizar chamada completa
   */
  async syncCall(call: any, options: any) {
    if (!this.accessToken) {
      await this.authenticate();
    }

    // Criar Task no Salesforce para registrar a chamada
    const taskData = {
      Subject: `AI Call with ${call.fromNumber}`,
      ActivityDate: new Date(call.startedAt).toISOString().split('T')[0],
      Status: 'Completed',
      Priority: 'Normal',
      Description: `
Call Duration: ${call.duration}s
Agent: ${call.agent.name}
Sentiment: ${call.callAnalysis?.sentiment || 'N/A'}
Success: ${call.callAnalysis?.successful ? 'Yes' : 'No'}

Summary: ${call.callAnalysis?.summary || 'N/A'}

${options.syncTranscript ? `Transcript:\n${call.transcript}` : ''}
      `.trim(),
      Call_ID__c: call.id,
      Recording_URL__c: call.recordingUrl,
    };

    const response = await axios.post(
      `${this.instanceUrl}/services/data/v57.0/sobjects/Task`,
      taskData,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    this.logger.log(`Task created in Salesforce: ${response.data.id}`);

    return {
      id: response.data.id,
      success: response.data.success,
      taskData,
    };
  }

  /**
   * Testar conexão
   */
  async testConnection(credentials?: any) {
    try {
      await this.authenticate(credentials);

      // Fazer uma query simples para validar
      const response = await axios.get(
        `${this.instanceUrl}/services/data/v57.0/query?q=SELECT+Id+FROM+Account+LIMIT+1`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      return {
        connected: true,
        instanceUrl: this.instanceUrl,
        recordCount: response.data.totalSize,
      };
    } catch (error) {
      this.logger.error('Salesforce connection test failed:', error);
      throw error;
    }
  }
}

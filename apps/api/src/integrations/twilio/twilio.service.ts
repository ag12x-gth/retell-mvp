/**
 * FASE 4.1: TWILIO SERVICE
 * Auto-Model Router: GPT-5.1 Codex (Backend/TypeScript/Service)
 * 
 * Serviço completo de integração com Twilio API para:
 * - Buscar números disponíveis
 * - Comprar números
 * - Configurar números com webhooks Retell AI
 * - Enviar SMS
 * - Verificar Caller ID
 * - Listar números da organização
 */

import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/database/prisma.service';
import { Twilio } from 'twilio';
import type { PhoneNumberInstance } from 'twilio/lib/rest/api/v2010/account/incomingPhoneNumber';

export interface SearchNumbersDto {
  areaCode?: string;
  country?: string; // ISO 3166-1 alpha-2 (US, BR, GB, etc.)
  contains?: string;
  smsEnabled?: boolean;
  voiceEnabled?: boolean;
  limit?: number;
}

export interface PurchaseNumberDto {
  phoneNumber: string;
  agentId?: string;
  friendlyName?: string;
}

export interface SendSmsDto {
  to: string;
  from: string;
  body: string;
}

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private twilioClient: Twilio;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      this.logger.warn('Twilio credentials not configured');
    } else {
      this.twilioClient = new Twilio(accountSid, authToken);
      this.logger.log('Twilio client initialized');
    }
  }

  /**
   * Buscar números disponíveis para compra
   */
  async searchAvailableNumbers(dto: SearchNumbersDto) {
    if (!this.twilioClient) {
      throw new BadRequestException('Twilio not configured');
    }

    const {
      country = 'US',
      areaCode,
      contains,
      smsEnabled = true,
      voiceEnabled = true,
      limit = 20,
    } = dto;

    try {
      this.logger.log(`Searching available numbers in ${country}`);

      const numbers = await this.twilioClient
        .availablePhoneNumbers(country)
        .local.list({
          areaCode,
          contains,
          smsEnabled,
          voiceEnabled,
          limit,
        });

      return {
        country,
        total: numbers.length,
        numbers: numbers.map((num) => ({
          phoneNumber: num.phoneNumber,
          friendlyName: num.friendlyName,
          locality: num.locality,
          region: num.region,
          postalCode: num.postalCode,
          isoCountry: num.isoCountry,
          capabilities: num.capabilities,
        })),
      };
    } catch (error) {
      this.logger.error('Error searching numbers:', error);
      throw new BadRequestException(`Failed to search numbers: ${error.message}`);
    }
  }

  /**
   * Comprar número e configurar com Retell AI
   */
  async purchaseNumber(dto: PurchaseNumberDto, organizationId: string) {
    if (!this.twilioClient) {
      throw new BadRequestException('Twilio not configured');
    }

    const { phoneNumber, agentId, friendlyName } = dto;

    try {
      this.logger.log(`Purchasing number ${phoneNumber} for org ${organizationId}`);

      // URL do webhook Retell AI para chamadas de entrada
      const retellWebhookUrl = this.configService.get<string>('RETELL_WEBHOOK_URL');
      const voiceUrl = `${retellWebhookUrl}/twilio/voice`;
      const statusCallbackUrl = `${retellWebhookUrl}/twilio/status`;

      // Comprar número no Twilio
      const purchasedNumber = await this.twilioClient.incomingPhoneNumbers.create({
        phoneNumber,
        friendlyName: friendlyName || `Retell AI - ${phoneNumber}`,
        voiceUrl,
        voiceMethod: 'POST',
        statusCallback: statusCallbackUrl,
        statusCallbackMethod: 'POST',
        smsUrl: `${retellWebhookUrl}/twilio/sms`,
        smsMethod: 'POST',
      });

      this.logger.log(`Number purchased: ${purchasedNumber.sid}`);

      // Salvar no banco de dados
      const phoneNumberRecord = await this.prisma.phoneNumber.create({
        data: {
          organizationId,
          number: phoneNumber,
          provider: 'twilio',
          providerId: purchasedNumber.sid,
          agentId: agentId || null,
          capabilities: purchasedNumber.capabilities as any,
          country: purchasedNumber.isoCountry,
          friendlyName: purchasedNumber.friendlyName,
          metadata: {
            voiceUrl,
            statusCallbackUrl,
          },
        },
      });

      return {
        id: phoneNumberRecord.id,
        phoneNumber: phoneNumberRecord.number,
        twilioSid: purchasedNumber.sid,
        friendlyName: purchasedNumber.friendlyName,
        agentId: phoneNumberRecord.agentId,
      };
    } catch (error) {
      this.logger.error('Error purchasing number:', error);
      throw new BadRequestException(`Failed to purchase number: ${error.message}`);
    }
  }

  /**
   * Atualizar configuração do número (ex: mudar agente)
   */
  async updateNumber(
    phoneNumberId: string,
    organizationId: string,
    updates: { agentId?: string; friendlyName?: string },
  ) {
    const phoneNumber = await this.prisma.phoneNumber.findFirst({
      where: {
        id: phoneNumberId,
        organizationId,
      },
    });

    if (!phoneNumber) {
      throw new NotFoundException('Phone number not found');
    }

    if (!this.twilioClient) {
      throw new BadRequestException('Twilio not configured');
    }

    try {
      // Atualizar no Twilio se houver mudança de friendlyName
      if (updates.friendlyName) {
        await this.twilioClient
          .incomingPhoneNumbers(phoneNumber.providerId)
          .update({
            friendlyName: updates.friendlyName,
          });
      }

      // Atualizar no banco
      const updated = await this.prisma.phoneNumber.update({
        where: { id: phoneNumberId },
        data: {
          agentId: updates.agentId,
          friendlyName: updates.friendlyName,
          updatedAt: new Date(),
        },
      });

      return updated;
    } catch (error) {
      this.logger.error('Error updating number:', error);
      throw new BadRequestException(`Failed to update number: ${error.message}`);
    }
  }

  /**
   * Enviar SMS
   */
  async sendSms(dto: SendSmsDto) {
    if (!this.twilioClient) {
      throw new BadRequestException('Twilio not configured');
    }

    try {
      const message = await this.twilioClient.messages.create({
        to: dto.to,
        from: dto.from,
        body: dto.body,
      });

      this.logger.log(`SMS sent: ${message.sid}`);

      return {
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
        body: message.body,
      };
    } catch (error) {
      this.logger.error('Error sending SMS:', error);
      throw new BadRequestException(`Failed to send SMS: ${error.message}`);
    }
  }

  /**
   * Listar números da organização
   */
  async listOrganizationNumbers(organizationId: string) {
    const numbers = await this.prisma.phoneNumber.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return numbers;
  }

  /**
   * Deletar número (release no Twilio)
   */
  async deleteNumber(phoneNumberId: string, organizationId: string) {
    const phoneNumber = await this.prisma.phoneNumber.findFirst({
      where: {
        id: phoneNumberId,
        organizationId,
      },
    });

    if (!phoneNumber) {
      throw new NotFoundException('Phone number not found');
    }

    if (!this.twilioClient) {
      throw new BadRequestException('Twilio not configured');
    }

    try {
      // Liberar número no Twilio
      await this.twilioClient
        .incomingPhoneNumbers(phoneNumber.providerId)
        .remove();

      this.logger.log(`Number released from Twilio: ${phoneNumber.providerId}`);

      // Soft delete no banco
      await this.prisma.phoneNumber.update({
        where: { id: phoneNumberId },
        data: {
          deletedAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Error deleting number:', error);
      throw new BadRequestException(`Failed to delete number: ${error.message}`);
    }
  }

  /**
   * Verificar Caller ID (necessário para chamadas outbound)
   */
  async verifyCallerId(phoneNumber: string, organizationId: string) {
    if (!this.twilioClient) {
      throw new BadRequestException('Twilio not configured');
    }

    try {
      const validation = await this.twilioClient.validationRequests.create({
        phoneNumber,
        friendlyName: `Caller ID for ${organizationId}`,
      });

      this.logger.log(`Caller ID verification initiated: ${validation.validationCode}`);

      return {
        validationCode: validation.validationCode,
        phoneNumber: validation.phoneNumber,
        status: 'pending',
      };
    } catch (error) {
      this.logger.error('Error verifying Caller ID:', error);
      throw new BadRequestException(`Failed to verify Caller ID: ${error.message}`);
    }
  }

  /**
   * Obter estatísticas de uso do Twilio
   */
  async getUsageStats(organizationId: string) {
    const numbers = await this.prisma.phoneNumber.count({
      where: {
        organizationId,
        deletedAt: null,
      },
    });

    const calls = await this.prisma.call.count({
      where: {
        agent: {
          organizationId,
        },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    return {
      activeNumbers: numbers,
      callsLast30Days: calls,
    };
  }
}

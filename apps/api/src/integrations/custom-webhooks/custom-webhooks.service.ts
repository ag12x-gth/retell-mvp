/**
 * FASE 4.4: CUSTOM WEBHOOKS SERVICE
 * Auto-Model Router: GPT-5.1 Codex (Backend/TypeScript/Service)
 * 
 * Serviço para gerenciar webhooks customizados e disparar
 * eventos para URLs externas configuradas pelo usuário
 */

import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '@/database/prisma.service';
import axios from 'axios';
import * as crypto from 'crypto';

export interface CreateWebhookDto {
  name: string;
  url: string;
  events: string[]; // ['call.started', 'call.ended', 'call.analyzed']
  method?: 'POST' | 'GET';
  headers?: Record<string, string>;
  secret?: string; // Para HMAC signature
  enabled?: boolean;
}

export interface WebhookEvent {
  event: string;
  timestamp: string;
  data: any;
}

@Injectable()
export class CustomWebhooksService {
  private readonly logger = new Logger(CustomWebhooksService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('webhooks') private webhookQueue: Queue,
  ) {}

  /**
   * Criar webhook customizado
   */
  async createWebhook(dto: CreateWebhookDto, organizationId: string) {
    // Validar URL
    try {
      new URL(dto.url);
    } catch {
      throw new BadRequestException('Invalid webhook URL');
    }

    const webhook = await this.prisma.customWebhook.create({
      data: {
        organizationId,
        name: dto.name,
        url: dto.url,
        events: dto.events,
        method: dto.method || 'POST',
        headers: dto.headers || {},
        secret: dto.secret,
        enabled: dto.enabled !== false,
      },
    });

    this.logger.log(`Webhook created: ${webhook.id} for org ${organizationId}`);

    return webhook;
  }

  /**
   * Listar webhooks da organização
   */
  async listWebhooks(organizationId: string) {
    return this.prisma.customWebhook.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Atualizar webhook
   */
  async updateWebhook(
    webhookId: string,
    organizationId: string,
    updates: Partial<CreateWebhookDto>,
  ) {
    const webhook = await this.prisma.customWebhook.findFirst({
      where: {
        id: webhookId,
        organizationId,
      },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return this.prisma.customWebhook.update({
      where: { id: webhookId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Deletar webhook
   */
  async deleteWebhook(webhookId: string, organizationId: string) {
    const webhook = await this.prisma.customWebhook.findFirst({
      where: {
        id: webhookId,
        organizationId,
      },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    await this.prisma.customWebhook.update({
      where: { id: webhookId },
      data: {
        deletedAt: new Date(),
      },
    });

    return { success: true };
  }

  /**
   * Disparar webhook para um evento
   */
  async triggerWebhook(event: string, data: any, organizationId: string) {
    // Buscar webhooks ativos que escutam este evento
    const webhooks = await this.prisma.customWebhook.findMany({
      where: {
        organizationId,
        enabled: true,
        deletedAt: null,
        events: {
          has: event,
        },
      },
    });

    if (webhooks.length === 0) {
      this.logger.debug(`No active webhooks for event ${event}`);
      return;
    }

    this.logger.log(`Triggering ${webhooks.length} webhooks for event ${event}`);

    // Adicionar jobs na fila para processar de forma assíncrona
    for (const webhook of webhooks) {
      await this.webhookQueue.add(
        'send',
        {
          webhookId: webhook.id,
          event,
          data,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      );
    }
  }

  /**
   * Enviar webhook HTTP request
   */
  async sendWebhookRequest(webhookId: string, event: string, data: any) {
    const webhook = await this.prisma.customWebhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || !webhook.enabled) {
      this.logger.warn(`Webhook ${webhookId} not found or disabled`);
      return;
    }

    const payload: WebhookEvent = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    try {
      const startTime = Date.now();

      // Gerar assinatura HMAC se tiver secret
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'Retell-AI-Webhook/1.0',
        ...webhook.headers,
      };

      if (webhook.secret) {
        const signature = this.generateHmacSignature(payload, webhook.secret);
        headers['X-Webhook-Signature'] = signature;
      }

      // Enviar request
      const response = await axios({
        method: webhook.method,
        url: webhook.url,
        data: webhook.method === 'POST' ? payload : undefined,
        params: webhook.method === 'GET' ? payload : undefined,
        headers,
        timeout: 10000, // 10s timeout
      });

      const duration = Date.now() - startTime;

      // Registrar delivery bem-sucedido
      await this.prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          event,
          payload,
          responseStatus: response.status,
          responseBody: response.data,
          duration,
          success: true,
        },
      });

      // Atualizar estatísticas do webhook
      await this.prisma.customWebhook.update({
        where: { id: webhookId },
        data: {
          lastTriggeredAt: new Date(),
          totalDeliveries: {
            increment: 1,
          },
          successfulDeliveries: {
            increment: 1,
          },
        },
      });

      this.logger.log(
        `Webhook ${webhookId} delivered successfully (${duration}ms, status ${response.status})`,
      );
    } catch (error) {
      const errorMessage = error.response?.data || error.message;
      const errorStatus = error.response?.status;

      this.logger.error(`Webhook ${webhookId} delivery failed:`, errorMessage);

      // Registrar falha
      await this.prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          event,
          payload,
          responseStatus: errorStatus,
          responseBody: errorMessage,
          success: false,
          errorMessage: error.message,
        },
      });

      // Atualizar estatísticas
      await this.prisma.customWebhook.update({
        where: { id: webhookId },
        data: {
          lastTriggeredAt: new Date(),
          totalDeliveries: {
            increment: 1,
          },
          failedDeliveries: {
            increment: 1,
          },
        },
      });

      // Se muitas falhas consecutivas, desabilitar webhook
      const recentDeliveries = await this.prisma.webhookDelivery.findMany({
        where: {
          webhookId: webhook.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });

      const consecutiveFailures = recentDeliveries.filter((d) => !d.success).length;

      if (consecutiveFailures >= 10) {
        await this.prisma.customWebhook.update({
          where: { id: webhookId },
          data: {
            enabled: false,
            disabledReason: 'Too many consecutive failures',
          },
        });

        this.logger.warn(`Webhook ${webhookId} disabled due to consecutive failures`);
      }

      throw error;
    }
  }

  /**
   * Gerar assinatura HMAC para validação
   */
  private generateHmacSignature(payload: any, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  /**
   * Verificar assinatura HMAC
   */
  verifyHmacSignature(payload: any, signature: string, secret: string): boolean {
    const expectedSignature = this.generateHmacSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Testar webhook (enviar payload de teste)
   */
  async testWebhook(webhookId: string, organizationId: string) {
    const webhook = await this.prisma.customWebhook.findFirst({
      where: {
        id: webhookId,
        organizationId,
      },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    const testPayload = {
      test: true,
      message: 'This is a test webhook from Retell AI',
      timestamp: new Date().toISOString(),
    };

    try {
      await this.sendWebhookRequest(webhookId, 'webhook.test', testPayload);
      return { success: true, message: 'Test webhook sent successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Listar deliveries de um webhook
   */
  async listDeliveries(webhookId: string, organizationId: string, limit = 50) {
    // Verificar se o webhook pertence à organização
    const webhook = await this.prisma.customWebhook.findFirst({
      where: {
        id: webhookId,
        organizationId,
      },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return this.prisma.webhookDelivery.findMany({
      where: {
        webhookId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Retentar delivery falhado
   */
  async retryDelivery(deliveryId: string, organizationId: string) {
    const delivery = await this.prisma.webhookDelivery.findUnique({
      where: { id: deliveryId },
      include: {
        webhook: true,
      },
    });

    if (!delivery || delivery.webhook.organizationId !== organizationId) {
      throw new NotFoundException('Delivery not found');
    }

    if (delivery.success) {
      throw new BadRequestException('Delivery was already successful');
    }

    // Re-enviar webhook
    await this.webhookQueue.add('send', {
      webhookId: delivery.webhookId,
      event: delivery.event,
      data: delivery.payload.data,
    });

    return { success: true, message: 'Delivery retry queued' };
  }
}

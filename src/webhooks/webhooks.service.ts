import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Processar eventos de chamadas da Retell.ai
   */
  async handleRetellCallEvent(payload: any, signature: string) {
    this.logger.log('Recebido evento Retell.ai:', payload.event);

    // Verificar assinatura (segurança)
    // const isValid = this.verifyRetellSignature(payload, signature);
    // if (!isValid) throw new UnauthorizedException('Assinatura inválida');

    const { event, call } = payload;

    try {
      switch (event) {
        case 'call_started':
          await this.handleCallStarted(call);
          break;

        case 'call_ended':
          await this.handleCallEnded(call);
          break;

        case 'call_analyzed':
          await this.handleCallAnalyzed(call);
          break;

        default:
          this.logger.warn(`Evento desconhecido: ${event}`);
      }

      return { success: true, message: 'Evento processado' };
    } catch (error) {
      this.logger.error(`Erro ao processar evento: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Processar status de chamadas do Twilio
   */
  async handleTwilioCallStatus(payload: any) {
    this.logger.log('Recebido status Twilio:', payload.CallStatus);

    const { CallSid, CallStatus, From, To, Duration } = payload;

    try {
      // Atualizar chamada no banco
      await this.prisma.call.updateMany({
        where: {
          retellCallId: CallSid,
        },
        data: {
          status: this.mapTwilioStatus(CallStatus),
          duration: Duration ? parseInt(Duration) : null,
          endedAt: CallStatus === 'completed' ? new Date() : null,
        },
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Erro ao processar status Twilio: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Processar chamadas recebidas do Twilio
   */
  async handleTwilioIncomingCall(payload: any) {
    this.logger.log('Chamada recebida do Twilio:', payload.From);

    const { CallSid, From, To } = payload;

    try {
      // Criar registro de chamada
      const organizationId = 'demo-org-id'; // TODO: Identificar organização pelo número

      // Buscar agente default da organização
      const agent = await this.prisma.agent.findFirst({
        where: {
          organizationId,
          type: 'inbound',
          status: 'active',
        },
        orderBy: { createdAt: 'asc' },
      });

      if (agent) {
        await this.prisma.call.create({
          data: {
            agentId: agent.id,
            organizationId,
            retellCallId: CallSid,
            direction: 'inbound',
            fromNumber: From,
            toNumber: To,
            status: 'initiated',
          },
        });
      }

      // Retornar TwiML para conectar à Retell.ai
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Conectando você com nosso assistente.</Say>
  <Dial>
    <Stream url="wss://api.retellai.com/v1/stream/${agent?.retellAgentId || 'default'}" />
  </Dial>
</Response>`;

      return twiml;
    } catch (error) {
      this.logger.error(
        `Erro ao processar chamada recebida: ${error.message}`,
      );
      return '<Response><Say>Desculpe, ocorreu um erro.</Say></Response>';
    }
  }

  /**
   * Processar webhooks customizados
   */
  async handleCustomWebhook(
    organizationId: string,
    payload: any,
    headers: any,
  ) {
    this.logger.log(`Webhook customizado para org: ${organizationId}`);

    // Aqui você pode implementar lógica customizada
    // baseada no organizationId

    return {
      success: true,
      message: 'Webhook customizado recebido',
      organizationId,
      receivedAt: new Date().toISOString(),
    };
  }

  // Métodos auxiliares

  private async handleCallStarted(call: any) {
    this.logger.log(`Chamada iniciada: ${call.call_id}`);

    // Atualizar ou criar chamada no banco
    await this.prisma.call.upsert({
      where: { retellCallId: call.call_id },
      update: {
        status: 'ongoing',
        startedAt: new Date(call.start_timestamp),
      },
      create: {
        retellCallId: call.call_id,
        agentId: call.agent_id || 'default-agent-id',
        organizationId: 'demo-org-id',
        direction: call.direction || 'inbound',
        fromNumber: call.from_number,
        toNumber: call.to_number,
        status: 'ongoing',
        startedAt: new Date(call.start_timestamp),
      },
    });
  }

  private async handleCallEnded(call: any) {
    this.logger.log(`Chamada finalizada: ${call.call_id}`);

    await this.prisma.call.update({
      where: { retellCallId: call.call_id },
      data: {
        status: 'ended',
        endedAt: new Date(call.end_timestamp),
        duration: call.call_duration,
        transcript: call.transcript ? JSON.stringify(call.transcript) : null,
        recordingUrl: call.recording_url,
        disconnectReason: call.disconnect_reason,
      },
    });
  }

  private async handleCallAnalyzed(call: any) {
    this.logger.log(`Chamada analisada: ${call.call_id}`);

    await this.prisma.call.update({
      where: { retellCallId: call.call_id },
      data: {
        qualityScore: call.call_analysis?.quality_score,
        sentimentScore: call.call_analysis?.sentiment_score,
        latencyMs: call.call_analysis?.latency_ms,
        interruptionsCount: call.call_analysis?.interruptions_count,
        cost: call.cost,
      },
    });
  }

  private mapTwilioStatus(status: string): string {
    const statusMap = {
      queued: 'initiated',
      ringing: 'ongoing',
      'in-progress': 'ongoing',
      completed: 'ended',
      busy: 'failed',
      failed: 'failed',
      'no-answer': 'failed',
      canceled: 'failed',
    };

    return statusMap[status] || 'initiated';
  }

  private verifyRetellSignature(payload: any, signature: string): boolean {
    // Implementar verificação de assinatura HMAC
    // const secret = this.config.get('RETELL_WEBHOOK_SECRET');
    // const hash = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    // return hash === signature;
    return true; // Simulado por enquanto
  }
}

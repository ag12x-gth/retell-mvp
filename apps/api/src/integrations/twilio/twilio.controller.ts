/**
 * FASE 4.1: TWILIO CONTROLLER
 * Auto-Model Router: GPT-5.1 Codex (Backend/NestJS/Controller)
 * 
 * Controller para endpoints de integração Twilio
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TwilioService, SearchNumbersDto, PurchaseNumberDto, SendSmsDto } from './twilio.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';

@Controller('integrations/twilio')
@UseGuards(JwtAuthGuard)
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) {}

  /**
   * GET /integrations/twilio/search
   * Buscar números disponíveis
   */
  @Get('search')
  async searchNumbers(@Query() dto: SearchNumbersDto) {
    return this.twilioService.searchAvailableNumbers(dto);
  }

  /**
   * POST /integrations/twilio/purchase
   * Comprar número
   */
  @Post('purchase')
  async purchaseNumber(
    @Body() dto: PurchaseNumberDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.twilioService.purchaseNumber(dto, organizationId);
  }

  /**
   * GET /integrations/twilio/numbers
   * Listar números da organização
   */
  @Get('numbers')
  async listNumbers(@CurrentUser('organizationId') organizationId: string) {
    return this.twilioService.listOrganizationNumbers(organizationId);
  }

  /**
   * PATCH /integrations/twilio/numbers/:id
   * Atualizar configuração do número
   */
  @Patch('numbers/:id')
  async updateNumber(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
    @Body() updates: { agentId?: string; friendlyName?: string },
  ) {
    return this.twilioService.updateNumber(id, organizationId, updates);
  }

  /**
   * DELETE /integrations/twilio/numbers/:id
   * Deletar número
   */
  @Delete('numbers/:id')
  async deleteNumber(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.twilioService.deleteNumber(id, organizationId);
  }

  /**
   * POST /integrations/twilio/sms
   * Enviar SMS
   */
  @Post('sms')
  async sendSms(@Body() dto: SendSmsDto) {
    return this.twilioService.sendSms(dto);
  }

  /**
   * POST /integrations/twilio/verify-caller-id
   * Verificar Caller ID
   */
  @Post('verify-caller-id')
  async verifyCallerId(
    @Body('phoneNumber') phoneNumber: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.twilioService.verifyCallerId(phoneNumber, organizationId);
  }

  /**
   * GET /integrations/twilio/usage
   * Estatísticas de uso
   */
  @Get('usage')
  async getUsage(@CurrentUser('organizationId') organizationId: string) {
    return this.twilioService.getUsageStats(organizationId);
  }
}

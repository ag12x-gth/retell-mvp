import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('retell/call-events')
  @HttpCode(200)
  @ApiOperation({ summary: 'Receber eventos de chamadas da Retell.ai' })
  @ApiResponse({ status: 200, description: 'Evento processado' })
  async handleRetellCallEvent(
    @Body() payload: any,
    @Headers('x-retell-signature') signature: string,
  ) {
    return this.webhooksService.handleRetellCallEvent(payload, signature);
  }

  @Post('twilio/call-status')
  @HttpCode(200)
  @ApiOperation({ summary: 'Receber status de chamadas do Twilio' })
  @ApiResponse({ status: 200, description: 'Status processado' })
  async handleTwilioCallStatus(@Body() payload: any) {
    return this.webhooksService.handleTwilioCallStatus(payload);
  }

  @Post('twilio/incoming-call')
  @HttpCode(200)
  @ApiExcludeEndpoint() // Não mostrar no Swagger (endpoint interno)
  async handleTwilioIncomingCall(@Body() payload: any) {
    return this.webhooksService.handleTwilioIncomingCall(payload);
  }

  @Post('custom/:organizationId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Webhook customizado por organização' })
  @ApiResponse({ status: 200, description: 'Webhook recebido' })
  async handleCustomWebhook(
    @Param('organizationId') organizationId: string,
    @Body() payload: any,
    @Headers() headers: any,
  ) {
    return this.webhooksService.handleCustomWebhook(
      organizationId,
      payload,
      headers,
    );
  }
}

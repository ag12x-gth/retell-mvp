import { Controller, Get, Post, Body, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { UpdateConfigDto } from './dto/update-config.dto';

@ApiTags('config')
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Obter configurações atuais (sem exibir secrets)' })
  @ApiResponse({ status: 200, description: 'Configurações atuais' })
  getConfig() {
    return this.configService.getConfig();
  }

  @Get('status')
  @ApiOperation({ summary: 'Verificar status das integrações' })
  @ApiResponse({ status: 200, description: 'Status de cada integração' })
  async getStatus() {
    return this.configService.getIntegrationsStatus();
  }

  @Patch('retell')
  @ApiOperation({ summary: 'Atualizar credenciais Retell.ai' })
  @ApiResponse({ status: 200, description: 'Credenciais atualizadas' })
  async updateRetellConfig(@Body() dto: { apiKey: string }) {
    return this.configService.updateRetellConfig(dto.apiKey);
  }

  @Patch('twilio')
  @ApiOperation({ summary: 'Atualizar credenciais Twilio' })
  @ApiResponse({ status: 200, description: 'Credenciais atualizadas' })
  async updateTwilioConfig(
    @Body() dto: { accountSid: string; authToken: string; phoneNumber: string },
  ) {
    return this.configService.updateTwilioConfig(dto);
  }

  @Patch('openai')
  @ApiOperation({ summary: 'Atualizar credenciais OpenAI' })
  @ApiResponse({ status: 200, description: 'Credenciais atualizadas' })
  async updateOpenAIConfig(@Body() dto: { apiKey: string }) {
    return this.configService.updateOpenAIConfig(dto.apiKey);
  }

  @Post('test-retell')
  @ApiOperation({ summary: 'Testar conexão com Retell.ai' })
  @ApiResponse({ status: 200, description: 'Teste realizado' })
  async testRetellConnection() {
    return this.configService.testRetellConnection();
  }

  @Post('test-twilio')
  @ApiOperation({ summary: 'Testar conexão com Twilio' })
  @ApiResponse({ status: 200, description: 'Teste realizado' })
  async testTwilioConnection() {
    return this.configService.testTwilioConnection();
  }

  @Post('test-openai')
  @ApiOperation({ summary: 'Testar conexão com OpenAI' })
  @ApiResponse({ status: 200, description: 'Teste realizado' })
  async testOpenAIConnection() {
    return this.configService.testOpenAIConnection();
  }
}

import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RetellService } from './retell.service';

@ApiTags('integrations/retell')
@Controller('integrations/retell')
export class RetellController {
  constructor(private readonly retellService: RetellService) {}

  @Post('agents')
  @ApiOperation({ summary: 'Criar agente na Retell.ai' })
  @ApiResponse({ status: 201, description: 'Agente criado' })
  async createAgent(
    @Body()
    dto: {
      name: string;
      voiceId: string;
      llmProvider: string;
      llmModel: string;
      systemPrompt: string;
      firstMessage?: string;
      temperature?: number;
      maxTokens?: number;
    },
  ) {
    return this.retellService.createAgent(dto);
  }

  @Get('agents')
  @ApiOperation({ summary: 'Listar agentes da Retell.ai' })
  @ApiResponse({ status: 200, description: 'Lista de agentes' })
  async listAgents() {
    return this.retellService.listAgents();
  }

  @Get('agents/:id')
  @ApiOperation({ summary: 'Buscar agente por ID na Retell.ai' })
  @ApiResponse({ status: 200, description: 'Detalhes do agente' })
  async getAgent(@Param('id') id: string) {
    return this.retellService.getAgent(id);
  }

  @Delete('agents/:id')
  @ApiOperation({ summary: 'Deletar agente da Retell.ai' })
  @ApiResponse({ status: 200, description: 'Agente deletado' })
  async deleteAgent(@Param('id') id: string) {
    return this.retellService.deleteAgent(id);
  }

  @Post('calls')
  @ApiOperation({ summary: 'Criar chamada telefônica via Retell.ai' })
  @ApiResponse({ status: 201, description: 'Chamada iniciada' })
  async createPhoneCall(
    @Body()
    dto: {
      agentId: string;
      toNumber: string;
      fromNumber?: string;
      retellLlmDynamicVariables?: any;
    },
  ) {
    return this.retellService.createPhoneCall(dto);
  }
}

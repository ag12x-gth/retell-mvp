import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { CreateAgentDto, UpdateAgentDto } from './dto';

@ApiTags('agents')
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo agente de IA' })
  @ApiResponse({ status: 201, description: 'Agente criado com sucesso' })
  create(@Body() createAgentDto: CreateAgentDto) {
    // TODO: Get organizationId from authenticated user
    const organizationId = 'demo-org-id';
    return this.agentsService.create(createAgentDto, organizationId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os agentes' })
  @ApiResponse({ status: 200, description: 'Lista de agentes' })
  findAll() {
    const organizationId = 'demo-org-id';
    return this.agentsService.findAll(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar agente por ID' })
  @ApiResponse({ status: 200, description: 'Detalhes do agente' })
  @ApiResponse({ status: 404, description: 'Agente não encontrado' })
  findOne(@Param('id') id: string) {
    const organizationId = 'demo-org-id';
    return this.agentsService.findOne(id, organizationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar agente' })
  @ApiResponse({ status: 200, description: 'Agente atualizado' })
  update(@Param('id') id: string, @Body() updateAgentDto: UpdateAgentDto) {
    const organizationId = 'demo-org-id';
    return this.agentsService.update(id, updateAgentDto, organizationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Arquivar agente' })
  @ApiResponse({ status: 204, description: 'Agente arquivado' })
  remove(@Param('id') id: string) {
    const organizationId = 'demo-org-id';
    return this.agentsService.remove(id, organizationId);
  }
}

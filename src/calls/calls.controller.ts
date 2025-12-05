import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CallsService } from './calls.service';

@ApiTags('calls')
@Controller('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as chamadas' })
  @ApiResponse({ status: 200, description: 'Lista de chamadas' })
  findAll() {
    const organizationId = 'demo-org-id';
    return this.callsService.findAll(organizationId);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Obter analytics de chamadas' })
  @ApiResponse({ status: 200, description: 'Métricas agregadas' })
  getAnalytics() {
    const organizationId = 'demo-org-id';
    return this.callsService.getAnalytics(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar chamada por ID' })
  @ApiResponse({ status: 200, description: 'Detalhes da chamada' })
  findOne(@Param('id') id: string) {
    const organizationId = 'demo-org-id';
    return this.callsService.findOne(id, organizationId);
  }
}

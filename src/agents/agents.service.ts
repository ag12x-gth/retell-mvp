import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentDto, UpdateAgentDto } from './dto';

@Injectable()
export class AgentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAgentDto, organizationId: string) {
    return this.prisma.agent.create({
      data: {
        ...dto,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.agent.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const agent = await this.prisma.agent.findFirst({
      where: { id, organizationId },
    });
    
    if (!agent) {
      throw new NotFoundException(`Agent #${id} not found`);
    }
    
    return agent;
  }

  async update(id: string, dto: UpdateAgentDto, organizationId: string) {
    await this.findOne(id, organizationId);
    
    return this.prisma.agent.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    
    return this.prisma.agent.update({
      where: { id },
      data: { status: 'archived' },
    });
  }
}

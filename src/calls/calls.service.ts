import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CallsService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.call.findMany({
      where: { organizationId },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: 100,
    });
  }

  async findOne(id: string, organizationId: string) {
    return this.prisma.call.findFirst({
      where: { id, organizationId },
      include: {
        agent: true,
      },
    });
  }

  async getAnalytics(organizationId: string) {
    const calls = await this.prisma.call.findMany({
      where: { organizationId },
    });

    const totalCalls = calls.length;
    const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0);
    const avgDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;
    const totalCost = calls.reduce((sum, call) => sum + (call.cost || 0), 0);

    return {
      totalCalls,
      totalDuration,
      avgDuration: Math.round(avgDuration),
      totalCost,
      callsByStatus: {
        ended: calls.filter(c => c.status === 'ended').length,
        ongoing: calls.filter(c => c.status === 'ongoing').length,
        failed: calls.filter(c => c.status === 'failed').length,
      },
    };
  }
}

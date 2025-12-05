/**
 * FASE 5.1: TESTES UNITÁRIOS - AGENTS SERVICE
 * Auto-Model Router: GPT-5.1 Codex (Testing/Jest/Unit)
 * 
 * Testes unitários para o serviço de agentes
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AgentsService } from './agents.service';
import { PrismaService } from '@/database/prisma.service';
import { RetellClient } from '@/retell/retell.client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AgentsService', () => {
  let service: AgentsService;
  let prisma: jest.Mocked<PrismaService>;
  let retellClient: jest.Mocked<RetellClient>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockOrganizationId = 'org-123';
  const mockUserId = 'user-123';
  const mockAgentId = 'agent-123';

  const mockAgent = {
    id: mockAgentId,
    organizationId: mockOrganizationId,
    name: 'Test Agent',
    type: 'customer_support',
    status: 'active',
    retellAgentId: 'retell-agent-123',
    voiceConfig: {
      voiceId: 'elevenlabs-sarah',
      language: 'pt-BR',
      speed: 1.0,
    },
    llmConfig: {
      model: 'gpt-4o',
      temperature: 0.7,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentsService,
        {
          provide: PrismaService,
          useValue: {
            agent: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            organization: {
              findUnique: jest.fn(),
            },
            auditLog: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: RetellClient,
          useValue: {
            createAgent: jest.fn(),
            getAgent: jest.fn(),
            updateAgent: jest.fn(),
            deleteAgent: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AgentsService>(AgentsService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
    retellClient = module.get(RetellClient) as jest.Mocked<RetellClient>;
    eventEmitter = module.get(EventEmitter2) as jest.Mocked<EventEmitter2>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAgent', () => {
    const createDto = {
      name: 'Test Agent',
      type: 'customer_support' as const,
      systemPrompt: 'You are a helpful assistant',
      greetingMessage: 'Hello!',
      voiceConfig: {
        voiceId: 'elevenlabs-sarah',
        language: 'pt-BR',
        speed: 1.0,
      },
      llmConfig: {
        model: 'gpt-4o',
        temperature: 0.7,
      },
    };

    it('should create agent successfully', async () => {
      // Mock organization with available quota
      prisma.organization.findUnique.mockResolvedValue({
        id: mockOrganizationId,
        maxAgents: 10,
      } as any);

      prisma.agent.count.mockResolvedValue(5);

      // Mock Retell AI response
      retellClient.createAgent.mockResolvedValue({
        agent_id: 'retell-agent-123',
        agent_name: createDto.name,
      });

      // Mock database creation
      prisma.agent.create.mockResolvedValue(mockAgent as any);

      const result = await service.createAgent(createDto, mockOrganizationId, mockUserId);

      expect(result).toEqual(mockAgent);
      expect(retellClient.createAgent).toHaveBeenCalled();
      expect(prisma.agent.create).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('agent.created', expect.any(Object));
    });

    it('should throw error if agent limit exceeded', async () => {
      prisma.organization.findUnique.mockResolvedValue({
        id: mockOrganizationId,
        maxAgents: 5,
      } as any);

      prisma.agent.count.mockResolvedValue(5);

      await expect(
        service.createAgent(createDto, mockOrganizationId, mockUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should rollback if Retell AI creation fails', async () => {
      prisma.organization.findUnique.mockResolvedValue({
        id: mockOrganizationId,
        maxAgents: 10,
      } as any);

      prisma.agent.count.mockResolvedValue(5);

      retellClient.createAgent.mockRejectedValue(new Error('Retell API error'));

      await expect(
        service.createAgent(createDto, mockOrganizationId, mockUserId),
      ).rejects.toThrow('Retell API error');

      expect(prisma.agent.create).not.toHaveBeenCalled();
    });
  });

  describe('getAgent', () => {
    it('should return agent if found', async () => {
      prisma.agent.findUnique.mockResolvedValue(mockAgent as any);

      const result = await service.getAgent(mockAgentId, mockOrganizationId);

      expect(result).toEqual(mockAgent);
      expect(prisma.agent.findUnique).toHaveBeenCalledWith({
        where: { id: mockAgentId },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if agent not found', async () => {
      prisma.agent.findUnique.mockResolvedValue(null);

      await expect(service.getAgent(mockAgentId, mockOrganizationId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if agent belongs to different organization', async () => {
      prisma.agent.findUnique.mockResolvedValue({
        ...mockAgent,
        organizationId: 'different-org',
      } as any);

      await expect(service.getAgent(mockAgentId, mockOrganizationId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateAgent', () => {
    const updateDto = {
      name: 'Updated Agent Name',
      status: 'paused' as const,
    };

    it('should update agent successfully', async () => {
      prisma.agent.findUnique.mockResolvedValue(mockAgent as any);
      retellClient.updateAgent.mockResolvedValue({ success: true });
      prisma.agent.update.mockResolvedValue({
        ...mockAgent,
        ...updateDto,
      } as any);

      const result = await service.updateAgent(
        mockAgentId,
        updateDto,
        mockOrganizationId,
        mockUserId,
      );

      expect(result.name).toBe(updateDto.name);
      expect(retellClient.updateAgent).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('agent.updated', expect.any(Object));
    });
  });

  describe('deleteAgent', () => {
    it('should soft delete agent', async () => {
      prisma.agent.findUnique.mockResolvedValue(mockAgent as any);
      retellClient.deleteAgent.mockResolvedValue({ success: true });
      prisma.agent.update.mockResolvedValue({
        ...mockAgent,
        status: 'archived',
        deletedAt: new Date(),
      } as any);

      await service.deleteAgent(mockAgentId, mockOrganizationId, mockUserId);

      expect(prisma.agent.update).toHaveBeenCalledWith({
        where: { id: mockAgentId },
        data: {
          status: 'archived',
          deletedAt: expect.any(Date),
        },
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('agent.deleted', expect.any(Object));
    });
  });

  describe('listAgents', () => {
    it('should return paginated list of agents', async () => {
      const mockAgents = [mockAgent, { ...mockAgent, id: 'agent-456' }];

      prisma.agent.findMany.mockResolvedValue(mockAgents as any);
      prisma.agent.count.mockResolvedValue(2);

      const result = await service.listAgents(mockOrganizationId, {
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(mockAgents);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter by type', async () => {
      prisma.agent.findMany.mockResolvedValue([mockAgent] as any);
      prisma.agent.count.mockResolvedValue(1);

      await service.listAgents(mockOrganizationId, {
        type: 'customer_support',
      });

      expect(prisma.agent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'customer_support',
          }),
        }),
      );
    });

    it('should filter by status', async () => {
      prisma.agent.findMany.mockResolvedValue([mockAgent] as any);
      prisma.agent.count.mockResolvedValue(1);

      await service.listAgents(mockOrganizationId, {
        status: 'active',
      });

      expect(prisma.agent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'active',
          }),
        }),
      );
    });
  });

  describe('getAgentStats', () => {
    it('should return agent statistics', async () => {
      prisma.agent.findUnique.mockResolvedValue(mockAgent as any);

      // Mock calls data
      const mockCalls = [
        {
          id: 'call-1',
          duration: 120,
          callAnalysis: { successful: true, sentiment: 'positive' },
          totalCost: 100,
        },
        {
          id: 'call-2',
          duration: 180,
          callAnalysis: { successful: true, sentiment: 'neutral' },
          totalCost: 150,
        },
      ];

      (prisma.agent.findUnique as jest.Mock).mockResolvedValue({
        ...mockAgent,
        calls: mockCalls,
      } as any);

      const result = await service.getAgentStats(mockAgentId, mockOrganizationId);

      expect(result.totalCalls).toBe(2);
      expect(result.successRate).toBe(100);
      expect(result.averageDuration).toBe(150);
      expect(result.totalCost).toBe(250);
    });
  });
});

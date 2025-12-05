/**
 * FASE 5.1: TESTES UNITÁRIOS - CALLS SERVICE
 * Auto-Model Router: GPT-5.1 Codex (Testing/Jest/Unit)
 * 
 * Testes unitários para o serviço de chamadas
 */

import { Test, TestingModule } from '@nestjs/testing';
import { CallsService } from './calls.service';
import { PrismaService } from '@/database/prisma.service';
import { RetellClient } from '@/retell/retell.client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';
import { BadRequestException } from '@nestjs/common';

describe('CallsService', () => {
  let service: CallsService;
  let prisma: jest.Mocked<PrismaService>;
  let retellClient: jest.Mocked<RetellClient>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let callsQueue: jest.Mocked<Queue>;

  const mockCall = {
    id: 'call-123',
    agentId: 'agent-123',
    fromNumber: '+5511999999999',
    toNumber: '+5511888888888',
    direction: 'outbound',
    status: 'in-progress',
    retellCallId: 'retell-call-123',
    startedAt: new Date(),
    endedAt: null,
    duration: 0,
    transcript: null,
    recordingUrl: null,
    callAnalysis: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CallsService,
        {
          provide: PrismaService,
          useValue: {
            call: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            agent: {
              findUnique: jest.fn(),
            },
            organization: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: RetellClient,
          useValue: {
            createPhoneCall: jest.fn(),
            registerWebCall: jest.fn(),
            getCall: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: getQueueToken('calls'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CallsService>(CallsService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
    retellClient = module.get(RetellClient) as jest.Mocked<RetellClient>;
    eventEmitter = module.get(EventEmitter2) as jest.Mocked<EventEmitter2>;
    callsQueue = module.get(getQueueToken('calls')) as jest.Mocked<Queue>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOutboundCall', () => {
    const createDto = {
      agentId: 'agent-123',
      fromNumber: '+5511999999999',
      toNumber: '+5511888888888',
      metadata: { campaign: 'test' },
    };

    it('should create outbound call successfully', async () => {
      // Mock agent
      prisma.agent.findUnique.mockResolvedValue({
        id: 'agent-123',
        organizationId: 'org-123',
        retellAgentId: 'retell-agent-123',
        status: 'active',
      } as any);

      // Mock organization (concurrency check)
      prisma.organization.findUnique.mockResolvedValue({
        id: 'org-123',
        maxConcurrentCalls: 20,
      } as any);

      prisma.call.count.mockResolvedValue(5); // 5 calls in progress

      // Mock Retell API
      retellClient.createPhoneCall.mockResolvedValue({
        call_id: 'retell-call-123',
        call_status: 'registered',
      });

      // Mock database creation
      prisma.call.create.mockResolvedValue(mockCall as any);

      const result = await service.createOutboundCall(createDto, 'org-123');

      expect(result).toEqual(mockCall);
      expect(retellClient.createPhoneCall).toHaveBeenCalledWith({
        agent_id: 'retell-agent-123',
        from_number: createDto.fromNumber,
        to_number: createDto.toNumber,
        metadata: createDto.metadata,
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('call.created', expect.any(Object));
    });

    it('should throw error if agent not found', async () => {
      prisma.agent.findUnique.mockResolvedValue(null);

      await expect(service.createOutboundCall(createDto, 'org-123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if agent is not active', async () => {
      prisma.agent.findUnique.mockResolvedValue({
        id: 'agent-123',
        status: 'paused',
      } as any);

      await expect(service.createOutboundCall(createDto, 'org-123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if concurrency limit exceeded', async () => {
      prisma.agent.findUnique.mockResolvedValue({
        id: 'agent-123',
        organizationId: 'org-123',
        status: 'active',
      } as any);

      prisma.organization.findUnique.mockResolvedValue({
        id: 'org-123',
        maxConcurrentCalls: 10,
      } as any);

      prisma.call.count.mockResolvedValue(10); // Limit reached

      await expect(service.createOutboundCall(createDto, 'org-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('handleCallUpdate', () => {
    const updateData = {
      call_id: 'retell-call-123',
      call_status: 'ended',
      end_timestamp: Date.now(),
      transcript: 'Hello, how can I help you?',
      recording_url: 'https://example.com/recording.wav',
      call_analysis: {
        summary: 'Customer inquiry about pricing',
        successful: true,
        sentiment: 'positive',
      },
      latency: {
        e2e: { p50: 800, p90: 1200, p95: 1500, p99: 2000 },
      },
      llm_usage: {
        prompt_tokens: 500,
        completion_tokens: 200,
        total_tokens: 700,
      },
      total_cost: 150,
    };

    it('should update call with complete data', async () => {
      prisma.call.findUnique.mockResolvedValue(mockCall as any);
      prisma.call.update.mockResolvedValue({
        ...mockCall,
        status: 'ended',
        endedAt: new Date(updateData.end_timestamp),
        transcript: updateData.transcript,
        recordingUrl: updateData.recording_url,
        callAnalysis: updateData.call_analysis,
      } as any);

      await service.handleCallUpdate(updateData);

      expect(prisma.call.update).toHaveBeenCalledWith({
        where: { retellCallId: 'retell-call-123' },
        data: expect.objectContaining({
          status: 'ended',
          transcript: updateData.transcript,
          recordingUrl: updateData.recording_url,
        }),
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'call.updated',
        expect.any(Object),
      );
    });

    it('should trigger post-processing on call end', async () => {
      prisma.call.findUnique.mockResolvedValue(mockCall as any);
      prisma.call.update.mockResolvedValue({
        ...mockCall,
        status: 'ended',
      } as any);

      await service.handleCallUpdate(updateData);

      expect(callsQueue.add).toHaveBeenCalledWith(
        'post-process',
        expect.objectContaining({
          callId: mockCall.id,
        }),
      );
    });
  });

  describe('getCallAnalytics', () => {
    it('should return call analytics', async () => {
      const mockCallWithAnalytics = {
        ...mockCall,
        status: 'ended',
        duration: 120,
        callAnalysis: {
          successful: true,
          sentiment: 'positive',
        },
        latency: {
          e2e: { p50: 800, p90: 1200, p95: 1500, p99: 2000 },
        },
        totalCost: 150,
      };

      prisma.call.findUnique.mockResolvedValue(mockCallWithAnalytics as any);

      const result = await service.getCallAnalytics('call-123', 'org-123');

      expect(result).toMatchObject({
        callId: 'call-123',
        duration: 120,
        successful: true,
        sentiment: 'positive',
        totalCost: 150,
      });
    });
  });

  describe('listCalls', () => {
    it('should return paginated calls', async () => {
      const mockCalls = [mockCall];

      prisma.call.findMany.mockResolvedValue(mockCalls as any);
      prisma.call.count.mockResolvedValue(1);

      const result = await service.listCalls('org-123', {
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(mockCalls);
      expect(result.total).toBe(1);
    });

    it('should filter by agent', async () => {
      prisma.call.findMany.mockResolvedValue([mockCall] as any);
      prisma.call.count.mockResolvedValue(1);

      await service.listCalls('org-123', {
        agentId: 'agent-123',
      });

      expect(prisma.call.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            agentId: 'agent-123',
          }),
        }),
      );
    });

    it('should filter by status', async () => {
      prisma.call.findMany.mockResolvedValue([mockCall] as any);
      prisma.call.count.mockResolvedValue(1);

      await service.listCalls('org-123', {
        status: 'ended',
      });

      expect(prisma.call.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ended',
          }),
        }),
      );
    });
  });

  describe('normalizePhoneNumber', () => {
    it('should normalize Brazilian phone number', () => {
      const normalized = service['normalizePhoneNumber']('(11) 99999-9999');
      expect(normalized).toBe('+5511999999999');
    });

    it('should keep already normalized number', () => {
      const normalized = service['normalizePhoneNumber']('+5511999999999');
      expect(normalized).toBe('+5511999999999');
    });

    it('should normalize US phone number', () => {
      const normalized = service['normalizePhoneNumber']('(415) 555-1234');
      expect(normalized).toBe('+14155551234');
    });
  });
});

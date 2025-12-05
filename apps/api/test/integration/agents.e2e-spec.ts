/**
 * FASE 5.2: TESTES DE INTEGRAÇÃO - AGENTS API
 * Auto-Model Router: GPT-5.1 Codex (Testing/E2E/Integration)
 * 
 * Testes end-to-end para endpoints de agentes
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/database/prisma.service';

describe('Agents API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let organizationId: string;
  let createdAgentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Setup: Criar organização e usuário de teste
    const org = await prisma.organization.create({
      data: {
        name: 'Test Org',
        domain: 'test.com',
        maxAgents: 10,
        maxConcurrentCalls: 20,
      },
    });
    organizationId = org.id;

    const user = await prisma.user.create({
      data: {
        email: 'test@test.com',
        name: 'Test User',
        organizationId: org.id,
        passwordHash: 'hash', // Mock
      },
    });

    // Mock JWT token (você pode usar um token real se tiver auth implementado)
    authToken = 'Bearer mock-jwt-token';
  });

  afterAll(async () => {
    // Cleanup
    await prisma.agent.deleteMany({ where: { organizationId } });
    await prisma.user.deleteMany({ where: { organizationId } });
    await prisma.organization.delete({ where: { id: organizationId } });
    
    await app.close();
  });

  describe('POST /api/agents', () => {
    it('should create a new agent', () => {
      return request(app.getHttpServer())
        .post('/api/agents')
        .set('Authorization', authToken)
        .send({
          name: 'Customer Support Agent',
          type: 'customer_support',
          systemPrompt: 'You are a helpful customer support agent.',
          greetingMessage: 'Hello! How can I help you today?',
          voiceConfig: {
            voiceId: 'elevenlabs-sarah',
            language: 'pt-BR',
            speed: 1.0,
          },
          llmConfig: {
            model: 'gpt-4o',
            temperature: 0.7,
          },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Customer Support Agent');
          expect(res.body.type).toBe('customer_support');
          expect(res.body.status).toBe('active');
          createdAgentId = res.body.id;
        });
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/api/agents')
        .set('Authorization', authToken)
        .send({
          name: '', // Nome vazio - inválido
          type: 'invalid_type',
        })
        .expect(400);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/agents')
        .send({
          name: 'Test Agent',
          type: 'customer_support',
        })
        .expect(401);
    });
  });

  describe('GET /api/agents', () => {
    it('should list all agents', () => {
      return request(app.getHttpServer())
        .get('/api/agents')
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter by type', () => {
      return request(app.getHttpServer())
        .get('/api/agents?type=customer_support')
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          res.body.data.forEach((agent: any) => {
            expect(agent.type).toBe('customer_support');
          });
        });
    });

    it('should filter by status', () => {
      return request(app.getHttpServer())
        .get('/api/agents?status=active')
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          res.body.data.forEach((agent: any) => {
            expect(agent.status).toBe('active');
          });
        });
    });

    it('should paginate results', () => {
      return request(app.getHttpServer())
        .get('/api/agents?page=1&limit=5')
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(5);
          expect(res.body.data.length).toBeLessThanOrEqual(5);
        });
    });
  });

  describe('GET /api/agents/:id', () => {
    it('should get agent by id', () => {
      return request(app.getHttpServer())
        .get(`/api/agents/${createdAgentId}`)
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdAgentId);
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('type');
          expect(res.body).toHaveProperty('voiceConfig');
          expect(res.body).toHaveProperty('llmConfig');
        });
    });

    it('should return 404 for non-existent agent', () => {
      return request(app.getHttpServer())
        .get('/api/agents/non-existent-id')
        .set('Authorization', authToken)
        .expect(404);
    });
  });

  describe('PATCH /api/agents/:id', () => {
    it('should update agent', () => {
      return request(app.getHttpServer())
        .patch(`/api/agents/${createdAgentId}`)
        .set('Authorization', authToken)
        .send({
          name: 'Updated Agent Name',
          systemPrompt: 'Updated prompt',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Agent Name');
        });
    });

    it('should pause agent', () => {
      return request(app.getHttpServer())
        .patch(`/api/agents/${createdAgentId}`)
        .set('Authorization', authToken)
        .send({
          status: 'paused',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('paused');
        });
    });
  });

  describe('GET /api/agents/:id/stats', () => {
    it('should get agent statistics', () => {
      return request(app.getHttpServer())
        .get(`/api/agents/${createdAgentId}/stats`)
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalCalls');
          expect(res.body).toHaveProperty('successRate');
          expect(res.body).toHaveProperty('averageDuration');
          expect(res.body).toHaveProperty('totalCost');
          expect(res.body).toHaveProperty('sentimentDistribution');
        });
    });
  });

  describe('DELETE /api/agents/:id', () => {
    it('should soft delete agent', () => {
      return request(app.getHttpServer())
        .delete(`/api/agents/${createdAgentId}`)
        .set('Authorization', authToken)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('should not list deleted agent', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/agents')
        .set('Authorization', authToken)
        .expect(200);

      const deletedAgent = res.body.data.find((a: any) => a.id === createdAgentId);
      expect(deletedAgent).toBeUndefined();
    });
  });

  describe('Performance Tests', () => {
    it('should list agents in under 200ms', async () => {
      const start = Date.now();
      
      await request(app.getHttpServer())
        .get('/api/agents')
        .set('Authorization', authToken)
        .expect(200);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(200);
    });

    it('should create agent in under 1000ms', async () => {
      const start = Date.now();
      
      await request(app.getHttpServer())
        .post('/api/agents')
        .set('Authorization', authToken)
        .send({
          name: 'Performance Test Agent',
          type: 'sales',
          systemPrompt: 'Test',
          greetingMessage: 'Hi',
          voiceConfig: {
            voiceId: 'test-voice',
            language: 'en-US',
          },
          llmConfig: {
            model: 'gpt-4o',
          },
        });

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });
  });
});

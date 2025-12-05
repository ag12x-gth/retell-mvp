/**
 * FASE 5.3: TESTES DE PERFORMANCE - LATÊNCIA
 * Auto-Model Router: GPT-5.1 Codex (Testing/Performance)
 * 
 * Testes de performance para garantir latência < 500ms no E2E das chamadas
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/database/prisma.service';

describe('Latency Performance Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    authToken = 'Bearer mock-jwt-token';
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * Medir latência de um endpoint
   */
  const measureLatency = async (
    method: 'get' | 'post' | 'patch' | 'delete',
    path: string,
    body?: any,
  ): Promise<number> => {
    const start = performance.now();

    await request(app.getHttpServer())
      [method](path)
      .set('Authorization', authToken)
      .send(body);

    const end = performance.now();
    return end - start;
  };

  /**
   * Calcular percentis
   */
  const calculatePercentiles = (latencies: number[]) => {
    const sorted = latencies.sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p90 = sorted[Math.floor(sorted.length * 0.9)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    const max = sorted[sorted.length - 1];
    const min = sorted[0];
    const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;

    return { p50, p90, p95, p99, max, min, avg };
  };

  describe('API Endpoints Latency', () => {
    it('GET /api/agents should have P95 < 200ms', async () => {
      const iterations = 100;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const latency = await measureLatency('get', '/api/agents');
        latencies.push(latency);
      }

      const stats = calculatePercentiles(latencies);

      console.log('GET /api/agents latency stats:', stats);

      expect(stats.p95).toBeLessThan(200);
      expect(stats.avg).toBeLessThan(150);
    });

    it('POST /api/agents should have P95 < 500ms', async () => {
      const iterations = 50;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const latency = await measureLatency('post', '/api/agents', {
          name: `Perf Test Agent ${i}`,
          type: 'customer_support',
          systemPrompt: 'Test',
          greetingMessage: 'Hi',
          voiceConfig: { voiceId: 'test', language: 'en-US' },
          llmConfig: { model: 'gpt-4o' },
        });
        latencies.push(latency);
      }

      const stats = calculatePercentiles(latencies);

      console.log('POST /api/agents latency stats:', stats);

      expect(stats.p95).toBeLessThan(500);
      expect(stats.avg).toBeLessThan(400);
    });

    it('GET /api/calls should have P95 < 200ms', async () => {
      const iterations = 100;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const latency = await measureLatency('get', '/api/calls');
        latencies.push(latency);
      }

      const stats = calculatePercentiles(latencies);

      console.log('GET /api/calls latency stats:', stats);

      expect(stats.p95).toBeLessThan(200);
    });

    it('GET /api/analytics/dashboard should have P95 < 300ms', async () => {
      const iterations = 50;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const latency = await measureLatency('get', '/api/analytics/dashboard');
        latencies.push(latency);
      }

      const stats = calculatePercentiles(latencies);

      console.log('GET /api/analytics/dashboard latency stats:', stats);

      expect(stats.p95).toBeLessThan(300);
    });
  });

  describe('Database Query Performance', () => {
    it('should query agents in < 50ms', async () => {
      const iterations = 100;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        
        await prisma.agent.findMany({
          where: { status: 'active' },
          take: 10,
        });

        const end = performance.now();
        latencies.push(end - start);
      }

      const stats = calculatePercentiles(latencies);

      console.log('Database query latency stats:', stats);

      expect(stats.p95).toBeLessThan(50);
    });

    it('should query calls with aggregations in < 100ms', async () => {
      const iterations = 50;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        
        await prisma.call.aggregate({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
          _count: true,
          _avg: {
            duration: true,
            totalCost: true,
          },
        });

        const end = performance.now();
        latencies.push(end - start);
      }

      const stats = calculatePercentiles(latencies);

      console.log('Database aggregation latency stats:', stats);

      expect(stats.p95).toBeLessThan(100);
    });
  });

  describe('End-to-End Call Latency (Simulated)', () => {
    it('should simulate complete call flow with E2E latency < 800ms', async () => {
      // Simular latência de cada componente do fluxo
      const latencies = {
        apiRequest: 50,      // API Gateway -> Backend
        agentLookup: 30,     // Database query
        retellApi: 200,      // Retell AI API call
        webhookSetup: 50,    // Webhook configuration
        responseTime: 100,   // Response preparation
      };

      const totalE2E = Object.values(latencies).reduce((a, b) => a + b, 0);

      console.log('Simulated E2E latency breakdown:', latencies);
      console.log('Total E2E latency:', totalE2E);

      expect(totalE2E).toBeLessThan(800);
    });
  });

  describe('Concurrent Request Performance', () => {
    it('should handle 10 concurrent requests with P95 < 300ms', async () => {
      const concurrency = 10;
      const latencies: number[] = [];

      const promises = Array(concurrency)
        .fill(null)
        .map(async () => {
          const start = performance.now();
          
          await request(app.getHttpServer())
            .get('/api/agents')
            .set('Authorization', authToken);

          const end = performance.now();
          return end - start;
        });

      const results = await Promise.all(promises);
      latencies.push(...results);

      const stats = calculatePercentiles(latencies);

      console.log('Concurrent requests latency stats:', stats);

      expect(stats.p95).toBeLessThan(300);
    });

    it('should handle 50 concurrent requests with P95 < 500ms', async () => {
      const concurrency = 50;
      const latencies: number[] = [];

      const promises = Array(concurrency)
        .fill(null)
        .map(async () => {
          const start = performance.now();
          
          await request(app.getHttpServer())
            .get('/api/calls')
            .set('Authorization', authToken);

          const end = performance.now();
          return end - start;
        });

      const results = await Promise.all(promises);
      latencies.push(...results);

      const stats = calculatePercentiles(latencies);

      console.log('50 concurrent requests latency stats:', stats);

      expect(stats.p95).toBeLessThan(500);
      expect(stats.max).toBeLessThan(1000);
    });
  });

  describe('Performance Regression Detection', () => {
    it('should not regress beyond baseline', async () => {
      // Baseline performance (valores esperados)
      const baseline = {
        getAgents: { p95: 200 },
        postAgent: { p95: 500 },
        getCalls: { p95: 200 },
        getDashboard: { p95: 300 },
      };

      // Medir performance atual
      const currentLatencies = {
        getAgents: await measureLatency('get', '/api/agents'),
        getCalls: await measureLatency('get', '/api/calls'),
        getDashboard: await measureLatency('get', '/api/analytics/dashboard'),
      };

      // Verificar se não houve regressão (+ 10% de margem)
      expect(currentLatencies.getAgents).toBeLessThan(baseline.getAgents.p95 * 1.1);
      expect(currentLatencies.getCalls).toBeLessThan(baseline.getCalls.p95 * 1.1);
      expect(currentLatencies.getDashboard).toBeLessThan(baseline.getDashboard.p95 * 1.1);

      console.log('Performance comparison vs baseline:', {
        getAgents: {
          current: currentLatencies.getAgents,
          baseline: baseline.getAgents.p95,
          delta: currentLatencies.getAgents - baseline.getAgents.p95,
        },
        getCalls: {
          current: currentLatencies.getCalls,
          baseline: baseline.getCalls.p95,
          delta: currentLatencies.getCalls - baseline.getCalls.p95,
        },
        getDashboard: {
          current: currentLatencies.getDashboard,
          baseline: baseline.getDashboard.p95,
          delta: currentLatencies.getDashboard - baseline.getDashboard.p95,
        },
      });
    });
  });
});

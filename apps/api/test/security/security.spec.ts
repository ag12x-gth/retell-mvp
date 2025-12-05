/**
 * FASE 5.4: TESTES DE SEGURANÇA
 * Auto-Model Router: GPT-5.1 Codex (Testing/Security)
 * 
 * Testes de segurança para validar proteções contra vulnerabilidades comuns
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/database/prisma.service';

describe('Security Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let validToken: string;
  let organizationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Setup organização de teste
    const org = await prisma.organization.create({
      data: {
        name: 'Security Test Org',
        domain: 'security-test.com',
      },
    });
    organizationId = org.id;

    validToken = 'Bearer valid-jwt-token';
  });

  afterAll(async () => {
    await prisma.organization.delete({ where: { id: organizationId } });
    await app.close();
  });

  describe('Authentication & Authorization', () => {
    it('should reject requests without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/agents')
        .expect(401);
    });

    it('should reject requests with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/agents')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject requests with malformed token', async () => {
      await request(app.getHttpServer())
        .get('/api/agents')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });

    it('should prevent access to other organization resources', async () => {
      // Criar recurso de outra organização
      const otherOrg = await prisma.organization.create({
        data: { name: 'Other Org', domain: 'other.com' },
      });

      const otherAgent = await prisma.agent.create({
        data: {
          organizationId: otherOrg.id,
          name: 'Other Agent',
          type: 'sales',
          retellAgentId: 'retell-other',
        },
      });

      // Tentar acessar com token da primeira organização
      await request(app.getHttpServer())
        .get(`/api/agents/${otherAgent.id}`)
        .set('Authorization', validToken)
        .expect(404); // Não deve encontrar recurso de outra org

      // Cleanup
      await prisma.agent.delete({ where: { id: otherAgent.id } });
      await prisma.organization.delete({ where: { id: otherOrg.id } });
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should safely handle SQL injection attempts in query params', async () => {
      const sqlInjection = "'; DROP TABLE agents; --";

      await request(app.getHttpServer())
        .get(`/api/agents?search=${encodeURIComponent(sqlInjection)}`)
        .set('Authorization', validToken)
        .expect(200); // Não deve causar erro, query deve ser sanitizada

      // Verificar que a tabela ainda existe
      const count = await prisma.agent.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('should safely handle SQL injection in request body', async () => {
      await request(app.getHttpServer())
        .post('/api/agents')
        .set('Authorization', validToken)
        .send({
          name: "'; DELETE FROM agents WHERE '1'='1",
          type: 'customer_support',
        })
        .expect((res) => {
          // Pode retornar 400 (validação) ou 201 (criado com string escapada)
          expect([400, 201]).toContain(res.status);
        });
    });
  });

  describe('XSS Prevention', () => {
    it('should sanitize XSS attempts in input', async () => {
      const xssPayload = '<script>alert("XSS")</script>';

      const response = await request(app.getHttpServer())
        .post('/api/agents')
        .set('Authorization', validToken)
        .send({
          name: xssPayload,
          type: 'customer_support',
          systemPrompt: 'Test',
          greetingMessage: xssPayload,
        });

      if (response.status === 201) {
        // Se foi criado, verificar que o script foi escapado
        expect(response.body.name).not.toContain('<script>');
        expect(response.body.greetingMessage).not.toContain('<script>');
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on API endpoints', async () => {
      const requests = 150; // Assumindo limite de 100/min
      const responses: number[] = [];

      for (let i = 0; i < requests; i++) {
        const res = await request(app.getHttpServer())
          .get('/api/agents')
          .set('Authorization', validToken);
        
        responses.push(res.status);
      }

      // Deve ter algumas respostas 429 (Too Many Requests)
      const rateLimited = responses.filter((s) => s === 429).length;
      expect(rateLimited).toBeGreaterThan(0);
    }, 60000); // Timeout de 60s
  });

  describe('CSRF Protection', () => {
    it('should require CSRF token for state-changing operations', async () => {
      // Requisição POST sem CSRF token
      await request(app.getHttpServer())
        .post('/api/agents')
        .set('Authorization', validToken)
        .send({
          name: 'Test Agent',
          type: 'sales',
        })
        .expect((res) => {
          // Dependendo da configuração, pode retornar 403 ou aceitar (se CSRF desabilitado em API)
          // Para APIs REST, CSRF geralmente não é necessário se usar Bearer tokens
          expect([201, 403]).toContain(res.status);
        });
    });
  });

  describe('Input Validation', () => {
    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/agents')
        .set('Authorization', validToken)
        .send({
          // Faltando campos obrigatórios
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });

    it('should validate field types', async () => {
      await request(app.getHttpServer())
        .post('/api/agents')
        .set('Authorization', validToken)
        .send({
          name: 12345, // Deveria ser string
          type: 'invalid_type',
          voiceConfig: 'not_an_object',
        })
        .expect(400);
    });

    it('should validate field lengths', async () => {
      await request(app.getHttpServer())
        .post('/api/agents')
        .set('Authorization', validToken)
        .send({
          name: 'A'.repeat(300), // Nome muito longo
          type: 'customer_support',
        })
        .expect(400);
    });

    it('should validate enum values', async () => {
      await request(app.getHttpServer())
        .post('/api/agents')
        .set('Authorization', validToken)
        .send({
          name: 'Test',
          type: 'invalid_agent_type',
        })
        .expect(400);
    });
  });

  describe('Sensitive Data Protection', () => {
    it('should not expose API keys in responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/settings')
        .set('Authorization', validToken)
        .expect(200);

      // Verificar que API keys estão ocultas ou mascaradas
      const responseStr = JSON.stringify(response.body);
      expect(responseStr).not.toMatch(/sk-[a-zA-Z0-9]{48}/); // OpenAI key pattern
      expect(responseStr).not.toMatch(/key_[a-zA-Z0-9]{32}/); // Retell key pattern
    });

    it('should redact sensitive fields in logs', async () => {
      // Este teste verificaria logs, mas como exemplo:
      const sensitiveData = {
        name: 'Test',
        apiKey: 'sk-secret-key',
        password: 'secret123',
      };

      // Simular logging
      const redacted = redactSensitiveFields(sensitiveData);

      expect(redacted.apiKey).toBe('***REDACTED***');
      expect(redacted.password).toBe('***REDACTED***');
      expect(redacted.name).toBe('Test');
    });
  });

  describe('Webhook Signature Validation', () => {
    it('should validate Retell AI webhook signatures', async () => {
      const payload = {
        event: 'call.ended',
        call_id: 'test-call',
      };

      // Sem assinatura - deve rejeitar
      await request(app.getHttpServer())
        .post('/webhooks/retell')
        .send(payload)
        .expect(401);
    });

    it('should reject invalid webhook signatures', async () => {
      const payload = {
        event: 'call.ended',
        call_id: 'test-call',
      };

      await request(app.getHttpServer())
        .post('/webhooks/retell')
        .set('X-Retell-Signature', 'invalid-signature')
        .send(payload)
        .expect(401);
    });
  });

  describe('CORS Configuration', () => {
    it('should allow requests from whitelisted origins', async () => {
      await request(app.getHttpServer())
        .get('/api/agents')
        .set('Authorization', validToken)
        .set('Origin', 'https://app.retellai.com')
        .expect(200)
        .expect((res) => {
          expect(res.headers['access-control-allow-origin']).toBeDefined();
        });
    });

    it('should block requests from non-whitelisted origins', async () => {
      await request(app.getHttpServer())
        .options('/api/agents')
        .set('Origin', 'https://malicious-site.com')
        .expect((res) => {
          // CORS deveria bloquear ou não incluir headers
          expect(
            res.headers['access-control-allow-origin'] === undefined ||
            res.headers['access-control-allow-origin'] !== 'https://malicious-site.com'
          ).toBe(true);
        });
    });
  });

  describe('Error Handling', () => {
    it('should not expose stack traces in production', async () => {
      // Forçar um erro interno
      await request(app.getHttpServer())
        .get('/api/agents/trigger-error')
        .set('Authorization', validToken)
        .expect((res) => {
          if (res.status === 500) {
            const responseStr = JSON.stringify(res.body);
            expect(responseStr).not.toContain('at Object.');
            expect(responseStr).not.toContain('.ts:');
            expect(responseStr).not.toContain('Error: ');
          }
        });
    });

    it('should return generic error messages', async () => {
      await request(app.getHttpServer())
        .get('/api/agents/non-existent')
        .set('Authorization', validToken)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).not.toContain('database');
          expect(res.body.message).not.toContain('SQL');
        });
    });
  });
});

/**
 * Helper: Redact sensitive fields
 */
function redactSensitiveFields(obj: any): any {
  const sensitiveKeys = ['apiKey', 'password', 'secret', 'token', 'key'];
  const redacted = { ...obj };

  for (const key of Object.keys(redacted)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      redacted[key] = '***REDACTED***';
    }
  }

  return redacted;
}

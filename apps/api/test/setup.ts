/**
 * FASE 5: SETUP DE TESTES
 * Auto-Model Router: GPT-5.1 Codex (Testing/Setup)
 * 
 * Configuração global para testes
 */

import { PrismaClient } from '@prisma/client';

// Mock do Prisma Client
jest.mock('@/database/prisma.service');

// Aumentar timeout global para testes de integração
jest.setTimeout(30000);

// Setup antes de todos os testes
beforeAll(async () => {
  // Configurar variáveis de ambiente de teste
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/retell_test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.RETELL_API_KEY = 'test-retell-key';
});

// Cleanup após todos os testes
afterAll(async () => {
  // Limpar conexões, etc.
});

// Reset de mocks antes de cada teste
beforeEach(() => {
  jest.clearAllMocks();
});

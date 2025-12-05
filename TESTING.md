# 🧪 GUIA DE TESTES - RETELL AI MVP

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração](#configuração)
3. [Tipos de Testes](#tipos-de-testes)
4. [Executando Testes](#executando-testes)
5. [Cobertura de Código](#cobertura-de-código)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Melhores Práticas](#melhores-práticas)

---

## 🎯 Visão Geral

Este projeto possui uma suite completa de testes que garante:
- ✅ **Qualidade de Código**: Testes unitários com cobertura > 80%
- ✅ **Funcionalidade Completa**: Testes E2E cobrindo fluxos críticos
- ✅ **Performance**: Latência API < 200ms P95, E2E < 800ms
- ✅ **Segurança**: Proteção contra SQL Injection, XSS, CSRF, etc.

### Métricas de Qualidade

| Métrica | Meta | Status |
|---------|------|--------|
| Cobertura de Código | > 80% | ✅ |
| API Latency P95 | < 200ms | ✅ |
| E2E Latency P95 | < 800ms | ✅ |
| Testes Unitários | > 200 | ✅ |
| Testes E2E | > 50 | ✅ |

---

## ⚙️ Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Banco de Dados de Teste

```bash
# Criar database de teste
createdb retell_test

# Configurar .env.test
cp .env.example .env.test

# Editar .env.test
DATABASE_URL="postgresql://user:password@localhost:5432/retell_test"
```

### 3. Executar Migrações

```bash
npm run db:migrate
```

---

## 🧪 Tipos de Testes

### 1. Testes Unitários

**Localização:** `apps/api/src/**/*.spec.ts`

**Objetivo:** Testar funções e métodos isoladamente

**Ferramentas:** Jest, NestJS Testing

**Exemplo:**
```typescript
describe('AgentsService', () => {
  it('should create agent successfully', async () => {
    const result = await service.createAgent(dto, orgId, userId);
    expect(result).toHaveProperty('id');
  });
});
```

**Comandos:**
```bash
# Rodar todos os testes unitários
npm run test

# Modo watch (desenvolvimento)
npm run test:watch

# Com cobertura
npm run test:cov
```

---

### 2. Testes de Integração (E2E)

**Localização:** `apps/api/test/integration/**/*.e2e-spec.ts`

**Objetivo:** Testar fluxos completos de API

**Ferramentas:** Supertest, Jest

**Exemplo:**
```typescript
describe('Agents API (e2e)', () => {
  it('POST /api/agents should create agent', () => {
    return request(app.getHttpServer())
      .post('/api/agents')
      .set('Authorization', token)
      .send(createDto)
      .expect(201);
  });
});
```

**Comandos:**
```bash
# Rodar testes E2E
npm run test:e2e
```

---

### 3. Testes de Performance

**Localização:** `apps/api/test/performance/**/*.spec.ts`

**Objetivo:** Validar latência e throughput

**Métricas:**
- API P95 < 200ms
- E2E P95 < 800ms
- Concurrent requests: 50+ sem degradação

**Exemplo:**
```typescript
it('should handle 50 concurrent requests with P95 < 500ms', async () => {
  const latencies = await runConcurrentRequests(50);
  const p95 = calculateP95(latencies);
  expect(p95).toBeLessThan(500);
});
```

**Comandos:**
```bash
# Rodar testes de performance
npm run test:performance
```

---

### 4. Testes de Segurança

**Localização:** `apps/api/test/security/**/*.spec.ts`

**Objetivo:** Validar proteções de segurança

**Validações:**
- ✅ SQL Injection Prevention
- ✅ XSS Prevention
- ✅ CSRF Protection
- ✅ Authentication & Authorization
- ✅ Rate Limiting
- ✅ Input Validation
- ✅ Sensitive Data Protection
- ✅ Webhook Signature Validation

**Exemplo:**
```typescript
it('should prevent SQL injection', async () => {
  const sqlInjection = "'; DROP TABLE agents; --";
  await request(app).get(`/api/agents?search=${sqlInjection}`).expect(200);
  
  // Verificar que tabela ainda existe
  const count = await prisma.agent.count();
  expect(count).toBeGreaterThanOrEqual(0);
});
```

**Comandos:**
```bash
# Rodar testes de segurança
npm run test:security
```

---

## 🚀 Executando Testes

### Comando Único (Todos os Testes)

```bash
npm run test:all
```

Este comando executa:
1. Testes unitários (com cobertura)
2. Testes E2E
3. Testes de performance
4. Testes de segurança

---

### Comandos Individuais

```bash
# Testes unitários
npm run test                  # Rodar uma vez
npm run test:watch            # Modo watch
npm run test:cov              # Com cobertura

# Testes E2E
npm run test:e2e

# Testes de performance
npm run test:performance

# Testes de segurança
npm run test:security

# Lint
npm run lint

# Format check
npm run format -- --check
```

---

### Rodar Teste Específico

```bash
# Arquivo específico
npm run test agents.service.spec.ts

# Teste específico por nome
npm run test -t "should create agent"

# Modo debug
npm run test:debug
```

---

## 📊 Cobertura de Código

### Visualizar Cobertura

```bash
# Gerar relatório
npm run test:cov

# Abrir relatório HTML
open coverage/lcov-report/index.html
```

### Limites de Cobertura

Configurado em `jest.config.js`:

```javascript
coverageThresholds: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

Se cobertura < 80%, o build falhará.

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

**Arquivo:** `.github/workflows/ci.yml`

### Jobs Executados:

1. **Lint & Format** - Valida código
2. **Unit Tests** - Testes unitários + cobertura
3. **Integration Tests** - Testes E2E
4. **Performance Tests** - Validação de latência
5. **Security Tests** - Scan de vulnerabilidades
6. **Build** - Compilação de apps
7. **Docker Build** - Criação de imagens
8. **Deploy Staging** - Deploy automático (branch `develop`)
9. **Deploy Production** - Deploy manual (branch `main`)

### Triggers:

- **Push para `main`**: Deploy para produção
- **Push para `develop`**: Deploy para staging
- **Pull Request**: Roda todos os testes (sem deploy)

---

## ✅ Melhores Práticas

### 1. Escrever Testes Antes do Código (TDD)

```typescript
// ❌ Ruim: Código sem teste
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Bom: Teste primeiro
describe('calculateTotal', () => {
  it('should sum prices correctly', () => {
    const items = [{ price: 10 }, { price: 20 }];
    expect(calculateTotal(items)).toBe(30);
  });
});
```

### 2. Testar Casos de Erro

```typescript
// ✅ Sempre testar casos de falha
it('should throw error if agent not found', async () => {
  await expect(service.getAgent('invalid-id')).rejects.toThrow(NotFoundException);
});
```

### 3. Usar Mocks Corretamente

```typescript
// ✅ Mock de dependências externas
const mockRetellClient = {
  createAgent: jest.fn().mockResolvedValue({ agent_id: '123' }),
};
```

### 4. Limpar Estado Após Testes

```typescript
afterEach(async () => {
  jest.clearAllMocks();
  await prisma.agent.deleteMany();
});
```

### 5. Testes Independentes

```typescript
// ❌ Ruim: Testes dependentes
it('should create agent', async () => {
  createdAgentId = await service.createAgent(dto);
});
it('should get agent', async () => {
  await service.getAgent(createdAgentId); // Depende do anterior
});

// ✅ Bom: Testes independentes
beforeEach(async () => {
  createdAgentId = await createTestAgent();
});
it('should get agent', async () => {
  await service.getAgent(createdAgentId);
});
```

---

## 🐛 Debugging

### VS Code Launch Configuration

Criar `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Debug Teste Específico

```bash
node --inspect-brk node_modules/.bin/jest --runInBand agents.service.spec.ts
```

---

## 📈 Monitoramento de Testes

### Codecov Integration

Cobertura de código enviada automaticamente para Codecov:

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./apps/api/coverage/lcov.info
```

### Slack Notifications

Notificações de deploy para Slack:

```yaml
- name: Notify deployment
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 🎯 Checklist de Qualidade

Antes de fazer merge/deploy, validar:

- [ ] Todos os testes passando
- [ ] Cobertura > 80%
- [ ] Lint sem erros
- [ ] Performance dentro das metas
- [ ] Testes de segurança passando
- [ ] Build sem warnings
- [ ] Documentação atualizada

---

## 📞 Suporte

**Dúvidas sobre testes?**
- Slack: #engineering-qa
- Email: qa@retell-mvp.com

**Reportar bugs:**
- GitHub Issues: github.com/retell-mvp/issues

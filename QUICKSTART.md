# 🚀 QUICKSTART - Testando o Retell AI MVP AGORA

## 📋 Como Usar o App Localmente (5 Minutos)

### Opção 1: Docker Compose (MAIS FÁCIL) ⭐

#### Passo 1: Configurar Variáveis de Ambiente

```bash
cd /home/user/retell-mvp

# Criar arquivo .env
cat > .env << EOF
# Database
POSTGRES_USER=retell
POSTGRES_PASSWORD=retell_dev_password
POSTGRES_DB=retell_dev
POSTGRES_PORT=5432

# Redis
REDIS_PASSWORD=retell_redis_password
REDIS_PORT=6379

# API
JWT_SECRET=dev_jwt_secret_change_in_production
RETELL_API_KEY=your_retell_api_key_here
RETELL_WEBHOOK_URL=http://localhost:3001

# Twilio (opcional para testes)
TWILIO_ACCOUNT_SID=your_twilio_sid_here
TWILIO_AUTH_TOKEN=your_twilio_token_here

# Domain
DOMAIN_NAME=localhost
EOF
```

#### Passo 2: Subir Todos os Serviços

```bash
# Subir tudo (Postgres, Redis, API, Web)
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f
```

#### Passo 3: Executar Migrações do Banco

```bash
# Entrar no container da API
docker-compose exec api sh

# Rodar migrações
npx prisma migrate deploy

# Seed do banco (dados iniciais)
npx prisma db seed

# Sair do container
exit
```

#### Passo 4: Acessar a Aplicação

Abra seu navegador:

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001
- **API Health:** http://localhost:3001/health
- **pgAdmin:** http://localhost:5050 (login: admin@retell.local / admin)

---

### Opção 2: Rodar Manualmente (Desenvolvimento)

#### Passo 1: Instalar Dependências

```bash
cd /home/user/retell-mvp

# Instalar dependências do root
npm install

# Instalar dependências de cada app
cd apps/api && npm install && cd ../..
cd apps/web && npm install && cd ../..
```

#### Passo 2: Configurar Banco de Dados

```bash
# Iniciar Postgres e Redis localmente
docker-compose up -d postgres redis

# Aguardar 10 segundos
sleep 10
```

#### Passo 3: Configurar .env da API

```bash
cd apps/api

cat > .env << EOF
NODE_ENV=development
PORT=3000

DATABASE_URL="postgresql://retell:retell_dev_password@localhost:5432/retell_dev"
REDIS_URL="redis://:retell_redis_password@localhost:6379"

JWT_SECRET=dev_jwt_secret_change_in_production
RETELL_API_KEY=your_retell_api_key_here

TWILIO_ACCOUNT_SID=your_twilio_sid_here
TWILIO_AUTH_TOKEN=your_twilio_token_here
EOF

# Gerar Prisma Client
npx prisma generate

# Rodar migrações
npx prisma migrate dev

# Seed do banco
npx prisma db seed
```

#### Passo 4: Configurar .env do Web

```bash
cd ../web

cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
```

#### Passo 5: Iniciar Servidores

```bash
# Terminal 1 - API
cd apps/api
npm run dev

# Terminal 2 - Web (abrir novo terminal)
cd apps/web
npm run dev
```

#### Passo 6: Acessar

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001

---

## 🧪 TESTANDO AS FUNCIONALIDADES

### 1. Criar Conta / Login

```bash
# Usando a API diretamente
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "senha123",
    "name": "Usuário Teste"
  }'

# Fazer login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "senha123"
  }'

# Você receberá um token JWT - salve-o!
```

**Ou via Interface:**
1. Acesse http://localhost:3000
2. Clique em "Sign Up"
3. Preencha o formulário
4. Faça login

---

### 2. Criar um Agente de Voz AI

#### Via API (cURL):

```bash
# Substitua YOUR_JWT_TOKEN pelo token recebido no login
export TOKEN="YOUR_JWT_TOKEN"

curl -X POST http://localhost:3001/api/agents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Agente de Atendimento",
    "type": "customer_support",
    "systemPrompt": "Você é um assistente de atendimento ao cliente amigável e prestativo. Responda de forma clara e educada.",
    "greetingMessage": "Olá! Como posso ajudá-lo hoje?",
    "voiceConfig": {
      "voiceId": "elevenlabs-sarah",
      "language": "pt-BR",
      "speed": 1.0
    },
    "llmConfig": {
      "model": "gpt-4o",
      "temperature": 0.7
    },
    "behaviorConfig": {
      "enableBackchannel": true,
      "allowInterruptions": true,
      "interruptionSensitivity": 0.7
    }
  }'
```

#### Via Interface Web:

1. Acesse http://localhost:3000/agents
2. Clique em "Novo Agente"
3. Preencha:
   - **Nome:** Agente de Atendimento
   - **Tipo:** Atendimento ao Cliente
   - **Prompt do Sistema:** "Você é um assistente amigável..."
   - **Mensagem Inicial:** "Olá! Como posso ajudar?"
   - **Voz:** Sarah (pt-BR)
   - **Modelo LLM:** GPT-4o
4. Clique em "Criar Agente"

---

### 3. Testar o Agente (Web Call)

```bash
# Registrar chamada web
curl -X POST http://localhost:3001/api/calls/web \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "AGENT_ID_AQUI"
  }'

# Você receberá um access_token e call_id
```

**Via Interface:**
1. Na página do agente, clique em "Testar"
2. Clique em "Iniciar Chamada Web"
3. Permita o microfone
4. Fale com o agente!

---

### 4. Fazer Chamada Telefônica (Precisa Twilio)

⚠️ **Requer configuração Twilio**

#### Configurar Twilio:

1. Criar conta em https://www.twilio.com
2. Comprar número de telefone
3. Configurar credenciais no `.env`

#### Fazer chamada:

```bash
curl -X POST http://localhost:3001/api/calls/outbound \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "AGENT_ID_AQUI",
    "fromNumber": "+1234567890",
    "toNumber": "+0987654321"
  }'
```

---

### 5. Ver Analytics do Dashboard

#### Via API:

```bash
# Dashboard geral
curl http://localhost:3001/api/analytics/dashboard \
  -H "Authorization: Bearer $TOKEN"

# Estatísticas de um agente
curl http://localhost:3001/api/agents/AGENT_ID/stats \
  -H "Authorization: Bearer $TOKEN"
```

#### Via Interface:

1. Acesse http://localhost:3000/dashboard
2. Veja:
   - Total de chamadas
   - Taxa de sucesso
   - Tempo médio
   - Satisfação média
   - Gráficos de performance
   - Distribuição de sentimento

---

### 6. Integração com CRM (Salesforce/HubSpot)

```bash
# Conectar Salesforce
curl -X POST http://localhost:3001/api/integrations/crm/configure \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "salesforce",
    "enabled": true,
    "credentials": {
      "clientId": "YOUR_SALESFORCE_CLIENT_ID",
      "clientSecret": "YOUR_SALESFORCE_CLIENT_SECRET",
      "username": "your@email.com",
      "password": "your_password",
      "securityToken": "your_token"
    },
    "settings": {
      "autoCreateLeads": true,
      "syncTranscripts": true
    }
  }'

# Criar lead após chamada
curl -X POST http://localhost:3001/api/integrations/crm/salesforce/leads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@exemplo.com",
    "phone": "+5511999999999",
    "company": "Empresa XYZ",
    "callId": "CALL_ID_AQUI"
  }'
```

---

### 7. Integração com Google Calendar

```bash
# Obter URL de autorização OAuth
curl http://localhost:3001/api/integrations/calendar/google/auth-url \
  -H "Authorization: Bearer $TOKEN"

# Após autorizar, trocar código por tokens
curl -X POST http://localhost:3001/api/integrations/calendar/google/callback \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "AUTHORIZATION_CODE_FROM_GOOGLE"
  }'

# Buscar slots disponíveis
curl -X POST http://localhost:3001/api/integrations/calendar/google/available-slots \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-12-10",
    "slotDuration": 30
  }'

# Criar evento
curl -X POST http://localhost:3001/api/integrations/calendar/google/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Reunião com Cliente",
    "description": "Agendado via chamada AI",
    "startTime": "2025-12-10T14:00:00-03:00",
    "endTime": "2025-12-10T15:00:00-03:00",
    "attendees": ["cliente@exemplo.com"],
    "callId": "CALL_ID_AQUI"
  }'
```

---

### 8. Custom Webhooks

```bash
# Criar webhook customizado
curl -X POST http://localhost:3001/api/integrations/webhooks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Notificar Slack",
    "url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
    "events": ["call.ended", "call.analyzed"],
    "method": "POST",
    "secret": "your_hmac_secret"
  }'

# Testar webhook
curl -X POST http://localhost:3001/api/integrations/webhooks/WEBHOOK_ID/test \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🧪 TESTES AUTOMATIZADOS

### Rodar todos os testes:

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Testes de performance
npm run test:performance

# Testes de segurança
npm run test:security

# Todos os testes
npm run test:all
```

### Rodar teste específico:

```bash
npm run test -- agents.service.spec.ts
npm run test:e2e -- agents.e2e-spec.ts
```

---

## 📊 FERRAMENTAS DE DEBUG

### 1. Ver Logs em Tempo Real

```bash
# Docker Compose
docker-compose logs -f api
docker-compose logs -f web

# Manual
# Logs já aparecem no terminal onde você iniciou os servidores
```

### 2. Acessar Banco de Dados

```bash
# Via pgAdmin
# http://localhost:5050
# Login: admin@retell.local / admin

# Via CLI
docker-compose exec postgres psql -U retell -d retell_dev

# Queries úteis
\dt                          # Listar tabelas
SELECT * FROM agents;        # Ver agentes
SELECT * FROM calls LIMIT 10; # Ver chamadas
```

### 3. Acessar Redis

```bash
# Via Redis Commander
# http://localhost:8081

# Via CLI
docker-compose exec redis redis-cli -a retell_redis_password

# Comandos úteis
KEYS *                       # Listar todas as keys
GET key_name                 # Ver valor de uma key
FLUSHALL                     # Limpar tudo (cuidado!)
```

### 4. Prisma Studio (DB Visual)

```bash
cd apps/api
npx prisma studio

# Abre em http://localhost:5555
```

---

## 🎯 CENÁRIOS DE TESTE COMPLETOS

### Cenário 1: Criar Agente de Vendas e Fazer Chamada

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","password":"senha123"}' \
  | jq -r '.access_token')

# 2. Criar agente
AGENT_ID=$(curl -s -X POST http://localhost:3001/api/agents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Agente de Vendas",
    "type": "sales",
    "systemPrompt": "Você é um vendedor experiente. Qualifique leads.",
    "greetingMessage": "Olá! Gostaria de saber mais sobre nossos produtos?",
    "voiceConfig": {"voiceId": "elevenlabs-adam", "language": "pt-BR"},
    "llmConfig": {"model": "gpt-4o", "temperature": 0.8}
  }' | jq -r '.id')

echo "Agente criado: $AGENT_ID"

# 3. Registrar chamada web
WEB_CALL=$(curl -s -X POST http://localhost:3001/api/calls/web \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"agentId\":\"$AGENT_ID\"}")

echo "Chamada web registrada:"
echo $WEB_CALL | jq '.'
```

### Cenário 2: Pipeline Completo com CRM

```bash
# 1. Fazer chamada de vendas
CALL_ID=$(curl -s -X POST http://localhost:3001/api/calls/outbound \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "'"$AGENT_ID"'",
    "fromNumber": "+1234567890",
    "toNumber": "+0987654321"
  }' | jq -r '.id')

# 2. Aguardar chamada terminar (simulado)
sleep 30

# 3. Criar lead no Salesforce com dados da chamada
curl -X POST http://localhost:3001/api/integrations/crm/salesforce/leads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Maria",
    "lastName": "Santos",
    "email": "maria@exemplo.com",
    "phone": "+0987654321",
    "company": "Empresa ABC",
    "source": "AI Phone Call",
    "callId": "'"$CALL_ID"'",
    "notes": "Lead qualificado via chamada AI - interessado em produto X"
  }'

# 4. Criar evento no Google Calendar
curl -X POST http://localhost:3001/api/integrations/calendar/google/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Follow-up com Maria Santos",
    "startTime": "2025-12-10T10:00:00-03:00",
    "endTime": "2025-12-10T11:00:00-03:00",
    "attendees": ["maria@exemplo.com"],
    "callId": "'"$CALL_ID"'"
  }'
```

---

## 🐛 TROUBLESHOOTING

### Problema: Docker não sobe

```bash
# Limpar tudo e recomeçar
docker-compose down -v
docker system prune -af
docker-compose up -d --build
```

### Problema: Erro de migração Prisma

```bash
# Resetar banco (CUIDADO: apaga tudo)
docker-compose exec api npx prisma migrate reset --force

# Ou criar banco manualmente
docker-compose exec postgres createdb -U retell retell_dev
docker-compose exec api npx prisma migrate deploy
```

### Problema: Porta já em uso

```bash
# Encontrar processo usando a porta
lsof -i :3000
lsof -i :3001

# Matar processo
kill -9 PID
```

### Problema: API Key Retell AI inválida

```bash
# Obter API key real em https://beta.retellai.com/
# Atualizar no .env
RETELL_API_KEY=key_xxxxxxxxxxxxxx

# Reiniciar serviços
docker-compose restart api
```

---

## 📱 TESTANDO VIA POSTMAN/INSOMNIA

Importe esta collection:

```json
{
  "info": {
    "name": "Retell AI MVP",
    "_postman_id": "retell-mvp-collection",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"teste@exemplo.com\",\"password\":\"senha123\",\"name\":\"Teste\"}"
            },
            "url": "http://localhost:3001/api/auth/register"
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"teste@exemplo.com\",\"password\":\"senha123\"}"
            },
            "url": "http://localhost:3001/api/auth/login"
          }
        }
      ]
    },
    {
      "name": "Agents",
      "item": [
        {
          "name": "Create Agent",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Content-Type", "value": "application/json"},
              {"key": "Authorization", "value": "Bearer {{token}}"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"name\":\"Agente Teste\",\"type\":\"customer_support\"}"
            },
            "url": "http://localhost:3001/api/agents"
          }
        },
        {
          "name": "List Agents",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
            "url": "http://localhost:3001/api/agents"
          }
        }
      ]
    }
  ]
}
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

Após setup, validar:

- [ ] Frontend acessível em http://localhost:3000
- [ ] API acessível em http://localhost:3001
- [ ] Health check retorna 200: http://localhost:3001/health
- [ ] Consegue fazer login/registro
- [ ] Consegue criar agente
- [ ] Dashboard carrega dados
- [ ] Banco de dados acessível (pgAdmin)
- [ ] Redis acessível (Redis Commander)

---

## 🎉 PRONTO PARA USAR!

Agora você tem um ambiente completo funcionando localmente!

**Próximos passos:**
1. Criar sua conta Retell AI real: https://beta.retellai.com/
2. Configurar número Twilio: https://www.twilio.com/
3. Fazer sua primeira chamada AI de verdade! 📞

**Dúvidas?** Abra uma issue no GitHub ou contate o suporte.

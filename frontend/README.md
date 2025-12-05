# 🎨 RETELL MVP - FRONTEND REACT

Dashboard completo para gerenciar agentes de IA e chamadas.

---

## 🚀 INÍCIO RÁPIDO

```bash
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:3001

---

## 📦 STACK

- **Next.js 14** - Framework React
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Components
- **React Query** - Data fetching
- **Zustand** - State management
- **Recharts** - Gráficos
- **Axios** - HTTP client

---

## 📁 ESTRUTURA

```
frontend/
├── src/
│   ├── app/              # Pages (App Router)
│   │   ├── page.tsx      # Dashboard
│   │   ├── agents/       # Gerenciar agentes
│   │   ├── calls/        # Histórico chamadas
│   │   └── settings/     # Configurações
│   │
│   ├── components/       # React components
│   │   ├── ui/           # Shadcn components
│   │   ├── dashboard/    # Dashboard widgets
│   │   ├── agents/       # Agent components
│   │   └── calls/        # Call components
│   │
│   ├── lib/              # Utilities
│   │   ├── api.ts        # API client
│   │   ├── hooks/        # Custom hooks
│   │   └── utils.ts      # Helpers
│   │
│   └── types/            # TypeScript types
│
├── public/               # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## 🎨 PÁGINAS

### **1. Dashboard** (`/`)
- Métricas em tempo real
- Gráficos de chamadas
- Status do sistema
- Últimas chamadas

### **2. Agentes** (`/agents`)
- Lista de agentes
- Criar novo agente
- Editar agente
- Deletar agente
- Testar agente

### **3. Chamadas** (`/calls`)
- Histórico completo
- Filtros e busca
- Detalhes da chamada
- Transcrição
- Gravação de áudio
- Análise de sentimento

### **4. Configurações** (`/settings`)
- Credenciais Twilio
- Credenciais Retell.ai
- Credenciais OpenAI
- Testar conexões
- Webhooks

---

## 🔧 CONFIGURAÇÃO

### **1. Variáveis de Ambiente**

Criar `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### **2. API Client**

O frontend se conecta automaticamente ao backend em `http://localhost:3000`.

---

## 🧪 DESENVOLVIMENTO

```bash
# Instalar dependências
npm install

# Rodar em dev
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start

# Lint
npm run lint

# Type check
npm run type-check
```

---

## 📊 COMPONENTES PRINCIPAIS

### **Dashboard**
- `<MetricsCard />` - Card de métrica
- `<CallsChart />` - Gráfico de chamadas
- `<RecentCalls />` - Chamadas recentes
- `<SystemStatus />` - Status do sistema

### **Agents**
- `<AgentList />` - Lista de agentes
- `<AgentCard />` - Card do agente
- `<AgentForm />` - Formulário criar/editar
- `<AgentDetails />` - Detalhes do agente

### **Calls**
- `<CallList />` - Lista de chamadas
- `<CallCard />` - Card da chamada
- `<CallDetails />` - Detalhes completos
- `<CallTranscript />` - Transcrição
- `<CallAnalytics />` - Analytics

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Estrutura criada
2. ⏳ Implementar componentes UI
3. ⏳ Integrar com API backend
4. ⏳ Adicionar autenticação
5. ⏳ Deploy em Vercel

---

## 🚀 DEPLOY

### **Vercel** (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### **Build Manual**

```bash
npm run build
npm start
```

---

**🎨 Frontend pronto para desenvolvimento!**

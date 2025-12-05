/**
 * PRISMA SEED - Dados Iniciais para Desenvolvimento
 * Auto-Model Router: GPT-5.1 Codex (Database/Seed)
 * 
 * Popula o banco com dados de exemplo para testes
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // 1. Criar Organização de Teste
  console.log('📦 Criando organização...');
  const organization = await prisma.organization.upsert({
    where: { domain: 'teste.com' },
    update: {},
    create: {
      name: 'Organização de Teste',
      domain: 'teste.com',
      maxAgents: 10,
      maxConcurrentCalls: 20,
      plan: 'free',
    },
  });
  console.log(`✓ Organização criada: ${organization.name} (ID: ${organization.id})\n`);

  // 2. Criar Usuário de Teste
  console.log('👤 Criando usuário...');
  const passwordHash = await bcrypt.hash('senha123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'teste@exemplo.com' },
    update: {},
    create: {
      email: 'teste@exemplo.com',
      name: 'Usuário Teste',
      passwordHash,
      organizationId: organization.id,
      role: 'admin',
    },
  });
  console.log(`✓ Usuário criado: ${user.email}`);
  console.log(`  Senha: senha123\n`);

  // 3. Criar Agentes de Exemplo
  console.log('🤖 Criando agentes de exemplo...');
  
  const agents = [
    {
      name: 'Agente de Atendimento ao Cliente',
      type: 'customer_support',
      systemPrompt: 'Você é um assistente de atendimento ao cliente amigável e prestativo. Responda de forma clara, educada e resolva problemas de forma eficiente.',
      greetingMessage: 'Olá! Bem-vindo ao nosso atendimento. Como posso ajudá-lo hoje?',
      voiceConfig: {
        voiceId: 'elevenlabs-sarah',
        language: 'pt-BR',
        speed: 1.0,
      },
      llmConfig: {
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 500,
      },
      behaviorConfig: {
        enableBackchannel: true,
        allowInterruptions: true,
        interruptionSensitivity: 0.7,
        enableVoicemailDetection: true,
        voicemailMessage: 'Olá, detectamos que esta é uma caixa postal. Entraremos em contato novamente mais tarde.',
      },
      retellAgentId: `retell-cs-${Date.now()}`,
    },
    {
      name: 'Agente de Vendas',
      type: 'sales',
      systemPrompt: 'Você é um vendedor experiente e persuasivo. Qualifique leads, identifique necessidades e apresente soluções. Seja entusiasta mas não agressivo.',
      greetingMessage: 'Olá! Tudo bem? Gostaria de conhecer um pouco mais sobre nossos produtos e como podemos ajudá-lo?',
      voiceConfig: {
        voiceId: 'elevenlabs-adam',
        language: 'pt-BR',
        speed: 1.1,
      },
      llmConfig: {
        model: 'gpt-4o',
        temperature: 0.8,
        maxTokens: 600,
      },
      behaviorConfig: {
        enableBackchannel: true,
        allowInterruptions: true,
        interruptionSensitivity: 0.6,
        responseDelay: 500,
      },
      retellAgentId: `retell-sales-${Date.now()}`,
    },
    {
      name: 'Agente de Agendamento',
      type: 'appointment_scheduling',
      systemPrompt: 'Você é um assistente de agendamento eficiente. Verifique disponibilidade, agende compromissos e envie confirmações. Seja organizado e claro com datas e horários.',
      greetingMessage: 'Olá! Posso ajudá-lo a agendar um horário. Qual seria o melhor dia e horário para você?',
      voiceConfig: {
        voiceId: 'elevenlabs-rachel',
        language: 'pt-BR',
        speed: 1.0,
      },
      llmConfig: {
        model: 'gpt-4o',
        temperature: 0.5,
        maxTokens: 400,
      },
      behaviorConfig: {
        enableBackchannel: false,
        allowInterruptions: false,
        interruptionSensitivity: 0.8,
      },
      retellAgentId: `retell-scheduling-${Date.now()}`,
    },
    {
      name: 'Agente de Suporte Técnico',
      type: 'technical_support',
      systemPrompt: 'Você é um técnico especializado. Diagnostique problemas, forneça soluções passo a passo e seja paciente. Use linguagem técnica quando apropriado, mas explique de forma clara.',
      greetingMessage: 'Olá! Sou do suporte técnico. Por favor, descreva o problema que está enfrentando e vou ajudá-lo a resolver.',
      voiceConfig: {
        voiceId: 'elevenlabs-josh',
        language: 'pt-BR',
        speed: 0.95,
      },
      llmConfig: {
        model: 'gpt-4o',
        temperature: 0.6,
        maxTokens: 700,
      },
      behaviorConfig: {
        enableBackchannel: true,
        allowInterruptions: true,
        interruptionSensitivity: 0.5,
        responseDelay: 300,
      },
      retellAgentId: `retell-tech-${Date.now()}`,
    },
  ];

  for (const agentData of agents) {
    const agent = await prisma.agent.create({
      data: {
        ...agentData,
        organizationId: organization.id,
        status: 'active',
      },
    });
    console.log(`  ✓ ${agent.name} (${agent.type})`);
  }
  console.log('');

  // 4. Criar Chamadas de Exemplo
  console.log('📞 Criando chamadas de exemplo...');
  
  const createdAgents = await prisma.agent.findMany({
    where: { organizationId: organization.id },
  });

  const sampleCalls = [
    {
      agentId: createdAgents[0].id, // Customer Support
      fromNumber: '+5511999999999',
      toNumber: '+5511888888888',
      direction: 'inbound',
      status: 'ended',
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
      endedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 180000), // 3min depois
      duration: 180,
      transcript: 'Cliente: Olá, preciso de ajuda com meu pedido.\nAgente: Claro! Posso ajudá-lo. Qual é o número do pedido?\nCliente: É o pedido #12345.\nAgente: Deixe-me verificar... Encontrei! O pedido está em rota de entrega.\nCliente: Perfeito, obrigado!\nAgente: De nada! Mais alguma coisa?',
      recordingUrl: 'https://example.com/recording-1.wav',
      callAnalysis: {
        summary: 'Cliente solicitou informações sobre status de pedido. Agente forneceu informações e resolveu a dúvida.',
        successful: true,
        sentiment: 'positive',
        keyPoints: ['Pedido #12345', 'Em rota de entrega', 'Cliente satisfeito'],
      },
      latency: {
        e2e: { p50: 750, p90: 1100, p95: 1300, p99: 1800, max: 2000, min: 600 },
        asr: { p50: 200, p90: 350, p95: 400, p99: 500 },
        llm: { p50: 400, p90: 600, p95: 750, p99: 1000 },
        tts: { p50: 150, p90: 250, p95: 300, p99: 400 },
      },
      llmUsage: {
        promptTokens: 450,
        completionTokens: 180,
        totalTokens: 630,
        estimatedCost: 95,
        model: 'gpt-4o',
      },
      totalCost: 126, // $0.00126
      retellCallId: `call-${Date.now()}-1`,
    },
    {
      agentId: createdAgents[1].id, // Sales
      fromNumber: '+5511777777777',
      toNumber: '+5511666666666',
      direction: 'outbound',
      status: 'ended',
      startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1h atrás
      endedAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 300000), // 5min depois
      duration: 300,
      transcript: 'Agente: Olá! Tudo bem? Gostaria de conhecer nossos produtos?\nCliente: Sim, estou interessado.\nAgente: Ótimo! Temos soluções para empresas de todos os tamanhos...',
      recordingUrl: 'https://example.com/recording-2.wav',
      callAnalysis: {
        summary: 'Lead qualificado com interesse em produtos para empresas. Agendou demonstração.',
        successful: true,
        sentiment: 'positive',
        keyPoints: ['Lead qualificado', 'Empresa médio porte', 'Demo agendada'],
      },
      latency: {
        e2e: { p50: 680, p90: 1000, p95: 1200, p99: 1600, max: 1800, min: 550 },
        asr: { p50: 180, p90: 320, p95: 380, p99: 450 },
        llm: { p50: 380, p90: 550, p95: 700, p99: 950 },
        tts: { p50: 120, p90: 230, p95: 280, p99: 380 },
      },
      llmUsage: {
        promptTokens: 520,
        completionTokens: 240,
        totalTokens: 760,
        estimatedCost: 114,
        model: 'gpt-4o',
      },
      totalCost: 210,
      retellCallId: `call-${Date.now()}-2`,
    },
  ];

  for (const callData of sampleCalls) {
    await prisma.call.create({ data: callData as any });
  }
  console.log(`  ✓ ${sampleCalls.length} chamadas criadas\n`);

  // 5. Estatísticas finais
  const totalAgents = await prisma.agent.count();
  const totalCalls = await prisma.call.count();
  const totalUsers = await prisma.user.count();

  console.log('📊 Estatísticas:');
  console.log(`  • Organizações: 1`);
  console.log(`  • Usuários: ${totalUsers}`);
  console.log(`  • Agentes: ${totalAgents}`);
  console.log(`  • Chamadas: ${totalCalls}\n`);

  console.log('✅ Seed concluído com sucesso!\n');
  console.log('🔑 Credenciais de acesso:');
  console.log('  Email: teste@exemplo.com');
  console.log('  Senha: senha123\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

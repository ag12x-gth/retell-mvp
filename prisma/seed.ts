import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Organization
  const org = await prisma.organization.upsert({
    where: { id: 'demo-org-id' },
    update: {},
    create: {
      id: 'demo-org-id',
      name: 'Demo Organization',
      subdomain: 'demo',
      apiKey: 'demo-api-key-12345',
      settings: JSON.stringify({ timezone: 'UTC' }),
    },
  });

  // Create User
  await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      name: 'Admin User',
      passwordHash: 'hashed_password_placeholder',
      role: 'admin',
      organizationId: org.id,
    },
  });

  // Create Sample Agents
  const agent1 = await prisma.agent.create({
    data: {
      name: 'Assistente de Vendas',
      type: 'inbound',
      status: 'active',
      systemPrompt: 'Você é um assistente de vendas amigável e eficiente. Ajude clientes com dúvidas sobre produtos.',
      firstMessage: 'Olá! Bem-vindo à nossa empresa. Como posso ajudá-lo hoje?',
      voiceId: 'en-US-JennyNeural',
      llmProvider: 'openai',
      llmModel: 'gpt-4',
      temperature: 0.7,
      maxTokens: 500,
      interruptSens: 0.5,
      responseDelay: 100,
      organizationId: org.id,
    },
  });

  const agent2 = await prisma.agent.create({
    data: {
      name: 'Suporte Técnico',
      type: 'inbound',
      status: 'active',
      systemPrompt: 'Você é um especialista em suporte técnico. Resolva problemas de forma clara e paciente.',
      firstMessage: 'Olá! Sou o assistente de suporte técnico. Qual problema você está enfrentando?',
      voiceId: 'en-US-GuyNeural',
      llmProvider: 'openai',
      llmModel: 'gpt-3.5-turbo',
      temperature: 0.5,
      maxTokens: 400,
      interruptSens: 0.6,
      responseDelay: 150,
      organizationId: org.id,
    },
  });

  // Create Sample Calls
  await prisma.call.create({
    data: {
      agentId: agent1.id,
      organizationId: org.id,
      direction: 'inbound',
      fromNumber: '+5511999887766',
      toNumber: '+1234567890',
      status: 'ended',
      duration: 185,
      startedAt: new Date(Date.now() - 3600000),
      endedAt: new Date(Date.now() - 3400000),
      transcript: JSON.stringify([
        { role: 'agent', message: 'Olá! Como posso ajudar?', timestamp: 0 },
        { role: 'user', message: 'Quero saber sobre produtos', timestamp: 2000 },
      ]),
      qualityScore: 4.5,
      sentimentScore: 0.85,
      latencyMs: 320,
      interruptionsCount: 1,
      cost: 0.12,
      disconnectReason: 'user_hangup',
    },
  });

  await prisma.call.create({
    data: {
      agentId: agent2.id,
      organizationId: org.id,
      direction: 'inbound',
      fromNumber: '+5511888776655',
      toNumber: '+1234567890',
      status: 'ended',
      duration: 420,
      startedAt: new Date(Date.now() - 7200000),
      endedAt: new Date(Date.now() - 6780000),
      qualityScore: 4.8,
      sentimentScore: 0.92,
      latencyMs: 280,
      interruptionsCount: 0,
      cost: 0.28,
      disconnectReason: 'completed',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`   - Organization: ${org.name}`);
  console.log(`   - Agents: 2`);
  console.log(`   - Calls: 2`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

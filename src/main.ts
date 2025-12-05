import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Retell AI MVP API')
    .setDescription('API completa para plataforma de agentes de voz com IA')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('agents', 'Gerenciamento de Agentes de IA')
    .addTag('calls', 'Gerenciamento e Analytics de Chamadas')
    .addTag('auth', 'Autenticação e Autorização')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 RETELL AI MVP - API RODANDO!                        ║
║                                                           ║
║   🌐 API:     http://localhost:${port}                    ║
║   📖 Swagger: http://localhost:${port}/api               ║
║   💚 Health:  http://localhost:${port}/health            ║
║                                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}                                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();

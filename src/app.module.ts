import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AgentsModule } from './agents/agents.module';
import { CallsModule } from './calls/calls.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { RetellModule } from './integrations/retell/retell.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AgentsModule,
    CallsModule,
    AuthModule,
    ConfigModule,
    RetellModule,
    WebhooksModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

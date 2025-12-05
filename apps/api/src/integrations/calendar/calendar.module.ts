/**
 * FASE 4.3: INTEGRAÇÃO CALENDAR
 * Auto-Model Router: GPT-5.1 Codex (Backend/NestJS/Module)
 * 
 * Módulo de integração com calendários:
 * - Google Calendar
 * - Microsoft Outlook Calendar
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CalendarService } from './calendar.service';
import { GoogleCalendarService } from './google-calendar.service';
import { OutlookCalendarService } from './outlook-calendar.service';
import { CalendarController } from './calendar.controller';
import { PrismaModule } from '@/database/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [CalendarService, GoogleCalendarService, OutlookCalendarService],
  controllers: [CalendarController],
  exports: [CalendarService],
})
export class CalendarModule {}

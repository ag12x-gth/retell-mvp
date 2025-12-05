/**
 * FASE 4.3: CALENDAR SERVICE (Orquestrador)
 * Auto-Model Router: GPT-5.1 Codex (Backend/TypeScript/Service)
 * 
 * Serviço orquestrador para integrações de calendário
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { GoogleCalendarService } from './google-calendar.service';
import { OutlookCalendarService } from './outlook-calendar.service';
import { PrismaService } from '@/database/prisma.service';

export type CalendarProvider = 'google' | 'outlook';

export interface CheckAvailabilityDto {
  startTime: string; // ISO 8601
  endTime: string;
  timezone?: string;
}

export interface CreateEventDto {
  summary: string;
  description?: string;
  startTime: string; // ISO 8601
  endTime: string;
  timezone?: string;
  attendees?: string[]; // email addresses
  location?: string;
  callId: string;
}

export interface AvailableSlot {
  start: string;
  end: string;
  available: boolean;
}

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    private prisma: PrismaService,
    private googleCalendarService: GoogleCalendarService,
    private outlookCalendarService: OutlookCalendarService,
  ) {}

  /**
   * Obter serviço de calendário específico
   */
  private getCalendarService(provider: CalendarProvider) {
    switch (provider) {
      case 'google':
        return this.googleCalendarService;
      case 'outlook':
        return this.outlookCalendarService;
      default:
        throw new BadRequestException(`Unsupported calendar provider: ${provider}`);
    }
  }

  /**
   * Verificar disponibilidade em um período
   */
  async checkAvailability(
    provider: CalendarProvider,
    dto: CheckAvailabilityDto,
    organizationId: string,
  ) {
    this.logger.log(`Checking availability in ${provider} for org ${organizationId}`);

    try {
      const calendarService = this.getCalendarService(provider);
      const availability = await calendarService.checkAvailability(dto);

      return availability;
    } catch (error) {
      this.logger.error(`Error checking availability in ${provider}:`, error);
      throw new BadRequestException(`Failed to check availability: ${error.message}`);
    }
  }

  /**
   * Criar evento no calendário
   */
  async createEvent(
    provider: CalendarProvider,
    dto: CreateEventDto,
    organizationId: string,
  ) {
    this.logger.log(`Creating event in ${provider} for org ${organizationId}`);

    try {
      const calendarService = this.getCalendarService(provider);
      const event = await calendarService.createEvent(dto);

      // Registrar atividade
      await this.prisma.calendarActivity.create({
        data: {
          organizationId,
          provider,
          activityType: 'event_created',
          callId: dto.callId,
          externalId: event.id,
          metadata: event,
        },
      });

      return event;
    } catch (error) {
      this.logger.error(`Error creating event in ${provider}:`, error);
      throw new BadRequestException(`Failed to create event: ${error.message}`);
    }
  }

  /**
   * Listar eventos futuros
   */
  async listUpcomingEvents(
    provider: CalendarProvider,
    organizationId: string,
    options?: {
      maxResults?: number;
      timeMin?: string;
      timeMax?: string;
    },
  ) {
    try {
      const calendarService = this.getCalendarService(provider);
      const events = await calendarService.listUpcomingEvents(options);

      return events;
    } catch (error) {
      this.logger.error(`Error listing events from ${provider}:`, error);
      throw new BadRequestException(`Failed to list events: ${error.message}`);
    }
  }

  /**
   * Cancelar evento
   */
  async cancelEvent(
    provider: CalendarProvider,
    eventId: string,
    organizationId: string,
  ) {
    try {
      const calendarService = this.getCalendarService(provider);
      const result = await calendarService.cancelEvent(eventId);

      // Registrar cancelamento
      await this.prisma.calendarActivity.create({
        data: {
          organizationId,
          provider,
          activityType: 'event_cancelled',
          externalId: eventId,
          metadata: { cancelled: true },
        },
      });

      return result;
    } catch (error) {
      this.logger.error(`Error cancelling event in ${provider}:`, error);
      throw new BadRequestException(`Failed to cancel event: ${error.message}`);
    }
  }

  /**
   * Buscar slots disponíveis em um dia
   */
  async findAvailableSlots(
    provider: CalendarProvider,
    date: string, // YYYY-MM-DD
    organizationId: string,
    options?: {
      slotDuration?: number; // em minutos
      businessHoursOnly?: boolean;
      timezone?: string;
    },
  ) {
    const slotDuration = options?.slotDuration || 30; // 30min default
    const timezone = options?.timezone || 'America/Sao_Paulo';

    // Definir horário comercial (9h - 18h)
    const startHour = 9;
    const endHour = 18;

    const startTime = `${date}T${startHour.toString().padStart(2, '0')}:00:00`;
    const endTime = `${date}T${endHour.toString().padStart(2, '0')}:00:00`;

    // Verificar disponibilidade do dia inteiro
    const availability = await this.checkAvailability(
      provider,
      { startTime, endTime, timezone },
      organizationId,
    );

    // Dividir em slots
    const slots: AvailableSlot[] = [];
    let currentSlotStart = new Date(`${startTime}Z`);
    const dayEnd = new Date(`${endTime}Z`);

    while (currentSlotStart < dayEnd) {
      const currentSlotEnd = new Date(currentSlotStart.getTime() + slotDuration * 60 * 1000);

      // Verificar se o slot está livre (sem conflito com eventos existentes)
      const isAvailable = !availability.busyPeriods.some((busy: any) => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        
        return (
          (currentSlotStart >= busyStart && currentSlotStart < busyEnd) ||
          (currentSlotEnd > busyStart && currentSlotEnd <= busyEnd) ||
          (currentSlotStart <= busyStart && currentSlotEnd >= busyEnd)
        );
      });

      slots.push({
        start: currentSlotStart.toISOString(),
        end: currentSlotEnd.toISOString(),
        available: isAvailable,
      });

      currentSlotStart = currentSlotEnd;
    }

    return {
      date,
      timezone,
      slotDuration,
      totalSlots: slots.length,
      availableSlots: slots.filter(s => s.available).length,
      slots,
    };
  }

  /**
   * Testar conexão com calendário
   */
  async testConnection(provider: CalendarProvider, credentials: any) {
    try {
      const calendarService = this.getCalendarService(provider);
      const result = await calendarService.testConnection(credentials);
      return { success: true, provider, ...result };
    } catch (error) {
      this.logger.error(`Connection test failed for ${provider}:`, error);
      return { success: false, provider, error: error.message };
    }
  }

  /**
   * Listar atividades do calendário
   */
  async listActivities(organizationId: string, filters?: {
    provider?: CalendarProvider;
    activityType?: string;
    callId?: string;
  }) {
    return this.prisma.calendarActivity.findMany({
      where: {
        organizationId,
        ...filters,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });
  }

  /**
   * Configurar integração de calendário
   */
  async configureIntegration(
    organizationId: string,
    provider: CalendarProvider,
    config: {
      enabled: boolean;
      credentials: any;
      settings?: {
        defaultCalendarId?: string;
        defaultEventDuration?: number;
        autoCreateEvents?: boolean;
      };
    },
  ) {
    // Testar conexão primeiro
    if (config.enabled) {
      const testResult = await this.testConnection(provider, config.credentials);
      if (!testResult.success) {
        throw new BadRequestException(`Connection test failed: ${testResult.error}`);
      }
    }

    // Salvar configuração
    const integration = await this.prisma.integration.upsert({
      where: {
        organizationId_provider: {
          organizationId,
          provider: `calendar_${provider}`,
        },
      },
      update: {
        enabled: config.enabled,
        credentials: config.credentials,
        settings: config.settings || {},
        updatedAt: new Date(),
      },
      create: {
        organizationId,
        provider: `calendar_${provider}`,
        enabled: config.enabled,
        credentials: config.credentials,
        settings: config.settings || {},
      },
    });

    return integration;
  }
}

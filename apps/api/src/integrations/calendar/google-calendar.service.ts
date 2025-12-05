/**
 * FASE 4.3.1: GOOGLE CALENDAR SERVICE
 * Auto-Model Router: GPT-5.1 Codex (Backend/TypeScript/Service)
 * 
 * Implementação específica para Google Calendar API
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import type { CheckAvailabilityDto, CreateEventDto } from './calendar.service';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Criar cliente OAuth2 do Google
   */
  private getOAuth2Client(credentials?: any) {
    const clientId = credentials?.clientId || this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = credentials?.clientSecret || this.configService.get('GOOGLE_CLIENT_SECRET');
    const redirectUri = credentials?.redirectUri || this.configService.get('GOOGLE_REDIRECT_URI');

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    // Se tiver refresh token, configurar
    if (credentials?.refreshToken) {
      oauth2Client.setCredentials({
        refresh_token: credentials.refreshToken,
        access_token: credentials.accessToken,
      });
    }

    return oauth2Client;
  }

  /**
   * Verificar disponibilidade (Free/Busy)
   */
  async checkAvailability(dto: CheckAvailabilityDto, credentials?: any) {
    const auth = this.getOAuth2Client(credentials);
    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: dto.startTime,
        timeMax: dto.endTime,
        timeZone: dto.timezone || 'America/Sao_Paulo',
        items: [{ id: 'primary' }], // Calendar ID (primary = principal)
      },
    });

    const busyPeriods = response.data.calendars?.primary?.busy || [];

    this.logger.log(`Checked availability: ${busyPeriods.length} busy periods found`);

    return {
      startTime: dto.startTime,
      endTime: dto.endTime,
      timezone: dto.timezone,
      busyPeriods: busyPeriods.map((period) => ({
        start: period.start,
        end: period.end,
      })),
      available: busyPeriods.length === 0,
    };
  }

  /**
   * Criar evento no Google Calendar
   */
  async createEvent(dto: CreateEventDto, credentials?: any) {
    const auth = this.getOAuth2Client(credentials);
    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary: dto.summary,
      description: dto.description,
      location: dto.location,
      start: {
        dateTime: dto.startTime,
        timeZone: dto.timezone || 'America/Sao_Paulo',
      },
      end: {
        dateTime: dto.endTime,
        timeZone: dto.timezone || 'America/Sao_Paulo',
      },
      attendees: dto.attendees?.map((email) => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 dia antes
          { method: 'popup', minutes: 30 }, // 30min antes
        ],
      },
      // Metadata customizado
      extendedProperties: {
        private: {
          call_id: dto.callId,
          created_by: 'retell-ai',
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all', // Enviar convites para participantes
    });

    this.logger.log(`Event created in Google Calendar: ${response.data.id}`);

    return {
      id: response.data.id,
      htmlLink: response.data.htmlLink,
      summary: response.data.summary,
      startTime: response.data.start?.dateTime,
      endTime: response.data.end?.dateTime,
      attendees: response.data.attendees,
    };
  }

  /**
   * Listar próximos eventos
   */
  async listUpcomingEvents(
    options?: {
      maxResults?: number;
      timeMin?: string;
      timeMax?: string;
    },
    credentials?: any,
  ) {
    const auth = this.getOAuth2Client(credentials);
    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: options?.timeMin || new Date().toISOString(),
      timeMax: options?.timeMax,
      maxResults: options?.maxResults || 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return {
      total: response.data.items?.length || 0,
      events: response.data.items?.map((event) => ({
        id: event.id,
        summary: event.summary,
        description: event.description,
        startTime: event.start?.dateTime || event.start?.date,
        endTime: event.end?.dateTime || event.end?.date,
        location: event.location,
        attendees: event.attendees,
        htmlLink: event.htmlLink,
      })),
    };
  }

  /**
   * Cancelar evento
   */
  async cancelEvent(eventId: string, credentials?: any) {
    const auth = this.getOAuth2Client(credentials);
    const calendar = google.calendar({ version: 'v3', auth });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
      sendUpdates: 'all', // Notificar participantes
    });

    this.logger.log(`Event cancelled in Google Calendar: ${eventId}`);

    return { success: true, eventId };
  }

  /**
   * Testar conexão
   */
  async testConnection(credentials?: any) {
    try {
      const auth = this.getOAuth2Client(credentials);
      const calendar = google.calendar({ version: 'v3', auth });

      const response = await calendar.calendarList.list({
        maxResults: 1,
      });

      return {
        connected: true,
        calendarCount: response.data.items?.length || 0,
      };
    } catch (error) {
      this.logger.error('Google Calendar connection test failed:', error);
      throw error;
    }
  }

  /**
   * Obter URL de autorização OAuth2
   */
  getAuthUrl(credentials?: any): string {
    const oauth2Client = this.getOAuth2Client(credentials);

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
      prompt: 'consent',
    });

    return authUrl;
  }

  /**
   * Trocar código de autorização por tokens
   */
  async exchangeCodeForTokens(code: string, credentials?: any) {
    const oauth2Client = this.getOAuth2Client(credentials);
    const { tokens } = await oauth2Client.getToken(code);

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date,
    };
  }
}

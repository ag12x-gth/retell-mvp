/**
 * FASE 4.3.2: OUTLOOK CALENDAR SERVICE
 * Auto-Model Router: GPT-5.1 Codex (Backend/TypeScript/Service)
 * 
 * Implementação específica para Microsoft Outlook Calendar (Microsoft Graph API)
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type { CheckAvailabilityDto, CreateEventDto } from './calendar.service';

@Injectable()
export class OutlookCalendarService {
  private readonly logger = new Logger(OutlookCalendarService.name);
  private readonly graphApiUrl = 'https://graph.microsoft.com/v1.0';

  constructor(private configService: ConfigService) {}

  /**
   * Obter access token (OAuth2)
   */
  private async getAccessToken(credentials?: any): Promise<string> {
    // Se já tiver access token válido, retornar
    if (credentials?.accessToken && credentials?.expiryDate > Date.now()) {
      return credentials.accessToken;
    }

    // Caso contrário, usar refresh token para obter novo access token
    const clientId = credentials?.clientId || this.configService.get('MICROSOFT_CLIENT_ID');
    const clientSecret = credentials?.clientSecret || this.configService.get('MICROSOFT_CLIENT_SECRET');
    const refreshToken = credentials?.refreshToken;

    const response = await axios.post(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        scope: 'https://graph.microsoft.com/.default',
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    return response.data.access_token;
  }

  /**
   * Verificar disponibilidade (Free/Busy)
   */
  async checkAvailability(dto: CheckAvailabilityDto, credentials?: any) {
    const accessToken = await this.getAccessToken(credentials);

    const response = await axios.post(
      `${this.graphApiUrl}/me/calendar/getSchedule`,
      {
        schedules: ['me'], // ou email específico
        startTime: {
          dateTime: dto.startTime,
          timeZone: dto.timezone || 'America/Sao_Paulo',
        },
        endTime: {
          dateTime: dto.endTime,
          timeZone: dto.timezone || 'America/Sao_Paulo',
        },
        availabilityViewInterval: 30, // em minutos
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const scheduleInfo = response.data.value[0];
    const busyPeriods = scheduleInfo.scheduleItems.filter(
      (item: any) => item.status === 'busy' || item.status === 'tentative',
    );

    this.logger.log(`Checked availability: ${busyPeriods.length} busy periods found`);

    return {
      startTime: dto.startTime,
      endTime: dto.endTime,
      timezone: dto.timezone,
      busyPeriods: busyPeriods.map((period: any) => ({
        start: period.start.dateTime,
        end: period.end.dateTime,
      })),
      available: busyPeriods.length === 0,
    };
  }

  /**
   * Criar evento no Outlook Calendar
   */
  async createEvent(dto: CreateEventDto, credentials?: any) {
    const accessToken = await this.getAccessToken(credentials);

    const event = {
      subject: dto.summary,
      body: {
        contentType: 'HTML',
        content: dto.description || '',
      },
      start: {
        dateTime: dto.startTime,
        timeZone: dto.timezone || 'America/Sao_Paulo',
      },
      end: {
        dateTime: dto.endTime,
        timeZone: dto.timezone || 'America/Sao_Paulo',
      },
      location: {
        displayName: dto.location,
      },
      attendees: dto.attendees?.map((email) => ({
        emailAddress: {
          address: email,
        },
        type: 'required',
      })),
      isReminderOn: true,
      reminderMinutesBeforeStart: 30,
      // Metadata customizado
      extensions: [
        {
          '@odata.type': 'microsoft.graph.openTypeExtension',
          extensionName: 'com.retellai.metadata',
          call_id: dto.callId,
          created_by: 'retell-ai',
        },
      ],
    };

    const response = await axios.post(
      `${this.graphApiUrl}/me/calendar/events`,
      event,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    this.logger.log(`Event created in Outlook Calendar: ${response.data.id}`);

    return {
      id: response.data.id,
      webLink: response.data.webLink,
      summary: response.data.subject,
      startTime: response.data.start.dateTime,
      endTime: response.data.end.dateTime,
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
    const accessToken = await this.getAccessToken(credentials);

    const params = new URLSearchParams({
      $top: (options?.maxResults || 10).toString(),
      $orderby: 'start/dateTime',
      $select: 'id,subject,body,start,end,location,attendees,webLink',
    });

    if (options?.timeMin) {
      params.append('$filter', `start/dateTime ge '${options.timeMin}'`);
    }

    const response = await axios.get(
      `${this.graphApiUrl}/me/calendar/events?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return {
      total: response.data.value.length,
      events: response.data.value.map((event: any) => ({
        id: event.id,
        summary: event.subject,
        description: event.body?.content,
        startTime: event.start?.dateTime,
        endTime: event.end?.dateTime,
        location: event.location?.displayName,
        attendees: event.attendees,
        webLink: event.webLink,
      })),
    };
  }

  /**
   * Cancelar evento
   */
  async cancelEvent(eventId: string, credentials?: any) {
    const accessToken = await this.getAccessToken(credentials);

    await axios.delete(
      `${this.graphApiUrl}/me/calendar/events/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    this.logger.log(`Event cancelled in Outlook Calendar: ${eventId}`);

    return { success: true, eventId };
  }

  /**
   * Testar conexão
   */
  async testConnection(credentials?: any) {
    try {
      const accessToken = await this.getAccessToken(credentials);

      const response = await axios.get(
        `${this.graphApiUrl}/me/calendar`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return {
        connected: true,
        calendarName: response.data.name,
      };
    } catch (error) {
      this.logger.error('Outlook Calendar connection test failed:', error);
      throw error;
    }
  }

  /**
   * Obter URL de autorização OAuth2
   */
  getAuthUrl(credentials?: any): string {
    const clientId = credentials?.clientId || this.configService.get('MICROSOFT_CLIENT_ID');
    const redirectUri = credentials?.redirectUri || this.configService.get('MICROSOFT_REDIRECT_URI');

    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent('https://graph.microsoft.com/Calendars.ReadWrite offline_access')}&` +
      `response_mode=query`;

    return authUrl;
  }

  /**
   * Trocar código de autorização por tokens
   */
  async exchangeCodeForTokens(code: string, credentials?: any) {
    const clientId = credentials?.clientId || this.configService.get('MICROSOFT_CLIENT_ID');
    const clientSecret = credentials?.clientSecret || this.configService.get('MICROSOFT_CLIENT_SECRET');
    const redirectUri = credentials?.redirectUri || this.configService.get('MICROSOFT_REDIRECT_URI');

    const response = await axios.post(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiryDate: Date.now() + response.data.expires_in * 1000,
    };
  }
}

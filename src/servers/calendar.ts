#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { google } from 'googleapis';
import { getRequiredEnv } from '../utils/env.js';
import { CalendarEvent, CalendarAttendee, Calendar } from '../types/index.js';

class GoogleCalendarMCPServer {
  private calendar: any;
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'google-calendar-mcp-server',
        version: '1.0.0',
        description: 'MCP server for Google Calendar integration on iPhone'
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupCalendarAuth();
    this.setupHandlers();
  }

  private setupCalendarAuth() {
    try {
      const clientId = getRequiredEnv('GOOGLE_CLIENT_ID');
      const clientSecret = getRequiredEnv('GOOGLE_CLIENT_SECRET');
      const refreshToken = getRequiredEnv('GOOGLE_REFRESH_TOKEN');

      const oAuth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'urn:ietf:wg:oauth:2.0:oob'
      );

      oAuth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      this.calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    } catch (error) {
      console.error('Google Calendar authentication setup failed:', error);
      throw error;
    }
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getTools(),
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_events':
            return await this.listEvents(args as any);
          case 'get_event':
            return await this.getEvent(args as any);
          case 'create_event':
            return await this.createEvent(args as any);
          case 'update_event':
            return await this.updateEvent(args as any);
          case 'delete_event':
            return await this.deleteEvent(args as any);
          case 'list_calendars':
            return await this.listCalendars();
          case 'get_calendar':
            return await this.getCalendar(args as any);
          case 'create_calendar':
            return await this.createCalendar(args as any);
          case 'search_events':
            return await this.searchEvents(args as any);
          case 'get_busy_times':
            return await this.getBusyTimes(args as any);
          case 'quick_add_event':
            return await this.quickAddEvent(args as any);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'list_events',
        description: 'List calendar events',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: {
              type: 'string',
              description: 'Calendar ID (default: primary)',
            },
            timeMin: {
              type: 'string',
              description: 'Start time (ISO 8601 format)',
            },
            timeMax: {
              type: 'string',
              description: 'End time (ISO 8601 format)',
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of events to return (default: 10)',
            },
            orderBy: {
              type: 'string',
              enum: ['startTime', 'updated'],
              description: 'Sort order',
            },
          },
        },
      },
      {
        name: 'get_event',
        description: 'Get a specific calendar event',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: {
              type: 'string',
              description: 'Calendar ID (default: primary)',
            },
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
          },
          required: ['eventId'],
        },
      },
      {
        name: 'create_event',
        description: 'Create a new calendar event',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: {
              type: 'string',
              description: 'Calendar ID (default: primary)',
            },
            summary: {
              type: 'string',
              description: 'Event title',
            },
            description: {
              type: 'string',
              description: 'Event description',
            },
            location: {
              type: 'string',
              description: 'Event location',
            },
            startDateTime: {
              type: 'string',
              description: 'Start date and time (ISO 8601 format)',
            },
            endDateTime: {
              type: 'string',
              description: 'End date and time (ISO 8601 format)',
            },
            timeZone: {
              type: 'string',
              description: 'Time zone (default: system timezone)',
            },
            attendees: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  displayName: { type: 'string' },
                },
                required: ['email'],
              },
              description: 'List of attendees',
            },
          },
          required: ['summary', 'startDateTime', 'endDateTime'],
        },
      },
      {
        name: 'update_event',
        description: 'Update an existing calendar event',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: {
              type: 'string',
              description: 'Calendar ID (default: primary)',
            },
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
            summary: {
              type: 'string',
              description: 'Event title',
            },
            description: {
              type: 'string',
              description: 'Event description',
            },
            location: {
              type: 'string',
              description: 'Event location',
            },
            startDateTime: {
              type: 'string',
              description: 'Start date and time (ISO 8601 format)',
            },
            endDateTime: {
              type: 'string',
              description: 'End date and time (ISO 8601 format)',
            },
            timeZone: {
              type: 'string',
              description: 'Time zone',
            },
            attendees: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  displayName: { type: 'string' },
                },
                required: ['email'],
              },
              description: 'List of attendees',
            },
          },
          required: ['eventId'],
        },
      },
      {
        name: 'delete_event',
        description: 'Delete a calendar event',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: {
              type: 'string',
              description: 'Calendar ID (default: primary)',
            },
            eventId: {
              type: 'string',
              description: 'Event ID',
            },
          },
          required: ['eventId'],
        },
      },
      {
        name: 'list_calendars',
        description: 'List all calendars',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_calendar',
        description: 'Get calendar details',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: {
              type: 'string',
              description: 'Calendar ID',
            },
          },
          required: ['calendarId'],
        },
      },
      {
        name: 'create_calendar',
        description: 'Create a new calendar',
        inputSchema: {
          type: 'object',
          properties: {
            summary: {
              type: 'string',
              description: 'Calendar name',
            },
            description: {
              type: 'string',
              description: 'Calendar description',
            },
            timeZone: {
              type: 'string',
              description: 'Calendar time zone',
            },
          },
          required: ['summary'],
        },
      },
      {
        name: 'search_events',
        description: 'Search for events',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: {
              type: 'string',
              description: 'Calendar ID (default: primary)',
            },
            query: {
              type: 'string',
              description: 'Search query',
            },
            timeMin: {
              type: 'string',
              description: 'Start time (ISO 8601 format)',
            },
            timeMax: {
              type: 'string',
              description: 'End time (ISO 8601 format)',
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of results (default: 10)',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_busy_times',
        description: 'Get busy/free time information',
        inputSchema: {
          type: 'object',
          properties: {
            calendars: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of calendar IDs to check',
            },
            timeMin: {
              type: 'string',
              description: 'Start time (ISO 8601 format)',
            },
            timeMax: {
              type: 'string',
              description: 'End time (ISO 8601 format)',
            },
          },
          required: ['calendars', 'timeMin', 'timeMax'],
        },
      },
      {
        name: 'quick_add_event',
        description: 'Quick add event using natural language',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: {
              type: 'string',
              description: 'Calendar ID (default: primary)',
            },
            text: {
              type: 'string',
              description: 'Natural language event description (e.g., "Lunch with John tomorrow at 12pm")',
            },
          },
          required: ['text'],
        },
      },
    ];
  }

  private async listEvents(args: {
    calendarId?: string;
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    orderBy?: string;
  }) {
    const {
      calendarId = 'primary',
      timeMin,
      timeMax,
      maxResults = 10,
      orderBy = 'startTime',
    } = args;

    const response = await this.calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      maxResults,
      singleEvents: true,
      orderBy,
    });

    const events = response.data.items || [];
    const calendarEvents: CalendarEvent[] = events.map((event: any) => this.parseCalendarEvent(event));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(calendarEvents, null, 2),
        },
      ],
    };
  }

  private async getEvent(args: { calendarId?: string; eventId: string }) {
    const { calendarId = 'primary', eventId } = args;

    const response = await this.calendar.events.get({
      calendarId,
      eventId,
    });

    const event = this.parseCalendarEvent(response.data);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(event, null, 2),
        },
      ],
    };
  }

  private async createEvent(args: {
    calendarId?: string;
    summary: string;
    description?: string;
    location?: string;
    startDateTime: string;
    endDateTime: string;
    timeZone?: string;
    attendees?: Array<{ email: string; displayName?: string }>;
  }) {
    const {
      calendarId = 'primary',
      summary,
      description,
      location,
      startDateTime,
      endDateTime,
      timeZone,
      attendees,
    } = args;

    const event: any = {
      summary,
      description,
      location,
      start: {
        dateTime: startDateTime,
        timeZone,
      },
      end: {
        dateTime: endDateTime,
        timeZone,
      },
      attendees: attendees?.map(a => ({
        email: a.email,
        displayName: a.displayName,
      })),
    };

    const response = await this.calendar.events.insert({
      calendarId,
      resource: event,
    });

    const createdEvent = this.parseCalendarEvent(response.data);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(createdEvent, null, 2),
        },
      ],
    };
  }

  private async updateEvent(args: {
    calendarId?: string;
    eventId: string;
    summary?: string;
    description?: string;
    location?: string;
    startDateTime?: string;
    endDateTime?: string;
    timeZone?: string;
    attendees?: Array<{ email: string; displayName?: string }>;
  }) {
    const {
      calendarId = 'primary',
      eventId,
      summary,
      description,
      location,
      startDateTime,
      endDateTime,
      timeZone,
      attendees,
    } = args;

    const event: any = {};
    if (summary) event.summary = summary;
    if (description) event.description = description;
    if (location) event.location = location;
    if (startDateTime) {
      event.start = {
        dateTime: startDateTime,
        timeZone,
      };
    }
    if (endDateTime) {
      event.end = {
        dateTime: endDateTime,
        timeZone,
      };
    }
    if (attendees) {
      event.attendees = attendees.map(a => ({
        email: a.email,
        displayName: a.displayName,
      }));
    }

    const response = await this.calendar.events.update({
      calendarId,
      eventId,
      resource: event,
    });

    const updatedEvent = this.parseCalendarEvent(response.data);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(updatedEvent, null, 2),
        },
      ],
    };
  }

  private async deleteEvent(args: { calendarId?: string; eventId: string }) {
    const { calendarId = 'primary', eventId } = args;

    await this.calendar.events.delete({
      calendarId,
      eventId,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Event ${eventId} deleted successfully`,
        },
      ],
    };
  }

  private async listCalendars() {
    const response = await this.calendar.calendarList.list();
    const calendars = response.data.items || [];

    const calendarList: Calendar[] = calendars.map((cal: any) => ({
      id: cal.id,
      summary: cal.summary,
      description: cal.description,
      primary: cal.primary,
      accessRole: cal.accessRole,
      backgroundColor: cal.backgroundColor,
      foregroundColor: cal.foregroundColor,
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(calendarList, null, 2),
        },
      ],
    };
  }

  private async getCalendar(args: { calendarId: string }) {
    const response = await this.calendar.calendars.get({
      calendarId: args.calendarId,
    });

    const calendar: Calendar = {
      id: response.data.id,
      summary: response.data.summary,
      description: response.data.description,
      accessRole: 'owner', // Default for get method
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(calendar, null, 2),
        },
      ],
    };
  }

  private async createCalendar(args: { summary: string; description?: string; timeZone?: string }) {
    const { summary, description, timeZone } = args;

    const calendar = {
      summary,
      description,
      timeZone,
    };

    const response = await this.calendar.calendars.insert({
      resource: calendar,
    });

    const createdCalendar: Calendar = {
      id: response.data.id,
      summary: response.data.summary,
      description: response.data.description,
      accessRole: 'owner',
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(createdCalendar, null, 2),
        },
      ],
    };
  }

  private async searchEvents(args: {
    calendarId?: string;
    query: string;
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
  }) {
    const {
      calendarId = 'primary',
      query,
      timeMin,
      timeMax,
      maxResults = 10,
    } = args;

    const response = await this.calendar.events.list({
      calendarId,
      q: query,
      timeMin,
      timeMax,
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    const calendarEvents: CalendarEvent[] = events.map((event: any) => this.parseCalendarEvent(event));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(calendarEvents, null, 2),
        },
      ],
    };
  }

  private async getBusyTimes(args: {
    calendars: string[];
    timeMin: string;
    timeMax: string;
  }) {
    const { calendars, timeMin, timeMax } = args;

    const response = await this.calendar.freebusy.query({
      resource: {
        timeMin,
        timeMax,
        items: calendars.map(id => ({ id })),
      },
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private async quickAddEvent(args: { calendarId?: string; text: string }) {
    const { calendarId = 'primary', text } = args;

    const response = await this.calendar.events.quickAdd({
      calendarId,
      text,
    });

    const event = this.parseCalendarEvent(response.data);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(event, null, 2),
        },
      ],
    };
  }

  private parseCalendarEvent(data: any): CalendarEvent {
    return {
      id: data.id,
      summary: data.summary || '',
      description: data.description,
      start: {
        dateTime: data.start?.dateTime,
        date: data.start?.date,
        timeZone: data.start?.timeZone,
      },
      end: {
        dateTime: data.end?.dateTime,
        date: data.end?.date,
        timeZone: data.end?.timeZone,
      },
      attendees: data.attendees?.map((attendee: any) => ({
        email: attendee.email,
        displayName: attendee.displayName,
        responseStatus: attendee.responseStatus,
        organizer: attendee.organizer,
      })),
      location: data.location,
      status: data.status,
      htmlLink: data.htmlLink,
      created: data.created,
      updated: data.updated,
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Google Calendar MCP server running on stdio');
  }
}

const server = new GoogleCalendarMCPServer();
server.run().catch(console.error);
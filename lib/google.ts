import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
];

export function getOAuthClient(): OAuth2Client {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getAuthUrl(client: OAuth2Client): string {
  return client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
}

export function getAuthenticatedClient(tokens: object): OAuth2Client {
  const client = getOAuthClient();
  client.setCredentials(tokens);
  return client;
}

export async function getClientFromCookies(
  cookieValue: string | null
): Promise<OAuth2Client | null> {
  if (!cookieValue) return null;
  try {
    const tokens = JSON.parse(decodeURIComponent(cookieValue));
    return getAuthenticatedClient(tokens);
  } catch {
    return null;
  }
}

// Google Sheets helpers
export async function readSheet(
  auth: OAuth2Client,
  spreadsheetId: string,
  range: string
) {
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  return res.data.values ?? [];
}

export async function writeSheet(
  auth: OAuth2Client,
  spreadsheetId: string,
  range: string,
  values: unknown[][]
) {
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

export async function appendSheet(
  auth: OAuth2Client,
  spreadsheetId: string,
  range: string,
  values: unknown[][]
) {
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

// Google Calendar helpers
export async function getUpcomingEvents(
  auth: OAuth2Client,
  maxResults = 20
) {
  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: "startTime",
  });
  return res.data.items ?? [];
}

export async function createCalendarEvent(
  auth: OAuth2Client,
  event: {
    summary: string;
    description?: string;
    start: string;
    end: string;
  }
) {
  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.start, timeZone: "America/Chicago" },
      end: { dateTime: event.end, timeZone: "America/Chicago" },
    },
  });
  return res.data;
}

// Gmail helpers
export async function getRecentEmails(auth: OAuth2Client, maxResults = 20) {
  const gmail = google.gmail({ version: "v1", auth });

  const list = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    q: "is:unread OR newer_than:2d",
  });

  const messages = list.data.messages ?? [];

  const emails = await Promise.all(
    messages.map(async (msg) => {
      const full = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "Date"],
      });

      const headers = full.data.payload?.headers ?? [];
      const get = (name: string) =>
        headers.find((h) => h.name === name)?.value ?? "";

      const snippet = full.data.snippet ?? "";

      return {
        id: msg.id!,
        subject: get("Subject"),
        from: get("From"),
        date: get("Date"),
        snippet,
      };
    })
  );

  return emails;
}

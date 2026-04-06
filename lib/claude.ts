import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function askClaude(prompt: string): Promise<string> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });
  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}

export async function prioritizeTodos(
  todos: { id: string; text: string; tab: string }[]
): Promise<{ id: string; priority: number; reason: string }[]> {
  const prompt = `You are an assistant for a life insurance broker. Given these to-do items from various sections of their work hub, rank each one by urgency and importance (1 = highest priority). Return ONLY valid JSON as an array with fields: id, priority (number), reason (string).

To-dos:
${JSON.stringify(todos, null, 2)}`;

  const text = await askClaude(prompt);
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    return [];
  }
}

export async function draftFollowUpEmail(context: {
  clientName: string;
  lastContact: string;
  notes: string;
}): Promise<string> {
  const prompt = `Draft a professional follow-up email for a life insurance broker named Conor McKenna. Keep it brief and warm.

Client: ${context.clientName}
Last contact: ${context.lastContact}
Notes: ${context.notes}`;
  return askClaude(prompt);
}

export async function extractTasksFromEmails(
  emails: { id: string; subject: string; from: string; date: string; snippet: string }[]
): Promise<{ id: string; text: string; from: string; subject: string }[]> {
  const prompt = `You are an assistant for Conor McKenna, a life insurance broker. Review these recent emails and extract any items that require action on his part — replies needed, follow-ups, deadlines, requests, etc. Ignore newsletters, automated notifications, and anything that doesn't need a response.

Return ONLY valid JSON as an array with fields: id (use the email id), text (the action item, written as a clear to-do), from (sender name/email), subject (email subject). If no action is needed for an email, omit it.

Emails:
${JSON.stringify(emails, null, 2)}`;

  const text = await askClaude(prompt);
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    return [];
  }
}

export async function summarizeCommissions(data: unknown[][]): Promise<string> {
  const prompt = `Summarize this commission data for a life insurance broker. Highlight totals, top carriers, and any anomalies. Be concise.

Data (rows):
${JSON.stringify(data)}`;
  return askClaude(prompt);
}

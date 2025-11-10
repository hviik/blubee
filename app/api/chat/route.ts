import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { SYSTEM_PROMPT } from '@/app/config/chat';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const result = await streamText({
      model: openai('gpt-5-nano-2025-08-07'),
      system: SYSTEM_PROMPT,
      messages,
    });

    return result.toTextStreamResponse({
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    });

  } catch (err: any) {
    console.error('Chat API error:', err);
    return Response.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

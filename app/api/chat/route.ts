import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { SYSTEM_PROMPT } from '@/app/workers/chat';

/**
 * Use Edge runtime for faster streaming.
 */
export const runtime = 'edge';

/**
 * Allow longer responses (up to 60 seconds).
 */
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Validate the request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Stream the text from OpenAI (GPT-5 Nano)
    const result = await streamText({
      model: openai('gpt-5-nano-2025-08-07'),
      system: SYSTEM_PROMPT,
      messages,
    });

    // Send the response as a streaming text stream
    return result.toTextStreamResponse();

  } catch (err: any) {
    console.error('Chat API error:', err);
    return Response.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

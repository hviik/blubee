import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { SYSTEM_PROMPT } from '@/app/config/chat';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), { status: 400 });
    }

    const result = await streamText({
      model: openai('gpt-5-nano-2025-08-07'),
      system: SYSTEM_PROMPT,
      messages,
    });

    // Use Server-Sent Events (SSE) format for more reliable streaming on Vercel
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial connection message
          controller.enqueue(encoder.encode('data: {"type":"start"}\n\n'));
          
          // Stream text chunks as they arrive
          for await (const chunk of result.textStream) {
            // Format as SSE: data: <content>\n\n
            const data = JSON.stringify({ type: 'chunk', content: chunk });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
          
          // Send completion message
          controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
        } catch (err) {
          const error = JSON.stringify({ type: 'error', error: err instanceof Error ? err.message : 'Unknown error' });
          controller.enqueue(encoder.encode(`data: ${error}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Accel-Buffering': 'no',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
      },
    });
  } catch (err: any) {
    console.error('Chat API error:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

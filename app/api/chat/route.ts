// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { MODEL, SYSTEM_PROMPT, API_URL } from '@/app/workers/chat';

export const runtime = 'nodejs'; // ✅ important — enables real streaming

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const fullMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ];

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY is missing');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    // 🔥 Call OpenAI with streaming enabled
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: fullMessages,
        stream: true,
      }),
    });

    if (!resp.ok || !resp.body) {
      const errText = await resp.text();
      console.error('OpenAI error:', resp.status, errText);
      return NextResponse.json({ error: 'OpenAI request failed' }, { status: resp.status });
    }

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    // 🔥 Stream tokens to client as they arrive
    const stream = new ReadableStream({
      async start(controller) {
        const reader = resp.body!.getReader();
        let partial = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            partial += decoder.decode(value, { stream: true });

            const lines = partial.split('\n');
            partial = lines.pop() || ''; // save incomplete line

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data:')) continue;

              const data = trimmed.replace(/^data:\s*/, '');
              if (data === '[DONE]') {
                controller.close();
                return;
              }

              try {
                const json = JSON.parse(data);
                const text = json?.choices?.[0]?.delta?.content;
                if (text) controller.enqueue(encoder.encode(text));
              } catch {
                // ignore bad JSON lines
              }
            }
          }
        } catch (err) {
          console.error('Stream error:', err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Transfer-Encoding': 'chunked',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { MODEL, SYSTEM_PROMPT, API_URL } from '@/app/workers/chat';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    // Validate messages array
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Build messages with system prompt
    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages
    ];

    const apiKey = process.env.OPEN_AI_KEY;
    
    if (!apiKey) {
      console.error('OPEN_AI_KEY is not set');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Call NanoGPT API
    const resp = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: fullMessages,
        stream: true
      })
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('NanoGPT API error:', resp.status, errorText);
      return NextResponse.json(
        { error: `API error: ${resp.status}` },
        { status: resp.status }
      );
    }

    if (!resp.body) {
      return NextResponse.json(
        { error: 'No response body' },
        { status: 500 }
      );
    }

    // Create readable stream for SSE
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const readableStream = new ReadableStream({
      async start(controller) {
        const reader = resp.body!.getReader();
        let buffer = '';
        let isClosed = false;

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // Process any remaining buffer before closing
              if (buffer.trim()) {
                const lines = buffer.split('\n');
                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed || !trimmed.startsWith('data: ')) continue;
                  
                  const data = trimmed.slice(6);
                  if (data === '[DONE]') continue;

                  try {
                    const json = JSON.parse(data);
                    const content = json?.choices?.[0]?.delta?.content;
                    
                    if (content && !isClosed) {
                      controller.enqueue(encoder.encode(content));
                    }
                  } catch (e) {
                    // Ignore parse errors for incomplete data
                  }
                }
              }
              
              if (!isClosed) {
                controller.close();
                isClosed = true;
              }
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            
            // Keep the last incomplete line in buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;
              
              const data = trimmed.slice(6);
              if (data === '[DONE]') continue;

              try {
                const json = JSON.parse(data);
                const content = json?.choices?.[0]?.delta?.content;
                
                if (content && !isClosed) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          if (!isClosed) {
            try {
              controller.error(error);
            } catch {
              // Controller already closed
            }
          }
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
import { SYSTEM_PROMPT } from '@/app/config/chat';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, userName, currency } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), { status: 400 });
    }

    // Get OpenAI API key from environment
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Prepare messages with personalized system prompt
    let systemPrompt = SYSTEM_PROMPT;
    
    // Only add user's name after the first message (so blu introduces itself first)
    const isFirstMessage = messages.length === 1;
    
    if (userName && !isFirstMessage) {
      // Add user's name to system prompt so AI knows how to address them
      systemPrompt += `\n\nIMPORTANT: The user's name is ${userName}. Address them by their name naturally in your responses when appropriate throughout the conversation.`;
    }
    
    // Add currency information to system prompt
    if (currency && currency.code) {
      systemPrompt += `\n\nIMPORTANT CURRENCY CONTEXT: The user's local currency is ${currency.name} (${currency.code}, symbol: ${currency.symbol}). ALWAYS use ${currency.code} when mentioning prices, costs, or budgets throughout this entire conversation. For example, if discussing trip costs, say "${currency.symbol}1,000" or "${currency.code} 1,000", NOT any other currency. Remember this currency preference for ALL responses in this conversation.`;
    }
    
    const systemMessage = { role: 'system', content: systemPrompt };
    const allMessages = [systemMessage, ...messages.filter(m => m.role !== 'system')];

    // Call OpenAI API directly with streaming (matching FastAPI pattern)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using gpt-4o-mini like your FastAPI code
        messages: allMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    // Create SSE stream that forwards OpenAI's stream (matching FastAPI pattern)
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response body');
          }

          let buffer = '';
          
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            // Decode chunk
            buffer += decoder.decode(value, { stream: true });
            
            // Process complete lines
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
              if (!line.trim() || !line.startsWith('data: ')) continue;
              
              const data = line.slice(6); // Remove 'data: ' prefix
              
              if (data === '[DONE]') {
                // Send [DONE] to client (matching FastAPI pattern)
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                continue;
              }

              try {
                const chunk = JSON.parse(data);
                
                // Extract content from OpenAI's format (matching FastAPI pattern)
                if (chunk.choices && chunk.choices.length > 0) {
                  const delta = chunk.choices[0].delta;
                  if (delta?.content) {
                    // Forward chunk in same format as FastAPI
                    const sseData = JSON.stringify({ content: delta.content });
                    controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
                  }
                }
              } catch (e) {
                // Skip invalid JSON
                continue;
              }
            }
          }

          // Send final [DONE] if not already sent
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (err) {
          const error = JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' });
          controller.enqueue(encoder.encode(`data: ${error}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
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

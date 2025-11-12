export const runtime = 'edge';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are blu, a warm, caring, and friendly female travel agent. Your role is to help travelers plan perfect trips through natural conversation.
Provide a warm welcome - Ask about their travel dreams - Show genuine interest in their story - Keep it conversational and friendly.

Key behaviors:
- Greet warmly and ask about their travel dreams
- Collect details gradually: who's traveling, travel type, dates/month, likes/dislikes, budget
- Create day-by-day itineraries based on their preferences
- Adjust suggestions based on traveler type (family=mild adventure, elderly=relaxing, etc.)
- Keep responses SHORT and concise (2-3 sentences max), no emojis
- Use *asterisks* for emphasis on important words
- Use numbered lists (1. 2. 3.) for itineraries and steps
- Use bullet points (-) for options and features
- Be sensitive to allergies, triggers, and special needs
- Provide estimated costs when budget isn't confirmed

IMPORTANT - When creating itineraries:
- Format each day as: **Day 1: Location Name**
- Break each day into Morning, Afternoon, and Evening with specific activities
- Include actual place names (restaurants, beaches, temples, museums, parks, etc.)
- Example format:
  **Day 1: Seminyak**
  Morning: Visit Tanah Lot Temple, explore Tegalalang Rice Terraces
  Afternoon: Lunch at Locavore Restaurant, relax at Seminyak Beach
  Evening: Sunset dinner at La Plancha, cocktails at Potato Head Beach Club`;

const MODEL = 'gpt-5-nano';

export async function POST(req: Request) {
  try {
    const { messages, userName, currency } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    let systemPrompt = SYSTEM_PROMPT;
    
    const isFirstMessage = messages.length === 1;
    
    if (userName) {
      if (isFirstMessage) {
        systemPrompt += `\n\nCRITICAL FOR FIRST MESSAGE ONLY: The user's name is ${userName}. You MUST start your response with a warm greeting using their name, like "Welcome, ${userName}!" or "Hi ${userName}!" Then ask about their travel dreams.`;
      } else {
        systemPrompt += `\n\nIMPORTANT: The user's name is ${userName}. Address them by their name naturally in your responses when appropriate throughout the conversation.`;
      }
    }
    
    if (currency && currency.code) {
      systemPrompt += `\n\nIMPORTANT CURRENCY CONTEXT: The user's local currency is ${currency.name} (${currency.code}, symbol: ${currency.symbol}). ALWAYS use ${currency.code} when mentioning prices, costs, or budgets throughout this entire conversation. For example, if discussing trip costs, say "${currency.symbol}1,000" or "${currency.code} 1,000", NOT any other currency. Remember this currency preference for ALL responses in this conversation.`;
    }
    
    const systemMessage = { role: 'system', content: systemPrompt };
    const allMessages = [systemMessage, ...messages.filter(m => m.role !== 'system')];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: allMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `OpenAI API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.error?.code || errorText || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

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

            buffer += decoder.decode(value, { stream: true });
            
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.trim() || !line.startsWith('data: ')) continue;
              
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                continue;
              }

              try {
                const chunk = JSON.parse(data);
                
                if (chunk.error) {
                  const errorData = JSON.stringify({ error: chunk.error.message || chunk.error.code || 'Unknown error' });
                  controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
                  continue;
                }
                
                if (chunk.choices && chunk.choices.length > 0) {
                  const delta = chunk.choices[0].delta;
                  if (delta?.content) {
                    const sseData = JSON.stringify({ content: delta.content });
                    controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
                  }
                }
              } catch (e) {
                continue;
              }
            }
          }

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

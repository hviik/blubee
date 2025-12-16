import { auth, currentUser } from '@clerk/nextjs/server';
import { streamAgent, ConversationMessage } from '@/lib/langchain/agent';
import { ensureUserProfile } from '@/lib/ensureUserProfile';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, userName: providedUserName, currency } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get user authentication
    const { userId } = await auth();
    let userName = providedUserName;

    // If authenticated, ensure profile exists and get user info
    if (userId) {
      const user = await currentUser();
      await ensureUserProfile(
        userId,
        user?.emailAddresses?.[0]?.emailAddress,
        user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || undefined
      );
      
      if (!userName) {
        userName = user?.firstName || user?.fullName?.split(' ')[0] || null;
      }
    }

    // Convert messages to the format expected by the agent
    const conversationMessages: ConversationMessage[] = messages.map((m: any) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content
    }));

    // Create streaming response
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const agentStream = streamAgent(conversationMessages, {
            userId: userId || undefined,
            userName: userName || undefined,
            currency: currency || undefined
          });

          for await (const chunk of agentStream) {
            if (chunk.type === 'token' && chunk.content) {
              const sseData = JSON.stringify({ content: chunk.content });
              controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
            } else if (chunk.type === 'tool_result') {
              const sseData = JSON.stringify({ toolResult: chunk.content });
              controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
            } else if (chunk.type === 'done') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            }
          }
        } catch (err) {
          console.error('Agent stream error:', err);
          const error = JSON.stringify({ 
            error: err instanceof Error ? err.message : 'Unknown error' 
          });
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
    console.error('Agent API error:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


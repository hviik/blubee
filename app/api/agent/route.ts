import { auth, currentUser } from '@clerk/nextjs/server';
import { streamAgent, ConversationMessage } from '@/lib/langchain/agent';
import { ensureUserProfile } from '@/lib/ensureUserProfile';
import { supabaseAdmin } from '@/lib/supabaseServer';
import {
  CurrencyContext,
  resolveCurrencyContextSync,
  validateCurrencyInRequest,
  autoInjectCurrencyContext,
  toISO4217,
  toISO3166,
  getCurrencyMetadata,
  DEFAULT_CURRENCY,
  DEFAULT_COUNTRY,
} from '@/lib/currency';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/agent
 * 
 * Main agent API endpoint with enforced currency context.
 * 
 * Request body MUST include:
 * - messages: Array of conversation messages
 * - currency: ISO-4217 currency code (e.g., "USD", "EUR", "INR")
 * - country: ISO-3166-1 alpha-2 country code (e.g., "US", "DE", "IN")
 * 
 * For backward compatibility:
 * - If currency/country are missing, they will be auto-injected with a warning
 * - Future versions will reject requests without currency context
 */
export async function POST(req: Request) {
  try {
    const headersList = req.headers;
    const requestBody = await req.json();

    // Extract and validate messages
    const { messages, userName: providedUserName } = requestBody;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get user authentication
    const { userId } = await auth();
    let userName = providedUserName;
    let storedCurrencyPreference: { currency?: string; country?: string } | null = null;

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

      // Fetch user's stored currency preference
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('preferred_currency, preferred_country, currency_source')
        .eq('id', userId)
        .single();

      if (profile?.preferred_currency && profile.currency_source === 'user_override') {
        storedCurrencyPreference = {
          currency: profile.preferred_currency,
          country: profile.preferred_country || undefined,
        };
      }
    }

    // Resolve currency context with priority:
    // 1. Request body currency (explicit)
    // 2. User stored preference
    // 3. Geo-detection from headers
    // 4. Default fallback
    let currencyContext: CurrencyContext;
    const warnings: string[] = [];

    // Check if request includes explicit currency
    if (requestBody.currency && typeof requestBody.currency === 'string') {
      const currency = toISO4217(requestBody.currency);
      if (currency) {
        const country = requestBody.country 
          ? toISO3166(requestBody.country) || DEFAULT_COUNTRY
          : DEFAULT_COUNTRY;
        const metadata = getCurrencyMetadata(currency);
        
        currencyContext = {
          currency,
          country,
          source: 'user_override',
          symbol: metadata.symbol,
          name: metadata.name,
          resolvedAt: new Date().toISOString(),
        };
      } else {
        warnings.push(`Invalid currency code in request: ${requestBody.currency}, using auto-detection`);
        currencyContext = resolveCurrencyContextSync(headersList, storedCurrencyPreference);
      }
    } else if (requestBody.currencyContext && typeof requestBody.currencyContext === 'object') {
      // Legacy format support - currencyContext object
      const ctx = requestBody.currencyContext;
      const currency = ctx.code ? toISO4217(ctx.code) : null;
      
      if (currency) {
        const metadata = getCurrencyMetadata(currency);
        currencyContext = {
          currency,
          country: DEFAULT_COUNTRY,
          source: 'user_override',
          symbol: ctx.symbol || metadata.symbol,
          name: ctx.name || metadata.name,
          resolvedAt: new Date().toISOString(),
        };
        warnings.push('Using legacy currencyContext format - please update to use currency/country fields');
      } else {
        currencyContext = resolveCurrencyContextSync(headersList, storedCurrencyPreference);
        warnings.push('Request missing valid currency - auto-injected from geo-detection');
      }
    } else {
      // Auto-inject currency from geo-detection or stored preference
      currencyContext = resolveCurrencyContextSync(headersList, storedCurrencyPreference);
      warnings.push(`Request missing currency - auto-injected: ${currencyContext.currency} (source: ${currencyContext.source})`);
    }

    // Log warnings for monitoring
    if (warnings.length > 0) {
      console.warn('[Agent API] Currency warnings:', {
        path: '/api/agent',
        userId: userId || 'anonymous',
        warnings,
        resolvedCurrency: currencyContext.currency,
        resolvedSource: currencyContext.source,
      });
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
          // Pass canonical currency context to agent
          const agentStream = streamAgent(conversationMessages, {
            userId: userId || undefined,
            userName: userName || undefined,
            currencyContext,
          });

          for await (const chunk of agentStream) {
            if (chunk.type === 'token' && chunk.content) {
              const sseData = JSON.stringify({ content: chunk.content });
              controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
            } else if (chunk.type === 'tool_call') {
              const sseData = JSON.stringify({ toolCall: chunk.content });
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
        'X-Currency-Code': currencyContext.currency,
        'X-Currency-Country': currencyContext.country,
        'X-Currency-Source': currencyContext.source,
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

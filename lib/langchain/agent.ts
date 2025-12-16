import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { allTools } from "./tools";

// System prompt for blu - the travel agent
const SYSTEM_PROMPT = `You are blu, a warm, caring, and friendly female travel agent. Your role is to help travelers plan perfect trips through natural conversation.

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
  Evening: Sunset dinner at La Plancha, cocktails at Potato Head Beach Club

TOOLS USAGE:
- Use 'save_trip' when the user confirms they want to save their itinerary or says "save this trip"
- Use 'get_user_trips' when user asks about their saved/past trips
- Use 'add_to_wishlist' when user wants to save a destination for later consideration
- Use 'get_wishlist' when user asks about their saved destinations/wishlist
- Use 'search_destinations' to find destinations matching user criteria
- Use 'get_destination_info' to get detailed info about a specific place
- Use 'convert_currency' when user asks about prices in different currencies

Always confirm with the user before saving trips. When tools return success, share the good news naturally.`;

// Create the model with tools bound
function createModel() {
  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.7,
    streaming: true,
  });

  return model.bindTools(allTools);
}

// Define the function that determines whether to continue or not
function shouldContinue(state: typeof MessagesAnnotation.State) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;

  // If the LLM makes a tool call, then we route to the "tools" node
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  // Otherwise, we stop (reply to the user)
  return END;
}

// Define the function that calls the model
async function callModel(state: typeof MessagesAnnotation.State) {
  const model = createModel();
  const messages = state.messages;
  const response = await model.invoke(messages);
  return { messages: [response] };
}

// Create the graph
function createGraph() {
  const toolNode = new ToolNode(allTools);

  const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge(START, "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

  return workflow.compile();
}

// Message history type for conversation memory
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Convert simple messages to LangChain messages
function convertToLangChainMessages(
  messages: ConversationMessage[], 
  systemPrompt: string
): BaseMessage[] {
  const langChainMessages: BaseMessage[] = [
    new SystemMessage(systemPrompt)
  ];

  for (const msg of messages) {
    if (msg.role === 'user') {
      langChainMessages.push(new HumanMessage(msg.content));
    } else if (msg.role === 'assistant') {
      langChainMessages.push(new AIMessage(msg.content));
    }
    // Skip system messages as we already added the system prompt
  }

  return langChainMessages;
}

// Build system prompt with user context
function buildSystemPrompt(userName?: string, currency?: { code: string; symbol: string; name: string }): string {
  let prompt = SYSTEM_PROMPT;

  if (userName) {
    prompt += `\n\nThe user's name is ${userName}. Address them warmly by name when appropriate.`;
  }

  if (currency?.code) {
    prompt += `\n\nIMPORTANT: The user's preferred currency is ${currency.name} (${currency.code}, symbol: ${currency.symbol}). ALWAYS use ${currency.code} when mentioning prices or budgets.`;
  }

  return prompt;
}

// Main agent invocation function (non-streaming)
export async function invokeAgent(
  messages: ConversationMessage[],
  options: {
    userId?: string;
    userName?: string;
    currency?: { code: string; symbol: string; name: string };
  } = {}
): Promise<string> {
  const { userId, userName, currency } = options;
  
  const systemPrompt = buildSystemPrompt(userName, currency);
  const langChainMessages = convertToLangChainMessages(messages, systemPrompt);

  const app = createGraph();

  const result = await app.invoke(
    { messages: langChainMessages },
    { 
      configurable: { 
        userId,
        thread_id: userId || 'default'
      } 
    }
  );

  const finalMessage = result.messages[result.messages.length - 1];
  return typeof finalMessage.content === 'string' 
    ? finalMessage.content 
    : JSON.stringify(finalMessage.content);
}

// Streaming agent invocation
export async function* streamAgent(
  messages: ConversationMessage[],
  options: {
    userId?: string;
    userName?: string;
    currency?: { code: string; symbol: string; name: string };
  } = {}
): AsyncGenerator<{ type: 'token' | 'tool_call' | 'tool_result' | 'done'; content: string }> {
  const { userId, userName, currency } = options;
  
  const systemPrompt = buildSystemPrompt(userName, currency);
  const langChainMessages = convertToLangChainMessages(messages, systemPrompt);

  const app = createGraph();

  const stream = await app.stream(
    { messages: langChainMessages },
    { 
      configurable: { 
        userId,
        thread_id: userId || 'default'
      },
      streamMode: "messages"
    }
  );

  let lastContent = '';

  for await (const [message, metadata] of stream) {
    // Check if it's an AI message with content
    if (message._getType() === 'ai') {
      const aiMessage = message as AIMessage;
      
      // Handle tool calls
      if (aiMessage.tool_calls?.length) {
        for (const toolCall of aiMessage.tool_calls) {
          yield {
            type: 'tool_call',
            content: JSON.stringify({ name: toolCall.name, args: toolCall.args })
          };
        }
      }
      
      // Handle text content (streaming tokens)
      if (typeof aiMessage.content === 'string' && aiMessage.content) {
        // Only yield new content (delta)
        if (aiMessage.content.length > lastContent.length) {
          const delta = aiMessage.content.slice(lastContent.length);
          lastContent = aiMessage.content;
          yield { type: 'token', content: delta };
        } else if (aiMessage.content !== lastContent) {
          // Full content replaced
          lastContent = aiMessage.content;
          yield { type: 'token', content: aiMessage.content };
        }
      }
    }
    
    // Handle tool results
    if (message._getType() === 'tool') {
      yield {
        type: 'tool_result',
        content: typeof message.content === 'string' ? message.content : JSON.stringify(message.content)
      };
    }
  }

  yield { type: 'done', content: '' };
}

// Export for use in API route
export { allTools, createGraph };


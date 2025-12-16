import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { allTools } from "./tools";

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

TOOLS USAGE:
- Use 'save_trip' when the user confirms they want to save their itinerary or says "save this trip"
- Use 'get_user_trips' when user asks about their saved/past trips
- Use 'add_to_wishlist' when user wants to save a destination for later consideration
- Use 'get_wishlist' when user asks about their saved destinations/wishlist
- Use 'search_destinations' to find destinations matching user criteria
- Use 'get_destination_info' to get detailed info about a specific place
- Use 'convert_currency' when user asks about prices in different currencies

MAP & ITINERARY TOOLS:
- Use 'create_itinerary_with_map' when creating a COMPLETE trip plan - this automatically geocodes all locations for the map display
- Use 'geocode_locations' if you need to get coordinates for specific places
- Use 'search_nearby_places' to find restaurants, hotels, or attractions near a specific location

CRITICAL: When a user asks you to plan a trip and you have enough details (destination, duration), ALWAYS use the 'create_itinerary_with_map' tool to create the itinerary. This ensures the map shows all locations correctly. After using this tool, present the itinerary nicely in your response.

Always confirm with the user before saving trips. When tools return success, share the good news naturally.`;

function createModel() {
  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.7
  });

  return model.bindTools(allTools);
}

function shouldContinue(state: typeof MessagesAnnotation.State) {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
  if (lastMessage.tool_calls?.length) return "tools";
  return END;
}

async function callModel(state: typeof MessagesAnnotation.State) {
  const model = createModel();
  const response = await model.invoke(state.messages);
  return { messages: [response] };
}

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

export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

function convertToLangChainMessages(
  messages: ConversationMessage[],
  systemPrompt: string
): BaseMessage[] {
  const out: BaseMessage[] = [new SystemMessage(systemPrompt)];

  for (const msg of messages) {
    if (msg.role === "user") out.push(new HumanMessage(msg.content));
    if (msg.role === "assistant") out.push(new AIMessage(msg.content));
  }

  return out;
}

function buildSystemPrompt(
  userName?: string,
  currency?: { code: string; symbol: string; name: string }
) {
  let prompt = SYSTEM_PROMPT;

  if (userName) {
    prompt += `\n\nThe user's name is ${userName}. Address them warmly by name when appropriate.`;
  }

  if (currency?.code) {
    prompt += `\n\nIMPORTANT: The user's preferred currency is ${currency.name} (${currency.code}, symbol: ${currency.symbol}). ALWAYS use ${currency.code} when mentioning prices or budgets.`;
  }

  return prompt;
}

export async function invokeAgent(
  messages: ConversationMessage[],
  options: {
    userId?: string;
    userName?: string;
    currency?: { code: string; symbol: string; name: string };
  } = {}
): Promise<string> {
  const systemPrompt = buildSystemPrompt(options.userName, options.currency);
  const langChainMessages = convertToLangChainMessages(messages, systemPrompt);
  const app = createGraph();

  const result = await app.invoke(
    { messages: langChainMessages },
    {
      configurable: {
        userId: options.userId,
        thread_id: options.userId || "default"
      }
    }
  );

  const finalMessage = result.messages[result.messages.length - 1];
  return typeof finalMessage.content === "string"
    ? finalMessage.content
    : JSON.stringify(finalMessage.content);
}

export async function* streamAgent(
  messages: ConversationMessage[],
  options: {
    userId?: string;
    userName?: string;
    currency?: { code: string; symbol: string; name: string };
  } = {}
): AsyncGenerator<{ type: "token" | "tool_result" | "done"; content: string }> {
  const systemPrompt = buildSystemPrompt(options.userName, options.currency);
  const langChainMessages = convertToLangChainMessages(messages, systemPrompt);
  const app = createGraph();

  const stream = await app.stream(
    { messages: langChainMessages },
    {
      configurable: {
        userId: options.userId,
        thread_id: options.userId || "default"
      },
      streamMode: "updates"
    }
  );

  for await (const update of stream) {
    if (update.agent?.messages) {
      const msg = update.agent.messages.at(-1);
      if (msg && typeof msg.content === "string") {
        yield { type: "token", content: msg.content };
      }
    }

    if (update.tools) {
      yield {
        type: "tool_result",
        content: JSON.stringify(update.tools)
      };
    }
  }

  yield { type: "done", content: "" };
}

export { allTools, createGraph };

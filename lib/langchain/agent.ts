import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { allTools } from "./tools";
import { getAgentDateContext, getCurrentDateContext } from "../utils/dateResolver";

const SYSTEM_PROMPT = `You are blu, a warm, caring, and friendly female travel agent. Your role is to help travelers plan perfect trips through natural conversation.

Key behaviors:
- Greet warmly and ask about their travel dreams
- Collect details gradually: who's traveling, travel type, dates/month, likes/dislikes, budget
- Create day-by-day itineraries based on their preferences
- Adjust suggestions based on traveler type (family=mild adventure, elderly=relaxing, etc.)
- Keep responses SHORT and concise (2-3 sentences max), no emojis
- Be sensitive to allergies, triggers, and special needs
- Provide estimated costs when budget isn't confirmed

IMPORTANT TEXT FORMATTING:
- Do NOT use asterisks (*) or underscores (_) for emphasis - they display as raw characters
- Use plain text without markdown formatting for clean display
- Use numbered lists (1. 2. 3.) for itineraries and steps
- Use bullet points (-) for options and features

TOOLS USAGE:
- Use 'save_trip' when the user confirms they want to save their itinerary or says "save this trip"
- Use 'get_user_trips' when user asks about their saved/past trips
- Use 'add_to_wishlist' when user wants to save a destination for later consideration
- Use 'get_wishlist' when user asks about their saved destinations/wishlist
- Use 'search_destinations' to find destinations matching user criteria
- Use 'get_destination_info' to get detailed info about a specific place
- Use 'convert_currency' when user asks about prices in different currencies

HOTEL BOOKING TOOLS - IMPORTANT:
When a user asks about places to stay, hotels, or accommodations:

1. Use 'search_hotels' tool to find hotels at their destination
2. You MUST have these details before searching:
   - Destination (city or area)
   - Check-in date (YYYY-MM-DD format) - MUST be today or a future date
   - Check-out date (YYYY-MM-DD format) - MUST be after check-in date
3. If user says "budget" or "cheap" or "affordable", set maxPrice to around 100
4. If user says "mid-range", set maxPrice to around 200
5. If user says "luxury" or "high-end", set minPrice to 200

DATE HANDLING - CRITICAL:
- Always use ISO format for dates: YYYY-MM-DD (e.g., 2026-01-20)
- When user says "next month" or "this summer", calculate the actual dates
- NEVER use dates in the past - check against the current date provided below
- If a user's requested date is in the past, politely inform them and ask for a future date

Example: For "3-day trip starting June 5th 2026", calculate:
- checkInDate: "2026-06-05"
- checkOutDate: "2026-06-08"

The tool will return hotel cards that display automatically in the chat. After getting results, provide a brief summary like "I found some great options for you - you can browse through them and click to book."

MAP & ITINERARY TOOLS - CRITICAL:
When a user asks you to plan a trip and you have the destination and duration:

1. ALWAYS use 'create_itinerary_with_map' tool to create the itinerary
2. Include SPECIFIC places for each day with their correct type:
   - 'stays' = hotels, resorts, villas, accommodations
   - 'restaurants' = cafes, restaurants, bars, food spots
   - 'attraction' = temples, beaches, museums, landmarks, viewpoints
   - 'activities' = tours, water sports, hiking, spa, diving
3. Include morning, afternoon, and evening activities for each day
4. After using the tool, present a brief summary (don't repeat all details)

Example places array for a day:
places: [
  { name: "Tanah Lot Temple", type: "attraction" },
  { name: "Warung Babi Guling Ibu Oka", type: "restaurants" },
  { name: "The Mulia Resort", type: "stays" }
]

This ensures the map displays all locations with correct filter categories.

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

  // Add current date context - this is critical for date validation
  const dateContext = getAgentDateContext();
  const fullDateContext = getCurrentDateContext();
  
  prompt += `\n\nCURRENT DATE CONTEXT:
${dateContext}
Current year: ${fullDateContext.currentYear}
Use this to validate all dates - never accept dates before ${fullDateContext.currentDate}.`;

  if (userName) {
    prompt += `\n\nThe user's name is ${userName}. Address them warmly by name when appropriate.`;
  }

  if (currency?.code) {
    prompt += `\n\nIMPORTANT: The user's preferred currency is ${currency.name} (${currency.code}, symbol: ${currency.symbol}). ALWAYS use ${currency.code} when mentioning prices or budgets and when searching for hotels.`;
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

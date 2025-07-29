import { setup_llm } from "@/utils/llm";
import { NextRequest, NextResponse } from "next/server";

// Initialize the LLM once (could be moved to a singleton pattern)
const { app, config } = setup_llm();

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    // Invoke the LangGraph app
    const output = await app.invoke({ messages }, config);

    // Return the last message (the AI response)
    const lastMessage = output.messages[output.messages.length - 1];

    return NextResponse.json({
      content: lastMessage.content,
      role: "assistant",
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}

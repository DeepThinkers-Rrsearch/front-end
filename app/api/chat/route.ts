import { setup_llm } from "@/lib/llm";
import { NextRequest, NextResponse } from "next/server";

const initialAppState = {
  regex_to_e_nfa_used: false,
  e_nfa_to_dfa_used: false,
  dfa_to_minimized_dfa_used: false,
  pda_used: false,
  is_pressed_convert: false,
  latest_input_regex: "",
  latest_input_e_nfa: "",
  latest_input_dfa: "",
  latest_input_pda: "",
  regex_to_e_nfa_transition: "",
  e_nfa_to_dfa_transition: "",
  dfa_to_minimized_dfa_transition: "",
  pda_transition: "",
  selected_model: { name: "Regex-to-ε-NFA" },
};

// Initialize the LLM once (could be moved to a singleton pattern)
const { app, config } = setup_llm(initialAppState);

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

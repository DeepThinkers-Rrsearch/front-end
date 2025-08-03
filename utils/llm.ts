// This should NOT be in page.tsx
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from "@langchain/langgraph";
import { v4 as uuidv4 } from "uuid";
import { appState } from "./store";
import {
  regex_to_e_nfa_prompt_template,
  e_nfa_to_dfa_prompt_template,
  dfa_to_minimized_dfa_prompt_template,
  push_down_automata_prompt_template,
} from "./prompt_templates/prompts";

export const setup_llm = () => {
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  // Create a mutable reference to the app state
  let currentAppState = { ...appState };

  const callModel = async (state: typeof MessagesAnnotation.State) => {
    console.log("Hello State", currentAppState); // Use currentAppState instead of appState

    // Handle regex to ε-NFA hint
    let regex_to_e_nfa_hint = "";
    if (
      !currentAppState.regex_to_e_nfa_used &&
      currentAppState.is_pressed_convert
    ) {
      currentAppState.regex_to_e_nfa_used = true; // Update currentAppState
      regex_to_e_nfa_hint = `\nHere is the converted ε-NFA transition for the regular expression ${
        currentAppState.latest_input_regex || ""
      }:\n${currentAppState.regex_to_e_nfa_transition || ""}`;
    }

    // Handle ε-NFA to DFA hint
    let e_nfa_to_dfa_hint = "";
    if (
      !currentAppState.e_nfa_to_dfa_used &&
      currentAppState.is_pressed_convert
    ) {
      currentAppState.e_nfa_to_dfa_used = true; // Update currentAppState
      e_nfa_to_dfa_hint = `\nHere is the converted DFA transition for the e-NFA ${
        currentAppState.latest_input_e_nfa || ""
      }:\n${currentAppState.e_nfa_to_dfa_transition || ""}`;
    }

    // Handle DFA to minimized DFA hint
    let dfa_to_minimized_dfa_hint = "";
    if (
      !currentAppState.dfa_to_minimized_dfa_used &&
      currentAppState.is_pressed_convert
    ) {
      currentAppState.dfa_to_minimized_dfa_used = true; // Update currentAppState
      dfa_to_minimized_dfa_hint = `\nHere is the minimized DFA transition for the given DFA ${
        currentAppState.latest_input_dfa || ""
      }:\n${currentAppState.dfa_to_minimized_dfa_transition || ""}`;
    }

    // Handle PDA hint
    let push_down_automata_hint = "";
    if (!currentAppState.pda_used && currentAppState.is_pressed_convert) {
      currentAppState.pda_used = true; // Update currentAppState
      push_down_automata_hint = `\nHere is the converted pda transitions for the given context free language string ${
        currentAppState.latest_input_pda || ""
      }:\n${currentAppState.pda_transition || ""}`;
    }

    const selected_model = currentAppState.selected_model; // Use currentAppState
    let prompt;

    // Select the appropriate prompt template based on the selected model
    if (selected_model?.name === "Regex-to-ε-NFA") {
      prompt = await regex_to_e_nfa_prompt_template.invoke({
        messages: state.messages,
        regex_to_e_nfa_hint: regex_to_e_nfa_hint,
      });
    } else if (selected_model?.name === "e_NFA-to-DFA") {
      // Fixed the name matching
      prompt = await e_nfa_to_dfa_prompt_template.invoke({
        messages: state.messages,
        e_nfa_to_dfa_hint: e_nfa_to_dfa_hint,
      });
    } else if (selected_model?.name === "PDA") {
      prompt = await push_down_automata_prompt_template.invoke({
        messages: state.messages,
        push_down_automata_hint: push_down_automata_hint,
      });
    } else {
      // Default to DFA to minimized DFA
      prompt = await dfa_to_minimized_dfa_prompt_template.invoke({
        messages: state.messages,
        dfa_to_minimized_dfa_hint: dfa_to_minimized_dfa_hint,
      });
    }

    const response = await llm.invoke(prompt);

    // Reset the is_pressed_convert flag
    if (currentAppState.is_pressed_convert) {
      currentAppState.is_pressed_convert = false; // Update currentAppState
    }

    return { messages: response };
  };

  // Define a new graph
  const workflow = new StateGraph(MessagesAnnotation)
    // Define the node and edge
    .addNode("model", callModel)
    .addEdge(START, "model")
    .addEdge("model", END);

  // Add memory
  const memory = new MemorySaver();
  const app = workflow.compile({ checkpointer: memory });
  const config = { configurable: { thread_id: uuidv4() } };

  return { app, config };
};

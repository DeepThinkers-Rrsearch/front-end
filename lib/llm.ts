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

import { 
  regex_to_e_nfa_prompt_template,
  e_nfa_to_dfa_prompt_template, 
  dfa_to_minimized_dfa_prompt_template, 
  push_down_automata_prompt_template 
} from "./prompt_templates/prompts";

// Define the interface for the application state
interface AppState {
  regex_to_e_nfa_used?: boolean;
  e_nfa_to_dfa_used?: boolean;
  dfa_to_minimized_dfa_used?: boolean;
  pda_used?: boolean;
  is_pressed_convert?: boolean;
  latest_input_regex?: string;
  latest_input_e_nfa?: string;
  latest_input_dfa?: string;
  latest_input_pda?: string;
  regex_to_e_nfa_transition?: string;
  e_nfa_to_dfa_transition?: string;
  dfa_to_minimized_dfa_transition?: string;
  pda_transition?: string;
  selected_model?: {
    name: string;
  };
}

export const setup_llm = (appState: AppState) => {
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  // // Define the function that calls the model
  // const callModel = async (state: typeof MessagesAnnotation.State) => {
  //   const response = await llm.invoke(state.messages);
  //   return { messages: response };
  // };

  const callModel = async (state: typeof MessagesAnnotation.State) => {
    // Handle regex to ε-NFA hint
    let regex_to_e_nfa_hint = "";
    if (!appState.regex_to_e_nfa_used && appState.is_pressed_convert) {
      appState.regex_to_e_nfa_used = true;
      regex_to_e_nfa_hint = `\nHere is the converted ε-NFA transition for the regular expression ${appState.latest_input_regex || ''}:\n${appState.regex_to_e_nfa_transition || ''}`;
    }

    // Handle ε-NFA to DFA hint
    let e_nfa_to_dfa_hint = "";
    if (!appState.e_nfa_to_dfa_used && appState.is_pressed_convert) {
      appState.e_nfa_to_dfa_used = true;
      e_nfa_to_dfa_hint = `\nHere is the converted DFA transition for the e-NFA ${appState.latest_input_e_nfa || ''}:\n${appState.e_nfa_to_dfa_transition || ''}`;
    }

    // Handle DFA to minimized DFA hint
    let dfa_to_minimized_dfa_hint = "";
    if (!appState.dfa_to_minimized_dfa_used && appState.is_pressed_convert) {
      appState.dfa_to_minimized_dfa_used = true;
      dfa_to_minimized_dfa_hint = `\nHere is the minimized DFA transition for the given DFA ${appState.latest_input_dfa || ''}:\n${appState.dfa_to_minimized_dfa_transition || ''}`;
    }

    // Handle PDA hint
    let push_down_automata_hint = "";
    if (!appState.pda_used && appState.is_pressed_convert) {
      appState.pda_used = true;
      push_down_automata_hint = `\nHere is the converted pda transitions for the given context free language string ${appState.latest_input_pda || ''}:\n${appState.pda_transition || ''}`;
    }

    const selected_model = appState.selected_model;
    let prompt;

    // Select the appropriate prompt template based on the selected model
    if (selected_model?.name === "Regex-to-ε-NFA") {
      prompt = await regex_to_e_nfa_prompt_template.invoke({
        messages: state.messages,
        regex_to_e_nfa_hint: regex_to_e_nfa_hint,
      });
    } else if (selected_model?.name === "e_NFA-to-DFA") {
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
    if (appState.is_pressed_convert) {
      appState.is_pressed_convert = false;
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

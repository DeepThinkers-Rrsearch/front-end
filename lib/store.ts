import { create } from "zustand";

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
  selected_model?: string;
  // Actions
  setRegexToENfaUsed: (used: boolean) => void;
  setENfaToDfaUsed: (used: boolean) => void;
  setDfaToMinimizedDfaUsed: (used: boolean) => void;
  setPdaUsed: (used: boolean) => void;
  setIsPressedConvert: (pressed: boolean) => void;
  setLatestInputRegex: (input: string) => void;
  setLatestInputENfa: (input: string) => void;
  setLatestInputDfa: (input: string) => void;
  setLatestInputPda: (input: string) => void;
  setRegexToENfaTransition: (transition: string) => void;
  setENfaToDfaTransition: (transition: string) => void;
  setDfaToMinimizedDfaTransition: (transition: string) => void;
  setPdaTransition: (transition: string) => void;
  setSelectedModel: (model: string) => void;
  resetState: () => void;
}

// Create the Zustand store
export const useAppStore = create<AppState>((set) => ({
  // Initial state
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
  selected_model: "DFA-Minimization",

  // Actions
  setRegexToENfaUsed: (used) => set({ regex_to_e_nfa_used: used }),
  setENfaToDfaUsed: (used) => set({ e_nfa_to_dfa_used: used }),
  setDfaToMinimizedDfaUsed: (used) => set({ dfa_to_minimized_dfa_used: used }),
  setPdaUsed: (used) => set({ pda_used: used }),
  setIsPressedConvert: (pressed) => set({ is_pressed_convert: pressed }),
  setLatestInputRegex: (input) => set({ latest_input_regex: input }),
  setLatestInputENfa: (input) => set({ latest_input_e_nfa: input }),
  setLatestInputDfa: (input) => set({ latest_input_dfa: input }),
  setLatestInputPda: (input) => set({ latest_input_pda: input }),
  setRegexToENfaTransition: (transition) =>
    set({ regex_to_e_nfa_transition: transition }),
  setENfaToDfaTransition: (transition) =>
    set({ e_nfa_to_dfa_transition: transition }),
  setDfaToMinimizedDfaTransition: (transition) =>
    set({ dfa_to_minimized_dfa_transition: transition }),
  setPdaTransition: (transition) => set({ pda_transition: transition }),
  setSelectedModel: (model: string) => set({ selected_model: model }),
  resetState: () =>
    set({
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
      selected_model: "DFA-Minimization",
    }),
}));

// Create a global instance for use in non-React contexts
export const appState = useAppStore.getState();

// Subscribe to store changes to keep the global instance updated
useAppStore.subscribe((state) => {
  Object.assign(appState, state);
});

// Export the AppState type for use in other files
export type { AppState };

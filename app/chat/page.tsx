"use client";

import { useState, useRef, useEffect, JSX } from "react";
import Link from "next/link";
import { PDAStack, DFA_MINI_Stack, E_NFA_Stack, REGEX_Stack } from "../../utils/stacks/index"
import { DFAGraphRenderer, ENFAGraphRenderer, MinimizedDFAGraphRenderer, PDAGraphRenderer } from "../../utils/graph_renderer/index"
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import { Copy, Eye, Plus, CheckCircle, User, Bot, Trash2, FileText, Play, BookOpen, LayoutDashboard, X, ImageOff} from "lucide-react";
import { useAppStore } from '../../utils/store';
import { extractEpsilonNfaTextFromImage } from "../../utils/text_extraction/e_nfa_image_to_text";
import { extract_dfa_text_from_image } from "../../utils/text_extraction/dfa_minimization_image_to_text";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

type StackItem = {
  string: string
  conversion: string
}

type stackObjectTypes = {
  DFA_MINIMIZATION: Array<StackItem>,
  REGEX_TO_E_NFA: Array<StackItem>,
  E_NFA_TO_DFA: Array<StackItem>,
  PDA: Array<StackItem>,
}

const initStackObject: stackObjectTypes = {
  DFA_MINIMIZATION: [],
  REGEX_TO_E_NFA: [],
  E_NFA_TO_DFA: [],
  PDA: [],
}

// Model types
const MODELS = {
  DFA_MINIMIZATION: "DFA-Minimization",
  REGEX_TO_E_NFA: "Regex-to-ε-NFA",
  E_NFA_TO_DFA: "e_NFA-to-DFA",
  PDA: "PDA",
} as const;

type ModelType = (typeof MODELS)[keyof typeof MODELS];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your State Forge AI assistant. I can help you understand automata theory conversions and explain the results. How can I assist you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [showComparisonPopup, setShowComparisonPopup] = useState(false);
  const [isConversionValid, setIsConversionValid] = useState(false);

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>(
    MODELS.DFA_MINIMIZATION
  );
  const [modelInput, setModelInput] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [convertResult, setConvertResult] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isConversionHistoryOpen, setIsConversionHistoryOpen] = useState<boolean>(false);
  const [isSimulatingModelOpen, setIsSimulatingModelOpen] = useState<boolean>(false);
  const [highlightCount, setHighlightCount] = useState<number>(0);
  const [stackObject, setStackObject] = useState<stackObjectTypes>(initStackObject);

  // creating stack instances

  const PDA_Stack_Instance = new PDAStack();
  const DFA_MINI_Stack_Instance = new DFA_MINI_Stack();
  const E_NFA_Stack_Instance = new E_NFA_Stack();
  const REGEX_Stack_Instance = new REGEX_Stack();

  const [showModal, setShowModal] = useState(false);
  const [initialState, setInitialState] = useState("");
  const [finalState, setFinalState] = useState("");
  const [alphabet, setAlphabet] = useState("");
  const [transitions, setTransitions] = useState([{ from: "", input: "", to: "" }]);

  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const [successMessage, setSuccessMessage] = useState<React.ReactNode>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // access the store
  const {
    setLatestInputRegex,
    setLatestInputENfa,
    setLatestInputDfa,
    setLatestInputPda,
    setRegexToENfaTransition,
    setENfaToDfaTransition,
    setDfaToMinimizedDfaTransition,
    setPdaTransition
  } = useAppStore();

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  useEffect(() => {
    setModelInput(""); // clear model input when model changes
  }, [selectedModel]);

useEffect(() => {
  setUploadedImage(null);         
  setSuccessMessage("");          
  setModelInput("");              

  // Reset the actual file input field
  if (fileInputRef.current) {
    fileInputRef.current.value = "";  // 🔁 Clears selected file name
  }
}, [selectedModel]);

  useEffect(() => {
    //set the converted transition values
    switch (selectedModel) {
      case "DFA-Minimization":
        setDfaToMinimizedDfaTransition(convertResult);
        break;
      case "Regex-to-ε-NFA":
        setRegexToENfaTransition(convertResult);
        break;
      case "e_NFA-to-DFA":
        setENfaToDfaTransition(convertResult);
        break;
      case "PDA":
        setPdaTransition(convertResult)
        break;
      default:
        break;
    }
  }, [convertResult])

  useEffect(() => {
  setIsConversionValid(false); // disables comparison on model switch
}, [selectedModel]);

  const getModelPlaceholder = (model: ModelType) => {
    switch (model) {
      case MODELS.DFA_MINIMIZATION:
        return "Enter your DFA description (states, transitions, initial/final states)\nExample: A: a-->A, b-->B; B: a-->A, b-->A; in:A; fi:A";
      case MODELS.REGEX_TO_E_NFA:
        return "Enter your regular expression\nExample: a*b+ or (a|b)* or a+b*c";
      case MODELS.E_NFA_TO_DFA:
        return "Enter your ε-NFA description\nStructure: 'In:{Initial_state};Fi:{Final_states};Abt:{Alphabet};Trn:{Transitions}' ";
      case MODELS.PDA:
        return "Enter your language example string...\nExample: aabb (a^nb^n) or aaabbb";
      default:
        return "Enter your input...";
    }
  };

  const handleConvert = async () => {
    if (!modelInput.trim() || isConverting) return;

    setIsConverting(true);
    setConvertResult("");

    // Update the latest value
    switch (selectedModel) {
      case "DFA-Minimization":
        setLatestInputDfa(modelInput);
        break;
      case "Regex-to-ε-NFA":
        setLatestInputRegex(modelInput);
        break;
      case "e_NFA-to-DFA":
        setLatestInputENfa(modelInput);
        break;
      case "PDA":
        setLatestInputPda(modelInput)
        break;
      default:
        break;
    }


    try {
      // Demo API call - replace with actual API endpoint
      // process.env.NEXT_PUBLIC_BACKEND_URL
      
      const response = await fetch(`http://127.0.0.1:8000/api/v1/convert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input_text: modelInput,
          model_type: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setConvertResult(data.result);

      switch (selectedModel) {
        case "DFA-Minimization":
          const DFAArray = stackObject.DFA_MINIMIZATION;
          DFAArray.push({
            string: modelInput,
            conversion: data.result
          });
          setStackObject({ ...stackObject, DFA_MINIMIZATION: DFAArray })
          //DFA_MINI_Stack_Instance.push(inputValue, data.result)
          break;
        case "Regex-to-ε-NFA":
          const RegexArray = stackObject.REGEX_TO_E_NFA;
          RegexArray.push({
            string: modelInput,
            conversion: data.result
          });
          setStackObject({ ...stackObject, DFA_MINIMIZATION: RegexArray })
          //REGEX_Stack_Instance.push(inputValue, data.result)
          break;
        case "e_NFA-to-DFA":
          const E_NFAArray = stackObject.E_NFA_TO_DFA;
          E_NFAArray.push({
            string: modelInput,
            conversion: data.result
          });
          setStackObject({ ...stackObject, DFA_MINIMIZATION: E_NFAArray })
          //E_NFA_Stack_Instance.push(inputValue, data.result)
          break;
        case "PDA":
          const PDAArray = stackObject.PDA;

          PDAArray.push({
            string: modelInput,
            conversion: data.result
          });
          setStackObject({ ...stackObject, DFA_MINIMIZATION: PDAArray })
          //PDA_Stack_Instance.push(inputValue, data.result)
          break;
        default:
          break;
      }
      // add the conversion result to the 


    } catch (error) {
      console.error("Conversion failed:", error);

      // Demo fallback responses for different models
      const demoResults = {
        [MODELS.DFA_MINIMIZATION]: `Demo: Minimized DFA for input "${modelInput}"\n\nStates: \\{q0, q1\\}\nAlphabet: \\{a, b\\}\nTransitions:\n  δ(q0, a) = q0\n  δ(q0, b) = q1\n  δ(q1, a) = q0\n  δ(q1, b) = q1\nInitial State: q0\nFinal States: \\{q1\\}\n\nMinimization complete! Original had 3 states, minimized has 2 states.`,
        [MODELS.REGEX_TO_E_NFA]: `Demo: ε-NFA for regex "${modelInput}"\n\nStates: \\{q0, q1, q2, q3\\}\nAlphabet: \\{${modelInput
          .replace(/[^a-zA-Z]/g, "")
          .split("")
          .join(", ")}\\}\nTransitions:\n  δ(q0, ε) = \\{q1\\}\n  δ(q1, ${modelInput.charAt(0) || "a"
          }) = \\{q2\\}\n  δ(q2, ε) = \\{q3\\}\nInitial State: q0\nFinal States: \\{q3\\}\n\nε-NFA construction complete!`,
        [MODELS.E_NFA_TO_DFA]: `Demo: DFA converted from ε-NFA "${modelInput}"\n\nStates: \\{\\{q0\\}, \\{q1,q2\\}, \\{q3\\}\\}\nAlphabet: \\{a, b\\}\nTransitions:\n  δ(\\{q0\\}, a) = \\{q1,q2\\}\n  δ(\\{q0\\}, b) = \\{q0\\}\n  δ(\\{q1,q2\\}, a) = \\{q3\\}\n  δ(\\{q1,q2\\}, b) = \\{q1,q2\\}\nInitial State: \\{q0\\}\nFinal States: \\{\\{q3\\}\\}\n\nSubset construction complete!`,
        [MODELS.PDA]: `Demo: PDA for input "${modelInput}"\n\nStates: \\{q0, q1, q2\\}\nInput Alphabet: \\{a, b\\}\nStack Alphabet: \\{Z, A, B\\}\nTransitions:\n  δ(q0, a, Z) = \\{(q1, AZ)\\}\n  δ(q1, a, A) = \\{(q1, AA)\\}\n  δ(q1, b, A) = \\{(q2, ε)\\}\n  δ(q2, b, A) = \\{(q2, ε)\\}\n  δ(q2, ε, Z) = \\{(q2, ε)\\}\nInitial State: q0\nStart Symbol: Z\nAcceptance: Empty Stack\n\nPDA construction complete for L = \\{a^n b^n | n ≥ 1\\}`,
      };

      setConvertResult(
        demoResults[selectedModel] || "Demo conversion completed!"
      );
    } finally {
      setIsConverting(false);
    }
    setIsConversionValid(true);
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!inputValue.trim() || isLoading) return;


  //   const userMessage: Message = {
  //     id: Date.now().toString(),
  //     content: inputValue,
  //     role: "user",
  //     timestamp: new Date(),
  //   };

  //   console.log("crown",inputValue);

  //   setMessages((prev) => [...prev, userMessage]);
  //   setInputValue("");
  //   setIsLoading(true);

  //   try {
  //     // Prepare messages in LangGraph format
  //     const langGraphMessages = [...messages, userMessage].map((msg) => ({
  //       role: msg.role,
  //       content: msg.content,
  //     }));

  //     console.log("hen",convertResult,langGraphMessages);

  //     // Call the API
  //     const response = await fetch("/api/chat", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         messages: langGraphMessages,
  //         context: {
  //           selectedModel,
  //           lastConversion: convertResult,
  //         },
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`API error: ${response.status}`);
  //     }

  //     const data = await response.json();

  //     console.log("Hava",data);
  //     const aiMessage: Message = {
  //       id: (Date.now() + 1).toString(),
  //       content: data.content,
  //       role: "assistant",
  //       timestamp: new Date(),
  //     };

  //     setMessages((prev) => [...prev, aiMessage]);
  //   } catch (error) {
  //     console.error("Failed to get AI response:", error);

  //     // Fallback error message
  //     const errorMessage: Message = {
  //       id: (Date.now() + 1).toString(),
  //       content:
  //         "Sorry, I'm having trouble responding right now. Please try again. You can still use the conversion models on the left sidebar.",
  //       role: "assistant",
  //       timestamp: new Date(),
  //     };
  //     setMessages((prev) => [...prev, errorMessage]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Prepare messages in LangGraph format
      const langGraphMessages = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Get current Zustand store state
      const storeState = useAppStore.getState();

      // Pass the store state to backend
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: langGraphMessages,
          context: {
            selectedModel,
            lastConversion: convertResult,
          },
          // Send the entire Zustand store state
          appState: {
            regex_to_e_nfa_used: storeState.regex_to_e_nfa_used,
            e_nfa_to_dfa_used: storeState.e_nfa_to_dfa_used,
            dfa_to_minimized_dfa_used: storeState.dfa_to_minimized_dfa_used,
            pda_used: storeState.pda_used,
            is_pressed_convert: convertResult ? true : storeState.is_pressed_convert,
            latest_input_regex: storeState.latest_input_regex,
            latest_input_e_nfa: storeState.latest_input_e_nfa,
            latest_input_dfa: storeState.latest_input_dfa,
            latest_input_pda: storeState.latest_input_pda,
            regex_to_e_nfa_transition: storeState.regex_to_e_nfa_transition,
            e_nfa_to_dfa_transition: storeState.e_nfa_to_dfa_transition,
            dfa_to_minimized_dfa_transition: storeState.dfa_to_minimized_dfa_transition,
            pda_transition: storeState.pda_transition,
            selected_model: { name: selectedModel },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.content,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to get AI response:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Sorry, I'm having trouble responding right now. Please try again. You can still use the conversion models on the left sidebar.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
    
    // Scroll after adding user message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

  };

  const conversionHistoryHandler = () => {
    setIsConversionHistoryOpen(true)
  }

  const conversionHistoryExtractor = (): Array<StackItem> => {
    console.log("butterfly effect", selectedModel);
    switch (selectedModel) {
      case "DFA-Minimization":
        return stackObject.DFA_MINIMIZATION
      case "Regex-to-ε-NFA":
        return stackObject.REGEX_TO_E_NFA
      case "e_NFA-to-DFA":
        return stackObject.E_NFA_TO_DFA
      case "PDA":
        return stackObject.PDA
      default:
        return [];
    }
  }

  const conversions = [
    {
      id: 1,
      input: "aaaaaaaabbbbbbcc",
      result: ['delta(q0, a, Z) -> (q0, PUSH)', 'delta(q0, a, A) -> (q0, PUSH)', 'delta(q0, b, A) -> (q1, POP)', 'delta(q1, b, A) -> (q1, POP)', 'delta(q1, c, A) -> (q2, POP)', 'delta(q2, c, A) -> (q2, POP)', 'delta(q2, ε, Z) -> (qf, NOOP)'],
    },
    {
      id: 2,
      input: "aaaaaaaaaabbbbb",
      result: ['delta(q0, a, Z) -> (q0, PUSH)', 'delta(q0, a, A) -> (q1, NOOP)', 'delta(q1, a, A) -> (q0, PUSH)', 'delta(q1, b, A) -> (q2, POP)', 'delta(q2, b, A) -> (q2, POP)', 'delta(q2, ε, Z) -> (qf, NOOP)'],
    },
  ];


  const simulationModelHandler = () => {

    setIsSimulatingModelOpen(true)
  }

  const graphRenderHandler = (): JSX.Element => {
    switch (selectedModel) {
      case "DFA-Minimization":
        return (
          <MinimizedDFAGraphRenderer
            minimizedDfaString={convertResult}
            highlightCount={highlightCount}
          />
        );
      case "Regex-to-ε-NFA":
        return (
          <ENFAGraphRenderer
            enfaString={convertResult}
            highlightCount={highlightCount}
          />
        )
      case "e_NFA-to-DFA":
        return (
          <DFAGraphRenderer
            dfaString={convertResult}
            highlightCount={highlightCount}
          />
        )
      case "PDA":
        return (
          <PDAGraphRenderer
            transitionString={convertResult}
            highlightCount={highlightCount}
          />
        );
      default:
        return <></>
    }
  }


  const simulateBackward = () => {
    if (highlightCount >= 1) {
      setHighlightCount(highlightCount - 1)
    }
  }

  const simulateForward = () => {
    const count = convertResult
      .split('\n')
      .filter(line => line.trim() !== '').length;
    if (count > highlightCount) {
      setHighlightCount(highlightCount + 1);
    }
  }

  const onClose = () => {
    setIsSimulatingModelOpen(false)
  }

const handleExtract = async (file: File) => {
  try {
    setIsExtracting(true);
    setSuccessMessage(""); // Clear old success messages

    let text = "";

    if (selectedModel === MODELS.DFA_MINIMIZATION) {
      text = await extract_dfa_text_from_image(file);
    } else if (selectedModel === MODELS.E_NFA_TO_DFA) {
      text = await extractEpsilonNfaTextFromImage(file);
    } else {
      throw new Error("Unsupported model for image extraction.");
    }

    setModelInput(text);
    // setSuccessMessage("✅ Text extracted successfully");
    setSuccessMessage(
  <div className="flex items-center gap-2">
    <CheckCircle className="w-4 h-4 text-green-600" />
    <span>Text extracted successfully</span>
  </div>
);
  } catch (err) {
    console.error("Extraction failed", err);
    alert("Failed to extract text from image.");
  } finally {
    setIsExtracting(false);
  }
};
  const clearChatHistoryHandler = () => {
    const initMessage = messages[0];
    setMessages([initMessage])
  }

const parseModelInput = (input: string) => {
  const extractGroup = (label: string): string[] => {
    const regex = new RegExp(`${label}:((?:{[^}]+})+)`);
    const match = input.match(regex);
    if (!match) return [];

    const matches = [...match[1].matchAll(/{([^}]+)}/g)];
    return matches.map((m) => m[1]);
  };

  const extractSingle = (label: string): string => {
    const regex = new RegExp(`${label}:{([^}]+)}`);
    const match = input.match(regex);
    return match?.[1] || "";
  };

  const initial = extractSingle("In");
  const final = extractGroup("Fi");
  const alphabet = extractGroup("Abt");

  const transitionsMatch = input.match(/Trn:{(.*)}/);
  const transitionsRaw = transitionsMatch?.[1] || "";
  const transitions = transitionsRaw
    .split(",")
    .map((t) => {
      const parts = t.split("->");
      if (parts.length === 3) {
        return {
          from: parts[0].replace(/[{}]/g, ""),
          input: parts[1],
          to: parts[2].replace(/[{}]/g, ""),
        };
      }
      return null;
    })
    .filter((t): t is { from: string; input: string; to: string } => t !== null);

  return { initial, final, alphabet, transitions };
};

  const parsed = parseModelInput(modelInput);
  const convertedParsed = parseModelInput(convertResult);

  const MODEL_DISPLAY_NAMES: Record<ModelType, string> = {
  [MODELS.DFA_MINIMIZATION]: "DFA-Minimization",
  [MODELS.REGEX_TO_E_NFA]: "Regex-to-ε-NFA",
  [MODELS.E_NFA_TO_DFA]: "ε-NFA-to-DFA",
  [MODELS.PDA]: "PDA",
};


  return (
    <div className="flex min-h-screen light-yellow-bg">
      {/* <div className="flex max-w-7xl mx-auto"> */}
      <div className="flex w-full">

        {/* Left Sidebar - Model Selection */}
        {/* <div className="hidden lg:block w-80 bg-white border-r border-yellow-200 min-h-screen"> */}
        <div className="w-2/9 bg-white border-r border-yellow-400 min-h-screen">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Conversion Models
            </h2>

            {/* Model Selection */}
            <div className="space-y-3 mb-6">
              {Object.values(MODELS).map((model) => (
                <label
                  key={model}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${selectedModel === model
                    ? "border-yellow-400 bg-yellow-50 text-yellow-700"
                    : "border-gray-200 hover:border-yellow-300 hover:bg-yellow-25"
                    }`}
                >
                  <input
                    type="radio"
                    name="model"
                    value={model}
                    checked={selectedModel === model}
                    onChange={(e) =>{
                      setConvertResult("")
                      setSelectedModel(e.target.value as ModelType)
                    }
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${selectedModel === model
                      ? "border-yellow-500"
                      : "border-gray-300"
                      }`}
                  >
                    {selectedModel === model && (
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    )}
                  </div>
                  {/* <span className="text-sm font-medium">{model}</span> */}
                  <span className="text-sm font-medium">{MODEL_DISPLAY_NAMES[model]}</span>
                </label>
              ))}
            </div>


            {/* Selected Model Info */}
            {/* <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm">
                <span className="font-medium text-yellow-700">
                  Selected Model:
                </span>
                <br />
                <span className="text-yellow-600">{selectedModel}</span>
                <br />
                <span className="text-xs text-yellow-500 mt-1 block">
                  PyTorch Transformer Model
                </span>
              </div>
            </div> */}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4 text-center">Tools</h4>
              <div className="flex flex-col items-center gap-2">
              
              <button
                onClick={conversionHistoryHandler}
                className="flex items-center rounded-full px-3 gap-1 text-sm font-medium bg-yellow-50 text-yellow-800 px-4 py-2 rounded-xl border border-yellow-300 hover:bg-yellow-200 transition-colors w-[220px] shadow-sm hover:shadow-md"
              >
                <FileText className="w-5 h-5 text-yellow-600" />
                View Conversion History
              </button>

                {(selectedModel === MODELS.DFA_MINIMIZATION || selectedModel === MODELS.E_NFA_TO_DFA) && (
                <button
                  onClick={() => setShowComparisonPopup(true)}
                  disabled={!isConversionValid}
                  className={`group relative flex items-center justify-center gap-3 text-sm font-semibold px-5 py-2 rounded-xl border w-[220px] transition-all duration-300 ease-in-out
                    ${
                      isConversionValid
                        ? "border-yellow-400 bg-gradient-to-tr from-yellow-300 via-yellow-100 to-amber-100 text-yellow-800 hover:scale-[1.03] hover:shadow-yellow-400/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 animate-pulse hover:animate-none"
                        : "bg-yellow-100 border-yellow-200 text-yellow-400 cursor-not-allowed opacity-60"
                    }
                  `}
                >
                    <LayoutDashboard
                      className={`w-5 h-5 ${
                        isConversionValid
                          ? "text-yellow-700 group-hover:scale-110 group-hover:text-yellow-900 transition-transform duration-300"
                          : "text-yellow-400"
                      }`}
                    />
                    Comparison View
                  </button>
                )}

              <button
              onClick={simulationModelHandler}
              className="group relative overflow-hidden flex items-center justify-center gap-3 text-sm font-semibold px-5 py-2 rounded-xl border border-yellow-400 bg-gradient-to-tr from-yellow-200 via-yellow-100 to-amber-100 text-yellow-800 shadow-sm w-[220px] transition-all duration-300 ease-in-out hover:scale-[1.04] hover:shadow-yellow-400/40 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              {/* Shimmering light overlay */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow/60 to-transparent opacity-0 group-hover:opacity-60 group-hover:animate-shimmer pointer-events-none" />

              {/* Play icon with hover pulse */}
              <Play className="w-5 h-5 text-yellow-700 transition-transform duration-300 group-hover:scale-125 group-hover:text-yellow-900" />

              Simulate

              {/* Bottom bar shine */}
              <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-orange-400 group-hover:w-full group-hover:left-0 transition-all duration-300" />
            </button>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4 text-center">Quick actions</h4>
                <Link
                  href="/instructions"
                  className="flex items-center rounded-full px-3 gap-3 text-sm font-medium bg-yellow-500 text-white px-4 py-2 rounded-xl border border-yellow-400 hover:bg-yellow-600 transition-colors w-[220px] shadow-sm hover:shadow-md"
                >
                  <BookOpen className="w-5 h-5 text-white" />
                  View Documentation
                </Link>
              </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Popup window for Comparison view button */}
        {showComparisonPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-5xl h-[90vh] overflow-y-auto flex flex-col border border-yellow-300">
            <div className="flex justify-between items-center pb-3 border-b border-yellow-200">
              <h2 className="text-lg font-semibold text-yellow-700">Input vs Output Comparison</h2>
            <button
            className="text-red-600 hover:text-red-800"
            onClick={() => setShowComparisonPopup(false)}
            >
            <X className="w-6 h-6" />
            </button>
            </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4  items-stretch">
        {/* Left Side - Input */}
        <div className="flex flex-col h-full">
        <div className="flex flex-col flex-grow bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">User Input</h4>
          <div className="relative">
           {selectedModel === MODELS.DFA_MINIMIZATION && (
          <div className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-2 border border-yellow-100 rounded">
            {modelInput || "No input provided."}
          </div>
           )}
          {selectedModel === MODELS.E_NFA_TO_DFA && modelInput.trim() && parsed && (
            <div className="text-sm space-y-2 p-3 border border-yellow-400 rounded-lg bg-white shadow-sm">
              <div className="flex flex-wrap gap-6">
                <div><strong className="text-yellow-700">Initial:</strong> {parsed.initial}</div>
                <div><strong className="text-yellow-700">Final:</strong> {parsed.final.join(", ")}</div>
                <div><strong className="text-yellow-700">Alphabet:</strong> {parsed.alphabet.join(", ")}</div>
              </div>

              <div>
                <strong className="text-yellow-700">Transitions:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {parsed.transitions.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full border border-yellow-300"
                    >
                      {t.from} → {t.input} → {t.to}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          </div>
          
          {uploadedImage ? (
          <div className="mt-4">
            <h5 className="text-sm font-medium text-yellow-700 mb-1">Uploaded Image</h5>
            <img
              src={URL.createObjectURL(uploadedImage)}
              alt="Uploaded"
              className="w-full rounded border border-yellow-300"
            />
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center justify-center gap-2 p-4 border border-yellow-200 bg-yellow-50 rounded-lg text-yellow-700 shadow-sm hover:shadow-md transition-shadow">
            <ImageOff className="w-6 h-6 text-yellow-500" />
            <span className="text-sm italic">No uploaded image available</span>
          </div>
        )}
        </div>
        </div>
        {/* Right Side - Output */}
        <div className="flex flex-col h-full">
        <div className="flex flex-col flex-grow bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Converted Output</h4>
          <div className="relative">
            {selectedModel === MODELS.DFA_MINIMIZATION && (
            <div className="text-xs font-mono text-green-800 whitespace-pre-wrap bg-white p-2 border border-green-200 rounded max-h-32 overflow-y-auto">
              {convertResult || "No output generated."}
            </div>
            )}
            
             {selectedModel === MODELS.E_NFA_TO_DFA && convertedParsed && (
            <div className="text-sm space-y-2 p-3 bg-green-50 border border-green-400 rounded-lg shadow-sm text-green-800">
              <div className="flex flex-wrap gap-6">
                <div><strong className="text-green-700">Initial:</strong> {convertedParsed.initial}</div>
                <div><strong className="text-green-700">Final:</strong> {convertedParsed.final.join(", ")}</div>
                <div><strong className="text-green-700">Alphabet:</strong> {convertedParsed.alphabet.join(", ")}</div>
              </div>
              <div>
                <strong className="text-green-700">Transitions:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {convertedParsed.transitions.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full border border-green-300"
                    >
                      {t.from} → {t.input} → {t.to}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          </div>
         

          
          {/* Rendered Image */}
          <div className="mt-4">
            <h5 className="text-sm font-medium text-yellow-700 mb-1">Generated Image</h5>
            {selectedModel === "DFA-Minimization" && (
              <MinimizedDFAGraphRenderer minimizedDfaString={convertResult} highlightCount={highlightCount} />
            )}
            {selectedModel === "e_NFA-to-DFA" && (
              <DFAGraphRenderer dfaString={convertResult} highlightCount={highlightCount} />
            )}
          </div>
        </div>
        </div>
        </div>
        </div>
      </div>
      )}

        {/* Main Chat Area */}
        {/* <div className="w-4/9 px-4 py-6 overflow-y-auto"> */}
        <div className="w-4/9 px-4 py-6 overflow-y-auto scroll-hidden max-h-screen">
          <div className="space-y-4 mb-24">
            {(selectedModel === MODELS.DFA_MINIMIZATION || selectedModel === MODELS.E_NFA_TO_DFA) && (
              <div className="relative border border-yellow-300 rounded-xl p-4 bg-white">
                <div className="flex items-center justify-between mb-1 pr-4">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    {selectedModel === MODELS.DFA_MINIMIZATION
                      ? "Upload DFA Diagram"
                      : "Upload ε-NFA Diagram"}
                  </label>
                  {uploadedImage && (
                    <button
                      // onClick={() => setShowPreview(!showPreview)}
                      onMouseDown={() => setShowPreview(true)}
                      onMouseUp={() => setShowPreview(false)}
                      onMouseLeave={() => setShowPreview(false)} // ensures it closes if pointer leaves
                      className="inline-flex items-center gap-1 text-sm text-yellow-600 hover:text-yellow-800"
                      title="Preview Image"
                    >
                      <Eye className="w-5 h-5" />
                      Preview
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      // setUploadedImage(file || null);
                      if (file) {
                      setUploadedImage(file);
                      handleExtract(file);
                    }
                      setShowPreview(false); // Reset preview
                    }}
                    className="block text-sm text-gray-700 
                        file:mr-4 
                        file:py-2 
                        file:px-4 
                        file:rounded-lg 
                        file:border 
                        file:border-gray-300 
                        file:text-sm 
                        file:font-medium 
                        file:bg-yellow-400 
                        file:text-white
                        hover:file:bg-yellow-300"
                  />
                </div>

                {/* Image Preview Popup */}
                {showPreview && uploadedImage && (
                  <div className="absolute top-12 right-4 z-50 p-2 border rounded-lg bg-white shadow-lg max-w-sm">
                    <img
                      src={URL.createObjectURL(uploadedImage)}
                      alt="Preview"
                      className="max-w-full max-h-[300px] rounded"
                    />
                  </div>
                )}
              </div>
            )}
              {successMessage && (
                <div className="w-54 text-green-800 bg-green-100 border border-green-500 text-sm mt-1 px-3 py-2 rounded-md">
                  {successMessage}
                </div>
              )}

            {/* Model Text Input Field */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                {/* Input for {selectedModel} */}
                Input for {MODEL_DISPLAY_NAMES[selectedModel]}
              </label>
              <div className="space-y-2">
                <textarea
                  value={modelInput}
                  // onChange={(e) => setModelInput(e.target.value)}
                  onChange={(e) => {
                    setModelInput(e.target.value);
                    setIsConversionValid(false); // disables the comparison button until reconversion
                  }}
                  placeholder={getModelPlaceholder(selectedModel)}
                  rows={2}
                  className="w-full px-3 py-2 border border-yellow-300 bg-white rounded-lg text-sm resize-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors"
                />
                
              {/* Display input in simple format */}
              {selectedModel === MODELS.E_NFA_TO_DFA && modelInput.trim() && parsed && (
                <>
                  <label className="block text-sm font-medium text-gray-700">
                    Display the input
                  </label>

                  <div className="text-sm space-y-1 p-2 border border-yellow-400 rounded-lg bg-yellow-50">
                    <div className="flex flex-wrap gap-6">
                      <div><strong>Initial:</strong> {parsed.initial}</div>
                      <div><strong>Final:</strong> {parsed.final.join(", ")}</div>
                      <div><strong>Alphabet:</strong> {parsed.alphabet.join(", ")}</div>
                    </div>

                    <div>
                      <strong>Transitions:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {parsed.transitions.map((t, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded-md"
                          >
                            {t.from} → {t.input} → {t.to}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleConvert}
                    disabled={!modelInput.trim() || isConverting}
                    className="w-35 mt-0 px-4 py-1 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isConverting ? "Converting..." : "Convert"}
                  </button>
                  {selectedModel === MODELS.DFA_MINIMIZATION || selectedModel === MODELS.E_NFA_TO_DFA ? (
                    <button
                      onClick={() => setShowModal(true)}
                      className="w-38 px-4 py-1 border border-yellow-400 text-yellow-700 font-medium rounded-lg hover:bg-yellow-200 transition-colors"
                    >                  Add Text Input
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
            {/* Conversion Result */}
            {convertResult && (
              <div className="mt-4 space-y-2">
                <h4 className="text-md font-medium text-gray-900">Conversion Result</h4>
                <div className="relative">
                <button
                  onClick={() => navigator.clipboard.writeText(convertResult)}
                  className="absolute top-2 right-2 text-green-700 bg-green-100 border border-green-300 rounded p-1 hover:bg-green-200"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>

                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg max-h-64 overflow-y-auto">
                    <pre className="text-xs text-green-800 whitespace-pre-wrap font-mono">
                      {convertResult}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {convertResult && (
            <div className="mt-8 space-y-2">
              <h4 className="text-md font-medium text-gray-900">Generated Graph</h4>
              <div>
                {selectedModel === "PDA" && (
                  <PDAGraphRenderer
                    transitionString={convertResult}
                    highlightCount={highlightCount}
                  />
                )}

                {selectedModel === "DFA-Minimization" && (
                  <MinimizedDFAGraphRenderer
                    minimizedDfaString={convertResult}
                    highlightCount={highlightCount}
                  />
                )}
                {selectedModel === "Regex-to-ε-NFA" && (
                  <ENFAGraphRenderer
                    enfaString={convertResult}
                    highlightCount={highlightCount}
                  />
                )}
                {selectedModel === "e_NFA-to-DFA" && (
                  <DFAGraphRenderer
                    dfaString={convertResult}
                    highlightCount={highlightCount}
                  />
                )}
              </div>
            </div>
          )}
            {/* Add text input popup window */}
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md h-[80vh] overflow-hidden flex flex-col">
                  {/* Title */}
                  <h2 className="text-lg font-semibold text-yellow-600 mb-4">
                    Create Automata Input
                  </h2>

                  {/* Top Input Fields */}
                  <div className="space-y-3 flex-shrink-0">
                    <div>
                      <label className="block py-1 text-sm font-medium text-gray-700">
                        Initial state
                      </label>
                      <input
                        placeholder="e.g. q0"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        value={initialState}
                        onChange={(e) => setInitialState(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block py-1 text-sm font-medium text-gray-700">
                        Final state
                      </label>
                      <input
                        placeholder="e.g. qF1,qF2"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        value={finalState}
                        onChange={(e) => setFinalState(e.target.value)}
                      />
                    </div>
                    {selectedModel === MODELS.E_NFA_TO_DFA && (
                      <div>
                        <label className="block py-1 text-sm font-medium text-gray-700">
                          Alphabet
                        </label>
                        <input
                          placeholder="comma separated, e.g. a,b"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          value={alphabet}
                          onChange={(e) => setAlphabet(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Transitions Scroll Area */}
                  <label className="block py-3 text-sm font-medium text-gray-700">
                    Transitions
                  </label>
                  <div className="flex-grow mt-0 overflow-y-auto pt-1 space-y-2">

                    {transitions.map((t, idx) => (
                      <div key={idx} className="flex space-x-2 items-center">
                        <input
                          placeholder="From"
                          value={t.from}
                          onChange={(e) =>
                            setTransitions((prev) =>
                              prev.map((tran, i) =>
                                i === idx ? { ...tran, from: e.target.value } : tran
                              )
                            )
                          }
                          className="w-1/3 border rounded px-2 py-1 text-sm"
                        />
                        <input
                          placeholder="Input"
                          value={t.input}
                          onChange={(e) =>
                            setTransitions((prev) =>
                              prev.map((tran, i) =>
                                i === idx ? { ...tran, input: e.target.value } : tran
                              )
                            )
                          }
                          className="w-1/3 border rounded px-2 py-1 text-sm"
                        />
                        <input
                          placeholder="To"
                          value={t.to}
                          onChange={(e) =>
                            setTransitions((prev) =>
                              prev.map((tran, i) =>
                                i === idx ? { ...tran, to: e.target.value } : tran
                              )
                            )
                          }
                          className="w-1/3 border rounded px-2 py-1 text-sm"
                        />
                        <button
                          onClick={() =>
                            setTransitions((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="text-red-500 hover:text-red-700"
                          title="Delete Transition"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}

                    {/* Add Transition Button */}

                  </div>
                  <div className="w-fit">
                    <button
                      className="mt-2 inline-flex items-center text-sm text-yellow-600 hover:bg-yellow-100 rounded px-1 py-1 transition-colors"
                      onClick={() =>
                        setTransitions((prev) => [...prev, { from: "", input: "", to: "" }])
                      }
                    >
                      <span className="text-yellow-500 mr-1"><Plus className="w-5 h-5" />
                      </span> Add Transition
                    </button>
                  </div>
                  {/* Footer Buttons */}
                  <div className="flex-shrink-0 mt-4 flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setInitialState("");
                        setFinalState("");
                        setAlphabet("");
                        setTransitions([{ from: "", input: "", to: "" }]); // leave 1 empty row
                      }}
                      className="px-4 py-2 text-sm text-red-500 border border-red-300 rounded hover:bg-red-100 transition-colors"
                    >
                      Clear All
                    </button>


                    <button
                      onClick={() => {
                        let inputText = "";

                        if (selectedModel === MODELS.DFA_MINIMIZATION) {
                          const formattedTransitions = transitions
                            .filter(t => t.from && t.input && t.to)
                            .reduce((acc: Record<string, string>, t) => {
                              const key = t.from.trim();
                              const arrow = `${t.input.trim()}-->${t.to.trim()}`;
                              acc[key] = acc[key] ? `${acc[key]}, ${arrow}` : arrow;
                              return acc;
                            }, {});


                          const transitionStr = Object.entries(formattedTransitions)
                            .map(([state, trans]) => `${state}: ${trans}`)
                            .join("; ");

                          inputText = `${transitionStr}; in:${initialState}; fi:${finalState}`;
                        } else if (selectedModel === MODELS.E_NFA_TO_DFA) {
                          const formattedFinal = finalState
                            .split(",")
                            .map((s) => `{${s.trim()}}`)
                            .join("");
                          const transitionText = transitions
                            .filter((t) => t.from && t.input && t.to)
                            .map((t) => `{${t.from}}->${t.input}->{${t.to}}`)
                            .join(",");
                          inputText = `In:{${initialState}};Fi:${formattedFinal};Abt:{${alphabet
                            .split(",")
                            .map((a) => a.trim())
                            .join("}{")}};Trn:${transitionText}`;
                        }
                        setModelInput(inputText);
                        setShowModal(false);
                      }}
                      className="px-4 py-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                    >
                      Generate Input
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Messaging interface */}
        <div className="w-3/9 border-l border-yellow-400 px-2 py-4 overflow-y-auto">
          <div className=" flex flex-col gap-3">
            <div className="flex justify-between items-center pb-0">
              <div className="font-semibold text-yellow-600">Messaging</div>
              <button
              onClick={clearChatHistoryHandler}
              className="flex items-center gap-2 text-sm text-yellow-800 bg-yellow-100 border border-yellow-400 rounded-md px-2 py-1 hover:bg-gray-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
            </div>
            <div className="h-[480px] overflow-y-auto border-t border-yellow-300 px-1 py-2 scroll-smooth scroll-hidden">
              <div className="flex flex-col gap-y-2">
                {messages.map((message) => (
                  // <div
                  //   key={message.id}
                  //   className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                  //     }`}
                  // >
                  //   <div
                  //     className={`flex ${  // ← UPDATE THIS LINE
                  //       message.role === "user" ? "flex-row-reverse" : "flex-row"
                  //       } items-start space-x-2`}
                  //   >
                  //     {/* Avatar section stays the same */}
                  //     <div
                  //       className={`flex-shrink-0 ${message.role === "user" ? "ml-3" : "mr-3"
                  //         }`}
                  //     >
                  //       {message.role === "assistant" ? (
                  //         <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                  //           <span className="text-white font-bold text-xs">SF</span>
                  //         </div>
                  //       ) : (
                  //         <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                  //           <span className="text-white font-bold text-xs">U</span>
                  //         </div>
                  //       )}
                  //     </div>

                  //     {/* REPLACE THIS ENTIRE MESSAGE BUBBLE SECTION: */}
                  //     {/* <div
                  //       className={`rounded-2xl px-4 py-1 ${  // ← REMOVE max-w-xs lg:max-w-md from here
                  //         message.role === "user"
                  //           ? "chat-bubble-user"
                  //           : "chat-bubble-ai"
                  //         }`}
                  //     > */}
                  //     <div
                  //       className={`rounded-2xl px-4 py-1 ${
                  //         message.role === "user"
                  //           ? "chat-bubble-user max-w-[90%]"
                  //           : "chat-bubble-ai w-[480px] max-w-full"
                  //       }`}
                  //     >

                  //       {/* REPLACE the existing content section with: */}
                  //       <div className="overflow-hidden">
                  //         <div
                  //           className={`prose prose-sm max-w-none break-words leading-relaxed ${message.role === "user"
                  //             ? "text-white prose-headings:text-white prose-strong:text-white prose-code:text-yellow-100 prose-pre:bg-yellow-600 prose-pre:text-white"
                  //             : "text-gray-800 prose-headings:text-gray-900 prose-strong:text-gray-900 prose-code:text-gray-700 prose-pre:bg-gray-100 prose-pre:text-gray-800"
                  //             } prose-pre:rounded-md prose-pre:p-3 prose-code:text-xs prose-code:bg-opacity-20 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:overflow-x-auto prose-pre:max-w-full prose-pre:whitespace-pre-wrap`}
                  //         >
                  //           {/* <ReactMarkdown
                  //       remarkPlugins={[remarkGfm]}
                  //       rehypePlugins={[rehypeHighlight]}
                  //       components={{
                  //         pre: ({ children, ...props }) => (
                  //           <pre 
                  //             {...props} 
                  //             className="overflow-x-auto max-w-full whitespace-pre-wrap break-words text-xs leading-relaxed bg-gray-100 p-3 rounded-md"
                  //           >
                  //             {children}
                  //           </pre>
                  //         ),
                  //         code: ({ children, className, ...props }) => {
                  //           // Check if it's inline code by looking at className
                  //           const isInline = !className || !className.includes('language-');
                            
                  //           if (isInline) {
                  //             return (
                  //               <code 
                  //                 {...props} 
                  //                 className="break-words bg-gray-200 px-1 py-0.5 rounded text-xs"
                  //               >
                  //                 {children}
                  //               </code>
                  //             );
                  //           } else {
                  //             return (
                  //               <code 
                  //                 {...props} 
                  //                 className="block whitespace-pre-wrap break-words text-xs"
                  //               >
                  //                 {children}
                  //               </code>
                  //             );
                  //           }
                  //         }
                  //       }}
                  //     >
                  //       {message.content ?? ""}
                  //     </ReactMarkdown> */}
                  //           <ReactMarkdown
                  //             remarkPlugins={[remarkGfm]}
                  //             rehypePlugins={[rehypeHighlight]}
                  //             components={{
                  //               pre: (props: any) => (
                  //                 <div className="relative my-4">
                  //                   <pre
                  //                     className={`overflow-x-auto max-w-full rounded-lg p-4 text-sm leading-relaxed border ${message.role === "user"
                  //                       ? "bg-yellow-800 text-yellow-100 border-yellow-600"
                  //                       : "bg-yellow-100 text-yellow-100 border-yellow-100"
                  //                       }`}
                  //                     style={{
                  //                       fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  //                     }}
                  //                   >
                  //                     {props.children}
                  //                   </pre>
                  //                   <button
                  //                     className="absolute top-2 right-2 px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-500 transition-colors"
                  //                     onClick={() => {
                  //                       // Extract text content for copying
                  //                       const extractText = (element: any): string => {
                  //                         if (typeof element === 'string') return element;
                  //                         if (Array.isArray(element)) return element.map(extractText).join('');
                  //                         if (element?.props?.children) return extractText(element.props.children);
                  //                         return '';
                  //                       };
                  //                       const codeText = extractText(props.children);
                  //                       navigator.clipboard.writeText(codeText);
                  //                     }}
                  //                   >
                  //                     Copy
                  //                   </button>
                  //                 </div>
                  //               ),
                  //               code: (props: any) => {
                  //                 const isInline = !props.className || !props.className.includes('language-');

                  //                 if (isInline) {
                  //                   return (
                  //                     <code
                  //                       className={`px-1.5 py-0.5 rounded text-xs font-mono ${message.role === "user"
                  //                         ? "bg-yellow-200 text-yellow-900"
                  //                         : "bg-gray-200 text-gray-800"
                  //                         }`}
                  //                     >
                  //                       {props.children}
                  //                     </code>
                  //                   );
                  //                 } else {
                  //                   return (
                  //                     <code
                  //                       className={`block whitespace-pre-wrap ${props.className || ''}`}
                  //                       style={{
                  //                         fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  //                       }}
                  //                     >
                  //                       {props.children}
                  //                     </code>
                  //                   );
                  //                 }
                  //               }
                  //             }}
                  //           >
                  //             {message.content ?? ""}
                  //           </ReactMarkdown>
                  //         </div>
                  //       </div>

                  //       {/* Timestamp stays the same */}
                  //       <p
                  //         className={`text-xs mt-1 ${message.role === "user"
                  //           ? "text-yellow-100"
                  //           : "text-gray-500"
                  //           }`}
                  //       >
                  //         {message.timestamp.toLocaleTimeString([], {
                  //           hour: "2-digit",
                  //           minute: "2-digit",
                  //         })}
                  //       </p>
                  //     </div>
                  //   </div>
                  // </div>
                  <div
                  key={message.id}
                  className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
                >
                  {/* SF or U avatar on top */}
                  <div className="mb-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === "assistant"
                          ? "bg-gradient-to-br from-orange-400 to-orange-500"
                          : "bg-gray-400"
                      }`}
                    >
                      <span className="text-white font-bold text-xs">
                        {/* {message.role === "assistant" ? "SF" : "U"} */}
                        {message.role === "assistant" ? (
                            <Bot className="w-4 h-4 text-white" />
                          ) : (
                            <User className="w-4 h-4 text-white" />
                          )}
                      </span>
                    </div>
                  </div>

                  {/* Message bubble below */}
                  <div
                    className={`rounded-2xl px-4 py-1 ${
                      message.role === "user"
                        ? "chat-bubble-user max-w-[90%]"
                        : "chat-bubble-ai w-[480px] max-w-full"
                    }`}
                  >
                    {/* MARKDOWN MESSAGE RENDERING - UNCHANGED */}
                    <div className="overflow-hidden">
                      <div
                        className={`prose prose-sm max-w-none break-words leading-relaxed ${
                          message.role === "user"
                            ? "text-white prose-headings:text-white prose-strong:text-white prose-code:text-yellow-100 prose-pre:bg-yellow-600 prose-pre:text-white"
                            : "text-gray-800 prose-headings:text-gray-900 prose-strong:text-gray-900 prose-code:text-gray-700 prose-pre:bg-gray-100 prose-pre:text-gray-800"
                        } prose-pre:rounded-md prose-pre:p-3 prose-code:text-xs prose-code:bg-opacity-20 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:overflow-x-auto prose-pre:max-w-full prose-pre:whitespace-pre-wrap`}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                          components={{
                            pre: (props: any) => (
                              <div className="relative my-4">
                                <pre
                                  className={`overflow-x-auto max-w-full rounded-lg p-4 text-sm leading-relaxed border ${
                                    message.role === "user"
                                      ? "bg-yellow-800 text-yellow-100 border-yellow-600"
                                      : "bg-yellow-100 text-yellow-100 border-yellow-100"
                                  }`}
                                  style={{
                                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                                  }}
                                >
                                  {props.children}
                                </pre>
                                <button
                                  className="absolute top-2 right-2 px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-500 transition-colors"
                                  onClick={() => {
                                    const extractText = (element: any): string => {
                                      if (typeof element === 'string') return element;
                                      if (Array.isArray(element)) return element.map(extractText).join('');
                                      if (element?.props?.children) return extractText(element.props.children);
                                      return '';
                                    };
                                    const codeText = extractText(props.children);
                                    navigator.clipboard.writeText(codeText);
                                  }}
                                >
                                  Copy
                                </button>
                              </div>
                            ),
                            code: (props: any) => {
                              const isInline = !props.className || !props.className.includes('language-');
                              return isInline ? (
                                <code
                                  className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                                    message.role === "user"
                                      ? "bg-yellow-200 text-yellow-900"
                                      : "bg-gray-200 text-gray-800"
                                  }`}
                                >
                                  {props.children}
                                </code>
                              ) : (
                                <code
                                  className={`block whitespace-pre-wrap ${props.className || ''}`}
                                  style={{
                                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                                  }}
                                >
                                  {props.children}
                                </code>
                              );
                            }
                          }}
                        >
                          {message.content ?? ""}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* Timestamp below bubble */}
                    <p
                      className={`text-xs mt-1 ${
                        message.role === "user" ? "text-yellow-100" : "text-gray-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                ))}
              </div>
              {/* Loading Message */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs"><Bot className="w-4 h-4 text-white" /></span>
                    </div>
                    <div className="chat-bubble-ai rounded-2xl px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input */}
          {/* <div className="fixed bottom-0 right-0 w-[506px] bg-white border-t border-yellow-200"> */}
          <div className="fixed bottom-1 w-[32.3%] bg-white">
            <div className="w-full px-4 py-4">
              <form onSubmit={handleSubmit} className="flex space-x-4">
                <div className="flex-1 relative">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder="Ask about automata theory, conversions, or get help with your results..."
                    rows={2}
                    className="w-full px-4 py-3 pr-12 border border-yellow-200 rounded-xl resize-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent light-yellow-bg"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      className="w-4 h-4 text-gray-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>
              </form>


              {/* Input Suggestions */}
              {/* <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() =>
                setInputValue("Explain how DFA minimization works")
              }
              className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full hover:bg-yellow-200 transition-colors"
            >
              Explain how DFA minimization works
            </button>
            <button
              onClick={() =>
                setInputValue("What is the difference between NFA and DFA?")
              }
              className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full hover:bg-yellow-200 transition-colors"
            >
              What is the difference between NFA and DFA?
            </button>
            <button
              onClick={() => setInputValue("How does epsilon closure work?")}
              className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full hover:bg-yellow-200 transition-colors"
            >
              How does epsilon closure work?
            </button>
            <button
              onClick={() => setInputValue("Explain my conversion result")}
              className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full hover:bg-yellow-200 transition-colors"
            >
              Explain my conversion result
            </button>
          </div> */}
            </div>
          </div>
        </div>
      </div>
      {/* Conversion History Model */}
      {isConversionHistoryOpen &&
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          }}
        >
          <div
            className="bg-[#FFFFFF] w-full max-w-2xl rounded-lg shadow-xl relative overflow-y-auto"
            style={{ maxHeight: "80vh" }}
          >
            {/* Sticky header */}
            <div className="sticky top-0 z-10 bg-white px-6 pt-6 pb-2 rounded-t-lg">
              <button
                onClick={() => setIsConversionHistoryOpen(false)}
                className="absolute top-3 right-4 text-xl font-bold text-gray-600 hover:text-black"
              >
                &times;
              </button>
              <h1 className="text-2xl font-semibold mb-4">Conversion History</h1>
            </div>

            {/* Scrollable content with padding */}
            <div className="px-6 pb-6">
              {conversionHistoryExtractor()?.map((conversion, key) => (
                <div
                  key={key + 1}
                  className="mb-6 border border-gray-300 rounded-lg bg-[#FFF8DE] p-4 shadow"
                >
                  <h2 className="text-lg font-medium mb-2">🔢 Conversion {key + 1}</h2>
                  <p className="mb-2">
                    <span className="font-semibold">Context-Free Input String: </span>
                    <span className="bg-green-100 px-2 py-1 rounded text-sm font-mono">
                      {conversion.string}
                    </span>
                  </p>
                  <p className="font-semibold mb-1">Conversion Result:</p>
                  <div className="bg-white p-3 rounded-md text-sm font-mono whitespace-pre-wrap">
                    {conversion?.conversion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      }

      {isSimulatingModelOpen &&
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full sm:w-3/4 md:w-1/2 rounded-2xl shadow-2xl relative overflow-hidden border-t-[6px] border-[#FFD700] bg-[#FFF8DE]">

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-2xl font-bold"
              aria-label="Close"
            >
              ×
            </button>

            {/* Modal Content */}
            <div className="p-6">
              <div>
                <h1 className="text-2xl font-bold text-[#FFD700] mb-2 tracking-wide">{`${selectedModel} Simulating...`}</h1>
              </div>
              <br />
              <div className="mb-6">
                {convertResult != "" ? graphRenderHandler() : <p>Please perform an automata process first!!!</p>}
              </div>
              <div>
                <p className="font-mono text-lg tracking-wide bg-white px-4 py-2 rounded border border-[#FFD700] inline-block">Input Value: </p>
                {selectedModel == "PDA" || selectedModel == "DFA-Minimization" || selectedModel== "Regex-to-ε-NFA" || selectedModel == "e_NFA-to-DFA"? <p className="inline-block rounded-md border border-[#FFD700] bg-[#FFF8DE] px-4 py-2 text-lg font-mono tracking-wide shadow-sm">
                  {modelInput}
                  {/* {modelInput.split('').map((char, index) => (
                    <span
                      key={index}
                      style={{ color: index < highlightCount ? '#FFD700' : '#000' }}
                    >
                      {char}
                    </span>
                  ))} */}
                </p> : null}
                {/* {selectedModel === "PDA" || selectedModel === "DFA-Minimization" ? (
                  <p className="inline-block rounded-md border border-[#FFD700] bg-[#FFF8DE] px-4 py-2 text-lg font-mono tracking-wide shadow-sm">
                    {modelInput}
                  </p>
                ) : null} */}
              </div>
              <br />
              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={simulateBackward}
                  className="px-5 py-2 rounded-lg border border-[#FFD700] text-[#8B8000] hover:bg-[#FFECB3] transition-colors"
                >
                  Left
                </button>
                <button
                  onClick={simulateForward}
                  className="px-5 py-2 rounded-lg bg-[#FFD700] text-white font-semibold hover:bg-yellow-500 transition-colors"
                >
                  Right
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
}

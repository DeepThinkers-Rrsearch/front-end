"use client";

import { useState, useRef, useEffect, JSX } from "react";
import Link from "next/link";
import { PDAStack, DFA_MINI_Stack, E_NFA_Stack, REGEX_Stack } from "../../utils/stacks/index"
import { DFAGraphRenderer, ENFAGraphRenderer, MinimizedDFAGraphRenderer, PDAGraphRenderer } from "../../utils/graph_renderer/index"
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import { Copy, Eye, Plus, CheckCircle, CircleX } from "lucide-react";
import { useAppStore } from '../../utils/store';
import { extractEpsilonNfaTextFromImage } from "../../utils/text_extraction/e_nfa_image_to_text";
import { extract_dfa_text_from_image } from "../../utils/text_extraction/dfa_minimization_image_to_text";
import { DFASimulator } from "@/utils/graph_renderer/DFASimulator";

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
  const [isAccepting, setIsAccepting] = useState<boolean>(false);

  const [successMessage, setSuccessMessage] = useState<React.ReactNode>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [simulationInputString, setSimulationInputString] = useState("");


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
        setPdaTransition(dulplicateTransitionRemoverForPDA())
        break;
      default:
        break;
    }
  }, [convertResult])

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
      // http://127.0.0.1:8000/api/v1/convert
      process.env.NEXT_PUBLIC_BACKEND_URL

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/convert`, {
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
      setIsAccepting(data.isAccepted)

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
  };

  const conversionHistoryHandler = () => {
    setIsConversionHistoryOpen(true)
  }

  const conversionHistoryExtractor = (): Array<StackItem> => {
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

  // const simulationModelHandler = () => {

  //   setIsSimulatingModelOpen(true)
  // }

  const simulationModelHandler = () => {
    if (selectedModel === "DFA-Minimization") {
      // For DFA Minimization, we need an input string to simulate
      // const inputString = prompt("Enter a string to simulate on the DFA:");
      // if (inputString !== null) {
      //   setSimulationInputString(inputString);
      //   setIsSimulatingModelOpen(true);
      // }
          setIsSimulatingModelOpen(true);
    } else {
      // For other models, keep existing behavior
      setIsSimulatingModelOpen(true);
    }
  };

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
    setHighlightCount(0)
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

  const dulplicateTransitionRemoverForPDA = () => {
    const seen = new Set<string>();
    const lines = convertResult
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== ''); // Remove empty lines

    const uniqueLines = lines.filter(line => {
      if (seen.has(line)) return false;
      seen.add(line);
      return true;
    });

    return uniqueLines.join('\n');
  }

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
                    onChange={(e) => {
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
                  <span className="text-sm font-medium">{model}</span>
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

            <div className="mt-9 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2 text-center">Quick Actions</h4>
              <div className="flex flex-col items-center gap-2">
                <button className="flex items-center gap-2 text-sm bg-yellow-50 text-yellow-700 px-3 py-2 rounded-md border border-yellow-300 hover:bg-yellow-200 transition-colors w-[200px]" onClick={clearChatHistoryHandler}>
                  <span className="mr-1">🧹</span> Clear Chat History
                </button>
                <button className="flex items-center gap-2 text-sm bg-yellow-100 text-yellow-700 px-3 py-2 rounded-md border border-yellow-300 hover:bg-yellow-300 transition-colors w-[200px]" onClick={conversionHistoryHandler}>
                  📄 View Conversion History
                </button>
                <button className="flex items-center gap-2 text-sm bg-yellow-200 text-yellow-700 px-3 py-2 rounded-md border border-yellow-300 hover:bg-yellow-400 transition-colors w-[200px]" onClick={simulationModelHandler}>
                  <span className="mr-8">▶️</span> Simulate
                </button>
                <Link
                  href="/instructions"
                  className="flex items-center gap-2 text-sm bg-yellow-400 text-white px-3 py-2 rounded-md border border-yellow-300 hover:bg-yellow-500 transition-colors w-[200px]"
                >
                  <span className="mr-1">📘</span> View Documentation
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Main Chat Area */}
        {/* <div className="flex-1 px-4 py-6"> */}
        <div className="w-4/9 px-4 py-6 overflow-y-auto">
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
                Input for {selectedModel}
              </label>
              <div className="space-y-2">
                <textarea
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  placeholder={getModelPlaceholder(selectedModel)}
                  rows={2}
                  className="w-full px-3 py-2 border border-yellow-300 bg-white rounded-lg text-sm resize-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors"
                />
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
                      {selectedModel == "PDA" ? dulplicateTransitionRemoverForPDA() : convertResult}
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
                <br />
                {selectedModel == "PDA" ? isAccepting ? <div className="w-54 text-green-800 bg-green-100 border border-green-500 text-sm mt-1 px-3 py-2 rounded-md">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Input string is accepted!</span>
                  </div>
                </div> : <div className="w-100 text-red-800 bg-red-100 border border-red-500 text-sm mt-1 px-3 py-2 rounded-md">
                  <div className="flex items-center gap-2">
                    <CircleX className="w-4 h-4 text-red-600" />
                    <span>Input rejected: Not in final state or stack not empty!</span>
                  </div>
                </div> : <></>}
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
          <div className="h-full flex flex-col gap-3">
            <div className="font-semibold text-yellow-600 border-b border-yellow-200 pb-0">
              Messaging
            </div>
            <div className="h-[520px] overflow-y-auto border-t border-yellow-300 px-1 py-2 scroll-smooth">
              <div className="flex flex-col gap-y-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                  >
                    <div
                      className={`flex max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl ${  // ← UPDATE THIS LINE
                        message.role === "user" ? "flex-row-reverse" : "flex-row"
                        } items-start space-x-2`}
                    >
                      {/* Avatar section stays the same */}
                      <div
                        className={`flex-shrink-0 ${message.role === "user" ? "ml-3" : "mr-3"
                          }`}
                      >
                        {message.role === "assistant" ? (
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs">SF</span>
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs">U</span>
                          </div>
                        )}
                      </div>

                      {/* REPLACE THIS ENTIRE MESSAGE BUBBLE SECTION: */}
                      <div
                        className={`rounded-2xl px-4 py-1 ${  // ← REMOVE max-w-xs lg:max-w-md from here
                          message.role === "user"
                            ? "chat-bubble-user"
                            : "chat-bubble-ai"
                          }`}
                      >
                        {/* REPLACE the existing content section with: */}
                        <div className="overflow-hidden">
                          <div
                            className={`prose prose-sm max-w-none break-words leading-relaxed ${message.role === "user"
                              ? "text-white prose-headings:text-white prose-strong:text-white prose-code:text-yellow-100 prose-pre:bg-yellow-600 prose-pre:text-white"
                              : "text-gray-800 prose-headings:text-gray-900 prose-strong:text-gray-900 prose-code:text-gray-700 prose-pre:bg-gray-100 prose-pre:text-gray-800"
                              } prose-pre:rounded-md prose-pre:p-3 prose-code:text-xs prose-code:bg-opacity-20 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:overflow-x-auto prose-pre:max-w-full prose-pre:whitespace-pre-wrap`}
                          >
                            {/* <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          pre: ({ children, ...props }) => (
                            <pre 
                              {...props} 
                              className="overflow-x-auto max-w-full whitespace-pre-wrap break-words text-xs leading-relaxed bg-gray-100 p-3 rounded-md"
                            >
                              {children}
                            </pre>
                          ),
                          code: ({ children, className, ...props }) => {
                            // Check if it's inline code by looking at className
                            const isInline = !className || !className.includes('language-');
                            
                            if (isInline) {
                              return (
                                <code 
                                  {...props} 
                                  className="break-words bg-gray-200 px-1 py-0.5 rounded text-xs"
                                >
                                  {children}
                                </code>
                              );
                            } else {
                              return (
                                <code 
                                  {...props} 
                                  className="block whitespace-pre-wrap break-words text-xs"
                                >
                                  {children}
                                </code>
                              );
                            }
                          }
                        }}
                      >
                        {message.content ?? ""}
                      </ReactMarkdown> */}
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                              components={{
                                pre: (props: any) => (
                                  <div className="relative my-4">
                                    <pre
                                      className={`overflow-x-auto max-w-full rounded-lg p-4 text-sm leading-relaxed border ${message.role === "user"
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
                                        // Extract text content for copying
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

                                  if (isInline) {
                                    return (
                                      <code
                                        className={`px-1.5 py-0.5 rounded text-xs font-mono ${message.role === "user"
                                          ? "bg-yellow-200 text-yellow-900"
                                          : "bg-gray-200 text-gray-800"
                                          }`}
                                      >
                                        {props.children}
                                      </code>
                                    );
                                  } else {
                                    return (
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
                                }
                              }}
                            >
                              {message.content ?? ""}
                            </ReactMarkdown>
                          </div>
                        </div>

                        {/* Timestamp stays the same */}
                        <p
                          className={`text-xs mt-1 ${message.role === "user"
                            ? "text-yellow-100"
                            : "text-gray-500"
                            }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Loading Message */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">SF</span>
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
          <div className="fixed bottom-0 right-0 w-[506px] bg-white border-t border-yellow-200">
            <div className="w-full px-4 py-4">
              <form onSubmit={handleSubmit} className="flex space-x-4">
                <div className="flex-1 relative">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
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
                {selectedModel == "PDA" || selectedModel == "DFA-Minimization" || selectedModel == "Regex-to-ε-NFA" || selectedModel == "e_NFA-to-DFA" ? <p className="inline-block rounded-md border border-[#FFD700] bg-[#FFF8DE] px-4 py-2 text-lg font-mono tracking-wide shadow-sm">
                  {/* {modelInput} */}
                  {(modelInput + 'ε').split('').map((char, index) => (
                    <span
                      key={index}
                      style={{ color: index < highlightCount ? '#FFD700' : '#000' }}
                    >
                      {char}
                    </span>
                  ))}
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

      {isSimulatingModelOpen && selectedModel === "DFA-Minimization" && (
        <DFASimulator
          minimizedDfaString={convertResult}
          isOpen={isSimulatingModelOpen}
          onClose={() => {
            setIsSimulatingModelOpen(false);
          }}
      />
      )}
    </div>
  );
}

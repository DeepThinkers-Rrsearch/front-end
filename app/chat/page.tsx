"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

// Model types
const MODELS = {
  DFA_MINIMIZATION: "DFA-Minimization",
  REGEX_TO_E_NFA: "Regex-to-ε-NFA",
  E_NFA_TO_DFA: "ε-NFA-to-DFA",
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getModelPlaceholder = (model: ModelType) => {
    switch (model) {
      case MODELS.DFA_MINIMIZATION:
        return "Enter your DFA description (states, transitions, initial/final states)\nExample: A: a-->A, b-->B; B: a-->A, b-->A; in:A; fi:A";
      case MODELS.REGEX_TO_E_NFA:
        return "Enter your regular expression\nExample: a*b+ or (a|b)* or a+b*c";
      case MODELS.E_NFA_TO_DFA:
        return "Enter your ε-NFA description\nExample: q0: a-->q1, ε-->q2; q1: b-->q2; q2: ε-->q0; in:q0; fi:q2";
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

    try {
      // Demo API call - replace with actual API endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/convert`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input_text: modelInput,
            model_type: selectedModel,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setConvertResult(data.result);
    } catch (error) {
      console.error("Conversion failed:", error);

      // Demo fallback responses for different models
      const demoResults = {
        [MODELS.DFA_MINIMIZATION]: `Demo: Minimized DFA for input "${modelInput}"\n\nStates: \\{q0, q1\\}\nAlphabet: \\{a, b\\}\nTransitions:\n  δ(q0, a) = q0\n  δ(q0, b) = q1\n  δ(q1, a) = q0\n  δ(q1, b) = q1\nInitial State: q0\nFinal States: \\{q1\\}\n\nMinimization complete! Original had 3 states, minimized has 2 states.`,
        [MODELS.REGEX_TO_E_NFA]: `Demo: ε-NFA for regex "${modelInput}"\n\nStates: \\{q0, q1, q2, q3\\}\nAlphabet: \\{${modelInput
          .replace(/[^a-zA-Z]/g, "")
          .split("")
          .join(", ")}\\}\nTransitions:\n  δ(q0, ε) = \\{q1\\}\n  δ(q1, ${
          modelInput.charAt(0) || "a"
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

      // Call the API
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

      // Fallback error message
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

  return (
    <div className="min-h-screen light-yellow-bg">
      <div className="flex max-w-7xl mx-auto">
        {/* Left Sidebar - Model Selection */}
        <div className="hidden lg:block w-80 bg-white border-r border-yellow-200 min-h-screen">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Conversion Models
            </h2>

            {/* Model Selection */}
            <div className="space-y-3 mb-6">
              {Object.values(MODELS).map((model) => (
                <label
                  key={model}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedModel === model
                      ? "border-yellow-400 bg-yellow-50 text-yellow-700"
                      : "border-gray-200 hover:border-yellow-300 hover:bg-yellow-25"
                  }`}
                >
                  <input
                    type="radio"
                    name="model"
                    value={model}
                    checked={selectedModel === model}
                    onChange={(e) =>
                      setSelectedModel(e.target.value as ModelType)
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                      selectedModel === model
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

            {/* Model Input Field */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Model Input</h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Input for {selectedModel}
                </label>
                <textarea
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  placeholder={getModelPlaceholder(selectedModel)}
                  rows={6}
                  className="w-full px-3 py-2 border border-yellow-300 bg-yellow-50 rounded-lg text-sm resize-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors"
                />
                <button
                  onClick={handleConvert}
                  disabled={!modelInput.trim() || isConverting}
                  className="w-full mt-3 px-4 py-2 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isConverting ? "Converting..." : "Convert"}
                </button>
              </div>
            </div>

            {/* Conversion Result */}
            {convertResult && (
              <div className="mt-4 space-y-2">
                <h4 className="text-md font-medium text-gray-900">
                  Conversion Result
                </h4>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg max-h-64 overflow-y-auto">
                  <pre className="text-xs text-green-800 whitespace-pre-wrap font-mono">
                    {convertResult}
                  </pre>
                </div>
              </div>
            )}

            {/* Selected Model Info */}
            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
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
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 px-4 py-6">
          <div className="space-y-6 mb-24">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-xs lg:max-w-md ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  } items-start space-x-3`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 ${
                      message.role === "user" ? "ml-3" : "mr-3"
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

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "chat-bubble-user"
                        : "chat-bubble-ai"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        message.role === "user" ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === "user"
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
      </div>

      {/* Chat Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about automata theory, conversions, or get help with your results..."
                className="w-full px-4 py-3 pr-12 border border-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent light-yellow-bg"
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
          <div className="mt-3 flex flex-wrap gap-2">
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
          </div>
        </div>
      </div>

      {/* Sidebar with Automata Features */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 hidden xl:block">
        <div className="bg-white rounded-lg shadow-lg p-4 w-64 border border-yellow-200">
          <h3 className="font-semibold text-gray-900 mb-3">
            Automata Features
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-600">Neural network models</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-600">Image input processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-600">Graphical visualization</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-600">Educational AI assistance</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full text-left text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-100 transition-colors">
                Clear chat history
              </button>
              <button className="w-full text-left text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-100 transition-colors">
                View conversion history
              </button>
              <Link
                href="/instructions"
                className="block w-full text-left text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-100 transition-colors"
              >
                View documentation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

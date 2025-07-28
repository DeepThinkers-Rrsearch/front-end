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
  E_NFA_TO_DFA: "e_NFA-to-DFA",
  PDA: "PDA",
} as const;

type ModelType = (typeof MODELS)[keyof typeof MODELS];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm Zayd, your AI assistant. How can I help you today?",
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

  const handleConvert = async () => {
    if (!modelInput.trim() || isConverting) return;

    setIsConverting(true);
    setConvertResult("");

    try {
      // Demo API call - replace with actual API endpoint
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
    } catch (error) {
      console.error("Conversion failed:", error);

      // Demo fallback responses for different models
      const demoResults = {
        [MODELS.DFA_MINIMIZATION]: `Demo: Minimized DFA for input "${modelInput}"\nStates: q0, q1, q2\nTransitions: δ(q0,a)=q1, δ(q1,b)=q2\nAccepting states: {q2}`,
        [MODELS.REGEX_TO_E_NFA]: `Demo: ε-NFA for regex "${modelInput}"\nStates: q0, q1, q2, q3\nε-transitions: q0→q1, q2→q3\nTransitions: δ(q1,${
          modelInput.charAt(0) || "a"
        })=q2`,
        [MODELS.E_NFA_TO_DFA]: `Demo: DFA converted from ε-NFA "${modelInput}"\nStates: {q0}, {q1,q2}, {q3}\nTransitions: δ({q0},a)={q1,q2}\nAccepting states: {{q3}}`,
        [MODELS.PDA]: `Demo: PDA for input "${modelInput}"\nStates: q0, q1, q2\nStack alphabet: {Z, A, B}\nTransitions: δ(q0,a,Z)=(q1,AZ)\nAccepting by empty stack`,
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
          "Sorry, I'm having trouble responding right now. Please try again.",
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
      {/* Chat Header */}
      {/* <div className="bg-white border-b border-yellow-200 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Chat with Zayd
                </h1>
                <p className="text-sm text-gray-500">AI Assistant • Online</p>
              </div>
            </div>

            <Link
              href="/instructions"
              className="text-sm bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              View Instructions
            </Link>
          </div>
        </div>
      </div> */}

      <div className="flex max-w-7xl mx-auto">
        {/* Left Sidebar - Model Selection */}
        <div className="hidden lg:block w-80 bg-white border-r border-yellow-200 min-h-screen">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Models</h2>

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
                  placeholder={`Enter input for ${selectedModel}...`}
                  rows={4}
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
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <pre className="text-sm text-green-800 whitespace-pre-wrap font-mono">
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
                        <span className="text-white font-bold text-xs">Z</span>
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
                    <span className="text-white font-bold text-xs">Z</span>
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
                placeholder="Type your message here..."
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
              onClick={() => setInputValue("What services does Zayd.ai offer?")}
              className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full hover:bg-yellow-200 transition-colors"
            >
              What services does Zayd.ai offer?
            </button>
            <button
              onClick={() =>
                setInputValue("How does the AI conversation work?")
              }
              className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full hover:bg-yellow-200 transition-colors"
            >
              How does the AI conversation work?
            </button>
            <button
              onClick={() => setInputValue("Can you help me in Arabic?")}
              className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full hover:bg-yellow-200 transition-colors"
            >
              Can you help me in Arabic?
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar with Chat Features */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 hidden xl:block">
        <div className="bg-white rounded-lg shadow-lg p-4 w-64 border border-yellow-200">
          <h3 className="font-semibold text-gray-900 mb-3">Chat Features</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-600">Real-time responses</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-600">Bilingual support</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-600">Context awareness</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-600">Smart suggestions</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full text-left text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-100 transition-colors">
                Clear conversation
              </button>
              <button className="w-full text-left text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-100 transition-colors">
                Download chat
              </button>
              <Link
                href="/instructions"
                className="block w-full text-left text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-100 transition-colors"
              >
                View help
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

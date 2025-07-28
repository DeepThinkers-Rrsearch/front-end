# State Forge - Next.js Frontend Architecture

## 📋 Overview

Replace the Streamlit `app.py` with a modern Next.js frontend that handles:

- ✅ Model selection and conversion
- ✅ Image upload and text extraction
- ✅ LangChain conversation management
- ✅ Chat interface and history
- ✅ Diagram visualization
- ✅ Backend API integration

## 🏗️ Project Structure

```
state-forge-ui/
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── .env.local
├── public/
│   ├── favicon.ico
│   └── icons/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── card.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── spinner.tsx
│   │   ├── conversion/
│   │   │   ├── ModelSelector.tsx
│   │   │   ├── InputArea.tsx
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── ConversionResult.tsx
│   │   │   └── DiagramViewer.tsx
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── ChatHistory.tsx
│   │   ├── history/
│   │   │   ├── ConversionHistory.tsx
│   │   │   └── HistoryItem.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   ├── storage.ts
│   │   └── langchain/
│   │       ├── setup.ts
│   │       ├── promptTemplates.ts
│   │       └── conversationManager.ts
│   ├── hooks/
│   │   ├── useConversion.ts
│   │   ├── useChat.ts
│   │   ├── useHistory.ts
│   │   └── useImageExtraction.ts
│   ├── stores/
│   │   ├── conversionStore.ts
│   │   ├── chatStore.ts
│   │   └── historyStore.ts
│   └── styles/
│       └── globals.css
```

## 🔧 Configuration Files

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ["localhost"],
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL || "http://localhost:8000",
  },
};

module.exports = nextConfig;
```

### .env.local

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
GOOGLE_API_KEY=your_google_api_key_here
LANGSMITH_API_KEY=your_langsmith_api_key_here
LANGSMITH_TRACING=true
```

## 🎯 Core Type Definitions

### src/lib/types.ts

```typescript
export enum ModelType {
  DFA_MINIMIZATION = "DFA-Minimization",
  REGEX_TO_E_NFA = "Regex-to-ε-NFA",
  E_NFA_TO_DFA = "e_NFA-to-DFA",
  PDA = "PDA",
}

export interface ConversionRequest {
  input_text: string;
  model_type: ModelType;
}

export interface ConversionResponse {
  success: boolean;
  result?: string;
  diagram_base64?: string;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  model_type?: ModelType;
}

export interface ConversionHistory {
  id: string;
  input: string;
  result: string;
  model_type: ModelType;
  diagram_base64?: string;
  timestamp: Date;
}

export interface AppState {
  selectedModel: ModelType;
  inputText: string;
  isConverting: boolean;
  conversionResult?: ConversionResponse;
  chatMessages: ChatMessage[];
  conversationHistory: ConversionHistory[];
}
```

## 🌐 API Integration

### src/lib/api.ts

```typescript
import { ConversionRequest, ConversionResponse } from "./types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl;
  }

  async healthCheck(): Promise<{ status: string; available_models: string[] }> {
    const response = await fetch(`${this.baseUrl}/`);
    if (!response.ok) {
      throw new Error("Backend not available");
    }
    return response.json();
  }

  async convert(request: ConversionRequest): Promise<ConversionResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/convert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Conversion failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getAvailableModels(): Promise<{
    models: Array<{ name: string; description: string }>;
  }> {
    const response = await fetch(`${this.baseUrl}/api/v1/models`);
    if (!response.ok) {
      throw new Error("Failed to fetch models");
    }
    return response.json();
  }
}

export const apiClient = new ApiClient();
```

## 🧠 LangChain Integration

### src/lib/langchain/setup.ts

```typescript
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

export class LangChainService {
  private llm: ChatGoogleGenerativeAI | ChatOpenAI;

  constructor() {
    // Use Google Gemini or OpenAI based on available API keys
    if (process.env.GOOGLE_API_KEY) {
      this.llm = new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_API_KEY,
        modelName: "gemini-pro",
        temperature: 0.7,
      });
    } else if (process.env.OPENAI_API_KEY) {
      this.llm = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: "gpt-3.5-turbo",
        temperature: 0.7,
      });
    } else {
      throw new Error("No LLM API key provided");
    }
  }

  async createConversationChain(systemPrompt: string) {
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemPrompt],
      ["human", "{input}"],
    ]);

    return RunnableSequence.from([prompt, this.llm]);
  }

  getLLM() {
    return this.llm;
  }
}

export const langChainService = new LangChainService();
```

### src/lib/langchain/promptTemplates.ts

```typescript
import { ModelType } from "../types";

export const PROMPT_TEMPLATES = {
  [ModelType.REGEX_TO_E_NFA]: `
You are an expert in formal language theory and automata. You help users understand regex to ε-NFA conversions.

Context: The user is working with regular expressions and converting them to epsilon non-deterministic finite automata.

Guidelines:
- Explain concepts clearly and step-by-step
- Provide examples when helpful
- Focus on the conversion process and automata theory
- Help debug any issues with their regex patterns

Current conversion context: {context}
`,

  [ModelType.DFA_MINIMIZATION]: `
You are an expert in automata theory specializing in DFA minimization algorithms.

Context: The user is working with deterministic finite automata and minimization techniques.

Guidelines:
- Explain DFA minimization steps clearly
- Help with state equivalence and partitioning
- Provide insights into optimization techniques
- Assist with debugging DFA structures

Current conversion context: {context}
`,

  [ModelType.E_NFA_TO_DFA]: `
You are an expert in automata theory specializing in NFA to DFA conversions.

Context: The user is converting epsilon non-deterministic finite automata to deterministic finite automata.

Guidelines:
- Explain the subset construction algorithm
- Help with epsilon closure calculations
- Clarify state transitions and determinization
- Assist with understanding the conversion process

Current conversion context: {context}
`,

  [ModelType.PDA]: `
You are an expert in formal language theory specializing in pushdown automata and context-free grammars.

Context: The user is working with pushdown automata for context-free language recognition.

Guidelines:
- Explain PDA operations and stack management
- Help with context-free grammar relationships
- Clarify parsing strategies and language recognition
- Assist with understanding stack-based computations

Current conversion context: {context}
`,
};

export function getPromptTemplate(modelType: ModelType): string {
  return (
    PROMPT_TEMPLATES[modelType] || PROMPT_TEMPLATES[ModelType.REGEX_TO_E_NFA]
  );
}
```

## 🎨 Core Components

### src/components/conversion/ModelSelector.tsx

```typescript
"use client";

import { ModelType } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

export default function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  const models = [
    { value: ModelType.DFA_MINIMIZATION, label: "DFA Minimization" },
    { value: ModelType.REGEX_TO_E_NFA, label: "Regex to ε-NFA" },
    { value: ModelType.E_NFA_TO_DFA, label: "ε-NFA to DFA" },
    { value: ModelType.PDA, label: "Push Down Automata" },
  ];

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Choose Converter
      </label>
      <Select
        value={selectedModel}
        onValueChange={(value) => onModelChange(value as ModelType)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.value} value={model.value}>
              {model.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

### src/components/conversion/ImageUpload.tsx

```typescript
"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useImageExtraction } from "@/hooks/useImageExtraction";
import { ModelType } from "@/lib/types";

interface ImageUploadProps {
  modelType: ModelType;
  onTextExtracted: (text: string) => void;
}

export default function ImageUpload({
  modelType,
  onTextExtracted,
}: ImageUploadProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const { extractText, isExtracting } = useImageExtraction();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        // Display image preview
        const imageUrl = URL.createObjectURL(file);
        setUploadedImage(imageUrl);

        // Extract text from image
        try {
          const extractedText = await extractText(file, modelType);
          onTextExtracted(extractedText);
        } catch (error) {
          console.error("Text extraction failed:", error);
        }
      }
    },
    [extractText, modelType, onTextExtracted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".svg"],
    },
    multiple: false,
  });

  // Only show for DFA and e-NFA models
  if (
    ![ModelType.DFA_MINIMIZATION, ModelType.E_NFA_TO_DFA].includes(modelType)
  ) {
    return null;
  }

  return (
    <Card className="p-6">
      <div
        {...getRootProps()}
        className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${
          isDragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }
      `}
      >
        <input {...getInputProps()} />

        {isExtracting ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-sm text-gray-600">
              Extracting text from image...
            </p>
          </div>
        ) : uploadedImage ? (
          <div className="flex flex-col items-center">
            <Image className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-sm text-gray-600">
              Image uploaded successfully!
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={(e) => {
                e.stopPropagation();
                setUploadedImage(null);
              }}
            >
              Upload Different Image
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Upload image of{" "}
              {modelType === ModelType.DFA_MINIMIZATION ? "DFA" : "ε-NFA"}
            </p>
            <p className="text-sm text-gray-500">
              Drag & drop an image here, or click to select
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supports PNG, JPG, JPEG, SVG
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
```

### src/components/conversion/InputArea.tsx

```typescript
"use client";

import { ModelType } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  modelType: ModelType;
}

const placeholders = {
  [ModelType.DFA_MINIMIZATION]:
    "Enter your DFA description (states, transitions, etc.)",
  [ModelType.REGEX_TO_E_NFA]: "Enter your regular expression",
  [ModelType.E_NFA_TO_DFA]: "Enter your ε-NFA description",
  [ModelType.PDA]: "Enter your language example string...\nEg:- aabb (a^nb^n)",
};

export default function InputArea({
  value,
  onChange,
  modelType,
}: InputAreaProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Input
      </label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholders[modelType]}
        className="min-h-[120px] w-full"
        rows={6}
      />
    </div>
  );
}
```

## 🎛️ State Management (Zustand)

### src/stores/conversionStore.ts

```typescript
import { create } from "zustand";
import { ModelType, ConversionResponse, ConversionHistory } from "@/lib/types";
import { apiClient } from "@/lib/api";

interface ConversionState {
  selectedModel: ModelType;
  inputText: string;
  isConverting: boolean;
  result: ConversionResponse | null;
  history: ConversionHistory[];

  setSelectedModel: (model: ModelType) => void;
  setInputText: (text: string) => void;
  convert: () => Promise<void>;
  clearResult: () => void;
  addToHistory: (item: ConversionHistory) => void;
}

export const useConversionStore = create<ConversionState>((set, get) => ({
  selectedModel: ModelType.REGEX_TO_E_NFA,
  inputText: "",
  isConverting: false,
  result: null,
  history: [],

  setSelectedModel: (model) => set({ selectedModel: model }),
  setInputText: (text) => set({ inputText: text }),
  clearResult: () => set({ result: null }),

  convert: async () => {
    const { selectedModel, inputText } = get();

    if (!inputText.trim()) {
      return;
    }

    set({ isConverting: true });

    try {
      const result = await apiClient.convert({
        input_text: inputText,
        model_type: selectedModel,
      });

      set({ result, isConverting: false });

      // Add to history if successful
      if (result.success && result.result) {
        const historyItem: ConversionHistory = {
          id: Date.now().toString(),
          input: inputText,
          result: result.result,
          model_type: selectedModel,
          diagram_base64: result.diagram_base64,
          timestamp: new Date(),
        };

        get().addToHistory(historyItem);
      }
    } catch (error) {
      set({
        result: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        isConverting: false,
      });
    }
  },

  addToHistory: (item) =>
    set((state) => ({
      history: [item, ...state.history].slice(0, 50), // Keep last 50 items
    })),
}));
```

## 🎯 Custom Hooks

### src/hooks/useImageExtraction.ts

```typescript
import { useState } from "react";
import Tesseract from "tesseract.js";
import { ModelType } from "@/lib/types";

export function useImageExtraction() {
  const [isExtracting, setIsExtracting] = useState(false);

  const extractText = async (
    file: File,
    modelType: ModelType
  ): Promise<string> => {
    setIsExtracting(true);

    try {
      const {
        data: { text },
      } = await Tesseract.recognize(file, "eng", {
        logger: (m) => console.log(m),
      });

      // Basic text processing based on model type
      let processedText = text.trim();

      if (modelType === ModelType.DFA_MINIMIZATION) {
        // Process DFA-specific text extraction
        processedText = processDFAText(processedText);
      } else if (modelType === ModelType.E_NFA_TO_DFA) {
        // Process ε-NFA-specific text extraction
        processedText = processENFAText(processedText);
      }

      return processedText;
    } catch (error) {
      throw new Error("Failed to extract text from image");
    } finally {
      setIsExtracting(false);
    }
  };

  return { extractText, isExtracting };
}

function processDFAText(text: string): string {
  // Add DFA-specific text processing logic
  return text.replace(/\s+/g, " ").trim();
}

function processENFAText(text: string): string {
  // Add ε-NFA-specific text processing logic
  return text.replace(/\s+/g, " ").trim();
}
```

## 📱 Main Application Layout

### src/app/page.tsx

```typescript
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModelSelector from "@/components/conversion/ModelSelector";
import ImageUpload from "@/components/conversion/ImageUpload";
import InputArea from "@/components/conversion/InputArea";
import ConversionResult from "@/components/conversion/ConversionResult";
import ChatInterface from "@/components/chat/ChatInterface";
import ConversionHistory from "@/components/history/ConversionHistory";
import { useConversionStore } from "@/stores/conversionStore";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

export default function HomePage() {
  const {
    selectedModel,
    inputText,
    isConverting,
    result,
    setSelectedModel,
    setInputText,
    convert,
  } = useConversionStore();

  const handleConvert = async () => {
    if (!inputText.trim()) {
      alert("Please enter something to convert.");
      return;
    }
    await convert();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">⚙️ State Forge</h1>
            <div className="text-sm text-gray-500">
              Automata Theory Converter
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Conversion */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Conversion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />

                <ImageUpload
                  modelType={selectedModel}
                  onTextExtracted={setInputText}
                />

                <InputArea
                  value={inputText}
                  onChange={setInputText}
                  modelType={selectedModel}
                />

                <Button
                  onClick={handleConvert}
                  disabled={isConverting || !inputText.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isConverting ? "Converting..." : "Convert"}
                </Button>
              </CardContent>
            </Card>

            {result && <ConversionResult result={result} />}
          </div>

          {/* Right Column - Tabs */}
          <div className="space-y-6">
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-6">
                <ChatInterface modelType={selectedModel} />
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <ConversionHistory />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <ScrollToTop />
    </div>
  );
}
```

## 🚀 Setup Instructions

### 1. Create Next.js Project

```bash
npx create-next-app@latest state-forge-ui --typescript --tailwind --eslint --app
cd state-forge-ui
```

### 2. Install Dependencies

```bash
npm install @langchain/core @langchain/openai @langchain/google-genai langchain zustand react-dropzone tesseract.js react-hot-toast framer-motion recharts lucide-react class-variance-authority clsx tailwind-merge
```

### 3. Setup Environment Variables

```bash
# Create .env.local
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local
echo "GOOGLE_API_KEY=your_google_api_key_here" >> .env.local
echo "LANGSMITH_API_KEY=your_langsmith_api_key_here" >> .env.local
echo "LANGSMITH_TRACING=true" >> .env.local
```

### 4. Run Development Server

```bash
npm run dev
```

## ✨ Key Features

- **🎯 Model Selection**: Dropdown to choose conversion type
- **📤 Image Upload**: Drag & drop with OCR text extraction
- **💬 Chat Interface**: LangChain-powered conversations
- **📊 Visualization**: SVG diagram display with download
- **📝 History**: Track all conversions and chat sessions
- **🎨 Modern UI**: Tailwind CSS with shadcn/ui components
- **📱 Responsive**: Works on desktop, tablet, and mobile
- **⚡ Performance**: Optimized with Next.js 14 and React 18

## 🔄 Integration Flow

1. **Frontend** ➡️ **Backend API** (model inference only)
2. **Frontend** ➡️ **LangChain** (conversation management)
3. **Frontend** ➡️ **Local Storage** (history persistence)
4. **Frontend** ➡️ **Tesseract.js** (image text extraction)

This architecture completely replaces your Streamlit `app.py` with a modern, scalable Next.js frontend! 🚀

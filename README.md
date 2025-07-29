# State Forge - Comprehensive Automata Theory & Formal Language Conversions

State Forge is a comprehensive Next.js-based web application for automata theory and formal language conversions. It leverages advanced transformer-based neural networks to perform various state machine transformations and provides intelligent conversational AI assistance for educational and research purposes.

## 🎯 Core Features

### Four Main Conversion Models

1. **DFA Minimization** - Converts DFA to its minimized equivalent using custom transformer models
2. **Regex to ε-NFA** - Transforms regular expressions to Epsilon Non-deterministic Finite Automata
3. **ε-NFA to DFA** - Converts Epsilon NFA to Deterministic Finite Automaton
4. **Push Down Automata (PDA)** - Generates PDA transitions for context-free languages

### Advanced Capabilities

- **AI-Powered Conversions** - Advanced neural networks with Google Gemini 2.0 Flash integration
- **Image Input Processing** - Upload PNG, JPG, JPEG, SVG images with AI text extraction
- **Graphical Visualization** - Interactive Graphviz-powered state diagrams
- **Conversion History** - Specialized stack data structures for each conversion type
- **Conversational AI** - LangGraph-powered conversation management with educational explanations

## 🚀 Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini 2.0 Flash, LangChain, LangGraph
- **Backend Models**: PyTorch-based transformer models
- **Visualization**: Graphviz integration

## 🛠 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📁 Project Structure

```
fyp-front/
├── app/
│   ├── api/
│   │   ├── chat/          # AI conversation endpoints
│   │   └── convert/       # Conversion API endpoints
│   ├── chat/              # Main conversion interface
│   ├── instructions/      # Documentation and help
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Homepage
├── lib/
│   ├── llm.ts            # LLM integration
│   └── prompt_templates/ # AI prompt templates
└── public/               # Static assets
```

## 🎨 Pages

- **Homepage** (`/`) - Application overview and team information
- **Conversions** (`/chat`) - Main conversion interface with AI assistant
- **Documentation** (`/instructions`) - Complete usage guide and examples

## 🔧 Features in Detail

### Conversion Models

Each model supports specific input formats and provides detailed output:

- **DFA Minimization**: `A: a-->A, b-->B; B: a-->A, b-->A; in:A; fi:A`
- **Regex to ε-NFA**: `a*b+`, `(a|b)*`, `a+b*c`
- **ε-NFA to DFA**: `q0: a-->q1, ε-->q2; q1: b-->q2; q2: ε-->q0; in:q0; fi:q2`
- **PDA**: `aabb` (representing a^n b^n patterns)

### AI Assistant

The conversational AI provides:

- Explanations of conversion results
- Step-by-step algorithm breakdowns
- Educational guidance for automata theory concepts
- Context-aware responses based on user conversions

## 👥 Development Team

**Project Supervisors**

- Principal Supervisor - Leading automata theory research and AI-powered educational tools
- Co-Supervisor - Specializing in transformer networks and formal language processing

**Development Team**

- Developer 1 - Lead Developer (Neural networks & Streamlit integration)
- Developer 2 - ML Engineer (PyTorch models & transformer architecture)
- Developer 3 - AI Specialist (Conversational AI & LangGraph integration)
- Developer 4 - Frontend Developer (UI/UX design & visualization systems)

## 📚 Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [PyTorch Documentation](https://pytorch.org/docs/) - Neural network models and training
- [LangChain Documentation](https://docs.langchain.com/) - AI conversation management
- [Graphviz Documentation](https://graphviz.org/documentation/) - State diagram visualization

## 🏛️ Academic Context

This project is part of automata theory and formal language processing research, focusing on:

- AI-powered educational tools for computer science
- Transformer-based neural networks for symbolic computation
- Interactive visualization for complex theoretical concepts
- Natural language processing for technical explanations

## 📄 License

© 2024 State Forge Research Team. All rights reserved.

---

**Repository**: fyp-front  
**Branch**: chanaka  
**Maintainer**: DeepThinkers-Research

## Langchain js link - https://js.langchain.com/docs/tutorials/chatbot/

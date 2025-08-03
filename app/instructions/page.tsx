"use client";

import Link from "next/link";

export default function InstructionsPage() {
  const instructionCategories = [
    {
      title: "Getting Started",
      icon: "🚀",
      items: [
        {
          title: "Welcome to State Forge",
          description:
            "Learn how to perform your first automata theory conversion with our AI-powered platform.",
          steps: [
            "Navigate to the Conversions page",
            "Select your desired conversion model from the sidebar",
            "Enter your input data (text or upload an image)",
            "Click Convert to see the results",
            "Use the AI assistant for explanations and help",
          ],
        },
        {
          title: "Supported Conversion Types",
          description:
            "State Forge supports four main automata theory conversions.",
          steps: [
            "DFA Minimization - Convert DFA to its minimized equivalent",
            "Regex to ε-NFA - Transform regular expressions to epsilon NFA",
            "ε-NFA to DFA - Convert epsilon NFA to deterministic finite automaton",
            "PDA - Generate push down automata for context-free languages",
          ],
        },
      ],
    },
    {
      title: "Input Methods",
      icon: "📝",
      items: [
        {
          title: "Text Input",
          description: "Enter automata descriptions in the specified format.",
          steps: [
            "Use the text area in the left sidebar",
            "Follow the format examples provided in placeholders",
            "For DFA: 'A: a-->A, b-->B; B: a-->A, b-->A; in:A; fi:A'",
            "For Regex: 'a*b+' or '(a|b)*' or 'a+b*c'",
            "For PDA: 'aabb' representing a^n b^n patterns",
          ],
        },
        {
          title: "Image Input Processing",
          description: "Upload diagram images for AI-powered text extraction.",
          steps: [
            "Available for DFA Minimization and ε-NFA to DFA models",
            "Supported formats: PNG, JPG, JPEG, SVG",
            "Ensure diagrams are clear and high-contrast",
            "AI will automatically extract state information",
            "Manual text entry available as fallback",
          ],
        },
      ],
    },
    {
      title: "Advanced Features",
      icon: "⚙️",
      items: [
        {
          title: "AI Conversational Assistant",
          description:
            "Get intelligent help and explanations for your conversions.",
          steps: [
            "Ask questions about automata theory concepts",
            "Request explanations of conversion results",
            "Get step-by-step breakdowns of algorithms",
            "Context-aware responses based on your conversions",
            "Educational guidance for learning automata theory",
          ],
        },
        {
          title: "Visualization & History",
          description: "View results and manage your conversion history.",
          steps: [
            "Interactive Graphviz-powered state diagrams",
            "Professional-quality PNG export functionality",
            "Conversion history stacks for each model type",
            "Persistent session management",
            "Easy access to previous conversion work",
          ],
        },
      ],
    },
  ];

  const commonQuestions = [
    {
      question: "How do I start a conversion?",
      answer:
        "Go to the Conversions page, select a model from the sidebar, enter your input data, and click Convert.",
    },
    {
      question: "What input formats are supported?",
      answer:
        "We support text input with specific formats for each model type, and image uploads (PNG, JPG, JPEG, SVG) for DFA and ε-NFA models.",
    },
    {
      question: "What conversion types are available?",
      answer:
        "DFA Minimization, Regex to ε-NFA, ε-NFA to DFA, and Push Down Automata (PDA) conversions.",
    },
    {
      question: "How does the AI assistant work?",
      answer:
        "Our AI assistant uses Google Gemini 2.0 Flash with LangGraph for context-aware conversations about automata theory and conversion explanations.",
    },
    {
      question: "Can I save or export my results?",
      answer:
        "Yes, you can export diagrams as PNG files and view your conversion history through the dedicated history feature.",
    },
    {
      question: "What technology powers the conversions?",
      answer:
        "State Forge uses PyTorch-based transformer neural networks with custom tokenizers for high-quality automata theory conversions.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="light-yellow-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              State Forge Documentation
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Complete guide to automata theory conversions and AI-powered
              assistance for formal language processing
            </p>
            <Link href="/chat" className="btn-primary inline-block">
              Start Converting Now
            </Link>
          </div>
        </div>
      </section>

      {/* Instructions Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {instructionCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="flex items-center mb-8">
                  <span className="text-3xl mr-3">{category.icon}</span>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {category.title}
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 mb-4">{item.description}</p>
                      <ol className="space-y-2">
                        {item.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                              {stepIndex + 1}
                            </span>
                            <span className="text-gray-700">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Conversions */}
      <section className="py-16 light-yellow-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Example Conversions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See examples of input formats and expected outputs for each
              conversion type
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* DFA Minimization Example */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                DFA Minimization Example
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Input:
                  </p>
                  <code className="text-xs text-gray-600 block">
                    "A: a--&gt;A, b--&gt;B; B: a--&gt;A, b--&gt;C; C: a--&gt;A,
                    b--&gt;C; in:A; fi:C
                  </code>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-700 mb-2">
                    Output:
                  </p>
                  <code className="text-xs text-green-600 block">
                    States: {"{q0, q1}"}
                    <br />
                    Transitions: δ(q0,a)=q0, δ(q0,b)=q1, δ(q1,a)=q0, δ(q1,b)=q1
                    <br />
                    Initial: q0, Final: {"{q1}"}
                  </code>
                </div>
              </div>
            </div>

            {/* Regex to ε-NFA Example */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Regex to ε-NFA Example
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Input:
                  </p>
                  <code className="text-xs text-gray-600 block">a*b+</code>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-700 mb-2">
                    Output:
                  </p>
                  <code className="text-xs text-green-600 block">
                    States: {"{q0, q1, q2, q3}"}
                    <br />
                    ε-transitions: δ(q0,ε)={"{q1}"}, δ(q2,ε)={"{q3}"}
                    <br />
                    Transitions: δ(q1,a)={"{q1}"}, δ(q1,b)={"{q2}"}, δ(q2,b)=
                    {"{q2}"}
                  </code>
                </div>
              </div>
            </div>

            {/* ε-NFA to DFA Example */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ε-NFA to DFA Example
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Input:
                  </p>
                  <code className="text-xs text-gray-600 block">
                    q0: a--&gt;q1, ε--&gt;q2; q1: b--&gt;q2; q2: ε--&gt;q0;
                    in:q0; fi:q2
                  </code>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-700 mb-2">
                    Output:
                  </p>
                  <code className="text-xs text-green-600 block">
                    States: {"{q0,q2}"}, {"{q1}"}, {"{q2}"}
                    <br />
                    Transitions: δ({"{q0,q2}"}, a) = {"{q1}"}
                    <br />
                    Initial: {"{q0,q2}"}, Final: {"{q0,q2}"}, {"{q2}"}
                  </code>
                </div>
              </div>
            </div>

            {/* PDA Example */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Push Down Automata Example
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Input:
                  </p>
                  <code className="text-xs text-gray-600 block">aabb</code>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-700 mb-2">
                    Output:
                  </p>
                  <code className="text-xs text-green-600 block">
                    States: {"{q0, q1, q2}"}
                    <br />
                    Stack Alphabet: {"{Z, A}"}
                    <br />
                    {"δ(q0,a,Z)={(q1, AZ)}, δ(q1,a,A)={(q1, AA)}"}
                    <br />
                    {"δ(q1,b,A)={(q2, ε)}, δ(q2,b,A)={(q2, ε)}"}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">Quick answers to common questions</p>
          </div>

          <div className="space-y-6">
            {commonQuestions.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="py-16 light-yellow-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Best Practices
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Follow these guidelines for optimal automata theory conversions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Do</h3>
              <ul className="text-gray-600 text-sm space-y-1 text-left">
                <li>• Use correct format for each model type</li>
                <li>• Provide clear, high-contrast images</li>
                <li>• Start with simple examples</li>
                <li>• Ask the AI for explanations</li>
                <li>• Check conversion history for reference</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-red-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Don't
              </h3>
              <ul className="text-gray-600 text-sm space-y-1 text-left">
                <li>• Mix different format styles</li>
                <li>• Upload blurry or low-quality images</li>
                <li>• Expect results for invalid inputs</li>
                <li>• Ignore input format examples</li>
                <li>• Skip validation of your automata</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tips</h3>
              <ul className="text-gray-600 text-sm space-y-1 text-left">
                <li>• Use visualization to verify results</li>
                <li>• Export diagrams for presentations</li>
                <li>• Leverage AI for learning concepts</li>
                <li>• Try different input representations</li>
                <li>• Build complexity gradually</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Technology Stack
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              State Forge is built on cutting-edge AI and web technologies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                PyTorch
              </h3>
              <p className="text-gray-600 text-sm">
                Neural network models with GPU acceleration support
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Next JS
              </h3>
              <p className="text-gray-600 text-sm">
                Web application framework for interactive interfaces
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Python
              </h3>
              <p className="text-gray-600 text-sm">
               Language used in backend to handle models, build APIs
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Google Gemini
              </h3>
              <p className="text-gray-600 text-sm">
                AI-powered text extraction and conversational assistance
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Graphviz
              </h3>
              <p className="text-gray-600 text-sm">
                State diagram visualization and export functionality
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 light-yellow-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Converting?
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Now that you understand State Forge's capabilities, start your first
            automata theory conversion!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat" className="btn-primary inline-block">
              Start Converting
            </Link>
            <Link href="/" className="btn-secondary inline-block">
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";

export default function InstructionsPage() {
  const instructionCategories = [
    {
      title: "Getting Started",
      icon: "🚀",
      items: [
        {
          title: "Welcome to Zayd.ai",
          description:
            "Learn how to start your first conversation with our AI assistant.",
          steps: [
            "Navigate to the Chat page",
            "Type your message in the input field",
            "Press Enter or click the send button",
            "Wait for Zayd's response",
          ],
        },
        {
          title: "Language Support",
          description: "Zayd.ai supports both English and Arabic languages.",
          steps: [
            "Type in English for English responses",
            "Type in Arabic for Arabic responses",
            "Mix languages naturally in your conversation",
            "Zayd will automatically detect and respond appropriately",
          ],
        },
      ],
    },
    {
      title: "Conversation Tips",
      icon: "💬",
      items: [
        {
          title: "Effective Communication",
          description: "Get the best responses from Zayd with these tips.",
          steps: [
            "Be clear and specific in your questions",
            "Provide context when asking complex questions",
            "Use complete sentences for better understanding",
            "Ask follow-up questions to dive deeper",
          ],
        },
        {
          title: "Question Types",
          description: "Examples of questions Zayd can help with.",
          steps: [
            "Product information and features",
            "Technical support and troubleshooting",
            "Business integration guidance",
            "General AI and technology questions",
          ],
        },
      ],
    },
    {
      title: "Advanced Features",
      icon: "⚙️",
      items: [
        {
          title: "Context Management",
          description: "How Zayd maintains conversation context.",
          steps: [
            "Zayd remembers previous messages in the session",
            "Reference earlier parts of the conversation",
            "Build complex discussions over multiple messages",
            "Context resets when you start a new session",
          ],
        },
        {
          title: "Response Formatting",
          description: "Understanding Zayd's response structure.",
          steps: [
            "Structured answers for complex topics",
            "Code examples when relevant",
            "Step-by-step instructions for processes",
            "Bullet points for lists and options",
          ],
        },
      ],
    },
  ];

  const commonQuestions = [
    {
      question: "How do I start a conversation?",
      answer:
        "Simply go to the Chat page and type your message in the input field at the bottom.",
    },
    {
      question: "Can I use Arabic?",
      answer:
        "Yes! Zayd.ai fully supports Arabic language. You can type in Arabic and get responses in Arabic.",
    },
    {
      question: "What topics can I ask about?",
      answer:
        "You can ask about AI services, business solutions, technical questions, and general assistance.",
    },
    {
      question: "How long are conversations stored?",
      answer:
        "Conversations are stored for the duration of your session. They reset when you start a new session.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we use enterprise-grade security to protect all conversations and data.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="light-yellow-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              How to Use Zayd.ai
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Complete guide to getting the most out of your AI-powered
              conversations
            </p>
            <Link href="/chat" className="btn-primary inline-block">
              Start Chatting Now
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

      {/* Example Conversations */}
      <section className="py-16 light-yellow-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Example Conversations
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how to structure your questions for the best results
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* English Example */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                English Conversation Example
              </h3>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="chat-bubble-user rounded-2xl px-4 py-2 max-w-xs">
                    <p className="text-sm text-white">
                      What AI services does Zayd.ai provide for businesses?
                    </p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="chat-bubble-ai rounded-2xl px-4 py-2 max-w-xs">
                    <p className="text-sm text-gray-800">
                      Zayd.ai offers several AI services including natural
                      language processing, bilingual customer support, automated
                      responses, and intelligent conversation management. Would
                      you like me to explain any specific service in detail?
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="chat-bubble-user rounded-2xl px-4 py-2 max-w-xs">
                    <p className="text-sm text-white">
                      Tell me more about bilingual support
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Arabic Example */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Arabic Conversation Example
              </h3>
              <div className="space-y-4" dir="rtl">
                <div className="flex justify-start">
                  <div className="chat-bubble-user rounded-2xl px-4 py-2 max-w-xs">
                    <p className="text-sm text-white">
                      ما هي خدمات الذكاء الاصطناعي التي يقدمها زيد؟
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="chat-bubble-ai rounded-2xl px-4 py-2 max-w-xs">
                    <p className="text-sm text-gray-800">
                      يقدم زيد خدمات متنوعة في الذكاء الاصطناعي مثل معالجة اللغة
                      الطبيعية، دعم العملاء ثنائي اللغة، الردود الآلية، وإدارة
                      المحادثات الذكية. هل تريد معرفة المزيد عن خدمة معينة؟
                    </p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="chat-bubble-user rounded-2xl px-4 py-2 max-w-xs">
                    <p className="text-sm text-white">
                      أخبرني أكثر عن الدعم ثنائي اللغة
                    </p>
                  </div>
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
              Follow these guidelines for optimal AI interactions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Do</h3>
              <ul className="text-gray-600 text-sm space-y-1 text-left">
                <li>• Be specific and clear</li>
                <li>• Provide context</li>
                <li>• Ask one question at a time</li>
                <li>• Use proper grammar</li>
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
                <li>• Use vague language</li>
                <li>• Ask multiple questions together</li>
                <li>• Expect personal information</li>
                <li>• Use inappropriate content</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tips</h3>
              <ul className="text-gray-600 text-sm space-y-1 text-left">
                <li>• Use examples when helpful</li>
                <li>• Build on previous answers</li>
                <li>• Ask for clarification</li>
                <li>• Try different phrasings</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start?
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Now that you know how to use Zayd.ai effectively, start your first
            conversation!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat" className="btn-primary inline-block">
              Start Chatting
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

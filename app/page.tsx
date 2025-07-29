"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="hero-gradient min-h-screen flex items-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-left">
              <div className="mb-8">
                <span className="text-6xl font-bold text-yellow-400 opacity-30 absolute top-20 left-4 z-0">
                  STATE FORGE
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 relative z-10">
                Transform
                <br />
                <span className="text-gray-800">Automata Theory with</span>
                <br />
                <span className="text-gray-800">AI-Powered Intelligence!</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 max-w-md">
                Comprehensive Streamlit-based web application for automata
                theory and formal language conversions powered by advanced
                transformer networks.
              </p>

              <Link href="/chat" className="btn-primary inline-block">
                Start Converting
              </Link>
            </div>

            {/* Right Column - State Machine Illustration */}
            <div className="flex justify-center lg:justify-end relative">
              <div className="robot-float">
                {/* State Machine Diagram */}
                <div className="w-80 h-80 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full relative shadow-2xl">
                  {/* Central State */}
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-orange-300 rounded-full border-4 border-white">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-lg">
                      q0
                    </div>
                  </div>

                  {/* State Transitions */}
                  <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-24 h-32 bg-white rounded-lg flex flex-col items-center justify-center">
                    <div className="text-sm font-bold text-gray-700">DFA</div>
                    <div className="text-xs text-gray-500">Minimization</div>
                  </div>

                  {/* Additional States */}
                  <div className="absolute top-40 -left-8 w-16 h-16 bg-orange-300 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white font-bold text-sm">q1</span>
                  </div>
                  <div className="absolute top-40 -right-8 w-16 h-16 bg-orange-300 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white font-bold text-sm">q2</span>
                  </div>

                  {/* Transition Arrows */}
                  <div className="absolute top-44 left-12 w-12 h-1 bg-white rounded transform rotate-45"></div>
                  <div className="absolute top-44 right-12 w-12 h-1 bg-white rounded transform -rotate-45"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gateway Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Your Gateway to
                <br />
                Intelligent
                <br />
                Automata Theory
                <br />
                Conversions
              </h2>

              <p className="text-gray-600 mb-8 leading-relaxed">
                State Forge transforms automata theory education and research
                through advanced AI technology. Our comprehensive platform
                delivers seamless conversions between different automata types,
                powered by state-of-the-art transformer-based neural networks
                and intelligent conversational AI. Designed for students,
                researchers, and educators in computer science.
              </p>
            </div>

            {/* Right Column - Application Mockup */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Screen Frame */}
                <div className="w-64 h-96 bg-black rounded-3xl p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-2xl overflow-hidden relative">
                    {/* Screen Content */}
                    <div className="h-full light-yellow-bg flex flex-col">
                      <div className="flex-1 p-4">
                        <div className="text-center py-4">
                          <div className="text-lg font-bold text-gray-800 mb-2">
                            State Forge
                          </div>
                          <div className="w-12 h-12 bg-orange-400 rounded-full mx-auto mb-3 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">
                              SF
                            </span>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="h-2 bg-yellow-200 rounded w-32 mx-auto"></div>
                            <div className="h-2 bg-yellow-200 rounded w-24 mx-auto"></div>
                            <div className="h-2 bg-yellow-200 rounded w-28 mx-auto"></div>
                          </div>
                          <div className="mt-4 space-y-1">
                            <div className="text-xs text-gray-600">
                              DFA → Min DFA
                            </div>
                            <div className="text-xs text-gray-600">
                              Regex → ε-NFA
                            </div>
                            <div className="text-xs text-gray-600">
                              ε-NFA → DFA
                            </div>
                            <div className="text-xs text-gray-600">
                              PDA Processing
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Four Main Conversion Models
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Advanced transformer-based neural networks for comprehensive
              automata theory conversions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature Cards */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-lg zayd-shadow">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                DFA Minimization
              </h3>
              <p className="text-gray-600">
                Converts DFA to its minimized equivalent using custom
                transformer models with character-level tokenization. Supports
                both text input and AI-powered image processing.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 shadow-lg zayd-shadow">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Regex to ε-NFA
              </h3>
              <p className="text-gray-600">
                Transforms regular expressions to Epsilon Non-deterministic
                Finite Automata using advanced Seq2Seq transformer models with
                positional encoding.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 shadow-lg zayd-shadow">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ε-NFA to DFA
              </h3>
              <p className="text-gray-600">
                Converts Epsilon NFA to Deterministic Finite Automaton using
                transformer encoder-decoder architecture with support for image
                input processing.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 shadow-lg zayd-shadow">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Push Down Automata (PDA)
              </h3>
              <p className="text-gray-600">
                Generates PDA transitions for context-free languages using
                advanced TransformerPDA models with stack simulation
                capabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className="py-20 light-yellow-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Advanced Features
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover the powerful capabilities that make State Forge the
              perfect solution for automata theory and formal language
              processing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-lg zayd-shadow">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI-Powered Conversions
              </h3>
              <p className="text-gray-600">
                Advanced neural networks with Google Gemini 2.0 Flash
                integration for intelligent conversational assistance and text
                extraction.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg zayd-shadow">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">🖼️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Image Input Processing
              </h3>
              <p className="text-gray-600">
                Upload PNG, JPG, JPEG, SVG images of automata diagrams with
                AI-powered text extraction and automatic state identification.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg zayd-shadow">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Graphical Visualization
              </h3>
              <p className="text-gray-600">
                Interactive Graphviz-powered state diagrams with zoom, pan
                capabilities, and professional-quality PNG export functionality.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg zayd-shadow">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">💾</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Conversion History
              </h3>
              <p className="text-gray-600">
                Specialized stack data structures for each conversion type with
                persistent session management and easy access to previous work.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg zayd-shadow">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                PyTorch Integration
              </h3>
              <p className="text-gray-600">
                Built on PyTorch with GPU acceleration support, custom
                tokenizers, and character-level processing for optimal
                performance.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg zayd-shadow">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Conversational AI
              </h3>
              <p className="text-gray-600">
                LangGraph-powered conversation management with context
                awareness, educational explanations, and step-by-step conversion
                guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Research Team
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet the dedicated professionals behind State Forge's innovative
              automata theory solutions.
            </p>
          </div>

          {/* Developers Section */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
              Research Team
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">D1</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Galappaththi S.S
                </h4>
                <p className="text-gray-600">University of Moratuwa</p>
                <p className="text-sm text-gray-500 mt-2">DFA → Min DFA</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">D2</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Madushan A.K.I
                </h4>
                <p className="text-gray-600">University of Moratuwa</p>
                <p className="text-sm text-gray-500 mt-2">PDA Processing</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">D3</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Jayasinghe P.S
                </h4>
                <p className="text-gray-600">University of Moratuwa</p>
                <p className="text-sm text-gray-500 mt-2">ε-NFA → DFA</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">D4</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Dissanayaka D.M.C.P
                </h4>
                <p className="text-gray-600">University of Moratuwa</p>
                <p className="text-sm text-gray-500 mt-2">Regex → ε-NFA</p>
              </div>
            </div>
          </div>

          {/* Supervisors Section */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="w-20 h-20 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">PS</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Dr. I.T.S. Piyatilake
                </h4>
                <p className="text-gray-600">Senior Lecturer</p>
                <p className="text-sm text-gray-500 mt-2">
                  Department of Computational Mathematics,
                  University of Moratuwa
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="w-20 h-20 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">CS</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Dr. C.P. Wijesiriwardena
                </h4>
                <p className="text-gray-600">Senior Lecturer</p>
                <p className="text-sm text-gray-500 mt-2">
                  Department of Information Technology,
                  University of Moratuwa
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 light-yellow-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Contact Our Research Team
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ready to explore automata theory with AI? Get in touch with our
              research team for collaboration and support.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Get in Touch
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-400 rounded-lg mr-4 flex items-center justify-center">
                        <span className="text-gray-900">📧</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Email</p>
                        <p className="text-gray-600">research@stateforge.edu</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-400 rounded-lg mr-4 flex items-center justify-center">
                        <span className="text-gray-900">🏛️</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Institution</p>
                        <p className="text-gray-600">University of Moratuwa</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-400 rounded-lg mr-4 flex items-center justify-center">
                        <span className="text-gray-900">🔬</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Research Focus
                        </p>
                        <p className="text-gray-600">
                          Automata Theory & AI Education
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Research Interest
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent">
                      <option>DFA Minimization</option>
                      <option>Regular Expression Processing</option>
                      <option>Epsilon NFA Conversions</option>
                      <option>Push Down Automata</option>
                      <option>AI in Education</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="Tell us about your research interest or question..."
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-primary w-full">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">State Forge</div>
            <p className="text-gray-400 mb-8">
              Comprehensive Automata Theory & Formal Language Conversions
            </p>
            <div className="flex justify-center space-x-6">
              <Link
                href="/"
                className="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/chat"
                className="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                Conversions
              </Link>
              <Link
                href="/instructions"
                className="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                Documentation
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-gray-500 text-sm">
              © 2024 State Forge Research Team. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

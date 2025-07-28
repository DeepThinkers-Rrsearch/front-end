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
                  ZAYD
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 relative z-10">
                Transform Your
                <br />
                <span className="text-gray-800">Business with AI-</span>
                <br />
                <span className="text-gray-800">Powered Engagement!</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 max-w-md">
                Effortlessly deliver exceptional Arabic and English customer
                interactions with our advanced AI solutions.
              </p>

              <button className="btn-primary inline-block">
                Try Zayd free
              </button>
            </div>

            {/* Right Column - Robot Illustration */}
            <div className="flex justify-center lg:justify-end relative">
              <div className="robot-float">
                {/* Robot SVG - Simplified orange robot */}
                <div className="w-80 h-80 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full relative shadow-2xl">
                  {/* Robot Head */}
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-orange-300 rounded-full">
                    {/* Eyes */}
                    <div className="absolute top-8 left-6 w-4 h-4 bg-cyan-400 rounded-full"></div>
                    <div className="absolute top-8 right-6 w-4 h-4 bg-cyan-400 rounded-full"></div>
                    {/* Mouth */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-orange-500 rounded"></div>
                  </div>

                  {/* Robot Body */}
                  <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-24 h-32 bg-white rounded-lg">
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full"></div>
                    <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-orange-200 rounded"></div>
                  </div>

                  {/* Arms */}
                  <div className="absolute top-40 -left-8 w-16 h-6 bg-orange-300 rounded-full transform -rotate-12"></div>
                  <div className="absolute top-40 -right-8 w-16 h-6 bg-orange-300 rounded-full transform rotate-12"></div>
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
                Conversations with
                <br />
                Zayd.ai
              </h2>

              <p className="text-gray-600 mb-8 leading-relaxed">
                Zayd.ai transforms customer interactions through advanced AI
                technology. Our bilingual chatbot delivers seamless
                conversations in both Arabic and English, powered by
                state-of-the-art natural language processing and machine
                learning. Designed for various industries, Zayd.ai enhances
                operational efficiency and customer satisfaction.
              </p>
            </div>

            {/* Right Column - Phone Mockup */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Phone Frame */}
                <div className="w-64 h-96 bg-black rounded-3xl p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-2xl overflow-hidden relative">
                    {/* Phone Screen Content */}
                    <div className="h-full light-yellow-bg flex flex-col">
                      <div className="flex-1 p-4">
                        <div className="text-center py-8">
                          <div className="text-2xl font-bold text-gray-800 mb-2">
                            ZAYD.AI
                          </div>
                          <div className="w-16 h-16 bg-orange-400 rounded-full mx-auto mb-4"></div>
                          <div className="space-y-2">
                            <div className="h-3 bg-yellow-200 rounded w-32 mx-auto"></div>
                            <div className="h-3 bg-yellow-200 rounded w-24 mx-auto"></div>
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

      {/* Arabic Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Arabic Content */}
            <div className="text-right" dir="rtl">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                حوّل عملك من خلال
                <br />
                التفاعل المدعوم
                <br />
                بالذكاء الاصطناعي
              </h2>

              <p className="text-gray-600 mb-8 leading-relaxed">
                منصة زيد تستطيع مع تقنيات الذكاء الاصطناعي المتطورة والتفاعلية
                التي يمكن استخدامها حول الأذكى الاصطناعي. وننصح بإنشاء
              </p>

              <button className="btn-primary">جرب زيد مجانًا</button>
            </div>

            {/* Right Column - Robot */}
            <div className="flex justify-center">
              <div className="w-64 h-64 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full relative shadow-2xl robot-float">
                {/* Simplified robot for Arabic section */}
                <div className="absolute inset-4 bg-orange-300 rounded-full"></div>
                <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full"></div>
                <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-cyan-400 rounded-full"></div>
                <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-cyan-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications Section */}
      <section className="py-20 light-yellow-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Application Specifications
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover the powerful features that make Zayd.ai the perfect
              solution for your business needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <div className="bg-white rounded-lg p-6 shadow-lg zayd-shadow">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI-Powered Conversations
              </h3>
              <p className="text-gray-600">
                Advanced natural language processing for intelligent customer
                interactions.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg zayd-shadow">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Bilingual Support
              </h3>
              <p className="text-gray-600">
                Seamless communication in both Arabic and English languages.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg zayd-shadow">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Real-time Processing
              </h3>
              <p className="text-gray-600">
                Instant responses with lightning-fast AI processing
                capabilities.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg zayd-shadow">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure & Private
              </h3>
              <p className="text-gray-600">
                Enterprise-grade security with complete data privacy protection.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg zayd-shadow">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-gray-600">
                Comprehensive insights and analytics for business optimization.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg zayd-shadow">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Easy Integration
              </h3>
              <p className="text-gray-600">
                Simple setup and integration with existing business systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet the dedicated professionals behind Zayd.ai's innovative
              solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Supervisors */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                Supervisors
              </h3>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="w-20 h-20 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">S1</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Dr. [Supervisor Name]
                  </h4>
                  <p className="text-gray-600">Project Supervisor</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Leading AI research and development initiatives
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="w-20 h-20 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">S2</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Dr. [Co-Supervisor Name]
                  </h4>
                  <p className="text-gray-600">Co-Supervisor</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Specializing in natural language processing
                  </p>
                </div>
              </div>
            </div>

            {/* Developers */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                Developers
              </h3>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="w-20 h-20 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">D1</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    [Developer Name 1]
                  </h4>
                  <p className="text-gray-600">Lead Developer</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Full-stack development and AI integration
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="w-20 h-20 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">D2</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    [Developer Name 2]
                  </h4>
                  <p className="text-gray-600">Frontend Developer</p>
                  <p className="text-sm text-gray-500 mt-2">
                    UI/UX design and frontend implementation
                  </p>
                </div>
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
              Contact Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ready to transform your business with AI? Get in touch with our
              team today.
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
                        <p className="text-gray-600">contact@zayd.ai</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-400 rounded-lg mr-4 flex items-center justify-center">
                        <span className="text-gray-900">📱</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Phone</p>
                        <p className="text-gray-600">+1 (555) 123-4567</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-400 rounded-lg mr-4 flex items-center justify-center">
                        <span className="text-gray-900">📍</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Office</p>
                        <p className="text-gray-600">
                          123 AI Street, Tech City
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
                      Message
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="Tell us about your project..."
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
            <div className="text-2xl font-bold mb-4">ZAYD.AI</div>
            <p className="text-gray-400 mb-8">
              Transform Your Business with AI-Powered Engagement
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
                Chat
              </Link>
              <Link
                href="/instructions"
                className="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                Instructions
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-gray-500 text-sm">
              © 2024 ZAYD.AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

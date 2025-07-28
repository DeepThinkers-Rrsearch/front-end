import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZAYD.AI - Transform Your Business with AI-Powered Engagement",
  description:
    "Effortlessly deliver exceptional Arabic and English customer interactions with our advanced AI solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        <header className="bg-white border-b border-yellow-100">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-gray-900">
                  ZAYD.AI
                </Link>
              </div>

              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-8">
                  <Link
                    href="/"
                    className="text-gray-900 hover:text-yellow-600 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    href="/chat"
                    className="text-gray-900 hover:text-yellow-600 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Chat
                  </Link>
                  <Link
                    href="/instructions"
                    className="text-gray-900 hover:text-yellow-600 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Instructions
                  </Link>
                  <span className="text-gray-700 text-sm">عربي</span>
                  <button className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-yellow-50 transition-colors">
                    Log In
                  </button>
                </div>
              </div>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}

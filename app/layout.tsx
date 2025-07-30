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
  title:
    "State Forge - Comprehensive Automata Theory & Formal Language Conversions",
  description:
    "Advanced web application for automata theory and formal language conversions with AI-powered assistance. Transform DFA, Regex to ε-NFA, ε-NFA to DFA, and PDA with intelligent neural networks.",
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
        <header className="bg-gradient-to-r from-yellow-100 to-yellow-50 border-b border-yellow-300 shadow-sm">
          <nav className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-13">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-gray-900 pl-2 sm:pl-4">
                  State Forge
                </Link>
              </div>

              <div className="hidden md:block">
                 <div className="ml-10 flex items-center space-x-4">
                  {[
                    { href: "/", label: "Home" },
                    { href: "/chat", label: "Conversions" },
                    { href: "/instructions", label: "Documentation" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="px-4 py-2 text-yellow-800 rounded-lg font-medium hover:bg-yellow-200 hover:border-yellow-500 hover:text-yellow-1000 transition duration-200"
                    >
                      {item.label}
                    </Link>
                  ))}
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

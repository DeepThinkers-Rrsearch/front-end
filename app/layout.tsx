import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/app/Navigation";

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
    "Advanced Streamlit-based web application for automata theory and formal language conversions with AI-powered assistance. Transform DFA, Regex to ε-NFA, ε-NFA to DFA, and PDA with intelligent neural networks.",
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
        <Navigation />
        {children}
      </body>
    </html>
  );
}

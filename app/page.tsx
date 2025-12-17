"use client";

import Link from 'next/link';
import { ArrowRight, Mic, Brain, FileText } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Cracker
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/signup" className="px-4 py-2 text-sm bg-white text-black rounded-full hover:bg-gray-200 transition-colors font-medium">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-sm text-purple-400 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            AI-Powered Interview Practice
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
            Master Your Next <br />
            Technical Interview
          </h1>

          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Practice with an AI recruiter that knows your resume and the job description.
            Get real-time feedback, simulate coding rounds, and boost your confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard" className="group flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-full font-medium transition-all hover:scale-105">
              Start Practicing Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/demo" className="px-8 py-4 border border-white/10 hover:bg-white/5 rounded-full font-medium transition-colors">
              Watch Demo
            </Link>
          </div>

          {/* New form section */}
          <div className="mt-12 max-w-xl mx-auto">
            <div className="space-y-6">
              {/* No inputs here anymore */}
            </div>
          </div>

        </div>

        {/* Features Grid */}
        <div className="container mx-auto mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Brain className="w-6 h-6 text-purple-400" />,
              title: "Context Aware",
              desc: "Upload your resume and JD. Our AI tailors questions specifically to your profile and the role."
            },
            {
              icon: <Mic className="w-6 h-6 text-pink-400" />,
              title: "Voice Interaction",
              desc: "Speak naturally. Practice your communication skills with real-time voice feedback."
            },
            {
              icon: <FileText className="w-6 h-6 text-blue-400" />,
              title: "Detailed Feedback",
              desc: "Get instant analysis on your answers, tone, and technical accuracy after every session."
            }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
              <div className="mb-4 p-3 bg-white/5 rounded-xl w-fit">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing Section */}
        <div className="container mx-auto mt-32 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Simple, Transparent Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex flex-col">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-200">Free</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="mt-4 text-gray-400">Perfect for getting started with interview practice.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Powered by Gemini Flash
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  3 Practice Sessions / Month
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Basic Feedback
                </li>
              </ul>
              <Link href="/signup" className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors text-center font-medium">
                Get Started
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="p-8 rounded-2xl border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 transition-colors flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                POPULAR
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-purple-200">Pro</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$19</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="mt-4 text-gray-400">For serious candidates who want to ace their interviews.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Powered by GPT-4o & Gemini Pro
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Unlimited Practice Sessions
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Deep Performance Analytics
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Priority Support
                </li>
              </ul>
              <Link href="/signup?plan=pro" className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition-colors text-center font-medium">
                Subscribe Now
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

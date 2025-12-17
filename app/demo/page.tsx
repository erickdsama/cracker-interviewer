'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';

export default function DemoPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
            <div className="max-w-4xl w-full space-y-8 text-center">
                <h1 className="text-4xl font-bold">See Cracker in Action</h1>
                <p className="text-xl text-gray-400">Watch how our AI recruiter conducts a technical interview.</p>

                <div className="aspect-video bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center relative group cursor-pointer overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 to-transparent" />
                    <Play className="w-20 h-20 text-white opacity-80 group-hover:scale-110 transition-transform" />
                    <p className="absolute bottom-8 text-gray-400">Demo Video Placeholder</p>
                </div>

                <div className="flex justify-center gap-4">
                    <Link href="/signup" className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-full font-medium transition-colors">
                        Try it Yourself
                    </Link>
                    <Link href="/" className="px-8 py-3 border border-white/10 hover:bg-white/5 rounded-full font-medium transition-colors">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

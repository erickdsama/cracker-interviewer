'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Mic, Send, Volume2, StopCircle, CheckCircle, Circle, ArrowLeft, ChevronRight, Sparkles, Loader2, Play } from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

interface Step {
    id: string;
    step_type: string;
    status: 'pending' | 'in_progress' | 'completed';
    interaction_log: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    feedback?: string;
    title?: string;
    started_at?: string;
}

interface Session {
    id: string;
    job_title: string;
    company_name: string;
    status: 'planning' | 'ready' | 'in_progress' | 'completed';
    research_status: 'pending' | 'processing' | 'completed' | 'failed';
    research_data: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    role_level?: string;
    duration_minutes?: number;
}

export default function SessionPage() {
    const { id } = useParams();
    const sessionId = id as string;
    const router = useRouter();

    const [session, setSession] = useState<Session | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [tier, setTier] = useState<'free' | 'premium'>('free');
    const [steps, setSteps] = useState<Step[]>([]);
    const [activeFeedback, setActiveFeedback] = useState<string | null>(null);

    const [currentStep, setCurrentStep] = useState<Step | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Research State
    const [isResearching, setIsResearching] = useState(false);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await api.get(`/sessions/${sessionId}/details`);
                setSession(res.data);
            } catch (e) {
                console.error("Failed to fetch session", e);
            }
        };

        const fetchSteps = async () => {
            try {
                const res = await api.get(`/sessions/${sessionId}/steps`);
                setSteps(res.data);
                if (res.data.length > 0) {
                    const activeStep = res.data.find((s: Step) => s.status === 'in_progress') || res.data[0];
                    setCurrentStep(activeStep);
                }
            } catch (e) {
                console.error("Failed to fetch steps", e);
            }
        };

        if (sessionId) {
            fetchSession();
            fetchSteps();
        }
    }, [sessionId]);

    // Poll for research status
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (session?.research_status === 'pending' || session?.research_status === 'processing') {
            interval = setInterval(async () => {
                try {
                    const res = await api.get(`/sessions/${sessionId}/research/status`);
                    if (res.data.status !== session.research_status) {
                        setSession(prev => prev ? { ...prev, research_status: res.data.status, research_data: res.data.data } : null);
                    }
                    if (res.data.status === 'completed' || res.data.status === 'failed') {
                        clearInterval(interval);
                        setIsResearching(false);
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [sessionId, session?.research_status]);

    // Load messages when currentStep changes
    useEffect(() => {
        if (currentStep && currentStep.interaction_log) {
            let logs: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
            if (Array.isArray(currentStep.interaction_log)) {
                logs = currentStep.interaction_log;
            } else if (typeof currentStep.interaction_log === 'object') {
                logs = Object.values(currentStep.interaction_log);
            }

            const loadedMessages = logs.map((log: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                id: log.id || Math.random().toString(),
                role: log.role,
                content: log.content
            }));
            setMessages(loadedMessages); // eslint-disable-line react-hooks/set-state-in-effect
        } else {
            setMessages([]);
        }
    }, [currentStep]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        try {
            const res = await api.post(`/sessions/${sessionId}/steps/${currentStep?.id}/interact`, { message: input });
            const aiMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: res.data.response };

            setMessages(prev => [...prev, aiMsg]);
            speak(aiMsg.content);

        } catch (err) {
            console.error(err);
        }
    };

    const startRecording = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition; // eslint-disable-line @typescript-eslint/no-explicit-any
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsRecording(true);
            recognition.onend = () => setIsRecording(false);
            recognition.onresult = (event: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
            };

            recognition.start();
        } else {
            alert("Speech recognition not supported in this browser.");
        }
    };

    const speak = (text: string) => {
        try {
            const baseUrl = api.defaults.baseURL || 'http://localhost:8000';
            const audioUrl = `${baseUrl}/speech/generate?text=${encodeURIComponent(text)}&tier=${tier}`;
            const audio = new Audio(audioUrl);
            audio.play().catch(e => console.error("Playback error:", e));
        } catch (error) {
            console.error("Error playing audio:", error);
        }
    };

    const handleNextStep = async () => {
        if (!currentStep) return;
        try {
            await api.post(`/sessions/${sessionId}/steps/${currentStep.id}/complete`);
            const res = await api.get(`/sessions/${sessionId}/steps`);
            setSteps(res.data);
            const activeStep = res.data.find((s: Step) => s.status === 'in_progress') || res.data.find((s: Step) => s.status === 'pending');
            if (activeStep) setCurrentStep(activeStep);
            else setCurrentStep(null);
        } catch (e) {
            console.error("Failed to complete step", e);
        }
    };

    const handleEndSession = async () => {
        try {
            await api.post(`/sessions/${sessionId}/close`);
            router.push('/dashboard');
        } catch (e) {
            console.error("Failed to close session", e);
        }
    };

    // Form State
    const [formData, setFormData] = useState({
        company_name: '',
        job_title: '',
        role_level: 'mid',
        duration_minutes: 15
    });

    useEffect(() => {
        if (session) {
            setFormData({ // eslint-disable-line react-hooks/set-state-in-effect
                company_name: session.company_name === 'Pending' ? '' : session.company_name,
                job_title: session.job_title,
                role_level: session.role_level || 'mid',
                duration_minutes: session.duration_minutes || 15
            });
        }
    }, [session]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const saveSessionDetails = async () => {
        try {
            await api.patch(`/sessions/${sessionId}`, formData);
            // Update local session state
            setSession(prev => prev ? { ...prev, ...formData } : null);
            return true;
        } catch (e) {
            console.error("Failed to save session details", e);
            return false;
        }
    };

    const handleResearch = async () => {
        if (!formData.company_name || !formData.job_title) {
            alert("Please enter Company Name and Job Title first.");
            return;
        }

        // Save first
        const saved = await saveSessionDetails();
        if (!saved) return;

        try {
            setIsResearching(true);
            await api.post(`/sessions/${sessionId}/research`);
            setSession(prev => prev ? { ...prev, research_status: 'pending' } : null);
        } catch (e) {
            console.error("Failed to start research", e);
            setIsResearching(false);
        }
    };

    const handleStartInterview = async () => {
        // Save first
        await saveSessionDetails();

        try {
            await api.post(`/sessions/${sessionId}/start`);
            // Refresh session to update status
            const res = await api.get(`/sessions/${sessionId}/details`);
            setSession(res.data);
        } catch (e) {
            console.error("Failed to start interview", e);
        }
    };

    // SETUP VIEW
    if (session?.status === 'planning') {
        return (
            <div className="flex h-screen bg-black text-white items-center justify-center p-8 overflow-y-auto">
                <div className="max-w-2xl w-full space-y-8 my-auto">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold">Configure Your Interview</h1>
                        <p className="text-gray-400">Set up the details for your practice session</p>
                    </div>

                    <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl p-8 space-y-6">

                        {/* Configuration Form */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Company Name</label>
                                <input
                                    type="text"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Google"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Job Title</label>
                                <input
                                    type="text"
                                    name="job_title"
                                    value={formData.job_title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Senior Software Engineer"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Role Level</label>
                                <select
                                    name="role_level"
                                    value={formData.role_level}
                                    onChange={handleInputChange}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                                >
                                    <option value="junior">Junior</option>
                                    <option value="mid">Mid-Level</option>
                                    <option value="senior">Senior</option>
                                    <option value="staff">Staff</option>
                                    <option value="principal">Principal</option>
                                    <option value="manager">Manager</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Duration (Minutes)</label>
                                <select
                                    name="duration_minutes"
                                    value={formData.duration_minutes}
                                    onChange={handleInputChange}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                                >
                                    <option value="15">15 Minutes</option>
                                    <option value="30">30 Minutes</option>
                                    <option value="45">45 Minutes</option>
                                    <option value="60">60 Minutes</option>
                                </select>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-medium text-lg">Interview Process</h3>
                                    <p className="text-sm text-gray-400">Define the rounds you want to practice</p>
                                </div>
                                <button
                                    onClick={handleResearch}
                                    disabled={!formData.company_name || !formData.job_title || isResearching || session.research_status === 'processing' || session.research_status === 'completed'}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isResearching || session.research_status === 'processing' ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-4 h-4" />
                                    )}
                                    {session.research_status === 'completed' ? 'Research Completed' : 'Auto-fill from Web'}
                                </button>
                            </div>

                            {session.research_status === 'completed' && session.research_data && (
                                <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 space-y-3 mb-4">
                                    <div className="flex items-start gap-3">
                                        <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-purple-200">Found Interview Process</h4>
                                            <p className="text-sm text-purple-300/80 mt-1">{session.research_data.description}</p>
                                        </div>
                                    </div>
                                    <div className="pl-8 space-y-2">
                                        {session.research_data.steps.map((step: any, idx: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                            <div key={idx} className="text-sm bg-black/20 p-2 rounded border border-white/5">
                                                <span className="font-medium text-purple-300">{step.title}</span>
                                                <span className="text-gray-400 mx-2">•</span>
                                                <span className="text-gray-500 capitalize">{step.type}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                {steps.map((step, idx) => (
                                    <div key={step.id} className="flex items-center gap-4 p-4 bg-black/20 rounded-xl border border-white/5">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-medium text-gray-400">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium">{step.title || step.step_type.replace('_', ' ')}</h4>
                                            <p className="text-xs text-gray-500 capitalize">{step.step_type.replace('_', ' ')} Round</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleStartInterview}
                            className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <Play className="w-5 h-5" />
                            Start Interview
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            {/* Sidebar - Steps */}
            <div className="w-80 border-r border-white/10 p-6 flex flex-col">
                <div className="mb-8">
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Dashboard
                    </Link>
                    <h2 className="text-xl font-bold mb-2">Interview Steps</h2>
                    <p className="text-sm text-gray-400">Progress: {steps.filter(s => s.status === 'completed').length}/{steps.length}</p>
                </div>

                <div className="space-y-4 flex-1">
                    {steps.map((step) => (
                        <div key={step.id} className={`p-4 rounded-xl border transition-colors ${step.status === 'in_progress'
                            ? 'bg-purple-500/10 border-purple-500/50'
                            : step.status === 'completed'
                                ? 'bg-green-500/10 border-green-500/50'
                                : 'bg-white/5 border-white/10'
                            }`}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium capitalize">{step.title || step.step_type.replace('_', ' ')}</h3>
                                {step.status === 'completed' ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : step.status === 'in_progress' ? (
                                    <Circle className="w-5 h-5 text-purple-500 animate-pulse" />
                                ) : (
                                    <Circle className="w-5 h-5 text-gray-600" />
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400 capitalize">{step.status.replace('_', ' ')}</span>
                                {step.status === 'completed' && step.feedback && (
                                    <button
                                        onClick={() => setActiveFeedback(step.feedback || "")}
                                        className="text-xs text-purple-400 hover:text-purple-300 underline"
                                    >
                                        View Feedback
                                    </button>
                                )}
                            </div>
                        </div >
                    ))}
                </div >

                {/* Actions */}
                < div className="mt-6 pt-6 border-t border-white/10 space-y-3" >
                    <button
                        onClick={handleNextStep}
                        disabled={!currentStep || currentStep.status === 'completed'}
                        className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        Next Step <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleEndSession}
                        className="w-full py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg font-medium transition-colors"
                    >
                        End Session
                    </button>
                </div >
            </div >

            {/* Feedback Modal */}
            {
                activeFeedback && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
                        <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Step Feedback</h2>
                                <button onClick={() => setActiveFeedback(null)} className="text-gray-400 hover:text-white">
                                    ✕
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto text-gray-300 prose prose-invert max-w-none prose-headings:text-white prose-strong:text-white prose-ul:list-disc prose-ol:list-decimal">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeFeedback}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="h-16 border-b border-white/10 flex items-center px-8 justify-between bg-black/50 backdrop-blur shrink-0">
                    <h1 className="font-semibold text-lg">Practice Session</h1>

                    {/* Timer */}
                    <Timer sessionId={sessionId} currentStep={currentStep} />

                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
                            <button
                                onClick={() => setTier('free')}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${tier === 'free' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                Free (Google)
                            </button>
                            <button
                                onClick={() => setTier('premium')}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${tier === 'premium' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                Premium (OpenAI)
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            AI Recruiter Online
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Chat Column */}
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-2xl p-4 rounded-2xl ${msg.role === 'user'
                                        ? 'bg-purple-600 text-white rounded-tr-none'
                                        : 'bg-white/10 text-gray-200 rounded-tl-none'
                                        }`}>
                                        <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                        </div>
                                        {msg.role === 'assistant' && (
                                            <button onClick={() => speak(msg.content)} className="mt-2 p-1 hover:bg-white/10 rounded-full transition-colors">
                                                <Volume2 className="w-4 h-4 text-gray-400" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t border-white/10 bg-black/80 backdrop-blur shrink-0">
                            <div className="max-w-4xl mx-auto relative flex items-center gap-4">
                                <button
                                    onClick={startRecording}
                                    className={`p-4 rounded-full transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-white/10 hover:bg-white/20'
                                        }`}
                                >
                                    {isRecording ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                                </button>

                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your answer or use microphone..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 focus:outline-none focus:border-purple-500 transition-colors"
                                />

                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    className="p-4 bg-purple-600 hover:bg-purple-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Code Editor Column (Only for Technical Step) */}
                    {currentStep?.step_type === 'technical' && (
                        <div className="w-1/2 border-l border-white/10 p-4 bg-black/50">
                            <CodeEditor />
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}

function Timer({ sessionId, currentStep }: { sessionId: string, currentStep: Step | null }) {
    const [timeLeft, setTimeLeft] = useState<string>("--:--");
    const [isLow, setIsLow] = useState(false);

    useEffect(() => {
        const fetchSessionInfo = async () => {
            try {
                if (!currentStep) return;

                const res = await api.get(`/sessions/${sessionId}/details`);
                const session = res.data;

                let startTimeStr = currentStep.started_at;
                if (!startTimeStr) {
                    startTimeStr = session.created_at;
                }

                const startString = (startTimeStr || session.created_at).endsWith('Z') ? (startTimeStr || session.created_at) : (startTimeStr || session.created_at) + 'Z';
                const start = new Date(startString).getTime();

                const durationMs = session.duration_minutes * 60 * 1000;
                const end = start + durationMs;

                const interval = setInterval(() => {
                    const now = Date.now();
                    const diff = end - now;

                    if (diff <= 0) {
                        setTimeLeft("00:00");
                        setIsLow(true);
                        clearInterval(interval);
                    } else {
                        const minutes = Math.floor(diff / 60000);
                        const seconds = Math.floor((diff % 60000) / 1000);
                        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

                        if (minutes < 5) setIsLow(true);
                        else setIsLow(false);
                    }
                }, 1000);

                return () => clearInterval(interval);
            } catch (e) {
                console.error("Failed to init timer", e);
            }
        };
        fetchSessionInfo();
    }, [sessionId, currentStep]);

    return (
        <div className={`font-mono text-lg font-bold ${isLow ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
            {timeLeft}
        </div>
    );
}

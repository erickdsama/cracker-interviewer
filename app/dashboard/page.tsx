'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Clock, ChevronRight } from 'lucide-react';
import api from '@/lib/api';

interface Session {
    id: string;
    job_title: string;
    company_name: string;
    status: string;
    created_at: string;
}

export default function Dashboard() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await api.get('/sessions');
                setSessions(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                        <p className="text-gray-400">Manage your interview practice sessions</p>
                    </div>
                    <Link href="/sessions/new" className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-full font-medium transition-colors">
                        <Plus className="w-4 h-4" />
                        New Session
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center text-gray-500">Loading sessions...</div>
                ) : (
                    <div className="grid gap-4">
                        {sessions.map((session) => (
                            <Link key={session.id} href={`/sessions/${session.id}`} className="group block p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold group-hover:text-purple-400 transition-colors">{session.job_title}</h3>
                                            <p className="text-gray-400">{session.company_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${session.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {session.status}
                                        </span>
                                        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

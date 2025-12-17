'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';

export default function NewSession() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        job_title: '',
        company_name: '',
        jd_content: '',
    });

    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('job_title', formData.job_title);
            formDataToSend.append('company_name', formData.company_name);
            formDataToSend.append('jd_content', formData.jd_content);
            if (file) {
                formDataToSend.append('resume', file);
            }

            const res = await api.post('/sessions/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            router.push(`/sessions/${res.data.id}`);
        } catch (err) {
            console.error(err);
            // Fallback for demo if backend not running
            // router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold mb-8">Create New Session</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Job Title</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none transition-colors"
                            placeholder="e.g. Senior Software Engineer"
                            value={formData.job_title}
                            onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Company Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none transition-colors"
                            placeholder="e.g. Google"
                            value={formData.company_name}
                            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Job Description</label>
                        <textarea
                            required
                            rows={8}
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                            placeholder="Paste the job description here..."
                            value={formData.jd_content}
                            onChange={(e) => setFormData({ ...formData, jd_content: e.target.value })}
                        />
                    </div>

                    {/* File Upload */}
                    <div className="relative">
                        <input
                            type="file"
                            id="resume-upload"
                            className="hidden"
                            accept=".pdf,.docx"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                        <label
                            htmlFor="resume-upload"
                            className={`block p-8 border-2 border-dashed rounded-xl text-center transition-colors cursor-pointer ${file ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-purple-500/50'
                                }`}
                        >
                            <Upload className={`w-8 h-8 mx-auto mb-4 ${file ? 'text-purple-400' : 'text-gray-400'}`} />
                            <p className="text-sm text-gray-400">
                                {file ? file.name : 'Upload Resume (Optional)'}
                            </p>
                            <p className="text-xs text-gray-600 mt-2">PDF or DOCX up to 5MB</p>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Session...' : 'Start Practice Session'}
                    </button>
                </form>
            </div>
        </div>
    );
}

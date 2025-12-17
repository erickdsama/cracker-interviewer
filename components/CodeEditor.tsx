import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play } from 'lucide-react';
import api from '@/lib/api';

interface CodeEditorProps {
    initialCode?: string;
}

export default function CodeEditor({ initialCode = "# Write your Python code here\nprint('Hello World')" }: CodeEditorProps) {
    const [code, setCode] = useState(initialCode);
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);

    const handleRun = async () => {
        setIsRunning(true);
        setOutput("Running...");
        try {
            const res = await api.post('/code/run', { code });
            setOutput(res.data.output);
        } catch (err) {
            setOutput("Error running code");
            console.error(err);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] rounded-lg overflow-hidden border border-white/10">
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/10">
                <span className="text-sm font-medium text-gray-300">Python 3</span>
                <button
                    onClick={handleRun}
                    disabled={isRunning}
                    className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
                >
                    <Play className="w-3 h-3" />
                    {isRunning ? 'Running...' : 'Run Code'}
                </button>
            </div>
            <div className="flex-1 min-h-[300px]">
                <Editor
                    height="100%"
                    defaultLanguage="python"
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                    }}
                />
            </div>
            <div className="h-32 bg-black border-t border-white/10 p-3 font-mono text-sm overflow-auto">
                <div className="text-gray-500 text-xs mb-1">Output:</div>
                <pre className="text-gray-300 whitespace-pre-wrap">{output}</pre>
            </div>
        </div>
    );
}

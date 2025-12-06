'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';

export default function CreateRFP() {
    const router = useRouter();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
        { role: 'ai', content: 'Hello! Describe what you need to purchase, and I will generate a structured RFP for you.' }
    ]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            // Call backend to generate RFP
            const res = await api.post('/rfp/create', { content: userMsg });
            const rfp = res.data;

            setMessages(prev => [...prev, {
                role: 'ai',
                content: `I've created a draft RFP for "${rfp.title}". Redirecting you to review it...`
            }]);

            setTimeout(() => {
                router.push(`/rfp/${rfp._id}`);
            }, 1500);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, something went wrong. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
            <Card className="w-full max-w-2xl h-[600px] flex flex-col">
                <CardHeader>
                    <CardTitle>Create RFP Assistant</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto space-y-4 p-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 p-3 rounded-lg flex items-center">
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                    Generating structure...
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="E.g., I need 50 Dell XPS laptops with i7 processors..."
                            disabled={loading}
                        />
                        <Button type="submit" disabled={loading}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

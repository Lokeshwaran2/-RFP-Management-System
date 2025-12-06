'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function ComparisonPage() {
    const params = useParams();
    const [comparison, setComparison] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComparison = async () => {
            try {
                const res = await api.post(`/rfp/${params.id}/compare`);
                setComparison(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (params.id) fetchComparison();
    }, [params.id]);

    if (loading) return <div className="p-8 text-center">Running AI Comparison...</div>;
    if (!comparison) return <div className="p-8 text-center">Could not generate comparison. Ensure proposals exist.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold">AI Proposal Comparison</h1>

                {/* Recommendation */}
                <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                        <CardTitle className="text-green-800 flex items-center">
                            <CheckCircle2 className="mr-2" />
                            Recommended: {comparison.recommendation.split('<')[0].replace(/"/g, '').trim()}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-green-700">{comparison.justification}</p>
                    </CardContent>
                </Card>

                {/* Matrix */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {comparison.comparison_matrix.map((item: any, i: number) => (
                        <Card key={i} className="relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-sm font-bold rounded-bl-lg">
                                Score: {item.score}
                            </div>
                            <CardHeader>
                                <CardTitle>{item.vendor_id.split('<')[0].replace(/"/g, '').trim()}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm text-gray-600 italic border-l-2 border-blue-200 pl-3">
                                    {item.analysis || "No detailed analysis available."}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-green-600 mb-2 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1" /> Pros</h4>
                                    <ul className="text-sm space-y-1">
                                        {item.pros.map((pro: string, j: number) => (
                                            <li key={j}>• {pro}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-red-600 mb-2 flex items-center"><XCircle className="w-4 h-4 mr-1" /> Cons</h4>
                                    <ul className="text-sm space-y-1">
                                        {item.cons.map((con: string, j: number) => (
                                            <li key={j}>• {con}</li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

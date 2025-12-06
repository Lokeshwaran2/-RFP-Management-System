'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Mail, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RFPDetails() {
    const params = useParams();
    const router = useRouter();
    const [rfp, setRfp] = useState<any>(null);
    const [vendors, setVendors] = useState<any[]>([]);
    const [proposals, setProposals] = useState<any[]>([]);
    const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [rfpRes, vendorsRes, proposalsRes] = await Promise.all([
                    api.get(`/rfp/${params.id}`),
                    api.get('/vendors'),
                    api.get(`/rfp/${params.id}/proposals`)
                ]);
                setRfp(rfpRes.data);
                setVendors(vendorsRes.data);
                setProposals(proposalsRes.data);
            } catch (error) {
                console.error(error);
            }
        };
        if (params.id) fetchData();
    }, [params.id]);

    const toggleVendor = (id: string) => {
        setSelectedVendors(prev =>
            prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
        );
    };

    const sendEmails = async () => {
        if (selectedVendors.length === 0) return;
        setSending(true);
        try {
            await api.post(`/rfp/${params.id}/send-emails`, { vendorIds: selectedVendors });
            toast.success('Emails sent successfully!');
            // Refresh RFP status
            const res = await api.get(`/rfp/${params.id}`);
            setRfp(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to send emails');
        } finally {
            setSending(false);
        }
    };

    if (!rfp) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">{rfp.title}</h1>
                        <p className="text-gray-500 mt-2">{rfp.content}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => {
                            if (proposals.length === 0) {
                                toast.error('No received proposals to compare');
                            } else {
                                router.push(`/rfp/${params.id}/compare`);
                            }
                        }}>
                            <BarChart2 className="mr-2 h-4 w-4" />
                            Compare Proposals
                        </Button>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${rfp.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-200'
                            }`}>
                            {rfp.status}
                        </span>
                    </div>
                </div>

                {/* Structured Data */}
                <Card>
                    <CardHeader>
                        <CardTitle>Structured Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <span className="font-semibold">Budget:</span> {rfp.structuredData.budget}
                            </div>
                            <div>
                                <span className="font-semibold">Timeline:</span> {rfp.structuredData.timeline}
                            </div>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2">Item</th>
                                    <th className="p-2">Quantity</th>
                                    <th className="p-2">Specs</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rfp.structuredData.items.map((item: any, i: number) => (
                                    <tr key={i} className="border-b">
                                        <td className="p-2">{item.name}</td>
                                        <td className="p-2">{item.quantity}</td>
                                        <td className="p-2">{item.specs}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Vendor Management */}
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle>Select Vendors</CardTitle>
                            <Button size="sm" onClick={sendEmails} disabled={sending || selectedVendors.length === 0}>
                                <Mail className="mr-2 h-4 w-4" />
                                {sending ? 'Sending...' : 'Send RFP'}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {vendors.map(vendor => (
                                    <div key={vendor._id} className="flex items-center p-2 hover:bg-gray-50 rounded border">
                                        <input
                                            type="checkbox"
                                            className="mr-3 h-4 w-4"
                                            checked={selectedVendors.includes(vendor._id)}
                                            onChange={() => toggleVendor(vendor._id)}
                                        />
                                        <div>
                                            <div className="font-medium">{vendor.name}</div>
                                            <div className="text-xs text-gray-500">{vendor.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Proposals */}
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle>Received Proposals ({proposals.length})</CardTitle>
                            <Button size="sm" variant="outline" onClick={() => {
                                toast.promise(
                                    async () => {
                                        // Pass current RFP ID to simulate a response for THIS specific RFP
                                        await api.post('/email/ingest', { rfpId: params.id });
                                        // Refresh proposals
                                        const res = await api.get(`/rfp/${params.id}/proposals`);
                                        setProposals(res.data);
                                    },
                                    {
                                        loading: 'Checking inbox for new proposals...',
                                        success: 'Successfully checked for new emails!',
                                        error: 'Failed to check emails'
                                    }
                                );
                            }}>
                                <Mail className="mr-2 h-4 w-4" />
                                Check Responses
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {proposals.length === 0 ? (
                                <div className="text-gray-500 text-center py-4">No proposals yet.</div>
                            ) : (
                                <div className="space-y-3">
                                    {proposals.map(p => (
                                        <div key={p._id} className="p-3 border rounded bg-white">
                                            <div className="flex justify-between">
                                                <span className="font-medium">
                                                    {p.vendorId ? p.vendorId.name : p.vendorEmail}
                                                </span>
                                                <span className="font-bold">
                                                    {p.extractedData?.currency} {p.extractedData?.totalPrice}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Received: {new Date(p.receivedAt).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

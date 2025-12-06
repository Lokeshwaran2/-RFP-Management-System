'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, User } from 'lucide-react';

export default function VendorsPage() {
    const [vendors, setVendors] = useState<any[]>([]);
    const [newVendor, setNewVendor] = useState({ name: '', email: '', contactPerson: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const res = await api.get('/vendors');
            setVendors(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newVendor.name || !newVendor.email) return;

        setLoading(true);
        try {
            await api.post('/vendors', newVendor);
            setNewVendor({ name: '', email: '', contactPerson: '' });
            fetchVendors();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold">Vendor Management</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Add New Vendor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium">Company Name</label>
                                <Input
                                    value={newVendor.name}
                                    onChange={e => setNewVendor({ ...newVendor, name: e.target.value })}
                                    placeholder="Acme Corp"
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    value={newVendor.email}
                                    onChange={e => setNewVendor({ ...newVendor, email: e.target.value })}
                                    placeholder="sales@acme.com"
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium">Contact Person</label>
                                <Input
                                    value={newVendor.contactPerson}
                                    onChange={e => setNewVendor({ ...newVendor, contactPerson: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>
                            <Button type="submit" disabled={loading}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-4">
                    {vendors.map(vendor => (
                        <Card key={vendor._id}>
                            <CardContent className="p-4 flex items-center space-x-4">
                                <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="font-bold">{vendor.name}</div>
                                    <div className="text-sm text-gray-500">{vendor.email}</div>
                                    <div className="text-xs text-gray-400">{vendor.contactPerson}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

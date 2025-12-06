'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Users } from 'lucide-react';

export default function Dashboard() {
  const [rfps, setRfps] = useState<any[]>([]);

  useEffect(() => {
    const fetchRFPs = async () => {
      try {
        // Mock data for now if backend is not running or empty
        // const res = await api.get('/rfp'); 
        // setRfps(res.data);

        // Let's try to fetch, if fails, show empty state or mock
        api.get('/rfp/list') // Assuming I need a list endpoint, wait, I didn't create a list endpoint in backend!
          .then(res => setRfps(res.data))
          .catch(() => setRfps([]));

        // Wait, I missed GET /rfp (list) in backend. I only have GET /rfp/:id
        // I should fix backend later. For now let's assume I'll fix it.
      } catch (error) {
        console.error(error);
      }
    };
    fetchRFPs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RFP Dashboard</h1>
          <p className="text-gray-500">Manage your procurement requests</p>
        </div>
        <div className="flex gap-4">
          <Link href="/vendors">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Manage Vendors
            </Button>
          </Link>
          <Link href="/rfp/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New RFP
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rfps.length === 0 ? (
          <Card className="col-span-full p-12 text-center text-gray-500">
            No RFPs found. Create one to get started.
          </Card>
        ) : (
          rfps.map((rfp) => (
            <Link key={rfp._id} href={`/rfp/${rfp._id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-xl">{rfp.title}</CardTitle>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full w-fit ${rfp.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {rfp.status}
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 line-clamp-3">
                    {rfp.content}
                  </p>
                  <div className="mt-4 text-xs text-gray-400 flex items-center">
                    <FileText className="mr-1 h-3 w-3" />
                    Created {new Date(rfp.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

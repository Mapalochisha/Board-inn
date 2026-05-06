'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function LandlordListingsPage() {
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/properties?landlord=true')
      .then((res) => res.json())
      .then((data) => setProperties(data.data));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge variant="secondary">Draft</Badge>;
      case 'published': return <Badge className="bg-green-500">Published</Badge>;
      case 'archived': return <Badge variant="destructive">Archived</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <Button asChild>
          <Link href="/dashboard/landlord/listings/new">Add New Listing</Link>
        </Button>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-20 border rounded-lg">
          <p className="mb-4">You haven't listed any properties yet.</p>
          <Button asChild>
            <Link href="/dashboard/landlord/listings/new">Create your first listing</Link>
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Units</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.title}</TableCell>
                <TableCell>{p.city}</TableCell>
                <TableCell>{getStatusBadge(p.status)}</TableCell>
                <TableCell>{p.units?.length || 0}</TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/listings/${p.id}`}>View</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/landlord/listings/${p.id}/slots`}>Manage Slots</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

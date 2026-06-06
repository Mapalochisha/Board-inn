'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Building2, Eye, Calendar, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { EmptyState } from '@/components/shared/EmptyState';

export default function LandlordListingsPage() {
  const [properties, setProperties] = useState<any[]>([]);

  const fetchProperties = () => {
    fetch('/api/properties?landlord=true')
      .then((res) => res.json())
      .then((json) => {
        setProperties(json.data || []);
      });
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will archive the listing.`)) return;

    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Listing archived successfully');
        fetchProperties();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to delete listing');
      }
    } catch (err) {
      toast.error('An error occurred while deleting the listing');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800',
    };
    return <Badge variant="outline" className={variants[status] || 'bg-gray-100'}>{status}</Badge>;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
          <p className="text-muted-foreground mt-1">Manage all your properties and viewing schedules.</p>
        </div>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20">
          <Link href="/landlord/listings/new">
            <PlusCircle className="w-4 h-4 mr-2" />
            Add New Listing
          </Link>
        </Button>
      </div>

      {properties.length === 0 ? (
        <EmptyState 
          icon={Building2}
          title="No listings found"
          description="You haven't added any properties yet. Start by creating your first listing to attract tenants."
          action={{
            label: "Create your first listing",
            href: "/landlord/listings/new"
          }}
          className="border-2 border-dashed rounded-2xl bg-card py-20"
        />
      ) : (
        <div className="border rounded-xl shadow-sm overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Units</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>{p.city}</TableCell>
                  <TableCell>{getStatusBadge(p.status)}</TableCell>
                  <TableCell className="text-right">{p.units?.length || 0}</TableCell>
                  <TableCell className="flex justify-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/listings/${p.id}`}><Eye className="w-4 h-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/landlord/listings/${p.id}/edit`}><Pencil className="w-4 h-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/landlord/listings/${p.id}/slots`}><Calendar className="w-4 h-4" /></Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(p.id, p.title)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

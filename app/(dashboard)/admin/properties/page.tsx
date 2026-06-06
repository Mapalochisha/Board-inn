'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Building2, MapPin, Eye, Trash2, CheckCircle, Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';

export default function AdminProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      // Add a special query param for admin to see all properties
      const res = await fetch('/api/properties?landlord=true');
      const json = await res.json();
      setProperties(json.data || []);
    } catch (err) {
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleStatusChange = async (propertyId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        toast.success(`Property status updated to ${newStatus}`);
        setProperties(properties.map(p => p.id === propertyId ? { ...p, status: newStatus } : p));
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to update status");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Permanently delete "${title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Property deleted');
        setProperties(properties.filter(p => p.id !== id));
      } else {
        toast.error('Failed to delete property');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Property Audit</h1>
          <p className="text-muted-foreground mt-1">Review and manage all property listings across the platform.</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl flex items-center gap-2 font-semibold">
          <Building2 className="w-5 h-5" />
          <span>{properties.length} Total Listings</span>
        </div>
      </div>

      <div className="border rounded-2xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm border-black/5 dark:border-white/5">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pricing</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((prop) => (
              <TableRow key={prop.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{prop.title}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">ID: {prop.id.slice(0, 8)}...</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span>{prop.city}, {prop.district}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className={
                      prop.status === 'published' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200' 
                        : prop.status === 'draft'
                        ? 'bg-amber-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400 border-slate-200'
                    }
                  >
                    {prop.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-bold text-primary">ZMW {prop.min_price || 'N/A'}</span>
                </TableCell>
                <TableCell className="text-right flex justify-end gap-2 py-4">
                  <Button variant="ghost" size="sm" asChild className="h-9 w-9 p-0">
                    <Link href={`/listings/${prop.id}`} target="_blank"><Eye className="w-4 h-4" /></Link>
                  </Button>
                  
                  <Select 
                    defaultValue={prop.status} 
                    onValueChange={(val) => handleStatusChange(prop.id, val)}
                  >
                    <SelectTrigger className="w-[130px] h-9">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(prop.id, prop.title)}
                    className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

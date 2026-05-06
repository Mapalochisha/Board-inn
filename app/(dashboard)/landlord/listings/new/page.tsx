'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function NewListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    title: '', description: '', address_line1: '', address_line2: '', city: '', district: '',
    images: [], amenity_ids: [], units: []
  });

  const updateField = (field: string, value: any) => setFormData((prev: any) => ({ ...prev, [field]: value }));

  const handleSubmit = async (status: string) => {
    toast.loading('Creating listing...');
    
    // 1. Create property
    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, status })
    });
    
    if (res.ok) {
      const { id } = await res.json();
      // 2. Put amenities & 3. Post units (simplified for demo)
      await fetch(`/api/properties/${id}/amenities`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amenity_ids: formData.amenity_ids }) 
      });
      for (const unit of formData.units) {
        await fetch(`/api/properties/${id}/units`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(unit) 
        });
      }
      
      toast.dismiss();
      toast.success('Listing created successfully!');
      router.push('/dashboard/landlord/listings');
    } else {
      toast.error('Failed to create listing');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="w-full bg-gray-200 h-2 rounded-full">
        <div className="bg-primary h-2 rounded-full" style={{ width: `${(step / 5) * 100}%` }} />
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Basic Information</h2>
          <Input placeholder="Title" value={formData.title} onChange={e => updateField('title', e.target.value)} />
          <Textarea placeholder="Description" value={formData.description} onChange={e => updateField('description', e.target.value)} />
          <Input placeholder="Address Line 1" value={formData.address_line1} onChange={e => updateField('address_line1', e.target.value)} />
          <Input placeholder="City" value={formData.city} onChange={e => updateField('city', e.target.value)} />
          <Button onClick={() => setStep(2)}>Next</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Photos</h2>
          <Input type="file" multiple onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const res = await fetch('/api/upload/property-image', { method: 'POST', body: file });
            const { url } = await res.json();
            updateField('images', [...formData.images, url]);
          }} />
          <div className="grid grid-cols-3 gap-2">
            {formData.images.map((img: string) => <img key={img} src={img} className="rounded" />)}
          </div>
          <Button onClick={() => setStep(3)}>Next</Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Amenities</h2>
          <p>Amenities selection list...</p>
          <Button onClick={() => setStep(4)}>Next</Button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Units</h2>
          <Button onClick={() => updateField('units', [...formData.units, { name: '', price: 0 }])}>Add Unit</Button>
          <Button onClick={() => setStep(5)}>Next</Button>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Review</h2>
          <pre>{JSON.stringify(formData, null, 2)}</pre>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => handleSubmit('draft')}>Save as Draft</Button>
            <Button onClick={() => handleSubmit('published')}>Publish Now</Button>
          </div>
        </div>
      )}
    </div>
  );
}

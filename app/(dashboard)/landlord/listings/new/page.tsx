'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Trash2, Upload, ChevronRight, ChevronLeft, Check, Camera, ListChecks, Building2, MapPin } from 'lucide-react';
import Image from 'next/image';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: Building2 },
  { id: 2, title: 'Photos', icon: Camera },
  { id: 3, title: 'Amenities', icon: ListChecks },
  { id: 4, title: 'Units', icon: Plus },
  { id: 5, title: 'Review', icon: Check },
];

export default function NewListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [amenities, setAmenities] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    address_line1: '',
    address_line2: '',
    city: '',
    district: '',
    images: [],
    amenity_ids: [],
    units: [{ name: '', unit_type: 'room', price_per_month: 0, total_capacity: 1, gender_restriction: 'mixed', available_from: new Date().toISOString().split('T')[0] }]
  });

  useEffect(() => {
    fetch('/api/amenities')
      .then(res => res.json())
      .then(json => setAmenities(json.data || []));
  }, []);

  const updateField = (field: string, value: any) => setFormData((prev: any) => ({ ...prev, [field]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setLoading(true);
    for (let i = 0; i < files.length; i++) {
      const formDataUpload = new FormData();
      formDataUpload.append('file', files[i]);
      
      const res = await fetch('/api/upload/property-image', { method: 'POST', body: formDataUpload });
      if (res.ok) {
        const { url } = await res.json();
        setFormData((prev: any) => ({ ...prev, images: [...prev.images, url] }));
      }
    }
    setLoading(false);
  };

  const removeImage = (url: string) => {
    setFormData((prev: any) => ({ ...prev, images: prev.images.filter((img: string) => img !== url) }));
  };

  const toggleAmenity = (id: string) => {
    setFormData((prev: any) => ({
      ...prev,
      amenity_ids: prev.amenity_ids.includes(id) 
        ? prev.amenity_ids.filter((aid: string) => aid !== id)
        : [...prev.amenity_ids, id]
    }));
  };

  const addUnit = () => {
    setFormData((prev: any) => ({
      ...prev,
      units: [...prev.units, { name: '', unit_type: 'room', price_per_month: 0, total_capacity: 1, gender_restriction: 'mixed', available_from: new Date().toISOString().split('T')[0] }]
    }));
  };

  const updateUnit = (index: number, field: string, value: any) => {
    const newUnits = [...formData.units];
    newUnits[index] = { ...newUnits[index], [field]: value };
    updateField('units', newUnits);
  };

  const removeUnit = (index: number) => {
    updateField('units', formData.units.filter((_: any, i: number) => i !== index));
  };

  const handleSubmit = async (status: string) => {
    setLoading(true);
    const toastId = toast.loading('Creating listing...');
    
    try {
      // 1. Create property
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          address_line1: formData.address_line1,
          address_line2: formData.address_line2,
          city: formData.city,
          district: formData.district,
          cover_image_url: formData.images[0] || null,
          status
        })
      });
      
      if (!res.ok) throw new Error('Failed to create property');
      const { data: property } = await res.json();
      const propertyId = property.id;

      // 2. Add Amenities
      if (formData.amenity_ids.length > 0) {
        await fetch(`/api/properties/${propertyId}/amenities`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amenity_ids: formData.amenity_ids })
        });
      }

      // 3. Add Units
      for (const unit of formData.units) {
        const mappedUnit = {
          ...unit,
          unit_type: unit.unit_type === 'room' ? 'full_room' : 'bed_space',
          gender_restriction: unit.gender_restriction === 'mixed' ? 'any' : unit.gender_restriction
        };
        await fetch(`/api/properties/${propertyId}/units`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mappedUnit)
        });
      }

      toast.success('Listing created successfully!', { id: toastId });
      router.push('/landlord/listings');
    } catch (error) {
      toast.error('Something went wrong. Please try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Create New Listing</h1>
        <p className="text-muted-foreground">Follow the steps to list your property on Board-inn.</p>
      </div>

      {/* Progress Stepper */}
      <div className="relative flex justify-between items-center w-full mb-12">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
        {STEPS.map((s) => (
          <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${step >= s.id ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-muted text-muted-foreground'}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <span className={`text-xs font-medium ${step >= s.id ? 'text-foreground' : 'text-muted-foreground'}`}>{s.title}</span>
          </div>
        ))}
      </div>

      <div className="min-h-[400px]">
        {step === 1 && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell us the core details about your property.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Property Title</Label>
                <Input id="title" placeholder="e.g. Modern Apartment near University" value={formData.title} onChange={e => updateField('title', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe your property, rules, and nearby attractions..." className="min-h-[120px]" value={formData.description} onChange={e => updateField('description', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address1">Address Line 1</Label>
                  <Input id="address1" placeholder="Street address" value={formData.address_line1} onChange={e => updateField('address_line1', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                  <Input id="address2" placeholder="Apartment, suite, unit, etc." value={formData.address_line2} onChange={e => updateField('address_line2', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="e.g. Lusaka" value={formData.city} onChange={e => updateField('city', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input id="district" placeholder="e.g. Rhodes Park" value={formData.district} onChange={e => updateField('district', e.target.value)} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!formData.title || !formData.city}>
                Next: Photos <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle>Property Photos</CardTitle>
              <CardDescription>Upload clear photos to attract more potential renters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed rounded-xl p-10 text-center space-y-4 hover:bg-muted/50 transition-colors cursor-pointer relative">
                <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">Click or drag images to upload</p>
                  <p className="text-sm text-muted-foreground">Supports JPG, PNG (Max 5MB each)</p>
                </div>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((url: string, i: number) => (
                    <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border">
                      <Image src={url} alt={`Upload ${i}`} fill className="object-cover" />
                      <button onClick={() => removeImage(url)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {i === 0 && <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold">Cover</span>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
              <Button onClick={() => setStep(3)}>
                Next: Amenities <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 3 && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
              <CardDescription>Select what facilities are included in your property.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenities.map((amenity) => (
                  <div 
                    key={amenity.id} 
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${formData.amenity_ids.includes(amenity.id) ? 'bg-primary/10 border-primary shadow-sm' : 'hover:border-primary/50'}`}
                  >
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={formData.amenity_ids.includes(amenity.id)} 
                      readOnly 
                    />
                    <span className="text-sm font-medium">{amenity.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
              <Button onClick={() => setStep(4)}>
                Next: Units <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 4 && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Available Units</CardTitle>
                  <CardDescription>Add specific rooms or bed spaces available for rent.</CardDescription>
                </div>
                <Button onClick={addUnit} size="sm" variant="outline"><Plus className="w-4 h-4 mr-2" /> Add Unit</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.units.map((unit: any, index: number) => (
                <div key={index} className="p-6 border rounded-xl space-y-4 relative bg-muted/30">
                  <button onClick={() => removeUnit(index)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Unit Name</Label>
                      <Input placeholder="e.g. Bedroom 1" value={unit.name} onChange={e => updateUnit(index, 'name', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Price (ZMW / month)</Label>
                      <Input type="number" value={unit.price_per_month} onChange={e => updateUnit(index, 'price_per_month', parseFloat(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit Type</Label>
                      <div className="flex gap-2">
                        <Button variant={unit.unit_type === 'room' ? 'default' : 'outline'} size="sm" onClick={() => updateUnit(index, 'unit_type', 'room')} className="flex-1">Room</Button>
                        <Button variant={unit.unit_type === 'bedspace' ? 'default' : 'outline'} size="sm" onClick={() => updateUnit(index, 'unit_type', 'bedspace')} className="flex-1">Bedspace</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Gender Restriction</Label>
                      <select 
                        className="w-full border rounded-md h-9 px-3 text-sm"
                        value={unit.gender_restriction}
                        onChange={e => updateUnit(index, 'gender_restriction', e.target.value)}
                      >
                        <option value="mixed">Mixed</option>
                        <option value="male">Male Only</option>
                        <option value="female">Female Only</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
              <Button onClick={() => setStep(5)} disabled={formData.units.length === 0}>
                Next: Review <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 5 && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle>Review & Submit</CardTitle>
              <CardDescription>Confirm all details are correct before listing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Property</Label>
                    <p className="text-xl font-bold">{formData.title}</p>
                    <p className="text-sm text-muted-foreground">{formData.address_line1}, {formData.city}</p>
                  </div>
                  <div>
                    <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Description</Label>
                    <p className="text-sm line-clamp-3">{formData.description}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {formData.amenity_ids.map((aid: string) => {
                      const amen = amenities.find(a => a.id === aid);
                      return amen ? <span key={aid} className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-medium">{amen.name}</span> : null;
                    })}
                  </div>
                </div>
                <div className="relative aspect-video rounded-xl overflow-hidden border">
                  <Image src={formData.images[0] || '/placeholder.jpg'} alt="Preview" fill className="object-cover" />
                </div>
              </div>
              
              <div className="border-t pt-6">
                <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider mb-4 block">Units Summary</Label>
                <div className="space-y-2">
                  {formData.units.map((u: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                      <span className="font-medium">{u.name || 'Untitled Unit'}</span>
                      <span className="font-bold text-primary">ZMW {u.price_per_month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(4)} disabled={loading}><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => handleSubmit('draft')} disabled={loading}>Save as Draft</Button>
                <Button onClick={() => handleSubmit('published')} disabled={loading}>Publish Now</Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}

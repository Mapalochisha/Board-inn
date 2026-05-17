"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImagePlus, Trash2, Loader2, Save } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function HeroManager() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setImages(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/property-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.data?.url) {
        setImages((prev) => [...prev, data.data.url]);
        toast.success("Image uploaded!");
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        body: JSON.stringify({ images }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        toast.success("Hero images saved successfully!");
      } else {
        throw new Error("Failed to save changes");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hero Image Manager</h1>
          <p className="text-slate-500 text-sm">Manage the background images for your home page carousel.</p>
        </div>
        <Button onClick={saveChanges} disabled={saving} className="bg-green-600 hover:bg-green-700">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <Card className="border-black/5 dark:border-white/5">
        <CardHeader>
          <CardTitle className="text-lg">Current Carousel Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img, i) => (
              <div key={i} className="relative group aspect-video rounded-xl overflow-hidden border border-black/5">
                <Image src={img} alt={`Hero ${i}`} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="destructive" size="icon" onClick={() => removeImage(i)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl aspect-video flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
              <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
              {uploading ? (
                <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
              ) : (
                <>
                  <ImagePlus className="w-8 h-8 text-slate-300 mb-2" />
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Add New Image</span>
                </>
              )}
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

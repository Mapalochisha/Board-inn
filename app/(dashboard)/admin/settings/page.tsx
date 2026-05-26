"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Globe, Shield, MessageSquare, Info } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    site_config: {
      name: "Board-inn",
      contact_email: "",
      contact_phone: "",
      office_address: "",
    },
    legal_terms: {
      privacy_policy: "",
      terms_of_service: "",
    },
    social_links: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.data) {
          const newSettings = { ...settings };
          data.data.forEach((s: any) => {
            if (newSettings[s.key] !== undefined) {
              newSettings[s.key] = s.value;
            }
          });
          setSettings(newSettings);
        }
      } catch (err) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (key: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        body: JSON.stringify({
          key,
          value: settings[key],
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        toast.success(`${key.replace("_", " ")} updated successfully!`);
      } else {
        throw new Error("Update failed");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateNested = (category: string, field: string, value: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Site Settings</h1>
        <p className="text-slate-500 text-sm">Configure global platform parameters, legal content, and contact information.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 p-1 h-12 rounded-xl">
          <TabsTrigger value="general" className="rounded-lg px-6 data-[state=active]:bg-green-50 data-[state=active]:text-green-600 dark:data-[state=active]:bg-green-500/10 dark:data-[state=active]:text-green-500">
            <Globe className="w-4 h-4 mr-2" /> General
          </TabsTrigger>
          <TabsTrigger value="legal" className="rounded-lg px-6 data-[state=active]:bg-green-50 data-[state=active]:text-green-600 dark:data-[state=active]:bg-green-500/10 dark:data-[state=active]:text-green-500">
            <Shield className="w-4 h-4 mr-2" /> Legal
          </TabsTrigger>
          <TabsTrigger value="social" className="rounded-lg px-6 data-[state=active]:bg-green-50 data-[state=active]:text-green-600 dark:data-[state=active]:bg-green-500/10 dark:data-[state=active]:text-green-500">
            <MessageSquare className="w-4 h-4 mr-2" /> Social
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="border-black/5 dark:border-white/5 shadow-sm">
            <CardHeader>
              <CardTitle>Site Configuration</CardTitle>
              <CardDescription>Basic information about the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input 
                    id="siteName" 
                    value={settings.site_config.name} 
                    onChange={(e) => updateNested("site_config", "name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input 
                    id="contactEmail" 
                    type="email" 
                    value={settings.site_config.contact_email} 
                    onChange={(e) => updateNested("site_config", "contact_email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input 
                    id="contactPhone" 
                    value={settings.site_config.contact_phone} 
                    onChange={(e) => updateNested("site_config", "contact_phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Office Address</Label>
                  <Input 
                    id="address" 
                    value={settings.site_config.office_address} 
                    onChange={(e) => updateNested("site_config", "office_address", e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave("site_config")} disabled={saving} className="bg-green-600 hover:bg-green-700">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal" className="space-y-6">
          <Card className="border-black/5 dark:border-white/5 shadow-sm">
            <CardHeader>
              <CardTitle>Privacy Policy</CardTitle>
              <CardDescription>Enter the privacy policy content in Markdown or plain text.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                className="min-h-[200px]" 
                value={settings.legal_terms.privacy_policy} 
                onChange={(e) => updateNested("legal_terms", "privacy_policy", e.target.value)}
              />
            </CardContent>
          </Card>

          <Card className="border-black/5 dark:border-white/5 shadow-sm">
            <CardHeader>
              <CardTitle>Terms of Service</CardTitle>
              <CardDescription>Enter the terms of service content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                className="min-h-[200px]" 
                value={settings.legal_terms.terms_of_service} 
                onChange={(e) => updateNested("legal_terms", "terms_of_service", e.target.value)}
              />
              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave("legal_terms")} disabled={saving} className="bg-green-600 hover:bg-green-700">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Legal Content
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card className="border-black/5 dark:border-white/5 shadow-sm">
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Manage the platform's social presence.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Facebook URL</Label>
                  <Input 
                    placeholder="https://facebook.com/boardinn" 
                    value={settings.social_links.facebook} 
                    onChange={(e) => updateNested("social_links", "facebook", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Twitter URL</Label>
                  <Input 
                    placeholder="https://twitter.com/boardinn" 
                    value={settings.social_links.twitter} 
                    onChange={(e) => updateNested("social_links", "twitter", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instagram URL</Label>
                  <Input 
                    placeholder="https://instagram.com/boardinn" 
                    value={settings.social_links.instagram} 
                    onChange={(e) => updateNested("social_links", "instagram", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn URL</Label>
                  <Input 
                    placeholder="https://linkedin.com/company/boardinn" 
                    value={settings.social_links.linkedin} 
                    onChange={(e) => updateNested("social_links", "linkedin", e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave("social_links")} disabled={saving} className="bg-green-600 hover:bg-green-700">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Social Links
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

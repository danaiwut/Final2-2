"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Calendar, Target, ImageIcon, Link as LinkIcon, BarChart3, Upload, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"

interface AdsManagerProps {
  ads: any[]
  adminId: string
}

export function AdsManager({ ads, adminId }: AdsManagerProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isCreating, setIsCreating] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    placement: "sidebar",
    is_active: true,
    start_date: "",
    end_date: "",
  })

  useEffect(() => {
    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      setFormData((prev) => ({ ...prev, end_date: prev.start_date }))
    }
  }, [formData.start_date])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const endpoint = editingId ? `/api/admin/ads/${editingId}` : "/api/admin/ads"
    const method = editingId ? "PUT" : "POST"

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, created_by: adminId }),
    })

    if (response.ok) {
      setIsCreating(false)
      setEditingId(null)
      resetForm()
      router.refresh()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return

    const response = await fetch(`/api/admin/ads/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      router.refresh()
    }
  }

  const handleEdit = (ad: any) => {
    setEditingId(ad.id)
    setFormData({
      title: ad.title,
      description: ad.description || "",
      image_url: ad.image_url || "",
      link_url: ad.link_url || "",
      placement: ad.placement,
      is_active: ad.is_active,
      start_date: ad.start_date || "",
      end_date: ad.end_date || "",
    })
    setIsCreating(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      link_url: "",
      placement: "sidebar",
      is_active: true,
      start_date: "",
      end_date: "",
    })
  }

  return (
    <div className="space-y-8">
      {!isCreating && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h3 className="font-semibold text-slate-800">Advertisement Campaigns</h3>
            <p className="text-sm text-slate-500">Manage your active and inactive ad campaigns</p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Create Ad Campaign
          </Button>
        </div>
      )}

      {isCreating && (
        <Card className="border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6 pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">{editingId ? "Edit Advertisement" : "Create New Advertisement"}</CardTitle>
                <CardDescription>Setup your ad copy, placement, and targeting dates.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Core Info */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-slate-700 font-medium">Ad Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Summer Premium Discount"
                      className="border-slate-200 focus-visible:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-700 font-medium">Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Catchy description to attract users..."
                      rows={4}
                      className="border-slate-200 focus-visible:ring-indigo-500 resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-700 font-medium flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-slate-400" />
                      Ad Image
                    </Label>
                    {formData.image_url && (
                      <div className="relative h-24 rounded-lg overflow-hidden border bg-slate-50">
                        <img src={formData.image_url} alt="Ad preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50/30 transition-all text-sm text-slate-600">
                          {uploadingImage ? (
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          {uploadingImage ? "Uploading..." : "Upload from device"}
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            setUploadingImage(true)
                            try {
                              const ext = file.name.split(".").pop()
                              const path = `ads/${Date.now()}.${ext}`
                              const { error } = await supabase.storage.from("ad-images").upload(path, file, { upsert: true })
                              if (error) throw error
                              const { data: urlData } = supabase.storage.from("ad-images").getPublicUrl(path)
                              setFormData({ ...formData, image_url: urlData.publicUrl })
                            } catch (err) {
                              console.error("Upload failed:", err)
                            } finally {
                              setUploadingImage(false)
                            }
                          }}
                        />
                      </label>
                    </div>
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="Or paste image URL..."
                      className="border-slate-200 focus-visible:ring-indigo-500 text-xs"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-700 font-medium flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-slate-400" />
                      Destination Link
                    </Label>
                    <Input
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                      placeholder="https://example.com/offer"
                      className="border-slate-200 focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Right Column - Settings */}
                <div className="space-y-6 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                  <div className="space-y-3">
                    <Label className="text-slate-700 font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-slate-400" />
                      Ad Placement Area
                    </Label>
                    <Select
                      value={formData.placement}
                      onValueChange={(value) => setFormData({ ...formData, placement: value })}
                    >
                      <SelectTrigger className="border-slate-200 focus-visible:ring-indigo-500 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="header">Header</SelectItem>
                        <SelectItem value="banner">Top Banner</SelectItem>
                        <SelectItem value="sidebar">Right Sidebar</SelectItem>
                        <SelectItem value="feed">In-Feed Layout</SelectItem>
                        <SelectItem value="footer">Footer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-slate-700 font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      Display Duration Schedule
                    </Label>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Date</Label>
                        <Input
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          className="bg-white border-slate-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">End Date</Label>
                        <Input
                          type="date"
                          value={formData.end_date}
                          min={formData.start_date || undefined}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          className="bg-white border-slate-200"
                          required
                        />
                      </div>
                    </div>

                    {formData.start_date && formData.end_date && (
                      <div className="flex items-center justify-between p-3 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 text-sm">
                        <span className="font-medium">Total Campaign Duration</span>
                        <span className="font-bold">
                          {Math.ceil(
                            (new Date(formData.end_date).getTime() - new Date(formData.start_date).getTime()) /
                              (1000 * 60 * 60 * 24),
                          ) + 1}{" "}
                          days
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                      <div className="space-y-0.5">
                        <Label className="text-slate-800 font-semibold cursor-pointer" htmlFor="status-toggle">
                          Campaign Status
                        </Label>
                        <p className="text-xs text-slate-500">Enable or disable this ad globally</p>
                      </div>
                      <Switch
                        id="status-toggle"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  onClick={() => {
                    setIsCreating(false)
                    setEditingId(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]">
                  {editingId ? "Save Changes" : "Launch Campaign"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Ads List Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {ads.map((ad) => (
          <Card key={ad.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
            {/* Ad Image / Placeholder */}
            <div className="h-40 bg-slate-100 flex items-center justify-center relative overflow-hidden border-b border-slate-100">
              {ad.image_url ? (
                <img
                  src={ad.image_url}
                  alt={ad.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <ImageIcon className="h-10 w-10 text-slate-300" />
              )}
              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge variant={ad.is_active ? "default" : "secondary"} className={ad.is_active ? "bg-green-500 hover:bg-green-600 shadow-sm" : "bg-slate-600 shadow-sm"}>
                  {ad.is_active ? "Active" : "Paused"}
                </Badge>
                <Badge className="bg-white/90 text-slate-700 hover:bg-white border-none shadow-sm backdrop-blur-sm capitalize">
                  {ad.placement}
                </Badge>
              </div>
              
              {/* Actions Overlay */}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">
                <Button variant="secondary" size="icon" className="h-8 w-8 bg-white hover:bg-slate-100 text-slate-700" onClick={() => handleEdit(ad)}>
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button variant="destructive" size="icon" className="h-8 w-8 shadow-sm" onClick={() => handleDelete(ad.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <CardContent className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-1" title={ad.title}>{ad.title}</h3>
              {ad.description && <p className="text-sm text-slate-500 line-clamp-2 mb-4">{ad.description}</p>}

              <div className="mt-auto space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100">
                  <div className="text-center">
                    <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Views</p>
                    <p className="font-semibold text-slate-700">{ad.impressions?.toLocaleString() || 0}</p>
                  </div>
                  <div className="text-center border-x border-slate-100">
                    <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Clicks</p>
                    <p className="font-semibold text-slate-700">{ad.clicks?.toLocaleString() || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">CTR</p>
                    <p className="font-semibold text-indigo-600">
                      {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>

                {/* Dates */}
                {ad.start_date && ad.end_date && (
                  <div className="flex items-center text-xs text-slate-500 gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      {format(new Date(ad.start_date), "MMM d")} - {format(new Date(ad.end_date), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

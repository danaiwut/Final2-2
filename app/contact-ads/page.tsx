"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Mail, Phone, Send, MessageSquare, Megaphone, CheckCircle2, Loader2, Target, Globe, Layout, PanelBottom, UserSquare2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

const placements = [
  {
    id: "overview",
    title: "Overview",
    icon: Target,
  },
  {
    id: "header",
    title: "Header Banner",
    description: "High-visibility placement at the top of every page",
    price: "Starting at ฿15,000/month",
    icon: Layout,
  },
  {
    id: "sidebar",
    title: "Sidebar Ads",
    description: "Persistent visibility alongside community and job content",
    price: "Starting at ฿8,000/month",
    icon: UserSquare2,
  },
  {
    id: "infeed",
    title: "In-Feed Ads",
    description: "Native placement within job listings and community posts",
    price: "Starting at ฿5,000/month",
    icon: Globe,
  },
  {
    id: "footer",
    title: "Footer Banner",
    description: "Always-visible placement at the bottom of pages",
    price: "Starting at ฿3,000/month",
    icon: PanelBottom,
  },
  {
    id: "contact",
    title: "Contact Us",
    icon: Mail,
  }
]

export default function ContactAdsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    budget: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setSubmitted(true)
    setIsSubmitting(false)
    toast.success("Your inquiry has been submitted!")
  }

  const renderContent = () => {
    if (activeTab === "overview") {
      return (
        <div className="space-y-6 animate-fade-up">
          <div>
            <h1 className="font-['Playfair_Display'] text-4xl font-bold text-[#3B2A1A] mb-4">
              Premium Advertising
            </h1>
            <p className="text-lg text-[#6B4C30] leading-relaxed max-w-2xl">
              Reach thousands of professionals, job seekers, and companies on Smart Persona.
              Our ad placements blend seamlessly into the user experience, providing high conversions and brand awareness.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {placements.filter(p => p.id !== "overview" && p.id !== "contact").map((p) => (
              <Card key={p.id} className="cursor-pointer hover:border-indigo-200 transition-colors" onClick={() => setActiveTab(p.id)}>
                <CardContent className="p-6">
                  <div className="p-2 w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                    <p.icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{p.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{p.description}</p>
                  <p className="text-sm font-bold text-indigo-600">{p.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    }

    if (activeTab === "contact") {
      return (
        <div className="animate-fade-up">
          {submitted ? (
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="p-4 bg-emerald-100 rounded-full mb-4">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Inquiry Received!</h3>
                <p className="text-center text-sm text-gray-600 max-w-sm">
                  Thank you for your interest. Our team will get back to you within 1-2 business days.
                </p>
                <Button
                  className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", company: "", phone: "", budget: "", message: "" }) }}
                >
                  Submit Another Inquiry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Contact Us</h2>
                <p className="text-sm text-gray-500 mb-6">Fill in your details to discuss advertising opportunities.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-gray-700 font-medium">Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-gray-700 font-medium">Email *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-gray-700 font-medium">Company</Label>
                      <Input
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Company name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-gray-700 font-medium">Phone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="08x-xxx-xxxx"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-gray-700 font-medium">Monthly Budget</Label>
                    <Input
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      placeholder="e.g. ฿10,000 - ฿50,000"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-gray-700 font-medium">Message *</Label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your advertising needs..."
                      rows={5}
                      required
                      className="resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-[#A07850] hover:bg-[#7A5C38] text-white font-medium text-base"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Submit Inquiry
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 space-y-3 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-900">Direct Contact</h3>
            <div className="flex gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                <a href="mailto:ads@smartpersona.com" className="text-indigo-600 hover:underline">ads@smartpersona.com</a>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>02-xxx-xxxx</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MessageSquare className="h-4 w-4 text-gray-400" />
                <span>LINE: @smartpersona</span>
              </div>
            </div>
          </div>
        </div>
      )
    }

    const currentTab = placements.find(p => p.id === activeTab)
    return (
      <div className="animate-fade-up space-y-6">
        <Card className="border-gray-200">
          <CardHeader className="border-b bg-gray-50/50 pb-6 rounded-t-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                {currentTab?.icon && <currentTab.icon className="h-6 w-6 text-indigo-600" />}
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">{currentTab?.title}</CardTitle>
                <p className="text-gray-500 mt-1">{currentTab?.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="bg-indigo-50/50 rounded-lg p-6 border border-indigo-100">
              <p className="font-semibold text-gray-900 mb-2">Pricing</p>
              <p className="text-2xl font-bold text-indigo-600">{currentTab?.price}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Why choose this placement?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0" />
                  <span className="text-gray-600">Premium visibility tailored precisely to your audience.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0" />
                  <span className="text-gray-600">High engagement rate with native styling that feels natural.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0" />
                  <span className="text-gray-600">Advanced targeting options available for verified companies.</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Button onClick={() => setActiveTab("contact")} className="bg-[#A07850] hover:bg-[#7A5C38]">
                Get in Touch to Book
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFAF6]">
      {/* Header */}
      <nav className="border-b border-[#E8DDD1] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-['Playfair_Display'] text-xl font-bold text-[#3B2A1A]">
            Smart Persona
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm text-[#6B4C30] hover:text-[#3B2A1A] transition-colors">
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="bg-[#A07850] hover:bg-[#7A5C38] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar Menu Bar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="sticky top-24 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-[#A07850]" />
                <span className="font-semibold text-gray-900">Advertising</span>
              </div>
              <div className="p-2 space-y-1">
                {placements.map((item) => {
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                      <item.icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
                      {item.title}
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {renderContent()}
          </main>

        </div>
      </div>
    </div>
  )
}
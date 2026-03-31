"use client"

import Link from "next/link"
import { Users, Briefcase, FileText, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { FadeUp } from "@/components/FadeUp"

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* Minimal Sticky Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-[rgba(253,250,246,0.85)] backdrop-blur-[14px] border-b border-[#D4B896]" : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-[1400px] px-8 py-6 flex items-center justify-between">
          <Link href="/" className="font-['Playfair_Display'] text-2xl font-bold text-[#3B2A1A]">
            Smart Persona
          </Link>
          <div className="flex items-center gap-12">
            <Link href="/community" className="text-[11px] uppercase tracking-[0.08em] text-[#6B4C30] hover:text-[#A07850] transition-colors">
              Community
            </Link>
            <Link href="/auth/login" className="text-[11px] uppercase tracking-[0.08em] text-[#6B4C30] hover:text-[#A07850] transition-colors">
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="border border-[#A07850] px-6 py-2 text-[11px] uppercase tracking-[0.08em] text-[#A07850] hover:bg-[#A07850] hover:text-white transition-all rounded"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-8 pt-32 pb-24">
        <div className="mx-auto max-w-5xl text-center">
          <FadeUp>
            <h1 className="font-['Playfair_Display'] mb-6">
              Build Your Professional
              <br />
              <span className="text-[#A07850]">Identity</span>
            </h1>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="text-lg text-[#6B4C30] max-w-2xl mx-auto mb-12">
              Create stunning professional profiles, connect with opportunities, and join a vibrant community of professionals and companies.
            </p>
          </FadeUp>
          <FadeUp delay={0.4}>
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/sign-up"
                className="bg-[#A07850] text-white px-8 py-3 text-[11px] uppercase tracking-[0.08em] hover:bg-[#7A5C38] transition-colors rounded"
              >
                Get Started Free
              </Link>
              <Link
                href="/auth/login"
                className="border border-[#A07850] text-[#A07850] px-8 py-3 text-[11px] uppercase tracking-[0.08em] hover:bg-[#A07850] hover:text-white transition-all rounded"
              >
                Sign In
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: FileText,
                title: "Smart Personas",
                description: "Create professional profiles with customizable templates and export to PDF",
              },
              {
                icon: Briefcase,
                title: "Job Opportunities",
                description: "Discover and apply to jobs that match your skills and career goals",
              },
              {
                icon: Users,
                title: "Community",
                description: "Network with professionals, share insights, and grow together",
              },
              {
                icon: Sparkles,
                title: "Real-time Chat",
                description: "Connect instantly with other professionals and companies",
              },
            ].map((feature, index) => (
              <FadeUp key={index} delay={index * 0.08}>
                <div className="bg-[#F5EDE2] border border-[#D4B896] rounded p-8">
                  <div className="w-12 h-12 bg-[#A07850] text-white rounded flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-['Playfair_Display'] text-xl mb-3 text-[#3B2A1A]">
                    {feature.title}
                  </h3>
                  <p className="text-[#6B4C30]">{feature.description}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-8 border-t border-[#D4B896]">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              { label: "Active Professionals", value: "10,000+" },
              { label: "Job Opportunities", value: "5,000+" },
              { label: "Community Posts", value: "50,000+" },
            ].map((stat, index) => (
              <FadeUp key={index} delay={index * 0.1}>
                <div className="font-['Playfair_Display'] text-5xl text-[#A07850] mb-2">
                  {stat.value}
                </div>
                <div className="text-[11px] uppercase tracking-[0.08em] text-[#6B4C30]">
                  {stat.label}
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8">
        <div className="mx-auto max-w-3xl text-center">
          <FadeUp>
            <h2 className="font-['Playfair_Display'] text-4xl mb-6">
              Ready to Get Started?
            </h2>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="text-lg text-[#6B4C30] mb-12">
              Join thousands of professionals already using Smart Persona to build their careers.
            </p>
          </FadeUp>
          <FadeUp delay={0.4}>
            <Link
              href="/auth/sign-up"
              className="inline-block bg-[#A07850] text-white px-12 py-4 text-[11px] uppercase tracking-[0.08em] hover:bg-[#7A5C38] transition-colors rounded"
            >
              Create Free Account
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#D4B896] py-8 px-8">
        <div className="mx-auto max-w-[1400px] flex items-center justify-between">
          <p className="text-sm text-[#6B4C30]">
            © 2026 Smart Persona. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <Link href="/community" className="text-[11px] uppercase tracking-[0.08em] text-[#6B4C30] hover:text-[#A07850] transition-colors">
              Community
            </Link>
            <Link href="/dashboard" className="text-[11px] uppercase tracking-[0.08em] text-[#6B4C30] hover:text-[#A07850] transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </>
  )
}

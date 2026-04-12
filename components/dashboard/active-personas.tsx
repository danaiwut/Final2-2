import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, ChevronRight, Sparkles } from "lucide-react"

interface Persona {
  id: string
  name: string
  description: string
  tone: string
  is_active: boolean
}

interface ActivePersonasProps {
  personas: Persona[]
}

const toneColors: Record<string, { bg: string; text: string }> = {
  professional: { bg: "bg-blue-50", text: "text-blue-700" },
  friendly: { bg: "bg-green-50", text: "text-green-700" },
  enthusiastic: { bg: "bg-orange-50", text: "text-orange-700" },
  formal: { bg: "bg-purple-50", text: "text-purple-700" },
  casual: { bg: "bg-pink-50", text: "text-pink-700" },
}

function getToneStyle(tone: string) {
  return toneColors[tone?.toLowerCase()] ?? { bg: "bg-[#F5EDE2]", text: "text-[#A07850]" }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const avatarColors = [
  "bg-[#A07850]",
  "bg-[#7B9E87]",
  "bg-[#6B7FA3]",
  "bg-[#A0507B]",
  "bg-[#8B6BAE]",
]

export function ActivePersonas({ personas }: ActivePersonasProps) {
  return (
    <div className="rounded-xl border border-[#E8DDD1] bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8DDD1] px-6 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#A07850]" />
          <div>
            <h3 className="font-['Playfair_Display'] text-base font-semibold text-[#3B2A1A]">
              Active Personas
            </h3>
            <p className="text-xs text-[#9B8577]">Your AI personalities</p>
          </div>
        </div>
        <Button
          asChild
          size="sm"
          className="bg-[#A07850] text-white hover:bg-[#8A6640] h-8 gap-1.5 rounded-lg px-3 text-xs"
        >
          <Link href="/dashboard/personas/new">
            <Plus className="h-3.5 w-3.5" />
            New Persona
          </Link>
        </Button>
      </div>

      {/* Content */}
      <div className="p-4">
        {personas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F5EDE2]">
              <Sparkles className="h-6 w-6 text-[#A07850]" />
            </div>
            <p className="mb-1 text-sm font-medium text-[#3B2A1A]">No personas yet</p>
            <p className="mb-4 text-xs text-[#9B8577]">Create your first AI personality to get started.</p>
            <Button asChild size="sm" className="bg-[#A07850] text-white hover:bg-[#8A6640] rounded-lg">
              <Link href="/dashboard/personas/new">Create Persona</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[#F0E6D8]">
            {personas.slice(0, 6).map((persona, i) => {
              const toneStyle = getToneStyle(persona.tone)
              const avatarBg = avatarColors[i % avatarColors.length]
              return (
                <Link
                  key={persona.id}
                  href={`/dashboard/personas/${persona.id}/edit`}
                  className="flex items-center gap-4 py-3.5 transition-colors hover:bg-[#FDFAF6] rounded-lg px-2 -mx-2"
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${avatarBg} text-white`}
                  >
                    <span className="text-sm font-semibold">{getInitials(persona.name)}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#3B2A1A]">{persona.name}</span>
                      {persona.is_active && (
                        <Badge className="h-4 rounded-full bg-green-100 px-1.5 text-[10px] font-medium text-green-700 hover:bg-green-100">
                          Active
                        </Badge>
                      )}
                    </div>
                    {persona.description && (
                      <p className="mt-0.5 truncate text-xs text-[#9B8577]">{persona.description}</p>
                    )}
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${toneStyle.bg} ${toneStyle.text}`}
                    >
                      {persona.tone}
                    </span>
                  </div>

                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-[#C4A882]" />
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {personas.length > 6 && (
        <div className="border-t border-[#E8DDD1] px-6 py-3">
          <Link
            href="/dashboard/personas"
            className="text-xs font-medium text-[#A07850] hover:text-[#8A6640] hover:underline"
          >
            View all {personas.length} personas →
          </Link>
        </div>
      )}
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

interface StatsCardsProps {
  personasCount: number
}

export function StatsCards({ personasCount }: StatsCardsProps) {
  return (
    <Card className="overflow-hidden border border-[#D4B896] bg-[#F5EDE2] transition-all">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="font-['Playfair_Display'] text-base font-semibold text-[#3B2A1A]">Active Personas</CardTitle>
        <div className="rounded bg-[#A07850] p-2">
          <Users className="h-5 w-5 text-white" />
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="font-['Playfair_Display'] text-4xl font-bold tracking-tight text-[#A07850]">{personasCount}</div>
        <p className="mt-2 text-sm text-[#6B4C30]">personalities configured</p>
      </CardContent>
    </Card>
  )
}

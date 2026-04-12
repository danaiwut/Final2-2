"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface ResumePrintTriggerProps {
  autoPrint?: boolean
}

export function ResumePrintTrigger({ autoPrint = false }: ResumePrintTriggerProps) {
  useEffect(() => {
    if (!autoPrint) return

    const timer = window.setTimeout(() => {
      window.print()
    }, 250)

    return () => window.clearTimeout(timer)
  }, [autoPrint])

  return (
    <div className="print:hidden flex justify-center pb-6">
      <Button onClick={() => window.print()} className="bg-[#A07850] hover:bg-[#7A5C38]">
        <Printer className="mr-2 h-4 w-4" />
        Print / Save PDF
      </Button>
    </div>
  )
}

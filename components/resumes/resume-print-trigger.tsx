"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Printer, Download, Info } from "lucide-react"

interface ResumePrintTriggerProps {
  autoPrint?: boolean
}

export function ResumePrintTrigger({ autoPrint = false }: ResumePrintTriggerProps) {
  useEffect(() => {
    if (!autoPrint) return

    const timer = window.setTimeout(() => {
      window.print()
    }, 600)

    return () => window.clearTimeout(timer)
  }, [autoPrint])

  return (
    <div className="print:hidden mb-6">
      {/* Action buttons */}
      <div className="flex justify-center gap-3 mb-3">
        <Button
          onClick={() => window.print()}
          className="bg-[#A07850] hover:bg-[#7A5C38] gap-2 shadow-md"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="border-[#A07850] text-[#A07850] hover:bg-[#F5EDE2] gap-2"
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>

      {/* Color tip */}
      <div className="flex items-start gap-2 mx-auto max-w-[794px] rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
        <Info className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
        <span>
          <strong>เพื่อให้ PDF มีสี:</strong> ในหน้าต่าง Print ให้เลือก{" "}
          <strong>More settings</strong> แล้วติ๊ก ✓{" "}
          <strong>Background graphics</strong> (Chrome/Edge) หรือ{" "}
          <strong>Print backgrounds</strong> (Firefox)
        </span>
      </div>
    </div>
  )
}

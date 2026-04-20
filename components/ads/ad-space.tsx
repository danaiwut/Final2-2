"use client"

import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface AdSpaceProps {
  placement: "sidebar" | "banner" | "feed" | "header" | "footer" | "sidebar_left" | "sidebar_right"
  targetPage?: string
  className?: string
}

export function AdSpace({ placement, targetPage: explicitTargetPage, className }: AdSpaceProps) {
  const [ad, setAd] = useState<any>(null)
  const supabase = createClient()
  const pathname = usePathname()

  const targetPage = explicitTargetPage || (() => {
    if (!pathname) return "all"
    if (pathname === "/dashboard") return "dashboard"
    if (pathname.includes("/jobs")) return "jobs"
    if (pathname.includes("/resumes")) return "resumes"
    if (pathname.includes("/community")) return "community"
    if (pathname.includes("/personas")) return "personas"
    return "all"
  })()

  useEffect(() => {
    loadAd()
  }, [placement, targetPage])

  const loadAd = async () => {
    const today = new Date().toISOString().split("T")[0]

    let query = supabase
      .from("ads")
      .select("*")
      .eq("placement", placement)
      .eq("is_active", true)
      .lte("start_date", today)
      .gte("end_date", today)
      .order("created_at", { ascending: false })
      
    if (targetPage) {
      query = query.or(`target_page.eq.${targetPage},target_page.eq.all`)
    } else {
      query = query.eq("target_page", "all")
    }

    const { data, error } = await query.limit(1).maybeSingle()

    if (data) {
      setAd(data)
      await supabase.rpc("increment_ad_impressions", { ad_id: data.id })
    }
  }

  const handleClick = async () => {
    if (!ad) return

    await supabase.rpc("increment_ad_clicks", { ad_id: ad.id })

    if (ad.link_url) {
      window.open(ad.link_url, "_blank")
    }
  }

  if (!ad) return null

  const getLayoutClass = () => {
    switch (placement) {
      case "header":
        return "w-full h-16 rounded-none border-x-0 border-t-0"
      case "banner":
        return "w-full max-h-28 rounded-lg overflow-hidden flex flex-col shadow-sm border border-indigo-100/50"
      case "footer":
        return "w-full h-16 rounded-none border-x-0 border-b-0"
      case "sidebar_left":
      case "sidebar_right":
      case "sidebar":
        return "w-full h-fit rounded-lg flex flex-col overflow-hidden"
      case "feed":
        return "w-full rounded-lg"
      default:
        return "w-full rounded-lg"
    }
  }

  const getContentLayout = () => {
    if (placement === "header" || placement === "footer") {
      return (
        <div className="px-4 py-2 flex items-center justify-center gap-4 h-full bg-gradient-to-r from-indigo-50 via-white to-purple-50">
          {ad.image_url && (
            <img
              src={ad.image_url}
              alt={ad.title}
              className="h-10 w-auto object-contain flex-shrink-0"
            />
          )}
          <div className="flex items-center gap-3 min-w-0">
            <h4 className="font-semibold text-sm text-gray-800 truncate">{ad.title}</h4>
            {ad.description && (
              <span className="hidden sm:inline text-xs text-gray-500 truncate">{ad.description}</span>
            )}
          </div>
          <Badge variant="outline" className="text-[10px] flex-shrink-0 opacity-60">
            Ad
          </Badge>
        </div>
      )
    }

    return (
      <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 h-full bg-white relative">
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-1 min-w-0 w-full">
          {ad.image_url && (
            <img
              src={ad.image_url || "/placeholder.svg"}
              alt={ad.title}
              className={
                placement === "banner" 
                  ? "h-16 w-16 sm:h-20 sm:w-20 object-cover rounded flex-shrink-0" 
                  : placement.includes("sidebar")
                  ? "w-full aspect-video object-cover rounded flex-shrink-0"
                  : "h-20 w-20 object-cover rounded flex-shrink-0"
              }
            />
          )}

          <div className="flex-1 min-w-0 w-full text-center sm:text-left mt-2 sm:mt-0">
            <h4 className="font-semibold text-sm truncate">{ad.title}</h4>
            {ad.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{ad.description}</p>}
          </div>
        </div>

        <Badge variant="outline" className="text-[10px] flex-shrink-0 absolute top-2 right-2 sm:relative sm:top-0 sm:right-0 opacity-70">
          Ad
        </Badge>
      </div>
    )
  }

  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-md transition-all overflow-hidden border-[#D4B896]/50 bg-white group",
        getLayoutClass(),
        className
      )}
      onClick={handleClick}
    >
      {getContentLayout()}
    </Card>
  )
}
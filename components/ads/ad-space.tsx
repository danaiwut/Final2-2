"use client"

import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

interface AdSpaceProps {
  placement: "sidebar" | "banner" | "feed" | "header" | "footer"
}

export function AdSpace({ placement }: AdSpaceProps) {
  const [ad, setAd] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    loadAd()
  }, [placement])

  const loadAd = async () => {
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .eq("placement", placement)
      .eq("is_active", true)
      .lte("start_date", today)
      .gte("end_date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

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
        return "w-full h-24 rounded-lg"
      case "footer":
        return "w-full h-16 rounded-none border-x-0 border-b-0"
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
      <div className="p-4 flex items-center justify-between gap-4 h-full">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {ad.image_url && (
            <img
              src={ad.image_url || "/placeholder.svg"}
              alt={ad.title}
              className={placement === "banner" ? "h-16 w-auto object-contain flex-shrink-0" : "h-20 w-20 object-cover rounded flex-shrink-0"}
            />
          )}

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{ad.title}</h4>
            {ad.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ad.description}</p>}
          </div>
        </div>

        <Badge variant="outline" className="text-xs flex-shrink-0">
          Ad
        </Badge>
      </div>
    )
  }

  return (
    <Card
      className={`cursor-pointer hover:shadow-lg transition-shadow ${getLayoutClass()}`}
      onClick={handleClick}
    >
      {getContentLayout()}
    </Card>
  )
}
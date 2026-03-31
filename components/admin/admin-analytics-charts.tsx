"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, Pie, PieChart, Cell, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import type { Analytics, Profile, Persona, Message } from "@/lib/types"

interface AdminAnalyticsChartsProps {
  data: Analytics[]
  users: Profile[]
  personas: Persona[]
  messages: Message[]
}

export function AdminAnalyticsCharts({ data, users, personas, messages }: AdminAnalyticsChartsProps) {
  // User growth data - จัดกลุ่มตามวันที่และนับสะสม
  const userGrowthData = (() => {
    // เรียงลำดับผู้ใช้ตามวันที่สร้าง
    const sortedUsers = [...users].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    // จัดกลุ่มผู้ใช้ตามวันที่
    const usersByDate = sortedUsers.reduce((acc, user) => {
      const date = format(new Date(user.created_at), "yyyy-MM-dd")
      if (!acc[date]) {
        acc[date] = 0
      }
      acc[date]++
      return acc
    }, {} as Record<string, number>)

    // สร้างข้อมูลสะสมและเรียงลำดับวันที่
    let cumulativeCount = 0
    const chartData = Object.keys(usersByDate)
      .sort()
      .map((date) => {
        cumulativeCount += usersByDate[date]
        return {
          date: format(new Date(date), "MMM dd"),
          users: cumulativeCount,
        }
      })

    // เอาแค่ 30 วันล่าสุด
    return chartData.slice(-30)
  })()

  // Persona visibility distribution
  const personaVisibilityData = [
    { name: "Published", value: personas.filter((p) => p.visibility === "published").length },
    { name: "Private", value: personas.filter((p) => p.visibility === "private").length },
  ]

  const PERSONA_COLORS = {
    Published: "hsl(200, 100%, 50%)", 
    Private: "hsl(330, 100%, 70%)", 
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>Total registered users over time</CardDescription>
        </CardHeader>
        <CardContent>
          {userGrowthData.length > 0 ? (
            <ChartContainer
              config={{
                users: { label: "Users", color: "hsl(200, 100%, 50%)" },
              }}
              className="h-[300px]"
            >
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(200, 100%, 50%)"
                  strokeWidth={3}
                  dot={{ fill: "hsl(200, 100%, 50%)", r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Persona Visibility</CardTitle>
          <CardDescription>Distribution of published vs private personas</CardDescription>
        </CardHeader>
        <CardContent>
          {personaVisibilityData.some((d) => d.value > 0) ? (
            <ChartContainer
              config={{
                published: { label: "Published", color: "hsl(200, 100%, 50%)" },
                private: { label: "Private", color: "hsl(330, 100%, 70%)" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={personaVisibilityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {personaVisibilityData.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={PERSONA_COLORS[entry.name as keyof typeof PERSONA_COLORS]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              No personas created yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setTargetPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Lerp animation for lag effect
    const animate = () => {
      setPosition((prev) => ({
        x: prev.x + (targetPosition.x - prev.x) * 0.15,
        y: prev.y + (targetPosition.y - prev.y) * 0.15,
      }))
      requestAnimationFrame(animate)
    }

    const animationFrame = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animationFrame)
    }
  }, [targetPosition])

  return (
    <div
      className="custom-cursor"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
      }}
    />
  )
}

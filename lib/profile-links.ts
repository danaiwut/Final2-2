const SOCIAL_BASE_URLS: Record<string, string> = {
  github: "https://github.com/",
  linkedin: "https://www.linkedin.com/in/",
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/",
  twitter: "https://x.com/",
  website: "",
}

export function resolveProfileLink(value?: string | null, platform?: string) {
  if (!value) return null

  const trimmedValue = value.trim()
  if (!trimmedValue) return null
  if (/^https?:\/\//i.test(trimmedValue)) return trimmedValue

  const normalizedValue = trimmedValue.replace(/^@/, "")
  const baseUrl = SOCIAL_BASE_URLS[platform || ""]

  if (!baseUrl) {
    return normalizedValue.startsWith("www.") ? `https://${normalizedValue}` : `https://${normalizedValue}`
  }

  return `${baseUrl}${normalizedValue}`
}

export function profileLinkLabel(platform: string) {
  const labels: Record<string, string> = {
    github: "GitHub",
    linkedin: "LinkedIn",
    facebook: "Facebook",
    instagram: "Instagram",
    twitter: "X / Twitter",
    website: "Website",
  }

  return labels[platform] || platform
}

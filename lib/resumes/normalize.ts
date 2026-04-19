const COLOR_TO_HEX: Record<string, string> = {
  brown: "#3B2A1A",
  blue: "#3B82F6",
  green: "#10B981",
  purple: "#8B5CF6",
  red: "#DC2626",
  orange: "#F97316",
  monochrome: "#0F172A",
}

const HEX_TO_COLOR: Record<string, string> = {
  "#3b2a1a": "brown",
  "#3b82f6": "blue",
  "#10b981": "green",
  "#8b5cf6": "purple",
  "#dc2626": "red",
  "#f97316": "orange",
  "#0f172a": "monochrome",
}

const DEFAULT_COLOR = "brown"

export function resumeColorToHex(color?: string | null) {
  if (!color) return COLOR_TO_HEX[DEFAULT_COLOR]
  if (color.startsWith("#")) return color

  return COLOR_TO_HEX[color] || COLOR_TO_HEX[DEFAULT_COLOR]
}

export function normalizeResumeColor(color?: string | null) {
  if (!color) return DEFAULT_COLOR
  // Already a named color
  if (!color.startsWith("#")) {
    return COLOR_TO_HEX[color] ? color : DEFAULT_COLOR
  }
  // Hex → named color (or store hex directly if not in map)
  return HEX_TO_COLOR[color.toLowerCase()] ?? color
}

export function normalizeResumePayload<T extends Record<string, any>>(
  resume: T
): Omit<T, "id" | "created_at" | "updated_at" | "user_id"> {
  const {
    id: _id,
    created_at: _createdAt,
    updated_at: _updatedAt,
    user_id: _userId,
    ...resumeData
  } = resume

  return {
    ...resumeData,
    color_scheme: normalizeResumeColor(resumeData.color_scheme),
    experience: Array.isArray(resumeData.experience) ? resumeData.experience : [],
    education: Array.isArray(resumeData.education) ? resumeData.education : [],
    skills: Array.isArray(resumeData.skills) ? resumeData.skills : [],
    projects: Array.isArray(resumeData.projects) ? resumeData.projects : [],
    certifications: Array.isArray(resumeData.certifications) ? resumeData.certifications : [],
    languages: Array.isArray(resumeData.languages) ? resumeData.languages : [],
  }
}

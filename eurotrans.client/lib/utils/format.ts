// Utility functions for formatting data

export function formatDate(dateString: string, locale = "en"): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatWeight(kg: number, locale = "en"): string {
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: "kilogram",
    maximumFractionDigits: 0,
  }).format(kg)
}

export function formatVolume(m3: number, locale = "en"): string {
  return `${m3.toFixed(1)} m³`
}

export function formatDistance(km: number, locale = "en"): string {
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: "kilometer",
    maximumFractionDigits: 0,
  }).format(km)
}

export function getStatusColor(status: string): string {
  const colors = {
    draft: "bg-slate-100 text-slate-600 border border-slate-200",
    unassigned: "bg-amber-50 text-amber-700 border border-amber-200",
    "in-transit": "bg-teal-50 text-teal-700 border border-teal-200",
    delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  }
  return colors[status as keyof typeof colors] || colors.draft
}

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

export function formatVolume(m3: number): string {
  return `${m3.toFixed(1)} m3`
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
    unassigned:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-400/30",
    assigned:
      "bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-400/30",
    "in-transit":
      "bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-400/30",
    delivered:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-400/30",
    cancelled:
      "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-400/30",
  }

  return colors[status as keyof typeof colors] || colors.unassigned
}

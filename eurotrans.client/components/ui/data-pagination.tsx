"use client"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/providers/i18n-provider"

type DataPaginationProps = {
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function DataPagination({ page, pageSize, totalCount, onPageChange, disabled = false }: DataPaginationProps) {
  const { t } = useI18n()
  const totalPages = Math.max(1, Math.ceil(totalCount / Math.max(pageSize, 1)))
  const currentPage = Math.min(Math.max(page, 1), totalPages)
  const from = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const to = totalCount === 0 ? 0 : Math.min(currentPage * pageSize, totalCount)
  const canGoPrevious = currentPage > 1 && !disabled
  const canGoNext = currentPage < totalPages && !disabled

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {t("common.pagination.showing")
          .replace("{from}", String(from))
          .replace("{to}", String(to))
          .replace("{total}", String(totalCount))}
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canGoPrevious}
          onClick={() => onPageChange(currentPage - 1)}
        >
          {t("common.previous")}
        </Button>

        <span className="min-w-[120px] text-center text-sm text-muted-foreground">
          {t("common.pagination.page")
            .replace("{page}", String(currentPage))
            .replace("{totalPages}", String(totalPages))}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canGoNext}
          onClick={() => onPageChange(currentPage + 1)}
        >
          {t("common.next")}
        </Button>
      </div>
    </div>
  )
}

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

export interface DataColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Provide to make the column sortable. */
  sortValue?: (row: T) => string | number;
  align?: "left" | "right" | "center";
  className?: string;
  headerClassName?: string;
  /** Hide columns below the given breakpoint to keep mobile readable. */
  hideBelow?: "sm" | "md" | "lg" | "xl";
}

export interface DataTableProps<T> {
  columns: DataColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  initialSortKey?: string;
  initialSortDirection?: "asc" | "desc";
  caption?: string;
}

const HIDE_CLASS: Record<NonNullable<DataColumn<unknown>["hideBelow"]>, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
};

const ALIGN_CLASS = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

/**
 * DataTable — the workstation's single list surface: sortable, paginated,
 * horizontally scrollable on tablets and phones, with quiet empty/loading states.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  error,
  emptyTitle = "Nothing to show yet",
  emptyDescription = "Records will appear here once data is available.",
  onRowClick,
  pageSize = 8,
  initialSortKey,
  initialSortDirection = "desc",
  caption,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | undefined>(initialSortKey);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSortDirection,
  );
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const column = columns.find((item) => item.key === sortKey);
    if (!column?.sortValue) return rows;
    const factor = sortDirection === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const left = column.sortValue!(a);
      const right = column.sortValue!(b);
      if (typeof left === "number" && typeof right === "number") {
        return (left - right) * factor;
      }
      return String(left).localeCompare(String(right)) * factor;
    });
  }, [columns, rows, sortDirection, sortKey]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const paged = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize);

  if (isLoading) {
    return (
      <div className="flex min-h-[180px] items-center justify-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading records…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50/70 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex min-h-[180px] flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/80 bg-white/40 p-6 text-center">
        <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
        <p className="max-w-sm text-xs text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Table>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <TableHeader>
          <TableRow className="border-border/70 hover:bg-transparent">
            {columns.map((column) => {
              const active = sortKey === column.key;
              return (
                <TableHead
                  key={column.key}
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
                    ALIGN_CLASS[column.align ?? "left"],
                    column.hideBelow && HIDE_CLASS[column.hideBelow],
                    column.headerClassName,
                  )}
                >
                  {column.sortValue ? (
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center gap-1 rounded transition-colors hover:text-foreground",
                        active && "text-foreground",
                      )}
                      onClick={() => {
                        if (active) {
                          setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
                        } else {
                          setSortKey(column.key);
                          setSortDirection("asc");
                        }
                      }}
                    >
                      {column.header}
                      {active ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="size-3" />
                        ) : (
                          <ArrowDown className="size-3" />
                        )
                      ) : null}
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.map((row, index) => (
            <motion.tr
              key={rowKey(row)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: Math.min(index * 0.02, 0.16) }}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                "border-border/60 transition-colors",
                onRowClick && "cursor-pointer hover:bg-white/70",
              )}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn(
                    "whitespace-normal py-2.5 align-middle text-sm",
                    ALIGN_CLASS[column.align ?? "left"],
                    column.hideBelow && HIDE_CLASS[column.hideBelow],
                    column.className,
                  )}
                >
                  {column.render(row)}
                </TableCell>
              ))}
            </motion.tr>
          ))}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="tabular">
          Showing {safePage * pageSize + 1}–
          {Math.min(sorted.length, safePage * pageSize + paged.length)} of{" "}
          {sorted.length}
        </span>
        {pageCount > 1 ? (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="cursor-pointer"
              disabled={safePage === 0}
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="tabular px-1">
              {safePage + 1} / {pageCount}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="cursor-pointer"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

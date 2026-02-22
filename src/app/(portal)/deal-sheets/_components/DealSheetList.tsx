"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileSpreadsheet,
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Download,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import { formatDate } from "@/lib/utils/format-date";
import { staggerContainer, staggerItem } from "@/lib/motion";

const STATUS_VARIANT_MAP: Record<string, "default" | "outline" | "accent"> = {
  draft: "default",
  sent: "accent",
  accepted: "accent",
  declined: "outline",
};

type DealSheet = {
  id: string;
  title: string | null;
  status: string;
  options: unknown[];
  created_at: string;
  customers?: { id: string; first_name: string; last_name: string } | null;
};

export function DealSheetList() {
  const router = useRouter();
  const [sheets, setSheets] = useState<DealSheet[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 25;

  const fetchSheets = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const res = await fetch(`/api/deal-sheets?${params}`);
    if (res.ok) {
      const data = await res.json();
      setSheets(data.deal_sheets);
      setTotal(data.total);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchSheets();
  }, [fetchSheets]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this deal sheet? This cannot be undone.")) return;
    await fetch(`/api/deal-sheets/${id}`, { method: "DELETE" });
    fetchSheets();
  };

  const handleDownloadPdf = async (id: string) => {
    const res = await fetch(`/api/deal-sheets/${id}/pdf`, { method: "POST" });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `deal-sheet-${id.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const filtered = search
    ? sheets.filter((s) => {
        const q = search.toLowerCase();
        const title = (s.title || "").toLowerCase();
        const name = s.customers
          ? `${s.customers.first_name} ${s.customers.last_name}`.toLowerCase()
          : "";
        return title.includes(q) || name.includes(q);
      })
    : sheets;

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <PageHeader title="Deal Sheets" description="Create and manage vehicle deal comparisons">
        <Button onClick={() => router.push("/deal-sheets/new")}>
          <Plus size={16} strokeWidth={ICON_STROKE_WIDTH} />
          New Deal Sheet
        </Button>
      </PageHeader>

      <div className="relative max-w-sm">
        <Search
          size={16}
          strokeWidth={ICON_STROKE_WIDTH}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search by title or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {loading && sheets.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="No deal sheets yet"
          description="Create a deal sheet to compare vehicle options for your customers."
          actionLabel="New Deal Sheet"
          onAction={() => router.push("/deal-sheets/new")}
        />
      ) : (
        <>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="overflow-hidden rounded-lg border border-border"
          >
            <table className="w-full text-[0.8125rem]">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Title</th>
                  <th className="px-4 py-2.5 font-medium hidden sm:table-cell">Customer</th>
                  <th className="px-4 py-2.5 font-medium hidden md:table-cell">Options</th>
                  <th className="px-4 py-2.5 font-medium hidden md:table-cell">Status</th>
                  <th className="px-4 py-2.5 font-medium hidden md:table-cell">Created</th>
                  <th className="px-4 py-2.5 font-medium w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <motion.tr
                    key={s.id}
                    variants={staggerItem}
                    className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => router.push(`/deal-sheets/${s.id}`)}
                  >
                    <td className="px-4 py-3 font-medium">
                      {s.title || "Untitled"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {s.customers
                        ? `${s.customers.first_name} ${s.customers.last_name}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {Array.isArray(s.options) ? s.options.length : 0}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <StatusBadge
                        status={s.status}
                        variant={STATUS_VARIANT_MAP[s.status]}
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {formatDate(s.created_at)}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownloadPdf(s.id)}>
                            <Download size={14} className="mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(s.id)}
                          >
                            <Trash2 size={14} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-[0.8125rem] text-muted-foreground">
              <span>
                {total} deal sheet{total !== 1 ? "s" : ""}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

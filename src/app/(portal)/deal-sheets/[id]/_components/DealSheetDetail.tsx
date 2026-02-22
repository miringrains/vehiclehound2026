"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Pencil,
  Trash2,
  Car,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import { formatDate } from "@/lib/utils/format-date";
import {
  DealOption,
  calculateFinance,
  calculateLease,
  FinanceResult,
  LeaseResult,
} from "@/lib/deal-calc";
import { staggerContainer, staggerItem } from "@/lib/motion";

const DEAL_STATUSES = ["draft", "sent", "accepted", "expired"];

type DealSheet = {
  id: string;
  title?: string | null;
  status: string;
  options: DealOption[];
  customer_id?: string | null;
  created_at: string;
  customers?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string | null;
    phone?: string | null;
  } | null;
};

function fmtMoney(v: number) {
  return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtMoneyShort(v: number) {
  return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function OptionView({ opt }: { opt: DealOption }) {
  const result = useMemo(() => {
    return opt.type === "finance" ? calculateFinance(opt) : calculateLease(opt);
  }, [opt]);
  const monthly = result.monthly_payment;
  const snap = opt.vehicle_snapshot;

  return (
    <Card className="min-w-[260px] flex-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-[0.8125rem]">{opt.label}</CardTitle>
        <p className="text-[0.6875rem] text-muted-foreground capitalize">
          {opt.type} · {opt.type === "finance" ? `${opt.term_months}mo` : `${opt.lease_term}mo`}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {snap && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <Car size={14} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-[0.8125rem] font-medium">
                {snap.year} {snap.make} {snap.model}
              </p>
              <p className="text-[0.6875rem] text-muted-foreground">
                {snap.trim} {snap.stock_number && `· #${snap.stock_number}`}
              </p>
            </div>
          </div>
        )}

        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-center">
          <p className="text-heading-2 text-primary">{fmtMoney(monthly)}</p>
          <p className="text-[0.6875rem] text-muted-foreground">per month</p>
        </div>

        <div className="space-y-1.5 text-[0.8125rem]">
          <DetailRow label="Selling Price" value={fmtMoneyShort(opt.selling_price)} />
          {opt.down_payment > 0 && <DetailRow label="Down Payment" value={fmtMoneyShort(opt.down_payment)} />}
          {opt.trade_value > 0 && <DetailRow label="Trade Allowance" value={fmtMoneyShort(Math.max(0, opt.trade_value - opt.trade_payoff))} />}
          {opt.rebates > 0 && <DetailRow label="Rebates" value={fmtMoneyShort(opt.rebates)} />}

          {opt.type === "finance" ? (
            <>
              <DetailRow label="APR" value={`${opt.apr}%`} />
              <DetailRow label="Amount Financed" value={fmtMoneyShort((result as FinanceResult).amount_financed)} />
              <DetailRow label="Total Cost" value={fmtMoneyShort((result as FinanceResult).total_cost)} />
            </>
          ) : (
            <>
              <DetailRow label="Mileage Allowance" value={`${opt.annual_mileage.toLocaleString()}/yr`} />
              <DetailRow label="Residual" value={`${opt.residual_pct}%`} />
              <DetailRow label="Due at Signing" value={fmtMoneyShort((result as LeaseResult).due_at_signing)} />
              <DetailRow label="Total Lease Cost" value={fmtMoneyShort((result as LeaseResult).total_lease_cost)} />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export function DealSheetDetail({ dealSheetId }: { dealSheetId: string }) {
  const router = useRouter();
  const [sheet, setSheet] = useState<DealSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchSheet = useCallback(async () => {
    const res = await fetch(`/api/deal-sheets/${dealSheetId}`);
    if (!res.ok) {
      router.push("/deal-sheets/new");
      return;
    }
    const data = await res.json();
    setSheet(data.deal_sheet);
    setLoading(false);
  }, [dealSheetId, router]);

  useEffect(() => {
    fetchSheet();
  }, [fetchSheet]);

  const handleStatusChange = async (status: string) => {
    await fetch(`/api/deal-sheets/${dealSheetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchSheet();
  };

  const handleDelete = async () => {
    if (!confirm("Delete this deal sheet? This cannot be undone.")) return;
    await fetch(`/api/deal-sheets/${dealSheetId}`, { method: "DELETE" });
    router.push("/customers");
  };

  const handleDownload = async () => {
    setDownloading(true);
    const res = await fetch(`/api/deal-sheets/${dealSheetId}/pdf`, { method: "POST" });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `deal-sheet-${dealSheetId.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setDownloading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  if (!sheet) return null;

  const customer = sheet.customers;
  const options = Array.isArray(sheet.options) ? sheet.options : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={16} strokeWidth={ICON_STROKE_WIDTH} />
        </Button>
        <div className="flex-1">
          <PageHeader title={sheet.title || "Deal Sheet"}>
            <div className="flex items-center gap-2">
              <Select value={sheet.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEAL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleDownload} disabled={downloading}>
                <Download size={14} strokeWidth={ICON_STROKE_WIDTH} />
                {downloading ? "..." : "PDF"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const params = new URLSearchParams();
                  if (sheet.customer_id) params.set("customer", sheet.customer_id);
                  router.push(`/deal-sheets/new?${params}`);
                }}
              >
                <Pencil size={14} strokeWidth={ICON_STROKE_WIDTH} />
                Edit
              </Button>
              <Button variant="outline" className="text-destructive" onClick={handleDelete}>
                <Trash2 size={14} strokeWidth={ICON_STROKE_WIDTH} />
              </Button>
            </div>
          </PageHeader>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-[0.8125rem] text-muted-foreground">
        <StatusBadge status={sheet.status} />
        {customer && (
          <button
            onClick={() => router.push(`/customers/${customer.id}`)}
            className="hover:text-foreground transition-colors"
          >
            {customer.first_name} {customer.last_name}
          </button>
        )}
        <span>·</span>
        <span>{formatDate(sheet.created_at)}</span>
        <span>·</span>
        <span>{options.length} option{options.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Options */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex gap-4 overflow-x-auto pb-2"
      >
        {options.map((opt, i) => (
          <motion.div key={opt.id || i} variants={staggerItem} className="min-w-[260px] flex-1">
            <OptionView opt={opt} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

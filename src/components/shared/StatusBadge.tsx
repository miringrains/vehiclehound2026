import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "outline" | "accent";

const statusVariantMap: Record<string, BadgeVariant> = {
  Available: "default",
  Pending: "outline",
  "In Transit": "outline",
  Sold: "outline",
  new: "default",
  reviewed: "outline",
  approved: "accent",
  denied: "outline",
};

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "bg-foreground/90 text-background border-transparent hover:bg-foreground/80",
  outline:
    "bg-transparent text-muted-foreground border-border hover:bg-muted/60",
  accent:
    "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15",
};

type StatusBadgeProps = {
  status: string;
  variant?: BadgeVariant;
  className?: string;
};

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const resolved = variant ?? statusVariantMap[status] ?? "outline";

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[11px] font-medium tracking-wide uppercase",
        variantClasses[resolved],
        className
      )}
    >
      {status}
    </Badge>
  );
}

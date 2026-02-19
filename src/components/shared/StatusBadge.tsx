import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusStyle = "primary" | "success" | "warning" | "destructive" | "muted";

const statusStyleMap: Record<string, StatusStyle> = {
  "For Sale": "success",
  active: "success",
  trialing: "success",
  approved: "success",
  new: "primary",
  "Coming Soon": "warning",
  past_due: "warning",
  reviewed: "warning",
  Sold: "muted",
  canceled: "muted",
  "Dream Build": "muted",
  denied: "destructive",
};

const styleClasses: Record<StatusStyle, string> = {
  primary: "bg-primary/15 text-primary border-primary/20 hover:bg-primary/20",
  success: "bg-success/15 text-success border-success/20 hover:bg-success/20",
  warning: "bg-warning/15 text-warning border-warning/20 hover:bg-warning/20",
  destructive:
    "bg-destructive/15 text-destructive border-destructive/20 hover:bg-destructive/20",
  muted:
    "bg-muted text-muted-foreground border-border hover:bg-muted/80",
};

type StatusBadgeProps = {
  status: string;
  style?: StatusStyle;
  className?: string;
};

export function StatusBadge({ status, style, className }: StatusBadgeProps) {
  const resolved = style ?? statusStyleMap[status] ?? "muted";

  return (
    <Badge
      variant="outline"
      className={cn(styleClasses[resolved], className)}
    >
      {status}
    </Badge>
  );
}

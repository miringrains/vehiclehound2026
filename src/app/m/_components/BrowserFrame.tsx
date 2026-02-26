"use client";

type BrowserFrameProps = {
  url?: string;
  children: React.ReactNode;
  className?: string;
};

export function BrowserFrame({ url = "portal.vehiclehound.com", children, className = "" }: BrowserFrameProps) {
  return (
    <div className={`overflow-hidden rounded-xl border border-border/60 bg-card/50 shadow-lg ${className}`}>
      <div className="flex h-9 items-center gap-2 border-b border-border/40 bg-secondary/50 px-4">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
        </div>
        <div className="ml-3 flex-1 rounded-md bg-background/60 px-3 py-0.5">
          <span className="text-[11px] text-muted-foreground">{url}</span>
        </div>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

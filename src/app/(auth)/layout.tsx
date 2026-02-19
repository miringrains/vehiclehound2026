import { Car } from "lucide-react";
import { ICON_STROKE_WIDTH } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Brand strip */}
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Car
            size={22}
            strokeWidth={ICON_STROKE_WIDTH}
            className="text-primary-foreground"
          />
        </div>
        <span className="text-heading-2 text-foreground">VehicleHound</span>
      </div>

      {/* Auth card */}
      <div className="w-full max-w-[420px]">
        <div className="rounded-xl border border-border bg-card p-8">
          {children}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-caption text-muted-foreground">
        &copy; {new Date().getFullYear()} VehicleHound. All rights reserved.
      </p>
    </div>
  );
}

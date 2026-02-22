import Link from "next/link";
import { FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { ICON_STROKE_WIDTH } from "@/lib/constants";

export default function PortalNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileX size={28} strokeWidth={ICON_STROKE_WIDTH} className="text-muted-foreground" />
      </div>
      <h2 className="text-heading-2 mb-2">Page not found</h2>
      <p className="text-body-sm text-muted-foreground max-w-md mb-6">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild>
        <Link href={routes.dashboard}>Go to Dashboard</Link>
      </Button>
    </div>
  );
}

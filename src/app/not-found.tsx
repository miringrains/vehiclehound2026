import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center px-4">
      <p className="text-display-lg text-violet-500 mb-4">404</p>
      <h1 className="text-heading-2 mb-2">Page not found</h1>
      <p className="text-body-sm text-muted-foreground max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild size="lg">
        <Link href={routes.dashboard}>Back to Dashboard</Link>
      </Button>
    </div>
  );
}

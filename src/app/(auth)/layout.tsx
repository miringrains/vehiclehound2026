import { Logo } from "@/components/shared/Logo";
import { AuroraBackground } from "./_components/AuroraBackground";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      <AuroraBackground />

      {/* Logo */}
      <div className="relative z-10 mb-10">
        <Logo height={38} />
      </div>

      {/* Auth card — glass effect over aurora */}
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="rounded-2xl border border-white/[0.08] bg-background/70 p-8 shadow-lg backdrop-blur-2xl">
          {children}
        </div>
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-8 text-caption text-muted-foreground/60">
        &copy; {new Date().getFullYear()} VehicleHound. All rights reserved.
      </p>
    </div>
  );
}

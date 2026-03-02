import { Logo } from "@/components/shared/Logo";
import { AuroraBackdrop } from "@/components/shared/AuroraBackdrop";

export default function StartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <AuroraBackdrop />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="mb-8 flex justify-center">
          <Logo height={34} dark />
        </div>
        {children}
      </div>

      <p className="relative z-10 mt-8 text-caption text-white/40">
        &copy; {new Date().getFullYear()} VehicleHound. All rights reserved.
      </p>
    </div>
  );
}

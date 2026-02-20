import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  height?: number;
};

export function Logo({ className, height = 32 }: LogoProps) {
  const aspectRatio = 545.67 / 166.74;
  const width = Math.round(height * aspectRatio);

  return (
    <Image
      src="/logo.svg"
      alt="VehicleHound"
      width={width}
      height={height}
      className={cn("h-auto", className)}
      priority
    />
  );
}

import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  height?: number;
  /** Render dark logo (for use on light backgrounds). Default is white. */
  dark?: boolean;
};

export function Logo({ className, height = 32, dark = false }: LogoProps) {
  const aspectRatio = 545.67 / 166.74;
  const width = Math.round(height * aspectRatio);

  return (
    <Image
      src="/logo.svg"
      alt="VehicleHound"
      width={width}
      height={height}
      className={cn("h-auto", dark && "brightness-0", className)}
      priority
    />
  );
}

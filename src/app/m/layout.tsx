import type { Metadata } from "next";
import { Nav } from "./_components/Nav";
import { Footer } from "./_components/Footer";

export const metadata: Metadata = {
  title: {
    default: "VehicleHound — Modern Dealership Inventory Platform",
    template: "%s | VehicleHound",
  },
  description:
    "List inventory, collect credit applications, and embed widgets on any website. The modern platform dealerships use to manage and sell vehicles online.",
  openGraph: {
    title: "VehicleHound — Modern Dealership Inventory Platform",
    description:
      "List inventory, collect credit applications, and embed widgets on any website.",
    siteName: "VehicleHound",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}

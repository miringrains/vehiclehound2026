import type { Metadata } from "next";
import { SignupForm } from "./_components/SignupForm";
import type { PlanSlug } from "@/config/plans";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your VehicleHound dealership account.",
};

type Props = {
  searchParams: Promise<{ plan?: string; interval?: string }>;
};

export default async function SignupPage({ searchParams }: Props) {
  const sp = await searchParams;
  const plan = (sp.plan as PlanSlug) || undefined;
  const interval = (sp.interval as "monthly" | "yearly") || undefined;

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-heading-2">Create your account</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Start your 14-day free trial. You&apos;ll add a payment method next.
        </p>
      </div>
      <SignupForm plan={plan} interval={interval} />
    </div>
  );
}

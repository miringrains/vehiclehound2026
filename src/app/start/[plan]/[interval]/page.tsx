import { redirect } from "next/navigation";
import { PLAN_ORDER } from "@/config/plans";
import type { PlanSlug } from "@/config/plans";

type Props = {
  params: Promise<{ plan: string; interval: string }>;
};

export default async function StartWithPlanPage({ params }: Props) {
  const { plan, interval } = await params;

  const validPlan = PLAN_ORDER.includes(plan as PlanSlug);
  const validInterval = interval === "monthly" || interval === "yearly";

  if (!validPlan || !validInterval) {
    redirect("/start");
  }

  redirect(`/signup?plan=${plan}&interval=${interval}`);
}

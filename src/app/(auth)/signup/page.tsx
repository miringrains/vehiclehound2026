import type { Metadata } from "next";
import { SignupForm } from "./_components/SignupForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your VehicleHound dealership account.",
};

export default function SignupPage() {
  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-heading-2">Create your account</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Start your 14-day free trial. No credit card required.
        </p>
      </div>
      <SignupForm />
    </div>
  );
}

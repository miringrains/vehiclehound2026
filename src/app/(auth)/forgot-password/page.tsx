import type { Metadata } from "next";
import { ForgotPasswordForm } from "./_components/ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-heading-2">Reset your password</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>
      <ForgotPasswordForm />
    </>
  );
}

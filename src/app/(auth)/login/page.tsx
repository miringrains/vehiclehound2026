import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./_components/LoginForm";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-heading-2">Welcome back</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Sign in to your dealership dashboard.
        </p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  );
}

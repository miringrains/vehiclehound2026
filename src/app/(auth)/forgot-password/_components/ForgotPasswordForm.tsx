"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validators/auth";
import { createClient } from "@/lib/supabase/client";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { CheckCircle } from "lucide-react";
import { ICON_STROKE_WIDTH } from "@/lib/constants";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center py-4">
        <CheckCircle
          size={32}
          strokeWidth={ICON_STROKE_WIDTH}
          className="text-success mb-3"
        />
        <p className="text-body text-foreground">Check your email</p>
        <p className="text-body-sm text-muted-foreground mt-1">
          We&apos;ve sent you a password reset link.
        </p>
        <Link
          href={routes.login}
          className="mt-6 text-body-sm text-primary hover:underline"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@dealership.com"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-caption text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <LoadingSpinner size={18} className="text-primary-foreground" />
        ) : (
          "Send reset link"
        )}
      </Button>

      <p className="text-center text-body-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href={routes.login} className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

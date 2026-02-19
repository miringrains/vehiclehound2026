"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { acceptInviteSchema, type AcceptInviteInput } from "@/lib/validators/auth";
import { createClient } from "@/lib/supabase/client";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function AcceptInvitationPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInviteInput>({
    resolver: zodResolver(acceptInviteSchema),
  });

  async function onSubmit(data: AcceptInviteInput) {
    setError(null);

    try {
      const res = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...data }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Failed to accept invitation.");
        return;
      }

      router.push(routes.login);
    } catch {
      setError("An unexpected error occurred.");
    }
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-heading-2">Join your team</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Create your account to join the dealership.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            placeholder="John Smith"
            autoComplete="name"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-caption text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-caption text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-caption text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <LoadingSpinner size={18} className="text-primary-foreground" />
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </>
  );
}

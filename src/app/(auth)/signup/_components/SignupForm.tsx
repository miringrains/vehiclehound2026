"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/validators/auth";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupInput) {
    setError(null);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      setError(result.error || "Something went wrong.");
      return;
    }

    router.push(routes.login + "?registered=true");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="dealershipName">Dealership Name</Label>
        <Input
          id="dealershipName"
          placeholder="Acme Motors"
          {...register("dealershipName")}
        />
        {errors.dealershipName && (
          <p className="text-caption text-destructive">
            {errors.dealershipName.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Your Name</Label>
        <Input id="name" placeholder="John Smith" {...register("name")} />
        {errors.name && (
          <p className="text-caption text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

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
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(555) 123-4567"
          {...register("phone")}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <LoadingSpinner size={18} className="text-primary-foreground" />
        ) : (
          "Create Account"
        )}
      </Button>

      <p className="text-center text-body-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={routes.login} className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

"use client";

import { SignUpFormData, signUpSchema } from "@/lib/validations/auth";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const SignUpForm = () => {
  const router = useRouter();
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const submitting = form.formState.isSubmitting;
  const handleSubmit = async (data: SignUpFormData) => {
    console.log(data);
    await authClient.signUp.email(data, {
      onSuccess: () => {
        toast.success("Create a Account Success!");
        router.push("/dashboard");
      },
      onError: (error) => {
        toast.error(
          error.error.message || "An error occurred while signing in.",
        );
      },
    });
  };
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-foreground">Create a Account</h1>
      </div>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Full Name</FieldLabel>
              <Input
                {...field}
                type="text"
                autoComplete="name"
                placeholder="Enter your name"
                autoFocus
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                {...field}
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input
                {...field}
                type="password"
                autoComplete="password"
                placeholder="Enter your password"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Confirm Password</FieldLabel>
              <Input
                {...field}
                type="password"
                autoComplete="confirmPassword"
                placeholder="Enter your confirmPassword"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button type="submit" disabled={submitting}>
          {submitting ? "Signing up..." : "Sign Up"}
        </Button>
      </form>

      <div className="mt-4 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default SignUpForm;

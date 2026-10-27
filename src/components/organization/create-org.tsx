"use client";

import React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OnboardingFormData, onboardingSchema } from "@/lib/validations/org";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const NewOrganization = ({ defaultName }: { defaultName: string }) => {
  const router = useRouter();
  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: defaultName,
      organizationName: "",
    },
  });
  const submitting = form.formState.isSubmitting;
  const handleSubmit = async (data: OnboardingFormData) => {
    console.log(data);
    if (data.name !== defaultName) {
      const { error: nameError } = await authClient.updateUser({
        name: data.name,
      });
      if (nameError) {
        toast.error("We cound not update your name");
        return;
      }
    }

    const slug = await availableSlug(slugify(data.organizationName));
    const { error: createError } = await authClient.organization.create({
      name: data.organizationName,
      slug: slug,
      keepCurrentActiveOrganization: false,
    });
    if (createError) {
      toast.error("We cound not create the organization. try again");
      return;
    }
    router.push("/dashboard");
  };
  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="flex flex-col gap-4"
    >
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Name</FieldLabel>
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
        name="organizationName"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Organization Name</FieldLabel>
            <Input
              {...field}
              type="text"
              autoComplete="organizationName"
              placeholder="Enter your Organization Name"
              autoFocus
            />
            {fieldState.error ? (
              <FieldError errors={[fieldState.error]} />
            ) : (
              <p className="text-muted-foreground text-xs">
                {field.value
                  ? `your workspace will live at /${slugify(field.value)}`
                  : "Your team, department, or company. You can rename it later."}
              </p>
            )}
          </Field>
        )}
      />

      <Button type="submit" disabled={submitting}>
        {submitting ? "Creating..." : "Create Organization"}
      </Button>
    </form>
  );
};

async function availableSlug(base: string): Promise<string> {
  const candidate = base || "workspace";
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? candidate : `${candidate}-${attempt + 1}`;
    const { data } = await authClient.organization.checkSlug({ slug });
    if (data?.status) return slug;
  }
  return `${candidate}-${Math.random().toString(36).slice(2, 7)}`;
}

import z from "zod";

export const onboardingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "enter your name")
    .max(80, "That name is to long"),
  organizationName: z
    .string()
    .trim()
    .min(1, "Organization Name required")
    .max(80, "Organization Name too long"),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

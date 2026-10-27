import z from "zod";
import { Session } from "@/lib/auth";

const password = z
  .string()
  .min(8, "Password must be at least 8 characters long");

const email = z
  .email("enter a valid email address")
  .max(200, "That email address is too long");

export const signInSchema = z.object({
  email,
  password,
});

export const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "enter your name")
      .max(80, "That name is to long"),
    email,
    password,
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Those Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;

export type ProtectedContext = {
  session: Session;
  userId: string;
};

export type OrgContext = ProtectedContext & {
  id: string;
  role: string;
  userId: string;
  organizationId: string;
  createdAt: Date;
};

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

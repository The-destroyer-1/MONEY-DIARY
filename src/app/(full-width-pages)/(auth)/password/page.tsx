import SignInForm from "@/components/auth/SignInForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Password | RATL DIARY",
  description: "Enter your password to access RATL DIARY.",
};

export default function PasswordPage() {
  return <SignInForm />;
}

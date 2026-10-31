import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | RATL DIARY",
  description: "Sign in to RATL DIARY.",
};

export default function SignIn() {
  return <SignInForm />;
}

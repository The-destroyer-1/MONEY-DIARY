import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account | RATL DIARY",
  description: "Create a RATL DIARY account.",
};

export default function SignUp() {
  return <SignUpForm />;
}

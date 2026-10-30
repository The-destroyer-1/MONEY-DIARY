import type { Metadata } from "next";
import BankDashboard from "@/components/banking/BankDashboard";

export const metadata: Metadata = {
  title: "RATL DIARY | Your money, your record",
  description: "Track BOA, GAB, and DTB card statements in USD and KES.",
};

export default function Home() {
  return <BankDashboard />;
}

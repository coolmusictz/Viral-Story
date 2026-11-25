import { notFound } from "next/navigation";
import { ComponentShowcase } from "@/components/component-showcase";

export const dynamic = "force-dynamic";

export default function ShowcasePage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <ComponentShowcase />;
}
